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
  const [fullName, setFullName] = useState<string>(user?.full_name || '');
  const [userType, setUserType] = useState<string>(user?.user_type || 'individual');
  
  const [jobTitle, setJobTitle] = useState<string>(user?.job_title || user?.designation || user?.department || user?.occupation || '');
  const [organization, setOrganization] = useState<string>(user?.organization || user?.company_name || user?.college_name || '');
  const [phone, setPhone] = useState<string>(user?.phone || user?.mobile_number || '');
  const [location, setLocation] = useState<string>(user?.location || (user?.city ? `${user.city}${user.state ? `, ${user.state}` : ''}${user.country ? `, ${user.country}` : ''}` : ''));

  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
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
          }
        }
      } catch (e) {
        console.error('Failed to fetch profile', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [setUser]);

  const hasChanges = 
    fullName.trim() !== (user?.full_name || '') ||
    userType !== (user?.user_type || 'individual') ||
    jobTitle.trim() !== (user?.job_title || '') ||
    organization.trim() !== (user?.organization || '') ||
    phone.trim() !== (user?.phone || '') ||
    location.trim() !== (user?.location || '');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges) {
      setIsEditing(false);
      setErrors({});
      setMessage(null);
      return;
    }

    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters long.';
    } else if (fullName.trim().length > 50) {
      newErrors.fullName = 'Full name cannot exceed 50 characters.';
    }

    if (phone.trim()) {
      const phoneRegex = /^[+]?[\d\s().-]+$/;
      const phoneClean = phone.replace(/[\s().+-]/g, '');
      if (!phoneRegex.test(phone.trim()) || phoneClean.length < 7 || phoneClean.length > 15) {
        newErrors.phone = 'Please enter a valid phone number (7-15 digits).';
      }
    }

    if (location.trim() && location.trim().length > 100) {
      newErrors.location = 'Location cannot exceed 100 characters.';
    }
    
    if (jobTitle.trim() && jobTitle.trim().length > 100) {
      newErrors.jobTitle = 'Job title cannot exceed 100 characters.';
    }

    if (organization.trim() && organization.trim().length > 100) {
      newErrors.organization = 'Organization cannot exceed 100 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage({ text: 'Please fix the errors in the form before saving.', type: 'error' });
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
        setMessage({ text: 'Profile updated successfully.', type: 'success' });
        setIsEditing(false);
        const updated = res.data.user;
        localStorage.setItem('dms_user', JSON.stringify(updated));
        if (setUser) setUser(updated);
      } else {
        setMessage({ text: res.data?.message || 'Failed to update profile.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: 'Error updating profile. Please try again.', type: 'error' });
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

  const displayFullName = fullName || user?.full_name || 'Bharathi';
  const displayEmail = user?.email || 'bharathi123@gmail.com';
  const displayUserType = userType || user?.user_type || 'Professional';
  const displayJobTitle = jobTitle || user?.job_title || user?.designation || user?.department || user?.occupation || 'Software Developer';
  const displayOrg = organization || user?.organization || user?.company_name || user?.college_name || 'HCL';
  const displayPhone = phone || user?.phone || user?.mobile_number || '7010979392';
  let displayLocRaw = location || user?.location || '';
  if (!displayLocRaw && user?.city) displayLocRaw = user.city + (user.state ? `, ${user.state}` : '') + (user.country ? `, ${user.country}` : '');
  const displayLocation = displayLocRaw || 'Not specified';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-sm font-bold text-slate-600">Loading profile details...</p>
      </div>
    );
  }

  const accountTypeOptions = [
    { id: 'professional', label: 'Professional', desc: 'Corporate & Industry workspace', icon: Briefcase },
    { id: 'student', label: 'Student', desc: 'Academic & Learning tier', icon: GraduationCap },
    { id: 'individual', label: 'Individual', desc: 'Personal document vault', icon: User },
    { id: 'enterprise', label: 'Enterprise', desc: 'Organization team account', icon: Building },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-page-fade">
      {/* Top Header Bar */}
      <div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium mb-1">
          <Link href="/user" className="hover:text-orange-600 transition-colors">
            User Account
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold">Account Profile</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Account Profile</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Manage your personal identity, contact details, and workspace credentials.</p>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                onClick={() => {
                  setFullName(user?.full_name || '');
                  setUserType(user?.user_type || 'individual');
                  setJobTitle(user?.job_title || '');
                  setOrganization(user?.organization || '');
                  setPhone(user?.phone || '');
                  setLocation(user?.location || '');
                  setIsEditing(true);
                  setMessage(null);
                  setErrors({});
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={() => { setIsEditing(false); setErrors({}); setMessage(null); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Cancel Editing
              </button>
            )}

            <Link 
              href="/user/settings" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm hover:border-orange-300 transition-all"
            >
              <Settings className="w-4 h-4 text-orange-500" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Alert Message Banner */}
      {message && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 border shadow-sm animate-fade-in ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
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
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm text-center space-y-4 relative overflow-hidden">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 p-1 shadow-lg shadow-orange-500/20 relative">
              <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-orange-600 font-black text-3xl">
                {getInitials(displayFullName)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs" title="Verified Account">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">{displayFullName}</h2>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                <Mail className="w-3.5 h-3.5 text-orange-500" />
                <span>{displayEmail}</span>
                <button
                  onClick={() => copyToClipboard(displayEmail)}
                  className="p-1 text-slate-400 hover:text-orange-600 transition-colors rounded"
                  title="Copy Email"
                >
                  {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-black text-xs border border-orange-200 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  {displayUserType}
                </span>
              </div>
            </div>

            {/* Profile Completeness Bar */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400 uppercase tracking-wider text-[11px]">Profile Status</span>
                <span className="text-orange-600 font-black bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 text-[10px]">
                  95% Complete
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" style={{ width: '95%' }} />
              </div>
            </div>
          </div>

          {/* Security Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Security Credentials</h3>
                <p className="text-[11px] text-slate-500 font-medium">Authentication & Trust Status</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/40 border border-orange-100/80">
                <div className="flex items-center gap-2.5 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Email Address</p>
                    <p className="text-[10px] text-slate-500">Verified</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/40 border border-orange-100/80">
                <div className="flex items-center gap-2.5 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Password</p>
                    <p className="text-[10px] text-slate-500">Protected & Secure</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
            </div>

            <Link
              href="/user/settings"
              className="w-full py-2.5 px-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-between transition-colors group cursor-pointer border border-orange-200/80"
            >
              <span>Manage Security Settings</span>
              <ChevronRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

        {/* Right Column: Information Cards / Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 transition-all">
            
            {isEditing ? (
              /* --- EDIT FORM MODE --- */
              <form onSubmit={handleUpdate} className="space-y-6" noValidate>
                
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900">Edit Profile Information</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Update your display name, contact phone, job role, and company information.</p>
                </div>

                {/* Personal Information Inputs */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Personal Information</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => { setFullName(e.target.value); clearError('fullName'); }}
                          placeholder="Bharathi"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.fullName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'} rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all`}
                        />
                        <User className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                      {errors.fullName && <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.fullName}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); clearError('phone'); }}
                          placeholder="7010979392"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'} rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all`}
                        />
                        <Phone className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                      {errors.phone && <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.phone}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Location
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => { setLocation(e.target.value); clearError('location'); }}
                          placeholder="Not specified"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.location ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'} rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all`}
                        />
                        <MapPin className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                      {errors.location && <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.location}</p>}
                    </div>
                  </div>
                </div>

                {/* Professional Details Inputs */}
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Professional Details</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Job Title
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={jobTitle}
                          onChange={(e) => { setJobTitle(e.target.value); clearError('jobTitle'); }}
                          placeholder="Software Developer"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.jobTitle ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'} rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all`}
                        />
                        <Briefcase className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                      {errors.jobTitle && <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.jobTitle}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Organization
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => { setOrganization(e.target.value); clearError('organization'); }}
                          placeholder="HCL"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.organization ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'} rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all`}
                        />
                        <Building className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                      {errors.organization && <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.organization}</p>}
                    </div>
                  </div>
                </div>

                {/* Visual Account Tier Cards */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Account Classification Tier
                  </label>
                  
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
                              ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/30'
                              : 'bg-slate-50 border-slate-200 hover:bg-orange-50/50 hover:border-orange-200'
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-xs font-extrabold ${isSelected ? 'text-orange-950' : 'text-slate-900'}`}>{opt.label}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setErrors({}); setMessage(null); }}
                    className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !hasChanges}
                    className="px-6 py-2.5 text-xs font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md shadow-orange-500/25 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Profile Changes</span>
                  </button>
                </div>

              </form>
            ) : (
              /* --- VIEW PROFILE DETAILS MODE --- */
              <div className="space-y-8">
                
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Personal Information</h3>
                      <p className="text-xs text-slate-500 font-medium">Identity & primary contact details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1 hover:border-orange-200 hover:bg-orange-50/30 transition-all">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <User className="w-3.5 h-3.5 text-orange-500" />
                        <span>Full Name</span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 pt-0.5">{displayFullName}</p>
                    </div>

                    {/* Email Address */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1 hover:border-orange-200 hover:bg-orange-50/30 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <Mail className="w-3.5 h-3.5 text-orange-500" />
                          <span>Email Address</span>
                        </div>
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Verified
                        </span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 pt-0.5">{displayEmail}</p>
                    </div>

                    {/* Phone Number */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1 hover:border-orange-200 hover:bg-orange-50/30 transition-all">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Phone className="w-3.5 h-3.5 text-orange-500" />
                        <span>Phone Number</span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 pt-0.5">{displayPhone}</p>
                    </div>

                    {/* Location */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1 hover:border-orange-200 hover:bg-orange-50/30 transition-all">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        <span>Location</span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 pt-0.5">{displayLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Details Section */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Professional Details</h3>
                      <p className="text-xs text-slate-500 font-medium">Career position, organization & workspace role</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Job Title */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1 hover:border-orange-200 hover:bg-orange-50/30 transition-all">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                        <span>Job Title</span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 pt-0.5">{displayJobTitle}</p>
                    </div>

                    {/* Organization */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1 hover:border-orange-200 hover:bg-orange-50/30 transition-all">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Building className="w-3.5 h-3.5 text-orange-500" />
                        <span>Organization</span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 pt-0.5">{displayOrg}</p>
                    </div>

                    {/* Account Classification */}
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1 hover:border-orange-200 hover:bg-orange-50/30 transition-all flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <BadgeCheck className="w-3.5 h-3.5 text-orange-500" />
                          <span>Account Classification</span>
                        </div>
                        <p className="text-sm font-extrabold text-slate-900 pt-0.5 capitalize">{displayUserType}</p>
                      </div>
                      
                      <span className="px-3 py-1 rounded-xl bg-orange-50 text-orange-600 font-black text-xs border border-orange-200 uppercase tracking-wider">
                        {displayUserType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Settings Shortcut Bar */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-orange-500/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white text-orange-600 font-bold shrink-0 shadow-xs">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">Need to adjust account credentials or preferences?</h4>
                      <p className="text-[11px] text-white/90 font-medium">Manage security keys, passwords, theme settings, and storage allocations.</p>
                    </div>
                  </div>
                  
                  <Link
                    href="/user/settings"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-orange-50 text-orange-600 font-extrabold text-xs transition-all whitespace-nowrap shadow-xs cursor-pointer shrink-0"
                  >
                    Open Settings
                  </Link>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
