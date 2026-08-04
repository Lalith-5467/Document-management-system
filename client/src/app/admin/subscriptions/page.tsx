'use client';

import React, { useState } from 'react';
import {
  Zap, Users, ShieldCheck, CreditCard, Download, Search, Filter,
  RefreshCw, CheckCircle2, AlertTriangle, Clock, Sliders, Edit3, Trash2,
  Plus, Check, X, DollarSign, Award, Settings, UserPlus, Eye, Tag, Gift, SlidersHorizontal
} from 'lucide-react';
import { useSubscription, SubscriptionPlan, PromoCode, TrialConfig } from '@/context/SubscriptionContext';

export interface AdminUserSub {
  id: number;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  trialEndDate: string;
  daysRemaining: number;
  storageUsedGb: number;
  storageLimitGb: number;
  joinedDate: string;
}

const INITIAL_USERS: AdminUserSub[] = [
  {
    id: 1,
    userName: 'Joe Developer',
    userEmail: 'joe@docvault.com',
    planId: 'pro',
    planName: 'Pro Plan',
    status: 'active',
    trialEndDate: '2026-08-24',
    daysRemaining: 30,
    storageUsedGb: 12.8,
    storageLimitGb: 100,
    joinedDate: '2026-07-01'
  },
  {
    id: 2,
    userName: 'Sarah Jenkins',
    userEmail: 'sarah.j@company.com',
    planId: 'free_trial',
    planName: 'Free Trial',
    status: 'trial',
    trialEndDate: '2026-07-29',
    daysRemaining: 5,
    storageUsedGb: 0.8,
    storageLimitGb: 5,
    joinedDate: '2026-07-22'
  },
  {
    id: 3,
    userName: 'Michael Chang',
    userEmail: 'mchang@techcorp.io',
    planId: 'business',
    planName: 'Business Plan',
    status: 'active',
    trialEndDate: '2027-07-01',
    daysRemaining: 340,
    storageUsedGb: 145.2,
    storageLimitGb: 1000,
    joinedDate: '2026-06-15'
  },
  {
    id: 4,
    userName: 'Elena Rostova',
    userEmail: 'elena@designstudio.org',
    planId: 'free_trial',
    planName: 'Free Trial',
    status: 'expired',
    trialEndDate: '2026-07-20',
    daysRemaining: 0,
    storageUsedGb: 1.9,
    storageLimitGb: 5,
    joinedDate: '2026-07-13'
  },
  {
    id: 5,
    userName: 'David Miller',
    userEmail: 'dmiller@fintech.net',
    planId: 'pro',
    planName: 'Pro Plan',
    status: 'active',
    trialEndDate: '2026-08-15',
    daysRemaining: 22,
    storageUsedGb: 48.5,
    storageLimitGb: 100,
    joinedDate: '2026-07-10'
  }
];

export default function AdminSubscriptionsPage() {
  const { plans, promos, trialConfig, updatePlansAdmin, updatePromosAdmin, updateTrialConfigAdmin } = useSubscription();

  const [activeTab, setActiveTab] = useState<'plans' | 'promos' | 'trial' | 'users'>('plans');
  const [users, setUsers] = useState<AdminUserSub[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PLAN CRUD MODALS STATE
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    id: '',
    name: '',
    badge: '',
    priceMonthly: 299,
    priceYearly: 2870,
    storageLimitGb: 100,
    featuresText: ''
  });

  // PROMO CODE CRUD MODALS STATE
  const [showCreatePromoModal, setShowCreatePromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [newPromoForm, setNewPromoForm] = useState({
    code: '',
    discountPct: 20,
    description: '',
    isFreeUpgrade: false
  });

  // TRIAL CONFIG FORM STATE
  const [trialForm, setTrialForm] = useState<TrialConfig>(trialConfig);

  // USER SUB CRUD MODALS STATE
  const [showCreateUserSubModal, setShowCreateUserSubModal] = useState(false);
  const [editingSub, setEditingSub] = useState<AdminUserSub | null>(null);
  const [deletingSubId, setDeletingSubId] = useState<number | null>(null);

  const [newUserSubForm, setNewUserSubForm] = useState({
    userName: '',
    userEmail: '',
    planId: 'pro',
    storageLimitGb: 100,
    daysRemaining: 30
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  /* ==================== 1. PLAN CRUD HANDLERS ==================== */
  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanForm.name) return;

    const idKey = newPlanForm.id || newPlanForm.name.toLowerCase().replace(/\s+/g, '_');
    const featuresList = newPlanForm.featuresText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const createdPlan: SubscriptionPlan = {
      id: idKey as any,
      name: newPlanForm.name,
      badge: newPlanForm.badge || undefined,
      priceMonthly: Number(newPlanForm.priceMonthly),
      priceYearly: Number(newPlanForm.priceYearly),
      storageLimitGb: Number(newPlanForm.storageLimitGb),
      docLimit: -1,
      features: featuresList.length > 0 ? featuresList : ['Unlimited Document Vaulting', 'Priority 24/7 Support']
    };

    const updated = [...plans, createdPlan];
    updatePlansAdmin(updated);
    setShowCreatePlanModal(false);
    showToast(`New Subscription Plan "${createdPlan.name}" created successfully!`);
    setNewPlanForm({ id: '', name: '', badge: '', priceMonthly: 299, priceYearly: 2870, storageLimitGb: 100, featuresText: '' });
  };

  const handleUpdatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const updated = plans.map(p => p.id === editingPlan.id ? editingPlan : p);
    updatePlansAdmin(updated);
    setEditingPlan(null);
    showToast(`Plan "${editingPlan.name}" updated successfully!`);
  };

  const handleDeletePlan = (planId: string) => {
    const target = plans.find(p => p.id === planId);
    const updated = plans.filter(p => p.id !== planId);
    updatePlansAdmin(updated);
    showToast(`Plan "${target?.name || planId}" removed.`);
  };

  /* ==================== 2. PROMO CODE CRUD HANDLERS ==================== */
  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoForm.code) return;

    const newPromo: PromoCode = {
      id: Date.now().toString(),
      code: newPromoForm.code.toUpperCase().trim(),
      discountPct: Number(newPromoForm.discountPct),
      description: newPromoForm.description || `${newPromoForm.discountPct}% Discount`,
      isFreeUpgrade: newPromoForm.isFreeUpgrade,
      isActive: true
    };

    const updated = [...promos, newPromo];
    updatePromosAdmin(updated);
    setShowCreatePromoModal(false);
    showToast(`Promo Code "${newPromo.code}" created!`);
    setNewPromoForm({ code: '', discountPct: 20, description: '', isFreeUpgrade: false });
  };

  const handleTogglePromo = (promoId: string) => {
    const updated = promos.map(p => p.id === promoId ? { ...p, isActive: !p.isActive } : p);
    updatePromosAdmin(updated);
    showToast('Promo code status toggled!');
  };

  const handleDeletePromo = (promoId: string) => {
    const updated = promos.filter(p => p.id !== promoId);
    updatePromosAdmin(updated);
    showToast('Promo code deleted!');
  };

  /* ==================== 3. TRIAL CONFIG CRUD HANDLER ==================== */
  const handleSaveTrialConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateTrialConfigAdmin(trialForm);
    showToast('Free Trial & Banner configurations saved successfully!');
  };

  /* ==================== 4. USER SUB CRUD HANDLERS ==================== */
  const handleCreateUserSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserSubForm.userName || !newUserSubForm.userEmail) return;

    const plan = plans.find(p => p.id === newUserSubForm.planId);
    const newSub: AdminUserSub = {
      id: Date.now(),
      userName: newUserSubForm.userName,
      userEmail: newUserSubForm.userEmail,
      planId: newUserSubForm.planId,
      planName: plan?.name || 'Pro Plan',
      status: newUserSubForm.planId === 'free_trial' ? 'trial' : 'active',
      trialEndDate: new Date(Date.now() + newUserSubForm.daysRemaining * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysRemaining: newUserSubForm.daysRemaining,
      storageUsedGb: 0,
      storageLimitGb: newUserSubForm.storageLimitGb,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [newSub, ...prev]);
    setShowCreateUserSubModal(false);
    showToast(`Subscription assigned to ${newSub.userName}`);
  };

  const handleUpdateUserSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;

    setUsers(prev => prev.map(u => u.id === editingSub.id ? editingSub : u));
    showToast(`Subscription updated for ${editingSub.userName}`);
    setEditingSub(null);
  };

  const handleDeleteUserSub = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeletingSubId(null);
    showToast('User subscription record removed!');
  };

  const handleExtendUserTrial = (userId: number, days: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: 'trial', daysRemaining: u.daysRemaining + days };
      }
      return u;
    }));
    showToast(`Extended trial by +${days} days`);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-16 text-slate-900 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white text-slate-900 border border-themePrimary/30 shadow-2xl shadow-orange-500/10 text-xs font-semibold animate-pop-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg shrink-0">
              <Zap className="w-5 h-5 fill-blue-400" />
            </span>
            SaaS Subscriptions, Plans & Banner CRUD Manager
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Full Admin CRUD control: Manage Pricing Cards, Promo Codes, Trial Banner settings, and User Accounts dynamically.
          </p>
        </div>

        <button
          onClick={() => {
            const csv = 'Plan ID,Plan Name,Monthly Price,Yearly Price,Storage GB\n' + plans.map(p => `${p.id},${p.name},${p.priceMonthly},${p.priceYearly},${p.storageLimitGb}`).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'admin_plans_crud.csv';
            a.click();
          }}
          className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export Report (CSV)
        </button>
      </div>

      {/* ADMIN TABS NAVIGATION */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-none">
        {[
          { id: 'plans', label: '💳 Subscription Plans', count: plans ? plans.length : 0 },
          { id: 'promos', label: '🎁 Promo Codes & Discounts', count: promos ? promos.length : 0 },
          { id: 'users', label: '👥 User Subscriptions', count: users ? users.length : 0 },
          { id: 'trial', label: '📢 Free Trial Banner CMS', count: 1 },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{t.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PRICING PLANS CRUD MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'plans' && (
        <div className="space-y-6 animate-pop-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Available Subscription Pricing Cards</h3>
              <p className="text-xs text-slate-600">These plans are displayed directly on the user page pricing table.</p>
            </div>
            <button
              onClick={() => setShowCreatePlanModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer">
              <Plus className="w-4 h-4" /> Create New Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 relative flex flex-col justify-between hover:border-themePrimary/50 transition-all shadow-xs"
              >
                {plan.badge && (
                  <span className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-xs">
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-2">
                  <h4 className="text-xl font-black text-slate-900">{plan.name}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">₹{plan.priceMonthly}</span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500">₹{plan.priceYearly} / year (save 20%)</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <p className="text-2xs font-bold text-slate-500 uppercase tracking-wider font-mono">Quota: {plan.storageLimitGb} GB</p>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-themePrimary shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-themePrimary" /> Edit Plan
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold transition cursor-pointer"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROMO CODES & DISCOUNTS CRUD MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'promos' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 animate-pop-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Promo Codes & Discount Banners CRUD</h3>
              <p className="text-xs text-slate-600">Manage promotional discount codes displayed on user billing checkout.</p>
            </div>
            <button
              onClick={() => setShowCreatePromoModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer">
              <Plus className="w-4 h-4" /> Create Promo Code
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80/60 text-slate-600 uppercase text-[10px] font-extrabold border-b border-slate-100">
                  <th className="py-3.5 px-4">Promo Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-100/40 transition">
                    <td className="py-3.5 px-4 font-mono font-black text-orange-400">
                      🏷️ {promo.code}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {promo.discountPct}% OFF
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {promo.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        promo.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {promo.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePromo(promo.id)}
                          className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 text-[10px]"
                        >
                          {promo.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeletePromo(promo.id)}
                          className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FREE TRIAL & BANNER CONFIGURATION CRUD MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'trial' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 animate-pop-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">7-Day Free Trial Banner CRUD Configuration</h3>
              <p className="text-xs text-slate-600">
                Customize the orange trial banner title, bonus extension days (+3 days button), and default trial duration.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveTrialConfig} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-[10px] text-slate-600">Default Free Trial Duration (Days)</label>
                <input
                  type="number"
                  value={trialForm.defaultTrialDays}
                  onChange={(e) => setTrialForm({ ...trialForm, defaultTrialDays: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold uppercase text-[10px] text-slate-600">Trial Extension Bonus (+Days Button)</label>
                <input
                  type="number"
                  value={trialForm.extensionBonusDays}
                  onChange={(e) => setTrialForm({ ...trialForm, extensionBonusDays: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-extrabold uppercase text-[10px] text-slate-600">Banner Header Title</label>
              <input
                type="text"
                value={trialForm.bannerTitle}
                onChange={(e) => setTrialForm({ ...trialForm, bannerTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-extrabold uppercase text-[10px] text-slate-600">Banner Subtitle Text</label>
              <textarea
                rows={2}
                value={trialForm.bannerSubtitle}
                onChange={(e) => setTrialForm({ ...trialForm, bannerSubtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-themePrimary resize-none"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer">
              Save Trial & Banner Configurations
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: USER ACCOUNTS & SUBSCRIPTIONS CRUD */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 animate-pop-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-black text-slate-900">All User Subscriptions ({filteredUsers.length})</h3>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user or email..."
                  className="pl-10 pr-4 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-themePrimary"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-themePrimary"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="trial">Trialing</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={() => setShowCreateUserSubModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer">
                <UserPlus className="w-4 h-4" /> Assign Sub
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80/60 text-slate-600 uppercase text-[10px] font-extrabold border-b border-slate-100">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Plan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Trial / Renewal</th>
                  <th className="py-3.5 px-4">Storage Quota</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-100/40 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-extrabold text-slate-900">{u.userName}</p>
                        <p className="text-[10px] text-slate-600 font-mono">{u.userEmail}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-400">{u.planName}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {u.status === 'trial' ? `${u.daysRemaining} days remaining` : u.trialEndDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {u.storageUsedGb} GB / {u.storageLimitGb} GB
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleExtendUserTrial(u.id, 7)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-100/80 text-blue-400 hover:bg-slate-100 text-[10px] font-bold"
                        >
                          +7 Days
                        </button>
                        <button
                          onClick={() => setEditingSub(u)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingSubId(u.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      {showCreatePlanModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-white  animate-pop-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-5 text-xs text-slate-700">
            <button onClick={() => setShowCreatePlanModal(false)} className="absolute top-5 right-5 text-slate-600 hover:text-slate-900">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900">Create Subscription Plan Card</h3>

            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Developer Pro"
                  value={newPlanForm.name}
                  onChange={e => setNewPlanForm({ ...newPlanForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-[10px] uppercase text-slate-600">Monthly Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPlanForm.priceMonthly}
                    onChange={e => setNewPlanForm({ ...newPlanForm, priceMonthly: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-[10px] uppercase text-slate-600">Yearly Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPlanForm.priceYearly}
                    onChange={e => setNewPlanForm({ ...newPlanForm, priceYearly: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600">Badge (e.g. MOST POPULAR, ENTERPRISE)</label>
                <input
                  type="text"
                  placeholder="Optional badge label"
                  value={newPlanForm.badge}
                  onChange={e => setNewPlanForm({ ...newPlanForm, badge: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
                />
              </div>

              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600">Storage Limit (GB)</label>
                <input
                  type="number"
                  required
                  value={newPlanForm.storageLimitGb}
                  onChange={e => setNewPlanForm({ ...newPlanForm, storageLimitGb: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
                />
              </div>

              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600">Features List (1 per line)</label>
                <textarea
                  rows={3}
                  placeholder="First 7 Days Free&#10;Unlimited Uploads&#10;OCR Search"
                  value={newPlanForm.featuresText}
                  onChange={e => setNewPlanForm({ ...newPlanForm, featuresText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-themePrimary resize-none"
                />
              </div>

              <button type="submit" className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer">
                Create Pricing Card
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PROMO CODE MODAL */}
      {showCreatePromoModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-white  animate-pop-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-5 text-xs text-slate-700">
            <button onClick={() => setShowCreatePromoModal(false)} className="absolute top-5 right-5 text-slate-600 hover:text-slate-900">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900">Create Promo Code</h3>

            <form onSubmit={handleCreatePromo} className="space-y-3">
              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600">Promo Code String</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SPECIAL50"
                  value={newPromoForm.code}
                  onChange={e => setNewPromoForm({ ...newPromoForm, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary uppercase font-mono"
                />
              </div>

              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600">Discount Percentage (%)</label>
                <input
                  type="number"
                  required
                  value={newPromoForm.discountPct}
                  onChange={e => setNewPromoForm({ ...newPromoForm, discountPct: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
                />
              </div>

              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 50% OFF for early adopters"
                  value={newPromoForm.description}
                  onChange={e => setNewPromoForm({ ...newPromoForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-themePrimary"
                />
              </div>

              <button type="submit" className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer">
                Save Promo Code
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-white  animate-pop-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-5 text-xs text-slate-700">
            <button onClick={() => setEditingPlan(null)} className="absolute top-5 right-5 text-slate-600 hover:text-slate-900">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900">Edit Subscription Plan: {editingPlan.name}</h3>

            <form onSubmit={handleUpdatePlan} className="space-y-3">
              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600">Plan Name</label>
                <input
                  type="text"
                  required
                  value={editingPlan.name}
                  onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-[10px] uppercase text-slate-600">Monthly Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.priceMonthly}
                    onChange={e => setEditingPlan({ ...editingPlan, priceMonthly: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-[10px] uppercase text-slate-600">Yearly Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.priceYearly}
                    onChange={e => setEditingPlan({ ...editingPlan, priceYearly: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600">Badge Label (e.g. MOST POPULAR)</label>
                <input
                  type="text"
                  value={editingPlan.badge || ''}
                  onChange={e => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
                />
              </div>

              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600">Storage Quota (GB)</label>
                <input
                  type="number"
                  required
                  value={editingPlan.storageLimitGb}
                  onChange={e => setEditingPlan({ ...editingPlan, storageLimitGb: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
                />
              </div>

              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600">Features List (1 per line)</label>
                <textarea
                  rows={4}
                  value={editingPlan.features.join('\n')}
                  onChange={e => setEditingPlan({ ...editingPlan, features: e.target.value.split('\n').filter(Boolean) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-themePrimary resize-none"
                />
              </div>

              <button type="submit" className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer">
                Save Plan Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
