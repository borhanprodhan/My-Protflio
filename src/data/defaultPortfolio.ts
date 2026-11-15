import type {
  LanguageItem,
  ProjectItem,
  ServiceItem,
  SiteContent,
  SkillItem,
  SocialLinkItem,
} from '../types/portfolio';

export const PROFILE_PHOTO_PATH =
  '/assets/aistudio/6340b46f-2dd3-4faa-a5db-cad16a2dd993_963f79bb.jpg';

export const VISUAL_WORKFLOW =
  '/src/assets/images/workflow_node_architecture_1794638823438.jpg';
export const VISUAL_MESSAGING =
  '/src/assets/images/messaging_channel_bridge_1794638824208.jpg';
export const VISUAL_PIPELINE =
  '/src/assets/images/email_crm_pipeline_1794638824641.jpg';
export const VISUAL_SHEETS =
  '/src/assets/images/sheets_data_sync_1794638824877.jpg';

export const DEFAULT_SITE_CONTENT: SiteContent = {
  name: 'MD. Borhan Prodhan',
  title: 'AI Automation & Digital Workflow Specialist',
  location: 'Gobindaganj, Gaibandha, Bangladesh',
  email: 'mdborhprodhan@gmail.com',
  phone: '01313-3369612',
  experienceSummary: '4 years at SEO Expate',
  educationHsc: 'HSC — 2025',
  educationSsc: 'SSC — 2023',
  heroHeading: 'Building Smarter Workflows. Creating Better Digital Experiences.',
  heroSubheading:
    'I design automation systems that connect business tools, simplify operations, and improve customer experiences.',
  introText:
    'I help businesses improve their workflows through AI-powered automation, intelligent agents, customer communication systems, and digital marketing solutions.',
  aboutHeading: 'Systems Thinking Applied to Business Operations',
  aboutBody:
    'I am a digital professional with four years of experience at SEO Expate. My professional interests include AI automation, AI agents, business workflow optimization, WhatsApp automation, lead management, and digital marketing.\n\nI enjoy exploring how automation can reduce repetitive work and help businesses operate more efficiently.',
  profilePhotoUrl: PROFILE_PHOTO_PATH,
  cvUrl: '',
  cvLabel: 'Download CV',
  footerTagline: 'Building smarter digital experiences.',
  footerSubtitle: 'AI Automation | AI Agents | Digital Solutions',
  seoTitle: 'MD. Borhan Prodhan — AI Automation & Digital Workflow Specialist',
  seoDescription:
    'Portfolio of MD. Borhan Prodhan, specializing in AI Automation, n8n Workflow Automation, AI Agents, WhatsApp Chatbots, CRM Systems, and SEO.',
  ogTitle: 'MD. Borhan Prodhan — AI Automation & Digital Workflow Specialist',
  ogDescription:
    'I design automation systems that connect business tools, simplify operations, and improve customer experiences.',
  showHero: true,
  showAbout: true,
  showServices: true,
  showSkills: true,
  showProjects: true,
  showContact: true,
};

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'srv-ai-workflow',
    title: 'AI Workflow Automation',
    slug: 'ai-workflow-automation',
    shortDescription:
      'End-to-end operational pipelines that connect triggers, AI reasoning nodes, and business applications.',
    fullDescription:
      'Structured automation workflows built to eliminate manual data transfers between forms, spreadsheets, inboxes, and operational databases. Every system includes deterministic error handling and clear audit trails.',
    deliverables: [
      'Process mapping and bottleneck analysis',
      'Multi-step conditional workflow architecture',
      'API and webhook orchestration across tools',
      'Error handling and fallback routing',
    ],
    visualUrl: VISUAL_WORKFLOW,
    order: 1,
    visible: true,
  },
  {
    id: 'srv-whatsapp',
    title: 'WhatsApp Automation',
    slug: 'whatsapp-automation',
    shortDescription:
      'Automated customer inquiry handling, lead qualification, and instant response flows on WhatsApp.',
    fullDescription:
      'Conversational automation built for WhatsApp Business workflows. Captures inbound inquiries, answers structured questions, qualifies prospects, and syncs conversation records directly to spreadsheets or CRM boards.',
    deliverables: [
      'Automated inquiry intake and routing',
      'Lead qualification conversation trees',
      'Real-time CRM and Google Sheets logging',
      'Human handoff notifications for complex inquiries',
    ],
    visualUrl: VISUAL_MESSAGING,
    order: 2,
    visible: true,
  },
  {
    id: 'srv-ai-chatbot',
    title: 'AI Chatbot Development',
    slug: 'ai-chatbot-development',
    shortDescription:
      'Context-aware conversational assistants for Messenger, Telegram, and web customer support.',
    fullDescription:
      'Custom AI agent workflows designed to understand customer intent, reference structured business knowledge bases, and deliver consistent, accurate replies across messaging channels.',
    deliverables: [
      'Intent classification and prompt engineering',
      'Knowledge-base grounded response flows',
      'Multi-channel deployment (Messenger & Telegram)',
      'Structured conversation transcript logging',
    ],
    visualUrl: VISUAL_MESSAGING,
    order: 3,
    visible: true,
  },
  {
    id: 'srv-n8n',
    title: 'n8n Integration',
    slug: 'n8n-integration',
    shortDescription:
      'Custom n8n node workflows linking SaaS tools, webhooks, databases, and AI models seamlessly.',
    fullDescription:
      'Modular n8n automation architecture tailored to your exact software stack. Replaces fragmented manual steps with maintainable visual pipelines, HTTP request nodes, and scheduled sync jobs.',
    deliverables: [
      'Custom n8n workflow design and deployment',
      'Webhook listeners and REST API integrations',
      'Data transformation and schema normalization',
      'Scheduled reporting and alert triggers',
    ],
    visualUrl: VISUAL_WORKFLOW,
    order: 4,
    visible: true,
  },
  {
    id: 'srv-email',
    title: 'Email Automation',
    slug: 'email-automation',
    shortDescription:
      'AI-assisted inbox triage, intelligent draft preparation, and structured follow-up sequences.',
    fullDescription:
      'Automated email pipelines that categorize incoming messages, extract structured inquiry details, log leads automatically, and trigger timely follow-up workflows without manual sorting.',
    deliverables: [
      'Automated inbound email classification',
      'Lead extraction into CRM or Google Sheets',
      'Context-aware response drafting workflows',
      'Timed follow-up sequence orchestration',
    ],
    visualUrl: VISUAL_PIPELINE,
    order: 5,
    visible: true,
  },
  {
    id: 'srv-crm',
    title: 'CRM Automation',
    slug: 'crm-automation',
    shortDescription:
      'Unified lead capture, pipeline stage updates, and Google Sheets synchronization for sales teams.',
    fullDescription:
      'Automated lead management pipelines that unify inquiries from websites, messaging apps, and email into a single clean CRM or Google Sheets tracking system with instant status notifications.',
    deliverables: [
      'Multi-source lead capture normalization',
      'Automated stage progression and tagging',
      'Bi-directional Google Sheets synchronization',
      'Instant team notification triggers',
    ],
    visualUrl: VISUAL_SHEETS,
    order: 6,
    visible: true,
  },
  {
    id: 'srv-seo',
    title: 'SEO & Digital Marketing',
    slug: 'seo-digital-marketing',
    shortDescription:
      'Search visibility optimization, technical SEO audits, and structured digital growth workflows.',
    fullDescription:
      'Grounded in four years of hands-on experience at SEO Expate, combining technical on-page optimization, search intent research, and automated marketing reporting to build sustainable organic visibility.',
    deliverables: [
      'Technical and on-page SEO optimization',
      'Search intent and keyword architecture',
      'Metadata and structured data implementation',
      'Automated performance tracking workflows',
    ],
    visualUrl: VISUAL_PIPELINE,
    order: 7,
    visible: true,
  },
];

export const DEFAULT_SKILLS: SkillItem[] = [
  {
    id: 'sk-1',
    name: 'AI Automation',
    category: 'Automation & AI',
    description: 'Designing AI-assisted operational pipelines that reduce repetitive manual work.',
    order: 1,
    visible: true,
  },
  {
    id: 'sk-2',
    name: 'n8n Workflow Automation',
    category: 'Automation & AI',
    description: 'Building modular node-based workflows connecting webhooks, APIs, and business tools.',
    order: 2,
    visible: true,
  },
  {
    id: 'sk-3',
    name: 'AI Agent Development',
    category: 'Automation & AI',
    description: 'Configuring goal-oriented agents with structured tool use and contextual memory.',
    order: 3,
    visible: true,
  },
  {
    id: 'sk-4',
    name: 'WhatsApp Chatbot Automation',
    category: 'Messaging Systems',
    description: 'Automated inquiry capture, instant replies, and lead qualification on WhatsApp.',
    order: 4,
    visible: true,
  },
  {
    id: 'sk-5',
    name: 'Facebook Messenger Chatbot',
    category: 'Messaging Systems',
    description: 'Interactive Messenger assistants for customer questions and service routing.',
    order: 5,
    visible: true,
  },
  {
    id: 'sk-6',
    name: 'Telegram Bot Automation',
    category: 'Messaging Systems',
    description: 'Command-driven and AI-powered Telegram bots for notifications and support.',
    order: 6,
    visible: true,
  },
  {
    id: 'sk-7',
    name: 'AI Email Automation',
    category: 'Operations & CRM',
    description: 'Smart inbox classification, entity extraction, and automated follow-up sequences.',
    order: 7,
    visible: true,
  },
  {
    id: 'sk-8',
    name: 'Google Sheets Automation',
    category: 'Operations & CRM',
    description: 'Real-time spreadsheet synchronization, structured logging, and reporting triggers.',
    order: 8,
    visible: true,
  },
  {
    id: 'sk-9',
    name: 'CRM & Lead Management',
    category: 'Operations & CRM',
    description: 'Unified lead routing, deduplication, status tracking, and follow-up reminders.',
    order: 9,
    visible: true,
  },
  {
    id: 'sk-10',
    name: 'SEO & Digital Marketing',
    category: 'Digital Growth',
    description: 'Technical SEO, search optimization, and digital growth systems backed by 4 years at SEO Expate.',
    order: 10,
    visible: true,
  },
  {
    id: 'sk-11',
    name: 'Customer Support Automation',
    category: 'Messaging Systems',
    description: 'Automated triage, FAQ resolution, and escalation routing to human agents.',
    order: 11,
    visible: true,
  },
  {
    id: 'sk-12',
    name: 'Business Process Automation',
    category: 'Operations & CRM',
    description: 'Mapping and connecting recurring business tasks into dependable digital workflows.',
    order: 12,
    visible: true,
  },
];

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-email-triage',
    title: 'Intelligent Inbox Triage & Response Pipeline',
    slug: 'intelligent-inbox-triage-response-pipeline',
    category: 'AI Email Automation',
    description:
      'An n8n-orchestrated email workflow system that monitors incoming business inquiries, classifies intent and urgency, extracts structured contact details into Google Sheets, and prepares context-grounded draft replies for fast team review.',
    coverImage: VISUAL_PIPELINE,
    gallery: [VISUAL_PIPELINE, VISUAL_WORKFLOW],
    technologies: ['n8n', 'IMAP / Gmail API', 'LLM Classification', 'Google Sheets', 'Webhooks'],
    projectUrl: '',
    githubUrl: '',
    status: 'Architecture Blueprint',
    featured: true,
    published: true,
    order: 1,
  },
  {
    id: 'proj-whatsapp-intake',
    title: 'WhatsApp Lead Qualification & Routing System',
    slug: 'whatsapp-lead-qualification-routing-system',
    category: 'WhatsApp Chatbot Automation',
    description:
      'A structured WhatsApp automation workflow engineered to greet inbound prospects immediately, collect service requirements and contact details through natural conversational steps, log qualified records into a CRM sheet, and notify the specialist.',
    coverImage: VISUAL_MESSAGING,
    gallery: [VISUAL_MESSAGING, VISUAL_SHEETS],
    technologies: ['WhatsApp Cloud API', 'n8n', 'AI Agent', 'Google Sheets', 'Webhook Routing'],
    projectUrl: '',
    githubUrl: '',
    status: 'Architecture Blueprint',
    featured: true,
    published: true,
    order: 2,
  },
  {
    id: 'proj-messenger-support',
    title: 'Facebook Messenger AI Support Assistant',
    slug: 'facebook-messenger-ai-support-assistant',
    category: 'Facebook Messenger AI Chatbot',
    description:
      'A conversational Messenger workflow designed to answer recurring service questions from a structured knowledge base, capture customer inquiries outside business hours, and seamlessly escalate complex requests to a human operator.',
    coverImage: VISUAL_MESSAGING,
    gallery: [VISUAL_MESSAGING, VISUAL_WORKFLOW],
    technologies: ['Meta Messenger API', 'n8n', 'Knowledge Base Retrieval', 'JSON Routing'],
    projectUrl: '',
    githubUrl: '',
    status: 'Architecture Blueprint',
    featured: false,
    published: true,
    order: 3,
  },
  {
    id: 'proj-telegram-ops',
    title: 'Telegram AI Assistant & Operations Alert Bot',
    slug: 'telegram-ai-assistant-operations-alert-bot',
    category: 'Telegram AI Bot',
    description:
      'A dual-purpose Telegram bot architecture supporting natural-language customer Q&A alongside internal team commands for checking pipeline status, logging tasks, and receiving instant webhook alerts from connected business systems.',
    coverImage: VISUAL_WORKFLOW,
    gallery: [VISUAL_WORKFLOW, VISUAL_MESSAGING],
    technologies: ['Telegram Bot API', 'n8n', 'AI Agent', 'REST Webhooks'],
    projectUrl: '',
    githubUrl: '',
    status: 'Architecture Blueprint',
    featured: false,
    published: true,
    order: 4,
  },
  {
    id: 'proj-sheets-sync',
    title: 'Automated Google Sheets Reporting & Sync Engine',
    slug: 'automated-google-sheets-reporting-sync-engine',
    category: 'Google Sheets Automation',
    description:
      'A scheduled and event-driven Google Sheets automation pipeline that normalizes incoming form and messaging records, prevents duplicate entries, applies status formulas automatically, and dispatches daily operational summaries.',
    coverImage: VISUAL_SHEETS,
    gallery: [VISUAL_SHEETS, VISUAL_PIPELINE],
    technologies: ['Google Sheets API', 'n8n', 'Data Normalization', 'Scheduled Triggers'],
    projectUrl: '',
    githubUrl: '',
    status: 'Architecture Blueprint',
    featured: true,
    published: true,
    order: 5,
  },
  {
    id: 'proj-crm-lead-hub',
    title: 'Unified Multi-Channel CRM & Lead Pipeline',
    slug: 'unified-multi-channel-crm-lead-pipeline',
    category: 'CRM & Lead Management Automation',
    description:
      'A central lead management blueprint consolidating inquiries from web forms, email, WhatsApp, and Messenger into one structured CRM workflow with automated status stages, follow-up reminders, and clean data hygiene.',
    coverImage: VISUAL_WORKFLOW,
    gallery: [VISUAL_WORKFLOW, VISUAL_SHEETS],
    technologies: ['n8n', 'CRM Webhooks', 'Google Sheets', 'Email Notifications', 'REST APIs'],
    projectUrl: '',
    githubUrl: '',
    status: 'Architecture Blueprint',
    featured: true,
    published: true,
    order: 6,
  },
];

export const DEFAULT_LANGUAGES: LanguageItem[] = [
  { id: 'lang-english', name: 'English', proficiency: '', order: 1, visible: true },
  { id: 'lang-bangla', name: 'Bangla', proficiency: '', order: 2, visible: true },
  { id: 'lang-arabic', name: 'Arabic', proficiency: '', order: 3, visible: true },
];

export const DEFAULT_SOCIAL_LINKS: SocialLinkItem[] = [
  { id: 'soc-linkedin', platform: 'LinkedIn', label: 'LinkedIn', url: '', order: 1, visible: true },
  { id: 'soc-facebook', platform: 'Facebook', label: 'Facebook', url: '', order: 2, visible: true },
  { id: 'soc-github', platform: 'GitHub', label: 'GitHub', url: '', order: 3, visible: true },
  { id: 'soc-fiverr', platform: 'Fiverr', label: 'Fiverr', url: '', order: 4, visible: true },
  { id: 'soc-whatsapp', platform: 'WhatsApp', label: 'WhatsApp', url: '', order: 5, visible: true },
];
