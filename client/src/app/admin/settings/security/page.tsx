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
    <div className="space-y-6 max-w-4xl font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast */}
      {toastMsg && (
        <div className={`fixed bottom-5 right-5 z-[9999] text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
          toastMsg.type === 'success' ? 'bg-slate-900' : 'bg-rose-600'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-300" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 font-auth-heading">
          <ShieldAlert className="w-6 h-6 text-rose-500" /> Password & Security Policy
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Configure global security rules, password requirements, and session behavior.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Password Complexity */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Key className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-black text-slate-900">Password Complexity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Minimum Length: <span className="text-rose-500">{policy.minLength}</span> chars
              </label>
              <input
                type="range"
                min={6}
                max={32}
                value={policy.minLength}
                onChange={e => setPolicy({ ...policy, minLength: parseInt(e.target.value) })}
                className="w-full accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>6</span>
                <span>32</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={policy.requireUppercase}
                  onChange={e => setPolicy({ ...policy, requireUppercase: e.target.checked })}
                  className="w-4 h-4 text-rose-500 focus:ring-rose-500 border-slate-300 rounded"
                />
                <span className="text-sm font-bold text-slate-700">Require Uppercase Letter (A-Z)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={policy.requireNumber}
                  onChange={e => setPolicy({ ...policy, requireNumber: e.target.checked })}
                  className="w-4 h-4 text-rose-500 focus:ring-rose-500 border-slate-300 rounded"
                />
                <span className="text-sm font-bold text-slate-700">Require Number (0-9)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={policy.requireSpecial}
                  onChange={e => setPolicy({ ...policy, requireSpecial: e.target.checked })}
                  className="w-4 h-4 text-rose-500 focus:ring-rose-500 border-slate-300 rounded"
                />
                <span className="text-sm font-bold text-slate-700">Require Special Character (!@#$%)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Protection & Sessions */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Lock className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-black text-slate-900">Session & Brute Force Protection</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Session Timeout (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={1440}
                value={policy.sessionTimeoutMinutes}
                onChange={e => setPolicy({ ...policy, sessionTimeoutMinutes: parseInt(e.target.value) || 120 })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-rose-500 transition"
              />
              <p className="text-[10px] text-slate-500 font-medium mt-1">Users will be logged out after this period of inactivity.</p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Max Login Attempts
              </label>
              <input
                type="number"
                min={3}
                max={20}
                value={policy.maxLoginAttempts}
                onChange={e => setPolicy({ ...policy, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-rose-500 transition"
              />
              <p className="text-[10px] text-slate-500 font-medium mt-1">Number of failed attempts before account lockout.</p>
            </div>
            
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Lockout Duration (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={1440}
                value={policy.lockoutDurationMinutes}
                onChange={e => setPolicy({ ...policy, lockoutDurationMinutes: parseInt(e.target.value) || 15 })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-rose-500 transition"
              />
              <p className="text-[10px] text-slate-500 font-medium mt-1">Time to wait after max failed attempts.</p>
            </div>

            <div className="flex items-center pt-2">
               <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition w-full">
                <input 
                  type="checkbox" 
                  checked={policy.force2FA}
                  onChange={e => setPolicy({ ...policy, force2FA: e.target.checked })}
                  className="w-4 h-4 text-rose-500 focus:ring-rose-500 border-slate-300 rounded"
                />
                <div>
                  <div className="text-sm font-black text-rose-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Force 2FA Globally
                  </div>
                  <div className="text-[10px] text-rose-700/70 font-medium mt-0.5">Require Two-Factor Authentication for all administrative and user accounts.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-black text-sm shadow-md shadow-rose-500/20 hover:scale-105 transition disabled:opacity-70 disabled:hover:scale-100"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving Policy...' : 'Save Security Policy'}
          </button>
        </div>
      </form>
    </div>
  );
}
