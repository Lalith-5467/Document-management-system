'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface PlanFeature {
  text: string;
  isIncluded: boolean;
  isProOnly?: boolean;
}

export interface SubscriptionPlan {
  id: 'free_trial' | 'pro' | 'business';
  name: string;
  badge?: string;
  priceMonthly: number;
  priceYearly: number;
  storageLimitGb: number;
  docLimit: number; // -1 for unlimited
  features: string[];
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'paid' | 'failed' | 'refunded';
  invoiceNo: string;
  paymentMethod: string;
}

export interface UserSubscriptionState {
  planId: 'free_trial' | 'pro' | 'business';
  planName: string;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  trialStartDate: string;
  trialEndDate: string;
  daysRemaining: number;
  billingCycle: 'monthly' | 'yearly';
  renewalDate: string;
  storageUsedBytes: number;
  storageLimitBytes: number;
  paymentHistory: PaymentRecord[];
}

export interface PromoCode {
  id: string;
  code: string;
  discountPct: number;
  description: string;
  isFreeUpgrade?: boolean;
  isActive: boolean;
}

export interface TrialConfig {
  defaultTrialDays: number;
  extensionBonusDays: number;
  bannerTitle: string;
  bannerSubtitle: string;
  isEnabled: boolean;
}

const DEFAULT_PROMOS: PromoCode[] = [
  { id: '1', code: 'DOCVAULT20', discountPct: 20, description: '20% OFF on all paid subscription plans', isActive: true },
  { id: '2', code: 'FREEPRO', discountPct: 100, description: '100% Free Pro Upgrade!', isFreeUpgrade: true, isActive: true },
];

const DEFAULT_TRIAL_CONFIG: TrialConfig = {
  defaultTrialDays: 7,
  extensionBonusDays: 3,
  bannerTitle: 'First 7 Days Free of Cost (₹0)',
  bannerSubtitle: 'Enjoy full unrestricted access to DocVault for 7 days. No payment required during your trial. Subscription auto-activates after Day 7.',
  isEnabled: true
};

interface SubscriptionContextType {
  subscription: UserSubscriptionState;
  plans: SubscriptionPlan[];
  promos: PromoCode[];
  trialConfig: TrialConfig;
  daysRemaining: number;
  isExpired: boolean;
  isTrial: boolean;
  isPro: boolean;
  isBusiness: boolean;
  upgradeModalOpen: boolean;
  paymentModalOpen: boolean;
  selectedPlanForUpgrade: SubscriptionPlan | null;
  selectedCycle: 'monthly' | 'yearly';
  openUpgradeModal: (plan?: SubscriptionPlan) => void;
  closeUpgradeModal: () => void;
  openPaymentModal: (plan: SubscriptionPlan, cycle?: 'monthly' | 'yearly') => void;
  closePaymentModal: () => void;
  activateSubscription: (planId: 'free_trial' | 'pro' | 'business', cycle: 'monthly' | 'yearly', paymentDetails?: any) => Promise<boolean>;
  cancelSubscription: () => void;
  extendTrial: (days: number) => void;
  refetchSubscription: () => void;
  updatePlansAdmin: (newPlans: SubscriptionPlan[]) => void;
  updatePromosAdmin: (newPromos: PromoCode[]) => void;
  updateTrialConfigAdmin: (newConfig: TrialConfig) => void;
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'free_trial',
    name: '7-Day Free Trial',
    priceMonthly: 0,
    priceYearly: 0,
    storageLimitGb: 5,
    docLimit: 50,
    features: [
      '7 Days 100% Free of Cost (₹0)',
      'Upload up to 50 Documents',
      '5 GB High-Speed Vault Storage',
      'Full OCR Keyword & Text Search',
      'Standard Activity Audit Logs',
      'No Credit Card Required During Trial',
    ]
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    badge: 'Most Popular',
    priceMonthly: 299,
    priceYearly: 2870, // 20% discount
    storageLimitGb: 100,
    docLimit: -1,
    features: [
      'First 7 Days Free of Cost',
      'Unlimited Document Uploads',
      '100 GB High-Speed Vault Storage',
      'OCR Optical Character Search',
      'AI Smart Document Search',
      'File Version Control History',
      'Multi-Language Support (En/Ta/Hi)',
      'Immutable Activity Audit Logs',
      'Analytics & Storage Breakdown',
      '24/7 Priority Support',
    ]
  },
  {
    id: 'business',
    name: 'Business Plan',
    badge: 'Enterprise',
    priceMonthly: 999,
    priceYearly: 9590, // 20% discount
    storageLimitGb: 1000, // 1 TB
    docLimit: -1,
    features: [
      'First 7 Days Free of Cost',
      'Unlimited Storage & Document Vaulting',
      'Unlimited Team Workspace Members',
      'Role-Based Granular Access Control',
      'Comprehensive Audit Logs & Compliance',
      'Advanced Custom Reports & Analytics',
      'REST API Access & Webhooks',
      'Dedicated Admin Control Center',
      'Dedicated Account Manager',
    ]
  }
];

const INITIAL_SUBSCRIPTION: UserSubscriptionState = {
  planId: 'free_trial',
  planName: '7-Day Free Trial',
  status: 'trial',
  trialStartDate: new Date().toISOString(),
  trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  daysRemaining: 7,
  billingCycle: 'monthly',
  renewalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  storageUsedBytes: 12.8 * 1024 * 1024 * 1024,
  storageLimitBytes: 100 * 1024 * 1024 * 1024,
  paymentHistory: [
    {
      id: 'PAY-1001',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: 0,
      planName: '7-Day Free Trial',
      billingCycle: 'monthly',
      status: 'paid',
      invoiceNo: 'INV-2026-001',
      paymentMethod: 'Free 7-Day Trial'
    }
  ]
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<UserSubscriptionState>(INITIAL_SUBSCRIPTION);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_PLANS);
  const [promos, setPromos] = useState<PromoCode[]>(DEFAULT_PROMOS);
  const [trialConfig, setTrialConfig] = useState<TrialConfig>(DEFAULT_TRIAL_CONFIG);

  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<SubscriptionPlan | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Load custom Plans, Promos, and TrialConfig set by Admin from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPlans = localStorage.getItem('dms_plans');
      if (savedPlans) {
        try { setPlans(JSON.parse(savedPlans)); } catch (e) {}
      }
      const savedPromos = localStorage.getItem('dms_promos');
      if (savedPromos) {
        try { setPromos(JSON.parse(savedPromos)); } catch (e) {}
      }
      const savedTrial = localStorage.getItem('dms_trial_config');
      if (savedTrial) {
        try { setTrialConfig(JSON.parse(savedTrial)); } catch (e) {}
      }
    }
  }, []);

  const updatePlansAdmin = (newPlans: SubscriptionPlan[]) => {
    setPlans(newPlans);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_plans', JSON.stringify(newPlans));
    }
  };

  const updatePromosAdmin = (newPromos: PromoCode[]) => {
    setPromos(newPromos);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_promos', JSON.stringify(newPromos));
    }
  };

  const updateTrialConfigAdmin = (newConfig: TrialConfig) => {
    setTrialConfig(newConfig);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_trial_config', JSON.stringify(newConfig));
    }
  };

  // Calculate remaining trial days dynamically
  const calculateDaysRemaining = useCallback((endDateIso: string) => {
    try {
      const end = new Date(endDateIso).getTime();
      const now = new Date().getTime();
      const diffMs = end - now;
      if (diffMs <= 0) return 0;
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    } catch {
      return 5;
    }
  }, []);

  const refetchSubscription = useCallback(async () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dms_subscription');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.status === 'trial') {
            const rem = calculateDaysRemaining(parsed.trialEndDate);
            parsed.daysRemaining = rem;
            if (rem === 0) parsed.status = 'expired';
          }
          setSubscription(parsed);
          return;
        } catch (e) {}
      }
    }

    // Default initialization if no saved state exists
    const trialStart = new Date();
    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const remDays = calculateDaysRemaining(trialEnd.toISOString());

    const initSub: UserSubscriptionState = {
      ...INITIAL_SUBSCRIPTION,
      trialStartDate: trialStart.toISOString(),
      trialEndDate: trialEnd.toISOString(),
      daysRemaining: remDays,
      renewalDate: trialEnd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    setSubscription(initSub);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_subscription', JSON.stringify(initSub));
    }
  }, [calculateDaysRemaining]);

  useEffect(() => {
    refetchSubscription();
  }, [refetchSubscription]);

  const openUpgradeModal = (plan?: SubscriptionPlan) => {
    if (plan) setSelectedPlanForUpgrade(plan);
    else setSelectedPlanForUpgrade(plans[1] || DEFAULT_PLANS[1]);
    setUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setUpgradeModalOpen(false);
  };

  const openPaymentModal = (plan: SubscriptionPlan, cycle: 'monthly' | 'yearly' = 'monthly') => {
    setSelectedPlanForUpgrade(plan);
    setSelectedCycle(cycle);
    setUpgradeModalOpen(false);
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
  };

  const activateSubscription = async (
    planId: 'free_trial' | 'pro' | 'business',
    cycle: 'monthly' | 'yearly',
    paymentDetails?: any
  ): Promise<boolean> => {
    const plan = plans.find(p => p.id === planId) || plans[1] || DEFAULT_PLANS[1];
    const isTrialPlan = planId === 'free_trial';
    const amount = isTrialPlan ? 0 : (cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly);
    const invNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: PaymentRecord = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: amount,
      planName: plan.name,
      billingCycle: cycle,
      status: 'paid',
      invoiceNo: invNo,
      paymentMethod: isTrialPlan ? 'Free 7-Day Trial' : (paymentDetails?.cardNumber ? `Card (•••• ${paymentDetails.cardNumber.slice(-4)})` : 'Credit / Debit Card')
    };

    const updatedSub: UserSubscriptionState = {
      ...subscription,
      planId: planId,
      planName: plan.name,
      status: isTrialPlan ? 'trial' : 'active',
      daysRemaining: isTrialPlan ? 7 : (cycle === 'yearly' ? 365 : 30),
      billingCycle: cycle,
      renewalDate: new Date(Date.now() + (isTrialPlan ? 7 : (cycle === 'yearly' ? 365 : 30)) * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      storageLimitBytes: plan.storageLimitGb * 1024 * 1024 * 1024,
      paymentHistory: [newPayment, ...subscription.paymentHistory]
    };

    setSubscription(updatedSub);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_subscription', JSON.stringify(updatedSub));
    }

    try {
      await api.post('/subscriptions/activate', { planId, cycle, amount, invoiceNo: invNo }).catch(() => null);
    } catch (e) {}

    setPaymentModalOpen(false);
    setUpgradeModalOpen(false);
    return true;
  };

  const cancelSubscription = () => {
    const updated: UserSubscriptionState = {
      ...subscription,
      status: 'cancelled'
    };
    setSubscription(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_subscription', JSON.stringify(updated));
    }
  };

  const extendTrial = (additionalDays: number) => {
    const currentEnd = new Date(subscription.trialEndDate).getTime();
    const newEnd = new Date(currentEnd + additionalDays * 24 * 60 * 60 * 1000);
    const newRem = calculateDaysRemaining(newEnd.toISOString());

    const updated: UserSubscriptionState = {
      ...subscription,
      status: 'trial',
      trialEndDate: newEnd.toISOString(),
      daysRemaining: newRem
    };

    setSubscription(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_subscription', JSON.stringify(updated));
    }
  };

  const daysRemaining = subscription.daysRemaining;
  const isExpired = subscription.status === 'expired' || (subscription.status === 'trial' && daysRemaining === 0);
  const isTrial = subscription.status === 'trial' && !isExpired;
  const isPro = subscription.status === 'active' && (subscription.planId === 'pro' || subscription.planId === 'business');
  const isBusiness = subscription.status === 'active' && subscription.planId === 'business';

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plans,
        promos,
        trialConfig,
        daysRemaining,
        isExpired,
        isTrial,
        isPro,
        isBusiness,
        upgradeModalOpen,
        paymentModalOpen,
        selectedPlanForUpgrade,
        selectedCycle,
        openUpgradeModal,
        closeUpgradeModal,
        openPaymentModal,
        closePaymentModal,
        activateSubscription,
        cancelSubscription,
        extendTrial,
        refetchSubscription,
        updatePlansAdmin,
        updatePromosAdmin,
        updateTrialConfigAdmin,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
