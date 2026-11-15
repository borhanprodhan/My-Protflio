import { Download, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import type { LanguageItem, SiteContent } from '../types/portfolio';

interface AboutSectionProps {
  siteContent: SiteContent;
  languages: LanguageItem[];
}

export function AboutSection({ siteContent, languages }: AboutSectionProps) {
  const [imgError, setImgError] = useState(false);

  const handleDownloadCv = () => {
    if (siteContent.cvUrl && siteContent.cvUrl.trim().length > 0) {
      const a = document.createElement('a');
      a.href = siteContent.cvUrl;
      a.download = 'MD_Borhan_Prodhan_CV.pdf';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Generate clean printable / downloadable HTML resume using grounded personal info
    const visibleLangs = languages
      .filter((l) => l.visible)
      .map((l) => (l.proficiency ? `${l.name} (${l.proficiency})` : l.name))
      .join(' · ');

    const htmlContent = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${siteContent.name} — Curriculum Vitae</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; max-width: 780px; margin: 40px auto; padding: 0 24px; line-height: 1.6; }
  h1 { margin: 0 0 4px; font-size: 28px; }
  .subtitle { color: #475569; font-size: 16px; margin-bottom: 16px; }
  .meta { font-size: 13px; color: #334155; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 10px 0; margin-bottom: 24px; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.06em; color: #334155; margin: 24px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  p, li { font-size: 14px; color: #1e293b; }
</style>
</head>
<body>
  <h1>${siteContent.name}</h1>
  <div class="subtitle">${siteContent.title}</div>
  <div class="meta">
    Location: ${siteContent.location} &nbsp;|&nbsp; Email: ${siteContent.email} &nbsp;|&nbsp; Phone: ${siteContent.phone}
  </div>
  <h2>Professional Summary</h2>
  <p>${siteContent.introText}</p>
  <p>${siteContent.aboutBody.replace(/\n/g, '<br/>')}</p>
  <h2>Experience</h2>
  <ul>
    <li><strong>SEO Expate</strong> — ${siteContent.experienceSummary}</li>
  </ul>
  <h2>Education</h2>
  <ul>
    <li>${siteContent.educationHsc}</li>
    <li>${siteContent.educationSsc}</li>
  </ul>
  <h2>Core Capabilities</h2>
  <p>AI Automation · n8n Workflow Automation · AI Agent Development · WhatsApp Chatbot Automation · Facebook Messenger Chatbot · Telegram Bot Automation · AI Email Automation · Google Sheets Automation · CRM &amp; Lead Management · SEO &amp; Digital Marketing · Customer Support Automation · Business Process Automation</p>
  ${visibleLangs ? `<h2>Languages</h2><p>${visibleLangs}</p>` : ''}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MD_Borhan_Prodhan_CV.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section
      id="about"
      className="relative z-10 border-t border-slate-800/80 bg-[#080B14]/85 px-6 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-[#38BDF8]">01. About</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl [text-wrap:balance]">
              {siteContent.aboutHeading}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleDownloadCv}
            className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-lg border border-slate-700 bg-[#111827] px-5 py-2.5 text-sm font-medium text-[#F8FAFC] transition-colors duration-200 hover:border-[#7C3AED] hover:bg-[#7C3AED]/15 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#38BDF8]"
          >
            <Download className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
            <span>{siteContent.cvLabel || 'Download CV'}</span>
          </button>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Left: Portrait & Direct Details */}
          <div className="lg:col-span-4">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#111827]">
              <div className="aspect-square w-full overflow-hidden bg-slate-900">
                {!imgError && siteContent.profilePhotoUrl ? (
                  <img
                    src={siteContent.profilePhotoUrl}
                    alt={siteContent.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#111827] text-2xl font-bold text-slate-300">
                    BP
                  </div>
                )}
              </div>

              <div className="space-y-3 p-5 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <span>{siteContent.location}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <a
                    href={`mailto:${siteContent.email}`}
                    className="break-all hover:text-[#38BDF8] transition-colors"
                  >
                    {siteContent.email}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <span className="tabular-nums">{siteContent.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bio, Timeline, Education & Languages */}
          <div className="space-y-10 lg:col-span-8">
            <div className="space-y-4 text-base leading-relaxed text-slate-300">
              {siteContent.aboutBody.split('\n\n').map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Experience & Education Timeline */}
            <div className="grid gap-6 border-t border-slate-800 pt-8 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-[#111827] p-6">
                <p className="text-xs font-medium tracking-wide text-[#38BDF8]">
                  Professional Experience
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold text-[#F8FAFC]">
                  SEO Expate
                </h3>
                <p className="mt-1 text-sm text-slate-300">{siteContent.experienceSummary}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  Focused on search optimization, digital marketing workflows, lead management, and practical business process automation.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#111827] p-6">
                <p className="text-xs font-medium tracking-wide text-[#38BDF8]">Education</p>
                <div className="mt-3 space-y-4">
                  <div>
                    <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
                      Higher Secondary Certificate (HSC)
                    </h3>
                    <p className="mt-0.5 font-mono-tech text-xs text-slate-400">
                      {siteContent.educationHsc}
                    </p>
                  </div>
                  <div className="border-t border-slate-800/80 pt-3">
                    <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
                      Secondary School Certificate (SSC)
                    </h3>
                    <p className="mt-0.5 font-mono-tech text-xs text-slate-400">
                      {siteContent.educationSsc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Languages (renders proficiency only if set by admin) */}
            {languages.filter((l) => l.visible).length > 0 && (
              <div className="border-t border-slate-800 pt-8">
                <h3 className="font-display text-base font-semibold text-[#F8FAFC]">Languages</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {languages
                    .filter((l) => l.visible)
                    .map((lang) => (
                      <div
                        key={lang.id}
                        className="rounded-xl border border-slate-800 bg-[#111827] px-5 py-4"
                      >
                        <p className="font-medium text-[#F8FAFC]">{lang.name}</p>
                        {lang.proficiency && (
                          <p className="mt-1 text-xs text-slate-400">{lang.proficiency}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
