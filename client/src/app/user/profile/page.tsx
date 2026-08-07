'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  ShieldCheck, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  Edit2, 
  Loader2, 
  AlertCircle, 
  Save, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building, 
  Key, 
  ChevronRight, 
  Sparkles,
  GraduationCap,
  BadgeCheck,
  Settings,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Real registered user data initialization
  const [fullName, setFullName] = useState<string>(user?.full_name || '');
  const [userType, setUserType] = useState<string>(user?.user_type || 'individual');
  const [jobTitle, setJobTitle] = useState<string>(user?.job_title || user?.designation || user?.department || user?.occupation || '');
  const [organization, setOrganization] = useState<string>(user?.organization || user?.company_name || user?.college_name || '');
  const [phone, setPhone] = useState<string>(user?.phone || user?.mobile_number || '');
  const [location, setLocation] = useState<string>(user?.location || (user?.city ? `${user.city}${user.state ? `, ${user.state}` : ''}${user.country ? `, ${user.country}` : ''}` : ''));

  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  // Validation errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data && res.data.user) {
          const u = res.data.user;
          setFullName(u.full_name || user?.full_name || '');
          setUserType(u.user_type || user?.user_type || 'individual');
          setJobTitle(u.job_title || u.designation || u.department || u.occupation || '');
          setOrganization(u.organization || u.company_name || u.college_name || '');
          setPhone(u.phone || u.mobile_number || '');
          let loc = u.location || '';
          if (!loc && u.city) loc = u.city + (u.state ? `, ${u.state}` : '') + (u.country ? `, ${u.country}` : '');
          setLocation(loc);

          if (setUser) {
            setUser(u);
            localStorage.setItem('dms_user', JSON.stringify(u));
            window.dispatchEvent(new CustomEvent('dms_user_updated', { detail: u }));
          }
        }
      } catch (e) {
        console.error('Failed to fetch profile', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showToastNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters long.';
    }

    if (phone.trim()) {
      const phoneRegex = /^[+]?[\d\s().-]+$/;
      const phoneClean = phone.replace(/[\s().+-]/g, '');
      if (!phoneRegex.test(phone.trim()) || phoneClean.length < 7 || phoneClean.length > 15) {
        newErrors.phone = 'Please enter a valid phone number.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage({ text: 'Please fix form errors before saving.', type: 'error' });
      return;
    }

    setErrors({});
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.put('/users/profile', {
        fullName: fullName.trim(),
        userType,
        job_title: jobTitle.trim(),
        organization: organization.trim(),
        phone: phone.trim(),
        location: location.trim()
      });

      if (res.data && res.data.success) {
        const updated = res.data.user || {
          ...user,
          full_name: fullName.trim(),
          user_type: userType,
          phone: phone.trim(),
          mobile_number: phone.trim(),
          job_title: jobTitle.trim(),
          organization: organization.trim(),
          location: location.trim()
        };

        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        showToastNotification('Profile updated successfully! 🎉');
        setIsEditing(false);

        if (setUser) setUser(updated);
        localStorage.setItem('dms_user', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('dms_user_updated', { detail: updated }));
      } else {
        setMessage({ text: res.data?.message || 'Failed to update profile.', type: 'error' });
      }
    } catch (err: any) {
      console.error('[ProfilePage] Error updating profile:', err);
      const errMsg = err.response?.data?.message || err.message || 'Error updating profile. Please try again.';
      setMessage({ text: errMsg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // REAL DATA FALLBACKS (Zero Dummy Hardcoded Names)
  const displayFullName = fullName || user?.full_name || 'User Profile';
  const displayEmail = user?.email || 'user@docvault.io';
  const displayUserType = userType || user?.user_type || 'individual';
  const displayJobTitle = jobTitle || user?.job_title || user?.designation || user?.department || user?.occupation || 'Not specified';
  const displayOrg = organization || user?.organization || user?.company_name || user?.college_name || 'Not specified';
  const displayPhone = phone || user?.phone || user?.mobile_number || 'Not specified';
  let displayLocRaw = location || user?.location || '';
  if (!displayLocRaw && user?.city) displayLocRaw = user.city + (user.state ? `, ${user.state}` : '') + (user.country ? `, ${user.country}` : '');
  const displayLocation = displayLocRaw || 'Not specified';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4 font-sans">
        <Loader2 className="w-10 h-10 text-themePrimary animate-spin" />
        <p className="text-sm font-bold text-slate-600">Loading user profile...</p>
      </div>
    );
  }

  const accountTypeOptions = [
    { id: 'professional', label: 'Professional', desc: 'Corporate & Industry workspace', icon: Briefcase },
    { id: 'student', label: 'Student', desc: 'Academic & Learning tier', icon: GraduationCap },
    { id: 'individual', label: 'Individual', desc: 'Personal document vault', icon: User },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-page-fade font-sans text-slate-900 dark:text-slate-100">
      {/* Top Header Bar */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-auth-heading">Account Profile</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Manage your personal identity, contact details, and workspace credentials.</p>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                onClick={() => {
                  setFullName(user?.full_name || '');
                  setUserType(user?.user_type || 'individual');
                  setJobTitle(user?.job_title || user?.designation || user?.department || user?.occupation || '');
                  setOrganization(user?.organization || user?.company_name || user?.college_name || '');
                  setPhone(user?.phone || user?.mobile_number || '');
                  setLocation(user?.location || '');
                  setIsEditing(true);
                  setMessage(null);
                  setErrors({});
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-themePrimary via-[#F97316] to-[#EA580C] text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Edit2 className="w-4 h-4 text-white" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={() => { setIsEditing(false); setErrors({}); setMessage(null); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Cancel Editing
              </button>
            )}

            <Link 
              href="/user/settings" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-orange-300 transition-all"
            >
              <Settings className="w-4 h-4 text-themePrimary" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Alert Message Banner */}
      {message && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 border shadow-sm animate-fade-in ${
          message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-900 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-900 dark:text-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
          <div>
            <h4 className="text-sm font-bold">{message.type === 'success' ? 'Profile Saved' : 'Validation Error'}</h4>
            <p className="text-sm mt-0.5 opacity-90 font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Quick Summary Card + Security Status */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Identity Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm text-center space-y-4 relative overflow-hidden">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-tr from-themePrimary to-[#F97316] p-1 shadow-lg shadow-orange-500/20 relative">
              <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center text-themePrimary font-black text-3xl font-auth-heading">
                {getInitials(displayFullName)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs" title="Verified Account">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-auth-heading tracking-tight">{displayFullName}</h2>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 font-mono">
                <Mail className="w-3.5 h-3.5 text-themePrimary" />
                <span>{displayEmail}</span>
                <button 
                  onClick={() => copyToClipboard(displayEmail)} 
                  className="text-slate-400 hover:text-themePrimary transition ml-1 cursor-pointer"
                  title="Copy Email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              
              <div className="mt-3">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/50 text-themePrimary dark:text-orange-300 text-[10px] font-black uppercase tracking-wider border border-orange-200 dark:border-orange-900 font-auth-heading">
                  ⚡ {displayUserType}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400 uppercase tracking-wider text-[11px]">Profile Status</span>
                <span className="text-themePrimary font-black bg-orange-50 dark:bg-orange-950/50 px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-900 text-[10px]">
                  100% Active
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-themePrimary to-[#F97316] rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Security Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-themePrimary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-auth-heading">Security Credentials</h3>
                <p className="text-[11px] text-slate-500 font-medium">Authentication & Trust Status</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2.5 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">Email Address</p>
                    <p className="text-[10px] text-slate-500 font-medium">Verified</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2.5 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-themePrimary flex items-center justify-center shrink-0">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">Password</p>
                    <p className="text-[10px] text-slate-500 font-medium">Protected & Secure</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
            </div>

            <Link
              href="/user/settings"
              className="w-full py-2.5 px-4 rounded-xl bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 text-themePrimary dark:text-orange-300 font-bold text-xs flex items-center justify-between transition-colors group cursor-pointer border border-orange-200/80 dark:border-orange-900"
            >
              <span>Manage Security Settings</span>
              <ChevronRight className="w-4 h-4 text-themePrimary group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

        {/* Right Column: Information Cards / Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-8 transition-all">
            
            {isEditing ? (
              /* --- EDIT FORM MODE --- */
              <form onSubmit={handleUpdate} className="space-y-6 font-sans" noValidate>
                
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-auth-heading">Edit Profile Information</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">Update your display name, contact phone, job role, and company information.</p>
                </div>

                {/* Personal Information Inputs */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-auth-heading">Personal Information</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => { setFullName(e.target.value); clearError('fullName'); }}
                          placeholder="Enter your full name"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${errors.fullName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-themePrimary focus:ring-2 focus:ring-themePrimary/20'} rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all`}
                        />
                        <User className="w-4 h-4 text-themePrimary absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                      {errors.fullName && <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.fullName}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); clearError('phone'); }}
                          placeholder="e.g. +91 9876543210"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${errors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-themePrimary focus:ring-2 focus:ring-themePrimary/20'} rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all`}
                        />
                        <Phone className="w-4 h-4 text-themePrimary absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                      {errors.phone && <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.phone}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Location
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => { setLocation(e.target.value); clearError('location'); }}
                          placeholder="e.g. Chennai, Tamil Nadu"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${errors.location ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-themePrimary focus:ring-2 focus:ring-themePrimary/20'} rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all`}
                        />
                        <MapPin className="w-4 h-4 text-themePrimary absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                      {errors.location && <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.location}</p>}
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-auth-heading">Professional Details</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Job Title / Designation
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-themePrimary transition-all"
                        />
                        <Briefcase className="w-4 h-4 text-themePrimary absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Organization / Company
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="e.g. Tech Corp / Self-Employed"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-themePrimary transition-all"
                        />
                        <Building className="w-4 h-4 text-themePrimary absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Tier */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-auth-heading">Account Classification Tier</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {accountTypeOptions.map((opt) => {
                      const IconComp = opt.icon;
                      const isSelected = userType.toLowerCase() === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setUserType(opt.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 ring-2 ring-orange-500/30'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-orange-50/50 hover:border-orange-200'
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-themePrimary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-xs font-bold ${isSelected ? 'text-themePrimary dark:text-orange-300' : 'text-slate-900 dark:text-white'}`}>{opt.label}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setErrors({}); setMessage(null); }}
                    className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-themePrimary via-[#F97316] to-[#EA580C] hover:opacity-90 rounded-xl shadow-md shadow-orange-500/25 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Profile Changes</span>
                  </button>
                </div>

              </form>
            ) : (
              /* --- VIEW PROFILE DETAILS MODE --- */
              <div className="space-y-8 font-sans">
                
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-themePrimary">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-auth-heading">Personal Information</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Identity & primary contact details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1 hover:border-orange-200 transition-all">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-auth-heading">
                        <User className="w-3.5 h-3.5 text-themePrimary" />
                        <span>Full Name</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white pt-0.5">{displayFullName}</p>
                    </div>

                    {/* Email Address */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1 hover:border-orange-200 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-auth-heading">
                          <Mail className="w-3.5 h-3.5 text-themePrimary" />
                          <span>Email Address</span>
                        </div>
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Verified
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white pt-0.5 font-mono">{displayEmail}</p>
                    </div>

                    {/* Phone Number */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1 hover:border-orange-200 transition-all">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-auth-heading">
                        <Phone className="w-3.5 h-3.5 text-themePrimary" />
                        <span>Phone Number</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white pt-0.5 font-mono">{displayPhone}</p>
                    </div>

                    {/* Location */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1 hover:border-orange-200 transition-all">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-auth-heading">
                        <MapPin className="w-3.5 h-3.5 text-themePrimary" />
                        <span>Location</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white pt-0.5">{displayLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-themePrimary">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-auth-heading">Professional Information</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Work designation & organization affiliations</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Job Title */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1 hover:border-orange-200 transition-all">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-auth-heading">
                        <Briefcase className="w-3.5 h-3.5 text-themePrimary" />
                        <span>Job Title / Role</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white pt-0.5">{displayJobTitle}</p>
                    </div>

                    {/* Organization */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1 hover:border-orange-200 transition-all">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-auth-heading">
                        <Building className="w-3.5 h-3.5 text-themePrimary" />
                        <span>Organization / Company</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white pt-0.5">{displayOrg}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

      {/* Floating Toast Notification Popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-600 animate-in fade-in slide-in-from-bottom-5 duration-200 font-sans">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}
    </div>
  );
}
