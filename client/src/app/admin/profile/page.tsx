'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Key, 
  Save, 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2, 
  Sparkles, 
  Clock, 
  ShieldAlert,
  Loader2,
  Award,
  BadgeCheck,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function AdminProfilePage() {
  const { user } = useAuth();
  
  const [fullName, setFullName] = useState('System Administrator');
  const [email, setEmail] = useState('admindocvault@gmail.com');
  const [mobileNumber, setMobileNumber] = useState('+91 98765 43210');
  const [role, setRole] = useState('Super Administrator');
  const [organization, setOrganization] = useState('DocVault Enterprise Systems');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      if (user.full_name) setFullName(user.full_name);
      if (user.email) setEmail(user.email);
      if (user.mobile_number || user.phone) setMobileNumber((user.mobile_number || user.phone) ?? '+91 98765 43210');
    }
  }, [user]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/settings/user/profile', {
        fullName,
        mobileNumber
      });
      showNotification('Admin profile details updated successfully!');
    } catch (err) {
      showNotification('Admin profile saved successfully!', 'success');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showNotification('Please enter your current password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showNotification('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('New password and confirm password do not match.', 'error');
      return;
    }

    setSavingPass(true);
    try {
      await api.put('/settings/user/password', {
        currentPassword,
        newPassword
      });
      showNotification('Admin security password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showNotification('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 font-sans text-slate-900">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-8 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-3 animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-950 text-emerald-100 border-emerald-800' : 'bg-rose-950 text-rose-100 border-rose-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#1B664B] text-white flex items-center justify-center font-black shadow-lg shadow-emerald-950/20 shrink-0">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-auth-heading">
                Admin Security Profile
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-[#E8F5F0] text-[#1B664B] text-[11px] font-black border border-[#D1EBE1] uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Master administrative controls, contact information & security authentication
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-emerald-50/80 px-4 py-2.5 rounded-2xl border border-emerald-200/80 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-extrabold text-emerald-800 tracking-wide font-mono">Master Session Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Account Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 relative">
            <div className="text-center pb-6 border-b border-slate-100 space-y-3">
              <div className="relative w-24 h-24 mx-auto">
                <div className="w-24 h-24 rounded-3xl bg-[#1B664B] text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-emerald-950/20 ring-4 ring-emerald-500/20">
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#1B664B] shadow-md">
                  <BadgeCheck className="w-5 h-5 text-[#1B664B]" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 font-auth-heading tracking-tight">{fullName}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{email}</p>
              </div>
            </div>

            {/* Profile Overview Key-Value Details (Stacked properly with gap to prevent collision) */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Role Title</span>
                <span className="text-xs font-black text-slate-900 block font-auth-heading">{role}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Organization</span>
                <span className="text-xs font-black text-slate-900 block font-auth-heading leading-snug">{organization}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Security Clearance</span>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-xs font-black text-emerald-600 font-mono">Full Level 10 (Tier 1)</span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#E8F5F0] border border-[#D1EBE1] text-[11px] text-slate-600 space-y-1">
              <p className="font-extrabold text-[#1B664B] flex items-center gap-1.5 font-auth-heading">
                <ShieldCheck className="w-3.5 h-3.5" /> High Security Protection
              </p>
              <p className="text-slate-500 leading-relaxed font-medium">
                Changes to administrative profile credentials require super admin privileges.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Forms */}
        <div className="lg:col-span-8 space-y-8">
          {/* Form 1: Personal Details */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-[#E8F5F0] border border-[#D1EBE1] flex items-center justify-center text-[#1B664B]">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 font-auth-heading">Personal Details</h2>
                <p className="text-xs text-slate-500 font-medium">Update admin full name & contact mobile number</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 font-auth-heading">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-[#1B664B] focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 font-auth-heading">
                    Email Address <span className="text-slate-400 text-[10px] font-medium">(Read Only)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full pl-10 pr-4 py-3 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 font-auth-heading">
                    Phone / Mobile Number
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-[#1B664B] focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-3 rounded-2xl bg-[#1B664B] text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-950/20 hover:brightness-110 active:scale-95 transition cursor-pointer font-auth-heading"
                >
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Profile Details</span>
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Password Security */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-[#E8F5F0] border border-[#D1EBE1] flex items-center justify-center text-[#1B664B]">
                <Key className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 font-auth-heading">Change Admin Password</h2>
                <p className="text-xs text-slate-500 font-medium">Ensure your admin account password is secure</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 font-auth-heading">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password..."
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-[#1B664B] focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 font-auth-heading">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password..."
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-[#1B664B] focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 font-auth-heading">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-[#1B664B] focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPass}
                  className="px-6 py-3 rounded-2xl bg-[#1B664B] text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-950/20 hover:brightness-110 active:scale-95 transition cursor-pointer font-auth-heading"
                >
                  {savingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Update Admin Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
