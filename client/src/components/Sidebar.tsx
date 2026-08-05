'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  FileText,
  FolderClosed,
  Tags,
  Upload,
  Star,
  Clock,
  Trash2,
  History,
  User as UserIcon,
  Settings,
  ShieldCheck,
  HelpCircle,
  LogOut,
  Zap,
  Calendar,
  Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getUnreadNotificationCount } from '@/lib/notificationStore';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    setUnreadCount(getUnreadNotificationCount());

    const handleUpdate = () => {
      setUnreadCount(getUnreadNotificationCount());
    };
    window.addEventListener('dms_notifications_updated', handleUpdate);
    return () => {
      window.removeEventListener('dms_notifications_updated', handleUpdate);
    };
  }, [pathname]);

  const mainNavItems = [
    { name: t('home', 'Home'), href: '/', icon: Home },
    { name: t('dashboard', 'Dashboard'), href: '/user', icon: LayoutDashboard },
    { name: t('myDocuments', 'My Documents'), href: '/user/documents', icon: FileText },
    { name: t('upload', 'Upload Document'), href: '/user/upload', icon: Upload },
    { name: t('folders', 'Workspace Folders'), href: '/user/folders', icon: FolderClosed },
    { name: t('categories', 'Categories'), href: '/user/categories', icon: Tags },
  ];

  const secondaryNavItems = [
    { name: t('notifications', 'Notifications Center'), href: '/user/notifications', icon: Bell },
    { name: t('favorites', 'Favorites'), href: '/user/favorites', icon: Star },
    { name: t('calendar', 'Calendar'), href: '/user/calendar', icon: Calendar },
    { name: t('expiry', 'Expiry Reminders'), href: '/user/expiry', icon: Clock },
    { name: t('trash', 'Recycle Bin'), href: '/user/trash', icon: Trash2 },
    { name: t('activity', 'Activity History'), href: '/user/activity', icon: History },
  ];

  const userNavItems = [
    { name: t('profile', 'Profile'), href: '/user/profile', icon: UserIcon },
    { name: t('subscription', 'Subscription & Billing'), href: '/user/subscription', icon: Zap },
    { name: t('settings', 'Settings'), href: '/user/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-white transform transition-all duration-300 ease-out lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      } flex flex-col border-r border-slate-200/80 dark:border-slate-800/80`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-themePrimary to-[#F97316] text-white flex items-center justify-center font-extrabold shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-300">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-base text-slate-900 dark:text-white tracking-tight leading-none block">
              DocVault
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5 font-sans whitespace-nowrap tracking-tight">
              Document Management System
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6 scrollbar-none">
        {/* MY WORKSPACE */}
        <div>
          <div className="px-3 mb-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t('nav.myWorkspace', 'MY WORKSPACE')}
          </div>
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href + item.name}
                  href={item.href}
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 group active-press ${
                    isActive
                      ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/20 font-black border border-orange-400/30'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-orange-50/80 dark:hover:bg-slate-800/80 hover:text-themePrimary dark:hover:text-white font-extrabold'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-150 ${isActive ? 'text-white scale-105' : 'text-slate-500 dark:text-slate-400 group-hover:scale-105 group-hover:text-themePrimary dark:group-hover:text-white'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* VAULT COLLECTIONS */}
        <div>
          <div className="px-3 mb-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t('nav.vaultCollections', 'VAULT COLLECTIONS')}
          </div>
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href + item.name}
                  href={item.href}
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 group active-press ${
                    isActive
                      ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/20 font-black border border-orange-400/30'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-orange-50/80 dark:hover:bg-slate-800/80 hover:text-themePrimary dark:hover:text-white font-extrabold'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-150 ${isActive ? 'text-white scale-105' : 'text-slate-500 dark:text-slate-400 group-hover:scale-105 group-hover:text-themePrimary dark:group-hover:text-white'}`} />
                  <span className="truncate">{item.name}</span>
                  {item.href === '/user/notifications' && unreadCount > 0 && (
                    <span className="ml-auto flex h-2 w-2 relative shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-themePrimary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-themePrimary" />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* USER ACCOUNT */}
        <div>
          <div className="px-3 mb-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t('nav.userAccount', 'USER ACCOUNT')}
          </div>
          <div className="space-y-1">
            {userNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href + item.name}
                  href={item.href}
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 group active-press ${
                    isActive
                      ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/20 font-black border border-orange-400/30'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-orange-50/80 dark:hover:bg-slate-800/80 hover:text-themePrimary dark:hover:text-white font-extrabold'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-150 ${isActive ? 'text-white scale-105' : 'text-slate-500 dark:text-slate-400 group-hover:scale-105 group-hover:text-themePrimary dark:group-hover:text-white'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}

            <button
              onClick={() => {
                if (setMobileOpen) setMobileOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 hover:text-rose-700 transition-all duration-150 group active-press text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500 shrink-0 group-hover:scale-105 transition-transform" />
              <span className="truncate">{t('logout', 'Logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
