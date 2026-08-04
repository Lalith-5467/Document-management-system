'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, Tags, History, BarChart3, Settings, LogOut,
  ShieldCheck, Menu, X, Sun, Moon, KeyRound, Loader2, FolderOpen,
  Search, Command, Bell, Zap, ChevronRight, CreditCard, MessageSquare,
  CheckCheck, Trash2, AlertTriangle, Info, CheckCircle2, Clock, BellOff
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getNotifications, getUnreadNotificationCount, markNotificationAsRead,
  markAllNotificationsAsRead, clearNotifications, NotificationItem
} from '@/lib/notificationStore';

// ==============================
// Notification Panel Component
// ==============================
function NotificationPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleMarkRead = (id: number | string) => {
    markNotificationAsRead(id);
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
    expiry:  { icon: AlertTriangle, color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-500/20'  },
    warning: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-500/20' },
    success: { icon: CheckCircle2,  color: 'text-emerald-400',bg: 'bg-emerald-400/10',border: 'border-emerald-500/20'},
    info:    { icon: Info,          color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-500/20'   },
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(p => !p); refresh(); }}
        className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition shadow-2xs"
        title="System Notifications"
      >
        <Bell className="w-4 h-4 text-slate-300" />
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-themePrimary text-white text-[9px] font-black flex items-center justify-center z-10 border border-[#0f0f19]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-themePrimary rounded-full animate-ping opacity-75" />
          </>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-[360px] bg-slate-950 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-themePrimary" />
              <span className="text-xs font-extrabold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-themePrimary text-white text-[9px] font-black">{unreadCount} new</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClear}
                  title="Clear all notifications"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <BellOff className="w-8 h-8 text-slate-700 mb-3" />
                <p className="text-xs font-bold text-slate-500">No notifications</p>
                <p className="text-[10px] text-slate-600 mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map(notif => {
                const cfg = typeConfig[notif.type] || typeConfig.info;
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    className={`relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition group ${
                      notif.is_read ? 'hover:bg-white/3' : 'bg-white/3 hover:bg-white/5'
                    }`}
                    onClick={() => handleClickNotif(notif)}
                  >
                    {/* Unread dot */}
                    {!notif.is_read && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-themePrimary" />
                    )}

                    {/* Type Icon */}
                    <div className={`mt-0.5 w-7 h-7 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold leading-snug ${notif.is_read ? 'text-slate-400' : 'text-white'}`}>
                        {notif.title}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="w-2.5 h-2.5 text-slate-600" />
                        <span className="text-[9px] text-slate-600 font-mono">{timeAgo(notif.created_at)}</span>
                      </div>
                    </div>

                    {/* Mark read button */}
                    {!notif.is_read && (
                      <button
                        onClick={e => { e.stopPropagation(); handleMarkRead(notif.id); }}
                        title="Mark as read"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-600 hover:text-emerald-400 hover:bg-white/5 transition shrink-0 mt-0.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/5 bg-white/2">
              <Link
                href="/admin/activity"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-themePrimary transition"
              >
                View all activity logs
                <ChevronRight className="w-3 h-3" />
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
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-pop-in" onClick={e => e.stopPropagation()}>
        <div className="p-3 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none w-full font-medium"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No commands found</div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={() => { cmd.action(); onClose(); }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition group text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" />
                    <span>{cmd.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">{cmd.category}</span>
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
// Main Admin Layout
// ==============================
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, loading, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

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

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, badge: null },
    { name: 'Users', href: '/admin/users', icon: Users, badge: null },
    { name: 'Documents', href: '/admin/documents', icon: FileText, badge: null },
    { name: 'Folders', href: '/admin/folders', icon: FolderOpen, badge: null },
    { name: 'Categories', href: '/admin/categories', icon: Tags, badge: null },
    { name: 'Activity Logs', href: '/admin/activity', icon: History, badge: null },
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
      <aside className={`fixed inset-y-0 left-0 z-40 w-[220px] flex flex-col border-r border-slate-200/80 bg-white text-slate-800 shadow-xs transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
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
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-500 hover:text-slate-800 transition text-xs font-medium"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="flex-1 text-left text-slate-500">Search...</span>
            <div className="flex items-center gap-0.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white font-mono text-[9px] text-slate-500 border border-slate-200 shadow-2xs">⌘K</kbd>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-3 pb-2 pt-1 font-mono">Main Menu</p>
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
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-300 rounded-r-full -ml-3" />}
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                <span className="flex-1 font-medium">{item.name}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-orange-50 text-themePrimary border border-orange-200'}`}>{item.badge}</span>
                )}
              </Link>
            );
          })}

          <div className="pt-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-3 pb-2 font-mono">Quick Access</p>
            <a href="/user" target="_blank" className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition">
              <Zap className="w-4 h-4 text-slate-400 group-hover:text-themePrimary" />
              <span>User Portal</span>
              <ChevronRight className="w-3 h-3 ml-auto text-slate-300 group-hover:text-slate-500" />
            </a>
          </div>
        </nav>

        {/* Admin Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:bg-slate-50 transition cursor-pointer group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-themePrimary to-[#F97316] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">System Administrator</p>
              <p className="text-[9px] text-themePrimary font-mono font-bold uppercase tracking-wider">DocVault Admin</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col lg:pl-[220px] min-w-0 bg-slate-50">
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

          <div className="flex items-center gap-2.5">
            {/* Command Palette Btn */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-600 hover:text-slate-900 transition text-xs font-semibold shadow-2xs"
            >
              <Command className="w-3.5 h-3.5 text-themePrimary" />
              <span>Quick Search</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white font-mono text-[10px] text-slate-500 border border-slate-200 shadow-2xs">⌘K</kbd>
            </button>

            {/* Notification Bell */}
            <NotificationPanel />

            {/* User Portal Link */}
            <Link
              href="/user"
              className="h-9 px-4 rounded-xl border border-themePrimary/40 bg-themePrimary/10 text-themePrimary hover:bg-themePrimary hover:text-white text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1.5 font-auth-heading"
            >
              <span>User Portal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
