'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  ArrowLeft, 
  User, 
  KeyRound, 
  Moon, 
  Sun, 
  Globe, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight, 
  Loader2, 
  Save, 
  Lock, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  Camera,
  Monitor,
  BellRing,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useTheme, CustomTheme } from '@/context/ThemeContext';
import { useLanguage, SupportedLanguage } from '@/context/LanguageContext';

export default function UserSettingsPage() {
  const { user, setUser, login } = useAuth();
  const { theme, setTheme, customTheme, setCustomTheme, saveUserTheme, resetToDefault } = useTheme();
  const { language: globalLang, setLanguage: setGlobalLang, t, languageOptions, refreshLanguageOptions } = useLanguage();

  const [activeTab, setActiveTab] = useState<'security' | 'preferences' | 'storage' | 'notifications'>('security');
  const [loading, setLoading] = useState<boolean>(true);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [savingPassword, setSavingPassword] = useState<boolean>(false);
  const [savingPreferences, setSavingPreferences] = useState<boolean>(false);
  const [savingNotifications, setSavingNotifications] = useState<boolean>(false);

  // Form states
  const [profileData, setProfileData] = useState<Record<string, string>>({});
  const [profileSchema, setProfileSchema] = useState<any[]>([]);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Password Visibility Toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [displayMode, setDisplayMode] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  // Storage Stats
  const [storageStats, setStorageStats] = useState<any>({
    totalBytes: 0,
    usedBytes: 0,
    freeBytes: 10 * 1024 * 1024 * 1024,
    documentsCount: 0,
    foldersCount: 0
  });

  // Custom Themes
  const [availableThemes, setAvailableThemes] = useState<CustomTheme[]>([]);

  // Notifications State
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailAlerts: true,
    documentShares: true,
    weeklyDigest: false
  });
  const [adminNotificationPolicy, setAdminNotificationPolicy] = useState<any>(null);

  // Feedback Toast & Popup Modal
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [popupNotif, setPopupNotif] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const showPopupNotif = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setPopupNotif({ title, message, type });
    setTimeout(() => setPopupNotif(null), 3500);
  };

  const getAccountTypeSchema = (uType: string = 'professional') => {
    const type = (uType || 'professional').toLowerCase();
    const commonFields = [
      { id: 1, name: 'full_name', label: 'Full Name', type: 'text', required: true, is_active: true, order: 1 },
      { id: 2, name: 'email', label: 'Email Address', type: 'email', required: true, is_active: true, order: 2 },
      { id: 3, name: 'phone', label: 'Mobile / Phone Number', type: 'text', required: true, is_active: true, order: 3 },
    ];

    if (type === 'student') {
      return [
        ...commonFields,
        { id: 4, name: 'college_name', label: 'College / University Name', type: 'text', required: true, is_active: true, order: 4 },
        { id: 5, name: 'department', label: 'Department', type: 'select', options: ['Computer Science', 'Information Technology', 'Artificial Intelligence', 'Electronics', 'Electrical', 'Mechanical', 'Civil', 'Commerce', 'Business Administration', 'Mathematics', 'Physics', 'Chemistry', 'English', 'Other'], required: true, is_active: true, order: 5 },
        { id: 6, name: 'year_of_study', label: 'Year of Study', type: 'select', options: ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Post Graduate', 'Research Scholar'], required: true, is_active: true, order: 6 },
        { id: 7, name: 'student_id', label: 'Student Roll No / ID', type: 'text', required: false, is_active: true, order: 7 },
        { id: 8, name: 'city', label: 'City', type: 'text', required: false, is_active: true, order: 8 },
        { id: 9, name: 'state', label: 'State', type: 'text', required: false, is_active: true, order: 9 },
        { id: 10, name: 'country', label: 'Country', type: 'text', required: false, is_active: true, order: 10 },
      ];
    }

    if (type === 'professional') {
      return [
        ...commonFields,
        { id: 4, name: 'company_name', label: 'Company Name', type: 'text', required: true, is_active: true, order: 4 },
        { id: 5, name: 'designation', label: 'Designation / Job Title', type: 'text', required: true, is_active: true, order: 5 },
        { id: 6, name: 'industry', label: 'Industry Sector', type: 'select', options: ['Information Technology', 'Healthcare', 'Finance', 'Banking', 'Government', 'Education', 'Manufacturing', 'Construction', 'Legal', 'Media', 'Marketing', 'Other'], required: true, is_active: true, order: 6 },
        { id: 7, name: 'years_of_experience', label: 'Years of Experience', type: 'select', options: ['Fresher', '1–2 Years', '3–5 Years', '6–10 Years', '10+ Years'], required: false, is_active: true, order: 7 },
        { id: 8, name: 'employee_id', label: 'Employee ID', type: 'text', required: false, is_active: true, order: 8 },
        { id: 9, name: 'city', label: 'City', type: 'text', required: false, is_active: true, order: 9 },
        { id: 10, name: 'state', label: 'State', type: 'text', required: false, is_active: true, order: 10 },
        { id: 11, name: 'country', label: 'Country', type: 'text', required: false, is_active: true, order: 11 },
      ];
    }

    // Individual / Personal
    return [
      ...commonFields,
      { id: 4, name: 'occupation', label: 'Occupation', type: 'text', required: false, is_active: true, order: 4 },
      { id: 5, name: 'city', label: 'City', type: 'text', required: false, is_active: true, order: 5 },
      { id: 6, name: 'state', label: 'State', type: 'text', required: false, is_active: true, order: 6 },
      { id: 7, name: 'country', label: 'Country', type: 'text', required: false, is_active: true, order: 7 },
    ];
  };

  useEffect(() => {
    // Get stored logged in user data if available
    let storedUser: any = null;
    if (typeof window !== 'undefined') {
      const json = localStorage.getItem('dms_user');
      if (json) { try { storedUser = JSON.parse(json); } catch (e) {} }
    }
    const currentUser = user || storedUser;

    setProfileData(prev => ({
      full_name: currentUser?.full_name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || currentUser?.mobile_number || '',
      company_name: currentUser?.company_name || currentUser?.organization || '',
      designation: currentUser?.designation || currentUser?.job_title || '',
      industry: currentUser?.industry || '',
      years_of_experience: currentUser?.years_of_experience || '',
      employee_id: currentUser?.employee_id || '',
      college_name: currentUser?.college_name || '',
      department: currentUser?.department || '',
      year_of_study: currentUser?.year_of_study || '',
      student_id: currentUser?.student_id || '',
      occupation: currentUser?.occupation || '',
      city: currentUser?.city || '',
      state: currentUser?.state || '',
      country: currentUser?.country || '',
      ...prev
    }));
    
    const storedSchema = localStorage.getItem('dms_admin_profile_fields');
    if (storedSchema) {
      try {
        const parsed = JSON.parse(storedSchema).filter((f: any) => f.is_active);
        setProfileSchema(parsed.sort((a: any, b: any) => a.order - b.order));
      } catch (e) {
        setProfileSchema(getAccountTypeSchema(currentUser?.user_type));
      }
    } else {
      setProfileSchema(getAccountTypeSchema(currentUser?.user_type));
    }

    const storedCustomData = localStorage.getItem('dms_user_custom_profile');
    if (storedCustomData) {
      try {
        setProfileData(prev => ({ ...prev, ...JSON.parse(storedCustomData) }));
      } catch (e) {}
    }

    const storedUserNotifs = localStorage.getItem('dms_user_notifications');
    if (storedUserNotifs) {
      try {
        setNotificationPrefs(JSON.parse(storedUserNotifs));
      } catch (e) {}
    }

    const storedAdminNotifs = localStorage.getItem('dms_admin_notifications');
    if (storedAdminNotifs) {
      try {
        setAdminNotificationPolicy(JSON.parse(storedAdminNotifs));
      } catch (e) {}
    }
    if (theme) setDisplayMode(theme as any);
    setLanguage(globalLang as SupportedLanguage);
  }, [user, theme, globalLang]);

  useEffect(() => {
    refreshLanguageOptions();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings/user');
      if (res.data && res.data.user) {
        const u = res.data.user;
        setProfileData(prev => ({
          full_name: u.full_name || prev.full_name || user?.full_name || '',
          email: u.email || prev.email || user?.email || '',
          phone: u.phone || u.mobile_number || prev.phone || user?.phone || '',
          company_name: u.company_name || u.organization || prev.company_name || user?.company_name || '',
          designation: u.designation || u.job_title || prev.designation || '',
          industry: u.industry || prev.industry || '',
          years_of_experience: u.years_of_experience || prev.years_of_experience || '',
          employee_id: u.employee_id || prev.employee_id || '',
          college_name: u.college_name || prev.college_name || '',
          department: u.department || prev.department || '',
          year_of_study: u.year_of_study || prev.year_of_study || '',
          student_id: u.student_id || prev.student_id || '',
          occupation: u.occupation || prev.occupation || '',
          city: u.city || prev.city || '',
          state: u.state || prev.state || '',
          country: u.country || prev.country || '',
        }));
        if (u.theme) {
          setDisplayMode(u.theme);
          setTheme(u.theme);
        }
        if (u.language) {
          setLanguage(u.language);
          setGlobalLang(u.language);
        }
      }
      if (res.data && res.data.storage) {
        setStorageStats(res.data.storage);
      }
    } catch (err) {
      console.warn('Failed to fetch settings from server, using local states');
    } finally {
      setLoading(false);
    }
  };

  const fetchThemes = async () => {
    try {
      const res = await api.get('/themes');
      if (res.data?.themes) {
        setAvailableThemes(res.data.themes.filter((t: CustomTheme) => t.is_active === 1));
      }
    } catch (error) {
      console.error('Failed to fetch themes', error);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const validateProfile = (): boolean => {
    const errs: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;

    if (!profileData.full_name || !profileData.full_name.trim()) {
      errs.full_name = 'Full Name is required.';
    } else if (profileData.full_name.trim().length < 2) {
      errs.full_name = 'Full Name must be at least 2 characters long.';
    }

    if (!profileData.email || !profileData.email.trim()) {
      errs.email = 'Email Address is required.';
    } else if (!emailRegex.test(profileData.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. user@domain.com).';
    }

    if (profileData.phone && profileData.phone.trim() && !phoneRegex.test(profileData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number (digits only).';
    }

    profileSchema.forEach(field => {
      if (field.required) {
        const val = profileData[field.name];
        if (!val || (typeof val === 'string' && !val.trim())) {
          if (!errs[field.name]) {
            errs[field.name] = `${field.label} is required.`;
          }
        }
      }
    });

    setProfileErrors(errs);
    if (Object.keys(errs).length > 0) {
      showToast('Please fix the highlighted form errors.', 'error');
      return false;
    }
    return true;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setSavingProfile(true);
    try {
      const payload = { ...profileData, full_name: profileData.full_name || '', email: profileData.email || '' };
      
      try {
        await api.put('/settings/user/profile', payload);
      } catch (e) {
        console.warn('Server profile sync failed/offline, saving profile locally.');
      }
      
      localStorage.setItem('dms_user_custom_profile', JSON.stringify(profileData));

      const updatedUser = {
        ...(user || {}),
        ...profileData,
        full_name: profileData.full_name || user?.full_name || '',
        email: profileData.email || user?.email || '',
        phone: profileData.phone || user?.phone || '',
        mobile_number: profileData.phone || user?.mobile_number || '',
        company_name: profileData.company_name || user?.company_name || '',
        organization: profileData.company_name || user?.organization || '',
      };

      localStorage.setItem('dms_user', JSON.stringify(updatedUser));
      if (setUser) {
        setUser(updatedUser);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('dms_profile_updated'));
      }

      showToast('Profile information updated successfully!');
      showPopupNotif('Profile Saved Successfully!', 'Your profile details and personal information have been saved.');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const validatePasswordForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!currentPassword || !currentPassword.trim()) {
      errs.currentPassword = 'Current password is required.';
    }

    if (!newPassword || !newPassword.trim()) {
      errs.newPassword = 'New password is required.';
    } else if (newPassword.length < 8) {
      errs.newPassword = 'New password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(newPassword)) {
      errs.newPassword = 'Password must contain at least one uppercase letter (A-Z).';
    } else if (!/[a-z]/.test(newPassword)) {
      errs.newPassword = 'Password must contain at least one lowercase letter (a-z).';
    } else if (!/[0-9]/.test(newPassword)) {
      errs.newPassword = 'Password must contain at least one number (0-9).';
    } else if (!/[^A-Za-z0-9\s]/.test(newPassword)) {
      errs.newPassword = 'Password must contain at least one special character (!@#$%^&*).';
    }

    if (!confirmPassword || !confirmPassword.trim()) {
      errs.confirmPassword = 'Please confirm your new password.';
    } else if (confirmPassword !== newPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) {
      showToast('Please fix password validation errors.', 'error');
      return false;
    }
    return true;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setSavingPassword(true);
    try {
      await api.put('/settings/user/password', { 
        currentPassword, 
        newPassword, 
        current_password: currentPassword, 
        new_password: newPassword 
      });
      showToast('Password changed successfully!');
      showPopupNotif('Password Security Updated!', 'Your account password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
    } catch (err: any) {
      console.error('Failed to change password:', err);
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPreferences(true);

    try {
      await api.put('/settings/user/preferences', { theme: displayMode, language: language });
      await saveUserTheme(customTheme ? customTheme.id : null);
      showToast('Preferences saved successfully!');
      showPopupNotif('Preferences Saved!', 'Your display theme, language, and custom color preferences are updated.');
    } catch (err) {
      console.error('Failed to save preferences:', err);
      showToast('Failed to save preferences.', 'error');
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleSelectDisplayMode = (mode: 'light' | 'dark' | 'system') => {
    setDisplayMode(mode);
    setTheme(mode);
  };

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setGlobalLang(lang);
  };

  const handleSelectCustomTheme = (t: CustomTheme | null) => {
    if (t) {
      setCustomTheme(t);
    } else {
      resetToDefault();
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotifications(true);
    try {
      // Mock saving to backend
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem('dms_user_notifications', JSON.stringify(notificationPrefs));
      showToast('Notification preferences saved successfully!');
    } catch (err) {
      showToast('Failed to save notification preferences.', 'error');
    } finally {
      setSavingNotifications(false);
    }
  };

  const formatFileSize = (bytes: number = 0) => {
    if (!bytes || isNaN(bytes)) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storageUsed = storageStats.storageUsedBytes || 0;
  const storageLimit = storageStats.storageLimitBytes || 15 * 1024 * 1024 * 1024;
  const storagePct = Math.min(100, Math.max(1, (storageUsed / storageLimit) * 100));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Popup Notification Modal */}
      {popupNotif && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-pop-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4 relative">
            <button
              onClick={() => setPopupNotif(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{popupNotif.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">{popupNotif.message}</p>
            </div>

            <button
              onClick={() => setPopupNotif(null)}
              className="w-full py-2.5 rounded-xl bg-[#1B664B] text-white font-black text-xs shadow-md shadow-emerald-950/20 hover:scale-105 transition cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed top-20 right-6 z-[100000] text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 ${
          toastMsg.type === 'success' ? 'bg-slate-900' : 'bg-rose-600'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-[#1B664B]" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t('settings.title', 'Settings & Preferences')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.subtitle', 'Manage account credentials, security preferences, theme, and storage allocations')}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveTab('security')}
          className={`px-5 py-2.5 text-sm font-extrabold rounded-2xl transition whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-[#1B664B] text-white shadow-md shadow-emerald-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {t('settings.securityPassword', 'Security & Password')}
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-5 py-2.5 text-sm font-extrabold rounded-2xl transition whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'bg-[#1B664B] text-white shadow-md shadow-emerald-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {t('settings.themeLanguage', 'Theme & Language')}
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-5 py-2.5 text-sm font-extrabold rounded-2xl transition whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-[#1B664B] text-white shadow-md shadow-emerald-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Notifications
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`px-5 py-2.5 text-sm font-extrabold rounded-2xl transition whitespace-nowrap ${
            activeTab === 'storage'
              ? 'bg-[#1B664B] text-white shadow-md shadow-emerald-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {t('settings.storageUsage', 'Storage Usage')}
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xl">
          <Loader2 className="w-8 h-8 text-[#1B664B] dark:text-[#1B664B] animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('common.loading', 'Loading settings & preferences...')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
          {/* TAB 1: CHANGE PASSWORD */}
          {activeTab === 'security' && (
            <form noValidate onSubmit={handleChangePassword} className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{t('settings.changePassword', 'Change Password')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.passwordSub', 'Ensure your document vault remains secure with a strong password.')}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('settings.currentPassword', 'Current Password')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      if (passwordErrors.currentPassword) setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                    }}
                    placeholder="Enter current password"
                    className={`w-full pl-4 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800 border ${passwordErrors.currentPassword ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-[#1B664B]'} rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition-colors rounded-lg focus:outline-none"
                    title={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordErrors.currentPassword}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('settings.newPassword', 'New Password')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordErrors.newPassword) setPasswordErrors({ ...passwordErrors, newPassword: '' });
                    }}
                    placeholder="Enter new password"
                    className={`w-full pl-4 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800 border ${passwordErrors.newPassword ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-[#1B664B]'} rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition-colors rounded-lg focus:outline-none"
                    title={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordErrors.newPassword}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('settings.confirmPassword', 'Confirm New Password')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordErrors.confirmPassword) setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                    }}
                    placeholder="Confirm new password"
                    className={`w-full pl-4 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800 border ${passwordErrors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-[#1B664B]'} rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition-colors rounded-lg focus:outline-none"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordErrors.confirmPassword}</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2.5 rounded-xl bg-[#1B664B] hover:brightness-110 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/20"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('common.save', 'Updating Password...')}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{t('settings.changePassword', 'Update Password')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: THEME & PREFERENCES */}
          {activeTab === 'preferences' && (
            <form onSubmit={handleSavePreferences} className="space-y-8 max-w-3xl">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Appearance</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Customize display mode and interface colors.</p>
              </div>

              {/* Display Mode */}
              <div className="space-y-3">
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Display Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectDisplayMode('light')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                      displayMode === 'light'
                        ? 'border-[#1B664B] bg-[#E8F5F0] dark:bg-emerald-950/60 text-[#1B664B] font-bold ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span className="text-sm">Light</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDisplayMode('dark')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                      displayMode === 'dark'
                        ? 'border-[#1B664B] bg-[#E8F5F0] dark:bg-emerald-950/60 text-[#1B664B] font-bold ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="text-sm">Dark</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleSelectDisplayMode('system')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                      displayMode === 'system'
                        ? 'border-[#1B664B] bg-[#E8F5F0] dark:bg-emerald-950/60 text-[#1B664B] font-bold ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Monitor className="w-5 h-5" />
                    <span className="text-sm">System</span>
                  </button>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* Custom Themes */}
              <div className="space-y-3">
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Available Themes
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition">
                    <input 
                      type="radio" 
                      name="theme_selection"
                      checked={!customTheme}
                      onChange={() => handleSelectCustomTheme(null)}
                      className="w-4 h-4 text-[#1B664B] focus:ring-themePrimary border-slate-300"
                    />
                    <span className="text-sm font-bold text-slate-900 dark:text-white flex-1">Default System Theme</span>
                  </label>

                  {availableThemes.map(t => (
                    <label key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition">
                      <input 
                        type="radio" 
                        name="theme_selection"
                        checked={customTheme?.id === t.id}
                        onChange={() => handleSelectCustomTheme(t)}
                        className="w-4 h-4 text-[#1B664B] focus:ring-themePrimary border-slate-300"
                      />
                      <span className="text-sm font-bold text-slate-900 dark:text-white flex-1">{t.theme_name}</span>
                      <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: t.primary_color }} />
                        <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: t.secondary_color }} />
                        <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: t.background_color }} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <hr className="border-slate-200 dark:border-slate-800" />

              <div className="space-y-3">
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => handleSelectLanguage(e.target.value as SupportedLanguage)}
                  className="w-full sm:w-64 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-[#1B664B] transition-all shadow-sm"
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.code} value={opt.code} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      {opt.nativeName === opt.name ? opt.name : `${opt.nativeName} (${opt.name})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <hr className="border-slate-200 dark:border-slate-800" />

              <div>
                <button
                  type="submit"
                  disabled={savingPreferences}
                  className="px-6 py-3 rounded-xl bg-[#1B664B] hover:brightness-110 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 w-full sm:w-auto"
                >
                  {savingPreferences ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Preferences...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Preferences</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: STORAGE USAGE */}
          {activeTab === 'storage' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{t('settings.storageUsage', 'Storage Quota')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.storageSub', 'Overview of total document count and disk capacity consumed.')}</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{t('settings.storageCapacity', 'Storage Capacity Used')}</span>
                  <span className="text-sm font-mono text-[#1B664B] dark:text-[#1B664B] font-bold">
                    {formatFileSize(storageUsed)} / {formatFileSize(storageLimit)} ({storagePct.toFixed(1)}%)
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${storagePct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>{t('settings.documentsVaulted', 'Documents Vaulted')}:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{storageStats.documentsUploaded || 0} Files</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSaveNotifications} className="space-y-8 max-w-3xl">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Notification Preferences</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Control how and when you receive alerts from the system.</p>
              </div>

              {adminNotificationPolicy && !adminNotificationPolicy.email?.enabled && (
                <div className="p-4 bg-[#E8F5F0] dark:bg-emerald-900/60 border border-[#D1EBE1] dark:border-amber-800 rounded-xl flex gap-3 text-[#1B664B] dark:text-[#1B664B]">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">Your administrator has currently disabled email notifications globally. Changing these preferences won't take effect until global email services are restored.</p>
                </div>
              )}

              <div className="space-y-4">
                <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.emailAlerts}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, emailAlerts: e.target.checked })}
                    className="mt-1 w-4 h-4 text-[#1B664B] focus:ring-themePrimary rounded border-slate-300 dark:border-slate-600"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Security & Login Alerts</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Receive an email when a new device logs into your account.</p>
                  </div>
                </label>

                <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.documentShares}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, documentShares: e.target.checked })}
                    className="mt-1 w-4 h-4 text-[#1B664B] focus:ring-themePrimary rounded border-slate-300 dark:border-slate-600"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Document Shares</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get notified when someone shares a document with you.</p>
                  </div>
                </label>

                <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.weeklyDigest}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, weeklyDigest: e.target.checked })}
                    className="mt-1 w-4 h-4 text-[#1B664B] focus:ring-themePrimary rounded border-slate-300 dark:border-slate-600"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Digest</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Receive a weekly summary of your storage usage and document activity.</p>
                  </div>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={savingNotifications}
                  className="px-6 py-3 rounded-xl bg-[#1B664B] hover:brightness-110 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 w-full sm:w-auto"
                >
                  {savingNotifications ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Preferences</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
