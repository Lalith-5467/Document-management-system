// ============================================================
// DocVault CMS Central Store & Persistence Engine
// Provides full CRUD operations, live state listeners, and localStorage caching
// ============================================================

export interface CMSHero {
  title: string;
  highlight: string;
  subtitle: string;
  primaryBtnText: string;
  primaryBtnUrl: string;
  secondaryBtnText: string;
  secondaryBtnUrl: string;
  bgImage: string;
  dashboardImage: string;
  enabled: boolean;
}

export interface CMSFeature {
  id: number;
  icon: string;
  title: string;
  description: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CMSCategoryItem {
  id: number;
  name: string;
  icon: string;
  description: string;
  documentCount: number;
  color: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CMSAudienceItem {
  id: number;
  title: string;
  badge: string;
  icon: string;
  description: string;
  features: string[];
  color: string;
  displayOrder: number;
  status: 'active' | 'inactive';
}

export interface CMSScreenshot {
  id: number;
  title: string;
  image: string;
  caption: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CMSTestimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  photo: string;
  rating: number;
  feedback: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CMSTrustedCompany {
  id: number;
  name: string;
  logo: string;
  website: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CMSStatistics {
  documentsStored: string;
  organizations: string;
  countries: string;
  activeUsers: string;
  encryption: string;
  enabled: boolean;
}

export interface CMSFAQ {
  id: number;
  question: string;
  answer: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CMSCTA {
  heading: string;
  description: string;
  primaryBtnText: string;
  primaryBtnUrl: string;
  secondaryBtnText: string;
  secondaryBtnUrl: string;
  bgImage: string;
  enabled: boolean;
}

export interface CMSFooter {
  companyName: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  copyright: string;
}

export interface CMSSocial {
  id: number;
  platform: string;
  icon: string;
  url: string;
  status: 'active' | 'inactive';
}

export interface CMSNavItem {
  id: number;
  name: string;
  url: string;
  displayOrder: number;
  status: 'active' | 'inactive';
}

export interface CMSCarouselSlide {
  id: number;
  badge: string;
  title: string;
  highlight: string;
  sub: string;
  slideImage: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  accentGradient: string;
  accentColor: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CMSData {
  hero: CMSHero;
  features: CMSFeature[];
  categories: CMSCategoryItem[];
  audience: CMSAudienceItem[];
  screenshots: CMSScreenshot[];
  testimonials: CMSTestimonial[];
  companies: CMSTrustedCompany[];
  stats: CMSStatistics;
  faqs: CMSFAQ[];
  cta: CMSCTA;
  footer: CMSFooter;
  socials: CMSSocial[];
  navigation: CMSNavItem[];
  carousel: CMSCarouselSlide[];
}

export const DEFAULT_CMS_DATA: CMSData = {
  hero: {
    title: 'Enterprise Document Management System',
    highlight: 'Powered by High-Speed AI Vault',
    subtitle: 'Securely upload, organize, search, and manage your personal, academic, and business paper trails with military-grade encryption and 100ms instant retrieval.',
    primaryBtnText: 'Get Started Free',
    primaryBtnUrl: '/register',
    secondaryBtnText: 'Sign In to Vault',
    secondaryBtnUrl: '/login',
    bgImage: '/images/hero_vault_bg.png',
    dashboardImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    enabled: true,
  },

  features: [
    { id: 1, icon: 'ShieldCheck', title: 'Military-Grade Encryption', description: 'AES-256 bit disk encryption for maximum privacy and document isolation.', displayOrder: 1, status: 'active', created_at: '2026-01-10T10:00:00Z' },
    { id: 2, icon: 'Zap', title: '100ms Instant Search', description: 'Real-time full text and tag indexing for lighting fast document lookup.', displayOrder: 2, status: 'active', created_at: '2026-01-12T10:00:00Z' },
    { id: 3, icon: 'FolderGit2', title: 'Automated Taxonomy', description: 'Auto-classify files into Academic, Career, Personal, and Project categories.', displayOrder: 3, status: 'active', created_at: '2026-01-15T10:00:00Z' },
    { id: 4, icon: 'RotateCcw', title: 'Version Control & Trash Restore', description: 'Never lose a file with soft-delete recycle bin and restore history.', displayOrder: 4, status: 'active', created_at: '2026-01-18T10:00:00Z' },
    { id: 5, icon: 'Lock', title: 'Role-Based Access Control', description: 'Fine-grained permissions for individual, professional, and enterprise accounts.', displayOrder: 5, status: 'active', created_at: '2026-01-20T10:00:00Z' },
    { id: 6, icon: 'BarChart3', title: 'Analytics & Audit Logs', description: 'Track every view, download, and modification with immutable audit logs.', displayOrder: 6, status: 'active', created_at: '2026-01-22T10:00:00Z' },
  ],

  categories: [
    { id: 1, name: 'Personal Identity & Passports', icon: 'UserCheck', description: 'National IDs, Passports, Visas, Driver Licenses, Birth Certificates', documentCount: 5, color: '#3B82F6', displayOrder: 1, status: 'active', created_at: '2026-01-10T10:00:00Z' },
    { id: 2, name: 'Academic Records & Diplomas', icon: 'GraduationCap', description: 'Degrees, Transcripts, Semester Marksheets, Diplomas, Board Certificates', documentCount: 6, color: '#10B981', displayOrder: 2, status: 'active', created_at: '2026-01-12T10:00:00Z' },
    { id: 3, name: 'Career & Employment Assets', icon: 'FileText', description: 'Resume versions, CVs, Offer & Relieving Letters, Pay Slips, Portfolios', documentCount: 4, color: '#1B664B', displayOrder: 3, status: 'active', created_at: '2026-01-15T10:00:00Z' },
    { id: 4, name: 'Projects & Technical Specs', icon: 'FolderGit2', description: 'BRDs, Architecture Diagrams, Code Specs, Technical Proposals', documentCount: 3, color: '#8B5CF6', displayOrder: 4, status: 'active', created_at: '2026-01-18T10:00:00Z' },
    { id: 5, name: 'Certificates & Achievements', icon: 'Award', description: 'Professional Certifications, Cloud Credentials, Training Badges', documentCount: 2, color: '#EC4899', displayOrder: 5, status: 'active', created_at: '2026-01-20T10:00:00Z' },
    { id: 6, name: 'Client Requirements & Contracts', icon: 'Briefcase', description: 'Client BRDs, SOW Agreements, NDAs, Service Contracts', documentCount: 3, color: '#06B6D4', displayOrder: 6, status: 'active', created_at: '2026-01-22T10:00:00Z' },
  ],

  audience: [
    {
      id: 1,
      title: 'Students & Graduates',
      badge: 'Academic & Careers',
      icon: 'GraduationCap',
      description: 'Keep marksheets, semester grade sheets, project reports, degree certificates, and internship letters indexed for instant job applications and university submissions.',
      features: ['Semester Marksheet Vault', 'Degree & Diploma Storage', 'Project Source Code Docs'],
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
      displayOrder: 1,
      status: 'active'
    },
    {
      id: 2,
      title: 'Working Professionals',
      badge: 'Corporate & HR',
      icon: 'Briefcase',
      description: 'Centralize employment contracts, monthly pay slips, annual tax forms, performance appraisals, and professional certifications in one encrypted vault.',
      features: ['Offer & Relieving Letters', 'Tax & Salary Slips', 'Corporate Certifications'],
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
      displayOrder: 2,
      status: 'active'
    },
    {
      id: 3,
      title: 'Freelancers & Consultants',
      badge: 'Client & Scope',
      icon: 'FolderGit2',
      description: 'Store client requirement briefs (BRDs), statements of work (SOWs), signed project contracts, design specs, and deliverable sign-offs in dedicated workspace folders.',
      features: ['Client Requirement BRDs', 'Scope & Contract Agreements', 'Project Milestone Delivery'],
      color: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400',
      displayOrder: 3,
      status: 'active'
    },
    {
      id: 4,
      title: 'Individuals & Families',
      badge: 'Personal & Estate',
      icon: 'UserCheck',
      description: 'Archive vital personal records, passport copies, property deeds, health insurance policies, and tax receipts securely for quick emergency access.',
      features: ['Passports & Identity Cards', 'Property & Deed Records', 'Medical & Insurance Vault'],
      color: 'from-rose-500/20 to-amber-500/20 border-rose-500/30 text-rose-400',
      displayOrder: 4,
      status: 'active'
    }
  ],

  screenshots: [
    { id: 1, title: 'Main Document Storage Vault', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', caption: 'Clean dark UI showing document grid, category tags, and search filters.', displayOrder: 1, status: 'active', created_at: '2026-01-10T10:00:00Z' },
    { id: 2, title: 'Category & Folder Taxonomy Hub', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80', caption: 'Organized category boxes with live document counts and custom color tags.', displayOrder: 2, status: 'active', created_at: '2026-01-12T10:00:00Z' },
    { id: 3, title: 'Admin Analytics & Audit Dashboard', image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1000&q=80', caption: 'Enterprise activity metrics, monthly upload charts, and user audit trails.', displayOrder: 3, status: 'active', created_at: '2026-01-15T10:00:00Z' },
  ],

  testimonials: [
    { id: 1, name: 'Dr. Evelyn Carter', role: 'Chief Technology Officer', company: 'Nexus Tech Global', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', rating: 5, feedback: 'DocVault transformed our company paper trail. The instant search and 100ms retrieval are unmatched in enterprise document software.', status: 'active', created_at: '2026-01-10T10:00:00Z' },
    { id: 2, name: 'Marcus Vance', role: 'Lead Software Architect', company: 'Apex Cloud Solutions', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', rating: 5, feedback: 'Managing project specifications, BRDs, and technical certificates used to take hours. Now it takes seconds.', status: 'active', created_at: '2026-01-12T10:00:00Z' },
    { id: 3, name: 'Sophia Martinez', role: 'Senior Legal Consultant', company: 'Horizon Legal Group', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', rating: 5, feedback: 'The role-based security and trash recovery give us total peace of mind for sensitive legal agreements.', status: 'active', created_at: '2026-01-15T10:00:00Z' },
  ],

  companies: [
    { id: 1, name: 'Google Cloud', logo: '☁️ Google Cloud', website: 'https://cloud.google.com', displayOrder: 1, status: 'active', created_at: '2026-01-10T10:00:00Z' },
    { id: 2, name: 'Microsoft Azure', logo: '🔷 Microsoft', website: 'https://azure.microsoft.com', displayOrder: 2, status: 'active', created_at: '2026-01-12T10:00:00Z' },
    { id: 3, name: 'AWS Enterprise', logo: '📦 AWS Cloud', website: 'https://aws.amazon.com', displayOrder: 3, status: 'active', created_at: '2026-01-15T10:00:00Z' },
    { id: 4, name: 'Stripe Security', logo: '💳 Stripe', website: 'https://stripe.com', displayOrder: 4, status: 'active', created_at: '2026-01-18T10:00:00Z' },
    { id: 5, name: 'Vercel Edge', logo: '▲ Vercel', website: 'https://vercel.com', displayOrder: 5, status: 'active', created_at: '2026-01-20T10:00:00Z' },
  ],

  stats: {
    documentsStored: '500,000+',
    organizations: '1,200+',
    countries: '45+',
    activeUsers: '25,000+',
    encryption: '256-Bit AES',
    enabled: true,
  },

  faqs: [
    { id: 1, question: 'How secure is my data in DocVault?', answer: 'All stored documents are encrypted at rest using AES-256 bit encryption and protected with role-based access control and disk isolation.', displayOrder: 1, status: 'active', created_at: '2026-01-10T10:00:00Z' },
    { id: 2, question: 'What file formats are supported?', answer: 'DocVault natively supports PDFs, Microsoft Word (.docx), Excel spreadsheets (.xlsx), PowerPoint presentations, images (PNG, JPG), and plain text documents.', displayOrder: 2, status: 'active', created_at: '2026-01-12T10:00:00Z' },
    { id: 3, question: 'Can I restore deleted documents?', answer: 'Yes! Accidentally deleted files are held securely in your recycle trash bin, where you can restore them with a single click.', displayOrder: 3, status: 'active', created_at: '2026-01-15T10:00:00Z' },
    { id: 4, question: 'Can I access DocVault on mobile devices?', answer: 'Absolutely. DocVault is built with a responsive glassmorphism interface optimized for desktop, tablet, and mobile browsers.', displayOrder: 4, status: 'active', created_at: '2026-01-18T10:00:00Z' },
  ],

  cta: {
    heading: 'Time to Protect Your Digital Documents',
    description: 'Stop searching through scattered computer folders. Experience 100ms instant retrieval and military-grade file security now.',
    primaryBtnText: 'Create Free Account',
    primaryBtnUrl: '/register',
    secondaryBtnText: 'Sign In to Vault',
    secondaryBtnUrl: '/login',
    bgImage: '/images/hero_vault_bg.png',
    enabled: true,
  },

  footer: {
    companyName: 'DocVault Systems Inc.',
    logo: '🛡️ DocVault',
    address: '100 Cyber Vault Way, Tech District, SF, CA 94107',
    phone: '+1 (800) 555-DOCS',
    email: 'support@docvault.io',
    copyright: '© 2026 DocVault Systems Inc. All rights reserved.',
  },

  socials: [
    { id: 1, platform: 'GitHub', icon: 'Github', url: 'https://github.com', status: 'active' },
    { id: 2, platform: 'Twitter / X', icon: 'Twitter', url: 'https://twitter.com', status: 'active' },
    { id: 3, platform: 'LinkedIn', icon: 'Linkedin', url: 'https://linkedin.com', status: 'active' },
    { id: 4, platform: 'YouTube', icon: 'Youtube', url: 'https://youtube.com', status: 'active' },
  ],

  navigation: [
    { id: 1, name: 'Home', url: '/', displayOrder: 1, status: 'active' },
    { id: 2, name: 'Features', url: '#features', displayOrder: 2, status: 'active' },
    { id: 3, name: 'Categories', url: '#categories', displayOrder: 3, status: 'active' },
    { id: 4, name: "Who It's For", url: '#solutions', displayOrder: 4, status: 'active' },
    { id: 5, name: 'FAQ', url: '#faq', displayOrder: 5, status: 'active' },
  ],

  carousel: [
    {
      id: 1,
      badge: '★ NEXT-GEN DOCUMENT MANAGEMENT',
      title: 'One Secure AI Vault for',
      highlight: 'Critical Paperwork & Digital Assets',
      sub: 'DocVault is your enterprise-grade personal document repository. Store, categorize, and locate academic credentials, career resumes, property papers, and client requirement files in one central vault.',
      slideImage: '/images/carousel/slide_1.png',
      primaryCtaLabel: 'Explore DocVault',
      primaryCtaHref: '/register',
      secondaryCtaLabel: 'Sign In to Vault',
      secondaryCtaHref: '/login',
      accentGradient: 'from-[#1B664B] to-[#14523C]',
      accentColor: 'text-[#1B664B]',
      displayOrder: 1,
      status: 'active',
      created_at: '2026-01-10T10:00:00Z',
    },
    {
      id: 2,
      badge: '⚡ 3-STEP SEAMLESS AUTOMATION',
      title: 'How DocVault Works',
      highlight: '3 Easy Steps to Secure & Organize',
      sub: 'Transform chaotic computer folders into a structured digital vault in seconds. Our automated pipeline handles uploading, indexing, and instant retrieval effortlessly.',
      slideImage: '/images/carousel/slide_2.png',
      primaryCtaLabel: 'Start 3-Step Setup',
      primaryCtaHref: '/register',
      secondaryCtaLabel: 'Sign In to Vault',
      secondaryCtaHref: '/login',
      accentGradient: 'from-[#1B664B] to-[#14523C]',
      accentColor: 'text-[#1B664B]',
      displayOrder: 2,
      status: 'active',
      created_at: '2026-01-12T10:00:00Z',
    },
    {
      id: 3,
      badge: '📁 MULTI-FORMAT SUPPORTED VAULT',
      title: 'Organize Every Document',
      highlight: 'From Passports to Project BRDs',
      sub: 'DocVault natively indexes all key personal, academic, and business paper trails with live in-browser preview and mime-type detection.',
      slideImage: '/images/carousel/slide_3.png',
      primaryCtaLabel: 'Browse Document Modules',
      primaryCtaHref: '/register',
      secondaryCtaLabel: 'Sign In to Vault',
      secondaryCtaHref: '/login',
      accentGradient: 'from-[#1B664B] to-[#14523C]',
      accentColor: 'text-[#1B664B]',
      displayOrder: 3,
      status: 'active',
      created_at: '2026-01-15T10:00:00Z',
    },
    {
      id: 4,
      badge: '🛡️ MILITARY-GRADE ENCRYPTION',
      title: 'Enterprise Architecture',
      highlight: 'Built for Total Privacy & Control',
      sub: 'Rest easy knowing your files are guarded with bank-level encryption, multi-tenant workspace separation, and robust audit trails.',
      slideImage: '/images/carousel/slide_4.png',
      primaryCtaLabel: 'Create Free Account',
      primaryCtaHref: '/register',
      secondaryCtaLabel: 'Sign In to Vault',
      secondaryCtaHref: '/login',
      accentGradient: 'from-[#1B664B] to-[#14523C]',
      accentColor: 'text-[#1B664B]',
      displayOrder: 4,
      status: 'active',
      created_at: '2026-01-18T10:00:00Z',
    },
    {
      id: 5,
      badge: '🚀 REALTIME CLOUD STREAMING',
      title: 'Seamless Upload Pipeline',
      highlight: 'Instant Versioning & Live Audit',
      sub: 'Experience ultra-fast drag and drop file ingestion with live progress indicators, mime validation, and full document version tracking.',
      slideImage: '/images/carousel/slide_5.png',
      primaryCtaLabel: 'Try Cloud Pipeline',
      primaryCtaHref: '/register',
      secondaryCtaLabel: 'Sign In to Vault',
      secondaryCtaHref: '/login',
      accentGradient: 'from-[#1B664B] to-[#14523C]',
      accentColor: 'text-[#1B664B]',
      displayOrder: 5,
      status: 'active',
      created_at: '2026-01-20T10:00:00Z',
    },
  ],
};

const STORAGE_KEY = 'docvault_dynamic_cms_store_v2';

class CMSStoreManager {
  private data: CMSData;
  private listeners: Array<(data: CMSData) => void> = [];

  constructor() {
    this.data = this.loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.data = this.loadFromStorage();
          this.notify();
        }
      });
    }
  }

  private loadFromStorage(): CMSData {
    if (typeof window === 'undefined') return DEFAULT_CMS_DATA;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_CMS_DATA;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CMS_DATA, ...parsed };
    } catch (e) {
      return DEFAULT_CMS_DATA;
    }
  }

  public saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        window.dispatchEvent(new Event('dms_cms_updated'));
      } catch (e) {}
    }
    this.notify();
  }

  public subscribe(listener: (data: CMSData) => void): () => void {
    this.listeners.push(listener);
    listener(this.data);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l({ ...this.data }));
  }

  public getData(): CMSData {
    return { ...this.data };
  }

  public resetToDefault(): void {
    this.data = JSON.parse(JSON.stringify(DEFAULT_CMS_DATA));
    this.saveToStorage();
  }

  public updateModule<K extends keyof CMSData>(moduleKey: K, payload: CMSData[K]): void {
    this.data[moduleKey] = payload;
    this.saveToStorage();
  }
}

export const cmsStore = new CMSStoreManager();
