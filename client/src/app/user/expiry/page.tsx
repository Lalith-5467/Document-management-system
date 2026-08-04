'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock, AlertTriangle, CheckCircle2, Search, Filter, Calendar,
  Download, Eye, ShieldAlert, ArrowUpRight, RefreshCw, X, FileText, Check, Star, ExternalLink
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface ExpiryDocumentItem {
  id: number;
  title: string;
  category: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'valid' | 'expiring_soon' | 'expired';
  fileSize: string;
}

import api from '@/lib/api';
import { logActivity } from '@/lib/activityLogger';
import DocumentPreviewModal from '@/components/dashboard/DocumentPreviewModal';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ExpiryRemindersPage() {
  const { t } = useLanguage();
  const [docs, setDocs] = useState<ExpiryDocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'week' | 'month' | 'expired' | 'upcoming'>('all');

  const [renewModalDoc, setRenewModalDoc] = useState<ExpiryDocumentItem | null>(null);
  const [previewModalDocId, setPreviewModalDocId] = useState<number | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDownload = async (doc: any) => {
    try {
      showToast(`Downloading ${doc.title}...`);
      logActivity('DOWNLOAD', doc.title, `Downloaded document "${doc.title}"`);
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('dms_token') : '';
      const envApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const baseUrl = envApiUrl.endsWith('/') ? envApiUrl.slice(0, -1) : envApiUrl;
      const rootUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
      
      const downloadUrl = `${rootUrl}/api/documents/${doc.id}/download${token ? `?token=${token}` : ''}`;
      window.location.assign(downloadUrl);
      
      showToast('Download initiated.');
    } catch (err) {
      showToast('Failed to initiate download.');
    }
  };

  React.useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/documents?limit=1000');
        if (res.data?.success && Array.isArray(res.data.documents)) {
          const items = res.data.documents
            .filter((d: any) => d.expiry_date != null)
            .map((d: any) => {
              const eDate = new Date(d.expiry_date);
              const now = new Date();
              const diffDays = Math.ceil((eDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              let status: 'valid' | 'expiring_soon' | 'expired' = 'valid';
              if (diffDays <= 0) status = 'expired';
              else if (diffDays <= 30) status = 'expiring_soon';

              return {
                id: d.id,
                title: d.title || d.file_name,
                category: d.category_name || 'General Document',
                expiryDate: d.expiry_date,
                daysRemaining: diffDays,
                status: status,
                fileSize: formatFileSize(d.file_size || 0)
              };
            });
          setDocs(items);
        }
      } catch (err) {
        console.error('Failed to fetch expiry documents:', err);
      }
    };
    fetchDocs();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredDocs = useMemo(() => {
    return docs.filter(d => {
      const matchSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (activeTab === 'expired') return d.status === 'expired';
      if (activeTab === 'upcoming') return d.status === 'expiring_soon';
      if (activeTab === 'today') return d.daysRemaining === 0;
      if (activeTab === 'week') return d.daysRemaining >= 0 && d.daysRemaining <= 7;
      if (activeTab === 'month') return d.daysRemaining >= 0 && d.daysRemaining <= 30;
      return true;
    });
  }, [docs, searchQuery, activeTab]);

  const validCount = docs.filter(d => d.status === 'valid').length;
  const expiringCount = docs.filter(d => d.status === 'expiring_soon').length;
  const expiredCount = docs.filter(d => d.status === 'expired').length;

  const handleUpdateExpiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewModalDoc || !newExpiryDate) return;

    try {
      const res = await api.put(`/documents/${renewModalDoc.id}`, {
        expiry_date: newExpiryDate
      });
      if (res.data?.success) {
        const newDate = new Date(newExpiryDate);
        const now = new Date();
        const diffDays = Math.ceil((newDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        setDocs(prev => prev.map(item => {
          if (item.id === renewModalDoc.id) {
            return {
              ...item,
              expiryDate: newExpiryDate,
              daysRemaining: diffDays,
              status: diffDays <= 0 ? 'expired' : diffDays <= 30 ? 'expiring_soon' : 'valid'
            };
          }
          return item;
        }));

        showToast(`Expiry date updated for ${renewModalDoc.title}`);
        setRenewModalDoc(null);
      }
    } catch (err) {
      console.error('Failed to update expiry date:', err);
      showToast('Failed to update expiry date');
    }
  };

  return (
    <div className="space-y-6 pb-16" style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}>
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] text-[#1E1235] dark:text-white text-sm font-bold shadow-2xl animate-pop-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1235] dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </span>
            Expiry Reminders
          </h1>
          <p className="text-sm text-[#7B7393] dark:text-[#A39BB8] mt-1 font-medium">
            Monitor passports, driving licenses, insurance policies, and contract renewal deadlines.
          </p>
        </div>
      </div>

      {/* 3 STATUS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Valid */}
        <div className="bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] p-5 rounded-3xl shadow-[0_8px_30px_rgb(108,92,231,0.04)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              🟢 Valid Documents
            </span>
            <h3 className="text-3xl font-black text-[#1E1235] dark:text-white">{validCount}</h3>
            <p className="text-xs text-[#7B7393]">More than 30 days remaining</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Expiring Soon */}
        <div className="bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] p-5 rounded-3xl shadow-[0_8px_30px_rgb(108,92,231,0.04)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              🟡 Expiring Soon
            </span>
            <h3 className="text-3xl font-black text-[#1E1235] dark:text-white">{expiringCount}</h3>
            <p className="text-xs text-[#7B7393]">Expires within 30 days</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Expired */}
        <div className="bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] p-5 rounded-3xl shadow-[0_8px_30px_rgb(108,92,231,0.04)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              🔴 Expired Documents
            </span>
            <h3 className="text-3xl font-black text-[#1E1235] dark:text-white">{expiredCount}</h3>
            <p className="text-xs text-[#7B7393]">Action required for renewal</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR BAR */}
      <div className="bg-white dark:bg-[#19102E] p-4 rounded-3xl border border-[#EAE4F8] dark:border-[#2D1F47] shadow-[0_6px_24px_rgba(108,92,231,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-[#F3F0FA] dark:bg-[#1F143A] p-1 rounded-2xl border border-[#EAE4F8] dark:border-[#2D1F47] w-full sm:w-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'expired', label: 'Expired' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-sm font-black transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/25'
                  : 'text-[#7B7393] hover:text-[#1E1235] dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B7393]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expiring files..."
            className="w-full pl-10 pr-4 py-2 bg-[#F3F0FA] dark:bg-[#1F143A] border border-[#EAE4F8] dark:border-[#2D1F47] rounded-2xl text-sm text-[#1E1235] dark:text-white placeholder:text-[#7B7393] focus:outline-none focus:border-themePrimary"
          />
        </div>
      </div>

      {/* DOCUMENT EXPIRY CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => {
          const isExpired = doc.status === 'expired';
          const isWarning = doc.status === 'expiring_soon';

          return (
            <div
              key={doc.id}
              className={`bg-white dark:bg-[#19102E] border rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-xl transition-all card-hover-subtle relative ${
                isExpired
                  ? 'border-rose-300 dark:border-rose-900/60'
                  : isWarning
                  ? 'border-amber-300 dark:border-amber-900/60'
                  : 'border-[#EAE4F8] dark:border-[#2D1F47]'
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-black uppercase border ${
                    isExpired
                      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                      : isWarning
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}
                >
                  {isExpired
                    ? `🔴 Your ${doc.title.split('.')[0].substring(0, 15)} was expired`
                    : isWarning
                    ? `🟡 ${doc.daysRemaining} Days Remaining`
                    : '🟢 Valid'}
                </span>

                <span className="text-xs text-[#7B7393] font-mono">{doc.fileSize}</span>
              </div>

              <div>
                <h3 className="text-base font-black text-[#1E1235] dark:text-white truncate" title={doc.title}>
                  {doc.title}
                </h3>
                <p className="text-sm text-[#7B7393] font-medium mt-0.5">{doc.category}</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#F3F0FA] dark:bg-[#1F143A] border border-[#EAE4F8] dark:border-[#2D1F47] flex items-center justify-between text-sm font-mono">
                <span className="text-[#7B7393]">Expiry Date:</span>
                <span className="font-bold text-[#1E1235] dark:text-white">{doc.expiryDate}</span>
              </div>

              <div className="pt-2 border-t border-[#F3F0FA] dark:border-[#2D1F47] flex items-center justify-between">
                <button
                  onClick={() => {
                    logActivity('PREVIEW', doc.title, `Viewed document preview for "${doc.title}"`);
                    setPreviewModalDocId(doc.id);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#EAE4F8] dark:border-[#2D1F47] text-[#7B7393] hover:text-[#1E1235] dark:hover:text-white text-sm font-bold transition flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>

                <button
                  onClick={() => { setRenewModalDoc(doc); setNewExpiryDate(doc.expiryDate); }}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white text-sm font-black shadow-md shadow-orange-500/25 hover:scale-105 transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Renew Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* RENEW MODAL */}
      {renewModalDoc && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#1E1235]/70 backdrop-blur-md animate-pop-in">
          <div className="bg-white dark:bg-[#19102E] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EAE4F8] dark:border-[#2D1F47] relative space-y-4 text-sm">
            <button
              onClick={() => setRenewModalDoc(null)}
              className="absolute top-5 right-5 p-2 rounded-2xl bg-[#F3F0FA] dark:bg-[#1F143A] text-[#7B7393] hover:text-[#1E1235]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-[#1E1235] dark:text-white">Renew Expiry Date</h3>
            <p className="text-sm text-[#7B7393]">Updating document renewal record for <strong className="text-[#1E1235] dark:text-white">&quot;{renewModalDoc.title}&quot;</strong>.</p>

            <form onSubmit={handleUpdateExpiry} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-xs text-[#7B7393]">New Expiry Date</label>
                <input
                  type="date"
                  required
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F3F0FA] dark:bg-[#1F143A] border border-[#EAE4F8] dark:border-[#2D1F47] rounded-2xl text-sm font-bold text-[#1E1235] dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-black text-sm shadow-md shadow-orange-500/25 hover:scale-105 transition"
              >
                Save New Expiry Date
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewModalDocId && (
        <DocumentPreviewModal
          documentId={previewModalDocId}
          onClose={() => setPreviewModalDocId(null)}
          onDownload={handleDownload as any}
        />
      )}
    </div>
  );
}
