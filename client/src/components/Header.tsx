'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu, Search, Bell, Upload, User, ShieldCheck, LogOut,
  Sun, Moon, ChevronDown, Settings, Sparkles, Command
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  getNotifications, 
  getUnreadNotificationCount, 
  markAllNotificationsAsRead, 
  toggleNotificationRead,
  checkAndSyncExpiryNotifications,
  NotificationItem 
} from '@/lib/notificationStore';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [greeting, setGreeting] = useState('Good Morning');
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [notifTab, setNotifTab] = useState<'all' | 'unread' | 'read'>('all');

  const isAdmin = user
    ? user.user_type === 'admin' || (user as any).role === 'admin' || user.email?.toLowerCase().includes('admin')
    : false;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    setNotificationsList(getNotifications());

    const handleUpdate = () => {
      setNotificationsList(getNotifications());
    };
    window.addEventListener('dms_notifications_updated', handleUpdate);

    checkAndSyncExpiryNotifications().then(list => {
      if (list) setNotificationsList(list);
    });

    return () => {
      window.removeEventListener('dms_notifications_updated', handleUpdate);
    };
  }, []);

  const handleMarkAllReadHeader = () => {
    markAllNotificationsAsRead();
    setNotificationsList(getNotifications());
  };

  const handleToggleReadHeader = (id: number | string) => {
    toggleNotificationRead(id);
    setNotificationsList(getNotifications());
  };

  const unreadCount = notificationsList.filter(n => !n.is_read).length;

  const filteredNotifs = notificationsList.filter(n => {
    if (notifTab === 'unread') return !n.is_read;
    if (notifTab === 'read') return n.is_read;
    return true;
  });

  const userName = user?.full_name || 'Kalpana';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between gap-4 sm:gap-6 text-slate-900 dark:text-white shadow-xs transition-all duration-300">
      {/* Left side: Greeting Title & Subtitle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active-press"
          aria-label="Open Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {t('app.welcome', greeting)}, {userName} 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t('app.welcomeSub', 'Manage your documents, folders and categories in one secure place.')}
          </p>
        </div>
      </div>

      {/* Right side: Search, Upload, Theme, Notifications & Profile */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        {/* Global Search Input with Cmd+K Badge */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = (e.currentTarget.elements.namedItem('headerSearch') as HTMLInputElement)?.value;
            if (val) window.location.href = `/user/documents?q=${encodeURIComponent(val.trim())}`;
          }}
          className="relative w-full sm:w-72 md:w-80 group"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-themePrimary transition-colors" />
          <input
            name="headerSearch"
            type="text"
            placeholder={t('common.searchPlaceholder', 'Search documents, folders, categories...')}
            className="w-full pl-10 pr-12 py-2 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-themePrimary focus:ring-2 focus:ring-themePrimary/20 transition-all shadow-inner"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-[10px] font-mono text-slate-600 dark:text-slate-300 pointer-events-none">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </form>

        {/* Upload Document Primary Button */}
        <Link
          href="/user/upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-themePrimary via-[#F97316] to-[#EA580C] hover:brightness-110 text-white shadow-lg shadow-orange-500/25 border border-orange-400/30 transition-all active-press hover:scale-105 shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">{t('nav.uploadDocument', 'Upload Document')}</span>
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all active-press hover:scale-105 shrink-0"
          title={theme === 'dark' ? 'Dark Mode active. Click to switch to Light Mode' : 'Light Mode active. Click to switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <>
              <Moon className="w-4 h-4 text-orange-400 fill-orange-400/20" />
              <span className="hidden sm:inline text-xs font-bold text-orange-300">{t('common.dark', 'Dark')}</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span className="hidden sm:inline text-xs font-bold text-amber-600">{t('common.light', 'Light')}</span>
            </>
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
              setNotificationsList(getNotifications());
            }}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all relative active-press hover:scale-105"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-themePrimary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-themePrimary border border-white dark:border-slate-900" />
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[340px] sm:w-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 p-4 space-y-3 backdrop-blur-xl animate-pop-in text-slate-900 dark:text-white">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-xs font-black flex items-center gap-1.5 font-auth-heading">
                  <Bell className="w-4 h-4 text-themePrimary" /> Notifications
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllReadHeader}
                      className="text-[10px] font-extrabold text-themePrimary hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs Bar (All / Unread / Read) */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-[11px] font-bold">
                <button
                  onClick={() => setNotifTab('all')}
                  className={`flex-1 py-1 rounded-xl transition cursor-pointer text-center ${
                    notifTab === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  All ({notificationsList.length})
                </button>
                <button
                  onClick={() => setNotifTab('unread')}
                  className={`flex-1 py-1 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                    notifTab === 'unread'
                      ? 'bg-white dark:bg-slate-700 text-themePrimary dark:text-orange-400 shadow-2xs font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Unread {unreadCount > 0 && <span className="px-1.5 py-0.2 rounded-full bg-themePrimary text-white text-[9px] font-black">{unreadCount}</span>}
                </button>
                <button
                  onClick={() => setNotifTab('read')}
                  className={`flex-1 py-1 rounded-xl transition cursor-pointer text-center ${
                    notifTab === 'read'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Read ({notificationsList.length - unreadCount})
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredNotifs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6 italic font-medium">No {notifTab !== 'all' ? notifTab : ''} notifications</p>
                ) : (
                  filteredNotifs.slice(0, 8).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-2xl border transition-all text-xs space-y-1 flex items-start justify-between gap-2.5 ${
                        !notif.is_read
                          ? 'bg-orange-50/60 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <Link
                        href={notif.link || '/user/notifications'}
                        onClick={() => setShowNotifications(false)}
                        className="flex-1 min-w-0 space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[200px] font-auth-heading">{notif.title}</span>
                          {!notif.is_read ? (
                            <span className="px-1.5 py-0.2 rounded-md bg-orange-100 text-themePrimary text-[9px] font-black uppercase shrink-0 border border-orange-200">Unread</span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-extrabold uppercase shrink-0">Read</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">{notif.message}</p>
                      </Link>

                      <button
                        onClick={() => handleToggleReadHeader(notif.id)}
                        title={notif.is_read ? "Mark as unread" : "Mark as read"}
                        className={`p-1 rounded-lg border transition shrink-0 mt-0.5 cursor-pointer ${
                          notif.is_read
                            ? 'text-slate-400 border-slate-200 dark:border-slate-700 hover:text-themePrimary'
                            : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        ✓
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-2 text-center">
                <Link
                  href="/user/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-black text-themePrimary dark:text-orange-400 hover:underline inline-flex items-center gap-1 font-auth-heading"
                >
                  View All Notifications Center →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Pill */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left active-press hover:scale-105"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-themePrimary to-[#F97316] text-white font-bold flex items-center justify-center text-xs shadow-md border border-orange-300 dark:border-orange-500/50">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                {userName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize truncate">
                {user?.user_type || 'Individual'}
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-pop-in text-slate-900 dark:text-white">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'user@docvault.io'}</p>
              </div>

              <Link
                href="/user/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-themePrimary dark:hover:text-themePrimary transition-colors font-medium"
              >
                <User className="w-4 h-4 text-themePrimary" />
                <span>{t('nav.userProfile', 'My Profile')}</span>
              </Link>

              <Link
                href="/user/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-themePrimary dark:hover:text-themePrimary transition-colors font-medium"
              >
                <Settings className="w-4 h-4 text-themePrimary" />
                <span>{t('nav.settings', 'Account Settings')}</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-indigo-600 hover:bg-indigo-50 transition-colors font-bold"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Admin Portal</span>
                </Link>
              )}

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>{t('nav.logout', 'Sign Out')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
