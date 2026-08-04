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
  Loader2, 
  Save, 
  Lock, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  Camera,
  Monitor,
  BellRing
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useTheme, CustomTheme } from '@/context/ThemeContext';
import { useLanguage, SupportedLanguage } from '@/context/LanguageContext';

export default function UserSettingsPage() {
  const { user, login } = useAuth();
  const { theme, setTheme, customTheme, setCustomTheme, saveUserTheme, resetToDefault } = useTheme();
  const { language: globalLang, setLanguage: setGlobalLang, t, languageOptions, refreshLanguageOptions } = useLanguage();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'storage' | 'notifications'>('profile');
  const [loading, setLoading] = useState<boolean>(true);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [savingPassword, setSavingPassword] = useState<boolean>(false);
  const [savingPreferences, setSavingPreferences] = useState<boolean>(false);
  const [savingNotifications, setSavingNotifications] = useState<boolean>(false);

  // Form states
  const [profileData, setProfileData] = useState<Record<string, string>>({});
  const [profileSchema, setProfileSchema] = useState<any[]>([]);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
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

  // Feedback Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        full_name: user.full_name || '',
        email: user.email || ''
      }));
    }
    
    const storedSchema = localStorage.getItem('dms_admin_profile_fields');
    if (storedSchema) {
      try {
        const parsed = JSON.parse(storedSchema).filter((f: any) => f.is_active);
        setProfileSchema(parsed.sort((a: any, b: any) => a.order - b.order));
      } catch (e) {}
    } else {
      setProfileSchema([
        { id: 1, name: 'full_name', label: 'Full Name', type: 'text', required: true, is_active: true, order: 1 },
        { id: 2, name: 'email', label: 'Email Address', type: 'email', required: true, is_active: true, order: 2 },
      ]);
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
          ...prev,
          full_name: u.full_name || user?.full_name || prev.full_name || '',
          email: u.email || user?.email || prev.email || ''
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = { full_name: profileData.full_name || '', email: profileData.email || '' };
      const res = await api.put('/settings/user/profile', payload);
      
      localStorage.setItem('dms_user_custom_profile', JSON.stringify(profileData));

      showToast('Profile information updated successfully!');
      if (user) {
        const updatedUser = { ...user, full_name: payload.full_name, email: payload.email };
        localStorage.setItem('dms_user', JSON.stringify(updatedUser));
        if (res.data?.token) {
          localStorage.setItem('dms_token', res.data.token);
        }
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/settings/user/password', { current_password: currentPassword, new_password: newPassword });
      showToast('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
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
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed bottom-5 right-5 z-50 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
          toastMsg.type === 'success' ? 'bg-slate-900' : 'bg-rose-600'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-300" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link href="/user" className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> {t('nav.myWorkspace', 'My Workspace')}
          </Link>
          <span className="text-slate-400 dark:text-slate-600 text-sm">/</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{t('settings.title', 'Settings & Preferences')}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          ⚙ {t('settings.title', 'Settings & Preferences')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.subtitle', 'Manage account credentials, security preferences, theme, and storage allocations')}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-sm font-bold rounded-2xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" /> {t('settings.editProfile', 'Edit Profile')}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 text-sm font-bold rounded-2xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" /> {t('settings.securityPassword', 'Security & Password')}
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2.5 text-sm font-bold rounded-2xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> {t('settings.themeLanguage', 'Theme & Language')}
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 text-sm font-bold rounded-2xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BellRing className="w-4 h-4" /> Notifications
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`px-4 py-2.5 text-sm font-bold rounded-2xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'storage'
              ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" /> {t('settings.storageUsage', 'Storage Usage')}
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xl">
          <Loader2 className="w-8 h-8 text-themePrimary dark:text-orange-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('common.loading', 'Loading settings & preferences...')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
          {/* TAB 1: EDIT PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{t('settings.accountProfile', 'Account Profile')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.profileSub', 'Update your name, email address, and profile avatar.')}</p>
              </div>

              {/* Avatar Selector */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-themePrimary to-[#F97316] text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
                  {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{profileData.full_name || 'User Profile'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{profileData.email}</p>
                  <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950 text-themePrimary dark:text-orange-400 border border-orange-200 dark:border-orange-900/60 font-mono">
                    {user?.user_type || 'Authenticated Member'}
                  </span>
                </div>
              </div>

              {/* Dynamic Fields */}
              {profileSchema.map(field => (
                <div key={field.name} className="space-y-1.5">
                  <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {field.label} {field.required && '*'}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      value={profileData[field.name] || ''}
                      onChange={(e) => setProfileData({ ...profileData, [field.name]: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-themePrimary transition-all min-h-[100px]"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={profileData[field.name] || ''}
                      onChange={(e) => setProfileData({ ...profileData, [field.name]: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary transition-all"
                    >
                      <option value="">Select an option</option>
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option>
                    </select>
                  ) : (
                    <input
                      type={field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                      required={field.required}
                      value={profileData[field.name] || ''}
                      onChange={(e) => setProfileData({ ...profileData, [field.name]: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-themePrimary transition-all"
                    />
                  )}
                </div>
              ))}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('common.save', 'Saving Changes...')}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{t('common.save', 'Save Profile Details')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{t('settings.changePassword', 'Change Password')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.passwordSub', 'Ensure your document vault remains secure with a strong password.')}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('settings.currentPassword', 'Current Password')} *
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-themePrimary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('settings.newPassword', 'New Password')} *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-themePrimary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('settings.confirmPassword', 'Confirm New Password')} *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-themePrimary transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25"
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
                        ? 'border-themePrimary bg-orange-50 dark:bg-orange-950/60 text-themePrimary font-bold ring-2 ring-orange-500/20 shadow-md'
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
                        ? 'border-themePrimary bg-orange-50 dark:bg-orange-950/60 text-themePrimary font-bold ring-2 ring-orange-500/20 shadow-md'
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
                        ? 'border-themePrimary bg-orange-50 dark:bg-orange-950/60 text-themePrimary font-bold ring-2 ring-orange-500/20 shadow-md'
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
                      className="w-4 h-4 text-themePrimary focus:ring-themePrimary border-slate-300"
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
                        className="w-4 h-4 text-themePrimary focus:ring-themePrimary border-slate-300"
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
                  className="w-full sm:w-64 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-themePrimary transition-all shadow-sm"
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
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 w-full sm:w-auto"
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
                  <span className="text-sm font-mono text-themePrimary dark:text-orange-400 font-bold">
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
                <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3 text-amber-800 dark:text-amber-200">
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
                    className="mt-1 w-4 h-4 text-themePrimary focus:ring-themePrimary rounded border-slate-300 dark:border-slate-600"
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
                    className="mt-1 w-4 h-4 text-themePrimary focus:ring-themePrimary rounded border-slate-300 dark:border-slate-600"
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
                    className="mt-1 w-4 h-4 text-themePrimary focus:ring-themePrimary rounded border-slate-300 dark:border-slate-600"
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
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 w-full sm:w-auto"
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
