'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  HardDrive,
  Download,
  Upload,
  Database,
  RefreshCw,
  Loader2,
  Save,
  Check,
  Cpu
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminSettingsPage() {
  const [adminSettings, setAdminSettings] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // System Configuration Form State
  const [maxUploadSize, setMaxUploadSize] = useState<string>('50');
  const [allowedTypes, setAllowedTypes] = useState<string[]>(['pdf', 'docx', 'png', 'jpg', 'txt', 'xlsx', 'pptx', 'zip']);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);

  // Backup & Restore Modals
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isDownloadingBackup, setIsDownloadingBackup] = useState<boolean>(false);

  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState<boolean>(false);
  const [selectedRestoreFile, setSelectedRestoreFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast State
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    fetchAdminSettings();
  }, []);

  const fetchAdminSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      if (res.data) {
        setAdminSettings(res.data);
        if (res.data.settings?.max_upload_size) setMaxUploadSize(String(res.data.settings.max_upload_size));
        if (res.data.settings?.allowed_file_types) {
          setAllowedTypes(res.data.settings.allowed_file_types.split(','));
        }
      }
    } catch (err) {
      console.warn('Fallback admin settings data');
      setAdminSettings({
        settings: { max_upload_size: '50', allowed_file_types: 'pdf,docx,png,jpg,txt,xlsx,pptx,zip', jwt_expiration: '7 Days', storage_path: 'server/uploads/' },
        systemInfo: { appVersion: '1.0.0', nodeVersion: 'v18.17.0', platform: 'win32', osArchitecture: 'x64', totalMemoryMB: 16384, freeMemoryMB: 8192, uptimeSeconds: 3600, databaseEngine: 'MySQL / SQLite Hybrid Database', serverTime: new Date().toISOString() },
        storageInfo: { totalUsers: 4, totalDocuments: 12, totalStorageBytes: 18450000 }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await api.put('/admin/settings', {
        max_upload_size: maxUploadSize,
        allowed_file_types: allowedTypes.join(',')
      });
      showToast('System configuration settings saved successfully!');
    } catch (err) {
      console.error('Failed to update system configuration:', err);
      showToast('Failed to update configuration settings.', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const toggleFileType = (ext: string) => {
    if (allowedTypes.includes(ext)) {
      if (allowedTypes.length === 1) {
        showToast('At least one file extension must remain enabled.', 'error');
        return;
      }
      setAllowedTypes(prev => prev.filter(t => t !== ext));
    } else {
      setAllowedTypes(prev => [...prev, ext]);
    }
  };

  const handleDownloadBackup = async () => {
    setIsDownloadingBackup(true);
    try {
      const response = await api.get('/admin/backup', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DocVault_Database_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsBackupModalOpen(false);
      showToast('Database backup snapshot generated and downloaded!');
    } catch (err) {
      console.error('Failed to download database backup:', err);
      showToast('Failed to generate database backup snapshot.', 'error');
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  const handleRestoreDatabase = async () => {
    if (!selectedRestoreFile) {
      showToast('Please select a valid database JSON backup file.', 'error');
      return;
    }

    setIsRestoring(true);
    try {
      const fileText = await selectedRestoreFile.text();
      const backupJson = JSON.parse(fileText);

      await api.post('/admin/restore', backupJson);
      setIsRestoreModalOpen(false);
      setSelectedRestoreFile(null);
      showToast('Database restored successfully from backup file!');
      fetchAdminSettings();
    } catch (err: any) {
      console.error('Database restore error:', err);
      showToast(err.response?.data?.message || 'Invalid backup JSON file or restore failed.', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  const allAvailableExtensions = [
    { ext: 'pdf', label: 'PDF Documents' },
    { ext: 'docx', label: 'Word Documents (DOCX)' },
    { ext: 'png', label: 'PNG Images' },
    { ext: 'jpg', label: 'JPEG / JPG Images' },
    { ext: 'txt', label: 'Text Files (TXT)' },
    { ext: 'xlsx', label: 'Excel Spreadsheets (XLSX)' },
    { ext: 'pptx', label: 'PowerPoint (PPTX)' },
    { ext: 'zip', label: 'ZIP Archives' }
  ];

  return (
    <div className="max-w-4xl space-y-8 pb-12 text-slate-900 font-sans">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white text-slate-900 border border-themePrimary/30 shadow-2xl text-xs font-semibold animate-pop-in">
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 font-auth-heading">
            <Settings className="w-6 h-6 text-themePrimary" />
            <span>Admin System Settings & Backup</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure upload rules, view server hardware specs, download database backups, and restore snapshots
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Backup DB
          </button>

          <button
            onClick={() => setIsRestoreModalOpen(true)}
            className="px-4 py-2.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" /> Restore DB
          </button>

          <button
            onClick={fetchAdminSettings}
            className="p-2.5 text-slate-600 hover:text-slate-900 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
            title="Refresh settings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-2xs">
          <Loader2 className="w-8 h-8 text-themePrimary animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Fetching system information & parameters...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* System Specs Overview */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 font-auth-heading">
                <Cpu className="w-4 h-4 text-themePrimary" /> System Specs & Environment Information
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <p className="text-[10px] uppercase font-black tracking-wider text-slate-500">Node Environment</p>
                <p className="text-xs font-black text-slate-900 font-mono mt-1">{adminSettings?.systemInfo?.nodeVersion || 'v18.17.0'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <p className="text-[10px] uppercase font-black tracking-wider text-slate-500">Platform OS</p>
                <p className="text-xs font-black text-slate-900 font-mono mt-1">{adminSettings?.systemInfo?.platform || 'win32'} ({adminSettings?.systemInfo?.osArchitecture || 'x64'})</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <p className="text-[10px] uppercase font-black tracking-wider text-slate-500">Total Memory</p>
                <p className="text-xs font-black text-slate-900 font-mono mt-1">{adminSettings?.systemInfo?.totalMemoryMB || 16384} MB</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <p className="text-[10px] uppercase font-black tracking-wider text-slate-500">Database Engine</p>
                <p className="text-xs font-black text-slate-900 font-mono mt-1">{adminSettings?.systemInfo?.databaseEngine || 'SQLite / MySQL'}</p>
              </div>
            </div>
          </div>

          {/* System Parameters Form */}
          <form onSubmit={handleSaveConfig} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 font-auth-heading">
                <HardDrive className="w-4 h-4 text-themePrimary" /> Storage & File Limit Controls
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Max File Upload Limit */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Max File Upload Size (MB)
                </label>
                <select
                  value={maxUploadSize}
                  onChange={(e) => setMaxUploadSize(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-themePrimary cursor-pointer"
                >
                  <option value="10">10 MB (Standard documents)</option>
                  <option value="25">25 MB (Medium files)</option>
                  <option value="50">50 MB (Recommended default)</option>
                  <option value="100">100 MB (Large media & archives)</option>
                </select>
                <p className="text-xs text-slate-500 font-medium">Enforced during multipart form data file ingestion.</p>
              </div>

              {/* JWT Token Duration Info */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  JWT Session Expiration Policy
                </label>
                <input
                  type="text"
                  disabled
                  value="7 Days Expiration (Cryptographically Signed)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-bold cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 font-medium">Sessions automatically expire after 7 days of inactivity.</p>
              </div>
            </div>

            {/* Allowed File Extensions Checklist */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Allowed File Format Extensions
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {allAvailableExtensions.map((item) => {
                  const isChecked = allowedTypes.includes(item.ext);
                  return (
                    <button
                      key={item.ext}
                      type="button"
                      onClick={() => toggleFileType(item.ext)}
                      className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'border-themePrimary bg-orange-50/60 text-slate-900 font-extrabold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="truncate">
                        <div className="text-xs uppercase font-black font-auth-heading">{item.ext}</div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">{item.label}</div>
                      </div>
                      {isChecked && <Check className="w-4 h-4 text-themePrimary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Config Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingConfig}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer">
                {savingConfig ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save System Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Download Database Backup Modal */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-themePrimary flex items-center justify-center border border-orange-200">
              <Database className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 font-auth-heading">Download Database Backup?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                Generate and download a complete JSON snapshot containing all system tables, users, documents metadata, categories, and logs.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBackupModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDownloadBackup}
                disabled={isDownloadingBackup}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 transition cursor-pointer">
                {isDownloadingBackup ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Backup Snapshot</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Database Modal */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 font-auth-heading">Restore Database Snapshot?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                Upload a valid DocVault JSON database backup snapshot to restore categories, folders, settings, and table structures.
              </p>
            </div>

            {/* File Input */}
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={(e) => setSelectedRestoreFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 hover:bg-orange-50/40 text-center transition space-y-1 cursor-pointer"
              >
                <Upload className="w-5 h-5 text-themePrimary mx-auto" />
                <p className="text-xs font-extrabold text-slate-900">
                  {selectedRestoreFile ? selectedRestoreFile.name : 'Choose JSON Backup File'}
                </p>
                <p className="text-xs text-slate-500 font-medium">Click to browse your file system</p>
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setSelectedRestoreFile(null);
                }}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRestoreDatabase}
                disabled={isRestoring || !selectedRestoreFile}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 transition cursor-pointer">
                {isRestoring ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Restore Database</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
