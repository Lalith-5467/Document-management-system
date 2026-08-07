'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Upload, ArrowLeft, FileUp, CheckCircle2, AlertCircle, Loader2, 
  FileText, FolderClosed, X, Star, Plus, Search, ChevronDown, ChevronRight,
  FolderPlus, Eye, Sparkles, Check, FileCheck, HardDrive, Clock, Lock
} from 'lucide-react';
import api from '@/lib/api';
import { detectCategoryFromFilename, detectCategoryFromFolderName } from '@/lib/autoCategorize';
import { logActivity } from '@/lib/activityLogger';
import { addNotification, syncExpiryNotifications } from '@/lib/notificationStore';
import {
  validateDocumentFile,
  validateDocumentTitle,
  validateDocumentDescription,
  validateExpiryDate,
  getFieldStatusClasses
} from '@/lib/validation';

// Categories with icons & color themes
const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Personal Documents', icon: '👤', color: 'var(--theme-primary, #FF6B00)' },
  { id: '2', name: 'Academic Documents', icon: '🎓', color: '#8B5CF6' },
  { id: '3', name: 'Resume & CV', icon: '📄', color: '#EC4899' },
  { id: '4', name: 'Certificates', icon: '🏆', color: '#F59E0B' },
  { id: '5', name: 'Project Documents', icon: '💻', color: '#10B981' },
  { id: '6', name: 'Client Requirements', icon: '🤝', color: '#06B6D4' },
  { id: '7', name: 'Medical Records', icon: '🏥', color: '#EF4444' },
  { id: '8', name: 'Government Documents', icon: '🏛️', color: '#64748B' },
  { id: '9', name: 'Financial Documents', icon: '💵', color: '#14B8A6' },
];

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [folders, setFolders] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(true);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('1');
  const [categoryName, setCategoryName] = useState<string>('Personal Documents');
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string>(() => searchParams.get('folder_id') || '');
  const [folderName, setFolderName] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Expiry Date
  const [expiryDate, setExpiryDate] = useState<string>('');

  // Password Protection
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Custom Dropdowns State
  const [catSearch, setCatSearch] = useState<string>('');
  const [catOpen, setCatOpen] = useState<boolean>(false);
  const [folderSearch, setFolderSearch] = useState<string>('');
  const [folderOpen, setFolderOpen] = useState<boolean>(false);

  // Create Folder Modal State
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [newFolderDesc, setNewFolderDesc] = useState<string>('');
  const [creatingFolder, setCreatingFolder] = useState<boolean>(false);

  // File Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // Upload States
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ─── VALIDATION STATES & REFS ──────────────────────────────────
  const [fileTouched, setFileTouched] = useState<boolean>(false);
  const [titleTouched, setTitleTouched] = useState<boolean>(false);
  const [descTouched, setDescTouched] = useState<boolean>(false);
  const [expiryTouched, setExpiryTouched] = useState<boolean>(false);
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState<boolean>(false);

  const [fileError, setFileError] = useState<string>('');
  const [titleError, setTitleError] = useState<string>('');
  const [descError, setDescError] = useState<string>('');
  const [expiryError, setExpiryError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');

  // Input Refs for auto-focusing on first invalid field
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);
  const expiryInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchOptions();
    const handleUpdate = () => fetchOptions();
    window.addEventListener('dms_categories_updated', handleUpdate);
    window.addEventListener('dms_folders_updated', handleUpdate);
    return () => {
      window.removeEventListener('dms_categories_updated', handleUpdate);
      window.removeEventListener('dms_folders_updated', handleUpdate);
    };
  }, []);

  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      const [catRes, foldRes] = await Promise.all([
        api.get('/categories').catch(() => null),
        api.get('/folders').catch(() => null)
      ]);

      let loadedCats = catRes?.data?.categories;
      if (!loadedCats || loadedCats.length === 0) {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('dms_admin_categories');
          if (saved) {
            try { loadedCats = JSON.parse(saved); } catch {}
          }
        }
      }

      if (loadedCats && loadedCats.length > 0) {
        setCategories(loadedCats);
        // Only set default if no category was pre-selected from URL
        const urlCatId = searchParams.get('category_id');
        const urlCatName = searchParams.get('category_name');
        if (urlCatId) {
          const matched = loadedCats.find((c: any) => String(c.id) === String(urlCatId));
          if (matched) {
            setCategoryId(String(matched.id));
            setCategoryName(matched.category_name || matched.name || urlCatName || '');
          } else {
            setCategoryId(urlCatId);
            setCategoryName(urlCatName || '');
          }
        } else if (!categoryId) {
          setCategoryId(String(loadedCats[0].id));
          setCategoryName(loadedCats[0].category_name || loadedCats[0].name);
        }
      }

      let loadedFolders = foldRes?.data?.folders;
      if (!loadedFolders || loadedFolders.length === 0) {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('dms_admin_folders');
          if (saved) {
            try { loadedFolders = JSON.parse(saved); } catch {}
          }
        }
      }

      if (loadedFolders && loadedFolders.length > 0) {
        setFolders(loadedFolders);
        if (folderId) {
          const matched = loadedFolders.find((f: any) => String(f.id) === String(folderId));
          if (matched) setFolderName(matched.folder_name);
        }
      }
    } finally {
      setLoadingOptions(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!catSearch.trim()) return categories;
    return categories.filter(c => 
      (c.category_name || c.name || '').toLowerCase().includes(catSearch.toLowerCase().trim())
    );
  }, [categories, catSearch]);

  const filteredFoldersList = useMemo(() => {
    if (!folderSearch.trim()) return folders;
    return folders.filter(f => 
      (f.folder_name || '').toLowerCase().includes(folderSearch.toLowerCase().trim())
    );
  }, [folders, folderSearch]);

  // ─── Real-Time Input Handlers & Validation ───────────────────

  const handleFileSelect = (file: File) => {
    if (!file) return;
    setFileTouched(true);

    const valRes = validateDocumentFile(file);
    setFileError(valRes.error);

    if (!valRes.isValid) {
      setErrorMessage(valRes.error);
      return;
    }

    setSelectedFile(file);

    // Auto-fill title if empty
    if (!title.trim()) {
      const generatedTitle = file.name.replace(/\.[^/.]+$/, '').substring(0, 100);
      setTitle(generatedTitle);
      if (titleTouched) {
        const titleRes = validateDocumentTitle(generatedTitle);
        setTitleError(titleRes.error);
      }
    }

    // Auto Categorization — only if a confident match is found
    const autoCat = detectCategoryFromFilename(file.name);
    if (autoCat) {
      setSuggestedCategory(autoCat.categoryName);
      // Exact match first, then partial
      const matched = categories.find((c: any) =>
        (c.category_name || c.name || '').toLowerCase() === autoCat.categoryName.toLowerCase()
      ) || categories.find((c: any) =>
        (c.category_name || c.name || '').toLowerCase().includes(autoCat.categoryName.toLowerCase())
      );
      if (matched) {
        setCategoryId(String(matched.id));
        setCategoryName(matched.category_name || matched.name);
      }
    }

    setErrorMessage(null);

    // Create object URL for preview if image or PDF
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      setFilePreviewUrl(URL.createObjectURL(file));
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (titleTouched) {
      const res = validateDocumentTitle(val);
      setTitleError(res.error);
    }
  };

  const handleTitleBlur = () => {
    setTitleTouched(true);
    const res = validateDocumentTitle(title);
    setTitleError(res.error);
  };

  const handleDescChange = (val: string) => {
    setDescription(val);
    if (descTouched) {
      const res = validateDocumentDescription(val);
      setDescError(res.error);
    }
  };

  const handleDescBlur = () => {
    setDescTouched(true);
    const res = validateDocumentDescription(description);
    setDescError(res.error);
  };

  const handleExpiryChange = (val: string) => {
    setExpiryDate(val);
    if (expiryTouched) {
      const res = validateExpiryDate(val);
      setExpiryError(res.error);
    }
  };

  const handleExpiryBlur = () => {
    setExpiryTouched(true);
    const res = validateExpiryDate(expiryDate);
    setExpiryError(res.error);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (passwordTouched) {
      if (!val) {
        setPasswordError('Master password is required.');
      } else if (val.length < 6) {
        setPasswordError('Master password must be at least 6 characters.');
      } else {
        setPasswordError('');
      }
    }
    if (confirmPasswordTouched) {
      if (!confirmPassword) {
        setConfirmPasswordError('Please confirm your password.');
      } else if (confirmPassword !== val) {
        setConfirmPasswordError('Passwords do not match.');
      } else {
        setConfirmPasswordError('');
      }
    }
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (confirmPasswordTouched) {
      if (!val) {
        setConfirmPasswordError('Please confirm your password.');
      } else if (val !== password) {
        setConfirmPasswordError('Passwords do not match.');
      } else {
        setConfirmPasswordError('');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleCreateFolderInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const res = await api.post('/folders', {
        folder_name: newFolderName.trim(),
        description: newFolderDesc.trim()
      });
      if (res.data?.folder) {
        const createdF = res.data.folder;
        setFolders(prev => [createdF, ...prev]);
        setFolderId(String(createdF.id));
        setFolderName(createdF.folder_name);
      } else {
        const fallbackId = String(Date.now());
        setFolders(prev => [{ id: fallbackId, folder_name: newFolderName.trim() }, ...prev]);
        setFolderId(fallbackId);
        setFolderName(newFolderName.trim());
      }
      setNewFolderName('');
      setNewFolderDesc('');
      setCreateFolderModalOpen(false);
    } catch {
      const fallbackId = String(Date.now());
      setFolders(prev => [{ id: fallbackId, folder_name: newFolderName.trim() }, ...prev]);
      setFolderId(fallbackId);
      setFolderName(newFolderName.trim());
      setCreateFolderModalOpen(false);
    } finally {
      setCreatingFolder(false);
    }
  };

  // ─── FORM SUBMISSION WITH COMPREHENSIVE VALIDATION ─────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Touch all fields to render validation errors
    setFileTouched(true);
    setTitleTouched(true);
    setDescTouched(true);
    setExpiryTouched(true);
    if (isPasswordProtected) {
      setPasswordTouched(true);
      setConfirmPasswordTouched(true);
    }

    const fileCheck = validateDocumentFile(selectedFile);
    const titleCheck = validateDocumentTitle(title);
    const descCheck = validateDocumentDescription(description);
    const expiryCheck = validateExpiryDate(expiryDate);

    let passCheck = { isValid: true, error: '' };
    let confirmCheck = { isValid: true, error: '' };

    if (isPasswordProtected) {
      if (!password) {
        passCheck = { isValid: false, error: 'Master password is required.' };
      } else if (password.length < 6) {
        passCheck = { isValid: false, error: 'Master password must be at least 6 characters.' };
      }

      if (!confirmPassword) {
        confirmCheck = { isValid: false, error: 'Please confirm your password.' };
      } else if (confirmPassword !== password) {
        confirmCheck = { isValid: false, error: 'Passwords do not match.' };
      }
    }

    setFileError(fileCheck.error);
    setTitleError(titleCheck.error);
    setDescError(descCheck.error);
    setExpiryError(expiryCheck.error);
    setPasswordError(passCheck.error);
    setConfirmPasswordError(confirmCheck.error);

    // Auto-focus on the first invalid field
    if (!fileCheck.isValid) {
      setErrorMessage(fileCheck.error);
      dropZoneRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!titleCheck.isValid) {
      setErrorMessage(titleCheck.error);
      titleInputRef.current?.focus();
      return;
    }

    if (!descCheck.isValid) {
      setErrorMessage(descCheck.error);
      descInputRef.current?.focus();
      return;
    }

    if (!expiryCheck.isValid) {
      setErrorMessage(expiryCheck.error);
      expiryInputRef.current?.focus();
      return;
    }

    if (!passCheck.isValid) {
      setErrorMessage(passCheck.error);
      passwordInputRef.current?.focus();
      return;
    }

    if (!confirmCheck.isValid) {
      setErrorMessage(confirmCheck.error);
      confirmPasswordInputRef.current?.focus();
      return;
    }

    // Submit payload
    setUploading(true);
    setUploadProgress(15);
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('document', selectedFile!);
    formData.append('title', title.trim().substring(0, 100));
    formData.append('description', description.trim().substring(0, 500));
    formData.append('category_id', categoryId);
    formData.append('categoryName', categoryName);
    if (folderId) formData.append('folder_id', folderId);
    formData.append('is_favorite', isFavorite ? '1' : '0');
    if (expiryDate) formData.append('expiry_date', expiryDate);
    if (isPasswordProtected) {
      formData.append('is_password_protected', '1');
      formData.append('password', password);
    }

    let loggedUser: any = null;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dms_user');
        if (stored) loggedUser = JSON.parse(stored);
      } catch (e) {}
    }

    const newDocItem = {
      id: Date.now(),
      user_id: loggedUser?.id || 1,
      owner_name: loggedUser?.full_name || 'User',
      owner_email: loggedUser?.email || '',
      category_id: categoryId ? (isNaN(Number(categoryId)) ? 1 : Number(categoryId)) : 1,
      folder_id: folderId ? (isNaN(Number(folderId)) ? null : Number(folderId)) : null,
      title: title.trim(),
      description: description.trim(),
      file_name: selectedFile!.name,
      file_path: filePreviewUrl || `/uploads/${selectedFile!.name}`,
      file_size: selectedFile!.size,
      mime_type: selectedFile!.type || 'application/pdf',
      is_favorite: isFavorite ? 1 : 0,
      is_archived: 0,
      created_at: new Date().toISOString(),
      category_name: categoryName || 'Personal Documents',
      color: 'var(--theme-primary, #FF6B00)',
      folder_name: folderName || 'Unassigned'
    };

    let createdDoc = newDocItem;

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      });

      if (res.data && res.data.document) {
        createdDoc = {
          ...newDocItem,
          ...res.data.document,
          category_name: categoryName || res.data.document.category_name || 'Personal Documents',
          folder_name: folderName || res.data.document.folder_name || 'Unassigned'
        };
      }
    } catch (apiErr) {
      console.warn('API upload fallback to local storage', apiErr);
    } finally {
      if (typeof window !== 'undefined') {
        let existingDocs: any[] = [];
        try {
          const stored = localStorage.getItem('dms_user_documents');
          if (stored) existingDocs = JSON.parse(stored);
        } catch (e) {}

        const updatedDocs = [createdDoc, ...existingDocs];
        localStorage.setItem('dms_user_documents', JSON.stringify(updatedDocs));

        // Update dashboard recent docs
        let dashDocs: any[] = [];
        try {
          const storedDash = localStorage.getItem('dms_dashboard_docs');
          if (storedDash) dashDocs = JSON.parse(storedDash);
        } catch (e) {}
        const newDashDoc = {
          id: createdDoc.id,
          name: createdDoc.title,
          category: createdDoc.category_name,
          categoryColor: 'bg-blue-950/70 text-blue-400 border-blue-800/60',
          folder: createdDoc.folder_name,
          size: formatFileSize(createdDoc.file_size),
          modified: 'Just now',
          icon: createdDoc.mime_type?.includes('pdf') ? 'pdf' : 'doc',
          is_favorite: Boolean(createdDoc.is_favorite)
        };
        localStorage.setItem('dms_dashboard_docs', JSON.stringify([newDashDoc, ...dashDocs]));

        // If favorite, add to 'dms_favorites_list'
        if (isFavorite) {
          let favs: any[] = [];
          try {
            const storedFavs = localStorage.getItem('dms_favorites_list');
            if (storedFavs) favs = JSON.parse(storedFavs);
          } catch (e) {}
          if (!favs.some((f: any) => f.id === createdDoc.id || f.title === createdDoc.title)) {
            favs.unshift(createdDoc);
            localStorage.setItem('dms_favorites_list', JSON.stringify(favs));
          }
        }
        // Log real-time audit activity & notification
        logActivity('UPLOAD', createdDoc.title, `Uploaded document "${createdDoc.title}" (${formatFileSize(createdDoc.file_size)}) to category ${createdDoc.category_name}`);
        addNotification('Document Uploaded Successfully', `"${createdDoc.title}" was vaulted into category ${createdDoc.category_name}.`, 'success', `/user/documents?q=${encodeURIComponent(createdDoc.title)}`);
        const docWithExpiry = { ...createdDoc, expiry_date: (createdDoc as any).expiry_date || expiryDate || null };
        if (docWithExpiry.expiry_date) {
          syncExpiryNotifications([docWithExpiry]);
        }
      }

      setUploadProgress(100);
      setSuccessMessage('Document uploaded and vaulted successfully!');
      setUploading(false);
      setTimeout(() => {
        router.push('/user/documents');
      }, 1000);
    }
  };

  const getFileExtension = (filename: string) => {
    const ext = filename.split('.').pop()?.toUpperCase() || 'FILE';
    return ext.length > 5 ? 'FILE' : ext;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const fileCheck = validateDocumentFile(selectedFile);
  const titleCheck = validateDocumentTitle(title);
  const descCheck = validateDocumentDescription(description);
  const expiryCheck = validateExpiryDate(expiryDate);
  const isFormValid = fileCheck.isValid && titleCheck.isValid && descCheck.isValid && expiryCheck.isValid;

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-16 font-auth-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-auth-heading">
            Upload New Document
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium font-auth-body">
            Store and organize your important files securely for future reference.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative overflow-hidden px-5 py-2.5 text-sm font-black text-white bg-gradient-to-r from-themePrimary via-[#F97316] to-[#EA580C] hover:scale-105 rounded-xl shadow-[0_8px_25px_rgba(255,107,0,0.3)] hover:shadow-[0_12px_35px_rgba(255,107,0,0.5)] transition-all duration-300 flex items-center gap-2 active-press font-auth-heading border border-orange-400/50"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out" />
            <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300 relative z-10" /> 
            <span className="relative z-10 drop-shadow-md tracking-wide">Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setCreateFolderModalOpen(true)}
            className="group relative overflow-hidden px-5 py-2.5 text-sm font-extrabold text-slate-800 dark:text-white bg-white dark:bg-slate-900 hover:scale-105 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-themePrimary/40 dark:hover:border-orange-500/50 shadow-md hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all duration-300 flex items-center gap-2 active-press font-auth-body"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-orange-50/80 dark:via-slate-800/80 to-transparent transition-transform duration-1000 ease-in-out" />
            <FolderPlus className="w-4 h-4 text-themePrimary dark:text-orange-400 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 relative z-10" /> 
            <span className="relative z-10">Create Folder</span>
          </button>
        </div>
      </div>

      {/* Error & Success Feedback Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3 animate-fade-in font-auth-body">
          <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3 animate-fade-in font-auth-body">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMessage} Redirecting to My Documents...</span>
        </div>
      )}

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-xl space-y-6">
        
        {/* DRAG & DROP UPLOAD ZONE */}
        <div ref={dropZoneRef}>
          <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-auth-label">
            File Attachment <span className="text-red-500">*</span>
          </label>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
              fileTouched && fileError
                ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-themePrimary/80 bg-slate-50 dark:bg-[#0b1120]/60 hover:bg-slate-100 dark:hover:bg-[#0b1120]'
            }`}
          >
            {selectedFile ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#0b1120] border border-emerald-200 dark:border-emerald-500/40 text-left font-auth-body">
                <div className="flex items-center gap-3.5 overflow-hidden w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center font-black text-sm shrink-0 font-auth-heading">
                    {getFileExtension(selectedFile.name)}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate font-auth-heading">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-auth-label mt-0.5">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Document'}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-auth-body">
                      <Check className="w-3 h-3" /> File Selected & Validated
                    </span>

                    {suggestedCategory && (
                      <div className="mt-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 animate-fade-in font-auth-body">
                        <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>Suggested Category: {suggestedCategory}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-auth-body">
                  {filePreviewUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-sm font-bold text-themePrimary dark:text-orange-400 hover:text-orange-700 dark:hover:text-white bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl transition flex items-center gap-1 font-auth-body"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setFileError('Please select or drag a document file to upload.');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                    title="Remove File"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 font-auth-body">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-600/10 border border-orange-200 dark:border-orange-500/20 text-themePrimary dark:text-orange-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white font-auth-heading">
                    Drag & Drop your document here <span className="text-slate-500 dark:text-slate-400 font-normal">or</span> <span className="text-themePrimary dark:text-orange-400 underline">Browse Files</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium font-auth-body">
                    Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, Images (PNG/JPG/WEBP/SVG/GIF), TXT, CSV, ZIP, RAR, Data Files
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 font-auth-label">
                  <HardDrive className="w-3 h-3 text-themePrimary dark:text-orange-400" /> Maximum File Size: 50 MB
                </div>
              </div>
            )}
          </div>

          {/* Inline File Attachment Error */}
          {fileTouched && fileError && (
            <p className="text-red-500 text-xs font-semibold tracking-wide flex items-center gap-1.5 mt-1.5 animate-fade-in font-auth-body">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fileError}</span>
            </p>
          )}
        </div>

        {/* CATEGORY & FOLDER CUSTOM SEARCHABLE DROPDOWNS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-auth-body">
          {/* CATEGORY SEARCHABLE DROPDOWN */}
          <div className="relative">
            <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-auth-label">
              Category Domain <span className="text-red-500">*</span>
            </label>
            
            <button
              type="button"
              onClick={() => {
                setCatOpen(!catOpen);
                setFolderOpen(false);
              }}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 focus:border-themePrimary focus:ring-2 focus:ring-orange-500/20 rounded-2xl text-sm text-slate-900 dark:text-white flex items-center justify-between font-semibold transition-all font-auth-body"
            >
              <span className="flex items-center gap-2 truncate">
                <span>{categories.find(c => String(c.id) === String(categoryId))?.icon || '🏷️'}</span>
                <span className="truncate">{categoryName || 'Select Category'}</span>
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {catOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-40 p-2 space-y-2 max-h-60 overflow-y-auto backdrop-blur-xl animate-fade-in font-auth-body">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none font-auth-body"
                  />
                </div>

                <div className="space-y-1">
                  {filteredCategories.map((cat) => {
                    const catIdStr = String(cat.id);
                    const isSelected = categoryId === catIdStr;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(catIdStr);
                          setCategoryName(cat.category_name || cat.name);
                          setCatOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition font-auth-body ${
                          isSelected ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-auth-heading' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span>{cat.icon || '🏷️'}</span>
                          <span className="truncate">{cat.category_name || cat.name}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* FOLDER SEARCHABLE DROPDOWN */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2 font-auth-body">
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-auth-label">
                Target Folder
              </label>
              <button
                type="button"
                onClick={() => setCreateFolderModalOpen(true)}
                className="text-xs font-bold text-themePrimary dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1 font-auth-body"
              >
                <Plus className="w-3 h-3" /> New Folder
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setFolderOpen(!folderOpen);
                setCatOpen(false);
              }}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 focus:border-themePrimary focus:ring-2 focus:ring-orange-500/20 rounded-2xl text-sm text-slate-900 dark:text-white flex items-center justify-between font-semibold transition-all font-auth-body"
            >
              <span className="flex items-center gap-2 truncate">
                <FolderClosed className="w-4 h-4 text-themePrimary dark:text-orange-400 shrink-0" />
                <span className="truncate">{folderName || '(No specific folder)'}</span>
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {folderOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-40 p-2 space-y-2 max-h-60 overflow-y-auto backdrop-blur-xl animate-fade-in font-auth-body">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search folder..."
                    value={folderSearch}
                    onChange={(e) => setFolderSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none font-auth-body"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFolderId('');
                    setFolderName('(No specific folder)');
                    setFolderOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition font-auth-body ${
                    !folderId ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-auth-heading' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>(No specific folder)</span>
                  {!folderId && <Check className="w-3.5 h-3.5" />}
                </button>

                <div className="space-y-1 border-t border-slate-200 dark:border-slate-800 pt-1">
                  {filteredFoldersList.map((f) => {
                    const fIdStr = String(f.id);
                    const isSelected = String(folderId) === fIdStr;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setFolderId(fIdStr);
                          setFolderName(f.folder_name);
                          setFolderOpen(false);
                          // Auto-suggest category from folder name
                          const folderCatSuggestion = detectCategoryFromFolderName(f.folder_name);
                          if (folderCatSuggestion) {
                            const matchedCat = categories.find((c: any) =>
                              (c.category_name || c.name || '').toLowerCase() === folderCatSuggestion.categoryName.toLowerCase()
                            );
                            if (matchedCat) {
                              setCategoryId(String(matchedCat.id));
                              setCategoryName(matchedCat.category_name || matchedCat.name);
                              setSuggestedCategory(matchedCat.category_name || matchedCat.name);
                            }
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition font-auth-body ${
                          isSelected ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-auth-heading' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <FolderClosed className="w-3.5 h-3.5 text-themePrimary dark:text-orange-400 shrink-0" />
                          <span className="truncate">{f.folder_name}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      setFolderOpen(false);
                      setCreateFolderModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-themePrimary dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-600/10 transition mt-1 font-auth-body"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create New Folder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DOCUMENT TITLE */}
        <div>
          <div className="flex items-center justify-between mb-2 font-auth-body">
            <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-auth-label">
              Document Title <span className="text-red-500">*</span>
            </label>
            <span className="text-xs font-auth-label text-slate-500">
              {title.length}/100
            </span>
          </div>
          <div className="relative font-auth-body">
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="e.g., Master_Degree_Transcript_2026"
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0b1120] border rounded-2xl text-sm text-slate-900 dark:text-white font-semibold transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-auth-body ${getFieldStatusClasses(titleTouched, titleCheck.isValid, titleError)}`}
            />
            {titleTouched && titleCheck.isValid && !titleError && (
              <CheckCircle2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
            )}
          </div>
          {/* Inline Title Error */}
          {titleTouched && titleError && (
            <p className="text-red-500 text-xs font-semibold tracking-wide flex items-center gap-1.5 mt-1.5 animate-fade-in font-auth-body">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{titleError}</span>
            </p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <div className="flex items-center justify-between mb-2 font-auth-body">
            <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-auth-label">
              Description / Reference Notes <span className="text-slate-400 font-normal lowercase font-sans">(optional)</span>
            </label>
            <span className="text-xs font-auth-label text-slate-500">
              {description.length}/500
            </span>
          </div>
          <textarea
            ref={descInputRef}
            rows={3}
            value={description}
            onChange={(e) => handleDescChange(e.target.value)}
            onBlur={handleDescBlur}
            placeholder="Additional details, scope, references or context for future retrieval..."
            className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0b1120] border rounded-2xl text-sm text-slate-900 dark:text-white font-medium transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none font-auth-body ${getFieldStatusClasses(descTouched, descCheck.isValid, descError)}`}
          />
          {/* Inline Description Error */}
          {descTouched && descError && (
            <p className="text-red-500 text-xs font-semibold tracking-wide flex items-center gap-1.5 mt-1.5 animate-fade-in font-auth-body">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{descError}</span>
            </p>
          )}
        </div>

        {/* FAVORITE SWITCH TOGGLE */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 flex items-center justify-between font-auth-body">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                isFavorite ? 'bg-themePrimary' : 'bg-slate-300 dark:bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                  isFavorite ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-auth-heading">
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
              ⭐ Mark as Favorite
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-auth-label">
            {isFavorite ? 'Starred' : 'Standard'}
          </span>
        </div>

        {/* EXPIRY DATE PICKER (MANDATORY) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 font-auth-body">
          <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-auth-label">
            <Clock className="w-4 h-4 text-amber-500" /> Expiry Date <span className="text-red-500">*</span>
          </label>
          <div className="relative font-auth-body">
            <input
              ref={expiryInputRef}
              type="date"
              value={expiryDate}
              onChange={(e) => handleExpiryChange(e.target.value)}
              onBlur={handleExpiryBlur}
              className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm text-slate-900 dark:text-white font-semibold focus:outline-none transition-all duration-300 font-auth-body ${getFieldStatusClasses(expiryTouched, expiryCheck.isValid, expiryError)}`}
            />
            {expiryTouched && expiryDate && expiryCheck.isValid && !expiryError && (
              <CheckCircle2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-auth-body">
            Mandatory date field for record tracking. For Passports, Driving Licenses, Policies, Visas, Contracts. Triggers expiration reminders.
          </p>
          {/* Inline Expiry Error */}
          {expiryTouched && expiryError && (
            <p className="text-red-500 text-xs font-semibold tracking-wide flex items-center gap-1.5 mt-1.5 animate-fade-in font-auth-body">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{expiryError}</span>
            </p>
          )}
        </div>

        {/* PASSWORD PROTECTION TOGGLE */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 font-auth-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-orange-100 text-themePrimary dark:bg-orange-950 dark:text-orange-400">
                🔒
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-auth-heading">Protect document with a password</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-auth-body">Requires entering a password before viewing or downloading</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPasswordProtected(!isPasswordProtected)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                isPasswordProtected ? 'bg-themePrimary' : 'bg-slate-300 dark:bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  isPasswordProtected ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {isPasswordProtected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 animate-fade-in font-auth-body">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500 font-auth-label">Master Password *</label>
                <input
                  ref={passwordInputRef}
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border text-sm font-semibold text-slate-900 dark:text-white focus:outline-none transition-all duration-300 font-auth-body ${getFieldStatusClasses(passwordTouched, !passwordError && password.length >= 6, passwordError)}`}
                />
                {passwordTouched && passwordError && (
                  <p className="text-red-500 text-xs font-semibold tracking-wide flex items-center gap-1 mt-1 animate-fade-in font-auth-body">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500 font-auth-label">Confirm Password *</label>
                <input
                  ref={confirmPasswordInputRef}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border text-sm font-semibold text-slate-900 dark:text-white focus:outline-none transition-all duration-300 font-auth-body ${getFieldStatusClasses(confirmPasswordTouched, !confirmPasswordError && confirmPassword === password && confirmPassword.length > 0, confirmPasswordError)}`}
                />
                {confirmPasswordTouched && confirmPasswordError && (
                  <p className="text-red-500 text-xs font-semibold tracking-wide flex items-center gap-1 mt-1 animate-fade-in font-auth-body">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{confirmPasswordError}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* UPLOAD PROGRESS BAR */}
        {uploading && (
          <div className="space-y-2 pt-2 font-auth-body">
            <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2 font-auth-heading">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-themePrimary dark:text-orange-400" /> Vaulting Document...
              </span>
              <span className="font-auth-label text-themePrimary dark:text-orange-400">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-themePrimary via-[#F97316] to-[#EA580C] transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800/80 font-auth-body">
          <Link
            href="/user/documents"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-sm text-center transition font-auth-body"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={uploading || (fileTouched && titleTouched && !isFormValid)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 shadow-lg shadow-orange-500/25 border border-orange-400/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-auth-heading active-press"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
            {uploading ? 'Vaulting File...' : 'Save Document'}
          </button>
        </div>
      </form>

      {/* INLINE CREATE FOLDER MODAL */}
      {createFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-pop-in text-slate-900 dark:text-white font-auth-body">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
                <FolderPlus className="w-4 h-4 text-themePrimary dark:text-orange-400" /> Create Workspace Folder
              </h2>
              <button onClick={() => setCreateFolderModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFolderInline} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 font-auth-label">Folder Name *</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g., 2026 Tax Return, Project Alpha Specs"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary font-auth-body"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 font-auth-label">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="Brief description..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary resize-none font-auth-body"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setCreateFolderModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white font-auth-body">
                  Cancel
                </button>
                <button type="submit" disabled={creatingFolder} className="px-4 py-2 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 text-white font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25 font-auth-heading">
                  {creatingFolder && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FILE PREVIEW MODAL */}
      {previewModalOpen && filePreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-pop-in text-slate-900 dark:text-white font-auth-body">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
                <Eye className="w-4 h-4 text-themePrimary dark:text-orange-400" /> Document Preview: {selectedFile?.name}
              </h3>
              <button onClick={() => setPreviewModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-50 dark:bg-[#0b1120] p-4">
              {selectedFile?.type.startsWith('image/') ? (
                <img src={filePreviewUrl} alt="Preview" className="max-h-80 rounded-xl object-contain" />
              ) : (
                <iframe src={filePreviewUrl} title="Document Preview" className="w-full h-80 rounded-xl" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
