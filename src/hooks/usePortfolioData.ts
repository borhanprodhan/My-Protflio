import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  DEFAULT_LANGUAGES,
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_CONTENT,
  DEFAULT_SKILLS,
  DEFAULT_SOCIAL_LINKS,
} from '../data/defaultPortfolio';
import type {
  LanguageItem,
  ProjectItem,
  ServiceItem,
  SiteContent,
  SkillItem,
  SocialLinkItem,
} from '../types/portfolio';

export interface PortfolioState {
  siteContent: SiteContent;
  services: ServiceItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  languages: LanguageItem[];
  socialLinks: SocialLinkItem[];
  loading: boolean;
  hasRemoteData: boolean;
}

export function usePortfolioData(includeHiddenForAdmin = false): PortfolioState {
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [skills, setSkills] = useState<SkillItem[]>(DEFAULT_SKILLS);
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);
  const [languages, setLanguages] = useState<LanguageItem[]>(DEFAULT_LANGUAGES);
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>(DEFAULT_SOCIAL_LINKS);
  const [loading, setLoading] = useState(true);
  const [hasRemoteData, setHasRemoteData] = useState(false);

  useEffect(() => {
    const unsubs: Array<() => void> = [];

    // 1. Site Content
    unsubs.push(
      onSnapshot(
        doc(db, 'site_content', 'main'),
        (snap) => {
          if (snap.exists()) {
            const remote = snap.data() as Partial<SiteContent>;
            const rawPhoto = remote.profilePhotoUrl;
            const normalizedPhoto =
              rawPhoto && rawPhoto.startsWith('/assets/')
                ? `${(import.meta.env.BASE_URL || './').replace(/\/?$/, '/')}assets/${rawPhoto.slice('/assets/'.length)}`
                : rawPhoto;
            setSiteContent({
              ...DEFAULT_SITE_CONTENT,
              ...remote,
              ...(normalizedPhoto ? { profilePhotoUrl: normalizedPhoto } : {}),
            });
            setHasRemoteData(true);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('site_content listener notice:', err.message);
          setLoading(false);
        }
      )
    );

    // 2. Services
    const servicesRef = includeHiddenForAdmin
      ? collection(db, 'services')
      : query(collection(db, 'services'), where('visible', '==', true));
    unsubs.push(
      onSnapshot(
        servicesRef,
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs
              .map((d) => ({ id: d.id, ...(d.data() as Omit<ServiceItem, 'id'>) }))
              .sort((a, b) => a.order - b.order);
            setServices(list);
          } else if (includeHiddenForAdmin) {
            setServices([]);
          }
        },
        (err) => console.warn('services listener notice:', err.message)
      )
    );

    // 3. Skills
    const skillsRef = includeHiddenForAdmin
      ? collection(db, 'skills')
      : query(collection(db, 'skills'), where('visible', '==', true));
    unsubs.push(
      onSnapshot(
        skillsRef,
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs
              .map((d) => ({ id: d.id, ...(d.data() as Omit<SkillItem, 'id'>) }))
              .sort((a, b) => a.order - b.order);
            setSkills(list);
          } else if (includeHiddenForAdmin) {
            setSkills([]);
          }
        },
        (err) => console.warn('skills listener notice:', err.message)
      )
    );

    // 4. Projects
    const projectsRef = includeHiddenForAdmin
      ? collection(db, 'projects')
      : query(collection(db, 'projects'), where('published', '==', true));
    unsubs.push(
      onSnapshot(
        projectsRef,
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs
              .map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectItem, 'id'>) }))
              .sort((a, b) => a.order - b.order);
            setProjects(list);
          } else if (includeHiddenForAdmin) {
            setProjects([]);
          }
        },
        (err) => console.warn('projects listener notice:', err.message)
      )
    );

    // 5. Languages
    const langsRef = includeHiddenForAdmin
      ? collection(db, 'languages')
      : query(collection(db, 'languages'), where('visible', '==', true));
    unsubs.push(
      onSnapshot(
        langsRef,
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs
              .map((d) => ({ id: d.id, ...(d.data() as Omit<LanguageItem, 'id'>) }))
              .sort((a, b) => a.order - b.order);
            setLanguages(list);
          } else if (includeHiddenForAdmin) {
            setLanguages([]);
          }
        },
        (err) => console.warn('languages listener notice:', err.message)
      )
    );

    // 6. Social Links
    const socialRef = includeHiddenForAdmin
      ? collection(db, 'social_links')
      : query(collection(db, 'social_links'), where('visible', '==', true));
    unsubs.push(
      onSnapshot(
        socialRef,
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs
              .map((d) => ({ id: d.id, ...(d.data() as Omit<SocialLinkItem, 'id'>) }))
              .sort((a, b) => a.order - b.order);
            setSocialLinks(list);
          } else if (includeHiddenForAdmin) {
            setSocialLinks([]);
          }
        },
        (err) => console.warn('social_links listener notice:', err.message)
      )
    );

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [includeHiddenForAdmin]);

  return {
    siteContent,
    services,
    skills,
    projects,
    languages,
    socialLinks,
    loading,
    hasRemoteData,
  };
}

export async function seedDefaultPortfolioToFirestore(): Promise<void> {
  try {
    const batch = writeBatch(db);
    const now = serverTimestamp();

    batch.set(doc(db, 'site_content', 'main'), {
      ...DEFAULT_SITE_CONTENT,
      updatedAt: now,
    });

    for (const s of DEFAULT_SERVICES) {
      const { id, ...rest } = s;
      batch.set(doc(db, 'services', id), { ...rest, updatedAt: now });
    }

    for (const sk of DEFAULT_SKILLS) {
      const { id, ...rest } = sk;
      batch.set(doc(db, 'skills', id), { ...rest, updatedAt: now });
    }

    for (const p of DEFAULT_PROJECTS) {
      const { id, ...rest } = p;
      batch.set(doc(db, 'projects', id), { ...rest, createdAt: now, updatedAt: now });
    }

    for (const l of DEFAULT_LANGUAGES) {
      const { id, ...rest } = l;
      batch.set(doc(db, 'languages', id), rest);
    }

    for (const soc of DEFAULT_SOCIAL_LINKS) {
      const { id, ...rest } = soc;
      batch.set(doc(db, 'social_links', id), rest);
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seedDefaultPortfolioToFirestore');
  }
}
