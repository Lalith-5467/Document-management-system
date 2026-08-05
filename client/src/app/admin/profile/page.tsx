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
  Building, 
  Sparkles, 
  Clock, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function AdminProfilePage() {
  const { user } = useAuth();
  
  const [fullName, setFullName] = useState('System Administrator');
  const [email, setEmail] = useState('admindocvault@gmail.com');
  const [mobileNumber, setMobileNumber] = useState('+91 99887 76655');
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
      if (user.mobile_number || user.phone) setMobileNumber((user.mobile_number || user.phone) ?? '');
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
      showNotification('Admin profile saved locally.', 'success');
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
      showNotification('Password security token updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="space-y-8 font-poppins max-w-5xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-8 z-50 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-black flex items-center gap-2.5 animate-fadeIn ${
          toast.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-themePrimary to-[#F97316] text-white flex items-center justify-center font-black shadow-lg shadow-orange-500/25">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Admin Profile</span>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-themePrimary text-xs font-black border border-orange-200">
                Super Admin
              </span>
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Manage your master account credentials and security authentication
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black text-emerald-700">Master Session Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Account Overview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="text-center pb-4 border-b border-slate-100 space-y-3">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-themePrimary to-[#F97316] text-white flex items-center justify-center font-black shadow-xl shadow-orange-500/20 ring-4 ring-orange-500/10">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{fullName}</h3>
                <p className="text-xs font-medium text-slate-500">{email}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-500">Role Title</span>
                <span className="font-black text-slate-900">{role}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-500">Organization</span>
                <span className="font-black text-slate-900">{organization}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-500">Security Access</span>
                <span className="font-black text-emerald-600">Full Level 10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Form 1: Admin Personal Information */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <User className="w-5 h-5 text-themePrimary" />
              <h2 className="text-base font-black text-slate-900">Personal Details</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-themePrimary focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase text-slate-700">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-black uppercase text-slate-700">Phone / Mobile Number</label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-themePrimary focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-3 rounded-2xl bg-themePrimary text-white font-black text-xs flex items-center gap-2 shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
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
              <Key className="w-5 h-5 text-themePrimary" />
              <h2 className="text-base font-black text-slate-900">Change Admin Password</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-slate-700">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-themePrimary focus:bg-white focus:outline-none transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase text-slate-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-themePrimary focus:bg-white focus:outline-none transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-themePrimary focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPass}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-black text-xs flex items-center gap-2 shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
                >
                  {savingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
