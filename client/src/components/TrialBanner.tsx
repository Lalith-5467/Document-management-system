'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Clock, AlertTriangle, ShieldAlert, ArrowRight, Zap, X, LogOut, Lock, Crown } from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/AuthContext';

export default function TrialBanner() {
  const pathname = usePathname();
  const { subscription, daysRemaining, isExpired, isTrial, openUpgradeModal } = useSubscription();
  const { logout } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // If user upgraded to active subscription, banner disappears completely
  if (subscription.status === 'active' || dismissed) {
    return null;
  }

  // 1. FULL-SCREEN EXPIRATION OVERLAY
  if (isExpired) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-pop-in">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-8 shadow-2xl shadow-emerald-950/20 border border-slate-200 dark:border-slate-800 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
            🚫
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-black tracking-widest uppercase">
              Trial Expired
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Your Free Trial Has Expired
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
              Upgrade your account to continue using DocVault&apos;s 100ms instant search, OCR, AI document features, and unlimited storage.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left text-xs space-y-2">
            <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#1B664B]" /> Features Currently Locked:
            </p>
            <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              <li>• Document Uploads</li>
              <li>• OCR Text Search</li>
              <li>• AI Smart Indexing</li>
              <li>• Version Control</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openUpgradeModal()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#1B664B] text-white text-xs font-black shadow-lg shadow-emerald-950/20 hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" /> Upgrade Now →
            </button>
            <button
              onClick={() => logout()}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-extrabold hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs flex items-center justify-center gap-1.5 transition"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. PREMIUM MARQUEE TRIAL BANNER (ONLY SHOW ON MAIN USER DASHBOARD PAGE '/user')
  if (pathname !== '/user') {
    return null;
  }

  // 2. PREMIUM MARQUEE TRIAL BANNER
  const isUrgent = daysRemaining <= 1;
  const isWarning = daysRemaining <= 3;

  return (
    <div className="w-full py-3 px-4 sm:px-6 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-between gap-4 text-xs bg-[#E8F5F0] dark:bg-slate-900 border border-[#D1EBE1] dark:border-emerald-900/60 shadow-2xs">
      {/* Left Active Badge (Solid z-20 container to prevent text bleed) */}
      <div className="flex items-center gap-2 shrink-0 z-20 bg-[#E8F5F0] dark:bg-slate-900 pr-2 py-0.5 rounded-full">
        <span className="px-3 py-1 rounded-full bg-[#D1EBE1] dark:bg-emerald-950/80 text-[#1B664B] dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-[#D1EBE1] dark:border-emerald-900/60 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#1B664B] animate-ping" />
          Trial Active
        </span>
      </div>

      {/* CONTINUOUS PROFESSIONAL MARQUEE TICKER WITH SOLID FADE MASKS */}
      <div className="relative flex-1 overflow-hidden mx-2">
        {/* Side Fade Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#E8F5F0] via-[#E8F5F0]/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 dark:to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#E8F5F0] via-[#E8F5F0]/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 dark:to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex items-center whitespace-nowrap gap-16 font-semibold text-slate-700 dark:text-slate-200">
          {/* Item 1 */}
          <div className="flex items-center gap-3">
            <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-[#1B664B] fill-[#1B664B]/20" /> 7-Day Free Trial Mode
            </span>
            <span className="text-[#1B664B] font-bold">•</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              <strong className="text-[#1B664B] font-black underline decoration-[#1B664B] decoration-2">{daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'} Remaining</strong> (₹0 Billed)
            </span>
            <span className="text-[#1B664B] font-bold">•</span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-[#D1EBE1] dark:border-emerald-900/60 text-[#1B664B] dark:text-emerald-300 text-[10px] font-black shadow-2xs">
              ⚡ OCR & AI Search Enabled
            </span>
          </div>

          {/* Item 2 (Duplicated for Seamless 100% Continuous Infinite Loop) */}
          <div className="flex items-center gap-3">
            <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-[#1B664B] fill-[#1B664B]/20" /> 7-Day Free Trial Mode
            </span>
            <span className="text-[#1B664B] font-bold">•</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              <strong className="text-[#1B664B] font-black underline decoration-[#1B664B] decoration-2">{daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'} Remaining</strong> (₹0 Billed)
            </span>
            <span className="text-[#1B664B] font-bold">•</span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-[#D1EBE1] dark:border-emerald-900/60 text-[#1B664B] dark:text-emerald-300 text-[10px] font-black shadow-2xs">
              ⚡ OCR & AI Search Enabled
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls (Solid z-20 container to prevent text bleed) */}
      <div className="flex items-center gap-2 shrink-0 z-20 bg-[#E8F5F0] dark:bg-slate-900 pl-2 py-0.5 rounded-full">
        <button
          onClick={() => openUpgradeModal()}
          className="px-4 py-2 rounded-xl bg-[#1B664B] hover:bg-[#14523C] active:bg-[#0F402E] text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Zap className="w-3.5 h-3.5 fill-white" /> Upgrade Plan
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-xl hover:bg-[#D1EBE1] dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
          title="Dismiss Banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
