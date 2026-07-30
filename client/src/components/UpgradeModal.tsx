'use client';

import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, ShieldCheck, Lock, Star, ChevronRight } from 'lucide-react';
import { useSubscription, SubscriptionPlan } from '@/context/SubscriptionContext';

export default function UpgradeModal() {
  const {
    upgradeModalOpen,
    closeUpgradeModal,
    selectedPlanForUpgrade,
    plans,
    openPaymentModal
  } = useSubscription();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  if (!upgradeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-pop-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl shadow-orange-500/10 border border-slate-200 dark:border-slate-800 relative space-y-6 my-8">
        {/* Close Button */}
        <button
          onClick={closeUpgradeModal}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-[#FF6B00] dark:text-orange-400 text-[11px] font-black tracking-wider uppercase border border-orange-200 dark:border-orange-900/60">
            <Sparkles className="w-3.5 h-3.5" /> Unlock DocVault Premium
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Choose the Perfect Plan for Your Vault
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Scale your document management with AI search, OCR extraction, version history, and enterprise storage.
          </p>
        </div>

        {/* Monthly / Yearly Toggle Switch */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-7 bg-[#FF6B00] rounded-full p-1 transition-colors relative flex items-center shadow-inner"
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              Annual Billing
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
              Save 20%
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {plans.map((plan) => {
            const isPro = plan.id === 'pro';
            const price = billingCycle === 'yearly' ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 flex flex-col justify-between space-y-6 relative transition-all duration-200 ${
                  isPro
                    ? 'bg-gradient-to-b from-[#FF6B00] to-[#EA580C] text-white shadow-xl shadow-orange-500/25 border-2 border-orange-400 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <span
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${
                      isPro
                        ? 'bg-slate-900 text-white border border-slate-700'
                        : 'bg-orange-100 text-[#FF6B00]'
                    }`}
                  >
                    ⭐ {plan.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className={`text-base font-black ${isPro ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {plan.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className={`text-3xl font-black ${isPro ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {plan.priceMonthly === 0 ? '₹0' : `₹${price}`}
                      </span>
                      <span className={`text-xs font-semibold ${isPro ? 'text-orange-100' : 'text-slate-500'}`}>
                        {plan.priceMonthly === 0 ? ' / 7 Days Free' : ' / month'}
                      </span>
                    </div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-white/20 text-white dark:bg-orange-950/60 dark:text-orange-300">
                      🎁 7 Days 100% Free ($0)
                    </div>
                    {billingCycle === 'yearly' && plan.priceMonthly > 0 && (
                      <p className={`text-[10px] font-bold mt-0.5 ${isPro ? 'text-orange-100' : 'text-emerald-600'}`}>
                        Billed annually (₹{plan.priceYearly}/year)
                      </p>
                    )}
                  </div>

                  {/* Feature Checkmarks */}
                  <div className="space-y-2.5 pt-2 border-t border-current/10">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs font-medium">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isPro ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                          }`}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <span className={isPro ? 'text-orange-50' : 'text-slate-700 dark:text-slate-200'}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (plan.id === 'free_trial') {
                      closeUpgradeModal();
                    } else {
                      openPaymentModal(plan, billingCycle);
                    }
                  }}
                  className={`w-full py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                    isPro
                      ? 'bg-white text-[#FF6B00] shadow-lg hover:bg-orange-50 hover:scale-[1.02]'
                      : plan.id === 'free_trial'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900'
                      : 'bg-[#FF6B00] text-white hover:bg-[#E05E00] shadow-md shadow-orange-500/25 hover:scale-[1.02]'
                  }`}
                >
                  {plan.id === 'free_trial' ? (
                    'Current Plan'
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" /> Upgrade to {plan.name}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
