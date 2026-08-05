'use client';

import React from 'react';
import Link from 'next/link';
import {
  Settings,
  Palette,
  Languages,
  UserCircle,
  ShieldAlert,
  BellRing,
  HardDrive,
  MonitorCheck,
  ChevronRight
} from 'lucide-react';

export default function AdminSettingsDashboard() {
  const settingsCards = [
    {
      title: 'Theme Management',
      description: 'Manage colors and UI branding applied to the user portal.',
      icon: Palette,
      href: '/admin/settings/themes',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      title: 'Language Management',
      description: 'Configure available languages for the interface.',
      icon: Languages,
      href: '/admin/settings/languages',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      title: 'Profile Fields',
      description: 'Add or modify custom registration and profile fields.',
      icon: UserCircle,
      href: '/admin/settings/profile-fields',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      title: 'Notification Settings',
      description: 'Control automated email and push notifications.',
      icon: BellRing,
      href: '/admin/settings/notifications',
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      title: 'Password Policy',
      description: 'Enforce strong passwords and session timeouts.',
      icon: ShieldAlert,
      href: '/admin/settings/security',
      color: 'bg-rose-50 text-rose-600 border-rose-200'
    },
    {
      title: 'Storage Policy',
      description: 'Manage quotas, max upload sizes, and retention.',
      icon: HardDrive,
      href: '/admin/settings/storage',
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200'
    },
    {
      title: 'System Settings & Info',
      description: 'View server specs, backup database, and JWT config.',
      icon: MonitorCheck,
      href: '/admin/settings/system',
      color: 'bg-slate-100 text-slate-700 border-slate-300'
    }
  ];

  return (
    <div className="space-y-8 pb-12 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-black text-slate-900 font-auth-heading mb-2">
          Admin Settings Dashboard
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Select a category to manage application policies, styling, or system environments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {settingsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-themePrimary/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${card.color} mb-5 shadow-inner`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900 font-auth-heading mb-1.5 group-hover:text-themePrimary transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {card.description}
                </p>
              </div>
              
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-themePrimary transition-colors">
                <span>Manage Settings</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
