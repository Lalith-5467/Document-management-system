'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity, Search, Download, X, CheckCircle2, AlertCircle, Loader2, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import CustomSelect from '@/components/CustomSelect';

const ACTION_TYPES = [
  { value: 'ALL', label: 'All Activity Logs' },
  { value: 'LOGIN', label: 'Login Events' },
  { value: 'LOGOUT', label: 'Logout Events' },
  { value: 'UPLOAD', label: 'File Uploads' },
  { value: 'DOWNLOAD', label: 'File Downloads' },
  { value: 'DELETE', label: 'File Deletions' },
  { value: 'RESTORE', label: 'Restored Files' },
  { value: 'UPDATE', label: 'Updates' },
  { value: 'CREATE_FOLDER', label: 'Created Folders' },
  { value: 'CREATE_CATEGORY', label: 'Created Categories' },
  { value: 'FAVORITE_ADD', label: 'Favorited Files' },
  { value: 'PROFILE_UPDATE', label: 'Profile Updates' }
];

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [toast, setToast] = useState<any>(null);

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000);
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/activity-logs', {
        params: { search: searchQuery, action_type: actionFilter === 'ALL' ? '' : actionFilter, page, limit: 30 }
      });

      let fetchedLogs = [];
      if (res.data?.success && Array.isArray(res.data.logs)) {
        fetchedLogs = res.data.logs;
      }

      let combinedLogs = fetchedLogs;
      
      let filtered = combinedLogs;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((l: any) =>
          (l.user_name || '').toLowerCase().includes(q) ||
          (l.details || '').toLowerCase().includes(q) ||
          (l.document_name || '').toLowerCase().includes(q) ||
          (l.action_type || '').toLowerCase().includes(q)
        );
      }
      if (actionFilter !== 'ALL') {
        filtered = filtered.filter((l: any) => (l.action_type || '').toUpperCase() === actionFilter.toUpperCase());
      }

      setLogs(filtered);
      setTotalCount(res.data?.totalCount || filtered.length);
      setTotalPages(res.data?.totalPages || Math.ceil(filtered.length / 30) || 1);
    } catch {
      showToast('Failed to load activity logs.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, actionFilter, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleExport = () => {
    const csv = [
      ['ID', 'User', 'Email', 'Action', 'Document', 'Details', 'Date'].join(','),
      ...logs.map(l => [l.id, l.user_name, l.user_email, l.action_type, l.document_name || '', `"${(l.details || '').replace(/"/g, "'")}"`, l.created_at].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `activity_logs_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (s: string) => {
    if (!s) return '—';
    try {
      let cleanStr = String(s).trim();
      if (!cleanStr.endsWith('Z') && !cleanStr.includes('+') && !cleanStr.includes('Z')) {
        cleanStr = cleanStr.replace(' ', 'T') + 'Z';
      }
      const d = new Date(cleanStr);
      if (isNaN(d.getTime())) return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return s;
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-900 dark:text-white font-sans animate-fade-in">
      {toast && (
        <div className={`fixed top-20 right-6 z-[100000] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold border ${
          toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)}><X className="w-4 h-4 ml-2 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-auth-heading tracking-tight flex items-center gap-2.5">
            Activity Audit Logs
            <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5F0] dark:bg-emerald-950/60 text-[#1B664B] dark:text-[#1B664B] text-xs font-extrabold font-mono border border-[#D1EBE1] dark:border-emerald-900/60">
              {totalCount} Logged
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Real-time system telemetry — track logins, logouts, file uploads, deletions & permission edits</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="text-xs font-extrabold px-4 py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer">
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Export CSV
          </button>
          <button onClick={fetchLogs} className="text-xs font-extrabold px-4 py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer">
            <RefreshCw className={`w-4 h-4 text-slate-500 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-[#111827] p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search by user name, email, action, document, or event details..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1B664B]"
          />
        </div>
        <div className="sm:col-span-1">
          <CustomSelect
            value={actionFilter}
            onChange={(val) => { setActionFilter(val); setPage(1); }}
            options={ACTION_TYPES}
            className="w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium"><Loader2 className="w-6 h-6 animate-spin text-[#1B664B]" /> Loading activity audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">No matching activity logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-extrabold uppercase tracking-wider bg-slate-50/90 dark:bg-[#0B1120] font-auth-heading">
                  <th className="py-4 px-6">User Account</th>
                  <th className="py-4 px-6">Event Action</th>
                  <th className="py-4 px-6">Document</th>
                  <th className="py-4 px-6">Event Details</th>
                  <th className="py-4 px-6">Date & Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {logs.map((log, idx) => (
                  <tr key={log.id} style={{ animationDelay: `${(idx % 15) * 35}ms` }} className="group hover:bg-[#E8F5F0] dark:hover:bg-slate-800/50 transition-all duration-200 animate-fade-in">
                    <td className="py-4 px-6 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-[#1B664B] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          {(log.user_name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 dark:text-white text-xs font-auth-heading group-hover:text-[#1B664B] transition-colors truncate">{log.user_name || 'System'}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{log.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs inline-flex items-center gap-1.5 ${
                        log.action_type === 'LOGIN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80' :
                        log.action_type === 'LOGOUT' ? 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1] dark:bg-emerald-950/60 dark:text-[#1B664B] dark:border-amber-800/80' :
                        log.action_type === 'UPLOAD' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800/80' :
                        log.action_type === 'DOWNLOAD' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800/80' :
                        log.action_type === 'DELETE' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/80' :
                        log.action_type === 'CREATE_FOLDER' ? 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1] dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/60' :
                        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}>
                        {log.action_type?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-middle font-bold text-slate-800 dark:text-slate-200 font-auth-heading truncate max-w-[150px]">
                      {log.document_name || '—'}
                    </td>
                    <td className="py-4 px-6 align-middle text-slate-600 dark:text-slate-400 font-medium truncate max-w-[280px]">
                      {log.details}
                    </td>
                    <td className="py-4 px-6 align-middle font-mono text-slate-600 dark:text-slate-400 text-xs font-semibold whitespace-nowrap">
                      {fmt(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0B1120]">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1.5">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}