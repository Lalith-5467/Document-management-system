'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, CheckCircle2, AlertTriangle, Info, Clock, Trash2, Check, Search, 
  ArrowLeft, RefreshCw, ExternalLink, Filter, ShieldAlert, Sparkles, X, FileText, ChevronRight
} from 'lucide-react';
import { 
  getNotifications, 
  getUnreadNotificationCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  clearNotifications,
  checkAndSyncExpiryNotifications,
  NotificationItem 
} from '@/lib/notificationStore';

export default function NotificationsCenterPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'expiry' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };
    window.addEventListener('dms_notifications_updated', handleUpdate);

    checkAndSyncExpiryNotifications().then(list => {
      if (list) setNotifications(list);
    });

    return () => {
      window.removeEventListener('dms_notifications_updated', handleUpdate);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadNotifications = () => {
    const list = getNotifications();
    setNotifications(list);
  };

  const handleMarkAsRead = (id: number | string) => {
    const updated = markNotificationAsRead(id);
    setNotifications(updated);
    showToast('Marked as read');
  };

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications(updated);
    showToast('All notifications marked as read!');
  };

  const handleClearAll = () => {
    const updated = clearNotifications();
    setNotifications(updated);
    showToast('Notifications cleared');
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.is_read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeTab === 'unread' && n.is_read) return false;
      if (activeTab === 'expiry' && n.type !== 'expiry') return false;
      if (activeTab === 'system' && n.type !== 'warning' && n.type !== 'info') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      }
      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const formatTime = (isoStr: string) => {
    if (!isoStr) return 'Recently';
    try {
      let cleanStr = String(isoStr).trim();
      if (!cleanStr.endsWith('Z') && !cleanStr.includes('+')) cleanStr += 'Z';
      const d = new Date(cleanStr);
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return isoStr;
    }
  };

  const getNotifBadge = (type: string) => {
    switch (type) {
      case 'expiry':
        return {
          icon: <Clock className="w-4.5 h-4.5 text-amber-500" />,
          bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300',
          label: 'Expiry Notice'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />,
          bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300',
          label: 'System Alert'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />,
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300',
          label: 'Success'
        };
      default:
        return {
          icon: <Info className="w-4.5 h-4.5 text-blue-500" />,
          bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300',
          label: 'Information'
        };
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans max-w-6xl mx-auto">
      {/* Toast Feedback */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[1000] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold transition-all animate-bounce-once ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-800 text-emerald-100' : 'bg-rose-950/90 border-rose-800 text-rose-100'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Notifications Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Real-time updates, expiration alerts, document operations, and storage quota warnings.
          </p>
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="px-3.5 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition flex items-center gap-1.5 disabled:opacity-40 active:scale-95"
          >
            <Check className="w-3.5 h-3.5 text-emerald-500" /> Mark All as Read
          </button>

          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="px-3.5 py-2 text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-xl transition flex items-center gap-1.5 disabled:opacity-40 active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'expiry', label: 'Expirations', count: notifications.filter(n => n.type === 'expiry').length },
            { id: 'system', label: 'System Alerts', count: notifications.filter(n => n.type === 'warning' || n.type === 'info').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-xs px-1.5 py-0.2 rounded-full font-mono font-black ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-themePrimary"
          />
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-16 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-lg max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-themePrimary dark:text-orange-400 flex items-center justify-center mx-auto border border-orange-200 dark:border-orange-900/60">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-lg">No Notifications</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-medium">
              You are all caught up! Updates about document uploads, renewals, and storage alerts will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const badge = getNotifBadge(notif.type);

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-3xl border transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  !notif.is_read
                    ? 'bg-orange-50/40 dark:bg-orange-950/20 border-themePrimary/40 dark:border-orange-900/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${badge.bg}`}>
                    {badge.icon}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{notif.title}</h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-themePrimary animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 block pt-0.5">
                      {formatTime(notif.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700"
                    >
                      Mark Read
                    </button>
                  )}

                  {notif.link && (
                    <button
                      onClick={() => {
                        handleMarkAsRead(notif.id);
                        router.push(notif.link!);
                      }}
                      className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-themePrimary to-[#F97316] rounded-xl shadow-md shadow-orange-500/20 hover:scale-105 transition flex items-center justify-center gap-1.5"
                    >
                      <span>View</span> <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
