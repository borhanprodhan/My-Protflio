import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export interface AdminAuthStore {
  username: string;
  passwordHash: string;
  salt: string;
  mustChangePassword: boolean;
  updatedAt: string;
}

export interface AdminSessionPayload {
  username: string;
  authMethod: 'password' | 'google';
  mustChangePassword: boolean;
  iat: number;
  exp: number;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const AUTH_FILE = path.join(DATA_DIR, 'admin-auth.json');
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

// Ephemeral fallback secret for local dev if SESSION_SECRET env is unset
let runtimeSecret: string | null = null;

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  if (!runtimeSecret) {
    const secretFile = path.join(DATA_DIR, 'session.key');
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(secretFile)) {
      runtimeSecret = fs.readFileSync(secretFile, 'utf8').trim();
    } else {
      runtimeSecret = crypto.randomBytes(32).toString('hex');
      fs.writeFileSync(secretFile, runtimeSecret, { mode: 0o600 });
    }
  }
  return runtimeSecret;
}

export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash: derived, salt };
}

export function verifyPasswordHash(password: string, storedHash: string, salt: string): boolean {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function loadOrBootstrapAuthStore(): AdminAuthStore | null {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(AUTH_FILE)) {
    try {
      const raw = fs.readFileSync(AUTH_FILE, 'utf8');
      return JSON.parse(raw) as AdminAuthStore;
    } catch {
      return null;
    }
  }

  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD?.trim();
  if (!initialPassword) {
    return null;
  }

  const { hash, salt } = hashPassword(initialPassword);
  const store: AdminAuthStore = {
    username: 'borhan',
    passwordHash: hash,
    salt,
    mustChangePassword: true,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(store, null, 2), { mode: 0o600 });
  return store;
}

export function savePasswordUpdate(newPassword: string): AdminAuthStore {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const { hash, salt } = hashPassword(newPassword);
  const store: AdminAuthStore = {
    username: 'borhan',
    passwordHash: hash,
    salt,
    mustChangePassword: false,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(store, null, 2), { mode: 0o600 });
  return store;
}

export function signSessionToken(payload: Omit<AdminSessionPayload, 'iat' | 'exp'>): string {
  const now = Date.now();
  const fullPayload: AdminSessionPayload = {
    ...payload,
    iat: now,
    exp: now + SESSION_TTL_MS,
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSessionSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifySessionToken(token: string | undefined): AdminSessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', getSessionSecret()).update(data).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as AdminSessionPayload;
    if (!decoded.exp || decoded.exp < Date.now()) return null;
    if (decoded.username !== 'borhan') return null;
    return decoded;
  } catch {
    return null;
  }
}
