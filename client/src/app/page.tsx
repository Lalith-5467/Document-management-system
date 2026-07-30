'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AICarouselSlider from '@/components/AICarouselSlider';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck, FolderGit2, GraduationCap, FileText, Award, Briefcase,
  UserCheck, Lock, Search, HardDrive, ArrowRight, CheckCircle2, Layers,
  Sparkles, Zap, Globe, Database, Star, ChevronDown, HelpCircle, Building2,
  Check, TrendingUp, Users, Clock, Shield
} from 'lucide-react';
import {
  cmsStore, CMSData, CMSFeature, CMSCategoryItem, CMSAudienceItem,
  CMSTestimonial, CMSTrustedCompany, CMSFAQ
} from '@/lib/cmsStore';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck, Lock, Search, Layers, Zap, FolderGit2, GraduationCap,
  FileText, Award, Briefcase, UserCheck, HardDrive, Database, Globe
};

export default function HomePage() {
  const { user } = useAuth();
  const [cms, setCms] = useState<CMSData>(cmsStore.getData());
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const unsub = cmsStore.subscribe((data) => {
      setCms(data);
    });
    return unsub;
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

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      {/* 1. Fixed Glassmorphism Header */}
      <Navbar />

      {/* 2. Hero Carousel Section (100% UNTOUCHED & PRESERVED) */}
      {cms.hero?.enabled !== false && (
        <section className="relative pt-16 z-10 w-full overflow-hidden bg-white border-b border-slate-200/80">
          <AICarouselSlider />
        </section>
      )}



      {/* 5. Enterprise Capabilities / Features Section */}
      {activeFeatures.length > 0 && (
        <section id="features" className="py-24 bg-[#F8FAFC] border-b border-slate-200/80 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center max-w-2xl mx-auto space-y-3.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#FF6B00] font-mono px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 inline-block shadow-2xs">
                Enterprise Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-auth-heading">
                Built to Store, Organize & Protect
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                Everything you need to eliminate physical paper clutter and maintain structured digital records.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeFeatures.map((feat) => (
                <div
                  key={feat.id}
                  className="landing-card relative p-7 space-y-5 group bg-white border border-slate-200/80 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 rounded-[20px] overflow-hidden"
                >
                  {/* Animated Box Outline */}
                  <div className="absolute inset-0 rounded-[20px] border-2 border-transparent group-hover:border-[#FF6B00] opacity-0 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100 pointer-events-none z-20" />
                  
                  {/* Subtle Glow Background on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

                  <div className="relative z-10 w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-200/80 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all duration-300">
                    {renderIcon(feat.icon, Zap)}
                  </div>
                  <div className="relative z-10 space-y-2.5">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-[#FF6B00] transition-colors font-auth-heading tracking-tight">
                      {feat.title}
                    </h3>
                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                      {feat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Document Categories Section */}
      {activeCategories.length > 0 && (
        <section id="categories" className="py-20 bg-white border-b border-slate-200/80 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#FF6B00] font-mono px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 inline-block shadow-2xs">
                Document Categorization
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Pre-Structured Modules for Every Paper Trail
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                DocVault keeps your credentials and agreements categorized cleanly, preventing chaotic folders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href="/register"
                  className="landing-card p-6 border-t-4 border-t-[#FF6B00] flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform bg-gradient-to-tr from-[#FF6B00] to-[#F97316]"
                      >
                        {renderIcon(cat.icon, UserCheck)}
                      </div>
                      <span className="text-[10px] font-black px-3 py-1 rounded-full bg-orange-50 text-[#FF6B00] border border-orange-200 font-mono">
                        {cat.documentCount} docs
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#FF6B00] transition-colors flex items-center justify-between">
                        {cat.name}
                        <ArrowRight className="w-4 h-4 text-[#FF6B00] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">{cat.description}</p>
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
        <section id="solutions" className="py-24 bg-white border-b border-slate-200/80 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00] font-mono px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 inline-block shadow-2xs">
                WHO IT'S FOR
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Tailored Solutions Built for Every Document Workflow
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium">
                Whether you are applying for jobs, submitting project deliverables, or securing personal estate records, DocVault provides custom-tailored indexing for your exact use case.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activeAudience.map((userGroup) => {
                return (
                  <div
                    key={userGroup.id}
                    className="landing-card group relative p-8 rounded-[24px] transition-all duration-500 flex flex-col h-full bg-white border border-slate-200/80 shadow-sm hover:shadow-2xl hover:-translate-y-1"
                  >
                    {/* Animated Box Outline */}
                    <div className="absolute inset-0 rounded-[24px] border-2 border-transparent group-hover:border-[#FF6B00] transition-colors duration-300 pointer-events-none z-20" />
                    
                    {/* Subtle Glow Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 rounded-[24px]" />

                    <div className="space-y-6 relative z-10 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all duration-300 bg-orange-50 text-[#FF6B00] border border-orange-200/80">
                          {renderIcon(userGroup.icon, GraduationCap)}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-slate-500 bg-slate-100 border border-slate-200/80 shadow-xs">
                          {userGroup.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-[#FF6B00] transition-colors mb-2 tracking-tight">
                          {userGroup.title}
                        </h3>
                        <p className="text-[13px] leading-relaxed font-medium text-slate-600">
                          {userGroup.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-5 border-t border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Key Capabilities
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(userGroup.features || []).map((feat, fIdx) => (
                            <div
                              key={fIdx}
                              className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 group-hover:border-orange-100 group-hover:bg-orange-50/80 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#FF6B00]" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 relative z-10 mt-auto">
                      <Link
                        href="/register"
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 bg-white border-2 border-slate-100 text-slate-700 hover:text-[#FF6B00] hover:border-[#FF6B00] hover:bg-orange-50 hover:shadow-lg hover:shadow-orange-500/20 group/btn"
                      >
                        <span>Start Vaulting as {userGroup.title.split('&')[0].trim()}</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
        <section id="faq" className="py-12 md:py-16 bg-white border-b border-slate-200/80 relative z-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00] font-mono px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 inline-block shadow-2xs">
                FREQUENTLY ASKED QUESTIONS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Got Questions? We Have Answers.
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Everything you need to know about DocVault document management, encryption, and features.
              </p>
            </div>

            <div className="space-y-4">
              {activeFaqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full py-5 px-6 sm:px-8 text-left flex items-center justify-between gap-4 font-extrabold text-sm sm:text-base text-slate-900 hover:text-[#FF6B00] transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0 border border-orange-200/80 group-hover:scale-110 transition-transform">
                          <HelpCircle className="w-4 h-4 icon-hover-rotate" />
                        </div>
                        <span className="font-extrabold">{faq.question}</span>
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:bg-orange-50 group-hover:border-orange-200 transition-colors">
                        <ChevronDown className={`w-4 h-4 text-[#FF6B00] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-6 sm:px-8 pb-6 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-4 animate-fade-up">
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
        <section className="py-20 bg-white relative z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-[#FF6B00] via-[#F97316] to-[#FF8A00] rounded-[24px] p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl shadow-orange-500/25 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 rounded-full bg-black/10 blur-2xl pointer-events-none" />

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white relative z-10">
                {cms.cta?.heading || 'Time to Protect Your Digital Documents'}
              </h2>
              <p className="text-white/90 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed font-medium relative z-10">
                {cms.cta?.description || 'Stop searching through scattered computer folders. Experience 100ms instant retrieval and military-grade file security now.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2 relative z-10">
                <Link
                  href={cms.cta?.primaryBtnUrl || '/register'}
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-xs font-black text-[#FF6B00] bg-white hover:bg-orange-50 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  {cms.cta?.primaryBtnText || 'Create Free Account'}
                  <ArrowRight className="w-4 h-4 text-[#FF6B00]" />
                </Link>
                {cms.cta?.secondaryBtnText && (
                  <Link
                    href={cms.cta?.secondaryBtnUrl || '/login'}
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-black text-white bg-[#121214] hover:bg-black border border-white/20 rounded-2xl transition-all hover:scale-105 active:scale-95"
                  >
                    {cms.cta.secondaryBtnText}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 10. Footer */}
      <Footer />
    </div>
  );
}
