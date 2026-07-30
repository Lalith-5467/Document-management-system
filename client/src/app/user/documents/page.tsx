'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  FileText, Plus, Search, ArrowLeft, Download, Trash2, Edit2, Star, 
  RefreshCw, X, AlertCircle, CheckCircle2, Loader2, Eye, LayoutGrid, 
  List, ChevronLeft, ChevronRight, FolderInput, Info, MoreVertical, SlidersHorizontal, RotateCcw,
  Clock
} from 'lucide-react';
import api from '@/lib/api';
import { logActivity } from '@/lib/activityLogger';
import DocumentPreviewModal from '@/components/dashboard/DocumentPreviewModal';
import EditDocumentModal from '@/components/dashboard/EditDocumentModal';
import { useLanguage } from '@/context/LanguageContext';

export interface DocumentItem {
  id: number;
  user_id: number;
  category_id: number;
  folder_id: number | null;
  title: string;
  description?: string;
  tags?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  is_favorite: number;
  is_archived: number;
  created_at: string;
  updated_at?: string;
  category_name?: string;
  color?: string;
  folder_name?: string;
}

export default function MyDocumentsPage() {
  const searchParams = useSearchParams();
  const isRecentMode = searchParams.get('filter') === 'recent' || searchParams.get('recent') === 'true';
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useLanguage();

  // View & Filter States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(() => searchParams.get('category_id') || searchParams.get('category') || '');
  const [selectedFolder, setSelectedFolder] = useState<string>(() => searchParams.get('folder_id') || searchParams.get('folder') || '');
  const [selectedFileType, setSelectedFileType] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>(() => isRecentMode ? '7days' : '');
  const [sortBy, setSortBy] = useState<string>('date_desc');

  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(() => searchParams.get('favorite') === 'true' || searchParams.get('starred') === 'true');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const limit = 12;

  // Active Document Modals
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [activeModal, setActiveModal] = useState<'details' | 'preview' | 'rename' | 'move' | 'delete' | 'edit' | null>(null);

  // Form Inputs
  const [editTitle, setEditTitle] = useState<string>('');
  const [editFolderId, setEditFolderId] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get('q');
      if (q) {
        setSearchQuery(q);
        setDebouncedSearch(q);
      }
      const catParam = urlParams.get('category_id') || urlParams.get('category');
      if (catParam) {
        setSelectedCategory(catParam);
      }
      const foldParam = urlParams.get('folder_id') || urlParams.get('folder');
      if (foldParam) {
        setSelectedFolder(foldParam);
      }
      if (urlParams.get('favorite') === 'true' || urlParams.get('starred') === 'true') {
        setOnlyFavorites(true);
      }
      if (urlParams.get('focus') === 'search') {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 150);
      }
    }
    fetchCategoriesAndFolders();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, debouncedSearch, selectedCategory, selectedFolder, selectedFileType, selectedDateRange, sortBy, onlyFavorites]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCategoriesAndFolders = async () => {
    try {
      const [catRes, foldRes] = await Promise.all([
        api.get('/categories').catch(() => null),
        api.get('/folders').catch(() => null)
      ]);
      const fetchedCats = catRes?.data?.categories;
      const fetchedFolds = foldRes?.data?.folders;

      if (fetchedCats && fetchedCats.length > 0) {
        setCategories(fetchedCats);
      } else {
        const savedCats = typeof window !== 'undefined' ? localStorage.getItem('dms_admin_categories') : null;
        setCategories(savedCats ? JSON.parse(savedCats) : [
          { id: 1, category_name: 'Personal Identity & Passports', color: '#FF6B00' },
          { id: 2, category_name: 'Academic Records & Diplomas', color: '#10B981' },
          { id: 3, category_name: 'Career & Employment Assets', color: '#F59E0B' },
          { id: 4, category_name: 'Projects & Technical Specs', color: '#8B5CF6' },
          { id: 5, category_name: 'Certificates & Achievements', color: '#EC4899' },
          { id: 6, category_name: 'Client Requirements & Contracts', color: '#06B6D4' },
        ]);
      }

      if (fetchedFolds && fetchedFolds.length > 0) {
        setFolders(fetchedFolds);
      } else {
        const savedFolds = typeof window !== 'undefined' ? localStorage.getItem('dms_admin_folders') : null;
        setFolders(savedFolds ? JSON.parse(savedFolds) : [
          { id: 1, folder_name: 'Academic Transcripts', color: '#10B981' },
          { id: 2, folder_name: 'Tax Filings 2026', color: '#EF4444' },
          { id: 3, folder_name: 'Passport & Identity', color: '#FF6B00' },
          { id: 4, folder_name: 'Project Architecture', color: '#8B5CF6' },
        ]);
      }
    } catch { /* fallback */ }
  };

  const fetchDocuments = async () => {
    setLoading(true);

    let apiDocs: DocumentItem[] = [];
    let isApiSuccess = false;

    // 1. Try fetching documents from backend API
    try {
      const params: any = { page: currentPage, limit, sort: sortBy };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedFolder) params.folder_id = selectedFolder;
      if (selectedFileType) params.file_type = selectedFileType;
      if (selectedDateRange) params.date_range = selectedDateRange;

      const res = await api.get('/documents', { params });
      if (res.data && Array.isArray(res.data.documents)) {
        apiDocs = res.data.documents;
        isApiSuccess = true;
      }
    } catch {
      isApiSuccess = false;
    }

    // 2. Read local cache / uploads
    let localDocs: DocumentItem[] = [];
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dms_user_documents');
      if (saved) {
        try {
          localDocs = JSON.parse(saved);
        } catch (e) {}
      }
    }

    // Default sample fallback
    const sampleDocs: DocumentItem[] = [
      { id: 1, user_id: 1, category_id: 4, folder_id: 4, title: 'Software Architecture Proposal 2026.pdf', file_name: 'Software_Architecture_Proposal_v2.pdf', description: 'System BRD briefs and cloud node specifications.', file_path: '/uploads/proposal.pdf', file_size: 2516582, mime_type: 'application/pdf', is_favorite: 1, is_archived: 0, created_at: '2026-07-23T10:00:00Z', category_name: 'Projects & Technical Specs', color: '#8B5CF6', folder_name: 'Project Architecture' },
      { id: 2, user_id: 1, category_id: 3, folder_id: null, title: 'Senior_Developer_Resume_2026.docx', file_name: 'Senior_Developer_Resume_2026.docx', description: 'Updated Senior Full Stack Engineer CV and portfolio.', file_path: '/uploads/resume.docx', file_size: 870400, mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', is_favorite: 1, is_archived: 0, created_at: '2026-07-23T08:30:00Z', category_name: 'Career & Employment Assets', color: '#F59E0B', folder_name: 'Unassigned' },
      { id: 3, user_id: 1, category_id: 1, folder_id: 3, title: 'Official_Passport_Scan_Copy.png', file_name: 'Official_Passport_Scan_Copy.png', description: 'High-res biometric passport scan for visa applications.', file_path: '/uploads/passport.png', file_size: 3407872, mime_type: 'image/png', is_favorite: 0, is_archived: 0, created_at: '2026-07-22T14:15:00Z', category_name: 'Personal Identity & Passports', color: '#FF6B00', folder_name: 'Passport & Identity' },
      { id: 4, user_id: 1, category_id: 2, folder_id: 1, title: 'Official_Academic_Marksheet_Degree.pdf', file_name: 'Official_Academic_Marksheet_Degree.pdf', description: 'Certified degree transcript and marksheet.', file_path: '/uploads/degree.pdf', file_size: 1843200, mime_type: 'application/pdf', is_favorite: 0, is_archived: 0, created_at: '2026-07-21T11:45:00Z', category_name: 'Academic Records & Diplomas', color: '#10B981', folder_name: 'Academic Transcripts' },
      { id: 5, user_id: 1, category_id: 5, folder_id: null, title: 'AWS_Solutions_Architect_Certificate.pdf', file_name: 'AWS_Solutions_Architect_Certificate.pdf', description: 'Cloud Solutions Architect certification badge.', file_path: '/uploads/aws_cert.pdf', file_size: 1258291, mime_type: 'application/pdf', is_favorite: 1, is_archived: 0, created_at: '2026-07-20T09:20:00Z', category_name: 'Certificates & Achievements', color: '#EC4899', folder_name: 'Unassigned' },
      { id: 6, user_id: 1, category_id: 6, folder_id: 2, title: 'Tax_Returns_Assessment_2026.pdf', file_name: 'Tax_Returns_Assessment_2026.pdf', description: 'Annual tax assessment receipts and income disclosures.', file_path: '/uploads/tax_2026.pdf', file_size: 943718, mime_type: 'application/pdf', is_favorite: 0, is_archived: 0, created_at: '2026-07-19T16:00:00Z', category_name: 'Client Requirements & Contracts', color: '#06B6D4', folder_name: 'Tax Filings 2026' }
    ];

    // Merge API and local docs, prioritizing uploaded local docs first
    let combinedDocs: DocumentItem[] = [];
    if (isApiSuccess && apiDocs.length > 0) {
      const apiIds = new Set(apiDocs.map(d => d.id));
      const extraLocal = localDocs.filter(d => !apiIds.has(d.id));
      combinedDocs = [...extraLocal, ...apiDocs];
    } else if (localDocs.length > 0) {
      combinedDocs = [...localDocs];
    } else {
      combinedDocs = [...sampleDocs];
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_user_documents', JSON.stringify(combinedDocs));
    }

    // Filter combined list
    let filtered = [...combinedDocs];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        (d.file_name && d.file_name.toLowerCase().includes(q))
      );
    }
    if (selectedCategory) {
      const catLower = selectedCategory.toLowerCase();
      filtered = filtered.filter(d => 
        String(d.category_id) === String(selectedCategory) ||
        (d.category_name && d.category_name.toLowerCase().includes(catLower)) ||
        (d.category_name && catLower.includes(d.category_name.toLowerCase()))
      );
    }
    if (selectedFolder) {
      filtered = filtered.filter(d => String(d.folder_id) === String(selectedFolder));
    }
    if (onlyFavorites) {
      filtered = filtered.filter(d => Boolean(d.is_favorite));
    }

    setDocuments(filtered);
    setTotalPages(Math.ceil(filtered.length / limit) || 1);
    setTotalCount(filtered.length);
    setLoading(false);
  };

  const handleToggleFavorite = async (doc: DocumentItem) => {
    const newFavState = doc.is_favorite ? 0 : 1;
    const willFavorite = newFavState === 1;

    // Optimistic UI update
    const updated = documents.map(d => d.id === doc.id ? { ...d, is_favorite: newFavState } : d);
    setDocuments(updated);

    // Save to localStorage so Favorites page picks it up immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_user_documents', JSON.stringify(updated));

      let currentFavs: any[] = [];
      try {
        const stored = localStorage.getItem('dms_favorites_list');
        if (stored) currentFavs = JSON.parse(stored);
      } catch (e) {}

      if (willFavorite) {
        const favObj = {
          id: doc.id,
          title: doc.title,
          file_name: doc.file_name || doc.title,
          category_name: doc.category_name,
          folder_name: doc.folder_name,
          file_size: doc.file_size,
          mime_type: doc.mime_type,
          is_favorite: 1,
          created_at: doc.created_at || new Date().toISOString()
        };
        if (!currentFavs.some(f => f.id === doc.id || f.title === doc.title)) {
          currentFavs.push(favObj);
        }
      } else {
        currentFavs = currentFavs.filter(f => f.id !== doc.id && f.title !== doc.title);
      }
      localStorage.setItem('dms_favorites_list', JSON.stringify(currentFavs));
    }

    showToast(willFavorite ? '⭐ Added to Favorites!' : 'Removed from Favorites');
    logActivity(willFavorite ? 'FAVORITE_ADD' : 'FAVORITE_REMOVE', doc.title, `${willFavorite ? 'Starred' : 'Unstarred'} document "${doc.title}"`);

    try {
      await api.patch(`/documents/${doc.id}/favorite`);
      await api.post(`/favorites/${doc.id}`).catch(() => null);
    } catch {
      // Keep optimistic state for client smooth UX
    }
  };

  const handleDownload = async (doc: DocumentItem) => {
    try {
      showToast(`Downloading ${doc.title}...`);
      logActivity('DOWNLOAD', doc.title, `Downloaded document "${doc.title}"`);
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('dms_token') : '';
      const envApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const baseUrl = envApiUrl.endsWith('/') ? envApiUrl.slice(0, -1) : envApiUrl;
      const rootUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
      
      const downloadUrl = `${rootUrl}/api/documents/${doc.id}/download${token ? `?token=${token}` : ''}`;
      window.location.assign(downloadUrl);
      
      showToast('Download initiated.');
    } catch (err) {
      showToast('Failed to initiate download.');
    }
  };

  const handleOpenModal = (doc: DocumentItem, type: 'details' | 'preview' | 'rename' | 'move' | 'delete' | 'edit') => {
    setSelectedDoc(doc);
    setActiveModal(type);
    setActionMenuOpen(null);
    if (type === 'rename') setEditTitle(doc.title);
    if (type === 'move') setEditFolderId(doc.folder_id ? String(doc.folder_id) : '');
    if (type === 'preview') logActivity('PREVIEW', doc.title, `Viewed document preview for "${doc.title}"`);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !editTitle.trim()) return;
    setSubmitting(true);
    const newTitle = editTitle.trim();
    const updated = documents.map(d => String(d.id) === String(selectedDoc.id) ? { ...d, title: newTitle } : d);
    setDocuments(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_user_documents', JSON.stringify(updated));
    }
    logActivity('RENAME', newTitle, `Renamed document "${selectedDoc.title}" to "${newTitle}"`);
    try {
      await api.patch(`/documents/${selectedDoc.id}/rename`, { title: newTitle }).catch(async () => {
        await api.put(`/documents/${selectedDoc.id}`, { title: newTitle }).catch(() => null);
      });
    } catch (err) {}
    showToast('Document renamed successfully!');
    setActiveModal(null);
    setSubmitting(false);
  };

  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    setSubmitting(true);
    const folderVal = editFolderId ? parseInt(editFolderId) : null;
    const folderObj = folders.find(f => String(f.id) === String(editFolderId));
    const folderName = folderObj ? folderObj.folder_name : 'Unassigned';
    const updated = documents.map(d => String(d.id) === String(selectedDoc.id) ? { 
      ...d, 
      folder_id: folderVal,
      folder_name: folderName
    } : d);
    setDocuments(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_user_documents', JSON.stringify(updated));
    }
    logActivity('MOVE', selectedDoc.title, `Moved document "${selectedDoc.title}" to folder "${folderName}"`);
    try {
      await api.patch(`/documents/${selectedDoc.id}/move`, { folder_id: folderVal }).catch(async () => {
        await api.put(`/documents/${selectedDoc.id}`, { folder_id: folderVal }).catch(() => null);
      });
    } catch (err) {}
    showToast('Document moved to folder successfully!');
    setActiveModal(null);
    setSubmitting(false);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedDoc) return;
    setSubmitting(true);
    const updated = documents.filter(d => String(d.id) !== String(selectedDoc.id));
    setDocuments(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_user_documents', JSON.stringify(updated));

      // Save soft-deleted item to trash storage so it appears in Recycle Bin
      let trashDocs: any[] = [];
      try {
        const storedTrash = localStorage.getItem('dms_trash_documents');
        if (storedTrash) trashDocs = JSON.parse(storedTrash);
      } catch (e) {}

      const trashedItem = {
        ...selectedDoc,
        is_archived: 1,
        created_at: new Date().toISOString()
      };
      const updatedTrash = [trashedItem, ...trashDocs.filter((t: any) => String(t.id) !== String(selectedDoc.id))];
      localStorage.setItem('dms_trash_documents', JSON.stringify(updatedTrash));
    }
    logActivity('DELETE', selectedDoc.title, `Moved document "${selectedDoc.title}" to Recycle Bin`);
    try {
      await api.delete(`/documents/${selectedDoc.id}`).catch(async () => {
        await api.patch(`/documents/${selectedDoc.id}/archive`).catch(() => null);
      });
    } catch (err) {}
    showToast('Document moved to Recycle Bin.');
    setActiveModal(null);
    setSubmitting(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setSelectedFolder('');
    setSelectedFileType('');
    setSelectedDateRange('');
    setSortBy('date_desc');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(debouncedSearch || selectedCategory || selectedFolder || selectedFileType || selectedDateRange);

  const formatFileSize = (bytes: number = 0) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return 'Recent';
    return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFileTypeLabel = (filename: string, mime: string) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || mime?.includes('pdf')) return 'PDF';
    if (ext === 'doc' || ext === 'docx' || mime?.includes('word')) return 'WORD';
    if (ext === 'xls' || ext === 'xlsx' || mime?.includes('sheet')) return 'EXCEL';
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) return 'IMAGE';
    return ext?.toUpperCase() || 'FILE';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-sm font-bold animate-pop-in ${
          toast.type === 'success' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <Link href="/user" className="hover:text-[#FF6B00] dark:hover:text-orange-400 transition flex items-center gap-1 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> {t('dashboard', 'Workspace')}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {isRecentMode ? t('recentDocuments', 'Recent Documents') : t('myDocuments', 'My Documents')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            {isRecentMode ? (
              <>
                <Clock className="w-6 h-6 text-[#FF6B00] dark:text-orange-400" /> {t('recentDocuments', 'Recent Documents')}
              </>
            ) : (
              <>
                <FileText className="w-6 h-6 text-[#FF6B00] dark:text-orange-400" /> {t('myDocuments', 'My Documents')}
              </>
            )}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isRecentMode 
              ? t('recentDocumentsSub', 'Showing your latest uploaded files and recent document activities sorted by date.') 
              : t('myDocumentsSub', 'Search, filter, preview and manage all your vaulted documents.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDocuments}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-sm"
            title={t('refresh', 'Refresh Documents')}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/user/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#FF6B00] via-[#F97316] to-[#EA580C] hover:brightness-110 rounded-xl shadow-lg shadow-orange-500/25 border border-orange-400/30 transition-all active-press hover:scale-105"
          >
            <Plus className="w-4 h-4" /> {t('uploadDocument', 'Upload Document')}
          </Link>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROL PANEL */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder={t('searchPlaceholder', 'Search by Title, File Name, Description, or Tags...')}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/20 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-sm transition-all flex items-center gap-1.5 font-bold ${
                viewMode === 'grid' ? 'bg-[#FF6B00] text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> {t('grid', 'Grid')}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-sm transition-all flex items-center gap-1.5 font-bold ${
                viewMode === 'list' ? 'bg-[#FF6B00] text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" /> {t('list', 'List')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('category', 'Category')}</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="">{t('allCategories', 'All Categories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.category_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('folder', 'Folder')}</label>
            <select
              value={selectedFolder}
              onChange={(e) => { setSelectedFolder(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="">{t('allFolders', 'All Folders')}</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>{f.folder_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('fileType', 'File Type')}</label>
            <select
              value={selectedFileType}
              onChange={(e) => { setSelectedFileType(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="">{t('allFileTypes', 'All File Types')}</option>
              <option value="pdf">📄 PDF Documents</option>
              <option value="word">📝 Word Documents</option>
              <option value="excel">📊 Excel Spreadsheets</option>
              <option value="image">🖼️ Images (PNG, JPG)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('uploadDate', 'Upload Date')}</label>
            <select
              value={selectedDateRange}
              onChange={(e) => { setSelectedDateRange(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="">{t('allTime', 'All Time')}</option>
              <option value="today">{t('today', 'Today')}</option>
              <option value="7days">{t('past7Days', 'Past 7 Days')}</option>
              <option value="30days">{t('past30Days', 'Past 30 Days')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('sortBy', 'Sort By')}</label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="date_desc">{t('sortByNewest', 'Date (Newest)')}</option>
              <option value="date_asc">{t('sortByOldest', 'Date (Oldest)')}</option>
              <option value="name_asc">{t('sortByName', 'Name (A-Z)')}</option>
              <option value="name_desc">{t('sortByNameDesc', 'Name (Z-A)')}</option>
              <option value="size_desc">{t('sortBySize', 'Size (Largest)')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="date_desc">Date (Newest)</option>
              <option value="date_asc">Date (Oldest)</option>
              <option value="name_asc">Name (A–Z)</option>
              <option value="size_desc">Size (Largest)</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-sm">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Filters:</span>
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950 text-[#FF6B00] dark:text-orange-400 border border-orange-200 dark:border-orange-900/60 text-xs font-semibold">
                Search: &quot;{debouncedSearch}&quot;
                <button onClick={() => { setSearchQuery(''); setDebouncedSearch(''); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={handleClearFilters} className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline ml-auto flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Results View */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 sm:p-16 text-center space-y-3 shadow-xl">
          <Loader2 className="w-8 h-8 text-[#FF6B00] dark:text-orange-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 sm:p-16 text-center space-y-4 shadow-xl">
          <Search className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No matching documents found.</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or uploading a new file.
          </p>
          <Link
            href="/user/upload"
            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-[#FF6B00] hover:bg-[#E05E00] px-4 py-2 rounded-xl transition"
          >
            <Plus className="w-4 h-4" /> Upload New Document
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#FF6B00]/50 p-5 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4 relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#FF6B00] dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/60 font-bold text-sm">
                  {getFileTypeLabel(doc.file_name, doc.mime_type)}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFavorite(doc)}
                    className={`p-1.5 rounded-lg transition ${doc.is_favorite ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' : 'text-slate-400 hover:text-amber-500'}`}
                  >
                    <Star className={`w-4 h-4 ${doc.is_favorite ? 'fill-amber-400' : ''}`} />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === doc.id ? null : doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {actionMenuOpen === doc.id && (
                      <div className="absolute right-0 top-8 z-40 w-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl py-1 text-sm text-slate-700 dark:text-slate-300 space-y-0.5 backdrop-blur-xl">
                        <button onClick={() => handleOpenModal(doc, 'preview')} className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2">
                          <Eye className="w-3.5 h-3.5 text-[#FF6B00] dark:text-orange-400" /> Preview File
                        </button>
                        <button onClick={() => handleDownload(doc)} className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2">
                          <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Download
                        </button>
                        <button onClick={() => handleOpenModal(doc, 'rename')} className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2">
                          <Edit2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Rename
                        </button>
                        <button onClick={() => handleOpenModal(doc, 'move')} className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2">
                          <FolderInput className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Move Folder
                        </button>
                        <div className="border-t border-slate-200 dark:border-slate-800 my-1" />
                        <button onClick={() => handleOpenModal(doc, 'delete')} className="w-full px-3.5 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center gap-2 font-medium">
                          <Trash2 className="w-3.5 h-3.5" /> Move to Recycle Bin
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-[#FF6B00] dark:group-hover:text-orange-400 transition-colors truncate">
                  {doc.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                  {doc.description || doc.file_name}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {getFileTypeLabel(doc.file_name, doc.mime_type)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-orange-50 dark:bg-orange-950/60 text-[#FF6B00] dark:text-orange-400 border border-orange-200 dark:border-orange-900/60">
                    {doc.category_name || 'Category'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>{formatFileSize(doc.file_size)}</span>
                <span>{formatDate(doc.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0b1120] text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3.5 px-5">Document Title</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Category / Folder</th>
                  <th className="py-3.5 px-5">Size</th>
                  <th className="py-3.5 px-5">Upload Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold text-sm">
                          {getFileTypeLabel(doc.file_name, doc.mime_type)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {doc.title}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">{doc.file_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        {getFileTypeLabel(doc.file_name, doc.mime_type)}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: doc.color && doc.color !== '#3B82F6' ? doc.color : '#FF6B00' }} />
                        {doc.category_name || 'Category'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-500 dark:text-slate-400 font-mono text-xs">
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td className="py-4 px-5 text-slate-400 text-sm">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleFavorite(doc)}
                          className={`p-1.5 rounded-lg transition ${doc.is_favorite ? 'text-amber-400 bg-amber-950/60' : 'text-slate-400 hover:text-amber-400'}`}
                        >
                          <Star className={`w-4 h-4 ${doc.is_favorite ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button onClick={() => handleOpenModal(doc, 'preview')} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 transition">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDownload(doc)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 transition">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenModal(doc, 'delete')} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {activeModal === 'rename' && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#111827] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Rename Document</h3>
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0b1120] border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#FF6B00]"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-semibold text-slate-400">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:brightness-110 rounded-xl shadow-lg shadow-orange-500/25">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOVE MODAL */}
      {activeModal === 'move' && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#111827] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Move Document to Folder</h3>
            <form onSubmit={handleMoveSubmit} className="space-y-4">
              <select
                value={editFolderId}
                onChange={(e) => setEditFolderId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0b1120] border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="">(No specific folder)</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.folder_name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-semibold text-slate-400">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:brightness-110 rounded-xl shadow-lg shadow-orange-500/25">
                  Move Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {activeModal === 'delete' && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#111827] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Move to Recycle Bin?</h3>
            <p className="text-sm text-slate-400">
              Are you sure you want to move <strong className="text-white">&quot;{selectedDoc.title}&quot;</strong> to the Recycle Bin? You can restore it anytime.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-semibold text-slate-400">Cancel</button>
              <button onClick={handleDeleteSubmit} disabled={submitting} className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30">
                Move to Bin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {activeModal === 'preview' && selectedDoc && (
        <DocumentPreviewModal
          document={selectedDoc}
          onClose={() => setActiveModal(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
