'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, ShieldCheck, Mail, ArrowLeft, CheckCircle2, Edit2, Loader2, AlertCircle, Save, Phone, MapPin, Briefcase, Building, Key, ChevronRight } from 'lucide-react';
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
  const [location, setLocation] = useState<string>(user?.location || user?.city ? (user?.city + (user?.state ? `, ${user.state}` : '') + (user?.country ? `, ${user.country}` : '')) : '');

  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Validation errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data && res.data.user) {
          const u = res.data.user;
          setFullName(u.full_name || '');
          setUserType(u.user_type || 'individual');
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

    // --- JavaScript Form Validation ---
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters long.';
    } else if (fullName.trim().length > 50) {
      newErrors.fullName = 'Full name cannot exceed 50 characters.';
    }

    if (phone.trim()) {
      // Basic international phone regex (allows +, numbers, spaces, dashes, parens, dots)
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

    // --- End Validation ---

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
        // Refresh local storage user
        const updated = res.data.user;
        localStorage.setItem('dms_user', JSON.stringify(updated));
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

  const displayFullName = fullName || user?.full_name || 'Authenticated User';
  const displayEmail = user?.email || 'user@docvault.io';
  const displayUserType = userType || user?.user_type || 'individual';
  const displayJobTitle = jobTitle || user?.job_title || user?.designation || user?.department || user?.occupation || 'Not specified';
  const displayOrg = organization || user?.organization || user?.company_name || user?.college_name || 'Not specified';
  const displayPhone = phone || user?.phone || user?.mobile_number || 'Not specified';
  let displayLocRaw = location || user?.location || '';
  if (!displayLocRaw && user?.city) displayLocRaw = user.city + (user.state ? `, ${user.state}` : '') + (user.country ? `, ${user.country}` : '');
  const displayLocation = displayLocRaw || 'Not specified';

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Link href="/user" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            Workspace
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-900">Account Settings</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profile & Preferences</h1>
            <p className="text-slate-500 mt-1">Manage your personal information and account security.</p>
          </div>
          {!isEditing && (
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
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 rounded-lg shadow-sm transition-all"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
          <div>
            <h4 className="text-sm font-semibold">{message.type === 'success' ? 'Success' : 'Validation Error'}</h4>
            <p className="text-sm mt-0.5 opacity-90">{message.text}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 text-slate-600 font-bold text-3xl flex items-center justify-center border-4 border-white ring-1 ring-slate-200 shadow-sm mb-4">
              {getInitials(displayFullName)}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{displayFullName}</h2>
            <p className="text-slate-500 text-sm mt-1">{displayEmail}</p>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-slate-500 font-medium">Account Tier</span>
                <span className="font-semibold text-slate-900 capitalize px-2.5 py-0.5 bg-slate-100 rounded-md border border-slate-200">{displayUserType}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-slate-500 font-medium">Role</span>
                <span className="font-medium text-slate-900 truncate max-w-[120px]">{displayJobTitle}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Organization</span>
                <span className="font-medium text-slate-900 truncate max-w-[120px]">{displayOrg}</span>
              </div>
            </div>
          </div>

          {/* Security Summary Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" /> Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Email Address</p>
                    <p className="text-xs text-slate-500">Verified</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Key className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Password</p>
                    <p className="text-xs text-slate-500">Secure</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Forms */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            
            {isEditing ? (
              <form onSubmit={handleUpdate} className="divide-y divide-slate-100" noValidate>
                <div className="p-6 sm:p-8 space-y-6">
                  <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => { setFullName(e.target.value); clearError('fullName'); }}
                        className={`w-full px-4 py-2.5 bg-white border ${errors.fullName ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 transition-colors shadow-sm`}
                      />
                      {errors.fullName && <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.fullName}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); clearError('phone'); }}
                        placeholder="+1 (555) 000-0000"
                        className={`w-full px-4 py-2.5 bg-white border ${errors.phone ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 transition-colors shadow-sm`}
                      />
                      {errors.phone && <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => { setLocation(e.target.value); clearError('location'); }}
                        placeholder="City, Country"
                        className={`w-full px-4 py-2.5 bg-white border ${errors.location ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 transition-colors shadow-sm`}
                      />
                      {errors.location && <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.location}</p>}
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-900">Professional Details</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title</label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => { setJobTitle(e.target.value); clearError('jobTitle'); }}
                        className={`w-full px-4 py-2.5 bg-white border ${errors.jobTitle ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 transition-colors shadow-sm`}
                      />
                      {errors.jobTitle && <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.jobTitle}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization</label>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => { setOrganization(e.target.value); clearError('organization'); }}
                        className={`w-full px-4 py-2.5 bg-white border ${errors.organization ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 transition-colors shadow-sm`}
                      />
                      {errors.organization && <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.organization}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Tier / Type</label>
                      <select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-sm cursor-pointer"
                      >
                        <option value="student">Student</option>
                        <option value="professional">Professional</option>
                        <option value="individual">Individual</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex items-center justify-end gap-3 bg-slate-50 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setErrors({}); setMessage(null); }}
                    className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 rounded-lg shadow-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !hasChanges}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Full Name</p>
                      <p className="text-base text-slate-900">{displayFullName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Email Address</p>
                      <p className="text-base text-slate-900">{displayEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Phone Number</p>
                      <p className="text-base text-slate-900">{displayPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Location</p>
                      <p className="text-base text-slate-900">{displayLocation}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Professional Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Job Title</p>
                      <p className="text-base text-slate-900">{displayJobTitle}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Organization</p>
                      <p className="text-base text-slate-900">{displayOrg}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Account Type</p>
                      <p className="text-base text-slate-900 capitalize">{displayUserType}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
