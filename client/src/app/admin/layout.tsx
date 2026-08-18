'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, Tags, History, BarChart3, Settings, LogOut,
  ShieldCheck, Menu, X, Sun, Moon, KeyRound, Loader2, FolderOpen,
  Search, Command, Bell, Zap, ChevronRight, CreditCard, MessageSquare,
  CheckCheck, Trash2, AlertTriangle, Info, CheckCircle2, Clock, BellOff,
  User, ChevronDown, Sparkles, Plus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
  getNotifications, getUnreadNotificationCount, markNotificationAsRead,
  markAllNotificationsAsRead, toggleNotificationRead, deleteNotification, clearNotifications,
  addNotification, NotificationItem
} from '@/lib/notificationStore';

// ==============================
// Admin Theme Toggle Component
// ==============================
function AdminThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3.5 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 transition-all duration-200 active:scale-95 shrink-0 cursor-pointer shadow-2xs group"
      title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      {theme === 'dark' ? (
        <>
          <Moon className="w-4 h-4 text-emerald-400 fill-emerald-400/20 group-hover:rotate-12 transition-transform duration-300" />
          <span className="hidden sm:inline text-xs font-extrabold text-emerald-300 font-auth-heading tracking-tight">Dark</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-[#1B664B] fill-emerald-500/20 group-hover:rotate-45 transition-transform duration-300" />
          <span className="hidden sm:inline text-xs font-extrabold text-[#1B664B] font-auth-heading tracking-tight">Light</span>
        </>
      )}
    </button>
  );
}

// ==============================
// Notification Panel Component
// ==============================
function NotificationPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [isComposing, setIsComposing] = useState(false);

  // Form fields for creating system notifications
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<'info' | 'warning' | 'success' | 'expiry'>('info');

  const panelRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    const notifs = getNotifications();
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.is_read).length);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setIsComposing(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleToggleRead = (id: number | string) => {
    toggleNotificationRead(id);
    refresh();
  };

  const handleDeleteItem = (id: number | string) => {
    deleteNotification(id);
    refresh();
  };

  const handleMarkAll = () => {
    markAllNotificationsAsRead();
    refresh();
  };

  const handleClear = () => {
    clearNotifications();
    refresh();
  };

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    addNotification(newTitle.trim(), newMessage.trim(), newType, '/admin/activity');
    setNewTitle('');
    setNewMessage('');
    setIsComposing(false);
    refresh();
  };

  const handleClickNotif = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
    refresh();
    setOpen(false);
    if (notif.link) router.push(notif.link);
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const typeConfig = {
    expiry:  { icon: AlertTriangle, color: 'text-[#1B664B] dark:text-emerald-400', bg: 'bg-[#E8F5F0] dark:bg-emerald-950/40', border: 'border-[#D1EBE1] dark:border-emerald-800'  },
    warning: { icon: AlertTriangle, color: 'text-[#1B664B] dark:text-emerald-400', bg: 'bg-[#E8F5F0] dark:bg-emerald-950/40', border: 'border-[#D1EBE1] dark:border-emerald-800' },
    success: { icon: CheckCircle2,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800'},
    info:    { icon: Info,          color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-200 dark:border-blue-800'   },
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.is_read;
    if (activeTab === 'read') return n.is_read;
    return true;
  });

  return (
    <div className="relative font-sans" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(p => !p); refresh(); setIsComposing(false); }}
        className="relative w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:white border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-2xs cursor-pointer group"
        title="System Notifications"
      >
        <Bell className="w-4 h-4 text-slate-700 dark:text-slate-200 group-hover:rotate-12 transition-transform duration-300" />
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-4.5 rounded-full bg-[#1B664B] text-white text-[10px] font-black flex items-center justify-center z-10 border-2 border-white dark:border-slate-900 shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1B664B] rounded-full animate-ping opacity-75" />
          </>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-[390px] sm:w-[420px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-900/15 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-slate-900 dark:text-slate-100 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#E8F5F0] dark:bg-emerald-950/50 text-[#1B664B] border border-[#D1EBE1] dark:border-emerald-900/50 flex items-center justify-center shadow-2xs">
                <Bell className="w-4 h-4 text-[#1B664B]" />
              </span>
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white font-auth-heading tracking-tight flex items-center gap-2">
                  System Notifications
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#1B664B] text-white text-[9px] font-black uppercase tracking-wide">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsComposing(p => !p)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 border shadow-2xs ${
                  isComposing ? 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]' : 'bg-[#1B664B] text-white border-transparent hover:bg-[#14523C] active:scale-95'
                }`}
                title="Send Broadcast Notification"
              >
                <Plus className="w-3.5 h-3.5" /> Broadcast
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  title="Mark all as read"
                  className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClear}
                  title="Clear all notifications"
                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CREATE ANNOUNCEMENT FORM (ADMIN BROADCAST) */}
          {isComposing && (
            <form onSubmit={handleCreateNotification} className="p-4 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 dark:from-orange-950/30 dark:via-slate-900 dark:to-slate-900 border-b border-[#D1EBE1] dark:border-emerald-900/60 space-y-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#1B664B] uppercase tracking-wider text-[10px] font-auth-heading flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1B664B]" /> Create System Notification
                </span>
                <button type="button" onClick={() => setIsComposing(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X className="w-3.5 h-3.5" /></button>
              </div>
              <input
                required
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Notification Title (e.g. Scheduled System Maintenance)"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1B664B]"
              />
              <textarea
                required
                rows={2}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Write message details for system users..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1B664B] resize-none"
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:border-[#1B664B]"
                >
                  <option value="info">Info Alert</option>
                  <option value="warning">Warning Notice</option>
                  <option value="success">Success Brief</option>
                  <option value="expiry">Expiry Reminder</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1B664B] text-white font-extrabold text-xs shadow-md shadow-emerald-950/20 hover:opacity-90 active:scale-95 transition cursor-pointer"
                >
                  Send Alert Broadcast
                </button>
              </div>
            </form>
          )}

          {/* Filter Tabs Bar (All / Unread / Read) */}
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-2xl text-[11px] font-bold w-full">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                  activeTab === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                  activeTab === 'unread' ? 'bg-white dark:bg-slate-700 text-[#1B664B] dark:text-[#1B664B] shadow-2xs font-extrabold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Unread {unreadCount > 0 && <span className="px-1.5 py-0.2 rounded-full bg-[#1B664B] text-white text-[9px] font-black">{unreadCount}</span>}
              </button>
              <button
                onClick={() => setActiveTab('read')}
                className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer text-center ${
                  activeTab === 'read' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Read ({notifications.length - unreadCount})
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <BellOff className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 font-auth-heading">No {activeTab !== 'all' ? activeTab : ''} notifications</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">You&apos;re all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map(notif => {
                const cfg = typeConfig[notif.type] || typeConfig.info;
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    className={`relative flex items-start gap-3.5 px-4 py-3.5 cursor-pointer transition-all duration-200 group ${
                      notif.is_read ? 'hover:bg-slate-50/90 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900' : 'bg-[#E8F5F0] dark:bg-emerald-950/60 hover:bg-[#E8F5F0] dark:hover:bg-[#E8F5F0]'
                    }`}
                    onClick={() => handleClickNotif(notif)}
                  >
                    {/* Status accent border line */}
                    {!notif.is_read ? (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#1B664B] rounded-r-full shadow-sm" />
                    ) : null}

                    {/* Type Icon */}
                    <div className={`mt-0.5 w-8 h-8 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-extrabold leading-snug font-auth-heading truncate ${notif.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#E8F5F0] dark:bg-emerald-950/60 text-[#1B664B] dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider shrink-0 border border-[#D1EBE1] dark:border-emerald-800/60">
                            Unread
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider shrink-0">
                            Read
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1 line-clamp-2 font-medium">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-400 font-mono font-bold">{timeAgo(notif.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions: Toggle Read + Delete Single Item */}
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      <button
                        onClick={e => { e.stopPropagation(); handleToggleRead(notif.id); }}
                        title={notif.is_read ? "Mark as unread" : "Mark as read"}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                          notif.is_read
                            ? 'text-slate-400 hover:text-[#1B664B] hover:bg-[#E8F5F0] border-slate-200 dark:border-slate-700'
                            : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteItem(notif.id); }}
                        title="Delete notification"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80">
              <Link
                href="/admin/activity"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-200 hover:text-[#1B664B] dark:hover:text-[#1B664B] transition"
              >
                View all system activity logs
                <ChevronRight className="w-4 h-4 text-[#1B664B]" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ==============================
// Command Palette Component
// ==============================
function CommandPalette({ open, onClose, router }: { open: boolean; onClose: () => void; router: any }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { label: 'Go to Dashboard Overview', icon: LayoutDashboard, action: () => router.push('/admin'), category: 'Navigation' },
    { label: 'User Account Management', icon: Users, action: () => router.push('/admin/users'), category: 'Navigation' },
    { label: 'System Document Vault', icon: FileText, action: () => router.push('/admin/documents'), category: 'Navigation' },
    { label: 'Folder Management', icon: FolderOpen, action: () => router.push('/admin/folders'), category: 'Navigation' },
    { label: 'Categories & Tagging', icon: Tags, action: () => router.push('/admin/categories'), category: 'Navigation' },
    { label: 'System Activity Logs', icon: History, action: () => router.push('/admin/activity'), category: 'Navigation' },
    { label: 'Broadcast Notifications', icon: Bell, action: () => router.push('/admin/notifications'), category: 'Navigation' },
    { label: 'Reports & Analytics', icon: BarChart3, action: () => router.push('/admin/reports'), category: 'Navigation' },
    { label: 'SaaS Subscriptions', icon: Zap, action: () => router.push('/admin/subscriptions'), category: 'Navigation' },
    { label: 'Billing & Invoicing CRM', icon: CreditCard, action: () => router.push('/admin/billing'), category: 'Navigation' },
    { label: 'Support Desk Tickets', icon: MessageSquare, action: () => router.push('/admin/support'), category: 'Navigation' },
    { label: 'Global Admin Settings', icon: Settings, action: () => router.push('/admin/settings'), category: 'Navigation' },
    { label: 'User Login Portal', icon: Zap, action: () => router.push('/login'), category: 'Quick Action' },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); }
    else { setQuery(''); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl shadow-slate-900/20 overflow-hidden animate-in fade-in duration-200 font-sans" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/80 dark:bg-slate-800/80">
          <Search className="w-4 h-4 text-[#1B664B] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search section..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-full font-bold font-auth-body"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 font-medium">No matching commands found</div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={() => { cmd.action(); onClose(); }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#E8F5F0] dark:hover:bg-slate-800 hover:border-[#1B664B] dark:hover:border-slate-700 border border-transparent text-slate-700 dark:text-slate-200 hover:text-[#1B664B] transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#E8F5F0] dark:bg-emerald-950/60 text-[#1B664B] flex items-center justify-center border border-[#D1EBE1] dark:border-emerald-900/60 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4 text-[#1B664B]" />
                    </div>
                    <span className="text-xs font-black font-auth-heading tracking-tight text-slate-900 dark:text-white group-hover:text-[#1B664B]">{cmd.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold text-slate-400 group-hover:text-[#1B664B] uppercase bg-slate-100 dark:bg-slate-800 group-hover:bg-[#E8F5F0] px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700 transition-colors">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ==============================
// Admin User Profile Dropdown Component
// ==============================
function AdminUserDropdown({ user, logout }: { user: any; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const adminEmail = user?.email || 'admindocvault@gmail.com';
  const adminName = user?.full_name || 'System Administrator';

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleAdminLogout = () => {
    setOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dms_token');
      localStorage.removeItem('dms_user');
      window.dispatchEvent(new Event('dms_profile_updated'));
    }
    if (logout) {
      logout();
    }
    router.replace('/admin/login');
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      <button
        onClick={() => setOpen(p => !p)}
        className="h-9 flex items-center gap-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:bg-[#E8F5F0] dark:hover:bg-slate-700 hover:border-[#1B664B] dark:hover:border-[#1B664B] transition-all duration-200 cursor-pointer group"
      >
        <div className="w-6 h-6 rounded-lg bg-[#1B664B] text-white flex items-center justify-center font-black shadow-xs shrink-0 group-hover:scale-105 transition-transform">
          <User className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="text-left hidden sm:flex flex-col justify-center">
          <span className="text-xs font-black text-slate-900 dark:text-white leading-none truncate max-w-[120px] font-auth-heading">{adminName}</span>
          <span className="text-[9px] font-extrabold text-[#1B664B] tracking-tight leading-none mt-0.5 font-mono">Super Admin</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#1B664B] transition-transform duration-200 ${open ? 'rotate-180 text-[#1B664B]' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 py-2 z-50 animate-in fade-in duration-150 text-xs text-slate-900 dark:text-slate-100 font-sans">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/70 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B664B] text-white flex items-center justify-center font-black shadow-md shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-slate-900 dark:text-white truncate text-xs font-auth-heading">{adminName}</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate font-mono">{adminEmail}</p>
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full mt-1 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified Admin Session
              </span>
            </div>
          </div>

          {/* Menu Links */}
          <div className="p-1.5 space-y-0.5">
            <Link
              href="/admin/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-[#E8F5F0] dark:hover:bg-slate-800 hover:text-[#1B664B] transition-all duration-200"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Admin Profile</span>
            </Link>

            <Link
              href="/admin/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-[#E8F5F0] dark:hover:bg-slate-800 hover:text-[#1B664B] transition-all duration-200"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>System Settings</span>
            </Link>

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-[#E8F5F0] dark:hover:bg-slate-800 hover:text-[#1B664B] transition-all duration-200"
            >
              <Zap className="w-4 h-4 text-[#1B664B]" />
              <span>User Vault Portal</span>
            </Link>
          </div>

          {/* Logout Section */}
          <div className="p-1.5 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleAdminLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 font-extrabold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Logout Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================
// Main Admin Layout Architecture
// ==============================
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState<boolean | null>(null);

  // Command Palette Shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAdminAuth(true);
      return;
    }

    let currentUser: any = user;
    if (!currentUser && typeof window !== 'undefined') {
      const stored = localStorage.getItem('dms_user');
      if (stored) {
        try { currentUser = JSON.parse(stored); } catch (e) {} }
    }

    if (!currentUser || currentUser.user_type !== 'admin') {
      setIsAdminAuth(false);
      router.replace('/admin/login');
    } else {
      setIsAdminAuth(true);
    }
  }, [user, pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isAdminAuth === null || !isAdminAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#1B664B] animate-spin" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 font-auth-body">Verifying Admin Access Credentials...</p>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, badge: null },
    { name: 'Users', href: '/admin/users', icon: Users, badge: null },
    { name: 'Documents', href: '/admin/documents', icon: FileText, badge: null },
    { name: 'Folders', href: '/admin/folders', icon: FolderOpen, badge: null },
    { name: 'Categories', href: '/admin/categories', icon: Tags, badge: null },
    { name: 'Activity Logs', href: '/admin/activity', icon: History, badge: null },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell, badge: 'CRUD' },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3, badge: null },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: Zap, badge: 'SaaS' },
    { name: 'Billing & CRM', href: '/admin/billing', icon: CreditCard, badge: 'CRM' },
    { name: 'Help & Support', href: '/admin/support', icon: MessageSquare, badge: 'Help' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, badge: null },
    { name: 'Themes', href: '/admin/settings/themes', icon: Zap, badge: 'New' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} router={router} />

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setMobileOpen(false)} />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 justify-between bg-white dark:bg-slate-900">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#1B664B] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-black text-base text-slate-900 dark:text-white tracking-tight leading-snug mb-0.5 font-auth-heading">DocVault</span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#1B664B] leading-none font-mono">Admin Center</span>
            </div>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        {/* Quick Search Trigger */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => setCommandOpen(true)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 font-bold transition-all text-xs shadow-2xs group cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#1B664B] group-hover:scale-110 transition-transform" />
            <span className="flex-1 text-left text-slate-600 dark:text-slate-300 font-bold">Search menu...</span>
            <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700 font-mono text-[10px] font-black text-slate-500 dark:text-slate-300 border border-slate-300 dark:border-slate-600 shadow-2xs">⌘K</kbd>
          </button>
        </div>

        {/* Sidebar Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1 font-sans">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 pb-2 pt-1 font-auth-heading">Main Navigation</p>
          {navItems.map(item => {
            const Icon = item.icon;
            let isActive = false;
            if (item.href === '/admin') {
              isActive = pathname === '/admin';
            } else if (item.name === 'Settings') {
              isActive = pathname === '/admin/settings';
            } else {
              isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            }
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  setMobileOpen(false);
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('dms_navigation_click', { detail: { href: item.href } }));
                  }
                }}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 relative ${
                  isActive
                    ? 'bg-[#1B664B] text-white shadow-md font-black'
                    : 'text-slate-700 dark:text-slate-200 hover:text-[#1B664B] hover:bg-[#E8F5F0] dark:hover:bg-slate-800 hover:translate-x-1'
                }`}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full -ml-3.5 animate-scale-up" />}
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isActive ? 'text-white scale-105' : 'text-slate-400 dark:text-slate-400 group-hover:text-[#1B664B]'}`} />
                <span className="flex-1 truncate tracking-tight">{item.name}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${isActive ? 'bg-white/25 text-white' : 'bg-[#E8F5F0] dark:bg-emerald-950/60 text-[#1B664B] dark:text-emerald-300 border border-[#D1EBE1] dark:border-emerald-800/80'}`}>{item.badge}</span>
                )}
              </Link>
            );
          })}

          <div className="pt-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 pb-2 font-auth-heading">Quick Access</p>
            <Link href="/login" className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-[#1B664B] hover:bg-[#E8F5F0] dark:hover:bg-slate-800 transition-all duration-200">
              <Zap className="w-4 h-4 text-[#1B664B] shrink-0 group-hover:scale-110 transition-transform" />
              <span>User Login Portal</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400 group-hover:text-[#1B664B] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:bg-[#E8F5F0] dark:hover:bg-slate-700/60 transition cursor-pointer group">
            <div className="w-8 h-8 rounded-xl bg-[#1B664B] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate font-auth-heading">System Administrator</p>
              <p className="text-[9px] text-[#1B664B] font-extrabold uppercase tracking-wider font-mono">DocVault Admin</p>
            </div>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('dms_token');
                  localStorage.removeItem('dms_user');
                  window.dispatchEvent(new Event('dms_profile_updated'));
                }
                if (logout) logout();
                router.replace('/admin/login');
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
              title="Logout Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 bg-slate-50 dark:bg-[#07110D] text-slate-900 dark:text-[#F5F7F6] transition-colors duration-200">
        {/* Fixed Top Header */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 h-16 bg-white/95 dark:bg-[#0B1F17]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#35D99A]/15 px-4 sm:px-8 flex items-center justify-between transition-all text-slate-900 dark:text-[#F5F7F6] shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0E281E] transition-colors cursor-pointer"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#087443] dark:bg-[#19A974] flex items-center justify-center text-white shadow-sm shrink-0">
                <ShieldCheck className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-[#F5F7F6] tracking-tight leading-none font-auth-heading">
                  Admin Control Center
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#EEF6F2] dark:bg-[#123325] text-[#087443] dark:text-[#35D99A] border border-slate-200 dark:border-[#35D99A]/20 text-[9px] font-black uppercase font-mono tracking-wider shadow-2xs">
                  Admin Portal
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <AdminThemeToggle />

            {/* Quick Search */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-xl bg-slate-100/90 dark:bg-[#0E281E] hover:bg-slate-200/80 dark:hover:bg-[#123325] border border-slate-200/80 dark:border-[#35D99A]/20 text-slate-600 dark:text-[#F5F7F6] transition-all duration-200 text-xs font-semibold shadow-2xs cursor-pointer"
            >
              <Command className="w-3.5 h-3.5 text-[#087443] dark:text-[#35D99A]" />
              <span className="font-extrabold text-slate-800 dark:text-[#F5F7F6]">Quick Search</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-[#123325] font-mono text-[10px] text-slate-500 dark:text-[#9AAFA6] border border-slate-200 dark:border-[#35D99A]/30 shadow-2xs">⌘K</kbd>
            </button>

            {/* Notification Bell */}
            <NotificationPanel />

            {/* Admin User Dropdown */}
            <AdminUserDropdown user={user} logout={logout} />
          </div>
        </header>

        {/* Main Workspace Body */}
        <main className="flex-1 pt-20 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto bg-slate-50 dark:bg-[#07110D] text-slate-900 dark:text-[#F5F7F6] font-sans">
          <Breadcrumbs className="mb-4 sm:mb-6" />
          {children}
        </main>
      </div>
    </div>
  );
}
