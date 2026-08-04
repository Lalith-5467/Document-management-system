'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock, AlertTriangle, CheckCircle2, X, CalendarCheck,
  FileText, RefreshCw, ChevronRight, Shield, Zap,
  BarChart3, CalendarDays, Search, TrendingUp, Bell
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface CalendarDocEvent {
  id: number | string;
  title: string;
  category: string;
  expiryDate: string;
  year: number;
  month: number;
  dayOfMonth: number;
  daysRemaining: number;
  status: 'valid' | 'expiring_soon' | 'expired';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const INITIAL_EVENTS: CalendarDocEvent[] = [
  { id: 'evt-1', title: 'Passport Renewal', category: 'Personal Identity', expiryDate: '2026-07-29', year: 2026, month: 6, dayOfMonth: 29, daysRemaining: 2, status: 'expiring_soon' },
  { id: 'evt-2', title: 'Health Insurance Expiry', category: 'Insurance', expiryDate: '2026-07-15', year: 2026, month: 6, dayOfMonth: 15, daysRemaining: -12, status: 'expired' },
  { id: 'evt-3', title: 'Driving License Renewal', category: 'Personal Identity', expiryDate: '2026-08-18', year: 2026, month: 7, dayOfMonth: 18, daysRemaining: 22, status: 'expiring_soon' },
  { id: 'evt-4', title: 'AWS Certification Expiry', category: 'Certificates', expiryDate: '2026-07-10', year: 2026, month: 6, dayOfMonth: 10, daysRemaining: -17, status: 'expired' },
  { id: 'evt-5', title: 'Project Contract Renewal', category: 'Legal & Contracts', expiryDate: '2026-07-31', year: 2026, month: 6, dayOfMonth: 31, daysRemaining: 4, status: 'expiring_soon' },
  { id: 'evt-6', title: 'Visa Entry Permit', category: 'Personal Identity', expiryDate: '2026-07-05', year: 2026, month: 6, dayOfMonth: 5, daysRemaining: -22, status: 'expired' },
  { id: 'evt-7', title: 'Property Deed Assessment', category: 'Legal & Contracts', expiryDate: '2026-07-22', year: 2026, month: 6, dayOfMonth: 22, daysRemaining: -5, status: 'expired' },
  { id: 'evt-8', title: 'Vehicle Registration RC', category: 'Personal Identity', expiryDate: '2026-11-30', year: 2026, month: 10, dayOfMonth: 30, daysRemaining: 126, status: 'valid' },
  { id: 'evt-9', title: 'Home Insurance Policy', category: 'Insurance', expiryDate: '2026-09-15', year: 2026, month: 8, dayOfMonth: 15, daysRemaining: 50, status: 'valid' },
  { id: 'evt-10', title: 'ISO Quality Certificate', category: 'Certificates', expiryDate: '2026-08-05', year: 2026, month: 7, dayOfMonth: 5, daysRemaining: 9, status: 'expiring_soon' },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getDaysLabel(days: number) {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export default function DocumentCalendarPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [events, setEvents] = useState<CalendarDocEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'expired' | 'expiring_soon' | 'valid'>('all');
  const [selectedEvent, setSelectedEvent] = useState<CalendarDocEvent | null>(null);
  const [renewModalDoc, setRenewModalDoc] = useState<CalendarDocEvent | null>(null);
  const [renewDateInput, setRenewDateInput] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { loadEvents(); }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadEvents = () => {
    let loadedUserDocs: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dms_user_documents');
        if (saved) loadedUserDocs = JSON.parse(saved);
      } catch (e) {}
    }
    const todayDate = new Date(2026, 6, 27);
    const dynamicEvents: CalendarDocEvent[] = loadedUserDocs.map((doc: any) => {
      let expStr = doc.expiry_date || doc.created_at || '2026-07-28';
      let dateObj = new Date(expStr);
      if (isNaN(dateObj.getTime())) dateObj = new Date(2026, 6, 28);
      const diffDays = Math.ceil((dateObj.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      let status: 'valid' | 'expiring_soon' | 'expired' = 'valid';
      if (diffDays <= 0) status = 'expired';
      else if (diffDays <= 30) status = 'expiring_soon';
      return { id: doc.id, title: doc.title, category: doc.category_name || 'General', expiryDate: expStr.split('T')[0], year: dateObj.getFullYear(), month: dateObj.getMonth(), dayOfMonth: dateObj.getDate(), daysRemaining: diffDays, status };
    });
    const combined = [...dynamicEvents];
    INITIAL_EVENTS.forEach(ie => {
      if (!combined.some(e => String(e.id) === String(ie.id) || e.title.toLowerCase() === ie.title.toLowerCase())) combined.push(ie);
    });
    setEvents(combined);
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewModalDoc || !renewDateInput) return;
    const newDateObj = new Date(renewDateInput);
    if (isNaN(newDateObj.getTime())) { showToast('Please select a valid date.', 'error'); return; }
    const todayDate = new Date(2026, 6, 27);
    const diffDays = Math.ceil((newDateObj.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    let status: 'valid' | 'expiring_soon' | 'expired' = 'valid';
    if (diffDays <= 0) status = 'expired';
    else if (diffDays <= 30) status = 'expiring_soon';
    setEvents(prev => prev.map(evt => String(evt.id) === String(renewModalDoc.id) ? { ...evt, expiryDate: renewDateInput, year: newDateObj.getFullYear(), month: newDateObj.getMonth(), dayOfMonth: newDateObj.getDate(), daysRemaining: diffDays, status } : evt));
    setSelectedEvent(null);
    setRenewModalDoc(null);
    showToast(`Renewed "${renewModalDoc.title}" to ${formatDate(renewDateInput)}!`);
  };

  const categoryOptions = useMemo(() => {
    const cats = new Set(events.map(e => e.category));
    return ['all', ...Array.from(cats)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (activeTab !== 'all' && e.status !== activeTab) return false;
      if (selectedCategory !== 'all' && e.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [events, activeTab, selectedCategory, searchQuery]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [filteredEvents]);

  const expiredCount = events.filter(e => e.status === 'expired').length;
  const expiringSoonCount = events.filter(e => e.status === 'expiring_soon').length;
  const validCount = events.filter(e => e.status === 'valid').length;

  const upcomingDeadlines = useMemo(() =>
    [...events].filter(e => e.daysRemaining >= 0).sort((a, b) => a.daysRemaining - b.daysRemaining).slice(0, 6),
    [events]
  );

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { total: number; expired: number; expiring: number }> = {};
    events.forEach(e => {
      if (!map[e.category]) map[e.category] = { total: 0, expired: 0, expiring: 0 };
      map[e.category].total++;
      if (e.status === 'expired') map[e.category].expired++;
      if (e.status === 'expiring_soon') map[e.category].expiring++;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [events]);

  const statusConfig = {
    expired: { label: 'Expired', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/60', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-500', pill: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', icon: '🔴' },
    expiring_soon: { label: 'Expiring Soon', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', pill: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', icon: '🟡' },
    valid: { label: 'Valid', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500', pill: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', icon: '🟢' },
  };

  return (
    <div className="space-y-6 pb-16" style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[1000] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold animate-pop-in ${toast.type === 'success' ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-rose-500" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-themePrimary border border-orange-200 dark:border-orange-900/60 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </span>
            Document Timeline
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Track expiration deadlines, schedule renewals, and monitor document health at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-themePrimary w-48"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-themePrimary"
          >
            {categoryOptions.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* HERO STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Expired */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900/80 border border-rose-200/60 dark:border-rose-900/40 rounded-3xl p-5 shadow-[0_4px_24px_rgba(239,68,68,0.08)] hover:shadow-[0_8px_32px_rgba(239,68,68,0.14)] transition-all group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/60 to-transparent dark:from-rose-950/20 dark:to-transparent pointer-events-none rounded-3xl" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-rose-500 dark:text-rose-400 mb-2">Expired</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white">{expiredCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Documents need urgent action</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 h-1.5 rounded-full bg-rose-100 dark:bg-rose-950/60 relative z-10">
            <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400 shadow-sm" style={{ width: `${(expiredCount / Math.max(events.length, 1)) * 100}%` }} />
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-900/40 rounded-3xl p-5 shadow-[0_4px_24px_rgba(245,158,11,0.08)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.14)] transition-all group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 to-transparent dark:from-amber-950/20 dark:to-transparent pointer-events-none rounded-3xl" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-2">Expiring Soon</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white">{expiringSoonCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Renew within 30 days</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 h-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 relative z-10">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 shadow-sm animate-pulse" style={{ width: `${(expiringSoonCount / Math.max(events.length, 1)) * 100}%` }} />
          </div>
        </div>

        {/* Valid */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-900/40 rounded-3xl p-5 shadow-[0_4px_24px_rgba(16,185,129,0.08)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.14)] transition-all group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 to-transparent dark:from-emerald-950/20 dark:to-transparent pointer-events-none rounded-3xl" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-500 dark:text-emerald-400 mb-2">Valid</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white">{validCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Documents in good standing</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 relative z-10">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm" style={{ width: `${(validCount / Math.max(events.length, 1)) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT: Timeline + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Document Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab Filter */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-sm w-fit">
            {([
              { id: 'all', label: 'All', count: events.length },
              { id: 'expired', label: 'Expired', count: expiredCount },
              { id: 'expiring_soon', label: 'Expiring Soon', count: expiringSoonCount },
              { id: 'valid', label: 'Valid', count: validCount },
            ] as { id: typeof activeTab; label: string; count: number }[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-black transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/25' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-extrabold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Timeline Entries */}
          <div className="space-y-3">
            {sortedEvents.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-base font-bold text-slate-400 dark:text-slate-500">No documents match this filter</p>
              </div>
            ) : (
              sortedEvents.map((evt, idx) => {
                const cfg = statusConfig[evt.status];
                const progressPct = evt.status === 'expired' ? 100 : evt.status === 'expiring_soon' ? Math.max(5, 100 - (evt.daysRemaining / 30) * 100) : Math.max(5, 100 - (evt.daysRemaining / 365) * 100);
                const progressColor = evt.status === 'expired' ? 'from-rose-500 to-rose-400' : evt.status === 'expiring_soon' ? 'from-amber-500 to-amber-400' : 'from-emerald-500 to-emerald-400';

                return (
                  <div
                    key={evt.id}
                    className="group bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm hover:shadow-[0_8px_30px_rgba(255,107,0,0.1)] hover:border-themePrimary/30 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedEvent(evt)}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Status dot + date column */}
                      <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                        <div className={`w-3 h-3 rounded-full ${cfg.dot} shadow-sm ${evt.status === 'expiring_soon' ? 'animate-pulse' : ''}`} />
                        {idx < sortedEvents.length - 1 && <div className="w-px h-full min-h-[20px] bg-slate-200 dark:bg-slate-700" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.pill}`}>
                                {cfg.icon} {cfg.label}
                              </span>
                              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{evt.category}</span>
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-themePrimary transition-colors truncate">
                              {evt.title}
                            </h3>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-sm font-black ${evt.daysRemaining < 0 ? 'text-rose-600' : evt.daysRemaining <= 7 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                              {getDaysLabel(evt.daysRemaining)}
                            </p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{formatDate(evt.expiryDate)}</p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3 flex items-center gap-2.5">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700`}
                              style={{ width: `${Math.min(progressPct, 100)}%` }}
                            />
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); setRenewModalDoc(evt); setRenewDateInput(evt.expiryDate); }}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-themePrimary to-[#F97316] text-white text-xs font-black shadow-sm shadow-orange-500/20 hover:scale-105 transition-transform opacity-0 group-hover:opacity-100 shrink-0"
                          >
                            <RefreshCw className="w-3 h-3" /> Renew
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-5">

          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-themePrimary" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">Upcoming Deadlines</h3>
            </div>
            <div className="space-y-3">
              {upcomingDeadlines.map(evt => {
                const cfg = statusConfig[evt.status];
                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50 dark:hover:bg-orange-950/20 border border-transparent hover:border-themePrimary/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot} ${evt.status === 'expiring_soon' ? 'animate-pulse' : ''}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-themePrimary transition-colors">{evt.title}</p>
                        <p className="text-xs text-slate-400">{formatDate(evt.expiryDate)}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-black shrink-0 ${evt.daysRemaining <= 7 ? 'text-rose-500' : evt.daysRemaining <= 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {getDaysLabel(evt.daysRemaining)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-themePrimary" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">Category Breakdown</h3>
            </div>
            <div className="space-y-3.5">
              {categoryBreakdown.map(([cat, stats]) => {
                const healthPct = Math.round(((stats.total - stats.expired - stats.expiring) / Math.max(stats.total, 1)) * 100);
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{cat}</span>
                      <span className="text-slate-400 font-mono text-xs">{stats.total} docs</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex gap-0.5">
                      {stats.expired > 0 && (
                        <div className="h-full rounded-l-full bg-rose-400" style={{ width: `${(stats.expired / stats.total) * 100}%` }} />
                      )}
                      {stats.expiring > 0 && (
                        <div className="h-full bg-amber-400 animate-pulse" style={{ width: `${(stats.expiring / stats.total) * 100}%` }} />
                      )}
                      {healthPct > 0 && (
                        <div className="h-full rounded-r-full bg-emerald-400" style={{ width: `${healthPct}%` }} />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400">
                      {stats.expired > 0 && <span className="text-rose-500">{stats.expired} expired</span>}
                      {stats.expiring > 0 && <span className="text-amber-500">{stats.expiring} expiring</span>}
                      {healthPct > 0 && <span className="text-emerald-500">{Math.round((healthPct / 100) * stats.total)} valid</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Legend */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50/40 dark:from-orange-950/30 dark:to-amber-950/20 border border-orange-100 dark:border-orange-900/40 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-themePrimary" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Status Guide</h3>
            </div>
            <div className="space-y-2">
              {[
                { dot: 'bg-rose-500', label: 'Expired', desc: 'Past due — renew immediately' },
                { dot: 'bg-amber-500 animate-pulse', label: 'Expiring Soon', desc: 'Within 30 days — act now' },
                { dot: 'bg-emerald-500', label: 'Valid', desc: 'More than 30 days remaining' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${item.dot}`} />
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                    <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5 animate-pop-in">
            <button onClick={() => setSelectedEvent(null)} className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border inline-block mb-2 ${statusConfig[selectedEvent.status].pill}`}>
                {statusConfig[selectedEvent.status].icon} {statusConfig[selectedEvent.status].label}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedEvent.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedEvent.category}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Expiry Date</p>
                <p className="text-base font-black text-slate-900 dark:text-white font-mono">{formatDate(selectedEvent.expiryDate)}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Status</p>
                <p className={`text-base font-black ${selectedEvent.daysRemaining < 0 ? 'text-rose-600' : selectedEvent.daysRemaining <= 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {getDaysLabel(selectedEvent.daysRemaining)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => { setSelectedEvent(null); router.push(`/user/documents?q=${encodeURIComponent(selectedEvent.title)}`); }}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" /> Open Document
              </button>
              <button
                onClick={() => { setRenewModalDoc(selectedEvent); setRenewDateInput(selectedEvent.expiryDate); }}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-black text-sm shadow-lg shadow-orange-500/20 hover:scale-105 transition flex items-center justify-center gap-1.5"
              >
                <CalendarCheck className="w-4 h-4" /> Renew Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENEWAL MODAL */}
      {renewModalDoc && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-pop-in">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-themePrimary border border-orange-200 dark:border-orange-900 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Renew Document</h3>
              </div>
              <button onClick={() => setRenewModalDoc(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Setting new expiry for <span className="font-black text-slate-900 dark:text-white">"{renewModalDoc.title}"</span>
            </p>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">New Expiration Date</label>
                <input
                  type="date"
                  required
                  value={renewDateInput}
                  onChange={e => setRenewDateInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary transition"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setRenewModalDoc(null)} className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white text-sm font-black shadow-md shadow-orange-500/25 hover:scale-105 transition">
                  Save Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
