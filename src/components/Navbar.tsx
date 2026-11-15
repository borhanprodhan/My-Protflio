import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  brandName: string;
  showAbout: boolean;
  showServices: boolean;
  showSkills: boolean;
  showProjects: boolean;
  showContact: boolean;
}

export function Navbar({
  brandName,
  showAbout,
  showServices,
  showSkills,
  showProjects,
  showContact,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    showAbout ? { label: 'About', href: '#about' } : null,
    showServices ? { label: 'Services', href: '#services' } : null,
    showSkills ? { label: 'Skills', href: '#skills' } : null,
    showProjects ? { label: 'Projects', href: '#projects' } : null,
    showContact ? { label: 'Contact', href: '#contact' } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  const scrollToSection = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080B14]/92">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="font-display text-lg font-semibold tracking-tight text-[#F8FAFC] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#38BDF8]"
        >
          {brandName}
        </a>

        {/* Zone 2: 4-5 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(item.href);
              }}
              className="text-sm font-medium text-slate-300 transition-colors duration-200 hover:text-[#F8FAFC] underline-offset-8 hover:underline decoration-[#38BDF8] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#38BDF8]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary CTA + mobile drawer button */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#contact');
            }}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-medium text-[#F8FAFC] transition-colors duration-200 hover:bg-[#6D28D9] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
          >
            Let&apos;s Work Together
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-800 bg-[#111827] text-slate-200 md:hidden focus-visible:outline-2 focus-visible:outline-[#38BDF8]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-slate-800 bg-[#080B14] px-6 py-4 md:hidden"
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className="flex min-h-[44px] items-center text-base font-medium text-slate-200 hover:text-[#38BDF8]"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#contact');
              }}
              className="mt-2 flex min-h-[44px] items-center justify-center rounded-lg bg-[#7C3AED] px-4 py-2.5 text-sm font-medium text-[#F8FAFC]"
            >
              Let&apos;s Work Together
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
