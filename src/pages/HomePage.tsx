import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import { AboutSection } from '../components/AboutSection';
import { ContactSection } from '../components/ContactSection';
import { Footer } from '../components/Footer';
import { HeroSection } from '../components/HeroSection';
import { Navbar } from '../components/Navbar';
import { ProjectsSection } from '../components/ProjectsSection';
import { ServicesSection } from '../components/ServicesSection';
import { SkillsSection } from '../components/SkillsSection';
import { WorkflowScene3D } from '../components/WorkflowScene3D';
import { usePortfolioData } from '../hooks/usePortfolioData';

gsap.registerPlugin(ScrollTrigger);

export function HomePage() {
  const { siteContent, services, skills, projects, languages, socialLinks } =
    usePortfolioData(false);

  const [preselectedService, setPreselectedService] = useState('');
  const scrollProgressRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Sync dynamic SEO metadata from Firestore site_content
  useEffect(() => {
    if (siteContent.seoTitle) {
      document.title = siteContent.seoTitle;
    }
    const setMeta = (selector: string, content: string) => {
      if (!content) return;
      const el = document.querySelector(selector);
      if (el) el.setAttribute('content', content);
    };
    setMeta('meta[name="description"]', siteContent.seoDescription);
    setMeta('meta[property="og:title"]', siteContent.ogTitle || siteContent.seoTitle);
    setMeta('meta[property="og:description"]', siteContent.ogDescription || siteContent.seoDescription);
    setMeta('meta[name="twitter:title"]', siteContent.ogTitle || siteContent.seoTitle);
    setMeta('meta[name="twitter:description"]', siteContent.ogDescription || siteContent.seoDescription);
  }, [siteContent]);

  // GSAP ScrollTrigger + subtle mouse tracking
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handlePointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion) return;
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress;
        },
      });

      if (!prefersReducedMotion) {
        gsap.utils.toArray<HTMLElement>('.project-card').forEach((card, i) => {
          gsap.fromTo(
            card,
            { y: 18, opacity: 0.92 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              delay: (i % 3) * 0.05,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                once: true,
              },
            }
          );
        });
      }
    }, rootRef);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      ctx.revert();
    };
  }, []);

  const handleSelectServiceForContact = (serviceTitle: string) => {
    setPreselectedService(serviceTitle);
    const el = document.querySelector('#contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={rootRef} className="relative min-h-screen bg-[#080B14] text-[#F8FAFC]">
      <WorkflowScene3D scrollProgressRef={scrollProgressRef} mouseRef={mouseRef} />

      <Navbar
        brandName={siteContent.name}
        showAbout={siteContent.showAbout}
        showServices={siteContent.showServices}
        showSkills={siteContent.showSkills}
        showProjects={siteContent.showProjects}
        showContact={siteContent.showContact}
      />

      <main>
        {siteContent.showHero && <HeroSection siteContent={siteContent} />}

        {siteContent.showAbout && (
          <AboutSection siteContent={siteContent} languages={languages} />
        )}

        {siteContent.showServices && (
          <ServicesSection
            services={services}
            onSelectServiceForContact={handleSelectServiceForContact}
          />
        )}

        {siteContent.showSkills && <SkillsSection skills={skills} />}

        {siteContent.showProjects && <ProjectsSection projects={projects} />}

        {siteContent.showContact && (
          <ContactSection
            siteContent={siteContent}
            services={services}
            preselectedService={preselectedService}
          />
        )}
      </main>

      <Footer siteContent={siteContent} socialLinks={socialLinks} />
    </div>
  );
}
