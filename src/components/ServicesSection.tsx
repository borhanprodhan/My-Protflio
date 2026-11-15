import { ArrowUpRight, Layers, X } from 'lucide-react';
import { useState } from 'react';
import type { ServiceItem } from '../types/portfolio';

interface ServicesSectionProps {
  services: ServiceItem[];
  onSelectServiceForContact: (serviceTitle: string) => void;
}

export function ServicesSection({ services, onSelectServiceForContact }: ServicesSectionProps) {
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const visibleServices = services.filter((s) => s.visible);
  if (visibleServices.length === 0) return null;

  return (
    <section
      id="services"
      className="relative z-10 border-t border-slate-800/80 bg-[#080B14]/90 px-6 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-medium text-[#38BDF8]">02. Services</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl [text-wrap:balance]">
            Automation Systems Built for Reliability
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Structured workflows and communication systems engineered to connect your tools and simplify recurring operations.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleServices.map((service, index) => {
            const hasBrokenImg = brokenImages[service.id] || !service.visualUrl;
            return (
              <article
                key={service.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#111827] transition-colors duration-200 hover:border-slate-700"
              >
                <div className="aspect-[4/3] w-full overflow-hidden border-b border-slate-800 bg-slate-900">
                  {!hasBrokenImg ? (
                    <img
                      src={service.visualUrl}
                      alt={service.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [service.id]: true }))
                      }
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0F172A] p-6 text-center">
                      <Layers className="h-7 w-7 text-slate-500" aria-hidden="true" />
                      <span className="mt-2 text-xs text-slate-400">{service.title}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <p className="font-mono-tech text-xs text-slate-400">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-semibold text-[#F8FAFC]">
                      {service.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                      {service.shortDescription}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-slate-800/80 pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveService(service)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-medium text-[#38BDF8] transition-colors hover:text-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-[#38BDF8]"
                    >
                      <span>View Details</span>
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Service Details Modal */}
      {activeService && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveService(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-[#111827] p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#38BDF8]">Service Specification</p>
                <h3
                  id="service-modal-title"
                  className="mt-1 font-display text-2xl font-bold text-[#F8FAFC]"
                >
                  {activeService.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveService(null)}
                aria-label="Close service details"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-[#38BDF8]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-5 text-base leading-relaxed text-slate-300">
              {activeService.fullDescription}
            </p>

            {activeService.deliverables.length > 0 && (
              <div className="mt-6 border-t border-slate-800 pt-5">
                <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">
                  Key Scope &amp; Deliverables
                </h4>
                <ul className="mt-3 space-y-2.5 text-sm text-slate-300">
                  {activeService.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="mt-1 font-mono-tech text-xs text-[#38BDF8]">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 pt-5">
              <button
                type="button"
                onClick={() => setActiveService(null)}
                className="min-h-[44px] rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = activeService.title;
                  setActiveService(null);
                  onSelectServiceForContact(title);
                }}
                className="min-h-[44px] rounded-lg bg-[#7C3AED] px-5 py-2 text-sm font-semibold text-[#F8FAFC] hover:bg-[#6D28D9]"
              >
                Request This Service
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
