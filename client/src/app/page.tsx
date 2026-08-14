'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AICarouselSlider from '@/components/AICarouselSlider';
import PortraitCardSwipe from '@/components/PortraitCardSwipe';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck, FolderGit2, GraduationCap, FileText, Award, Briefcase,
  UserCheck, Lock, Search, HardDrive, ArrowRight, CheckCircle2, Layers,
  Sparkles, Zap, Globe, Database, Star, ChevronDown, HelpCircle, Building2,
  Check, TrendingUp, Users, Clock, Shield, ChevronUp
} from 'lucide-react';
import {
  cmsStore, CMSData, CMSFeature, CMSCategoryItem, CMSAudienceItem,
  CMSTestimonial, CMSTrustedCompany, CMSFAQ, DEFAULT_CMS_DATA
} from '@/lib/cmsStore';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck, Lock, Search, Layers, Zap, FolderGit2, GraduationCap,
  FileText, Award, Briefcase, UserCheck, HardDrive, Database, Globe
};

export default function HomePage() {
  const { user } = useAuth();
  const [cms, setCms] = useState<CMSData>(() => cmsStore.getData());
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsub = cmsStore.subscribe((data) => {
      setCms(data);
    });

    const handleCmsUpdate = () => {
      setCms(cmsStore.getData());
    };
    window.addEventListener('dms_cms_updated', handleCmsUpdate);

    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      unsub();
      window.removeEventListener('dms_cms_updated', handleCmsUpdate);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const activeFeatures = (cms.features || [])
    .filter(f => f.status === 'active')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const activeCategories = (cms.categories || [])
    .filter(c => c.status === 'active')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const activeAudience = (cms.audience || [])
    .filter(a => a.status === 'active')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const activeCompanies = (cms.companies || [])
    .filter(c => c.status === 'active')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const activeFaqs = (cms.faqs || [])
    .filter(f => f.status === 'active')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const renderIcon = (iconName: string, fallback: React.ComponentType<{ className?: string }> = Zap) => {
    const Component = ICON_MAP[iconName] || fallback;
    return <Component className="w-5 h-5 icon-hover-rotate" />;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 rounded-3xl bg-[#1B664B] flex items-center justify-center text-white shadow-xl shadow-emerald-950/20 animate-pulse border border-[#D1EBE1]">
          <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h2 className="mt-6 text-sm font-black text-slate-900 tracking-[0.2em] uppercase font-auth-heading">
          DocVault
        </h2>
        <div className="flex items-center gap-1.5 mt-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1B664B] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#1B664B] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#1B664B] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans relative selection:bg-[#1B664B] selection:text-white">
      {/* 1. Fixed Glassmorphism Header */}
      <Navbar />

      {/* 2. Dynamic Hero CMS Section */}
      {cms.hero?.enabled !== false && (
        <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 z-10 w-full overflow-hidden bg-white">
          {/* Ambient Glowing Floating Orbs */}
          <div className="absolute top-12 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none animate-float-reverse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />

          {/* Background Image / Glow */}
          <div className="absolute inset-0 z-0">
            {cms.hero.bgImage ? (
              <>
                <img src={cms.hero.bgImage} alt="Background" className="w-full h-full object-cover opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/90 to-white" />
              </>
            ) : (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-emerald-50/50 to-transparent" />
            )}
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8 animate-fade-up">
            <div className="space-y-4 max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                {cms.hero.title}{' '}
                <span className="block text-[#16A34A]">
                  {cms.hero.highlight}
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                {cms.hero.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={cms.hero.primaryBtnUrl || '/register'}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#166534] text-white font-black shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span>{cms.hero.primaryBtnText || 'Get Started'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={cms.hero.secondaryBtnUrl || '/login'}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-slate-200 text-slate-700 font-black hover:border-[#16A34A] hover:text-[#16A34A] hover:bg-[#F0FDF4] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-xs hover:shadow-md"
              >
                {cms.hero.secondaryBtnText || 'Sign In'}
              </Link>
            </div>

            {cms.hero.dashboardImage && (
              <div className="pt-12 md:pt-16 max-w-5xl mx-auto relative">
                {/* Floating Interactive Security & Speed Badges */}
                <div className="hidden sm:flex absolute -top-2 -left-4 md:-left-8 z-30 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-900/10 items-center gap-2.5 animate-float-slow hover:scale-105 transition-transform duration-300 cursor-default">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-black text-slate-800 tracking-tight">⚡ 100ms Instant Search</span>
                </div>

                <div className="hidden sm:flex absolute -bottom-3 -right-4 md:-right-8 z-30 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-200/80 shadow-xl shadow-emerald-600/15 items-center gap-2.5 animate-float-reverse hover:scale-105 transition-transform duration-300 cursor-default">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#1B664B] flex items-center justify-center border border-emerald-200/60">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-black text-slate-800 tracking-tight">🛡️ AES-256 Cloud Vault</span>
                </div>

                {/* Dashboard Image Card with 3D Hover & Ambient Glow */}
                <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-900/10 bg-white group hover:shadow-emerald-600/15 hover:border-emerald-200 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent pointer-events-none z-10" />
                  <img
                    src={cms.hero.dashboardImage}
                    alt="Dashboard Preview"
                    className="w-full h-auto object-cover group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. Hero Carousel Section */}
      {cms.carousel && cms.carousel.filter(c => c.status === 'active').length > 0 && (
        <section className={`relative z-10 w-full overflow-hidden bg-slate-50/50 border-b border-slate-200/80 ${cms.hero?.enabled === false ? 'pt-16 lg:pt-12 pb-0' : 'pt-8 pb-0'}`}>
          <AICarouselSlider />
        </section>
      )}

      {/* 5. Enterprise Capabilities / Features Section */}
      {activeFeatures.length > 0 && (
        <section id="features" className="scroll-mt-24 pt-12 pb-16 bg-[#F8FAFC] border-b border-slate-200/80 relative z-10 overflow-hidden">
          {/* Ambient Background Light */}
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-emerald-400/8 rounded-full blur-3xl pointer-events-none animate-float-slow" />
          <div className="absolute bottom-10 -left-20 w-80 h-80 bg-emerald-400/8 rounded-full blur-3xl pointer-events-none animate-float-reverse" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
            <div className="text-center max-w-2xl mx-auto space-y-3.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#1B664B] font-mono px-4 py-1.5 rounded-full bg-[#E8F5F0] border border-[#D1EBE1] inline-flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#1B664B] animate-badge-sparkle" />
                <span>Enterprise Capabilities</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-auth-heading">
                Built to Store, Organize & Protect
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                Everything you need to eliminate physical paper clutter and maintain structured digital records.
              </p>
            </div>

            <PortraitCardSwipe features={activeFeatures} />
          </div>
        </section>
      )}

      {/* 6. Document Categories Section */}
      {activeCategories.length > 0 && (
        <section id="categories" className="scroll-mt-24 py-16 bg-white border-b border-slate-200/80 relative z-10 overflow-hidden">
          {/* Ambient Background Light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#1B664B] font-mono px-4 py-1.5 rounded-full bg-[#E8F5F0] border border-[#D1EBE1] inline-flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#1B664B] animate-badge-sparkle" />
                <span>Document Categorization</span>
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Pre-Structured Modules for Every Paper Trail
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                DocVault keeps your credentials and agreements categorized cleanly, preventing chaotic folders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCategories.map((cat, idx) => (
                <Link
                  key={cat.id}
                  href="/register"
                  className="landing-card p-6 border-t-4 border-t-[#1B664B] flex flex-col justify-between group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 bg-[#1B664B]"
                      >
                        {renderIcon(cat.icon, UserCheck)}
                      </div>
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-[#E8F5F0] text-[#1B664B] border border-[#D1EBE1] font-mono group-hover:scale-105 group-hover:bg-[#D1EBE1] transition-all">
                        {cat.documentCount} docs
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-[#1B664B] transition-colors flex items-center justify-between">
                        {cat.name}
                        <ArrowRight className="w-4 h-4 text-[#1B664B] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed mt-1 font-medium">{cat.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Audience & Solutions Section */}
      {activeAudience.length > 0 && (
        <section id="solutions" className="scroll-mt-24 py-16 bg-[#F8FAFC] border-b border-slate-200/80 relative z-10 overflow-hidden">
          {/* Ambient Background Glow */}
          <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-500/6 rounded-full blur-3xl pointer-events-none animate-float-slow" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-400/6 rounded-full blur-3xl pointer-events-none animate-float-reverse" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#1B664B] font-mono px-4 py-1.5 rounded-full bg-[#E8F5F0] border border-[#D1EBE1] inline-flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#1B664B] animate-badge-sparkle" />
                <span>WHO IT'S FOR</span>
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Tailored Solutions Built for Every Document Workflow
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium">
                Whether you are applying for jobs, submitting project deliverables, or securing personal estate records, DocVault provides custom-tailored indexing for your exact use case.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activeAudience.map((userGroup, idx) => {
                return (
                  <div
                    key={userGroup.id}
                    className="landing-card group relative p-8 rounded-[24px] transition-all duration-500 flex flex-col h-full bg-white border border-slate-200/80 shadow-sm hover:shadow-2xl hover:-translate-y-2 cursor-default"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* Animated Box Outline */}
                    <div className="absolute inset-0 rounded-[24px] border-2 border-transparent group-hover:border-[#1B664B] transition-colors duration-300 pointer-events-none z-20" />
                    
                    {/* Subtle Glow Background */}
                    <div className="absolute inset-0 bg-[#E8F5F0]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 rounded-[24px]" />

                    <div className="space-y-6 relative z-10 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-300 bg-[#E8F5F0] text-[#1B664B] border border-[#D1EBE1]">
                          {renderIcon(userGroup.icon, GraduationCap)}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-slate-500 bg-slate-100 border border-slate-200/80 shadow-xs group-hover:border-[#D1EBE1] group-hover:text-[#1B664B] transition-colors">
                          {userGroup.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#1B664B] transition-colors mb-2 tracking-tight">
                          {userGroup.title}
                        </h3>
                        <p className="text-sm leading-relaxed font-medium text-slate-600">
                          {userGroup.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-5 border-t border-slate-100">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                          Key Capabilities
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(userGroup.features || []).map((feat, fIdx) => (
                            <div
                              key={fIdx}
                              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 group-hover:border-[#D1EBE1] group-hover:bg-[#E8F5F0] group-hover:text-slate-800 hover:scale-105 transition-all duration-200 cursor-default"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#1B664B]" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 relative z-10 mt-auto">
                      <Link
                        href="/register"
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 bg-white border-2 border-slate-100 text-slate-700 hover:text-[#1B664B] hover:border-[#1B664B] hover:bg-[#E8F5F0] hover:shadow-lg group/btn"
                      >
                        <span>Start Vaulting as {userGroup.title.split('&')[0].trim()}</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-200" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 8. FAQ Accordion Section */}
      {activeFaqs.length > 0 && (
        <section id="faq" className="scroll-mt-24 py-16 bg-white border-b border-slate-200/80 relative z-10 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />

          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
            <div className="text-center space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#1B664B] font-mono px-4 py-1.5 rounded-full bg-[#E8F5F0] border border-[#D1EBE1] inline-flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#1B664B] animate-badge-sparkle" />
                <span>FREQUENTLY ASKED QUESTIONS</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Got Questions? We Have Answers.
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                Everything you need to know about DocVault document management, encryption, and features.
              </p>
            </div>

            <div className="space-y-4">
              {activeFaqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#D1EBE1] transition-all duration-300 overflow-hidden group"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full py-5 px-6 sm:px-8 text-left flex items-center justify-between gap-4 font-extrabold text-base sm:text-lg text-slate-900 hover:text-[#1B664B] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#E8F5F0] text-[#1B664B] flex items-center justify-center shrink-0 border border-[#D1EBE1] group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                          <HelpCircle className="w-4 h-4 icon-hover-rotate" />
                        </div>
                        <span className="font-extrabold">{faq.question}</span>
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-[#E8F5F0] group-hover:border-[#D1EBE1] transition-colors">
                        <ChevronDown className={`w-4 h-4 text-[#1B664B] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-6 sm:px-8 pb-6 text-sm sm:text-base text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-4 animate-fade-up">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 9. Call To Action (CTA) Section */}
      {cms.cta?.enabled !== false && (
        <section className="py-20 bg-white relative z-10 overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-[28px] p-8 sm:p-14 text-center text-white space-y-6 shadow-xl overflow-hidden bg-[#1B664B]">
              {cms.cta?.bgImage && (
                <img src={cms.cta.bgImage} alt="CTA Background" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay" />
              )}
              {/* Floating Ambient Glass Circles */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-white/15 blur-2xl pointer-events-none animate-float-slow" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 rounded-full bg-black/15 blur-2xl pointer-events-none animate-float-reverse" />

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white relative z-10 leading-tight">
                {cms.cta?.heading || 'Time to Protect Your Digital Documents'}
              </h2>
              <p className="text-white/95 max-w-2xl mx-auto text-xs sm:text-sm lg:text-base leading-relaxed font-medium relative z-10">
                {cms.cta?.description || 'Stop searching through scattered computer folders. Experience 100ms instant retrieval and military-grade file security now.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-3 relative z-10">
                <Link
                  href={cms.cta?.primaryBtnUrl || '/register'}
                  className="inline-flex items-center gap-2 px-8 py-4 text-xs sm:text-sm font-black text-[#1B664B] bg-white hover:bg-[#E8F5F0] rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                >
                  <span>{cms.cta?.primaryBtnText || 'Create Free Account'}</span>
                  <ArrowRight className="w-4 h-4 text-[#1B664B] group-hover:translate-x-1 transition-transform" />
                </Link>
                {cms.cta?.secondaryBtnText && (
                  <Link
                    href={cms.cta?.secondaryBtnUrl || '/login'}
                    className="inline-flex items-center gap-2 px-7 py-4 text-xs sm:text-sm font-black text-white bg-slate-950/80 hover:bg-black border border-white/25 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 shadow-md"
                  >
                    {cms.cta.secondaryBtnText}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 10. Interactive Floating Scroll-to-Top Action Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-200/80 text-[#1B664B] shadow-xl shadow-emerald-600/20 hover:bg-[#1B664B] hover:text-white hover:border-[#1B664B] hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer animate-zoom-in"
          aria-label="Scroll to top of page"
        >
          <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-200" />
        </button>
      )}

      {/* 11. Footer */}
      <Footer />
    </div>
  );
}
