import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import {
  loadOrBootstrapAuthStore,
  savePasswordUpdate,
  signSessionToken,
  verifyPasswordHash,
  verifySessionToken,
  type AdminSessionPayload,
} from './server/auth.ts';
import { createContactMessageInFirestore, verifyGoogleAdminIdToken } from './server/firestoreRest.ts';

dotenv.config();

const PORT =
  process.env.NODE_ENV === 'production' ? Number(process.env.PORT) || 3000 : 3000;
const COOKIE_NAME = 'bp_admin_session';
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

interface RateBucket {
  count: number;
  resetAt: number;
}

function createRateLimiter(maxRequests: number, windowMs: number) {
  const buckets = new Map<string, RateBucket>();
  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : req.ip) || 'unknown';
    const now = Date.now();
    const existing = buckets.get(ip);
    if (!existing || existing.resetAt <= now) {
      buckets.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (existing.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a few minutes before trying again.',
      });
    }
    existing.count += 1;
    return next();
  };
}

interface AuthedRequest extends Request {
  adminSession?: AdminSessionPayload;
}

function setSessionCookie(req: Request, res: Response, token: string) {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 12,
  });
}

function clearSessionCookie(req: Request, res: Response) {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    path: '/',
  });
}

function requireAdminSession(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  const session = verifySessionToken(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Admin session required.' });
  }
  req.adminSession = session;
  return next();
}

const loginSchema = z.object({
  username: z.string().trim().min(1).max(60),
  password: z.string().min(1).max(200),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().max(200).optional(),
  newPassword: z
    .string()
    .min(10, 'New password must be at least 10 characters.')
    .max(200),
});

const contactSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required.').max(120),
  email: z.string().trim().email('Please provide a valid email address.').max(160),
  phone: z.string().trim().min(5, 'Phone number is required.').max(40),
  companyName: z.string().trim().max(140).optional().default(''),
  serviceRequired: z.string().trim().min(2, 'Please select a service.').max(120),
  projectBudget: z.string().trim().max(100).optional().default(''),
  message: z.string().trim().min(10, 'Please describe your workflow requirements (min 10 chars).').max(3000),
  website: z.string().max(200).optional().default(''),
  formRenderedAt: z.number().optional(),
});

const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(160),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  base64Data: z.string().min(4).max(8_000_000),
});

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  app.use(cookieParser());
  app.use(express.json({ limit: '9mb' }));

  // Serve uploaded files safely
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d', index: false }));

  const loginLimiter = createRateLimiter(12, 15 * 60 * 1000);
  const contactLimiter = createRateLimiter(5, 15 * 60 * 1000);

  // SEO: robots.txt & sitemap.xml
  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${baseUrl.replace(/\/$/, '')}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const today = new Date().toISOString().split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    res.type('application/xml').send(xml);
  });

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Admin session inspection
  app.get('/api/admin/session', (req, res) => {
    const authStore = loadOrBootstrapAuthStore();
    const token = req.cookies?.[COOKIE_NAME];
    const session = verifySessionToken(token);
    if (!session) {
      return res.json({
        authenticated: false,
        passwordConfigured: Boolean(authStore),
      });
    }
    return res.json({
      authenticated: true,
      username: session.username,
      authMethod: session.authMethod,
      mustChangePassword: authStore ? authStore.mustChangePassword : session.mustChangePassword,
      passwordConfigured: Boolean(authStore),
    });
  });

  // Admin password login
  app.post('/api/admin/login', loginLimiter, (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const authStore = loadOrBootstrapAuthStore();
    if (!authStore) {
      return res.status(503).json({
        error:
          'Server password secret (ADMIN_INITIAL_PASSWORD) is not configured. Configure it in server environment secrets or sign in with the verified Google owner account.',
      });
    }

    const { username, password } = parsed.data;
    if (
      username.toLowerCase() !== authStore.username ||
      !verifyPasswordHash(password, authStore.passwordHash, authStore.salt)
    ) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const token = signSessionToken({
      username: authStore.username,
      authMethod: 'password',
      mustChangePassword: authStore.mustChangePassword,
    });
    setSessionCookie(req, res, token);

    return res.json({
      authenticated: true,
      username: authStore.username,
      authMethod: 'password',
      mustChangePassword: authStore.mustChangePassword,
    });
  });

  // Verified Google owner session bridge
  app.post('/api/admin/google-session', loginLimiter, async (req, res) => {
    const idToken = typeof req.body?.idToken === 'string' ? req.body.idToken : '';
    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID token is required.' });
    }

    try {
      const verified = await verifyGoogleAdminIdToken(idToken);
      if (!verified) {
        return res.status(403).json({ error: 'Access denied. Verified owner Google account required.' });
      }

      const authStore = loadOrBootstrapAuthStore();
      const token = signSessionToken({
        username: 'borhan',
        authMethod: 'google',
        mustChangePassword: authStore ? authStore.mustChangePassword : false,
      });
      setSessionCookie(req, res, token);

      return res.json({
        authenticated: true,
        username: 'borhan',
        authMethod: 'google',
        mustChangePassword: authStore ? authStore.mustChangePassword : false,
        email: verified.email,
      });
    } catch {
      return res.status(500).json({ error: 'Unable to verify Google session.' });
    }
  });

  // Change admin password (mandatory after first login)
  app.post('/api/admin/change-password', requireAdminSession, (req: AuthedRequest, res) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid password format.' });
    }

    const authStore = loadOrBootstrapAuthStore();
    if (authStore && req.adminSession?.authMethod === 'password') {
      const current = parsed.data.currentPassword || '';
      if (!current || !verifyPasswordHash(current, authStore.passwordHash, authStore.salt)) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }
      if (parsed.data.newPassword === current) {
        return res.status(400).json({ error: 'New password must differ from the current password.' });
      }
    }

    const updated = savePasswordUpdate(parsed.data.newPassword);
    const token = signSessionToken({
      username: updated.username,
      authMethod: req.adminSession?.authMethod || 'password',
      mustChangePassword: false,
    });
    setSessionCookie(req, res, token);

    return res.json({
      ok: true,
      mustChangePassword: false,
    });
  });

  // Logout
  app.post('/api/admin/logout', (req, res) => {
    clearSessionCookie(req, res);
    res.json({ ok: true });
  });

  // Protected image / CV upload
  app.post('/api/admin/upload', requireAdminSession, (req: AuthedRequest, res) => {
    const authStore = loadOrBootstrapAuthStore();
    if (authStore?.mustChangePassword) {
      return res.status(403).json({ error: 'Password change required before performing uploads.' });
    }

    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid file upload payload.' });
    }

    const { mimeType, base64Data } = parsed.data;
    const extMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
    };
    const ext = extMap[mimeType];
    if (!ext) {
      return res.status(400).json({ error: 'Unsupported file type.' });
    }

    const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const buffer = Buffer.from(cleanBase64, 'base64');
    if (buffer.length === 0 || buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File must be between 1 byte and 5 MB.' });
    }

    const safeFileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const targetPath = path.join(UPLOADS_DIR, safeFileName);
    fs.writeFileSync(targetPath, buffer);

    return res.json({
      url: `/uploads/${safeFileName}`,
      mimeType,
      sizeBytes: buffer.length,
    });
  });

  // Public contact form submission (rate-limited, spam-checked, validated, persisted to Firestore)
  app.post('/api/contact', contactLimiter, async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Please check all required fields.',
      });
    }

    const { website, formRenderedAt, ...fields } = parsed.data;
    // Honeypot & instant bot submission check
    if (website.trim().length > 0) {
      return res.status(400).json({ error: 'Invalid form submission.' });
    }
    if (typeof formRenderedAt === 'number' && Date.now() - formRenderedAt < 1000) {
      return res.status(400).json({ error: 'Please wait a moment before submitting.' });
    }

    try {
      const id = await createContactMessageInFirestore(fields);
      return res.status(201).json({
        ok: true,
        id,
        submittedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Contact submission error:', err);
      return res.status(500).json({
        error: 'Unable to save your message right now. Please try emailing mdborhprodhan@gmail.com directly.',
      });
    }
  });

  // Vite dev middleware or static dist serving
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir, { maxAge: '7d' }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
