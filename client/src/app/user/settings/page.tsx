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
  Check, 
  Sparkles,
  Camera
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage, SupportedLanguage, LANGUAGE_OPTIONS } from '@/context/LanguageContext';

export default function UserSettingsPage() {
  const { user, login } = useAuth();
  const { theme: globalTheme, setTheme: setGlobalTheme } = useTheme();
  const { language: globalLang, setLanguage: setGlobalLang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'storage'>('profile');
  const [loading, setLoading] = useState<boolean>(true);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [savingPassword, setSavingPassword] = useState<boolean>(false);
  const [savingPreferences, setSavingPreferences] = useState<boolean>(false);

  // Form states
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  // Storage Stats
  const [storageStats, setStorageStats] = useState<any>({
    totalBytes: 0,
    usedBytes: 0,
    freeBytes: 10 * 1024 * 1024 * 1024,
    documentsCount: 0,
    foldersCount: 0
  });

  // Feedback Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
    }
    setTheme(globalTheme);
    setLanguage(globalLang as SupportedLanguage);
  }, [user, globalTheme, globalLang]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings/user');
      if (res.data && res.data.user) {
        const u = res.data.user;
        setFullName(u.full_name || user?.full_name || '');
        setEmail(u.email || user?.email || '');
        if (u.theme) {
          setTheme(u.theme);
          setGlobalTheme(u.theme);
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/settings/user/profile', { full_name: fullName, email });
      showToast('Profile information updated successfully!');
      if (user) {
        const updatedUser = { ...user, full_name: fullName, email };
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

  const handleSavePreferences = async (newTheme: 'light' | 'dark', newLang: SupportedLanguage) => {
    setTheme(newTheme);
    setGlobalTheme(newTheme);
    setLanguage(newLang);
    setGlobalLang(newLang);
    setSavingPreferences(true);

    try {
      await api.put('/settings/user/preferences', { theme: newTheme, language: newLang });
      showToast('Theme & language preferences updated!');
    } catch (err) {
      console.error('Failed to save preferences:', err);
      showToast('Preferences updated locally.');
    } finally {
      setSavingPreferences(false);
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
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
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
              ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" /> {t('settings.editProfile', 'Edit Profile')}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 text-sm font-bold rounded-2xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" /> {t('settings.securityPassword', 'Security & Password')}
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2.5 text-sm font-bold rounded-2xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> {t('settings.themeLanguage', 'Theme & Language')}
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`px-4 py-2.5 text-sm font-bold rounded-2xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'storage'
              ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-md shadow-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" /> {t('settings.storageUsage', 'Storage Usage')}
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xl">
          <Loader2 className="w-8 h-8 text-[#FF6B00] dark:text-orange-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('common.loading', 'Loading settings & preferences...')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
          {/* TAB 1: EDIT PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{t('settings.accountProfile', 'Account Profile')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.profileSub', 'Update your name, email address, and profile avatar.')}</p>
              </div>

              {/* Avatar Selector */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#F97316] text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{fullName || 'User Profile'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{email}</p>
                  <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950 text-[#FF6B00] dark:text-orange-400 border border-orange-200 dark:border-orange-900/60 font-mono">
                    {user?.user_type || 'Authenticated Member'}
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('settings.fullName', 'Full Name')} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kalpana Individual"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00] transition-all"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('settings.emailAddress', 'Email Address')} *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@docvault.io"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00] transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:brightness-110 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25"
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
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
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
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00] transition-all"
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
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00] transition-all"
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
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00] transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:brightness-110 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25"
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
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{t('settings.themeLanguage', 'Theme & Language')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.themeAndLanguageSub', 'Customize display mode theme and interface language preferences.')}</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('settings.displayMode', 'Display Mode Theme')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSavePreferences('light', language)}
                    className={`p-4 rounded-2xl border flex items-center gap-3 transition ${
                      globalTheme === 'light'
                        ? 'border-[#FF6B00] bg-orange-50 dark:bg-orange-950/60 text-slate-900 dark:text-white font-bold ring-2 ring-orange-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Sun className={`w-5 h-5 ${globalTheme === 'light' ? 'text-[#FF6B00]' : 'text-slate-400'}`} />
                    <div className="text-left">
                      <div className="text-sm font-bold">{t('common.lightMode', 'Light Mode')}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">{t('common.cleanInterface', 'Clean interface')}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSavePreferences('dark', language)}
                    className={`p-4 rounded-2xl border flex items-center gap-3 transition ${
                      globalTheme === 'dark'
                        ? 'border-[#FF6B00] bg-orange-50 dark:bg-orange-950/60 text-slate-900 dark:text-white font-bold ring-2 ring-orange-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Moon className={`w-5 h-5 ${globalTheme === 'dark' ? 'text-[#FF6B00] dark:text-orange-400' : 'text-slate-400'}`} />
                    <div className="text-left">
                      <div className="text-sm font-bold">{t('common.darkMode', 'Dark Mode')}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">{t('common.sleekDarkTheme', 'Sleek dark theme')}</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#FF6B00] dark:text-orange-400" /> {t('settings.preferredLanguage', 'PREFERRED LANGUAGE')}
                </label>
                <select
                  value={language}
                  onChange={(e) => handleSavePreferences(globalTheme, e.target.value as SupportedLanguage)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-[#FF6B00] transition-all shadow-inner"
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      {opt.nativeName === opt.name ? opt.name : `${opt.nativeName} (${opt.name})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: STORAGE USAGE */}
          {activeTab === 'storage' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{t('settings.storageUsage', 'Storage Quota')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.storageSub', 'Overview of total document count and disk capacity consumed.')}</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{t('settings.storageCapacity', 'Storage Capacity Used')}</span>
                  <span className="text-sm font-mono text-[#FF6B00] dark:text-orange-400 font-bold">
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
        </div>
      )}
    </div>
  );
}
