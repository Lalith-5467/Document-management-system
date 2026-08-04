'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Lock, CreditCard, CheckCircle2, Loader2, Zap, Tag } from 'lucide-react';
import { useSubscription, SubscriptionPlan } from '@/context/SubscriptionContext';

export default function PaymentModal() {
  const {
    paymentModalOpen,
    closePaymentModal,
    selectedPlanForUpgrade,
    activateSubscription
  } = useSubscription();

  const [cardName, setCardName] = useState('Joe Developer');
  const [cardNumber, setCardNumber] = useState('4532 8921 7842 9012');
  const [expiry, setExpiry] = useState('08/28');
  const [cvv, setCvv] = useState('892');
  const [billingAddress, setBillingAddress] = useState('123 Tech Park, Innovation Way');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!paymentModalOpen || !selectedPlanForUpgrade) return null;

  const plan = selectedPlanForUpgrade;
  const basePrice = plan.priceMonthly;
  const discountAmount = promoApplied ? Math.round((basePrice * discountPercent) / 100) : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'DOCVAULT20') {
      setDiscountPercent(20);
      setPromoApplied(true);
    } else if (promoCode.trim().toUpperCase() === 'FREEPRO') {
      setDiscountPercent(100);
      setPromoApplied(true);
    } else {
      alert('Invalid promo code. Try "DOCVAULT20" for 20% off or "FREEPRO" for 100% off.');
    }
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment gateway delay (1.5 seconds)
    setTimeout(async () => {
      setProcessing(false);
      setSuccess(true);

      // Activate subscription in Context
      await activateSubscription(plan.id, 'monthly', {
        cardNumber: cardNumber.replace(/\s/g, '')
      });

      // Auto close after 2.5 seconds
      setTimeout(() => {
        setSuccess(false);
        closePaymentModal();
      }, 2500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-pop-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl shadow-orange-500/10 border border-slate-200 dark:border-slate-800 relative space-y-6 my-6">
        {/* Close Button */}
        {!processing && !success && (
          <button
            onClick={closePaymentModal}
            className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* SUCCESS SCREEN */}
        {success ? (
          <div className="text-center py-10 space-y-5 animate-pop-in">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                Payment Successful
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {plan.name} Activated! 🎉
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Your DocVault account has been upgraded with high-speed OCR, AI search, and 100 GB storage.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-themePrimary border border-orange-200 dark:border-orange-900/60 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Secure Checkout</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Upgrading to <strong className="text-themePrimary">{plan.name}</strong>
                </p>
              </div>
            </div>

            {/* Payment Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>{plan.name} Subscription</span>
                <span>₹{basePrice} / mo</span>
              </div>

              <div className="flex justify-between font-extrabold text-emerald-600 dark:text-emerald-400">
                <span>First 7 Days Promo</span>
                <span>FREE ($0.00 / ₹0)</span>
              </div>

              {promoApplied && (
                <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Promo Discount ({discountPercent}%)</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline font-black text-sm text-slate-900 dark:text-white">
                <span>Today's Total Due</span>
                <span className="text-base text-emerald-600 dark:text-emerald-400 font-mono">₹0.00 (Free Trial)</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">First charge of ₹{finalPrice} will take place after 7 days.</p>
            </div>

            {/* Form */}
            <form onSubmit={handlePayNow} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold focus:outline-none focus:border-themePrimary"
                  placeholder="e.g. Joe Developer"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono font-semibold focus:outline-none focus:border-themePrimary"
                    placeholder="4532 •••• •••• 9012"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono font-semibold focus:outline-none focus:border-themePrimary"
                    placeholder="MM/YY"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                    CVV Security
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono font-semibold focus:outline-none focus:border-themePrimary"
                    placeholder="•••"
                  />
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <label className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                    Promo Code
                  </label>
                  {promoApplied && (
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                      ✓ Promo Applied ({discountPercent}% Off)
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter DOCVAULT20 or FREEPRO"
                    className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs uppercase font-bold focus:outline-none focus:border-themePrimary"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 rounded-2xl bg-themePrimary text-white font-extrabold text-xs hover:bg-[#E05E00] shadow-sm transition"
                  >
                    Apply
                  </button>
                </div>

                {/* Quick Chips */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400">Quick Codes:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoCode('DOCVAULT20');
                      setDiscountPercent(20);
                      setPromoApplied(true);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-orange-100 dark:bg-orange-950 text-themePrimary dark:text-orange-300 text-[10px] font-black hover:scale-105 transition"
                  >
                    DOCVAULT20 (-20%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoCode('FREEPRO');
                      setDiscountPercent(100);
                      setPromoApplied(true);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black hover:scale-105 transition"
                  >
                    FREEPRO (100% Free)
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" /> 256-Bit SSL Encrypted
                </span>
                <span>Simulated Checkout</span>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-themePrimary via-[#F97316] to-[#EA580C] text-white font-black text-xs shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" /> Pay ₹{finalPrice} & Activate Plan
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
