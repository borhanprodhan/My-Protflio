import { ArrowUpRight, ExternalLink, FolderGit2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { PROJECT_CATEGORIES, type ProjectItem } from '../types/portfolio';

interface ProjectsSectionProps {
  projects: ProjectItem[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState<number>(0);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const publishedProjects = useMemo(
    () => projects.filter((p) => p.published),
    [projects]
  );

  const availableCategories = useMemo(() => {
    const existingCats = new Set(publishedProjects.map((p) => p.category));
    const ordered = PROJECT_CATEGORIES.filter((c) => c === 'All' || existingCats.has(c));
    publishedProjects.forEach((p) => {
      if (!ordered.includes(p.category as (typeof PROJECT_CATEGORIES)[number])) {
        ordered.push(p.category as (typeof PROJECT_CATEGORIES)[number]);
      }
    });
    return ordered;
  }, [publishedProjects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return publishedProjects;
    return publishedProjects.filter((p) => p.category === selectedCategory);
  }, [publishedProjects, selectedCategory]);

  if (publishedProjects.length === 0) return null;

  const openProject = (project: ProjectItem) => {
    setActiveProject(project);
    setActiveGalleryIdx(0);
  };

  return (
    <section
      id="projects"
      className="relative z-10 border-t border-slate-800/80 bg-[#080B14]/90 px-6 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-medium text-[#38BDF8]">04. Portfolio</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl [text-wrap:balance]">
            Automation Architectures &amp; Workflow Systems
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Explore system blueprints across email triage, messaging chatbots, spreadsheet sync, and CRM pipelines.
          </p>
        </div>

        {/* Interactive category filter controls */}
        <div
          role="tablist"
          aria-label="Filter projects by category"
          className="mb-10 flex flex-wrap gap-2"
        >
          {availableCategories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[40px] rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#38BDF8] ${
                  active
                    ? 'border-[#7C3AED] bg-[#7C3AED] text-[#F8FAFC]'
                    : 'border-slate-800 bg-[#111827] text-slate-300 hover:border-slate-700 hover:text-[#F8FAFC]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Project cards grid */}
        <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => {
              const hasBrokenImg = brokenImages[project.id] || !project.coverImage;
              return (
                <motion.article
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="project-card group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#111827] transition-colors duration-200 hover:border-slate-700"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden border-b border-slate-800 bg-slate-900">
                    {!hasBrokenImg ? (
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setBrokenImages((prev) => ({ ...prev, [project.id]: true }))
                        }
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-[#0F172A] p-6 text-center">
                        <span className="font-mono-tech text-xs text-slate-400">
                          {project.category}
                        </span>
                        <span className="mt-2 font-display text-sm font-medium text-slate-200">
                          {project.title}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                        <span className="text-[#38BDF8]">{project.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.status}</span>
                        {project.featured && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-300">Featured</span>
                          </>
                        )}
                      </div>

                      <h3 className="mt-2.5 font-display text-xl font-semibold text-[#F8FAFC]">
                        {project.title}
                      </h3>

                      <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-slate-400">
                        {project.description}
                      </p>

                      {project.technologies.length > 0 && (
                        <p className="mt-4 font-mono-tech text-xs leading-relaxed text-slate-400">
                          {project.technologies.join(' · ')}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
                      <button
                        type="button"
                        onClick={() => openProject(project)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-medium text-[#38BDF8] transition-colors hover:text-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-[#38BDF8]"
                      >
                        <span>Inspect Architecture</span>
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </button>

                      <div className="flex items-center gap-3">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} repository`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                          >
                            <FolderGit2 className="h-4 w-4" />
                          </a>
                        )}
                        {project.projectUrl && (
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} live URL`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Project Detail Modal */}
      {activeProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveProject(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-[#111827] p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="text-[#38BDF8]">{activeProject.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeProject.status}</span>
                </div>
                <h3
                  id="project-modal-title"
                  className="mt-1.5 font-display text-2xl font-bold text-[#F8FAFC]"
                >
                  {activeProject.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveProject(null)}
                aria-label="Close project details"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cover / Gallery Viewer */}
            {(() => {
              const images = [
                activeProject.coverImage,
                ...activeProject.gallery.filter((g) => g !== activeProject.coverImage),
              ].filter(Boolean);
              const currentImg = images[activeGalleryIdx] || '';

              if (images.length === 0) return null;
              return (
                <div className="mt-6">
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                    <img
                      src={currentImg}
                      alt={`${activeProject.title} preview ${activeGalleryIdx + 1}`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {images.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveGalleryIdx(idx)}
                          className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border ${
                            idx === activeGalleryIdx
                              ? 'border-[#38BDF8]'
                              : 'border-slate-800 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Thumbnail ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <p className="mt-6 text-base leading-relaxed text-slate-300">
              {activeProject.description}
            </p>

            {activeProject.technologies.length > 0 && (
              <div className="mt-6 border-t border-slate-800 pt-5">
                <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">
                  Technologies &amp; Integrations
                </h4>
                <p className="mt-2 font-mono-tech text-xs leading-relaxed text-slate-300">
                  {activeProject.technologies.join(' · ')}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 pt-5">
              {activeProject.githubUrl && (
                <a
                  href={activeProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
                >
                  <FolderGit2 className="h-4 w-4" aria-hidden="true" />
                  <span>Source Repository</span>
                </a>
              )}
              {activeProject.projectUrl && (
                <a
                  href={activeProject.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#7C3AED] px-5 py-2 text-sm font-semibold text-[#F8FAFC] hover:bg-[#6D28D9]"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span>Open Project</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
