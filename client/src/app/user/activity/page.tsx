'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  History, 
  ArrowLeft, 
  Search, 
  Filter, 
  FileUp, 
  Download, 
  Edit2, 
  Trash2, 
  Loader2, 
  RefreshCw,
  ChevronRight, 
  Star, 
  FolderPlus, 
  FolderMinus, 
  UserCheck, 
  LogOut, 
  LogIn, 
  Eye, 
  Tag, 
  SlidersHorizontal, 
  Calendar, 
  Trash, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  FileText
} from 'lucide-react';
import api from '@/lib/api';
import { getUserActivities, clearUserActivities } from '@/lib/activityLogger';
import CustomSelect from '@/components/CustomSelect';

export default function ActivityHistoryPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('all');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const limit = 15;

  // Clear modal & toast
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchActivities();
  }, [debouncedSearch, dateRange, actionTypeFilter, currentPage]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (dateRange !== 'all') params.date_range = dateRange;
      if (actionTypeFilter !== 'ALL') params.action_type = actionTypeFilter;

      const { activities: allLogs } = await getUserActivities(params);

      let filtered = [...allLogs];
      if (debouncedSearch.trim()) {
        const term = debouncedSearch.toLowerCase().trim();
        filtered = filtered.filter(a => 
          (a.document_name && a.document_name.toLowerCase().includes(term)) ||
          (a.details && a.details.toLowerCase().includes(term)) ||
          (a.action_type && a.action_type.toLowerCase().includes(term))
        );
      }
      if (actionTypeFilter !== 'ALL') {
        filtered = filtered.filter(a => a.action_type === actionTypeFilter.toUpperCase());
      }
      if (dateRange !== 'all') {
        const now = new Date();
        const cutoff = dateRange === 'today'
          ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
          : dateRange === '7days'
          ? now.getTime() - 7 * 24 * 3600 * 1000
          : now.getTime() - 30 * 24 * 3600 * 1000;
        filtered = filtered.filter(a => new Date(a.created_at).getTime() >= cutoff);
      }

      const total = filtered.length;
      const pages = Math.ceil(total / limit) || 1;
      const offset = (currentPage - 1) * limit;
      const pageItems = filtered.slice(offset, offset + limit);

      setActivities(pageItems);
      setTotalCount(total);
      setTotalPages(pages);
    } catch (err) {
      console.warn('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      await clearUserActivities();
      setActivities([]);
      setTotalCount(0);
      setTotalPages(1);
      setIsClearModalOpen(false);
      showToast('Activity history cleared successfully!');
    } catch (err) {
      console.error('Failed to clear activity history:', err);
      showToast('Failed to clear activity history.');
    } finally {
      setClearing(false);
    }
  };

  const getActivityBadge = (actionType: string = '') => {
    const act = actionType.toUpperCase();
    if (act.includes('UPLOAD')) {
      return {
        icon: <FileUp className="w-4 h-4 text-blue-600" />,
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-700',
        label: 'Upload'
      };
    }
    if (act.includes('DOWNLOAD')) {
      return {
        icon: <Download className="w-4 h-4 text-emerald-600" />,
        bg: 'bg-emerald-50 border-emerald-200',
        text: 'text-emerald-700',
        label: 'Download'
      };
    }
    if (act.includes('FAVORITE')) {
      return {
        icon: <Star className="w-4 h-4 text-amber-500 fill-amber-400" />,
        bg: 'bg-amber-50 border-amber-200',
        text: 'text-amber-700',
        label: 'Favorite'
      };
    }
    if (act.includes('PREVIEW') || act.includes('VIEW')) {
      return {
        icon: <Eye className="w-4 h-4 text-indigo-600" />,
        bg: 'bg-indigo-50 border-indigo-200',
        text: 'text-indigo-700',
        label: 'View'
      };
    }
    if (act.includes('EDIT') || act.includes('UPDATE') || act.includes('RENAME') || act.includes('MOVE')) {
      return {
        icon: <Edit2 className="w-4 h-4 text-purple-600" />,
        bg: 'bg-purple-50 border-purple-200',
        text: 'text-purple-700',
        label: 'Edit'
      };
    }
    if (act.includes('DELETE') || act.includes('TRASH')) {
      return {
        icon: <Trash2 className="w-4 h-4 text-rose-600" />,
        bg: 'bg-rose-50 border-rose-200',
        text: 'text-rose-700',
        label: 'Delete'
      };
    }
    if (act.includes('FOLDER')) {
      return {
        icon: <FolderPlus className="w-4 h-4 text-cyan-600" />,
        bg: 'bg-cyan-50 border-cyan-200',
        text: 'text-cyan-700',
        label: 'Folder'
      };
    }
    if (act.includes('CATEGORY')) {
      return {
        icon: <Tag className="w-4 h-4 text-teal-600" />,
        bg: 'bg-teal-50 border-teal-200',
        text: 'text-teal-700',
        label: 'Category'
      };
    }
    if (act.includes('LOGIN') || act.includes('LOGOUT') || act.includes('PROFILE')) {
      return {
        icon: <UserCheck className="w-4 h-4 text-slate-700" />,
        bg: 'bg-slate-100 border-slate-200',
        text: 'text-slate-700',
        label: 'Auth & Profile'
      };
    }
    return {
      icon: <History className="w-4 h-4 text-slate-600" />,
      bg: 'bg-slate-50 border-slate-200',
      text: 'text-slate-700',
      label: 'Activity'
    };
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return { date: 'Recently', time: '' };
    try {
      let cleanStr = String(dateStr).trim();
      if (!cleanStr.endsWith('Z') && !cleanStr.includes('+') && !cleanStr.includes('Z')) {
        cleanStr = cleanStr.replace(' ', 'T') + 'Z';
      }
      const d = new Date(cleanStr);
      if (isNaN(d.getTime())) {
        const fallbackDate = new Date(dateStr);
        return {
          date: fallbackDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: fallbackDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        };
      }
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      };
    } catch {
      return { date: dateStr, time: '' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-[100000] bg-slate-900 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Activity History
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Comprehensive audit trail of logins, document uploads, downloads, edits, and deletions</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsClearModalOpen(true)}
            disabled={activities.length === 0}
            className="px-3.5 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash className="w-3.5 h-3.5" /> Clear History
          </button>

          <button
            onClick={fetchActivities}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities or document titles..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Action Type */}
          <CustomSelect
            value={actionTypeFilter}
            onChange={(val) => {
              setActionTypeFilter(val);
              setCurrentPage(1);
            }}
            options={[
              { label: 'All Activity Types', value: 'ALL' },
              { label: 'Uploads', value: 'UPLOAD' },
              { label: 'Downloads', value: 'DOWNLOAD' },
              { label: 'Favorites', value: 'FAVORITE_ADD' },
              { label: 'Views / Previews', value: 'PREVIEW' },
              { label: 'Edits & Moves', value: 'EDIT' },
              { label: 'Deletions', value: 'DELETE' },
              { label: 'Logins & Auth', value: 'LOGIN' },
            ]}
            className="w-full sm:w-52"
          />

          {/* Date Range */}
          <CustomSelect
            value={dateRange}
            onChange={(val) => {
              setDateRange(val);
              setCurrentPage(1);
            }}
            options={[
              { label: 'All Time', value: 'all' },
              { label: 'Today', value: 'today' },
              { label: 'Last 7 Days', value: '7days' },
              { label: 'Last 30 Days', value: '30days' },
            ]}
            className="w-full sm:w-44"
          />
        </div>
      </div>

      {/* Activity Timeline List */}
      {loading ? (
        <div className="bg-white dark:bg-[#111827] p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-md">
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fetching audit activity history logs...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-md max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-800">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">No Activity Logs Found</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {searchQuery || dateRange !== 'all' || actionTypeFilter !== 'ALL'
                ? 'No activities matched your selected filters.'
                : 'No activities recorded yet. Actions like uploading, downloading, favoriting, or updating files will be logged here.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Activity Timeline Audit Log</h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-[#0b1120] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-mono">
              Showing {activities.length} of {totalCount} records
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {activities.map((act) => {
              const badge = getActivityBadge(act.action_type);
              const dt = formatDate(act.created_at);

              return (
                <div key={act.id} className="relative group">
                  {/* Timeline dot */}
                  <div className={`absolute -left-6 top-1 w-6 h-6 rounded-full border flex items-center justify-center shadow-xs ${badge.bg}`}>
                    {badge.icon}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 group-hover:bg-slate-100 dark:group-hover:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                        {act.document_name && (
                          <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1 truncate max-w-xs sm:max-w-md">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {act.document_name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {act.details || 'Performed system operation'}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{dt.date}</div>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{dt.time}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>
                Page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clear Activity History Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] w-full max-w-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800">
              <Trash className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Clear Activity History?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                This action will permanently delete all activity log records from your account history. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleClearHistory}
                disabled={clearing}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-60"
              >
                {clearing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <Trash className="w-4 h-4" />
                    <span>Yes, Clear All History</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
