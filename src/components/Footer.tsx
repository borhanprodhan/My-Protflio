import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SiteContent, SocialLinkItem } from '../types/portfolio';

interface FooterProps {
  siteContent: SiteContent;
  socialLinks: SocialLinkItem[];
}

export function Footer({ siteContent, socialLinks }: FooterProps) {
  const configuredSocials = socialLinks.filter(
    (s) => s.visible && s.url && s.url.trim().length > 0
  );

  return (
    <footer className="relative z-10 border-t border-slate-800 bg-[#080B14] px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="font-display text-lg font-bold tracking-wide text-[#F8FAFC]">
            MD. BORHAN PRODhan
          </p>
          <p className="mt-1.5 text-sm text-slate-300">
            {siteContent.footerSubtitle || 'AI Automation | AI Agents | Digital Solutions'}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            &ldquo;{siteContent.footerTagline || 'Building smarter digital experiences.'}&rdquo;
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
            <a
              href={`mailto:${siteContent.email}`}
              className="hover:text-[#38BDF8] transition-colors"
            >
              {siteContent.email}
            </a>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{siteContent.phone}</span>
            <span aria-hidden="true">·</span>
            <span>{siteContent.location}</span>
          </div>

          {configuredSocials.length > 0 && (
            <div className="flex flex-wrap items-center gap-4">
              {configuredSocials.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-[#38BDF8] transition-colors"
                >
                  <span>{social.label || social.platform}</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>&copy; {new Date().getFullYear()} {siteContent.name}</span>
            <span aria-hidden="true">·</span>
            <Link to="/admin" className="hover:text-slate-300 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
