'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Save, AlertCircle, CheckCircle2, Lock, Key, Clock, ShieldCheck, Activity
} from 'lucide-react';

interface SecurityPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  force2FA: boolean;
}

const DEFAULT_POLICY: SecurityPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
  requireSpecial: false,
  sessionTimeoutMinutes: 120,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  force2FA: false
};

export default function AdminSecurityPage() {
  const [policy, setPolicy] = useState<SecurityPolicy>(DEFAULT_POLICY);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dms_admin_security_policy');
    if (stored) {
      setPolicy(JSON.parse(stored));
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    setTimeout(() => {
      localStorage.setItem('dms_admin_security_policy', JSON.stringify(policy));
      showToast('Security policy updated successfully!');
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans text-slate-900 dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast */}
      {toastMsg && (
        <div className={`fixed bottom-5 right-5 z-[9999] text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
          toastMsg.type === 'success' ? 'bg-slate-900 dark:bg-slate-800 border border-slate-700' : 'bg-rose-600'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-300" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
          <ShieldAlert className="w-6 h-6 text-themePrimary" /> Password & Security Policy
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Configure global security rules, password requirements, and session behavior.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Password Complexity */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Key className="w-4 h-4 text-themePrimary" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white font-auth-heading">Password Complexity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Minimum Length: <span className="text-themePrimary">{policy.minLength}</span> chars
              </label>
              <input
                type="range"
                min={6}
                max={32}
                value={policy.minLength}
                onChange={e => setPolicy({ ...policy, minLength: parseInt(e.target.value) })}
                className="w-full accent-themePrimary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">
                <span>6</span>
                <span>32</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <input 
                  type="checkbox" 
                  checked={policy.requireUppercase}
                  onChange={e => setPolicy({ ...policy, requireUppercase: e.target.checked })}
                  className="w-4 h-4 text-themePrimary focus:ring-themePrimary border-slate-300 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Require Uppercase Letter (A-Z)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <input 
                  type="checkbox" 
                  checked={policy.requireNumber}
                  onChange={e => setPolicy({ ...policy, requireNumber: e.target.checked })}
                  className="w-4 h-4 text-themePrimary focus:ring-themePrimary border-slate-300 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Require Number (0-9)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <input 
                  type="checkbox" 
                  checked={policy.requireSpecial}
                  onChange={e => setPolicy({ ...policy, requireSpecial: e.target.checked })}
                  className="w-4 h-4 text-themePrimary focus:ring-themePrimary border-slate-300 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Require Special Character (!@#$%)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Protection & Sessions */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-themePrimary" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white font-auth-heading">Session & Brute Force Protection</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Session Timeout (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={1440}
                value={policy.sessionTimeoutMinutes}
                onChange={e => setPolicy({ ...policy, sessionTimeoutMinutes: parseInt(e.target.value) || 120 })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary transition"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">Users will be logged out after this period of inactivity.</p>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Max Login Attempts
              </label>
              <input
                type="number"
                min={3}
                max={20}
                value={policy.maxLoginAttempts}
                onChange={e => setPolicy({ ...policy, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary transition"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">Number of failed attempts before account lockout.</p>
            </div>
            
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Lockout Duration (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={1440}
                value={policy.lockoutDurationMinutes}
                onChange={e => setPolicy({ ...policy, lockoutDurationMinutes: parseInt(e.target.value) || 15 })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary transition"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">Time to wait after max failed attempts.</p>
            </div>

            <div className="flex items-center pt-2">
               <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/40 hover:bg-orange-50 dark:hover:bg-orange-950/60 transition w-full">
                <input 
                  type="checkbox" 
                  checked={policy.force2FA}
                  onChange={e => setPolicy({ ...policy, force2FA: e.target.checked })}
                  className="w-4 h-4 text-themePrimary focus:ring-themePrimary border-slate-300 rounded cursor-pointer"
                />
                <div>
                  <div className="text-xs font-black text-themePrimary dark:text-orange-400 flex items-center gap-1.5 font-auth-heading">
                    <ShieldCheck className="w-4 h-4" /> Force 2FA Globally
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Require Two-Factor Authentication for all administrative and user accounts.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-black text-xs shadow-md shadow-orange-500/20 hover:opacity-90 hover:scale-105 transition disabled:opacity-70 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving Policy...' : 'Save Security Policy'}
          </button>
        </div>
      </form>
    </div>
  );
}
