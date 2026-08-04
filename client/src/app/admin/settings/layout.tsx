'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Settings,
  Palette,
  Languages,
  UserCircle,
  ShieldAlert,
  BellRing,
  HardDrive,
  MonitorCheck,
  LayoutDashboard
} from 'lucide-react';

export default function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const appSettings = [
    { name: 'Overview', href: '/admin/settings', icon: LayoutDashboard },
    { name: 'Theme Management', href: '/admin/settings/themes', icon: Palette },
    { name: 'Language Management', href: '/admin/settings/languages', icon: Languages },
    { name: 'Profile Fields', href: '/admin/settings/profile-fields', icon: UserCircle },
    { name: 'Notification Settings', href: '/admin/settings/notifications', icon: BellRing },
    { name: 'Password Policy', href: '/admin/settings/security', icon: ShieldAlert },
    { name: 'Storage Policy', href: '/admin/settings/storage', icon: HardDrive },
  ];

  const sysSettings = [
    { name: 'System Settings & Info', href: '/admin/settings/system', icon: MonitorCheck },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* Settings Navigation Sidebar */}
      <div className="w-full lg:w-64 shrink-0 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-themePrimary" />
            Global Settings
          </h2>
          <p className="text-xs text-slate-500 font-medium">Manage all application and system-level configurations.</p>
        </div>

        <div className="space-y-6 bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
          {/* App Settings */}
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-3 mb-2 font-mono">
              Application Settings
            </p>
            <nav className="space-y-1">
              {appSettings.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                      isActive
                        ? 'bg-orange-50 text-themePrimary'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-themePrimary rounded-r-full -ml-4" />}
                    <Icon className={`w-4 h-4 ${isActive ? 'text-themePrimary' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <hr className="border-slate-100" />

          {/* Sys Settings */}
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-3 mb-2 font-mono">
              System Settings
            </p>
            <nav className="space-y-1">
              {sysSettings.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                      isActive
                        ? 'bg-orange-50 text-themePrimary'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-themePrimary rounded-r-full -ml-4" />}
                    <Icon className={`w-4 h-4 ${isActive ? 'text-themePrimary' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
