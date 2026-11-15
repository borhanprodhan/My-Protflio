import { CheckCircle2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ServiceItem, SiteContent } from '../types/portfolio';

interface ContactSectionProps {
  siteContent: SiteContent;
  services: ServiceItem[];
  preselectedService: string;
}

export function ContactSection({
  siteContent,
  services,
  preselectedService,
}: ContactSectionProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [serviceRequired, setServiceRequired] = useState(
    preselectedService || services[0]?.title || 'AI Workflow Automation'
  );
  const [projectBudget, setProjectBudget] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot spam field
  const renderedAtRef = useRef<number>(Date.now());

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (preselectedService) {
      setServiceRequired(preselectedService);
    }
  }, [preselectedService]);

  const serviceOptions = Array.from(
    new Set([
      ...services.filter((s) => s.visible).map((s) => s.title),
      'AI Workflow Automation',
      'WhatsApp Automation',
      'AI Chatbot Development',
      'n8n Integration',
      'Email Automation',
      'CRM Automation',
      'SEO & Digital Marketing',
      'Other Workflow Automation',
    ])
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmittedSuccess(false);

    if (fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.includes('@') || email.trim().length < 5) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (phone.trim().length < 5) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }
    if (message.trim().length < 10) {
      setErrorMsg('Please provide a brief description of your workflow needs (minimum 10 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          companyName: companyName.trim(),
          serviceRequired,
          projectBudget: projectBudget.trim(),
          message: message.trim(),
          website,
          formRenderedAt: renderedAtRef.current,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setErrorMsg(data.error || 'Unable to send your message right now.');
        return;
      }

      setSubmittedSuccess(true);
      setFullName('');
      setEmail('');
      setPhone('');
      setCompanyName('');
      setProjectBudget('');
      setMessage('');
    } catch {
      setErrorMsg('Network error while sending your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative z-10 border-t border-slate-800/80 bg-[#080B14]/90 px-6 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left column: Direct contact info */}
          <div className="lg:col-span-5">
            <p className="text-sm font-medium text-[#38BDF8]">05. Contact</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl [text-wrap:balance]">
              Get in Touch
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Share your workflow goals, messaging automation ideas, or SEO requirements. Every inquiry is reviewed directly.
            </p>

            <div className="mt-8 space-y-5 border-t border-slate-800 pt-8 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#38BDF8]" aria-hidden="true" />
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <a
                    href={`mailto:${siteContent.email}`}
                    className="mt-0.5 block font-medium text-[#F8FAFC] hover:text-[#38BDF8]"
                  >
                    {siteContent.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#38BDF8]" aria-hidden="true" />
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="mt-0.5 font-medium tabular-nums text-[#F8FAFC]">
                    {siteContent.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#38BDF8]" aria-hidden="true" />
                <div>
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="mt-0.5 font-medium text-[#F8FAFC]">{siteContent.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Validated contact form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl border border-slate-800 bg-[#111827] p-6 sm:p-8"
            >
              {/* Hidden honeypot */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-fullName"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Full Name *
                  </label>
                  <input
                    id="contact-fullName"
                    type="text"
                    required
                    maxLength={120}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    maxLength={160}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    maxLength={40}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-company"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Company Name (optional)
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    maxLength={140}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Organization or brand"
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-service"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Service Required *
                  </label>
                  <select
                    id="contact-service"
                    value={serviceRequired}
                    onChange={(e) => setServiceRequired(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
                  >
                    {serviceOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-budget"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Project Budget (optional)
                  </label>
                  <input
                    id="contact-budget"
                    type="text"
                    maxLength={100}
                    value={projectBudget}
                    onChange={(e) => setProjectBudget(e.target.value)}
                    placeholder="e.g. $500 – $1,500"
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium text-slate-300"
                >
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  maxLength={3000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the workflow, tools, or automation goals you want to discuss."
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#080B14] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200"
                >
                  {errorMsg}
                </div>
              )}

              {submittedSuccess && (
                <div
                  role="status"
                  className="mt-4 flex items-start gap-2.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    Thank you. Your inquiry has been securely saved and MD. Borhan Prodhan will review it shortly.
                  </span>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-4">
                <p className="text-xs text-slate-400">
                  Protected by server-side validation and rate limiting.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#7C3AED] px-6 py-2.5 text-sm font-semibold text-[#F8FAFC] transition-colors hover:bg-[#6D28D9] disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#38BDF8]"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
