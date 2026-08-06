'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, Tags, History, BarChart3, Settings, LogOut,
  ShieldCheck, Menu, X, Sun, Moon, KeyRound, Loader2, FolderOpen,
  Search, Command, Bell, Zap, ChevronRight, CreditCard, MessageSquare,
  CheckCheck, Trash2, AlertTriangle, Info, CheckCircle2, Clock, BellOff,
  User, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
  getNotifications, getUnreadNotificationCount, markNotificationAsRead,
  markAllNotificationsAsRead, toggleNotificationRead, deleteNotification, clearNotifications,
  addNotification, NotificationItem
} from '@/lib/notificationStore';

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
    expiry:  { icon: AlertTriangle, color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200'  },
    warning: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    success: { icon: CheckCircle2,  color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-200'},
    info:    { icon: Info,          color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.is_read;
    if (activeTab === 'read') return n.is_read;
    return true;
  });

  return (
    <div ref={panelRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(p => !p); refresh(); setIsComposing(false); }}
        className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 flex items-center justify-center transition shadow-2xs cursor-pointer"
        title="System Notifications"
      >
        <Bell className="w-4 h-4 text-slate-700" />
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-themePrimary text-white text-[9px] font-black flex items-center justify-center z-10 border border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-themePrimary rounded-full animate-ping opacity-75" />
          </>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-[390px] bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-slate-900/15 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-orange-50 text-themePrimary border border-orange-200 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-themePrimary" />
              </span>
              <span className="text-xs font-black text-slate-900 font-auth-heading">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-themePrimary to-[#F97316] text-white text-[9px] font-black">{unreadCount} new</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsComposing(p => !p)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition cursor-pointer flex items-center gap-1 border ${
                  isComposing ? 'bg-orange-100 text-themePrimary border-orange-300' : 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white border-transparent shadow-2xs'
                }`}
                title="Send Broadcast Notification"
              >
                + Broadcast
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  title="Mark all as read"
                  className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClear}
                  title="Clear all notifications"
                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CREATE ANNOUNCEMENT FORM (ADMIN CRUD) */}
          {isComposing && (
            <form onSubmit={handleCreateNotification} className="p-4 bg-orange-50/50 border-b border-orange-200/70 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-themePrimary uppercase tracking-wider text-[10px]">Create System Notification</span>
                <button type="button" onClick={() => setIsComposing(false)} className="text-slate-400 hover:text-slate-900"><X className="w-3.5 h-3.5" /></button>
              </div>
              <input
                required
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Notification Title (e.g. System Maintenance)"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-themePrimary"
              />
              <textarea
                required
                rows={2}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Notification message body for users..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-themePrimary resize-none"
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="info">Info Alert</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="expiry">Expiry Notice</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Send Alert
                </button>
              </div>
            </form>
          )}

          {/* Filter Tabs Bar (All / Unread / Read) */}
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-2xl text-[11px] font-bold w-full">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1 rounded-xl transition cursor-pointer text-center ${
                  activeTab === 'all' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 py-1 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                  activeTab === 'unread' ? 'bg-white text-themePrimary shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unread {unreadCount > 0 && <span className="px-1.5 py-0.2 rounded-full bg-themePrimary text-white text-[9px] font-black">{unreadCount}</span>}
              </button>
              <button
                onClick={() => setActiveTab('read')}
                className={`flex-1 py-1 rounded-xl transition cursor-pointer text-center ${
                  activeTab === 'read' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Read ({notifications.length - unreadCount})
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <BellOff className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-xs font-black text-slate-700">No {activeTab !== 'all' ? activeTab : ''} notifications</p>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">You&apos;re all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map(notif => {
                const cfg = typeConfig[notif.type] || typeConfig.info;
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    className={`relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition group ${
                      notif.is_read ? 'hover:bg-slate-50/80 bg-white' : 'bg-orange-50/40 hover:bg-orange-50/70'
                    }`}
                    onClick={() => handleClickNotif(notif)}
                  >
                    {/* Status accent indicator */}
                    {!notif.is_read ? (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-themePrimary shadow-sm shadow-orange-500/50" />
                    ) : null}

                    {/* Type Icon */}
                    <div className={`mt-0.5 w-7 h-7 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0 shadow-2xs`}>
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-black leading-snug font-auth-heading truncate ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read ? (
                          <span className="px-1.5 py-0.2 rounded-md bg-orange-100 text-themePrimary text-[9px] font-black uppercase shrink-0 border border-orange-200">
                            Unread
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500 text-[9px] font-extrabold uppercase shrink-0">
                            Read
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5 line-clamp-2 font-medium">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        <span className="text-[9px] text-slate-500 font-mono font-bold">{timeAgo(notif.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions: Toggle Read + Delete Single Item */}
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      <button
                        onClick={e => { e.stopPropagation(); handleToggleRead(notif.id); }}
                        title={notif.is_read ? "Mark as unread" : "Mark as read"}
                        className={`p-1.5 rounded-xl border transition cursor-pointer ${
                          notif.is_read
                            ? 'text-slate-400 hover:text-themePrimary hover:bg-orange-50 border-slate-200'
                            : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteItem(notif.id); }}
                        title="Delete notification"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 border border-transparent transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/80">
              <Link
                href="/admin/activity"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs font-black text-slate-700 hover:text-themePrimary transition"
              >
                View all activity logs
                <ChevronRight className="w-3.5 h-3.5 text-themePrimary" />
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
    { label: 'Go to Dashboard', icon: LayoutDashboard, action: () => router.push('/admin'), category: 'Navigation' },
    { label: 'Manage Subscriptions', icon: Zap, action: () => router.push('/admin/subscriptions'), category: 'Navigation' },
    { label: 'Subscription Bills & CRM', icon: CreditCard, action: () => router.push('/admin/billing'), category: 'Navigation' },
    { label: 'Manage Users', icon: Users, action: () => router.push('/admin/users'), category: 'Navigation' },
    { label: 'Manage Documents', icon: FileText, action: () => router.push('/admin/documents'), category: 'Navigation' },
    { label: 'Manage Folders', icon: FolderOpen, action: () => router.push('/admin/folders'), category: 'Navigation' },
    { label: 'Manage Categories', icon: Tags, action: () => router.push('/admin/categories'), category: 'Navigation' },
    { label: 'Activity Logs', icon: History, action: () => router.push('/admin/activity'), category: 'Navigation' },
    { label: 'Reports & Analytics', icon: BarChart3, action: () => router.push('/admin/reports'), category: 'Navigation' },
    { label: 'System Settings', icon: Settings, action: () => router.push('/admin/settings'), category: 'Navigation' },
    { label: 'User Portal', icon: Zap, action: () => router.push('/user'), category: 'Quick Actions' },
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
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] p-4 bg-slate-900/40 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl shadow-slate-900/20 overflow-hidden animate-pop-in" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-4 h-4 text-themePrimary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none w-full font-bold font-auth-body"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-500 rounded-lg border border-slate-200 shadow-2xs">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 font-medium">No commands found</div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={() => { cmd.action(); onClose(); }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-orange-50/60 hover:border-orange-200 border border-transparent text-slate-700 hover:text-themePrimary transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-themePrimary flex items-center justify-center border border-orange-200/60 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4 text-themePrimary" />
                    </div>
                    <span className="text-xs font-black font-auth-heading tracking-tight text-slate-900 group-hover:text-themePrimary">{cmd.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold text-slate-400 group-hover:text-themePrimary uppercase bg-slate-100 group-hover:bg-orange-100/60 px-2 py-0.5 rounded-md border border-slate-200/60 transition-colors">
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
    <div className="relative font-poppins" ref={dropdownRef}>
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:bg-orange-50/60 hover:border-orange-200 transition-all cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-themePrimary to-[#F97316] text-white flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-black text-slate-900 leading-none truncate max-w-[130px]">{adminName}</p>
          <span className="text-[10px] font-bold text-themePrimary tracking-tight">Super Admin</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-themePrimary transition-transform duration-200 ${open ? 'rotate-180 text-themePrimary' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-fadeIn text-xs">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-themePrimary to-[#F97316] text-white flex items-center justify-center font-black shadow-md shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-slate-900 truncate text-xs">{adminName}</p>
              <p className="text-[11px] font-medium text-slate-500 truncate">{adminEmail}</p>
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Admin Session
              </span>
            </div>
          </div>

          {/* Menu Links */}
          <div className="p-1 space-y-0.5">
            <Link
              href="/admin/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 font-bold hover:bg-orange-50 hover:text-themePrimary transition"
            >
              <User className="w-4 h-4 text-slate-400 group-hover:text-themePrimary" />
              <span>Admin Profile</span>
            </Link>

            <Link
              href="/admin/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 font-bold hover:bg-orange-50 hover:text-themePrimary transition"
            >
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-themePrimary" />
              <span>System Settings</span>
            </Link>

            <Link
              href="/user"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 font-bold hover:bg-orange-50 hover:text-themePrimary transition"
            >
              <Zap className="w-4 h-4 text-themePrimary" />
              <span>User Vault Portal</span>
            </Link>
          </div>

          {/* Logout Section */}
          <div className="p-1 border-t border-slate-100">
            <button
              onClick={handleAdminLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 font-extrabold hover:bg-rose-50 transition cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================
// Main Admin Layout - Sealed Hook Architecture
// ==============================
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, loading, logout } = useAuth();

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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-themePrimary animate-spin" />
        <p className="text-sm font-bold text-slate-400">Verifying Admin Access Credentials...</p>
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
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} router={router} />

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r border-slate-200/80 bg-white text-slate-800 shadow-xs transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand */}
        <div className="h-14 flex items-center px-5 border-b border-slate-100 justify-between bg-white">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-tr from-themePrimary to-[#F97316] flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-black text-sm text-slate-900 tracking-tight leading-none mb-0.5">DocVault</span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-themePrimary leading-none">Admin Center</span>
            </div>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-700 p-1 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        {/* Search / Command Trigger */}
        <div className="px-3.5 pt-4 pb-2">
          <button
            onClick={() => setCommandOpen(true)}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 text-slate-800 font-bold transition text-xs shadow-2xs"
          >
            <Search className="w-4 h-4 text-themePrimary" />
            <span className="flex-1 text-left text-slate-700 font-bold">Search menu...</span>
            <div className="flex items-center gap-0.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white font-mono text-[10px] font-black text-slate-600 border border-slate-300 shadow-2xs">⌘K</kbd>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 px-3 pb-2 pt-1">Main Menu</p>
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
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/25 font-black'
                    : 'text-slate-800 dark:text-slate-200 font-extrabold hover:text-themePrimary hover:bg-orange-50/80 dark:hover:bg-slate-800'
                }`}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-white rounded-r-full -ml-3" />}
                <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-white scale-105' : 'text-slate-500 dark:text-slate-400 group-hover:text-themePrimary group-hover:scale-105'}`} />
                <span className="flex-1 truncate">{item.name}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white/25 text-white' : 'bg-orange-100 text-orange-800 border border-orange-200/80'}`}>{item.badge}</span>
                )}
              </Link>
            );
          })}

          <div className="pt-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 px-3 pb-2">Quick Access</p>
            <a href="/user" target="_blank" className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-extrabold text-slate-800 hover:text-themePrimary hover:bg-orange-50/80 transition">
              <Zap className="w-4 h-4 text-themePrimary shrink-0" />
              <span>User Portal</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400 group-hover:text-themePrimary transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </nav>

        {/* Admin Footer */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:bg-orange-50/50 transition cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-themePrimary to-[#F97316] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 truncate">System Administrator</p>
              <p className="text-[10px] text-themePrimary font-extrabold uppercase tracking-wider">DocVault Admin</p>
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
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 bg-slate-50">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between transition-all text-slate-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-themePrimary to-[#F97316] flex items-center justify-center text-white shadow-md shadow-orange-500/25">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none flex items-center gap-2 font-auth-heading">
                  Admin Control Center
                  <span className="px-2 py-0.5 rounded-full bg-themePrimary text-white text-[10px] font-extrabold uppercase font-mono tracking-wider shadow-2xs">
                    v2.4
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                  System management, subscriptions, audit logs & user vaults
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Command Palette Btn */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-600 hover:text-slate-900 transition text-xs font-semibold shadow-2xs cursor-pointer"
            >
              <Command className="w-3.5 h-3.5 text-themePrimary" />
              <span>Quick Search</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white font-mono text-[10px] text-slate-500 border border-slate-200 shadow-2xs">⌘K</kbd>
            </button>

            {/* Notification Bell */}
            <NotificationPanel />

            {/* Admin User Profile Dropdown */}
            <AdminUserDropdown user={user} logout={logout} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto bg-slate-50">
          <Breadcrumbs className="mb-4 sm:mb-6" />
          {children}
        </main>
      </div>
    </div>
  );
}
