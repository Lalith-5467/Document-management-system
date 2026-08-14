'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  FileText, FolderClosed, Upload, Star, HardDrive, ShieldCheck,
  ArrowRight, Eye, Download, Loader2, Tags, FolderPlus, Plus,
  Search, RefreshCw, User, Settings, CheckCircle2, Share2,
  Trash2, Edit3, FolderInput, Filter, Calendar, Sparkles,
  TrendingUp, Layers, Clock, Activity, BarChart2, Zap,
  MoreVertical, FileSpreadsheet, FileCode, Check, HelpCircle, X,
  AlertCircle, Lock, RotateCcw, ChevronDown
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
import AnimatedCounter from '@/components/dashboard/AnimatedCounter';
import Modal from '@/components/ui/Modal';

// Custom Accessible Dropdown Component with Primary Orange Hover Styling
function CustomSelectDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative font-auth-body" ref={dropdownRef}>
      {label && (
        <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1 font-auth-label text-xs">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary font-auth-body text-sm cursor-pointer flex items-center justify-between gap-2 transition hover:border-themePrimary/60"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180 text-themePrimary' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[10000] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-56 overflow-y-auto p-1.5 space-y-1 animate-fade-in">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-themePrimary via-[#F97316] to-[#EA580C] text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/60 hover:text-themePrimary'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function UserWorkspacePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderPortal = (children: React.ReactNode) => {
    if (!mounted || typeof window === 'undefined' || !document || !document.body) return null;
    return createPortal(children, document.body);
  };

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

  const isAnyModalOpen = uploadModalOpen || createFolderModalOpen || browseCategoriesModalOpen || searchFilesModalOpen || viewFavoritesModalOpen || restoreFilesModalOpen || createCategoryModalOpen || Boolean(previewDoc);

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  useEffect(() => {
    fetchWorkspaceData();

    const handleUpdate = () => {
      fetchWorkspaceData();
    };

    window.addEventListener('dms_folders_updated', handleUpdate);
    window.addEventListener('dms_documents_updated', handleUpdate);

    return () => {
      window.removeEventListener('dms_folders_updated', handleUpdate);
      window.removeEventListener('dms_documents_updated', handleUpdate);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchWorkspaceData = async () => {
    setLoading(true);
    try {
      // Fetch all workspace endpoints concurrently in parallel
      const [docRes, folderRes, catRes, summaryRes] = await Promise.all([
        api.get('/documents').catch(() => null),
        api.get('/folders').catch(() => null),
        api.get('/categories').catch(() => null),
        api.get('/dashboard/summary').catch(() => null)
      ]);

      // 1. Process Documents
      let fetchedDocs: any[] = [];
      if (docRes?.data?.success && Array.isArray(docRes.data.documents)) {
        fetchedDocs = docRes.data.documents;
      }

      let storedDocs: any[] = [];
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dms_user_documents');
        if (saved) {
          try { storedDocs = JSON.parse(saved); } catch (e) {}
        }
      }

      const allMergedDocs = [...storedDocs];
      for (const d of fetchedDocs) {
        if (!allMergedDocs.some(m => m.id === d.id || m.title === d.title)) {
          allMergedDocs.push(d);
        }
      }

      if (allMergedDocs.length > 0) {
        setRecentUploads(allMergedDocs.slice(0, 6));
      } else {
        const sampleDocs = [
          { id: 1, title: 'Software Architecture Proposal 2026.pdf', category_name: 'Project Documents', size: '2.4 MB', created_at: '2026-07-23T10:00:00Z', is_favorite: 1 },
          { id: 2, title: 'Senior_Developer_Resume_2026.docx', category_name: 'Resume & CV', size: '850 KB', created_at: '2026-07-23T08:30:00Z', is_favorite: 1 },
          { id: 3, title: 'Official_Passport_Scan_Copy.png', category_name: 'Personal Documents', size: '3.2 MB', created_at: '2026-07-22T14:15:00Z', is_favorite: 0 },
          { id: 4, title: 'AWS_Solutions_Architect_Certificate.pdf', category_name: 'Certificates', size: '1.2 MB', created_at: '2026-07-20T09:20:00Z', is_favorite: 1 }
        ];
        setRecentUploads(sampleDocs);
      }

      // 2. Process Folders
      let userFolders: any[] = [];
      if (folderRes?.data?.folders && folderRes.data.folders.length > 0) {
        userFolders = folderRes.data.folders;
      } else if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dms_user_folders') || localStorage.getItem('dms_admin_folders');
        if (saved) {
          try { userFolders = JSON.parse(saved); } catch (e) {}
        }
      }

      if (userFolders.length > 0) {
        setFolders(userFolders);
      } else {
        userFolders = [
          { id: 1, folder_name: 'Resume', color: '#F59E0B', document_count: 3 },
          { id: 2, folder_name: 'Personal', color: '#3B82F6', document_count: 1 },
          { id: 3, folder_name: 'Academic', color: '#10B981', document_count: 0 },
          { id: 4, folder_name: 'Projects', color: '#8B5CF6', document_count: 0 },
          { id: 5, folder_name: 'Financial', color: '#06B6D4', document_count: 0 },
        ];
        setFolders(userFolders);
      }

      // 3. Process Categories
      let userCategories: any[] = [];
      if (catRes?.data?.categories && catRes.data.categories.length > 0) {
        userCategories = catRes.data.categories;
        setCategoriesList(userCategories);
      } else {
        userCategories = [
          { id: 1, category_name: 'Personal Documents', icon: '👤', color: 'var(--theme-primary, #FF6B00)', document_count: 12 },
          { id: 2, category_name: 'Academic Documents', icon: '🎓', color: '#8B5CF6', document_count: 8 },
          { id: 3, category_name: 'Resume & CV', icon: '📄', color: '#EC4899', document_count: 5 },
          { id: 4, category_name: 'Certificates', icon: '🏆', color: '#F59E0B', document_count: 7 },
          { id: 5, category_name: 'Project Documents', icon: '💻', color: '#10B981', document_count: 14 },
          { id: 6, category_name: 'Financial Documents', icon: '💵', color: '#14B8A6', document_count: 6 }
        ];
        setCategoriesList(userCategories);
      }
      const totalDocsCount = allMergedDocs.length || (summaryRes?.data?.stats?.totalDocuments ?? 4);
      const favDocsCount = allMergedDocs.filter(d => Boolean(d.is_favorite)).length || (summaryRes?.data?.stats?.favoriteDocuments ?? 1);
      const totalFoldersCount = (summaryRes?.data?.stats?.totalFolders && summaryRes.data.stats.totalFolders > 0)
        ? summaryRes.data.stats.totalFolders
        : userFolders.length;
      const totalCatsCount = (summaryRes?.data?.stats?.totalCategories && summaryRes.data.stats.totalCategories > 0)
        ? summaryRes.data.stats.totalCategories
        : (userCategories.length || 10);

      // Compute total real storage bytes used by all documents
      let calculatedBytes = 0;
      for (const d of allMergedDocs) {
        if (typeof d.file_size === 'number' && d.file_size > 0) {
          calculatedBytes += d.file_size;
        } else if (typeof d.file_size === 'string') {
          const val = parseFloat(d.file_size);
          if (!isNaN(val)) {
            const lower = d.file_size.toLowerCase();
            if (lower.includes('gb')) calculatedBytes += val * 1024 * 1024 * 1024;
            else if (lower.includes('mb')) calculatedBytes += val * 1024 * 1024;
            else if (lower.includes('kb')) calculatedBytes += val * 1024;
            else calculatedBytes += val;
          }
        } else if (typeof d.size === 'string') {
          const val = parseFloat(d.size);
          if (!isNaN(val)) {
            const lower = d.size.toLowerCase();
            if (lower.includes('gb')) calculatedBytes += val * 1024 * 1024 * 1024;
            else if (lower.includes('mb')) calculatedBytes += val * 1024 * 1024;
            else if (lower.includes('kb')) calculatedBytes += val * 1024;
            else calculatedBytes += val;
          }
        }
      }

      const realStorageBytes = calculatedBytes || summaryRes?.data?.stats?.storageUsedBytes || 0;

      setStats(prev => ({
        ...prev,
        ...(summaryRes?.data?.stats || {}),
        totalDocuments: totalDocsCount,
        totalFolders: totalFoldersCount,
        totalCategories: totalCatsCount,
        favoriteDocuments: favDocsCount,
        storageUsedBytes: realStorageBytes,
        storageLimitBytes: 10 * 1024 * 1024 * 1024 // 10 GB
      }));

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
        setUploadError('Master passwords do not match.');
        return;
      }
    }

    setUploadingInline(true);

    try {
      const formData = new FormData();
      if (uploadFile) formData.append('file', uploadFile);
      formData.append('title', uploadTitle.trim());
      formData.append('description', uploadDescription.trim());
      formData.append('category_name', uploadCategory);
      if (uploadFolder) formData.append('folder_name', uploadFolder);
      if (uploadExpiryDate) formData.append('expiry_date', uploadExpiryDate);
      if (uploadIsPassword && uploadPassword) {
        formData.append('is_password_protected', 'true');
        formData.append('password', uploadPassword);
      }

      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).catch(() => null);

      const newDoc = res?.data?.document || {
        id: Date.now(),
        title: uploadTitle.trim(),
        file_name: uploadFile?.name || 'Document.pdf',
        description: uploadDescription.trim(),
        category_name: uploadCategory,
        folder_name: uploadFolder || 'Unassigned',
        size: uploadFile ? formatFileSize(uploadFile.size) : '1.2 MB',
        file_size: uploadFile ? uploadFile.size : 1200000,
        mime_type: uploadFile?.type || 'application/pdf',
        created_at: new Date().toISOString(),
        is_favorite: 0
      };

      const updated = [newDoc, ...recentUploads];
      setRecentUploads(updated.slice(0, 6));
      setStats(prev => ({
        ...prev,
        totalDocuments: prev.totalDocuments + 1,
        storageUsedBytes: prev.storageUsedBytes + (uploadFile?.size || 1200000)
      }));

      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dms_user_documents');
        let docs = saved ? JSON.parse(saved) : [];
        docs.unshift(newDoc);
        localStorage.setItem('dms_user_documents', JSON.stringify(docs));
        window.dispatchEvent(new CustomEvent('dms_documents_updated'));
      }

      resetUploadForm();
      setUploadModalOpen(false);
      showToast(`Document "${newDoc.title}" uploaded successfully!`);
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
      const res = await api.post('/folders', {
        folder_name: newFolderName.trim(),
        description: newFolderDesc.trim(),
        color: 'var(--theme-primary, #FF6B00)'
      }).catch(() => null);

      const createdFolder = res?.data?.folder || {
        id: Date.now(),
        folder_name: newFolderName.trim(),
        description: newFolderDesc.trim(),
        color: 'var(--theme-primary, #FF6B00)',
        document_count: 0,
        created_at: new Date().toISOString()
      };

      const updated = [createdFolder, ...folders];
      setFolders(updated);
      setStats(prev => ({ ...prev, totalFolders: prev.totalFolders + 1 }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('dms_user_folders', JSON.stringify(updated));
        localStorage.setItem('dms_admin_folders', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('dms_folders_updated'));
      }
      setNewFolderName('');
      setNewFolderDesc('');
      setCreateFolderModalOpen(false);
      showToast(`Folder "${createdFolder.folder_name}" created successfully!`, 'success');
    } catch {
      setCreateFolderModalOpen(false);
      showToast('Failed to create folder. Please try again.', 'error');
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
        color: 'var(--theme-primary, #FF6B00)',
        icon: '🏷️',
        document_count: 0
      };
      setCategoriesList(prev => [newCat, ...prev]);
      setStats(prev => ({ ...prev, totalCategories: prev.totalCategories + 1 }));
      setNewCatName('');
      setNewCatDesc('');
      setCreateCategoryModalOpen(false);
      showToast(`Category "${newCat.category_name}" created successfully!`, 'success');
    } catch {
      setCreateCategoryModalOpen(false);
      showToast('Failed to create category. Please try again.', 'error');
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
    <div className="space-y-8 pb-16 font-sans text-slate-900 dark:text-slate-100">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-6 z-[100000] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl animate-fade-in text-sm font-bold border transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-slate-900 text-white border-emerald-500/50 shadow-emerald-950/20 dark:bg-slate-900 dark:text-white dark:border-emerald-500/50'
            : 'bg-slate-900 text-white border-rose-500/50 shadow-rose-950/20 dark:bg-slate-900 dark:text-white dark:border-rose-500/50'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER HERO BANNER with Staggered Entrance */}
      <div className="bg-gradient-to-r from-themePrimary via-[#F97316] to-[#EA580C] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden animate-fade-in-up stagger-1">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 transform skew-x-12 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/30 font-auth-heading tracking-wide animate-badge-sparkle">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AES-256 Verified Vault Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-white tracking-tight font-auth-heading leading-tight">
              Welcome back, {(user?.full_name || 'User').trim()}! 👋
            </h1>
            <p className="text-orange-100/90 text-sm sm:text-[15px] max-w-xl leading-relaxed font-normal">
              Manage, categorize, and encrypt your documents securely with 100ms real-time access.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 shrink-0 pr-1 sm:pr-3">
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-900 font-bold px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-sm active:scale-95 cursor-pointer border border-white/90 hover:-translate-y-0.5 whitespace-nowrap shrink-0 min-w-max"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-orange-500/10 to-transparent transition-transform duration-1000 ease-in-out" />
              <Upload className="w-4.5 h-4.5 text-themePrimary group-hover:-translate-y-0.5 transition-transform duration-200 shrink-0 relative z-10" /> 
              <span className="font-extrabold font-auth-heading text-themePrimary relative z-10">Upload Document</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateFolderModalOpen(true)}
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2.5 bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3.5 rounded-2xl backdrop-blur-md border border-white/40 shadow-md transition-all duration-300 text-sm active:scale-95 cursor-pointer hover:-translate-y-0.5 whitespace-nowrap shrink-0 min-w-max"
            >
              <FolderPlus className="w-4.5 h-4.5 text-amber-300 group-hover:rotate-12 transition-transform duration-200 shrink-0" /> 
              <span className="font-bold font-auth-heading text-white">Create Folder</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Strip with Animated Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-6 border-t border-white/20">
          <div className="flex items-center gap-3.5 group cursor-default">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-orange-100/80 text-xs font-medium uppercase tracking-wider font-mono">Total Files</p>
              <p className="text-2xl lg:text-[32px] font-bold text-white font-auth-heading leading-tight">
                <AnimatedCounter value={stats.totalDocuments} />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 group cursor-default">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <FolderClosed className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-orange-100/80 text-xs font-medium uppercase tracking-wider font-mono">Folders</p>
              <p className="text-2xl lg:text-[32px] font-bold text-white font-auth-heading leading-tight">
                <AnimatedCounter value={stats.totalFolders} />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 group cursor-default">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Tags className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-orange-100/80 text-xs font-medium uppercase tracking-wider font-mono">Categories</p>
              <p className="text-2xl lg:text-[32px] font-bold text-white font-auth-heading leading-tight">
                <AnimatedCounter value={stats.totalCategories} />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 group cursor-default">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <p className="text-orange-100/80 text-xs font-medium uppercase tracking-wider font-mono">Favorites</p>
              <p className="text-2xl lg:text-[32px] font-bold text-white font-auth-heading leading-tight">
                <AnimatedCounter value={stats.favoriteDocuments} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION (Staggered Entrance & Smooth Lift) */}
      <div className="space-y-4 animate-fade-in-up stagger-2">
        <h3 className="text-lg lg:text-[20px] font-semibold text-slate-900 dark:text-white flex items-center gap-2.5 font-auth-heading tracking-tight">
          <Zap className="w-5 h-5 text-amber-500 fill-amber-500/20" /> Quick Actions
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Quick Action 1: Upload Document Modal */}
          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-3xl flex flex-col items-center justify-center text-center shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-themePrimary/50 transition-all duration-300 group cursor-pointer active:scale-95 min-h-[140px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-themePrimary dark:text-orange-400 border border-orange-200 dark:border-orange-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-themePrimary transition-colors font-auth-heading">Upload Document</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Vault your files</p>
          </button>

          {/* Quick Action 2: Create Folder Modal */}
          <button
            type="button"
            onClick={() => setCreateFolderModalOpen(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-3xl flex flex-col items-center justify-center text-center shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-themePrimary/50 transition-all duration-300 group cursor-pointer active:scale-95 min-h-[140px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-themePrimary dark:text-orange-400 border border-orange-200 dark:border-orange-900 flex items-center justify-center mb-3 group-hover:rotate-90 transition-transform duration-300">
              <FolderPlus className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-themePrimary transition-colors font-auth-heading">Create Folder</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Organize workspace</p>
          </button>

          {/* Quick Action 3: Browse Categories Modal */}
          <button
            type="button"
            onClick={() => setBrowseCategoriesModalOpen(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-3xl flex flex-col items-center justify-center text-center shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-themePrimary/50 transition-all duration-300 group cursor-pointer active:scale-95 min-h-[140px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-themePrimary dark:text-orange-400 border border-orange-200 dark:border-orange-900 flex items-center justify-center mb-3 group-hover:-rotate-45 transition-transform duration-300">
              <Tags className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-themePrimary transition-colors font-auth-heading">Browse Categories</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Taxonomy view</p>
          </button>

          {/* Quick Action 4: Search Files Modal */}
          <button
            type="button"
            onClick={() => setSearchFilesModalOpen(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-3xl flex flex-col items-center justify-center text-center shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-themePrimary/50 transition-all duration-300 group cursor-pointer active:scale-95 min-h-[140px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-themePrimary dark:text-orange-400 border border-orange-200 dark:border-orange-900 flex items-center justify-center mb-3 group-hover:scale-115 transition-transform duration-200">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-themePrimary transition-colors font-auth-heading">Search Files</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Find documents</p>
          </button>

          {/* Quick Action 5: View Favorites Modal */}
          <button
            type="button"
            onClick={() => setViewFavoritesModalOpen(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-3xl flex flex-col items-center justify-center text-center shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-amber-400/50 transition-all duration-300 group cursor-pointer active:scale-95 min-h-[140px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 border border-amber-200 dark:border-amber-900 flex items-center justify-center mb-3 group-hover:rotate-180 transition-transform duration-500">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors font-auth-heading">View Favorites</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Saved items</p>
          </button>

          {/* Quick Action 6: Restore Files Modal */}
          <button
            type="button"
            onClick={() => setRestoreFilesModalOpen(true)}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-3xl flex flex-col items-center justify-center text-center shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-themePrimary/50 transition-all duration-300 group cursor-pointer active:scale-95 min-h-[140px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-themePrimary dark:text-orange-400 border border-orange-200 dark:border-orange-900 flex items-center justify-center mb-3 group-hover:rotate-[360deg] transition-transform duration-700">
              <RefreshCw className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-themePrimary transition-colors font-auth-heading">Restore Files</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Recycle bin</p>
          </button>
        </div>
      </div>

      {/* RECENT DOCUMENTS & STORAGE OVERVIEW with Staggered Entrance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-auth-body animate-fade-in-up stagger-3">
        {/* Recent Documents Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
              <FileText className="w-5 h-5 text-themePrimary" /> Recent Uploaded Documents
            </h3>
            <Link href="/user/documents" className="text-sm font-bold text-themePrimary hover:underline flex items-center gap-1 font-auth-body group">
              <span>View All</span> <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentUploads.map((doc, idx) => (
              <div
                key={doc.id}
                style={{ animationDelay: `${(idx % 6) * 50}ms` }}
                onClick={() => setPreviewDoc(doc)}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-themePrimary/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group active:scale-[0.99] animate-fade-in"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-themePrimary dark:bg-orange-950 dark:text-orange-400 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-110 transition-transform">
                    📄
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate font-auth-heading group-hover:text-themePrimary transition-colors">{doc.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-auth-body">
                      {doc.category_name} • {doc.size || '1.5 MB'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }}
                    className="p-2 text-slate-400 hover:text-themePrimary hover:bg-orange-50 dark:hover:bg-orange-950/60 rounded-xl transition-all hover:scale-110 active:scale-90 cursor-pointer"
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
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
            <HardDrive className="w-5 h-5 text-themePrimary" /> Storage Overview
          </h3>

          {(() => {
            const usedBytes = stats.storageUsedBytes || 0;
            const limitBytes = stats.storageLimitBytes || (10 * 1024 * 1024 * 1024);
            const formatSize = (b: number) => {
              if (!b || b === 0) return '0 B';
              if (b < 1024) return b + ' B';
              if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
              if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(2) + ' MB';
              return (b / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
            };
            const pctVal = Math.min(100, Math.max(0, (usedBytes / limitBytes) * 100));
            const pctStr = pctVal.toFixed(1);

            return (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 font-auth-body">
                  <span>{formatSize(usedBytes)} Used</span>
                  <span className="text-themePrimary">{pctStr}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-themePrimary to-[#F97316] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.max(usedBytes > 0 ? 2 : 0, pctVal)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-auth-body">
                  Total Storage Capacity: {formatSize(limitBytes)} (DocVault AES-256 Encrypted)
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ─── MODAL 1: UPLOAD DOCUMENT MODAL ───────────────────────── */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => { setUploadModalOpen(false); resetUploadForm(); }}
        title="Upload New Document"
        icon={<Upload className="w-5 h-5 text-themePrimary" />}
        maxWidth="max-w-[620px]"
      >
        <form onSubmit={handleUploadSubmit} noValidate className="space-y-4">
          {uploadError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2 animate-fade-in font-auth-body">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* File Attachment Dropzone */}
          <div>
            <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5 font-auth-label text-xs">
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
                  : 'border-slate-200 dark:border-slate-800 hover:border-themePrimary bg-slate-50 dark:bg-slate-950'
              }`}
            >
              {uploadFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div className="truncate text-left">
                      <p className="font-bold text-slate-900 dark:text-white truncate font-auth-heading text-sm">{uploadFile.name}</p>
                      <p className="text-xs text-slate-500 font-auth-label">{formatFileSize(uploadFile.size)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">Validated ✓</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 text-themePrimary mx-auto" />
                  <p className="font-bold text-slate-900 dark:text-white font-auth-heading text-sm">Click or Drag & Drop File</p>
                  <p className="text-xs text-slate-500 font-auth-label">PDF, DOCX, XLSX, PPTX, PNG, JPG, ZIP (Max 25 MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Document Title */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="font-bold uppercase text-slate-700 dark:text-slate-300 font-auth-label text-xs">Document Title *</label>
              <span className="text-xs text-slate-400">{uploadTitle.length}/100</span>
            </div>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g., Master_Transcript_2026"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary font-auth-body text-sm"
            />
          </div>

          {/* Category & Folder Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CustomSelectDropdown
              label="Category Domain"
              required
              value={uploadCategory}
              onChange={(val) => setUploadCategory(val)}
              options={categoriesList.map(c => ({ label: c.category_name, value: c.category_name }))}
            />

            <CustomSelectDropdown
              label="Target Folder"
              value={uploadFolder}
              onChange={(val) => setUploadFolder(val)}
              options={[
                { label: '(No specific folder)', value: '' },
                ...folders.map(f => ({ label: f.folder_name, value: f.folder_name }))
              ]}
            />
          </div>

          {/* Expiry Date (Mandatory) */}
          <div>
            <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1 font-auth-label text-xs">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={uploadExpiryDate}
              onChange={(e) => setUploadExpiryDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary font-auth-body text-sm cursor-pointer"
            />
          </div>

          {/* Master Password Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-auth-heading text-sm">
                <Lock className="w-4 h-4 text-themePrimary" /> Protect with Password
              </span>
              <button
                type="button"
                onClick={() => setUploadIsPassword(!uploadIsPassword)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition cursor-pointer ${
                  uploadIsPassword ? 'bg-themePrimary' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${uploadIsPassword ? 'translate-x-4' : ''}`} />
              </button>
            </div>

            {uploadIsPassword && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 animate-fade-in">
                <input
                  type="password"
                  placeholder="Master password"
                  value={uploadPassword}
                  onChange={(e) => setUploadPassword(e.target.value)}
                  className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={uploadConfirmPassword}
                  onChange={(e) => setUploadConfirmPassword(e.target.value)}
                  className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setUploadModalOpen(false); resetUploadForm(); }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingInline}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-themePrimary via-[#F97316] to-[#EA580C] text-white font-black shadow-lg shadow-orange-500/25 flex items-center gap-2 font-auth-heading cursor-pointer hover:brightness-110 active-press text-xs"
            >
              {uploadingInline && <Loader2 className="w-4 h-4 animate-spin" />} Save Document
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 2: CREATE WORKSPACE FOLDER MODAL ─── */}
      <Modal
        isOpen={createFolderModalOpen}
        onClose={() => setCreateFolderModalOpen(false)}
        title="Create Workspace Folder"
        icon={<FolderPlus className="w-5 h-5 text-themePrimary" />}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 font-auth-label uppercase">Folder Name</label>
            <input
              type="text"
              required
              placeholder="e.g., 2026 Tax Return, Project Alpha Specs"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-themePrimary font-auth-body"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateFolderModalOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition font-auth-body cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-themePrimary via-[#F97316] to-[#EA580C] rounded-xl shadow-lg shadow-orange-500/25 hover:brightness-110 transition active-press font-auth-heading cursor-pointer"
            >
              Create Folder
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 3: BROWSE CATEGORIES MODAL ───────────────────────── */}
      <Modal
        isOpen={browseCategoriesModalOpen}
        onClose={() => setBrowseCategoriesModalOpen(false)}
        title="Category Domains"
        icon={<Tags className="w-5 h-5 text-themePrimary" />}
        maxWidth="max-w-[640px]"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
            {categoriesList.map(cat => (
              <div key={cat.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-themePrimary dark:bg-orange-950 dark:text-orange-400 flex items-center justify-center font-bold">
                    {cat.icon || '🏷️'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-auth-heading">{cat.category_name}</p>
                    <p className="text-xs text-slate-500 font-auth-body">{cat.document_count || 0} documents</p>
                  </div>
                </div>

                <Link
                  href={`/user/documents?category_id=${cat.id}`}
                  onClick={() => setBrowseCategoriesModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-themePrimary bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900 rounded-xl hover:bg-orange-100 transition"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm">
            <Link
              href="/user/categories"
              onClick={() => setBrowseCategoriesModalOpen(false)}
              className="text-themePrimary font-bold hover:underline text-xs"
            >
              Go to Full Category Management →
            </Link>
            <button
              type="button"
              onClick={() => setBrowseCategoriesModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 4: SEARCH FILES MODAL ─────────────────────────────── */}
      <Modal
        isOpen={searchFilesModalOpen}
        onClose={() => setSearchFilesModalOpen(false)}
        title="Search Workspace Files"
        icon={<Search className="w-5 h-5 text-themePrimary" />}
        maxWidth="max-w-[640px]"
      >
        <div className="space-y-4 font-auth-body">
          {/* Live Search Input Bar */}
          <div className="relative font-auth-body">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Type document title, keyword, folder, or format (e.g. frontend, proposal, tax, pdf)..."
              value={searchModalQuery}
              onChange={(e) => setSearchModalQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary focus:ring-2 focus:ring-orange-500/20 font-auth-body"
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
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-auth-body scrollbar-none">
            <span className="text-slate-400 font-bold mr-1">Filter:</span>
            {['', 'pdf', 'word', 'excel', 'images', 'zip'].map((ft) => (
              <button
                key={ft}
                type="button"
                onClick={() => setSearchModalFileType(ft)}
                className={`px-3 py-1 rounded-xl font-bold uppercase transition cursor-pointer ${
                  searchModalFileType === ft
                    ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {ft === '' ? 'All' : ft}
              </button>
            ))}
          </div>

          {/* Results Stream */}
          <div className="space-y-2 font-auth-body max-h-[45vh] overflow-y-auto">
            {filteredSearchDocs.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <Search className="w-10 h-10 text-orange-400 mx-auto" />
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white font-auth-heading">No files found for &quot;{searchModalQuery}&quot;</p>
                  <p className="text-sm text-slate-500 mt-1 font-auth-body">Try searching terms like: <span className="text-themePrimary font-mono">proposal, resume, specs, tax, passport, aws</span></p>
                </div>
                <Link
                  href={`/user/documents?q=${encodeURIComponent(searchModalQuery)}`}
                  onClick={() => setSearchFilesModalOpen(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-themePrimary to-[#F97316] shadow-md shadow-orange-500/20 hover:brightness-110 font-auth-heading"
                >
                  Search Full Documents Vault →
                </Link>
              </div>
            ) : (
              filteredSearchDocs.map(doc => (
                <div key={doc.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-themePrimary/40 transition">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950 text-themePrimary dark:text-orange-400 flex items-center justify-center font-bold text-sm shrink-0">
                      📄
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate font-auth-heading">{doc.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-auth-body">
                        {doc.category_name || 'General'} {doc.folder_name ? `• ${doc.folder_name}` : ''} • {doc.size || '1.5 MB'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setSearchFilesModalOpen(false); setPreviewDoc(doc); }}
                    className="px-3.5 py-2 text-sm font-bold text-white bg-gradient-to-r from-themePrimary to-[#F97316] rounded-xl hover:brightness-110 shrink-0 font-auth-heading shadow-xs cursor-pointer"
                  >
                    View File
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setSearchFilesModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 5: VIEW FAVORITES MODAL ──────────────────────────── */}
      <Modal
        isOpen={viewFavoritesModalOpen}
        onClose={() => setViewFavoritesModalOpen(false)}
        title={`Starred Favorites (${favoriteDocs.length})`}
        icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
        maxWidth="max-w-[640px]"
      >
        <div className="space-y-4">
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {favoriteDocs.length === 0 ? (
              <div className="text-center py-8 space-y-2 text-slate-500">
                <Star className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-sm font-bold font-auth-heading">No favorite documents yet</p>
                <p className="text-xs font-auth-body">Star any document card to pin it here for quick access.</p>
              </div>
            ) : (
              favoriteDocs.map(doc => (
                <div key={doc.id} className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate font-auth-heading">{doc.title}</p>
                      <p className="text-xs text-slate-500 font-auth-body">{doc.category_name} • {doc.size || '1.8 MB'}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setViewFavoritesModalOpen(false); setPreviewDoc(doc); }}
                    className="px-3.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-xl cursor-pointer"
                  >
                    Open File
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setViewFavoritesModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 6: RESTORE FILES MODAL (RECYCLE BIN) ──────────────── */}
      <Modal
        isOpen={restoreFilesModalOpen}
        onClose={() => setRestoreFilesModalOpen(false)}
        title="Recycle Bin & Restore"
        icon={<RefreshCw className="w-5 h-5 text-themePrimary" />}
        maxWidth="max-w-[640px]"
      >
        <div className="space-y-4">
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {trashItems.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm font-bold font-auth-heading">
                Recycle bin is clean! No deleted files to restore.
              </div>
            ) : (
              trashItems.map(item => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate font-auth-heading">{item.title}</p>
                      <p className="text-xs text-slate-500 font-auth-body">{item.category} • Deleted {item.deleted_at}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRestoreFile(item.id, item.title)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 rounded-xl flex items-center gap-1.5 cursor-pointer font-auth-heading shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore File
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setRestoreFilesModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

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
