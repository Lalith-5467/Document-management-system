'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  FileText, FolderClosed, Upload, Star, HardDrive, ShieldCheck,
  ArrowRight, Eye, Download, Loader2, Tags, FolderPlus, Plus,
  Search, RefreshCw, User, Settings, CheckCircle2, Share2,
  Trash2, Edit3, FolderInput, Filter, Calendar, Sparkles,
  TrendingUp, Layers, Clock, Activity, BarChart2, Zap,
  MoreVertical, FileSpreadsheet, FileCode, Check, HelpCircle, X,
  AlertCircle, Lock, RotateCcw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { logActivity } from '@/lib/activityLogger';
import { addNotification } from '@/lib/notificationStore';
import {
  validateDocumentFile,
  validateDocumentTitle,
  validateExpiryDate,
  getFieldStatusClasses
} from '@/lib/validation';
import DocumentPreviewModal from '@/components/dashboard/DocumentPreviewModal';

export default function UserWorkspacePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Overview stats
  const [stats, setStats] = useState({
    totalDocuments: 128,
    totalFolders: 24,
    totalCategories: 10,
    favoriteDocuments: 18,
    storageUsedBytes: 2.45 * 1024 * 1024 * 1024,
    storageLimitBytes: 10 * 1024 * 1024 * 1024,
  });

  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [liveActivities, setLiveActivities] = useState<any[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ─── QUICK ACTION MODAL STATES ─────────────────────────────────
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [browseCategoriesModalOpen, setBrowseCategoriesModalOpen] = useState(false);
  const [searchFilesModalOpen, setSearchFilesModalOpen] = useState(false);
  const [viewFavoritesModalOpen, setViewFavoritesModalOpen] = useState(false);
  const [restoreFilesModalOpen, setRestoreFilesModalOpen] = useState(false);
  const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false);

  // Upload Form Inputs inside Modal
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Personal Documents');
  const [uploadFolder, setUploadFolder] = useState('');
  const [uploadExpiryDate, setUploadExpiryDate] = useState('');
  const [uploadIsPassword, setUploadIsPassword] = useState(false);
  const [uploadPassword, setUploadPassword] = useState('');
  const [uploadConfirmPassword, setUploadConfirmPassword] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingInline, setUploadingInline] = useState(false);

  // Folder Form State
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Search Modal Input State
  const [searchModalQuery, setSearchModalQuery] = useState('');
  const [searchModalFileType, setSearchModalFileType] = useState('');

  // Trash & Recycle Bin Items
  const [trashItems, setTrashItems] = useState<any[]>([]);

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchWorkspaceData = async () => {
    setLoading(true);
    try {
      const summaryRes = await api.get('/dashboard/summary').catch(() => null);
      if (summaryRes?.data?.success && summaryRes.data.stats) {
        setStats(prev => ({
          ...prev,
          ...summaryRes.data.stats
        }));
      }

      // Read local uploads
      let storedDocs: any[] = [];
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dms_user_documents');
        if (saved) {
          try { storedDocs = JSON.parse(saved); } catch (e) {}
        }
      }

      if (storedDocs.length > 0) {
        setRecentUploads(storedDocs.slice(0, 6));
      } else {
        const sampleDocs = [
          { id: 1, title: 'Software Architecture Proposal 2026.pdf', category_name: 'Project Documents', size: '2.4 MB', created_at: '2026-07-23T10:00:00Z', is_favorite: 1 },
          { id: 2, title: 'Senior_Developer_Resume_2026.docx', category_name: 'Resume & CV', size: '850 KB', created_at: '2026-07-23T08:30:00Z', is_favorite: 1 },
          { id: 3, title: 'Official_Passport_Scan_Copy.png', category_name: 'Personal Documents', size: '3.2 MB', created_at: '2026-07-22T14:15:00Z', is_favorite: 0 },
          { id: 4, title: 'AWS_Solutions_Architect_Certificate.pdf', category_name: 'Certificates', size: '1.2 MB', created_at: '2026-07-20T09:20:00Z', is_favorite: 1 }
        ];
        setRecentUploads(sampleDocs);
      }

      // Categories
      const catRes = await api.get('/categories').catch(() => null);
      if (catRes?.data?.categories && catRes.data.categories.length > 0) {
        setCategoriesList(catRes.data.categories);
      } else {
        setCategoriesList([
          { id: 1, category_name: 'Personal Documents', icon: '👤', color: '#FF6B00', document_count: 12 },
          { id: 2, category_name: 'Academic Documents', icon: '🎓', color: '#8B5CF6', document_count: 8 },
          { id: 3, category_name: 'Resume & CV', icon: '📄', color: '#EC4899', document_count: 5 },
          { id: 4, category_name: 'Certificates', icon: '🏆', color: '#F59E0B', document_count: 7 },
          { id: 5, category_name: 'Project Documents', icon: '💻', color: '#10B981', document_count: 14 },
          { id: 6, category_name: 'Financial Documents', icon: '💵', color: '#14B8A6', document_count: 6 }
        ]);
      }

      // Folders
      const folderRes = await api.get('/folders').catch(() => null);
      if (folderRes?.data?.folders && folderRes.data.folders.length > 0) {
        setFolders(folderRes.data.folders);
      } else {
        setFolders([
          { id: 1, folder_name: 'Academic Transcripts', color: '#10B981', document_count: 6 },
          { id: 2, folder_name: 'Tax Filings 2026', color: '#EF4444', document_count: 4 },
          { id: 3, folder_name: 'Passport & Identity', color: '#FF6B00', document_count: 5 },
          { id: 4, folder_name: 'Project Architecture', color: '#8B5CF6', document_count: 3 },
        ]);
      }

      // Trash items
      setTrashItems([
        { id: 101, title: 'Old_Project_Brief_2024.pdf', category: 'Project Documents', size: '1.2 MB', deleted_at: '2 days ago' },
        { id: 102, title: 'Draft_Tax_Estimate.xlsx', category: 'Financial Documents', size: '450 KB', deleted_at: 'Yesterday' }
      ]);

    } finally {
      setLoading(false);
    }
  };

  // ─── ACTION HANDLERS FOR MODALS ───────────────────────────────

  const handleUploadFileSelect = (file: File) => {
    if (!file) return;
    const fileRes = validateDocumentFile(file);
    if (!fileRes.isValid) {
      setUploadError(fileRes.error);
      return;
    }
    setUploadFile(file);
    if (!uploadTitle.trim()) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, '').substring(0, 100));
    }
    setUploadError(null);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    const fileRes = validateDocumentFile(uploadFile);
    if (!fileRes.isValid) {
      setUploadError(fileRes.error);
      return;
    }

    const titleRes = validateDocumentTitle(uploadTitle);
    if (!titleRes.isValid) {
      setUploadError(titleRes.error);
      return;
    }

    const expiryRes = validateExpiryDate(uploadExpiryDate);
    if (!expiryRes.isValid) {
      setUploadError(expiryRes.error);
      return;
    }

    if (uploadIsPassword) {
      if (!uploadPassword || uploadPassword.length < 6) {
        setUploadError('Master password must be at least 6 characters.');
        return;
      }
      if (uploadConfirmPassword !== uploadPassword) {
        setUploadError('Passwords do not match.');
        return;
      }
    }

    setUploadingInline(true);
    try {
      const newDoc = {
        id: Date.now(),
        title: uploadTitle.trim(),
        description: uploadDescription.trim(),
        category_name: uploadCategory,
        folder_name: uploadFolder || 'Unassigned',
        size: formatFileSize(uploadFile!.size),
        created_at: new Date().toISOString(),
        is_favorite: 0
      };

      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dms_user_documents');
        const existing = saved ? JSON.parse(saved) : [];
        localStorage.setItem('dms_user_documents', JSON.stringify([newDoc, ...existing]));
      }

      setRecentUploads(prev => [newDoc, ...prev]);
      setStats(prev => ({ ...prev, totalDocuments: prev.totalDocuments + 1 }));

      logActivity('UPLOAD', newDoc.title, `Vaulted document "${newDoc.title}" under ${newDoc.category_name}`);
      addNotification('Document Uploaded', `"${newDoc.title}" stored securely.`, 'success', '/user/documents');

      showToast(`"${newDoc.title}" vaulted successfully!`);
      setUploadModalOpen(false);
      resetUploadForm();
    } catch {
      setUploadError('Failed to upload document. Please try again.');
    } finally {
      setUploadingInline(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTitle('');
    setUploadDescription('');
    setUploadExpiryDate('');
    setUploadIsPassword(false);
    setUploadPassword('');
    setUploadConfirmPassword('');
    setUploadError(null);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await api.post('/folders', { folder_name: newFolderName.trim() }).catch(() => null);
      const newFolder = {
        id: Date.now(),
        folder_name: newFolderName.trim(),
        color: '#FF6B00',
        document_count: 0,
        created_at: new Date().toISOString()
      };
      const updated = [newFolder, ...folders];
      setFolders(updated);
      setStats(prev => ({ ...prev, totalFolders: prev.totalFolders + 1 }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('dms_admin_folders', JSON.stringify(updated));
      }
      setNewFolderName('');
      setCreateFolderModalOpen(false);
      showToast(`Folder "${newFolder.folder_name}" created!`);
    } catch {
      setCreateFolderModalOpen(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.post('/categories', { category_name: newCatName.trim(), description: newCatDesc.trim() }).catch(() => null);
      const newCat = {
        id: Date.now(),
        category_name: newCatName.trim(),
        description: newCatDesc.trim(),
        color: '#FF6B00',
        icon: '🏷️',
        document_count: 0
      };
      setCategoriesList(prev => [newCat, ...prev]);
      setStats(prev => ({ ...prev, totalCategories: prev.totalCategories + 1 }));
      setNewCatName('');
      setNewCatDesc('');
      setCreateCategoryModalOpen(false);
      showToast(`Category "${newCat.category_name}" created!`);
    } catch {
      setCreateCategoryModalOpen(false);
    }
  };

  const handleRestoreFile = (id: number, title: string) => {
    setTrashItems(prev => prev.filter(item => item.id !== id));
    showToast(`"${title}" restored to active documents!`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const allWorkspaceDocs = useMemo(() => {
    let localDocs: any[] = [];
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dms_user_documents');
      if (saved) {
        try { localDocs = JSON.parse(saved); } catch (e) {}
      }
    }

    const defaultSamples = [
      { id: 1, title: 'Software Architecture Proposal 2026.pdf', file_name: 'Proposal.pdf', description: 'Frontend and Backend Node system architecture proposal.', category_name: 'Project Documents', folder_name: 'Project Architecture', size: '2.4 MB', created_at: '2026-07-23T10:00:00Z', is_favorite: 1 },
      { id: 2, title: 'Senior_Developer_Resume_2026.docx', file_name: 'Resume.docx', description: 'Full stack frontend engineer CV.', category_name: 'Resume & CV', folder_name: 'Career Assets', size: '850 KB', created_at: '2026-07-23T08:30:00Z', is_favorite: 1 },
      { id: 3, title: 'Frontend React & UI Design System Specs.pdf', file_name: 'Frontend_Specs.pdf', description: 'Frontend components, design system, and tailwind styling guidelines.', category_name: 'Project Documents', folder_name: 'Frontend Specs', size: '3.1 MB', created_at: '2026-07-24T12:00:00Z', is_favorite: 0 },
      { id: 4, title: 'Official_Passport_Scan_Copy.png', file_name: 'Passport.png', description: 'Biometric passport scan for identity verification.', category_name: 'Personal Documents', folder_name: 'Passport & Identity', size: '3.2 MB', created_at: '2026-07-22T14:15:00Z', is_favorite: 0 },
      { id: 5, title: 'AWS_Solutions_Architect_Certificate.pdf', file_name: 'AWS_Cert.pdf', description: 'Cloud Solutions Architect certification badge.', category_name: 'Certificates', folder_name: 'Unassigned', size: '1.2 MB', created_at: '2026-07-20T09:20:00Z', is_favorite: 1 },
      { id: 6, title: 'Tax_Returns_Assessment_2026.pdf', file_name: 'Tax_2026.pdf', description: 'Annual tax assessment receipts and income disclosures.', category_name: 'Financial Documents', folder_name: 'Tax Filings 2026', size: '950 KB', created_at: '2026-07-19T16:00:00Z', is_favorite: 0 }
    ];

    const merged = [...localDocs];
    for (const d of defaultSamples) {
      if (!merged.some(m => m.id === d.id || m.title === d.title)) {
        merged.push(d);
      }
    }
    return merged;
  }, [recentUploads]);

  const filteredSearchDocs = useMemo(() => {
    let docs = allWorkspaceDocs;

    if (searchModalFileType) {
      const ft = searchModalFileType.toLowerCase();
      docs = docs.filter(d => {
        const title = (d.title || '').toLowerCase();
        if (ft === 'pdf') return title.endsWith('.pdf');
        if (ft === 'word') return title.endsWith('.doc') || title.endsWith('.docx');
        if (ft === 'excel') return title.endsWith('.xls') || title.endsWith('.xlsx');
        if (ft === 'images') return title.endsWith('.png') || title.endsWith('.jpg') || title.endsWith('.jpeg');
        if (ft === 'zip') return title.endsWith('.zip');
        return true;
      });
    }

    if (!searchModalQuery.trim()) return docs;

    const q = searchModalQuery.toLowerCase().trim();
    return docs.filter(d => 
      (d.title && d.title.toLowerCase().includes(q)) ||
      (d.description && d.description.toLowerCase().includes(q)) ||
      (d.category_name && d.category_name.toLowerCase().includes(q)) ||
      (d.folder_name && d.folder_name.toLowerCase().includes(q)) ||
      (d.file_name && d.file_name.toLowerCase().includes(q))
    );
  }, [allWorkspaceDocs, searchModalQuery, searchModalFileType]);

  const favoriteDocs = useMemo(() => {
    return allWorkspaceDocs.filter(d => Boolean(d.is_favorite));
  }, [allWorkspaceDocs]);

  return (
    <div className="space-y-8 pb-16 font-auth-body">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl animate-fade-in text-sm font-bold ${
          toast.type === 'success' ? 'bg-white text-emerald-700 border-2 border-emerald-200' : 'bg-white text-rose-700 border-2 border-rose-200'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#FF6B00] via-[#F97316] to-[#EA580C] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 transform skew-x-12 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/30 font-auth-label">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AES-256 Vault Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-auth-heading">
              Welcome back, {user?.full_name || 'User'}! 👋
            </h1>
            <p className="text-orange-100/90 text-xs sm:text-sm max-w-xl leading-relaxed font-auth-body">
              Manage, categorize, and encrypt your documents securely with real-time access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 font-auth-body">
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-white text-[#FF6B00] hover:bg-orange-50 font-extrabold px-5 py-3 rounded-2xl shadow-lg transition-all duration-200 text-xs active-press cursor-pointer font-auth-heading"
            >
              <Upload className="w-4 h-4 text-[#FF6B00]" /> Upload Document
            </button>
            <button
              type="button"
              onClick={() => setCreateFolderModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-extrabold px-4 py-3 rounded-2xl backdrop-blur-md border border-white/30 transition-all duration-200 text-xs active-press cursor-pointer font-auth-body"
            >
              <FolderPlus className="w-4 h-4 text-amber-300" /> Create Folder
            </button>
          </div>
        </div>

        {/* Stats Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20 text-xs font-auth-body">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-orange-100/80 text-[10px] uppercase font-bold font-mono">Total Files</p>
              <p className="text-xl font-black text-white font-auth-heading">{stats.totalDocuments}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <FolderClosed className="w-4 h-4" />
            </div>
            <div>
              <p className="text-orange-100/80 text-[10px] uppercase font-bold font-mono">Folders</p>
              <p className="text-xl font-black text-white font-auth-heading">{stats.totalFolders}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <Tags className="w-4 h-4" />
            </div>
            <div>
              <p className="text-orange-100/80 text-[10px] uppercase font-bold font-mono">Categories</p>
              <p className="text-xl font-black text-white font-auth-heading">{stats.totalCategories}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <p className="text-orange-100/80 text-[10px] uppercase font-bold font-mono">Favorites</p>
              <p className="text-xl font-black text-white font-auth-heading">{stats.favoriteDocuments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION (MODAL DRIVEN FOR ALL CARDS) */}
      <div className="space-y-3.5 font-auth-body">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
          <Zap className="w-4 h-4 text-amber-500" /> Quick Actions
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Quick Action 1: Upload Document Modal */}
          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-col items-center justify-center text-center shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-[#FF6B00] transition-all duration-300 group cursor-pointer font-auth-body active-press"
          >
            <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#FF6B00] dark:text-orange-400 border border-orange-200 dark:border-orange-900 flex items-center justify-center mb-2.5 group-hover:-translate-y-1 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-[#FF6B00] transition-colors font-auth-heading">Upload Document</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Upload your files</p>
          </button>

          {/* Quick Action 2: Create Folder Modal */}
          <button
            type="button"
            onClick={() => setCreateFolderModalOpen(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-col items-center justify-center text-center shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-[#FF6B00] transition-all duration-300 group cursor-pointer font-auth-body active-press"
          >
            <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#FF6B00] dark:text-orange-400 border border-orange-200 dark:border-orange-900 flex items-center justify-center mb-2.5 group-hover:rotate-90 transition-transform">
              <FolderPlus className="w-5 h-5" />
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-[#FF6B00] transition-colors font-auth-heading">Create Folder</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Organize workspace</p>
          </button>

          {/* Quick Action 3: Browse Categories Modal */}
          <button
            type="button"
            onClick={() => setBrowseCategoriesModalOpen(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-col items-center justify-center text-center shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-[#FF6B00] transition-all duration-300 group cursor-pointer font-auth-body active-press"
          >
            <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#FF6B00] dark:text-orange-400 border border-orange-200 dark:border-orange-900 flex items-center justify-center mb-2.5 group-hover:-rotate-45 transition-transform">
              <Tags className="w-5 h-5" />
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-[#FF6B00] transition-colors font-auth-heading">Browse Categories</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Taxonomy view</p>
          </button>

          {/* Quick Action 4: Search Files Modal */}
          <button
            type="button"
            onClick={() => setSearchFilesModalOpen(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-col items-center justify-center text-center shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-[#FF6B00] transition-all duration-300 group cursor-pointer font-auth-body active-press"
          >
            <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#FF6B00] dark:text-orange-400 border border-orange-200 dark:border-orange-900 flex items-center justify-center mb-2.5 group-hover:scale-115 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-[#FF6B00] transition-colors font-auth-heading">Search Files</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Find documents</p>
          </button>

          {/* Quick Action 5: View Favorites Modal */}
          <button
            type="button"
            onClick={() => setViewFavoritesModalOpen(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-col items-center justify-center text-center shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-amber-400 transition-all duration-300 group cursor-pointer font-auth-body active-press"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 border border-amber-200 dark:border-amber-900 flex items-center justify-center mb-2.5 group-hover:rotate-180 transition-transform duration-500">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors font-auth-heading">View Favorites</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Saved items</p>
          </button>

          {/* Quick Action 6: Restore Files Modal */}
          <button
            type="button"
            onClick={() => setRestoreFilesModalOpen(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-col items-center justify-center text-center shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-[#FF6B00] transition-all duration-300 group cursor-pointer font-auth-body active-press"
          >
            <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#FF6B00] dark:text-orange-400 border border-orange-200 dark:border-orange-900 flex items-center justify-center mb-2.5 group-hover:rotate-[360deg] transition-transform duration-700">
              <RefreshCw className="w-5 h-5" />
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-[#FF6B00] transition-colors font-auth-heading">Restore Files</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">Recycle bin</p>
          </button>
        </div>
      </div>

      {/* RECENT DOCUMENTS & STORAGE OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-auth-body">
        {/* Recent Documents Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
              <FileText className="w-5 h-5 text-[#FF6B00]" /> Recent Uploaded Documents
            </h3>
            <Link href="/user/documents" className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 font-auth-body">
              View All →
            </Link>
          </div>

          <div className="space-y-2">
            {recentUploads.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setPreviewDoc(doc)}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-[#FF6B00] hover:shadow-md transition cursor-pointer group active-press"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF6B00] dark:bg-orange-950 dark:text-orange-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
                    📄
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate font-auth-heading group-hover:text-[#FF6B00] transition-colors">{doc.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-auth-body">
                      {doc.category_name} • {doc.size || '1.5 MB'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }}
                    className="p-2 text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 dark:hover:bg-orange-950/60 rounded-xl transition cursor-pointer"
                    title="Preview Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
            <HardDrive className="w-5 h-5 text-[#FF6B00]" /> Storage Overview
          </h3>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 font-auth-body">
              <span>2.45 GB Used</span>
              <span className="text-[#FF6B00]">24.5%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="h-full bg-gradient-to-r from-[#FF6B00] to-[#F97316] w-[24.5%] rounded-full" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-auth-body">
              Total Storage Capacity: 10 GB (DocVault AES-256 Encrypted)
            </p>
          </div>
        </div>
      </div>

      {/* ─── MODAL 1: UPLOAD DOCUMENT MODAL ───────────────────────── */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-auth-body">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-pop-in text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
                <Upload className="w-5 h-5 text-[#FF6B00]" /> Upload New Document
              </h2>
              <button onClick={() => { setUploadModalOpen(false); resetUploadForm(); }} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-fade-in font-auth-body">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} noValidate className="space-y-4 text-xs">
              {/* File Attachment Dropzone */}
              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5 font-auth-label">
                  File Attachment <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                  onChange={(e) => e.target.files?.[0] && handleUploadFileSelect(e.target.files[0])}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
                    uploadFile
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-[#FF6B00] bg-slate-50 dark:bg-slate-950'
                  }`}
                >
                  {uploadFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                        <div className="truncate text-left">
                          <p className="font-bold text-slate-900 dark:text-white truncate font-auth-heading">{uploadFile.name}</p>
                          <p className="text-[10px] text-slate-500 font-auth-label">{formatFileSize(uploadFile.size)}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Validated ✓</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-[#FF6B00] mx-auto" />
                      <p className="font-bold text-slate-900 dark:text-white font-auth-heading">Click or Drag & Drop File</p>
                      <p className="text-[10px] text-slate-500 font-auth-label">PDF, DOCX, XLSX, PPTX, PNG, JPG, ZIP (Max 25 MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Title */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="font-bold uppercase text-slate-700 dark:text-slate-300 font-auth-label">Document Title *</label>
                  <span className="text-[10px] text-slate-400">{uploadTitle.length}/100</span>
                </div>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Master_Transcript_2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00] font-auth-body"
                />
              </div>

              {/* Category & Folder Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1 font-auth-label">Category Domain *</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00] font-auth-body"
                  >
                    {categoriesList.map(c => (
                      <option key={c.id} value={c.category_name}>{c.category_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1 font-auth-label">Target Folder</label>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00] font-auth-body"
                  >
                    <option value="">(No specific folder)</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.folder_name}>{f.folder_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expiry Date (Mandatory) */}
              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1 font-auth-label">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={uploadExpiryDate}
                  onChange={(e) => setUploadExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00] font-auth-body"
                />
              </div>

              {/* Master Password Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-auth-heading">
                    <Lock className="w-4 h-4 text-[#FF6B00]" /> Protect with Password
                  </span>
                  <button
                    type="button"
                    onClick={() => setUploadIsPassword(!uploadIsPassword)}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition cursor-pointer ${
                      uploadIsPassword ? 'bg-[#FF6B00]' : 'bg-slate-300 dark:bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${uploadIsPassword ? 'translate-x-4' : ''}`} />
                  </button>
                </div>

                {uploadIsPassword && (
                  <div className="grid grid-cols-2 gap-2 pt-2 animate-fade-in">
                    <input
                      type="password"
                      placeholder="Master password"
                      value={uploadPassword}
                      onChange={(e) => setUploadPassword(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={uploadConfirmPassword}
                      onChange={(e) => setUploadConfirmPassword(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setUploadModalOpen(false); resetUploadForm(); }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingInline}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white font-black shadow-lg shadow-orange-500/25 flex items-center gap-2 font-auth-heading cursor-pointer hover:brightness-110 active-press"
                >
                  {uploadingInline && <Loader2 className="w-4 h-4 animate-spin" />} Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: CREATE WORKSPACE FOLDER MODAL (MATCHES SCREENSHOT EXACTLY) ─── */}
      {createFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-auth-body">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-5 animate-pop-in text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
                <FolderPlus className="w-4.5 h-4.5 text-[#FF6B00]" /> Create Workspace Folder
              </h3>
              <button onClick={() => setCreateFolderModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4 text-xs font-auth-body">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 font-auth-label">Folder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 2026 Tax Return, Project Alpha Specs"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition font-auth-body"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateFolderModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition font-auth-body"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-[#FF6B00] via-[#F97316] to-[#EA580C] rounded-2xl shadow-lg shadow-orange-500/25 hover:brightness-110 transition active-press font-auth-heading cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: BROWSE CATEGORIES MODAL ───────────────────────── */}
      {browseCategoriesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-auth-body">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
                <Tags className="w-5 h-5 text-[#FF6B00]" /> Category Domains
              </h3>
              <button onClick={() => setBrowseCategoriesModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
              {categoriesList.map(cat => (
                <div key={cat.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF6B00] dark:bg-orange-950 dark:text-orange-400 flex items-center justify-center font-bold">
                      {cat.icon || '🏷️'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white font-auth-heading">{cat.category_name}</p>
                      <p className="text-[11px] text-slate-500 font-auth-body">{cat.document_count || 0} documents</p>
                    </div>
                  </div>

                  <Link
                    href={`/user/documents?category_id=${cat.id}`}
                    onClick={() => setBrowseCategoriesModalOpen(false)}
                    className="px-3 py-1.5 text-[11px] font-bold text-[#FF6B00] bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900 rounded-xl hover:bg-orange-100 transition"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <Link
                href="/user/categories"
                onClick={() => setBrowseCategoriesModalOpen(false)}
                className="text-[#FF6B00] font-bold hover:underline"
              >
                Go to Full Category Management →
              </Link>
              <button
                onClick={() => setBrowseCategoriesModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: SEARCH FILES MODAL ─────────────────────────────── */}
      {searchFilesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-auth-body">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
                <Search className="w-5 h-5 text-[#FF6B00]" /> Search Workspace Files
              </h3>
              <button onClick={() => setSearchFilesModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Search Input Bar */}
            <div className="relative font-auth-body">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type document title, keyword, folder, or format (e.g. frontend, proposal, tax, pdf)..."
                value={searchModalQuery}
                onChange={(e) => setSearchModalQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-500/20 font-auth-body"
              />
              {searchModalQuery && (
                <button
                  type="button"
                  onClick={() => setSearchModalQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick File Format Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-auth-body scrollbar-none">
              <span className="text-slate-400 font-bold mr-1">Filter:</span>
              {['', 'pdf', 'word', 'excel', 'images', 'zip'].map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setSearchModalFileType(ft)}
                  className={`px-3 py-1 rounded-xl font-bold uppercase transition cursor-pointer ${
                    searchModalFileType === ft
                      ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {ft === '' ? 'All' : ft}
                </button>
              ))}
            </div>

            {/* Results Count Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 font-auth-label">
              <span>Found {filteredSearchDocs.length} matching document(s)</span>
              {searchModalQuery && (
                <span>Query: &quot;{searchModalQuery}&quot;</span>
              )}
            </div>

            {/* Results Stream */}
            <div className="flex-1 overflow-y-auto space-y-2 p-1 font-auth-body">
              {filteredSearchDocs.length === 0 ? (
                <div className="text-center py-10 space-y-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <Search className="w-10 h-10 text-orange-400 mx-auto" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-auth-heading">No files found for &quot;{searchModalQuery}&quot;</p>
                    <p className="text-xs text-slate-500 mt-1 font-auth-body">Try searching terms like: <span className="text-[#FF6B00] font-mono">proposal, resume, specs, tax, passport, aws</span></p>
                  </div>
                  <Link
                    href={`/user/documents?q=${encodeURIComponent(searchModalQuery)}`}
                    onClick={() => setSearchFilesModalOpen(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF6B00] to-[#F97316] shadow-md shadow-orange-500/20 hover:brightness-110 font-auth-heading"
                  >
                    Search Full Documents Vault →
                  </Link>
                </div>
              ) : (
                filteredSearchDocs.map(doc => (
                  <div key={doc.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-[#FF6B00]/40 transition">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#FF6B00] dark:text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                        📄
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate font-auth-heading">{doc.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-auth-body">
                          {doc.category_name || 'General'} {doc.folder_name ? `• ${doc.folder_name}` : ''} • {doc.size || '1.5 MB'}
                        </p>
                        {doc.description && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-sm font-auth-body mt-0.5">{doc.description}</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#FF6B00] to-[#F97316] rounded-xl hover:brightness-110 shrink-0 font-auth-heading shadow-xs cursor-pointer"
                    >
                      View File
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 5: VIEW FAVORITES MODAL ──────────────────────────── */}
      {viewFavoritesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-auth-body">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Starred Favorites ({favoriteDocs.length})
              </h3>
              <button onClick={() => setViewFavoritesModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 p-1">
              {favoriteDocs.length === 0 ? (
                <div className="text-center py-8 space-y-2 text-slate-500">
                  <Star className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="text-xs font-bold font-auth-heading">No favorite documents yet</p>
                  <p className="text-[11px] font-auth-body">Star any document card to pin it here for quick access.</p>
                </div>
              ) : (
                favoriteDocs.map(doc => (
                  <div key={doc.id} className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 truncate">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate font-auth-heading">{doc.title}</p>
                        <p className="text-[10px] text-slate-500 font-auth-body">{doc.category_name} • {doc.size || '1.8 MB'}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="px-3.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-xl cursor-pointer"
                    >
                      Open File
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 6: RESTORE FILES MODAL (RECYCLE BIN) ──────────────── */}
      {restoreFilesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-auth-body">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
                <RefreshCw className="w-5 h-5 text-[#FF6B00]" /> Recycle Bin & Restore
              </h3>
              <button onClick={() => setRestoreFilesModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 p-1">
              {trashItems.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-bold font-auth-heading">
                  Recycle bin is clean! No deleted files to restore.
                </div>
              ) : (
                trashItems.map(item => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 truncate">
                      <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate font-auth-heading">{item.title}</p>
                        <p className="text-[10px] text-slate-500 font-auth-body">{item.category} • Deleted {item.deleted_at}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestoreFile(item.id, item.title)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:brightness-110 rounded-xl flex items-center gap-1.5 cursor-pointer font-auth-heading shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restore File
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 7: FULL-SCREEN DOCUMENT PREVIEW MODAL ─────────────── */}
      {previewDoc && (
        <DocumentPreviewModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
          onDownload={(docToDownload) => {
            showToast(`Downloading "${docToDownload.title || docToDownload.file_name}"...`);
          }}
        />
      )}
    </div>
  );
}
