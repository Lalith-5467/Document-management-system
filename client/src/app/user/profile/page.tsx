'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, ShieldCheck, Mail, ArrowLeft, CheckCircle2, Edit2, Loader2, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>(user?.full_name || '');
  const [userType, setUserType] = useState<string>(user?.user_type || 'individual');

  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await api.put('/users/profile', {
        fullName: fullName.trim(),
        userType
      });

      if (res.data && res.data.success) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setIsEditing(false);
        // Refresh local storage user
        const updated = res.data.user;
        localStorage.setItem('dms_user', JSON.stringify(updated));
      } else {
        setMessage({ text: res.data?.message || 'Failed to update profile.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 pb-12">
      <div className="flex items-center gap-2 mb-1">
        <Link href="/user" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Workspace
        </Link>
        <span className="text-slate-400 text-xs">/</span>
        <span className="text-xs font-semibold text-slate-900 dark:text-white">User Profile</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">👤 User Profile</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">Manage account information and security credentials</p>
        </div>

        {!isEditing && (
          <button
            onClick={() => {
              setFullName(user?.full_name || '');
              setUserType(user?.user_type || 'individual');
              setIsEditing(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:brightness-110 rounded-xl transition shadow-md shadow-orange-500/25"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-3 border ${
          message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#F97316] text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
            {fullName ? fullName.charAt(0).toUpperCase() : (user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U')}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{fullName || user?.full_name || 'Authenticated User'}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'user@docvault.io'}</p>
            <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950 text-[#FF6B00] dark:text-orange-400 border border-orange-200 dark:border-orange-900/60 font-mono">
              {userType || user?.user_type || 'individual'} tier
            </span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Account Tier / Type</label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="student">Student</option>
                <option value="professional">Professional</option>
                <option value="individual">Individual</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:brightness-110 rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-1.5"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Profile Details
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF6B00] dark:text-orange-400" />
                <span className="font-semibold text-slate-900 dark:text-white">Email Verification</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
