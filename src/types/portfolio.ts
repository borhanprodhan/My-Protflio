export interface SiteContent {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  experienceSummary: string;
  educationHsc: string;
  educationSsc: string;
  heroHeading: string;
  heroSubheading: string;
  introText: string;
  aboutHeading: string;
  aboutBody: string;
  profilePhotoUrl: string;
  cvUrl: string;
  cvLabel: string;
  footerTagline: string;
  footerSubtitle: string;
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
  showHero: boolean;
  showAbout: boolean;
  showServices: boolean;
  showSkills: boolean;
  showProjects: boolean;
  showContact: boolean;
  updatedAt?: unknown;
}

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  deliverables: string[];
  visualUrl: string;
  order: number;
  visible: boolean;
  updatedAt?: unknown;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  description: string;
  order: number;
  visible: boolean;
  updatedAt?: unknown;
}

export type ProjectStatus = 'Architecture Blueprint' | 'In Development' | 'Published';

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  coverImage: string;
  gallery: string[];
  technologies: string[];
  projectUrl: string;
  githubUrl: string;
  status: ProjectStatus;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: string;
  order: number;
  visible: boolean;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  label: string;
  url: string;
  order: number;
  visible: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt?: unknown;
}

export type MessageStatus = 'New' | 'Contacted' | 'In Progress' | 'Completed' | 'Archived';

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  serviceRequired: string;
  projectBudget: string;
  message: string;
  status: MessageStatus;
  submittedAt?: unknown;
  updatedAt?: unknown;
}

export const FIELD_LIMITS = {
  NAME_MAX: 120,
  TITLE_MAX: 160,
  SHORT_DESC_MAX: 400,
  LONG_DESC_MAX: 2500,
  MESSAGE_MAX: 3000,
  URL_MAX: 500,
  SLUG_PATTERN: /^[a-z0-9-]+$/,
  ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
} as const;

export const PROJECT_CATEGORIES = [
  'All',
  'AI Email Automation',
  'WhatsApp Chatbot Automation',
  'Facebook Messenger AI Chatbot',
  'Telegram AI Bot',
  'Google Sheets Automation',
  'CRM & Lead Management Automation',
] as const;

export const MESSAGE_STATUSES: MessageStatus[] = [
  'New',
  'Contacted',
  'In Progress',
  'Completed',
  'Archived',
];
