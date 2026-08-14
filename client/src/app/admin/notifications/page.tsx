'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bell, Search, Plus, Edit2, Trash2, CheckCircle2, AlertCircle,
  Loader2, RefreshCw, X, AlertTriangle, Info, Clock, CheckCheck, ShieldAlert,
  Send, Filter, BellOff, ArrowUpRight, Zap
} from 'lucide-react';
import {
  getNotifications, markNotificationAsRead, toggleNotificationRead,
  markAllNotificationsAsRead, deleteNotification, clearNotifications,
  addNotification, NotificationItem
} from '@/lib/notificationStore';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read' | 'expiry' | 'warning'>('all');

  // Modals
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | 'delete' | 'clear' | null>(null);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'expiry'>('info');
  const [link, setLink] = useState<string>('/user/documents');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, t: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type: t });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchNotifs = useCallback(() => {
    setLoading(true);
    const list = getNotifications();
    setNotifications(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifs();
    const handleUpdate = () => {
      setNotifications(getNotifications());
    };
    window.addEventListener('dms_notifications_updated', handleUpdate);
    return () => window.removeEventListener('dms_notifications_updated', handleUpdate);
  }, [fetchNotifs]);

  // Unread Count
  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);
  const expiryCount = useMemo(() => notifications.filter(n => n.type === 'expiry').length, [notifications]);
  const warningCount = useMemo(() => notifications.filter(n => n.type === 'warning').length, [notifications]);

  // Filtered Notifications
  const filteredNotifs = useMemo(() => {
    return notifications.filter(n => {
      const matchSearch = !searchQuery.trim() || (
        n.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );
      if (!matchSearch) return false;

      if (activeTab === 'unread') return !n.is_read;
      if (activeTab === 'read') return n.is_read;
      if (activeTab === 'expiry') return n.type === 'expiry';
      if (activeTab === 'warning') return n.type === 'warning';
      return true;
    });
  }, [notifications, searchQuery, activeTab]);

  // Handlers
  const handleOpenCreate = () => {
    setTitle('');
    setMessage('');
    setType('info');
    setLink('/user/documents');
    setActiveModal('create');
  };

  const handleOpenEdit = (notif: NotificationItem) => {
    setSelectedNotif(notif);
    setTitle(notif.title);
    setMessage(notif.message);
    setType(notif.type || 'info');
    setLink(notif.link || '/user/documents');
    setActiveModal('edit');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSubmitting(true);

    addNotification(title.trim(), message.trim(), type, link.trim());
    fetchNotifs();
    showToast(`Broadcast notification "${title.trim()}" created successfully!`);
    setActiveModal(null);
    setSubmitting(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNotif || !title.trim() || !message.trim()) return;
    setSubmitting(true);

    // Update in localStorage
    const list = getNotifications();
    const updated = list.map(n => String(n.id) === String(selectedNotif.id) ? {
      ...n,
      title: title.trim(),
      message: message.trim(),
      type,
      link: link.trim()
    } : n);

    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_notifications', JSON.stringify(updated));
      window.dispatchEvent(new Event('dms_notifications_updated'));
    }

    fetchNotifs();
    showToast('Notification updated successfully!');
    setActiveModal(null);
    setSubmitting(false);
  };

  const handleToggleRead = (id: number | string) => {
    toggleNotificationRead(id);
    fetchNotifs();
  };

  const handleDeleteSubmit = () => {
    if (!selectedNotif) return;
    deleteNotification(selectedNotif.id);
    fetchNotifs();
    showToast('Notification deleted.');
    setActiveModal(null);
  };

  const handleClearAllSubmit = () => {
    clearNotifications();
    fetchNotifs();
    showToast('All notifications cleared.');
    setActiveModal(null);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    fetchNotifs();
    showToast('All notifications marked as read.');
  };

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return iso || '—';
    }
  };

  const typeConfig = {
    expiry:  { label: 'Expiry Notice', icon: AlertTriangle, color: 'text-[#1B664B] dark:text-[#1B664B] bg-[#E8F5F0] dark:bg-emerald-950/60 border-[#D1EBE1] dark:border-amber-900/60' },
    warning: { label: 'Warning', icon: ShieldAlert, color: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/60' },
    success: { label: 'Success', icon: CheckCircle2, color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' },
    info:    { label: 'System Info', icon: Info, color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
  };

  return (
    <div className="space-y-6 pb-12 text-slate-900 dark:text-white font-sans">
      {/* Toast Feedback */}
      {toast && (
        <div className={`fixed top-20 right-6 z-[100000] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold border ${
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
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-auth-heading">
            Notifications Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Full notification CRUD center — broadcast system announcements, edit alerts, toggle read status, or delete items
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchNotifs}
            className="text-xs font-extrabold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-extrabold px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => setActiveModal('clear')}
              className="text-xs font-extrabold px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-[#1B664B] hover:opacity-90 shadow-md shadow-emerald-950/20 hover:scale-105 transition cursor-pointer font-auth-heading"
          >
            <Plus className="w-4 h-4" /> Broadcast Alert
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Notifications', count: notifications.length, bg: 'bg-white dark:bg-[#111827]', border: 'border-slate-200/90 dark:border-slate-800', text: 'text-slate-900 dark:text-white', icon: Bell, iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80' },
          { label: 'Unread Alerts', count: unreadCount, bg: 'bg-white dark:bg-[#111827]', border: 'border-slate-200/90 dark:border-slate-800', text: 'text-[#1B664B] dark:text-[#1B664B]', icon: Zap, iconBg: 'bg-[#E8F5F0] dark:bg-emerald-950/60 text-[#1B664B] dark:text-[#1B664B] border border-[#D1EBE1] dark:border-emerald-900/60' },
          { label: 'Expiry Reminders', count: expiryCount, bg: 'bg-white dark:bg-[#111827]', border: 'border-slate-200/90 dark:border-slate-800', text: 'text-[#1B664B] dark:text-[#1B664B]', icon: AlertTriangle, iconBg: 'bg-[#E8F5F0] dark:bg-emerald-950/60 text-[#1B664B] dark:text-[#1B664B] border border-[#D1EBE1] dark:border-amber-900/60' },
          { label: 'System Warnings', count: warningCount, bg: 'bg-white dark:bg-[#111827]', border: 'border-slate-200/90 dark:border-slate-800', text: 'text-rose-600 dark:text-rose-400', icon: ShieldAlert, iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/90 dark:border-rose-900/60' },
        ].map((kpi, i) => (
          <div
            key={i}
            className={`p-5 rounded-2xl sm:rounded-3xl border ${kpi.border} ${kpi.bg} shadow-2xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4`}
          >
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 font-auth-heading tracking-wider block">
                {kpi.label}
              </span>
              <div className={`text-2xl sm:text-3xl font-black ${kpi.text} font-auth-heading tracking-tight leading-none`}>
                {kpi.count}
              </div>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${kpi.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
              <kpi.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notifications by title or body text..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1B664B] shadow-2xs"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold self-start md:self-auto overflow-x-auto">
          {[
            { key: 'all', label: `All (${notifications.length})` },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'read', label: `Read (${notifications.length - unreadCount})` },
            { key: 'expiry', label: `Expiry (${expiryCount})` },
            { key: 'warning', label: `Warnings (${warningCount})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer font-auth-heading text-xs ${
                activeTab === tab.key
                  ? 'bg-[#1B664B] text-white shadow-md shadow-emerald-950/20 font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60 font-extrabold'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-[#1B664B]" /> Loading notifications...
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500 dark:text-slate-400 font-medium space-y-2">
            <BellOff className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No notifications found.</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Create a broadcast alert to send notifications to users.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider bg-slate-50 dark:bg-[#0B1120]">
                  <th className="py-4 px-5">Alert Title</th>
                  <th className="py-4 px-5">Type</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Date Created</th>
                  <th className="py-4 px-5 text-right">CRUD Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredNotifs.map(notif => {
                  const cfg = typeConfig[notif.type] || typeConfig.info;
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={notif.id}
                      className={`group hover:bg-[#E8F5F0] dark:hover:bg-slate-800/50 transition-all duration-200 ${
                        !notif.is_read ? 'bg-[#E8F5F0] dark:bg-emerald-950/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-start gap-3 max-w-md">
                          <div className={`mt-0.5 w-8 h-8 rounded-xl ${cfg.color} flex items-center justify-center shrink-0 border shadow-2xs`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white text-xs font-auth-heading tracking-tight group-hover:text-[#1B664B] transition-colors">{notif.title}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed mt-0.5">{notif.message}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${cfg.color}`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        {!notif.is_read ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8F5F0] dark:bg-emerald-950/60 text-[#1B664B] dark:text-[#1B664B] border border-[#D1EBE1] dark:border-emerald-900/60 text-[10px] font-black uppercase">
                            🔴 Unread
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-extrabold uppercase">
                            ✓ Read
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-slate-500 dark:text-slate-300 font-mono font-medium whitespace-nowrap">
                        {fmtDate(notif.created_at)}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 inline-flex">
                          <button
                            onClick={() => handleToggleRead(notif.id)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              notif.is_read ? 'text-slate-400 hover:text-[#1B664B] dark:hover:text-[#1B664B] hover:bg-white dark:hover:bg-slate-700' : 'text-emerald-600 bg-white dark:bg-slate-700 shadow-2xs font-extrabold'
                            }`}
                            title={notif.is_read ? "Mark as Unread" : "Mark as Read"}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(notif)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#1B664B] dark:hover:text-[#1B664B] hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                            title="Edit Notification"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => { setSelectedNotif(notif); setActiveModal('delete'); }}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                            title="Delete Notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============ CREATE / EDIT MODAL ============ */}
      {(activeModal === 'create' || activeModal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-pop-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
                <Bell className="w-5 h-5 text-[#1B664B]" />
                {activeModal === 'create' ? 'Broadcast System Notification' : 'Edit Notification'}
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={activeModal === 'create' ? handleCreateSubmit : handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1">Notification Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. System Upgrade Scheduled"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1B664B]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1">Message Body *</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notification message content for users..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1B664B] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1">Alert Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#1B664B] cursor-pointer"
                  >
                    <option value="info">System Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="expiry">Expiry Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1">Action Link (Optional)</label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="/user/documents"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1B664B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1B664B] text-white font-extrabold text-xs shadow-md shadow-emerald-950/20 disabled:opacity-50 transition cursor-pointer flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {activeModal === 'create' ? 'Send Broadcast' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SINGLE NOTIFICATION MODAL */}
      {activeModal === 'delete' && selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-pop-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center text-xs text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white font-auth-heading">Delete Notification?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">&quot;{selectedNotif.title}&quot;</strong>?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL NOTIFICATIONS MODAL */}
      {activeModal === 'clear' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-pop-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center text-xs text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white font-auth-heading">Clear All Notifications?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                This will clear all system notification records for all users.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllSubmit}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
