import { ArrowDown, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { SiteContent } from '../types/portfolio';

interface HeroSectionProps {
  siteContent: SiteContent;
}

export function HeroSection({ siteContent }: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);

  const headingLines = siteContent.heroHeading.includes('.')
    ? siteContent.heroHeading
        .split('.')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `${s}.`)
    : [siteContent.heroHeading];

  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="top"
      className="relative z-10 flex min-h-[calc(100vh-73px)] flex-col justify-between px-6 pt-12 pb-8 md:pt-16 md:pb-10"
    >
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
        {/* Left column: Typographic hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7"
        >
          <p className="mb-4 text-sm font-medium tracking-wide text-[#38BDF8]">
            {siteContent.title}
          </p>

          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-[#F8FAFC] sm:text-5xl lg:text-[3.5rem] [text-wrap:balance]">
            {headingLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {siteContent.heroSubheading}
          </p>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
            {siteContent.introText}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => scrollTo('#projects')}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-[#F8FAFC] transition-colors duration-200 hover:bg-[#6D28D9] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
            >
              <span>View My Work</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => scrollTo('#contact')}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-700 bg-[#111827]/90 px-6 py-3 text-sm font-semibold text-[#F8FAFC] transition-colors duration-200 hover:border-[#38BDF8]/60 hover:bg-slate-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
            >
              <span>Let&apos;s Work Together</span>
            </button>
          </div>
        </motion.div>

        {/* Right column: Portrait in clean architectural frame */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5"
        >
          <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
            <div className="aspect-[4/5] w-full overflow-hidden bg-slate-900">
              {!imgError && siteContent.profilePhotoUrl ? (
                <img
                  src={siteContent.profilePhotoUrl}
                  alt={`${siteContent.name} — ${siteContent.title}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-[#111827] p-8 text-center">
                  <span className="font-display text-3xl font-bold text-slate-200">
                    {siteContent.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 3)}
                  </span>
                  <span className="mt-2 text-xs text-slate-400">{siteContent.name}</span>
                </div>
              )}
            </div>
            <div className="border-t border-slate-800 px-5 py-4">
              <p className="font-display text-base font-semibold text-[#F8FAFC]">
                {siteContent.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                <span>{siteContent.experienceSummary}</span>
                <span aria-hidden="true">·</span>
                <span>{siteContent.location}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Full-width anchor strip & scroll indicator */}
      <div className="mx-auto mt-10 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-5 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>AI Automation</span>
          <span aria-hidden="true">·</span>
          <span>n8n Workflows</span>
          <span aria-hidden="true">·</span>
          <span>WhatsApp &amp; Messenger Agents</span>
          <span aria-hidden="true">·</span>
          <span>CRM &amp; SEO Systems</span>
        </div>

        <button
          type="button"
          onClick={() => scrollTo('#about')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 transition-colors hover:text-[#38BDF8] focus-visible:outline-2 focus-visible:outline-[#38BDF8]"
        >
          <span>Scroll to explore</span>
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
