'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import TrialBanner from '@/components/TrialBanner';
import UpgradeModal from '@/components/UpgradeModal';
import PaymentModal from '@/components/PaymentModal';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!token && !user) {
        router.push('/login');
      } else if (user) {
        const isAdmin = user.user_type === 'admin' || (user as any).role === 'admin' || user.email?.toLowerCase().includes('admin');
        if (isAdmin) {
          router.push('/admin');
        }
      }
    }
  }, [loading, token, user, router]);

  const isAdmin = user ? (user.user_type === 'admin' || (user as any).role === 'admin' || user.email?.toLowerCase().includes('admin')) : false;

  if (loading || isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-plus-jakarta), Plus Jakarta Sans, sans-serif' }}>
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-themePrimary" />
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {isAdmin ? 'Redirecting to Admin Control Center...' : 'Loading DocVault Workspace...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200" style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Backdrop overlay for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 bg-transparent transition-colors duration-200">
        <Header onMobileMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto bg-transparent transition-colors duration-200">
          <TrialBanner />
          <Breadcrumbs className="mb-4 sm:mb-6" />
          {children}
          <UpgradeModal />
          <PaymentModal />
        </main>
      </div>
    </div>
  );
}
