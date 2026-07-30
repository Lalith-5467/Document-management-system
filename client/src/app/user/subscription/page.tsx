'use client';

import React, { useState } from 'react';
import {
  Zap, ShieldCheck, Sparkles, CreditCard, Download, Check, X,
  Clock, AlertTriangle, HardDrive, RefreshCw, Lock, ArrowUpRight,
  FileText, CheckCircle2, Gift, ChevronRight, Calendar, Info,
  PlusCircle, Award, SlidersHorizontal
} from 'lucide-react';
import { useSubscription, SubscriptionPlan } from '@/context/SubscriptionContext';
import { useLanguage } from '@/context/LanguageContext';

export default function UserSubscriptionPage() {
  const {
    subscription,
    daysRemaining,
    isExpired,
    isTrial,
    isPro,
    isBusiness,
    openUpgradeModal,
    openPaymentModal,
    cancelSubscription,
    extendTrial,
    plans
  } = useSubscription();

  const { t } = useLanguage();
  const [downloadingInv, setDownloadingInv] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'paid' | 'trial'>('all');
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [savedCard, setSavedCard] = useState({
    cardName: 'Joe Developer',
    cardNumber: '4532 •••• •••• 4242',
    expiry: '08/28',
    brand: 'Visa'
  });
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [extendedAlert, setExtendedAlert] = useState(false);

  const storagePct = Math.min(100, (subscription.storageUsedBytes / subscription.storageLimitBytes) * 100);

  // Filter payment history
  const filteredPayments = subscription.paymentHistory.filter(item => {
    if (filterTab === 'paid') return item.amount > 0;
    if (filterTab === 'trial') return item.amount === 0;
    return true;
  });

  const handleDownloadInvoice = (payId: string, invoiceNo: string, amount: number, planName: string, date: string) => {
    setDownloadingInv(payId);
    setTimeout(() => {
      setDownloadingInv(null);
      const invoiceText = `
================================================================================
                    DOCVAULT ENTERPRISE BILLING INVOICE
================================================================================
Invoice Number  : ${invoiceNo}
Invoice Date    : ${date}
Billing Status  : PAID / AUTHORIZED
Customer Name   : Joe Developer
Customer Email  : user@docvault.io

--------------------------------------------------------------------------------
ITEM DETAILS & SUBSCRIPTION BREAKDOWN
--------------------------------------------------------------------------------
Plan Selected   : ${planName}
Billing Terms   : First 7 Days Free of Cost ($0.00 / ₹0)
Billing Cycle   : ${subscription.billingCycle.toUpperCase()}
Amount Charged  : ₹${amount.toFixed(2)} (Tax Included)
Payment Method  : ${subscription.status === 'trial' ? 'Free 7-Day Trial Promo' : savedCard.cardNumber}

--------------------------------------------------------------------------------
STORAGE & CAPACITIES INCLUDED
--------------------------------------------------------------------------------
- Storage Quota  : ${(subscription.storageLimitBytes / (1024 * 1024 * 1024)).toFixed(0)} GB High-Speed Vault Storage
- Document Limits: Unlimited Document Uploads & Version Control
- OCR Search     : Optical Character Recognition Enabled
- Support Level  : 24/7 Priority Enterprise Support

================================================================================
Thank you for choosing DocVault! For billing inquiries, contact billing@docvault.io
================================================================================
`;
      const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNo}_DocVault_Invoice.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 600);
  };

  const handleExtendTrialClick = () => {
    extendTrial(3);
    setExtendedAlert(true);
    setTimeout(() => setExtendedAlert(false), 4000);
  };

  // Compute trial elapsed day (Day 1 of 7)
  const trialElapsedDays = Math.max(1, Math.min(7, 7 - daysRemaining + 1));
  const trialProgressPct = isTrial ? Math.min(100, (trialElapsedDays / 7) * 100) : 100;

  return (
    <div className="space-y-8 pb-16" style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}>
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#FF6B00] flex items-center justify-center border border-orange-200 dark:border-orange-900/60 shrink-0">
              <Zap className="w-5 h-5 fill-[#FF6B00]" />
            </span>
            Subscription Plans & Billing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            First 7 days are 100% Free of Cost. Manage your active plan, billing history, and invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openUpgradeModal()}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] via-[#F97316] to-[#EA580C] text-white text-xs font-black shadow-lg shadow-orange-500/25 hover:scale-105 transition flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" /> Upgrade Plan
          </button>
        </div>
      </div>

      {/* EXTENDED TRIAL NOTIFICATION ALERT */}
      {extendedAlert && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between animate-pop-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>🎉 Trial Extended Successfully! Added +3 extra days of 100% Free Access to your account.</span>
          </div>
          <button onClick={() => setExtendedAlert(false)} className="text-emerald-600 hover:text-emerald-900 font-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. 7-DAY FREE TRIAL BANNER & STATUS CARD */}
      {isTrial ? (
        <div className="bg-gradient-to-br from-orange-500 via-[#FF6B00] to-[#EA580C] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-500/20 relative overflow-hidden space-y-6">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider border border-white/30">
                <Gift className="w-3.5 h-3.5" /> 7-Day Free Trial Active
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                First 7 Days Free of Cost ($0.00 / ₹0)
              </h2>
              <p className="text-xs text-orange-100 font-medium max-w-xl">
                Enjoy full unrestricted access to DocVault for 7 days. No payment required during your trial. Subscription auto-activates after Day 7.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleExtendTrialClick}
                className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-extrabold transition flex items-center gap-2 backdrop-blur-md"
              >
                <PlusCircle className="w-4 h-4" /> Extend Trial (+3 Days)
              </button>
              <button
                onClick={() => openUpgradeModal()}
                className="px-5 py-2.5 rounded-2xl bg-white text-[#FF6B00] hover:bg-orange-50 text-xs font-black shadow-lg transition flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" /> Select Subscription Plan
              </button>
            </div>
          </div>

          {/* Trial Progress Bar */}
          <div className="space-y-2 pt-2 border-t border-white/20 relative z-10">
            <div className="flex justify-between text-xs font-bold text-orange-100">
              <span>Trial Progress: Day {trialElapsedDays} of 7 Days Free</span>
              <span className="font-mono bg-white/20 px-2.5 py-0.5 rounded-full text-white text-[11px]">
                ⏳ {daysRemaining} Days Remaining (Ends {subscription.renewalDate})
              </span>
            </div>

            <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/30">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${trialProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(255,107,0,0.04)] space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-[#FF6B00] text-[10px] font-black uppercase tracking-wider">
                  Current Active Plan
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {subscription.status.toUpperCase()}
                </span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white pt-1">
                {subscription.planName}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => openUpgradeModal()}
                className="px-5 py-2.5 rounded-2xl bg-[#FF6B00] text-white text-xs font-black shadow-md shadow-orange-500/20 hover:bg-[#E05E00] transition"
              >
                Change Plan
              </button>
              <button
                onClick={cancelSubscription}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-extrabold transition"
              >
                Cancel Subscription
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Renewal Status</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                Auto-Renews Automatically
              </p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Next Billing Date</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                {subscription.renewalDate}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Billing Cycle</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5 uppercase">
                {subscription.billingCycle}
              </p>
            </div>
          </div>

          {/* Storage Quota Progress */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-[#FF6B00]" /> Storage Quota Allocation
              </span>
              <span className="font-mono">
                {(subscription.storageUsedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB / {(subscription.storageLimitBytes / (1024 * 1024 * 1024)).toFixed(0)} GB ({storagePct.toFixed(1)}%)
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-[#FF6B00] via-[#F97316] to-[#EA580C] rounded-full transition-all duration-500"
                style={{ width: `${storagePct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBSCRIPTION PLANS & TIERS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Available Subscription Plans</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              First 7 days free on all plans. Upgrade or switch anytime.
            </p>
          </div>

          {/* Billing Cycle Selector */}
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Annual Billing
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* PROMO CODES BANNER */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-orange-950/40 border border-amber-200 dark:border-orange-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center font-bold text-sm shrink-0">
              🏷️
            </span>
            <div>
              <p className="font-black text-slate-900 dark:text-white">Available Promo Codes & Discounts</p>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                Use code <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border font-mono font-bold text-[#FF6B00]">DOCVAULT20</code> for 20% OFF or <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border font-mono font-bold text-emerald-600">FREEPRO</code> for 100% Free Upgrade!
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 items-stretch">
          {plans.map((plan) => {
            const isCurrentPlan = subscription.planId === plan.id;
            const isPro = plan.id === 'pro';
            const price = billingCycle === 'yearly' ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;

            // Unified Primary Theme Styling (#FF6B00)
            const cardStyle = isPro
              ? 'border-2 border-[#FF6B00] bg-white dark:bg-slate-900 shadow-[0_12px_35px_rgba(255,107,0,0.18)] hover:shadow-[0_25px_60px_rgba(255,107,0,0.35)] hover:-translate-y-2'
              : 'border-2 border-slate-200 dark:border-slate-800 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] bg-white dark:bg-slate-900 shadow-md hover:shadow-[0_20px_50px_rgba(255,107,0,0.22)] hover:-translate-y-2';

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between space-y-6 relative group h-full ${cardStyle}`}
              >
                {/* Primary Orange Top Badge */}
                {plan.badge ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#FF6B00] text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-orange-500/30 transition-transform group-hover:scale-105">
                    ⭐ {plan.badge}
                  </span>
                ) : plan.id === 'free_trial' ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#FF6B00] text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-orange-500/30">
                    🎁 STARTER FREE
                  </span>
                ) : null}

                <div className="space-y-4 relative z-10 flex-1 flex flex-col">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-[#FF6B00] transition-colors">
                        {plan.name}
                      </h3>
                      {isPro && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-ping" />
                      )}
                    </div>

                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-black text-slate-900 dark:text-white text-3xl sm:text-4xl">
                        {plan.priceMonthly === 0 ? '₹0' : `₹${price}`}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {plan.priceMonthly === 0 ? ' / 7 Days Free' : ' / month'}
                      </span>
                    </div>

                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-extrabold bg-orange-50 dark:bg-orange-950/60 text-[#FF6B00] dark:text-orange-400 border border-orange-200 dark:border-orange-900/60 shadow-sm">
                      <Gift className="w-3 h-3" /> First 7 Days Free of Cost
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex-1">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <span className="w-4 h-4 rounded-full bg-orange-50 dark:bg-orange-950/60 text-[#FF6B00] flex items-center justify-center shrink-0 mt-0.5 border border-orange-200 dark:border-orange-900/60">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => openPaymentModal(plan, billingCycle)}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all duration-200 flex items-center justify-center gap-2 active-press mt-auto ${
                    isCurrentPlan
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md hover:scale-[1.02]'
                      : 'bg-gradient-to-r from-[#FF6B00] via-[#F97316] to-[#EA580C] text-white hover:scale-[1.02] shadow-xl shadow-orange-500/30'
                  }`}
                >
                  {isCurrentPlan ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Current Active Plan (Click to Switch)
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" /> Select {plan.name} (7 Days Free)
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SUBSCRIPTION BILLS & INVOICE HISTORY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(255,107,0,0.04)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FF6B00]" /> Subscription Bills & Invoices
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Download itemized invoices, review transaction history, or manage payment card.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl transition ${filterTab === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              All Bills ({subscription.paymentHistory.length})
            </button>
            <button
              onClick={() => setFilterTab('paid')}
              className={`px-3 py-1.5 rounded-xl transition ${filterTab === 'paid' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              Paid Invoices
            </button>
            <button
              onClick={() => setFilterTab('trial')}
              className={`px-3 py-1.5 rounded-xl transition ${filterTab === 'trial' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              Free Trial Bills ($0)
            </button>
          </div>
        </div>

        {/* Bills Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-400 uppercase tracking-wider text-[10px] font-black border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-4">Invoice Date</th>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Plan Name</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredPayments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{item.date}</td>
                  <td className="py-4 px-4 font-mono font-bold text-[#FF6B00] dark:text-orange-400">{item.invoiceNo}</td>
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{item.planName}</td>
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{item.paymentMethod}</td>
                  <td className="py-4 px-4 font-black text-slate-900 dark:text-white">
                    {item.amount === 0 ? 'Free ($0.00)' : `₹${item.amount}`}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      item.amount === 0
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {item.amount === 0 ? '7-Day Free Trial' : 'Paid'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(item.id, item.invoiceNo, item.amount, item.planName, item.date)}
                      disabled={downloadingInv === item.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[#FF6B00] hover:bg-orange-50 dark:hover:bg-orange-950/40 font-bold transition text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {downloadingInv === item.id ? 'Downloading...' : 'PDF Invoice'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. PAYMENT METHOD MANAGEMENT SECTION */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              <CreditCard className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white">Active Payment Method</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {savedCard.brand} ending in <strong className="font-mono">{savedCard.cardNumber.slice(-4)}</strong> (Expires {savedCard.expiry})
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPaymentMethodModal(true)}
            className="px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            Update Payment Method
          </button>
        </div>
      </div>

      {/* UPDATE PAYMENT METHOD MODAL */}
      {showPaymentMethodModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-pop-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative">
            <button
              onClick={() => setShowPaymentMethodModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Update Payment Method</h3>
              <p className="text-xs text-slate-500 font-medium">Enter your credit card or debit card details.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowPaymentMethodModal(false);
                alert('Payment method updated successfully!');
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Name on Card</label>
                <input
                  type="text"
                  required
                  value={savedCard.cardName}
                  onChange={(e) => setSavedCard({ ...savedCard, cardName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Card Number</label>
                <input
                  type="text"
                  required
                  value={savedCard.cardNumber}
                  onChange={(e) => setSavedCard({ ...savedCard, cardNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    required
                    value={savedCard.expiry}
                    onChange={(e) => setSavedCard({ ...savedCard, expiry: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    defaultValue="•••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#FF6B00] text-white font-black text-xs hover:bg-[#E05E00] shadow-md shadow-orange-500/20"
              >
                Save Payment Card
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
