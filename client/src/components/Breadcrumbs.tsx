'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, LayoutDashboard } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  admin: 'Admin',
  user: 'Dashboard',
  dashboard: 'Dashboard',
  documents: 'My Documents',
  users: 'Users',
  folders: 'Folders',
  categories: 'Categories',
  activity: 'Activity Logs',
  notifications: 'Notifications',
  reports: 'Reports',
  subscriptions: 'Subscriptions',
  billing: 'Billing & CRM',
  support: 'Help & Support',
  profile: 'Profile',
  settings: 'Settings',
  upload: 'Upload Document',
  favorites: 'Favorites',
  trash: 'Recycle Bin',
  expiry: 'Expiry Notifications',
  calendar: 'Calendar View',
  themes: 'Themes',
  security: 'Security',
  storage: 'Storage Telemetry',
  system: 'System Operations',
  'profile-fields': 'Profile Fields',
  languages: 'Language Preferences',
  cms: 'CMS Landing Page'
};

export default function Breadcrumbs({ className = '' }: { className?: string }) {
  const pathname = usePathname();

  if (!pathname || pathname === '/login' || pathname === '/register' || pathname === '/admin/login') {
    return null;
  }

  const isAdmin = pathname.startsWith('/admin');
  const baseSegment = isAdmin ? 'admin' : 'user';
  const rootHref = isAdmin ? '/admin' : '/user';
  const rootName = isAdmin ? 'Admin' : 'Dashboard';

  const rawSegments = pathname.split('/').filter(Boolean);

  // Filter out base segment if it's 'admin' or 'user'
  const filterSegments = rawSegments.filter(s => s !== 'admin' && s !== 'user');

  const items = [
    { name: rootName, href: rootHref }
  ];

  let currentPath = rootHref;
  filterSegments.forEach((seg) => {
    // Add professional parent category breadcrumbs for nested section grouping
    if (seg === 'profile' || seg === 'settings' || seg === 'billing' || seg === 'subscriptions') {
      if (!items.some(i => i.name === 'User Account')) {
        items.push({ name: 'User Account', href: '/user/profile' });
      }
    } else if (seg === 'documents' || seg === 'folders' || seg === 'categories' || seg === 'upload') {
      if (!items.some(i => i.name === 'Workspace')) {
        items.push({ name: 'Workspace', href: '/user/documents' });
      }
    } else if (seg === 'favorites' || seg === 'trash' || seg === 'expiry' || seg === 'notifications' || seg === 'calendar') {
      if (!items.some(i => i.name === 'Vault Collections')) {
        items.push({ name: 'Vault Collections', href: '/user/favorites' });
      }
    }

    currentPath += `/${seg}`;
    const name = ROUTE_LABELS[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    items.push({ name, href: currentPath });
  });

  if (items.length <= 1 && isAdmin) {
    items.push({ name: 'Dashboard', href: '/admin' });
  }

  return (
    <nav className={`flex items-center gap-2 text-xs sm:text-sm font-medium transition-all ${className}`} aria-label="Breadcrumb">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={item.href + idx}>
            {idx > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            )}
            {isLast ? (
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight font-auth-heading">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-slate-500 dark:text-slate-400 hover:text-themePrimary dark:hover:text-themePrimary transition-colors font-medium"
              >
                <span>{item.name}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
