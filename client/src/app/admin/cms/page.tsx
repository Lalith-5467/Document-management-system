'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Layout, ShieldCheck, Sparkles, Plus, Edit2, Trash2, Eye, EyeOff, Search,
  ArrowUpRight, CheckCircle2, AlertCircle, AlertTriangle, X, Save, RefreshCw, Upload, Image as ImageIcon,
  Star, HelpCircle, Building2, Phone, Mail, MapPin, Globe, ChevronRight, ChevronLeft,
  Lock, Zap, RotateCcw, Award, Briefcase, GraduationCap, UserCheck, Layers, FileText, Play
} from 'lucide-react';
import {
  cmsStore, CMSData, CMSHero, CMSFeature, CMSCategoryItem, CMSScreenshot,
  CMSTestimonial, CMSTrustedCompany, CMSStatistics, CMSFAQ, CMSCTA, CMSFooter,
  CMSSocial, CMSNavItem, CMSCarouselSlide
} from '@/lib/cmsStore';

const ICON_OPTIONS = [
  'ShieldCheck', 'Lock', 'Search', 'Layers', 'Zap', 'FolderGit2', 'GraduationCap',
  'FileText', 'Award', 'Briefcase', 'UserCheck', 'HardDrive', 'Database', 'Globe',
  'Github', 'Twitter', 'Linkedin', 'Youtube', 'Star', 'HelpCircle', 'Building2'
];

const COLOR_OPTIONS = ['#3B82F6', '#10B981', '#8B5CF6', '#1B664B', '#EF4444', '#EC4899', '#06B6D4', '#6366F1', '#14B8A6', '#64748B'];

export default function AdminCmsPage() {
  const [cms, setCms] = useState<CMSData>(cmsStore.getData());
  const [activeTab, setActiveTab] = useState<string>('hero');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [popupNotif, setPopupNotif] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  // Sub-module modal state
  const [modal, setModal] = useState<{ type: 'create' | 'edit' | 'view' | 'delete'; module: string; data?: any } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // Form states
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const unsub = cmsStore.subscribe((data) => {
      setCms(data);
    });
    return unsub;
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const showPopupNotif = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setPopupNotif({ title, message, type });
    setTimeout(() => setPopupNotif(null), 3500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({ ...prev, [fieldName]: reader.result }));
        showToast(`Image uploaded for ${fieldName}!`);
      };
      reader.readAsDataURL(file);
    }
  };

  // -------------------------------------------------------------
  // HERO UPDATE HANDLER
  // -------------------------------------------------------------
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    cmsStore.updateModule('hero', cms.hero);
    showPopupNotif('Hero Section Saved!', 'Hero section headline, subtitle, and CTA controls updated successfully.');
    setSubmitting(false);
  };

  // -------------------------------------------------------------
  // STATS UPDATE HANDLER
  // -------------------------------------------------------------
  const handleSaveStats = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    cmsStore.updateModule('stats', cms.stats);
    showPopupNotif('Statistics Metrics Saved!', 'Statistics metrics and telemetry numbers updated successfully.');
    setSubmitting(false);
  };

  // -------------------------------------------------------------
  // CTA UPDATE HANDLER
  // -------------------------------------------------------------
  const handleSaveCTA = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    cmsStore.updateModule('cta', cms.cta);
    showPopupNotif('CTA Section Saved!', 'Call To Action section controls, descriptions, and button links updated successfully.');
    setSubmitting(false);
  };

  // -------------------------------------------------------------
  // FOOTER UPDATE HANDLER
  // -------------------------------------------------------------
  const handleSaveFooter = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    cmsStore.updateModule('footer', cms.footer);
    showPopupNotif('Footer Information Saved!', 'Footer branding, contact details, and copyright information updated successfully.');
    setSubmitting(false);
  };

  // -------------------------------------------------------------
  // ARRAY MODULE CRUD HANDLER (Features, Categories, Screenshots, etc)
  // -------------------------------------------------------------
  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const moduleKey = modal?.module as keyof CMSData;
    const currentList = Array.isArray(cms[moduleKey]) ? [...(cms[moduleKey] as any[])] : [];

    if (modal?.type === 'create') {
      const newItem = {
        ...formData,
        id: Date.now(),
        displayOrder: formData.displayOrder || currentList.length + 1,
        status: formData.status || 'active',
        created_at: new Date().toISOString(),
      };
      const updated = [newItem, ...currentList];
      cmsStore.updateModule(moduleKey, updated);
      showToast(`Created item in ${modal.module.toUpperCase()} successfully!`);
    } else if (modal?.type === 'edit') {
      const updated = currentList.map(item => item.id === modal.data?.id ? { ...item, ...formData } : item);
      cmsStore.updateModule(moduleKey, updated);
      showToast(`Updated item in ${modal.module.toUpperCase()} successfully!`);
    }

    setSubmitting(false);
    setModal(null);
  };

  const handleDeleteItem = () => {
    if (!modal?.data || !modal?.module) return;
    setSubmitting(true);
    const moduleKey = modal.module as keyof CMSData;
    const currentList = Array.isArray(cms[moduleKey]) ? [...(cms[moduleKey] as any[])] : [];
    const updated = currentList.filter(item => item.id !== modal.data.id);
    cmsStore.updateModule(moduleKey, updated);
    showToast(`Deleted item from ${modal.module.toUpperCase()} successfully!`);
    setSubmitting(false);
    setModal(null);
  };

  const handleToggleStatus = (moduleKey: keyof CMSData, id: number) => {
    const currentList = Array.isArray(cms[moduleKey]) ? [...(cms[moduleKey] as any[])] : [];
    const updated = currentList.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'active' ? 'inactive' : 'active';
        showToast(`Item status changed to ${nextStatus.toUpperCase()}`);
        return { ...item, status: nextStatus };
      }
      return item;
    });
    cmsStore.updateModule(moduleKey, updated);
  };

  const handleBulkDelete = (moduleKey: keyof CMSData) => {
    if (selectedIds.length === 0) return;
    const currentList = Array.isArray(cms[moduleKey]) ? [...(cms[moduleKey] as any[])] : [];
    const updated = currentList.filter(item => !selectedIds.includes(item.id));
    cmsStore.updateModule(moduleKey, updated);
    showToast(`Bulk deleted ${selectedIds.length} item(s)!`);
    setSelectedIds([]);
  };

  const MODULE_TABS = [
    { id: 'hero', name: '1. Hero Section', icon: Sparkles },
    { id: 'features', name: '2. Features', icon: Zap },
    { id: 'categories', name: '3. Categories', icon: Layers },
    { id: 'audience', name: "4. Who It's For", icon: UserCheck },
    { id: 'carousel', name: '5. Carousel Slides', icon: Play },
    { id: 'faqs', name: '6. FAQ', icon: HelpCircle },
    { id: 'cta', name: '7. Call To Action', icon: ArrowUpRight },
    { id: 'footer', name: '8. Footer', icon: MapPin },
    { id: 'socials', name: '9. Social Media', icon: Globe },
    { id: 'navigation', name: '10. Navigation', icon: Layout },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto text-slate-900 font-sans">
      {/* Popup Notification Modal */}
      {popupNotif && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-pop-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4 relative">
            <button
              onClick={() => setPopupNotif(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{popupNotif.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">{popupNotif.message}</p>
            </div>

            <button
              onClick={() => setPopupNotif(null)}
              className="w-full py-2.5 rounded-xl bg-[#1B664B] text-white font-black text-xs shadow-md shadow-emerald-950/20 hover:scale-105 transition cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toast && (
        <div className={`fixed top-20 right-6 z-[100000] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold border ${
          toast.type === 'success' ? 'bg-emerald-950/95 text-emerald-100 border-emerald-800/60' : 'bg-rose-950/95 text-rose-100 border-rose-800/60'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-900"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-extrabold uppercase tracking-widest text-[#1B664B] font-mono">
              DYNAMIC CMS ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-auth-heading">
            <Layout className="w-6 h-6 text-[#1B664B]" />
            <span>Landing Page CMS Admin Panel</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage every section, image, link, and feature on the public landing page in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { cmsStore.resetToDefault(); showToast('Reset all CMS modules to factory seed data!'); }}
            className="px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-400 hover:text-slate-900 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset to Defaults
          </button>
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-[#1B664B] hover:brightness-110 text-xs font-bold text-white shadow-lg shadow-emerald-950/20 transition flex items-center gap-1.5"
          >
            View Public Landing Page <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Module Subtabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100">
        {MODULE_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSearch(''); setSelectedIds([]); setPage(1); }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#1B664B] text-white shadow-md shadow-emerald-950/20'
                  : 'bg-slate-100/80 hover:bg-slate-100 text-slate-400 hover:text-slate-900 border border-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* MODULE 1: HERO MANAGEMENT */}
      {/* ============================================================ */}
      {activeTab === 'hero' && (
        <form onSubmit={handleSaveHero} className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1B664B]" />
                <span>Hero Section Content & CTA Controls</span>
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-bold">Enable Hero Section:</span>
                  <button
                    type="button"
                    onClick={() => setCms(p => ({ ...p, hero: { ...p.hero, enabled: !p.hero.enabled } }))}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${cms.hero.enabled ? 'bg-[#1B664B] shadow-md shadow-emerald-950/20' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-white transition-all shadow-sm ${cms.hero.enabled ? 'left-[22px]' : 'left-[3px]'}`} />
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#1B664B] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-emerald-950/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Main Headline</label>
                <input
                  type="text"
                  required
                  value={cms.hero.title}
                  onChange={e => setCms(p => ({ ...p, hero: { ...p.hero, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1B664B] font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Highlight Headline Gradient Text</label>
                <input
                  type="text"
                  required
                  value={cms.hero.highlight}
                  onChange={e => setCms(p => ({ ...p, hero: { ...p.hero, highlight: e.target.value } }))}
                  className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1B664B] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Hero Description Paragraph</label>
              <textarea
                rows={3}
                required
                value={cms.hero.subtitle}
                onChange={e => setCms(p => ({ ...p, hero: { ...p.hero, subtitle: e.target.value } }))}
                className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1B664B] resize-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Primary Button Text</label>
                <input
                  type="text"
                  value={cms.hero.primaryBtnText}
                  onChange={e => setCms(p => ({ ...p, hero: { ...p.hero, primaryBtnText: e.target.value } }))}
                  className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Primary Button URL</label>
                <input
                  type="text"
                  value={cms.hero.primaryBtnUrl}
                  onChange={e => setCms(p => ({ ...p, hero: { ...p.hero, primaryBtnUrl: e.target.value } }))}
                  className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Secondary Button Text</label>
                <input
                  type="text"
                  value={cms.hero.secondaryBtnText}
                  onChange={e => setCms(p => ({ ...p, hero: { ...p.hero, secondaryBtnText: e.target.value } }))}
                  className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Secondary Button URL</label>
                <input
                  type="text"
                  value={cms.hero.secondaryBtnUrl}
                  onChange={e => setCms(p => ({ ...p, hero: { ...p.hero, secondaryBtnUrl: e.target.value } }))}
                  className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-medium"
                />
              </div>
            </div>

            {/* Image Preview & Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Hero Background Image</span>
                <div className="h-28 rounded-xl bg-slate-100/80 overflow-hidden relative flex items-center justify-center border border-slate-200">
                  {cms.hero.bgImage ? (
                    <img src={cms.hero.bgImage} alt="Background" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xs text-slate-500">No Image Uploaded</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCms(p => ({ ...p, hero: { ...p.hero, bgImage: reader.result as string } }));
                        showToast(`Hero Background uploaded!`);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-2xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-2xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Dashboard Showcase Image</span>
                <div className="h-28 rounded-xl bg-slate-100/80 overflow-hidden relative flex items-center justify-center border border-slate-200">
                  {cms.hero.dashboardImage ? (
                    <img src={cms.hero.dashboardImage} alt="Dashboard" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xs text-slate-500">No Image Uploaded</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCms(p => ({ ...p, hero: { ...p.hero, dashboardImage: reader.result as string } }));
                        showToast(`Dashboard Image uploaded!`);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-2xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-2xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">All changes apply instantly to the public landing page upon saving.</span>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* ARRAY MODULES (FEATURES, CATEGORIES, SCREENSHOTS, TESTIMONIALS, COMPANIES, FAQS, SOCIALS, NAV) */}
      {/* ============================================================ */}
      {activeTab !== 'hero' && activeTab !== 'stats' && activeTab !== 'cta' && activeTab !== 'footer' && activeTab !== 'carousel' && (
        <RenderArrayModuleCRUD
          moduleKey={activeTab as keyof CMSData}
          dataList={(cms[activeTab as keyof CMSData] as any[]) || []}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          page={page}
          setPage={setPage}
          itemsPerPage={itemsPerPage}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onOpenCreate={() => {
            setFormData({});
            setModal({ type: 'create', module: activeTab });
          }}
          onOpenEdit={(item: any) => {
            setFormData({ ...item });
            setModal({ type: 'edit', module: activeTab, data: item });
          }}
          onOpenView={(item: any) => {
            setModal({ type: 'view', module: activeTab, data: item });
          }}
          onOpenDelete={(item: any) => {
            setModal({ type: 'delete', module: activeTab, data: item });
          }}
          onToggleStatus={(id: any) => handleToggleStatus(activeTab as keyof CMSData, id)}
          onBulkDelete={() => handleBulkDelete(activeTab as keyof CMSData)}
        />
      )}

      {/* ============================================================ */}
      {/* MODULE 7: STATISTICS */}
      {/* ============================================================ */}
      {activeTab === 'stats' && (
        <form onSubmit={handleSaveStats} className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Layout className="w-4 h-4 text-[#1B664B]" />
                <span>Statistics Counter Section Controls</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Documents Stored</label>
                <input
                  type="text"
                  required
                  value={cms.stats.documentsStored}
                  onChange={e => setCms(p => ({ ...p, stats: { ...p.stats, documentsStored: e.target.value } }))}
                  className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Organizations</label>
                <input
                  type="text"
                  required
                  value={cms.stats.organizations}
                  onChange={e => setCms(p => ({ ...p, stats: { ...p.stats, organizations: e.target.value } }))}
                  className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Countries Served</label>
                <input
                  type="text"
                  required
                  value={cms.stats.countries}
                  onChange={e => setCms(p => ({ ...p, stats: { ...p.stats, countries: e.target.value } }))}
                  className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Active Users</label>
                <input
                  type="text"
                  required
                  value={cms.stats.activeUsers}
                  onChange={e => setCms(p => ({ ...p, stats: { ...p.stats, activeUsers: e.target.value } }))}
                  className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Encryption Standard</label>
                <input
                  type="text"
                  required
                  value={cms.stats.encryption}
                  onChange={e => setCms(p => ({ ...p, stats: { ...p.stats, encryption: e.target.value } }))}
                  className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#1B664B] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-emerald-950/20 flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" /> Save Statistics Changes
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* MODULE 9: CTA SECTION */}
      {/* ============================================================ */}
      {activeTab === 'cta' && (
        <form onSubmit={handleSaveCTA} className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-[#1B664B]" />
                <span>Call To Action (CTA) Section Controls</span>
              </h2>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-bold">Enable CTA Section:</span>
                  <button
                    type="button"
                    onClick={() => setCms(p => ({ ...p, cta: { ...p.cta, enabled: !p.cta.enabled } }))}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${cms.cta.enabled ? 'bg-[#1B664B] shadow-md shadow-emerald-950/20' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-white transition-all shadow-sm ${cms.cta.enabled ? 'left-[22px]' : 'left-[3px]'}`} />
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#1B664B] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-emerald-950/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">CTA Headline</label>
              <input
                type="text"
                required
                value={cms.cta.heading}
                onChange={e => setCms(p => ({ ...p, cta: { ...p.cta, heading: e.target.value } }))}
                className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">CTA Description</label>
              <textarea
                rows={3}
                required
                value={cms.cta.description}
                onChange={e => setCms(p => ({ ...p, cta: { ...p.cta, description: e.target.value } }))}
                className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Primary Button Text</label>
                <input
                  type="text"
                  value={cms.cta.primaryBtnText}
                  onChange={e => setCms(p => ({ ...p, cta: { ...p.cta, primaryBtnText: e.target.value } }))}
                  className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Primary Button URL</label>
                <input
                  type="text"
                  value={cms.cta.primaryBtnUrl}
                  onChange={e => setCms(p => ({ ...p, cta: { ...p.cta, primaryBtnUrl: e.target.value } }))}
                  className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Secondary Button Text</label>
                <input
                  type="text"
                  value={cms.cta.secondaryBtnText}
                  onChange={e => setCms(p => ({ ...p, cta: { ...p.cta, secondaryBtnText: e.target.value } }))}
                  className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Secondary Button URL</label>
                <input
                  type="text"
                  value={cms.cta.secondaryBtnUrl}
                  onChange={e => setCms(p => ({ ...p, cta: { ...p.cta, secondaryBtnUrl: e.target.value } }))}
                  className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-medium"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">CTA Background Image</span>
              <div className="h-32 rounded-xl bg-slate-100/80 overflow-hidden relative flex items-center justify-center border border-slate-200">
                {cms.cta.bgImage ? (
                  <img src={cms.cta.bgImage} alt="CTA Background" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xs text-slate-500">No Background Image Uploaded</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setCms(p => ({ ...p, cta: { ...p.cta, bgImage: reader.result as string } }));
                      showToast(`CTA Background uploaded!`);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="text-2xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-2xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">All changes apply instantly to the public landing page upon saving.</span>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* MODULE 10: FOOTER */}
      {/* ============================================================ */}
      {activeTab === 'footer' && (
        <form onSubmit={handleSaveFooter} className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1B664B]" />
                <span>Footer Information & Branding Controls</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Company Name</label>
                <input
                  type="text"
                  required
                  value={cms.footer.companyName}
                  onChange={e => setCms(p => ({ ...p, footer: { ...p.footer, companyName: e.target.value } }))}
                  className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Contact Email</label>
                <input
                  type="email"
                  required
                  value={cms.footer.email}
                  onChange={e => setCms(p => ({ ...p, footer: { ...p.footer, email: e.target.value } }))}
                  className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={cms.footer.phone}
                  onChange={e => setCms(p => ({ ...p, footer: { ...p.footer, phone: e.target.value } }))}
                  className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Office Address</label>
                <input
                  type="text"
                  required
                  value={cms.footer.address}
                  onChange={e => setCms(p => ({ ...p, footer: { ...p.footer, address: e.target.value } }))}
                  className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Copyright Statement</label>
              <input
                type="text"
                required
                value={cms.footer.copyright}
                onChange={e => setCms(p => ({ ...p, footer: { ...p.footer, copyright: e.target.value } }))}
                className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-medium"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#1B664B] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-emerald-950/20 flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" /> Save Footer Information
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* MODALS: CREATE / EDIT / VIEW / DELETE */}
      {/* ============================================================ */}
      {modal?.type === 'delete' && modal?.module !== 'carousel' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Delete Item Confirmation</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">"{modal.data?.title || modal.data?.name || modal.data?.question || 'this item'}"</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 text-xs font-bold text-slate-400 hover:text-slate-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {modal?.type === 'view' && modal?.module !== 'carousel' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Eye className="w-4.5 h-4.5 text-[#1B664B]" />
                <span>View Details Ã¢â‚¬â€ {modal.data?.title || modal.data?.name || 'Item Details'}</span>
              </h3>
              <button onClick={() => setModal(null)} className="text-slate-500 hover:text-slate-900"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 max-h-[70vh] overflow-y-auto pr-1">
              {modal.data?.image || modal.data?.photo || modal.data?.logo ? (
                <div className="h-56 rounded-2xl bg-slate-100/80 overflow-hidden border border-slate-200 flex items-center justify-center mb-3">
                  <img src={modal.data.image || modal.data.photo || modal.data.logo} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : null}

              {Object.entries(modal.data || {}).map(([k, v]) => (
                <div key={k} className="flex flex-col py-1 border-b border-slate-100">
                  <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">{k}</span>
                  <span className="text-slate-700 font-mono mt-0.5 break-words">{String(v || 'Ã¢â‚¬â€')}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setModal(null)} className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-700 font-bold text-xs">
                Close Popup
              </button>
            </div>
          </div>
        </div>
      )}

      {(modal?.type === 'create' || modal?.type === 'edit') && modal?.module !== 'carousel' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {modal.type === 'create' ? `Add New Item to ${modal.module.toUpperCase()}` : `Edit Item in ${modal.module.toUpperCase()}`}
              </h3>
              <button onClick={() => setModal(null)} className="text-slate-500 hover:text-slate-900"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleItemSubmit} className="space-y-3.5 text-xs">
              {/* Feature / Category Name or Title */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Title / Name *</label>
                <input
                  type="text"
                  required
                  value={formData.title || formData.name || formData.question || formData.platform || ''}
                  onChange={e => setFormData((p: any) => ({ ...p, title: e.target.value, name: e.target.value, question: e.target.value, platform: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1B664B] font-medium"
                  placeholder="Enter title, name, or platform"
                />
              </div>

              {/* Description / Answer / Feedback */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Description / Content</label>
                <textarea
                  rows={3}
                  value={formData.description || formData.answer || formData.feedback || formData.caption || ''}
                  onChange={e => setFormData((p: any) => ({ ...p, description: e.target.value, answer: e.target.value, feedback: e.target.value, caption: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1B664B] resize-none font-medium"
                  placeholder="Enter details or description"
                />
              </div>

              {/* Image Upload Drag & Drop Preview */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Image / Photo / Logo Upload</label>
                {formData.image || formData.photo || formData.logo ? (
                  <div className="h-28 rounded-xl bg-slate-100/80 overflow-hidden border border-slate-200 mb-2 relative flex items-center justify-center">
                    <img src={formData.image || formData.photo || formData.logo} alt="Upload Preview" className="w-full h-full object-cover" />
                  </div>
                ) : null}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, 'image')}
                  className="text-2xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-2xs file:font-semibold file:bg-[#1B664B] file:text-white hover:file:bg-[#E8F5F0]0 cursor-pointer"
                />
              </div>

              {/* Global Theme Color */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Theme Color (Hex or Classes)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.color || ''}
                    onChange={e => setFormData((p: any) => ({ ...p, color: e.target.value }))}
                    className="flex-1 px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1B664B]"
                    placeholder="e.g. #1B664B or from-blue-500/20..."
                  />
                  <select
                    value={COLOR_OPTIONS.includes(formData.color) ? formData.color : ''}
                    onChange={e => setFormData((p: any) => ({ ...p, color: e.target.value }))}
                    className="w-12 h-[34px] rounded-xl border border-slate-200 bg-white cursor-pointer focus:outline-none text-xs"
                    title="Quick select hex color"
                  >
                    <option value="">...</option>
                    {COLOR_OPTIONS.map(c => <option key={c} value={c} style={{ background: c, color: '#fff' }}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Module Specific Fields */}
              {['features', 'categories', 'audience', 'socials'].includes(modal.module) && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Icon</label>
                  <select
                    value={formData.icon || ''}
                    onChange={e => setFormData((p: any) => ({ ...p, icon: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1B664B]"
                  >
                    <option value="">Select an icon...</option>
                    {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                </div>
              )}

              {['audience'].includes(modal.module) && (
                <>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Badge</label>
                    <input
                      type="text"
                      value={formData.badge || ''}
                      onChange={e => setFormData((p: any) => ({ ...p, badge: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1B664B]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Features (Comma Separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(formData.features) ? formData.features.join(', ') : formData.features || ''}
                      onChange={e => setFormData((p: any) => ({ ...p, features: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))}
                      className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1B664B]"
                    />
                  </div>
                </>
              )}

              {['categories'].includes(modal.module) && (
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Document Count</label>
                    <input
                      type="number"
                      value={formData.documentCount || 0}
                      onChange={e => setFormData((p: any) => ({ ...p, documentCount: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1B664B]"
                    />
                  </div>
                </div>
              )}

              {['testimonials'].includes(modal.module) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Role / Job Title</label>
                    <input
                      type="text"
                      value={formData.role || ''}
                      onChange={e => setFormData((p: any) => ({ ...p, role: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1B664B]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Company</label>
                    <input
                      type="text"
                      value={formData.company || ''}
                      onChange={e => setFormData((p: any) => ({ ...p, company: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1B664B]"
                    />
                  </div>
                </div>
              )}

              {['socials', 'navigation', 'companies'].includes(modal.module) && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">URL / Link</label>
                  <input
                    type="text"
                    value={formData.url || formData.website || ''}
                    onChange={e => setFormData((p: any) => ({ ...p, url: e.target.value, website: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#1B664B]"
                    placeholder="https://"
                  />
                </div>
              )}

              {/* Display Order & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder || 1}
                    onChange={e => setFormData((p: any) => ({ ...p, displayOrder: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Status</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={e => setFormData((p: any) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-200 rounded-xl text-xs text-white focus:outline-none focus:border-[#1B664B]"
                  >
                    <option value="active" className="bg-slate-900 text-white">Active</option>
                    <option value="inactive" className="bg-slate-900 text-white">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 text-slate-400 hover:text-slate-900 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#1B664B] hover:bg-[#E8F5F0] hover:scale-105 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-950/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  {modal.type === 'create' ? 'Add Item' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODULE: CAROUSEL SLIDES CRUD */}
      {/* ============================================================ */}
      {activeTab === 'carousel' && (() => {
        const slides: CMSCarouselSlide[] = Array.isArray(cms.carousel) ? cms.carousel : [];
        const filtered = slides
          .filter(s => statusFilter === 'ALL' || s.status === statusFilter)
          .filter(s => !search.trim() ||
            (s.title || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.highlight || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.badge || '').toLowerCase().includes(search.toLowerCase())
          )
          .sort((a, b) => sortOrder === 'asc' ? a.displayOrder - b.displayOrder : b.displayOrder - a.displayOrder);
        const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
        const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
        return (
          <div className="space-y-5">
            {/* Header */}
            <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2 font-auth-heading">
                    <Play className="w-4 h-4 text-[#1B664B]" />
                    Carousel Slides Management
                  </h2>
                  <p className="text-2xs text-slate-500 mt-1 font-medium">{slides.length} slides · {slides.filter(s => s.status === 'active').length} active</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={e => { setSearch(e.target.value); setPage(1); }}
                      placeholder="Search slides..."
                      className="pl-8 pr-3 py-2 text-2xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 w-44 focus:outline-none focus:border-[#1B664B]"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-2xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 cursor-pointer focus:outline-none"
                  >
                    <option value="ALL" className="bg-white text-slate-900">All Status</option>
                    <option value="active" className="bg-white text-emerald-700 font-bold">Active Only</option>
                    <option value="inactive" className="bg-white text-rose-700 font-bold">Inactive Only</option>
                  </select>
                  {selectedIds.length > 0 && (
                    <button
                      onClick={() => handleBulkDelete('carousel')}
                      className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-2xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Delete ({selectedIds.length})
                    </button>
                  )}
                  <button
                    onClick={() => { setFormData({ displayOrder: slides.length + 1, status: 'active', accentGradient: 'from-[#1B664B] via-[#14523C] to-[#0F402E]', accentColor: 'text-[#1B664B]', primaryCtaHref: '/register', secondaryCtaHref: '/login', secondaryCtaLabel: 'Sign In to Vault' }); setModal({ type: 'create', module: 'carousel' }); }}
                    className="px-4 py-2 rounded-xl bg-[#1B664B] hover:from-[#14523C] hover:to-[#1B664B] text-white text-2xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Slide
                  </button>
                </div>
              </div>
            </div>

            {/* Slides Grid */}
            {paginated.length === 0 ? (
              <div className="p-16 text-center text-xs text-slate-500 rounded-3xl border border-slate-200 bg-white shadow-2xs font-medium">
                No carousel slides found. Click <strong className="text-[#1B664B]">Add Slide</strong> to create your first one.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginated.map(slide => (
                  <div key={slide.id} className="group relative rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-[#1B664B] hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                    <div>
                      {/* Slide Image */}
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        <img
                          src={slide.slideImage || '/images/carousel/slide_1.png'}
                          alt={slide.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
                        {/* Top Left Badge */}
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#1B664B]/95 text-white shadow-md border border-white/20 backdrop-blur-sm max-w-[65%] truncate">
                          {slide.badge || 'Slide'}
                        </span>
                        {/* Top Right Status Badge */}
                        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black border shadow-md backdrop-blur-sm ${
                          slide.status === 'active'
                            ? 'bg-emerald-500 text-white border-emerald-400/50'
                            : 'bg-slate-700 text-slate-200 border-slate-600'
                        }`}>
                          {slide.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        {/* Checkbox badge */}
                        <div className="absolute bottom-3 left-3 w-6 h-6 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(slide.id)}
                            onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, slide.id] : prev.filter(i => i !== slide.id))}
                            className="w-3.5 h-3.5 rounded cursor-pointer accent-themePrimary"
                          />
                        </div>
                      </div>

                      {/* Slide Content */}
                      <div className="p-5 space-y-2 bg-white">
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-2 font-auth-heading">
                          {slide.title}{' '}
                          <span className="bg-[#1B664B] bg-clip-text text-transparent">
                            {slide.highlight}
                          </span>
                        </h3>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-relaxed">{slide.sub}</p>
                        
                        <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 mt-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold border border-slate-200">#{slide.displayOrder}</span>
                          <span className="text-xs text-[#1B664B] font-bold truncate max-w-[130px]">{slide.primaryCtaLabel}</span>
                          <span className="text-slate-300">→</span>
                          <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 font-mono text-[10px] border border-slate-200 truncate max-w-[90px]">{slide.primaryCtaHref}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 p-5 pt-0 bg-white">
                      <button
                        onClick={() => handleToggleStatus('carousel', slide.id)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          slide.status === 'active'
                            ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {slide.status === 'active' ? <><EyeOff className="w-3.5 h-3.5" /> Hide</> : <><Eye className="w-3.5 h-3.5" /> Show</>}
                      </button>
                      <button
                        onClick={() => { setFormData({ ...slide }); setModal({ type: 'edit', module: 'carousel', data: slide }); }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => setModal({ type: 'delete', module: 'carousel', data: slide })}
                        className="p-2 rounded-xl text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border border-slate-100 rounded-2xl bg-slate-900/40">
                <span className="text-2xs text-slate-500 font-mono">Page {page} of {totalPages} ({filtered.length} slides)</span>
                <div className="flex gap-1.5">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 disabled:opacity-30">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 disabled:opacity-30">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Create / Edit Modal */}
            {modal && (modal.type === 'create' || modal.type === 'edit') && modal.module === 'carousel' && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
                <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-slate-900 font-extrabold flex items-center gap-2 text-sm tracking-wide">
                      <Play className="w-4 h-4 text-[#1B664B]" />
                      {modal.type === 'create' ? 'Add New Carousel Slide' : 'Edit Carousel Slide'}
                    </h3>
                    <button type="button" onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-900 transition"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleItemSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                    {/* Badge */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Badge Text *</label>
                      <input
                        required
                        value={formData.badge || ''}
                        onChange={e => setFormData((p: any) => ({ ...p, badge: e.target.value }))}
                        placeholder="â˜… NEXT-GEN DOCUMENT MANAGEMENT"
                        className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>

                    {/* Title + Highlight */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Title (plain text) *</label>
                        <input
                          required
                          value={formData.title || ''}
                          onChange={e => setFormData((p: any) => ({ ...p, title: e.target.value }))}
                          placeholder="e.g. One Secure AI Vault for All Your"
                          className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Highlight / Gradient Text *</label>
                        <input
                          required
                          value={formData.highlight || ''}
                          onChange={e => setFormData((p: any) => ({ ...p, highlight: e.target.value }))}
                          placeholder="e.g. Critical Paperwork & Digital Assets"
                          className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    {/* Sub / Description */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Description (sub text) *</label>
                      <textarea
                        required
                        rows={3}
                        value={formData.sub || ''}
                        onChange={e => setFormData((p: any) => ({ ...p, sub: e.target.value }))}
                        placeholder="e.g. DocVault is your enterprise-grade personal document repository..."
                        className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>

                    {/* Slide Image */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Slide Image Path *</label>
                      <input
                        required
                        value={formData.slideImage || ''}
                        onChange={e => setFormData((p: any) => ({ ...p, slideImage: e.target.value }))}
                        placeholder="/images/carousel/slide_1.png"
                        className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Use a path like <code className="text-[#1B664B]">/images/carousel/slide_1.png</code> or an external URL.</p>
                      {formData.slideImage && (
                        <img src={formData.slideImage} alt="preview" className="mt-2 w-full h-28 object-cover rounded-xl border border-slate-200"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                    </div>

                    {/* Primary CTA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Primary CTA Label *</label>
                        <input
                          required
                          value={formData.primaryCtaLabel || ''}
                          onChange={e => setFormData((p: any) => ({ ...p, primaryCtaLabel: e.target.value }))}
                          placeholder="Get Started Free"
                          className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Primary CTA URL *</label>
                        <input
                          required
                          value={formData.primaryCtaHref || ''}
                          onChange={e => setFormData((p: any) => ({ ...p, primaryCtaHref: e.target.value }))}
                          placeholder="/register"
                          className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    {/* Secondary CTA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Secondary CTA Label</label>
                        <input
                          value={formData.secondaryCtaLabel || ''}
                          onChange={e => setFormData((p: any) => ({ ...p, secondaryCtaLabel: e.target.value }))}
                          placeholder="Sign In to Vault"
                          className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Secondary CTA URL</label>
                        <input
                          value={formData.secondaryCtaHref || ''}
                          onChange={e => setFormData((p: any) => ({ ...p, secondaryCtaHref: e.target.value }))}
                          placeholder="/login"
                          className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    {/* Accent Gradient + Accent Color */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Accent Gradient (Tailwind)</label>
                        <input
                          value={formData.accentGradient || 'from-[#1B664B] via-[#14523C] to-[#0F402E]'}
                          onChange={e => setFormData((p: any) => ({ ...p, accentGradient: e.target.value }))}
                          placeholder="from-[#1B664B] via-[#14523C] to-[#0F402E]"
                          className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Accent Color Class</label>
                        <input
                          value={formData.accentColor || 'text-[#1B664B]'}
                          onChange={e => setFormData((p: any) => ({ ...p, accentColor: e.target.value }))}
                          placeholder="text-[#1B664B]"
                          className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    {/* Display Order + Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Display Order</label>
                        <input
                          type="number"
                          min={1}
                          value={formData.displayOrder || 1}
                          onChange={e => setFormData((p: any) => ({ ...p, displayOrder: Number(e.target.value) }))}
                          className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Status</label>
                        <select
                          value={formData.status || 'active'}
                          onChange={e => setFormData((p: any) => ({ ...p, status: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-200 rounded-xl text-xs text-white cursor-pointercursor-pointer focus:outline-none bg-slate-900"
                        >
                          <option value="active" className="bg-slate-900 text-white">Active</option>
                          <option value="inactive" className="bg-slate-900 text-white">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setModal(null)} className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-700 font-bold text-xs">
                        Cancel
                      </button>
                      <button type="submit" disabled={submitting} className="px-6 py-2 rounded-xl bg-[#1B664B] hover:brightness-110 hover:scale-105 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-950/20 flex items-center gap-2 transition-all cursor-pointer">
                        <Save className="w-3.5 h-3.5" />
                        {submitting ? 'Saving...' : modal.type === 'create' ? 'Create Slide' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {modal?.type === 'delete' && modal.module === 'carousel' && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
                <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 text-rose-400">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Delete Slide?</h3>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Are you sure you want to delete <span className="text-slate-900 font-bold">{modal.data?.title}</span>? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={() => setModal(null)} className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-700 font-bold text-xs">
                      Cancel
                    </button>
                    <button onClick={handleDeleteItem} disabled={submitting} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition">
                      {submitting ? 'Deleting...' : 'Delete Permanently'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ============================================================
// HELPER COMPONENT FOR ARRAY MODULE TABLES (CRUD, SEARCH, PAGINATION)
// ============================================================
function RenderArrayModuleCRUD({
  moduleKey, dataList, search, setSearch, statusFilter, setStatusFilter, page, setPage, itemsPerPage,
  selectedIds, setSelectedIds, onOpenCreate, onOpenEdit, onOpenView, onOpenDelete, onToggleStatus, onBulkDelete
}: any) {
  const filtered = useMemo(() => {
    let result = [...dataList];
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      result = result.filter(item =>
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.question && item.question.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(item => item.status === statusFilter);
    }
    return result;
  }, [dataList, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((i: any) => i.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x: any) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={`Search in ${moduleKey}...`}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#1B664B]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none"
          >
            <option value="ALL" className="bg-white text-slate-900">All Status</option>
            <option value="active" className="bg-white text-slate-900">Active Only</option>
            <option value="inactive" className="bg-white text-slate-900">Inactive Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={onBulkDelete}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Bulk Delete ({selectedIds.length})
            </button>
          )}

          <button
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-xl bg-[#1B664B] hover:brightness-110 text-xs font-bold text-white shadow-md shadow-emerald-950/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Item
          </button>
        </div>
      </div>

      {/* CRUD Data Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider">
              <th className="py-3.5 px-4 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === paginated.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-[#1B664B] focus:ring-0 cursor-pointer accent-themePrimary"
                />
              </th>
              <th className="py-3.5 px-4">Item / Title</th>
              <th className="py-3.5 px-4">Description / Details</th>
              <th className="py-3.5 px-4 w-24">Order</th>
              <th className="py-3.5 px-4 w-28">Status</th>
              <th className="py-3.5 px-4 text-right w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 text-xs font-medium">
                  No items found in {moduleKey}. Click "Add New Item" to create one.
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id} className={`hover:bg-slate-50/80 transition bg-white ${item.status === 'inactive' ? 'opacity-60' : ''}`}>
                  <td className="py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelectOne(item.id)}
                      className="rounded border-slate-300 text-[#1B664B] focus:ring-0 cursor-pointer accent-themePrimary"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {item.image || item.photo || item.logo ? (
                        <img src={item.image || item.photo || item.logo} alt="Thumb" className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#E8F5F0] border border-[#D1EBE1] text-[#1B664B] flex items-center justify-center shrink-0">
                          <Layout className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 truncate max-w-[200px] font-auth-heading">
                          {item.title || item.name || item.question || item.platform || 'Item'}
                        </p>
                        <p className="text-2xs text-slate-400 font-mono">
                          ID: #{item.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-slate-600 font-medium truncate max-w-[320px]">
                      {item.description || item.answer || item.feedback || item.caption || item.url || '—'}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-slate-700">
                    #{item.displayOrder || 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => onToggleStatus(item.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border transition cursor-pointer ${
                        item.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {item.status ? item.status.toUpperCase() : 'ACTIVE'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onOpenView(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition cursor-pointer"
                        title="View Details Popup"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#1B664B] hover:bg-[#E8F5F0] transition cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenDelete(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <span className="text-2xs text-slate-500 font-mono">
              Page {page} of {totalPages} ({filtered.length} total items)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p: number) => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 disabled:opacity-30 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p: number) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 disabled:opacity-30 transition cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


