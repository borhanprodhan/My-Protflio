import { useMemo, useState } from 'react';
import type { SkillItem } from '../types/portfolio';

interface SkillsSectionProps {
  skills: SkillItem[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const visibleSkills = useMemo(() => skills.filter((s) => s.visible), [skills]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(visibleSkills.map((s) => s.category)));
    return ['All', ...unique];
  }, [visibleSkills]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return visibleSkills;
    return visibleSkills.filter((s) => s.category === selectedCategory);
  }, [selectedCategory, visibleSkills]);

  if (visibleSkills.length === 0) return null;

  return (
    <section
      id="skills"
      className="relative z-10 border-t border-slate-800/80 bg-[#080B14]/85 px-6 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-[#38BDF8]">03. Capabilities</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl [text-wrap:balance]">
              Core Automation &amp; Digital Disciplines
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Filter capabilities by discipline"
            className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-800 bg-[#111827] p-1"
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[38px] rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#38BDF8] ${
                    active
                      ? 'bg-[#7C3AED] text-[#F8FAFC]'
                      : 'text-slate-400 hover:text-[#F8FAFC]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((skill, idx) => (
            <div
              key={skill.id}
              className="rounded-xl border border-slate-800 bg-[#111827] p-6 transition-colors duration-200 hover:border-slate-700"
            >
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                <span>{skill.category}</span>
                <span className="font-mono-tech">{String(idx + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-[#F8FAFC]">
                {skill.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{skill.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
