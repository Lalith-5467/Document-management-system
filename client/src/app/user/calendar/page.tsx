'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  CalendarCheck,
  FileText,
  RefreshCw,
  Shield,
  Zap,
  BarChart3,
  Search,
  Grid,
  List,
  ArrowUpRight,
  Sparkles,
  Layers,
  Bell,
  Eye,
  Filter
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/lib/api';
import { addNotification, syncExpiryNotifications } from '@/lib/notificationStore';
import DocumentPreviewModal from '@/components/dashboard/DocumentPreviewModal';

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

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(dateStr: string) {
  if (!dateStr) return '';
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
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'expired' | 'expiring_soon' | 'valid'>('all');
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarDocEvent | null>(null);
  const [renewModalDoc, setRenewModalDoc] = useState<CalendarDocEvent | null>(null);
  const [previewModalDocId, setPreviewModalDocId] = useState<number | null>(null);
  const [renewDateInput, setRenewDateInput] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadEvents = async () => {
    try {
      const res = await api.get('/documents?limit=1000');
      if (res.data?.success && Array.isArray(res.data.documents)) {
        syncExpiryNotifications(res.data.documents);
        const todayDate = new Date();
        const dynamicEvents: CalendarDocEvent[] = res.data.documents
          .filter((doc: any) => doc.expiry_date != null)
          .map((doc: any) => {
            const expStr = doc.expiry_date;
            const dateObj = new Date(expStr);
            const diffDays = Math.ceil((dateObj.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
            
            let status: 'valid' | 'expiring_soon' | 'expired' = 'valid';
            if (diffDays <= 0) status = 'expired';
            else if (diffDays <= 30) status = 'expiring_soon';
            
            return {
              id: doc.id,
              title: doc.title || doc.file_name,
              category: doc.category_name || 'General Document',
              expiryDate: expStr.split('T')[0],
              year: dateObj.getFullYear(),
              month: dateObj.getMonth(),
              dayOfMonth: dateObj.getDate(),
              daysRemaining: diffDays,
              status
            };
          });
        setEvents(dynamicEvents);
      }
    } catch (e) {
      console.error('Failed to load events:', e);
    }
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewModalDoc || !renewDateInput) return;
    const newDateObj = new Date(renewDateInput);
    if (isNaN(newDateObj.getTime())) { showToast('Please select a valid date.', 'error'); return; }
    
    try {
      const res = await api.put(`/documents/${renewModalDoc.id}`, {
        expiry_date: renewDateInput
      });
      if (res.data?.success) {
        const todayDate = new Date();
        const diffDays = Math.ceil((newDateObj.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
        let status: 'valid' | 'expiring_soon' | 'expired' = 'valid';
        if (diffDays <= 0) status = 'expired';
        else if (diffDays <= 30) status = 'expiring_soon';
        
        setEvents(prev => prev.map(evt => String(evt.id) === String(renewModalDoc.id) ? {
          ...evt,
          expiryDate: renewDateInput,
          year: newDateObj.getFullYear(),
          month: newDateObj.getMonth(),
          dayOfMonth: newDateObj.getDate(),
          daysRemaining: diffDays,
          status
        } : evt));

        addNotification(
          'Document Expiry Renewed',
          `Expiry date for "${renewModalDoc.title}" was renewed to ${renewDateInput}.`,
          'success',
          '/user/calendar'
        );

        setSelectedEvent(null);
        setRenewModalDoc(null);
        showToast(`Renewed "${renewModalDoc.title}" to ${formatDate(renewDateInput)}!`);
      }
    } catch (err) {
      console.error('Failed to update event:', err);
      showToast('Failed to update expiry date.', 'error');
    }
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
    [...events].filter(e => e.daysRemaining >= 0).sort((a, b) => a.daysRemaining - b.daysRemaining).slice(0, 5),
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

  // Calendar Grid Calculation
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const calendarGridDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];
    // Previous Month Days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      days.push({
        dateObj: new Date(currentYear, currentMonth - 1, d),
        dayNumber: d,
        isCurrentMonth: false
      });
    }
    // Current Month Days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      days.push({
        dateObj: new Date(currentYear, currentMonth, d),
        dayNumber: d,
        isCurrentMonth: true
      });
    }
    // Next Month Padding to fill grid (35 or 42)
    const targetSize = days.length <= 35 ? 35 : 42;
    const nextDaysCount = targetSize - days.length;
    for (let n = 1; n <= nextDaysCount; n++) {
      days.push({
        dateObj: new Date(currentYear, currentMonth + 1, n),
        dayNumber: n,
        isCurrentMonth: false
      });
    }
    return days;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (dateObj: Date) => {
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth();
    const d = dateObj.getDate();
    return sortedEvents.filter(e => e.year === y && e.month === m && e.dayOfMonth === d);
  };

  const statusConfig = {
    expired: {
      label: 'Expired',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      border: 'border-rose-200 dark:border-rose-800',
      dot: 'bg-rose-500',
      pill: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      badge: 'bg-rose-500 text-white',
      icon: '🔴'
    },
    expiring_soon: {
      label: 'Expiring Soon',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      border: 'border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500',
      pill: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      badge: 'bg-amber-500 text-white',
      icon: '🟡'
    },
    valid: {
      label: 'Valid',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      border: 'border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500',
      pill: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      badge: 'bg-emerald-500 text-white',
      icon: '🟢'
    },
  };

  const isTodayDate = (dateObj: Date) => {
    const today = new Date();
    return dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear();
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

      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
        <Link href="/user" className="hover:text-themePrimary dark:hover:text-orange-400 transition-colors font-medium">
          Vault Collections
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
        <span className="font-semibold text-slate-900 dark:text-white">Calendar</span>
      </div>

      {/* PAGE HEADER & CONTROLS */}
      <div className="bg-white dark:bg-[#19102E] p-6 sm:p-8 rounded-3xl border border-[#EAE4F8] dark:border-[#2D1F47] shadow-[0_10px_30px_rgba(108,92,231,0.05)] space-y-6">
        {/* Top Header Block */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-themePrimary text-xs font-black uppercase tracking-wider border border-orange-200/80 dark:border-orange-800/60">
            <Sparkles className="w-3.5 h-3.5 text-themePrimary shrink-0" />
            <span>Document Lifecycle Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1235] dark:text-white tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            Document Expiry & Renewal Calendar
          </h1>
          <p className="text-sm text-[#7B7393] dark:text-[#A39BB8] font-medium leading-relaxed">
            Monitor expiration dates, view deadline timelines, and schedule renewals seamlessly.
          </p>
        </div>

        {/* Toolbar Controls — Placed UNDER the Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#F3F0FA] dark:border-[#2D1F47]">
          {/* Left Controls: View Switcher & Category Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Switcher: Calendar vs Timeline */}
            <div className="flex items-center bg-[#F3F0FA] dark:bg-[#1F143A] p-1 rounded-2xl border border-[#EAE4F8] dark:border-[#2D1F47]">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/25'
                    : 'text-[#7B7393] dark:text-[#A39BB8] hover:text-[#1E1235] dark:hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" /> Calendar View
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/25'
                    : 'text-[#7B7393] dark:text-[#A39BB8] hover:text-[#1E1235] dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4" /> Timeline List
              </button>
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 bg-[#F3F0FA] dark:bg-[#1F143A] border border-[#EAE4F8] dark:border-[#2D1F47] rounded-2xl text-xs font-bold text-[#1E1235] dark:text-white focus:outline-none focus:border-themePrimary cursor-pointer h-[42px]"
            >
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          {/* Right Control: Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B7393]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F3F0FA] dark:bg-[#1F143A] border border-[#EAE4F8] dark:border-[#2D1F47] rounded-2xl text-xs font-semibold text-[#1E1235] dark:text-white placeholder:text-[#7B7393] focus:outline-none focus:border-themePrimary h-[42px]"
            />
          </div>
        </div>

        {/* STAT METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#F3F0FA] dark:border-[#2D1F47]">
          {/* Expired Card */}
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Expired Documents</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{expiredCount}</h3>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 font-medium">Urgent renewal required</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center font-bold text-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          {/* Expiring Soon Card */}
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Expiring Soon</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{expiringSoonCount}</h3>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">Within 30 days</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-lg shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Valid Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Healthy & Valid</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{validCount}</h3>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">Over 30 days active</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-lg shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Total Tracked Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Total Tracked</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{events.length}</h3>
              <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 font-medium">Monitored documents</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-lg shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN VIEW AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MAIN CONTAINER (2 COLS) */}
        <div className="lg:col-span-2 space-y-4">

          {/* VIEW MODE 1: INTERACTIVE MONTHLY CALENDAR GRID */}
          {viewMode === 'calendar' && (
            <div className="bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] rounded-3xl p-6 shadow-sm space-y-4">
              
              {/* MONTH NAVIGATION BAR */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F3F0FA] dark:border-[#2D1F47]">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-black text-[#1E1235] dark:text-white flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-themePrimary" />
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </h2>
                  <button
                    onClick={handleToday}
                    className="px-3 py-1 rounded-xl bg-[#F3F0FA] dark:bg-[#1F143A] text-xs font-bold text-themePrimary hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-[#EAE4F8] dark:border-[#2D1F47] transition"
                  >
                    Today
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-xl border border-[#EAE4F8] dark:border-[#2D1F47] text-[#7B7393] hover:text-[#1E1235] dark:hover:text-white hover:bg-[#F3F0FA] dark:hover:bg-[#1F143A] transition"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-xl border border-[#EAE4F8] dark:border-[#2D1F47] text-[#7B7393] hover:text-[#1E1235] dark:hover:text-white hover:bg-[#F3F0FA] dark:hover:bg-[#1F143A] transition"
                    title="Next Month"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* WEEKDAY HEADERS */}
              <div className="grid grid-cols-7 gap-1 text-center font-black text-xs text-[#7B7393] uppercase tracking-wider py-1">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="py-1.5">{day}</div>
                ))}
              </div>

              {/* CALENDAR DAYS GRID (7 COLUMNS) */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarGridDays.map((cell, idx) => {
                  const dayEvents = getEventsForDate(cell.dateObj);
                  const isToday = isTodayDate(cell.dateObj);

                  return (
                    <div
                      key={idx}
                      className={`min-h-[95px] p-1.5 rounded-2xl border transition-all flex flex-col justify-between ${
                        cell.isCurrentMonth
                          ? 'bg-white dark:bg-[#1F143A]/40 border-[#EAE4F8] dark:border-[#2D1F47]'
                          : 'bg-slate-50/40 dark:bg-slate-900/30 border-transparent text-slate-400 opacity-40'
                      } ${isToday ? 'ring-2 ring-themePrimary/80 border-themePrimary font-bold shadow-md' : ''}`}
                    >
                      {/* Date Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                            isToday
                              ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-sm'
                              : cell.isCurrentMonth
                              ? 'text-[#1E1235] dark:text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#7B7393]">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {/* Event Badges List */}
                      <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[60px] custom-scrollbar">
                        {dayEvents.map((evt) => {
                          const cfg = statusConfig[evt.status];
                          return (
                            <div
                              key={evt.id}
                              onClick={() => setSelectedEvent(evt)}
                              className={`p-1 rounded-lg text-[10px] font-bold truncate cursor-pointer transition-transform hover:scale-102 flex items-center justify-between gap-1 shadow-2xs ${cfg.pill}`}
                              title={`${evt.title} - Expiry: ${evt.expiryDate}`}
                            >
                              <span className="truncate">{evt.title}</span>
                              <span className="shrink-0 text-[8px] font-extrabold">{cfg.icon}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: TIMELINE LIST */}
          {viewMode === 'timeline' && (
            <div className="space-y-4">
              {/* Tab Filter Pills */}
              <div className="flex items-center gap-1 bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] p-1 rounded-2xl shadow-sm w-fit">
                {([
                  { id: 'all', label: 'All', count: events.length },
                  { id: 'expired', label: 'Expired', count: expiredCount },
                  { id: 'expiring_soon', label: 'Expiring Soon', count: expiringSoonCount },
                  { id: 'valid', label: 'Valid', count: validCount },
                ] as { id: typeof activeTab; label: string; count: number }[]).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/25'
                        : 'text-[#7B7393] hover:text-[#1E1235] dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-[#7B7393]'}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Timeline Cards */}
              <div className="space-y-3">
                {sortedEvents.length === 0 ? (
                  <div className="bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] rounded-3xl p-12 text-center shadow-sm">
                    <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-base font-bold text-slate-400 dark:text-slate-500">No documents match this timeline filter</p>
                  </div>
                ) : (
                  sortedEvents.map((evt, idx) => {
                    const cfg = statusConfig[evt.status];
                    const progressPct = evt.status === 'expired' ? 100 : evt.status === 'expiring_soon' ? Math.max(5, 100 - (evt.daysRemaining / 30) * 100) : Math.max(5, 100 - (evt.daysRemaining / 365) * 100);
                    const progressColor = evt.status === 'expired' ? 'from-rose-500 to-rose-400' : evt.status === 'expiring_soon' ? 'from-amber-500 to-amber-400' : 'from-emerald-500 to-emerald-400';

                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className="group bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] rounded-2xl p-4 shadow-sm hover:shadow-[0_8px_30px_rgba(255,107,0,0.1)] hover:border-themePrimary/40 transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                            <div className={`w-3 h-3 rounded-full ${cfg.dot} shadow-sm ${evt.status === 'expiring_soon' ? 'animate-pulse' : ''}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.pill}`}>
                                    {cfg.icon} {cfg.label}
                                  </span>
                                  <span className="text-xs text-[#7B7393] font-medium">{evt.category}</span>
                                </div>
                                <h3 className="text-base font-black text-[#1E1235] dark:text-white group-hover:text-themePrimary transition-colors truncate">
                                  {evt.title}
                                </h3>
                              </div>
                              <div className="text-right shrink-0">
                                <p className={`text-xs font-black ${evt.daysRemaining < 0 ? 'text-rose-600' : evt.daysRemaining <= 7 ? 'text-amber-600' : 'text-[#1E1235] dark:text-white'}`}>
                                  {getDaysLabel(evt.daysRemaining)}
                                </p>
                                <p className="text-[11px] text-[#7B7393] font-mono mt-0.5">{formatDate(evt.expiryDate)}</p>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2.5">
                              <div className="flex-1 h-1.5 rounded-full bg-[#F3F0FA] dark:bg-[#1F143A] overflow-hidden">
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700`}
                                  style={{ width: `${Math.min(progressPct, 100)}%` }}
                                />
                              </div>
                              <button
                                onClick={e => { e.stopPropagation(); setRenewModalDoc(evt); setRenewDateInput(evt.expiryDate); }}
                                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white text-xs font-black shadow-sm shadow-orange-500/20 hover:scale-105 transition-transform opacity-0 group-hover:opacity-100 shrink-0"
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
          )}
        </div>

        {/* RIGHT SIDEBAR (1 COL) */}
        <div className="space-y-5">

          {/* UPCOMING DEADLINES SIDEBAR WIDGET */}
          <div className="bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-themePrimary" />
                <h3 className="text-base font-black text-[#1E1235] dark:text-white">Upcoming Deadlines</h3>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-themePrimary">
                {upcomingDeadlines.length} Priority
              </span>
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-[#7B7393] py-4 text-center italic">No upcoming expiry deadlines.</p>
              ) : (
                upcomingDeadlines.map(evt => {
                  const cfg = statusConfig[evt.status];
                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F3F0FA]/60 dark:bg-[#1F143A]/60 hover:bg-orange-50 dark:hover:bg-orange-950/20 border border-transparent hover:border-themePrimary/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot} ${evt.status === 'expiring_soon' ? 'animate-pulse' : ''}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1E1235] dark:text-white truncate group-hover:text-themePrimary transition-colors">{evt.title}</p>
                          <p className="text-[10px] text-[#7B7393]">{formatDate(evt.expiryDate)}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black shrink-0 ${evt.daysRemaining <= 7 ? 'text-rose-500' : evt.daysRemaining <= 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {getDaysLabel(evt.daysRemaining)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CATEGORY RISK BREAKDOWN WIDGET */}
          <div className="bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-themePrimary" />
              <h3 className="text-base font-black text-[#1E1235] dark:text-white">Category Health Breakdown</h3>
            </div>

            <div className="space-y-3">
              {categoryBreakdown.map(([cat, stats]) => {
                const healthPct = Math.round(((stats.total - stats.expired - stats.expiring) / Math.max(stats.total, 1)) * 100);
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1E1235] dark:text-white truncate max-w-[130px]">{cat}</span>
                      <span className="text-[#7B7393] font-mono text-[10px]">{stats.total} total</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F3F0FA] dark:bg-[#1F143A] overflow-hidden flex gap-0.5">
                      {stats.expired > 0 && (
                        <div className="h-full rounded-l-full bg-rose-500" style={{ width: `${(stats.expired / stats.total) * 100}%` }} />
                      )}
                      {stats.expiring > 0 && (
                        <div className="h-full bg-amber-400 animate-pulse" style={{ width: `${(stats.expiring / stats.total) * 100}%` }} />
                      )}
                      {healthPct > 0 && (
                        <div className="h-full rounded-r-full bg-emerald-500" style={{ width: `${healthPct}%` }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STATUS GUIDE CARD */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50/40 dark:from-orange-950/30 dark:to-amber-950/20 border border-orange-100 dark:border-orange-900/40 rounded-3xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-themePrimary" />
              <h3 className="text-sm font-black text-[#1E1235] dark:text-white">Audit Status Guide</h3>
            </div>
            <div className="space-y-2">
              {[
                { dot: 'bg-rose-500', label: 'Expired', desc: 'Overdue deadline — update record now' },
                { dot: 'bg-amber-500 animate-pulse', label: 'Expiring Soon', desc: 'Expires within 30 days — schedule renewal' },
                { dot: 'bg-emerald-500', label: 'Valid / Healthy', desc: 'More than 30 days active' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${item.dot}`} />
                  <div>
                    <span className="text-xs font-bold text-[#1E1235] dark:text-white">{item.label}</span>
                    <p className="text-[11px] text-[#7B7393] leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#1E1235]/70 backdrop-blur-md animate-pop-in">
          <div className="bg-white dark:bg-[#19102E] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EAE4F8] dark:border-[#2D1F47] relative space-y-5">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 p-2 rounded-2xl bg-[#F3F0FA] dark:bg-[#1F143A] text-[#7B7393] hover:text-[#1E1235] dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border inline-block mb-2 ${statusConfig[selectedEvent.status].pill}`}>
                {statusConfig[selectedEvent.status].icon} {statusConfig[selectedEvent.status].label}
              </span>
              <h3 className="text-xl font-black text-[#1E1235] dark:text-white">{selectedEvent.title}</h3>
              <p className="text-xs text-[#7B7393] font-semibold mt-0.5">{selectedEvent.category}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F3F0FA] dark:bg-[#1F143A] border border-[#EAE4F8] dark:border-[#2D1F47]">
                <p className="text-[10px] text-[#7B7393] font-bold uppercase tracking-wider mb-1">Expiry Date</p>
                <p className="text-sm font-black text-[#1E1235] dark:text-white font-mono">{formatDate(selectedEvent.expiryDate)}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F3F0FA] dark:bg-[#1F143A] border border-[#EAE4F8] dark:border-[#2D1F47]">
                <p className="text-[10px] text-[#7B7393] font-bold uppercase tracking-wider mb-1">Days Remaining</p>
                <p className={`text-sm font-black ${selectedEvent.daysRemaining < 0 ? 'text-rose-600' : selectedEvent.daysRemaining <= 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {getDaysLabel(selectedEvent.daysRemaining)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const id = selectedEvent.id;
                  setSelectedEvent(null);
                  if (typeof id === 'number') {
                    setPreviewModalDocId(id);
                  } else {
                    router.push(`/user/documents?q=${encodeURIComponent(selectedEvent.title)}`);
                  }
                }}
                className="flex-1 py-2.5 rounded-2xl border border-[#EAE4F8] dark:border-[#2D1F47] text-[#1E1235] dark:text-white font-bold text-xs hover:bg-[#F3F0FA] dark:hover:bg-[#1F143A] transition flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4 text-themePrimary" /> View Document
              </button>
              <button
                onClick={() => { setRenewModalDoc(selectedEvent); setRenewDateInput(selectedEvent.expiryDate); }}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-black text-xs shadow-md shadow-orange-500/25 hover:scale-105 transition flex items-center justify-center gap-1.5"
              >
                <CalendarCheck className="w-4 h-4" /> Renew Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENEWAL MODAL */}
      {renewModalDoc && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1E1235]/70 backdrop-blur-md animate-pop-in">
          <div className="bg-white dark:bg-[#19102E] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#EAE4F8] dark:border-[#2D1F47] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3F0FA] dark:border-[#2D1F47] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-themePrimary border border-orange-200 dark:border-orange-900 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-[#1E1235] dark:text-white">Renew Expiry Date</h3>
              </div>
              <button onClick={() => setRenewModalDoc(null)} className="p-1.5 rounded-xl text-[#7B7393] hover:text-[#1E1235] hover:bg-[#F3F0FA] transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7B7393]">
              Setting new expiry date for <span className="font-bold text-[#1E1235] dark:text-white">&quot;{renewModalDoc.title}&quot;</span>
            </p>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-[#7B7393] mb-1.5">New Expiration Date</label>
                <input
                  type="date"
                  required
                  value={renewDateInput}
                  onChange={e => setRenewDateInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F3F0FA] dark:bg-[#1F143A] border border-[#EAE4F8] dark:border-[#2D1F47] rounded-2xl text-sm font-bold text-[#1E1235] dark:text-white focus:outline-none focus:border-themePrimary transition"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRenewModalDoc(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-[#EAE4F8] dark:border-[#2D1F47] text-xs font-bold text-[#7B7393] hover:bg-[#F3F0FA] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white text-xs font-black shadow-md shadow-orange-500/25 hover:scale-105 transition"
                >
                  Save Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewModalDocId && (
        <DocumentPreviewModal
          documentId={previewModalDocId}
          onClose={() => setPreviewModalDocId(null)}
          onDownload={() => {}}
        />
      )}
    </div>
  );
}
