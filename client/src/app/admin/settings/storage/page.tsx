'use client';

import React, { useState, useEffect } from 'react';
import { 
  HardDrive, Save, AlertCircle, CheckCircle2, FileType2, Trash2, ShieldCheck, Database
} from 'lucide-react';

interface StoragePolicy {
  defaultQuotaGB: number;
  maxFileSizeMB: number;
  allowedExtensions: string;
  recycleBinDays: number;
  autoEmptyBin: boolean;
}

const DEFAULT_POLICY: StoragePolicy = {
  defaultQuotaGB: 10,
  maxFileSizeMB: 50,
  allowedExtensions: '.pdf, .docx, .xlsx, .png, .jpg, .jpeg, .txt',
  recycleBinDays: 30,
  autoEmptyBin: true
};

export default function AdminStoragePage() {
  const [policy, setPolicy] = useState<StoragePolicy>(DEFAULT_POLICY);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dms_admin_storage_policy');
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
      localStorage.setItem('dms_admin_storage_policy', JSON.stringify(policy));
      showToast('Storage policy updated successfully!');
      setSubmitting(false);
    }, 500);
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
          <HardDrive className="w-6 h-6 text-themePrimary" /> Storage Policy
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage default storage quotas, file restrictions, and retention limits.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Quotas & Uploads */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Database className="w-4 h-4 text-themePrimary" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white font-auth-heading">Quotas & Upload Limits</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                Default User Quota (GB)
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={policy.defaultQuotaGB}
                onChange={e => setPolicy({ ...policy, defaultQuotaGB: parseInt(e.target.value) || 10 })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary transition"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">Amount of storage given to new users by default.</p>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                Max File Size (MB)
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                value={policy.maxFileSizeMB}
                onChange={e => setPolicy({ ...policy, maxFileSizeMB: parseInt(e.target.value) || 50 })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary transition"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">Maximum size allowed per individual file upload.</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <FileType2 className="w-3.5 h-3.5" /> Allowed File Extensions
              </label>
              <input
                type="text"
                value={policy.allowedExtensions}
                onChange={e => setPolicy({ ...policy, allowedExtensions: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary transition"
                placeholder=".pdf, .docx, .png"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">Comma-separated list of allowed file extensions. Leave empty to allow all types.</p>
            </div>
          </div>
        </div>

        {/* Retention */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Trash2 className="w-4 h-4 text-themePrimary" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white font-auth-heading">Retention & Recycle Bin</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                Recycle Bin Retention (Days)
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={policy.recycleBinDays}
                onChange={e => setPolicy({ ...policy, recycleBinDays: parseInt(e.target.value) || 30 })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary transition"
                disabled={!policy.autoEmptyBin}
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">Number of days to keep deleted files before permanent deletion.</p>
            </div>

            <div className="pt-2">
               <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] hover:bg-slate-100 dark:hover:bg-slate-800 transition w-full">
                <input 
                  type="checkbox" 
                  checked={policy.autoEmptyBin}
                  onChange={e => setPolicy({ ...policy, autoEmptyBin: e.target.checked })}
                  className="w-4 h-4 text-themePrimary focus:ring-themePrimary border-slate-300 rounded cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Enable Auto-Empty
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Automatically permanently delete files from recycle bin after the retention period.</div>
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
            {submitting ? 'Saving...' : 'Save Storage Policy'}
          </button>
        </div>
      </form>
    </div>
  );
}
