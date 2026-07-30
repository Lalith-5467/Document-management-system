'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Star, Search, Download, Eye, LayoutGrid, List,
  ArrowLeft, CheckCircle2, AlertCircle, Loader2, HardDrive,
  FolderClosed, FileText, X, RefreshCw, FileImage, FileSpreadsheet,
  FileCode, File, MoreHorizontal, Filter, Clock, ChevronLeft, ChevronRight,
  Zap, Shield, Sparkles, TrendingUp, Calendar, User, Trash2, ArrowUpRight,
  Folder, Check, Package
} from 'lucide-react';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export interface FavoriteDocument {
  id: number;
  user_id?: number;
  category_id?: number;
  folder_id?: number | null;
  title: string;
  description?: string;
  tags?: string;
  file_name: string;
  file_path?: string;
  file_size: number;
  mime_type: string;
  file_extension?: string;
  is_favorite: number | boolean;
  created_at: string;
  author_name?: string;
  category_name?: string;
  folder_name?: string;
}

// Color badges for Categories
function getCategoryBadge(category?: string) {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('client') || cat.includes('requirement')) {
    return 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50';
  }
  if (cat.includes('career') || cat.includes('employment') || cat.includes('resume')) {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50';
  }
  if (cat.includes('business') || cat.includes('report') || cat.includes('academic')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50';
  }
  if (cat.includes('project') || cat.includes('specs') || cat.includes('tech')) {
    return 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50';
  }
  if (cat.includes('personal') || cat.includes('identity') || cat.includes('passport')) {
    return 'bg-purple-50 text-purple-600 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50';
  }
  if (cat.includes('certificate') || cat.includes('achievement')) {
    return 'bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/50';
  }
  if (cat.includes('archive') || cat.includes('zip')) {
    return 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50';
  }
  return 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50';
}

// File extension pill styling
function getExtensionBadge(ext: string, mime?: string) {
  const cleanExt = (ext || '').toUpperCase().replace('.', '');
  if (cleanExt === 'PDF' || mime?.includes('pdf')) {
    return { label: 'PDF', bg: 'bg-[#EF4444] text-white' };
  }
  if (cleanExt === 'DOCX' || cleanExt === 'DOC' || mime?.includes('word')) {
    return { label: 'DOCX', bg: 'bg-[#FF6B00] text-white' };
  }
  if (cleanExt === 'XLSX' || cleanExt === 'XLS' || mime?.includes('excel') || mime?.includes('spreadsheet')) {
    return { label: 'XLSX', bg: 'bg-[#10B981] text-white' };
  }
  if (cleanExt === 'PPTX' || cleanExt === 'PPT' || mime?.includes('presentation') || mime?.includes('powerpoint')) {
    return { label: 'PPTX', bg: 'bg-[#F97316] text-white' };
  }
  if (cleanExt === 'PNG' || cleanExt === 'JPG' || cleanExt === 'JPEG' || mime?.startsWith('image/')) {
    return { label: cleanExt || 'PNG', bg: 'bg-[#8B5CF6] text-white' };
  }
  if (cleanExt === 'ZIP' || cleanExt === 'RAR' || cleanExt === '7Z' || mime?.includes('zip')) {
    return { label: 'ZIP', bg: 'bg-[#6B7280] text-white' };
  }
  return { label: cleanExt || 'FILE', bg: 'bg-[#FF6B00] text-white' };
}

// Custom visual thumbnail preview based on document type
function FilePreviewThumbnail({ doc }: { doc: FavoriteDocument }) {
  const ext = (doc.file_extension || doc.file_name.split('.').pop() || '').toUpperCase();
  const title = doc.title.toLowerCase();

  if (ext === 'PDF' || doc.mime_type?.includes('pdf')) {
    if (title.includes('aws') || title.includes('amazon')) {
      return (
        <div className="w-full h-32 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-md font-black text-sm">
            aws
          </div>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-2">CERTIFIED</span>
        </div>
      );
    }
    return (
      <div className="w-full h-32 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
        <div className="w-12 h-14 bg-white dark:bg-[#19102E] rounded-lg shadow-sm border border-rose-200 dark:border-rose-800/60 flex flex-col items-center justify-center p-2 relative">
          <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs">
            &
          </div>
          <div className="w-8 h-1 bg-rose-200 dark:bg-rose-800 rounded mt-2"></div>
          <div className="w-6 h-1 bg-rose-100 dark:bg-rose-900 rounded mt-1"></div>
        </div>
      </div>
    );
  }

  if (ext === 'DOCX' || ext === 'DOC' || doc.mime_type?.includes('word')) {
    return (
      <div className="w-full h-32 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
        <div className="w-12 h-14 bg-white dark:bg-[#19102E] rounded-lg shadow-sm border border-blue-200 dark:border-blue-800/60 flex flex-col items-center justify-center p-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
            W
          </div>
          <div className="w-8 h-1 bg-blue-200 dark:bg-blue-800 rounded mt-2"></div>
        </div>
      </div>
    );
  }

  if (ext === 'XLSX' || ext === 'XLS' || doc.mime_type?.includes('excel') || doc.mime_type?.includes('spreadsheet')) {
    return (
      <div className="w-full h-32 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
        <div className="w-12 h-14 bg-white dark:bg-[#19102E] rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-800/60 flex flex-col items-center justify-center p-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
            X
          </div>
          <div className="w-8 h-1 bg-emerald-200 dark:bg-emerald-800 rounded mt-2"></div>
        </div>
      </div>
    );
  }

  if (ext === 'PPTX' || ext === 'PPT' || doc.mime_type?.includes('powerpoint')) {
    return (
      <div className="w-full h-32 rounded-2xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
        <div className="w-12 h-14 bg-white dark:bg-[#19102E] rounded-lg shadow-sm border border-orange-200 dark:border-orange-800/60 flex flex-col items-center justify-center p-2">
          <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-sm">
            P
          </div>
          <div className="w-8 h-1 bg-orange-200 dark:bg-orange-800 rounded mt-2"></div>
        </div>
      </div>
    );
  }

  if (ext === 'PNG' || ext === 'JPG' || ext === 'JPEG' || doc.mime_type?.startsWith('image/')) {
    if (title.includes('passport') || title.includes('identity')) {
      return (
        <div className="w-full h-32 rounded-2xl bg-[#1E1235] p-3 flex flex-col justify-between relative overflow-hidden border border-purple-900/50 shadow-inner group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-xs text-purple-200 font-bold">
            <span>PASSPORT</span>
            <span>OFFICIAL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-10 rounded bg-purple-800/80 border border-purple-500/40 flex items-center justify-center text-white text-[9px] font-bold">
              ID
            </div>
            <div className="space-y-1">
              <div className="w-16 h-1 bg-purple-400/60 rounded"></div>
              <div className="w-12 h-1 bg-purple-400/40 rounded"></div>
            </div>
          </div>
          <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-amber-400 rounded"></div>
        </div>
      );
    }
    return (
      <div className="w-full h-32 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
        <div className="w-full h-full bg-gradient-to-tr from-purple-600/20 to-blue-500/20 flex items-center justify-center p-4">
          <FileImage className="w-10 h-10 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
    );
  }

  if (ext === 'ZIP' || ext === 'RAR' || doc.mime_type?.includes('zip')) {
    return (
      <div className="w-full h-32 rounded-2xl bg-purple-500/10 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/40 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
        <div className="w-12 h-14 bg-purple-600 text-white rounded-xl shadow-md flex flex-col items-center justify-center relative">
          <div className="w-3 h-8 border-r-2 border-dashed border-white/60 mb-1"></div>
          <span className="text-[9px] font-black tracking-widest">ZIP</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-32 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
      <FileText className="w-8 h-8 text-[#FF6B00]" />
    </div>
  );
}

// Sample Default Favorite Documents matching reference image exact mockup
const DEFAULT_FAVORITE_DOCS: FavoriteDocument[] = [
  {
    id: 1,
    title: 'Project Proposal.pdf',
    file_name: 'Project Proposal.pdf',
    description: 'Client technical requirement specifications and budget projection proposal.',
    category_name: 'Client Requirements',
    file_size: 3.4 * 1024 * 1024,
    mime_type: 'application/pdf',
    file_extension: 'PDF',
    is_favorite: 1,
    created_at: '2026-07-24T10:00:00Z',
    author_name: 'Joe'
  },
  {
    id: 2,
    title: 'Senior_Developer_Resume.docx',
    file_name: 'Senior_Developer_Resume.docx',
    description: 'Updated CV and software engineering portfolio document.',
    category_name: 'Career & Employment',
    file_size: 850 * 1024,
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_extension: 'DOCX',
    is_favorite: 1,
    created_at: '2026-07-23T14:30:00Z',
    author_name: 'Joe'
  },
  {
    id: 3,
    title: 'Monthly_Report_July.xlsx',
    file_name: 'Monthly_Report_July.xlsx',
    description: 'Q3 financial report and departmental performance metrics spreadsheet.',
    category_name: 'Business Reports',
    file_size: 2.6 * 1024 * 1024,
    mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    file_extension: 'XLSX',
    is_favorite: 1,
    created_at: '2026-07-22T09:15:00Z',
    author_name: 'Joe'
  },
  {
    id: 4,
    title: 'Software_Architecture.pptx',
    file_name: 'Software_Architecture.pptx',
    description: 'Microservices diagram and cloud vault system architecture deck.',
    category_name: 'Projects & Technical Specs',
    file_size: 4.7 * 1024 * 1024,
    mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    file_extension: 'PPTX',
    is_favorite: 1,
    created_at: '2026-07-21T11:20:00Z',
    author_name: 'Joe'
  },
  {
    id: 5,
    title: 'Passport_Scan_Copy.png',
    file_name: 'Passport_Scan_Copy.png',
    description: 'Official national identity passport scan for visa verification.',
    category_name: 'Personal Identity',
    file_size: 1.2 * 1024 * 1024,
    mime_type: 'image/png',
    file_extension: 'PNG',
    is_favorite: 1,
    created_at: '2026-07-20T19:30:00Z',
    author_name: 'Joe'
  },
  {
    id: 6,
    title: 'AWS_Solutions_Architect.pdf',
    file_name: 'AWS_Solutions_Architect.pdf',
    description: 'Certified AWS Solutions Architect professional credential badge certificate.',
    category_name: 'Certificates & Achievements',
    file_size: 1.8 * 1024 * 1024,
    mime_type: 'application/pdf',
    file_extension: 'PDF',
    is_favorite: 1,
    created_at: '2026-07-19T17:40:00Z',
    author_name: 'Joe'
  },
  {
    id: 7,
    title: 'Project_Architecture.jpg',
    file_name: 'Project_Architecture.jpg',
    description: 'Database schema diagram and system cloud topology diagram picture.',
    category_name: 'Projects',
    file_size: 2.1 * 1024 * 1024,
    mime_type: 'image/jpeg',
    file_extension: 'JPG',
    is_favorite: 1,
    created_at: '2026-07-18T08:10:00Z',
    author_name: 'Joe'
  },
  {
    id: 8,
    title: 'Project_Files_Archive.zip',
    file_name: 'Project_Files_Archive.zip',
    description: 'Compressed source code package and document asset repository backup.',
    category_name: 'Archives',
    file_size: 12.4 * 1024 * 1024,
    mime_type: 'application/zip',
    file_extension: 'ZIP',
    is_favorite: 1,
    created_at: '2026-07-17T15:00:00Z',
    author_name: 'Joe'
  }
];

export default function FavoritesPage() {
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<FavoriteDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [selectedDoc, setSelectedDoc] = useState<FavoriteDocument | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    let combined: FavoriteDocument[] = [];

    // Source 1: API /favorites
    try {
      const res = await api.get('/favorites');
      const apiFavs = res.data?.favorites || (Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(apiFavs) && apiFavs.length > 0) {
        combined = [...combined, ...apiFavs];
      }
    } catch (err) {}

    // Source 2: API /documents?is_favorite=1
    try {
      const res2 = await api.get('/documents', { params: { is_favorite: 1, limit: 100 } });
      const docs = res2.data?.documents || (Array.isArray(res2.data) ? res2.data : []);
      const favDocs = docs.filter((d: any) => Number(d.is_favorite) === 1 || d.is_favorite === true);
      combined = [...combined, ...favDocs];
    } catch (err2) {}

    // Source 3: localStorage 'dms_favorites_list'
    if (typeof window !== 'undefined') {
      try {
        const storedFavs = localStorage.getItem('dms_favorites_list');
        if (storedFavs) {
          const parsed = JSON.parse(storedFavs);
          if (Array.isArray(parsed) && parsed.length > 0) combined = [...combined, ...parsed];
        }
      } catch (e) {}

      // Source 4: localStorage 'dms_user_documents'
      try {
        const userDocs = localStorage.getItem('dms_user_documents');
        if (userDocs) {
          const parsed = JSON.parse(userDocs);
          if (Array.isArray(parsed)) {
            const favs = parsed.filter(d => Number(d.is_favorite) === 1 || d.is_favorite === true).map(d => ({
              id: d.id,
              title: d.title || d.name,
              file_name: d.file_name || d.title || d.name,
              category_name: d.category_name || d.category,
              folder_name: d.folder_name || d.folder,
              file_size: typeof d.file_size === 'number' ? d.file_size : 1024 * 1024,
              mime_type: d.mime_type || 'application/pdf',
              is_favorite: 1,
              created_at: d.created_at || new Date().toISOString(),
              author_name: 'Joe'
            }));
            combined = [...combined, ...favs];
          }
        }
      } catch (e) {}
    }

    // Always fallback to sample documents if combined is empty
    if (combined.length === 0) {
      combined = DEFAULT_FAVORITE_DOCS;
    }

    // Deduplicate by ID & Title
    const uniqueMap = new Map<string, FavoriteDocument>();
    combined.forEach(item => {
      const key = `${item.id}-${item.title || item.file_name}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    setFavorites(Array.from(uniqueMap.values()));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Filter & Sort Logic
  const filteredFavorites = useMemo(() => {
    let result = [...favorites];

    // Search query filter
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      result = result.filter(d =>
        d.title?.toLowerCase().includes(term) ||
        d.description?.toLowerCase().includes(term) ||
        d.category_name?.toLowerCase().includes(term) ||
        d.file_name?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(d => d.category_name?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // File Type filter
    if (selectedFileType !== 'all') {
      result = result.filter(d => {
        const ext = (d.file_extension || d.file_name.split('.').pop() || '').toLowerCase();
        if (selectedFileType === 'pdf') return ext === 'pdf' || d.mime_type?.includes('pdf');
        if (selectedFileType === 'docx') return ext === 'docx' || ext === 'doc' || d.mime_type?.includes('word');
        if (selectedFileType === 'xlsx') return ext === 'xlsx' || ext === 'xls' || d.mime_type?.includes('excel');
        if (selectedFileType === 'pptx') return ext === 'pptx' || ext === 'ppt' || d.mime_type?.includes('powerpoint');
        if (selectedFileType === 'image') return ext === 'png' || ext === 'jpg' || ext === 'jpeg' || d.mime_type?.startsWith('image/');
        if (selectedFileType === 'zip') return ext === 'zip' || ext === 'rar' || d.mime_type?.includes('zip');
        return true;
      });
    }

    // Sort By
    result.sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'name_asc') return a.title.localeCompare(b.title);
      if (sortBy === 'size_desc') return b.file_size - a.file_size;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // 'newest'
    });

    return result;
  }, [favorites, searchQuery, selectedCategory, selectedFileType, sortBy]);

  // Paginated Results
  const totalCount = filteredFavorites.length;
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFavorites.slice(start, start + itemsPerPage);
  }, [filteredFavorites, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedFileType('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleRemoveFavorite = async () => {
    if (!selectedDoc) return;
    setActionLoading(true);
    const docId = selectedDoc.id;
    const docTitle = selectedDoc.title;

    setFavorites(prev => prev.filter(d => d.id !== docId && d.title !== docTitle));

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dms_favorites_list');
        if (stored) {
          const parsed = JSON.parse(stored);
          const filtered = parsed.filter((f: any) => f.id !== docId && f.title !== docTitle);
          localStorage.setItem('dms_favorites_list', JSON.stringify(filtered));
        }
      } catch (e) {}

      try {
        const storedDocs = localStorage.getItem('dms_user_documents');
        if (storedDocs) {
          const parsed = JSON.parse(storedDocs);
          const updated = parsed.map((d: any) => (d.id === docId || d.title === docTitle) ? { ...d, is_favorite: 0 } : d);
          localStorage.setItem('dms_user_documents', JSON.stringify(updated));
        }
      } catch (e) {}
    }

    showToast('Removed from favorites.');

    try {
      await api.patch(`/documents/${docId}/favorite`, { is_favorite: 0 });
      await api.delete(`/favorites/${docId}`).catch(() => null);
    } catch {
      // Optimistic update retained
    } finally {
      setActionLoading(false);
      setShowRemoveModal(false);
      setSelectedDoc(null);
    }
  };

  const handleDownload = (doc: FavoriteDocument) => {
    showToast(`Downloading ${doc.title}...`);
    const link = document.createElement('a');
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    link.href = doc.file_path?.startsWith('http') ? doc.file_path : `${base}/${doc.file_path || ''}`;
    link.download = doc.file_name || doc.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const categoriesCount = new Set(favorites.map(f => f.category_name).filter(Boolean)).size || 8;
  const totalBytes = favorites.reduce((acc, curr) => acc + (curr.file_size || 0), 0) || 12.8 * 1024 * 1024 * 1024;

  return (
    <div className="space-y-6 pb-12 relative min-h-screen" style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold transition-all animate-pop-in ${
          toast.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl dark:bg-slate-900 dark:border-slate-800 dark:text-white'
        }`}>
          {toast.type === 'error'
            ? <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            : <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1235] dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center shadow-xs border border-amber-200 shrink-0">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </span>
            {t('favoriteDocuments', 'Favorite Documents')}
          </h1>
          <p className="text-sm text-[#7B7393] dark:text-[#A39BB8] mt-1 font-medium">
            {t('favoriteSub', 'Manage and quickly access your most important documents.')}
          </p>
        </div>
      </div>

      {/* 4 SUMMARY STATISTIC CARDS WITH SPARKLINE CHARTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Favorite Files */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-900/40 text-[#FF6B00] dark:text-orange-400 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-orange-400/40" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              +12% vs last mo
            </span>
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('favoriteFiles', 'Favorite Files')}</p>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{favorites.length || 38}</h3>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold">{t('myDocuments', 'Documents')}</span>
            </div>
          </div>
          {/* Sparkline Graph */}
          <div className="w-full h-8 pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" fill="none">
              <path d="M0 18 Q 15 5, 30 14 T 60 8 T 90 12 L 100 4" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 2: Categories */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-900/40 text-[#FF6B00] dark:text-orange-400 flex items-center justify-center shrink-0">
              <FolderClosed className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#FF6B00] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-900">
              Active
            </span>
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#7B7393] dark:text-[#A39BB8] uppercase tracking-wider">{t('categoriesCount', 'Categories')}</p>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-3xl font-black text-[#1E1235] dark:text-white">{categoriesCount}</h3>
              <span className="text-sm text-[#7B7393] dark:text-[#A39BB8] font-semibold">{t('categories', 'Categories')}</span>
            </div>
          </div>
          {/* Sparkline Graph */}
          <div className="w-full h-8 pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" fill="none">
              <path d="M0 12 Q 20 20, 40 8 T 70 16 T 100 6" stroke="#8075E5" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 3: Storage Used */}
        <div className="bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] p-5 rounded-3xl shadow-[0_8px_30px_rgb(108,92,231,0.04)] flex flex-col justify-between space-y-4 hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              68% Limit
            </span>
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#7B7393] dark:text-[#A39BB8] uppercase tracking-wider">Storage Used</p>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-3xl font-black text-[#1E1235] dark:text-white">12.8 GB</h3>
              <span className="text-sm text-[#7B7393] dark:text-[#A39BB8] font-semibold">of 100 GB</span>
            </div>
          </div>
          {/* Sparkline Graph */}
          <div className="w-full h-8 pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" fill="none">
              <path d="M0 16 Q 25 4, 50 14 T 80 6 T 100 10" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 4: Last Updated */}
        <div className="bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] p-5 rounded-3xl shadow-[0_8px_30px_rgb(108,92,231,0.04)] flex flex-col justify-between space-y-4 hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/40 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
              Live Sync
            </span>
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#7B7393] dark:text-[#A39BB8] uppercase tracking-wider">Last Updated</p>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-3xl font-black text-[#1E1235] dark:text-white">Today</h3>
              <span className="text-sm text-[#7B7393] dark:text-[#A39BB8] font-semibold">10:45 AM</span>
            </div>
          </div>
          {/* Sparkline Graph */}
          <div className="w-full h-8 pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" fill="none">
              <path d="M0 10 Q 30 18, 50 6 T 80 14 T 100 4" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR BAR */}
      <div className="bg-white dark:bg-[#19102E] p-3.5 sm:p-4 rounded-3xl border border-[#EAE4F8] dark:border-[#2D1F47] shadow-[0_6px_24px_rgba(108,92,231,0.06)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search favorites..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B00] transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="all">All Categories</option>
            <option value="Client Requirements">Client Requirements</option>
            <option value="Career & Employment">Career & Employment</option>
            <option value="Business Reports">Business Reports</option>
            <option value="Projects & Technical Specs">Projects & Technical Specs</option>
            <option value="Personal Identity">Personal Identity</option>
            <option value="Certificates & Achievements">Certificates & Achievements</option>
            <option value="Archives">Archives</option>
          </select>

          {/* File Type Dropdown Filter */}
          <select
            value={selectedFileType}
            onChange={(e) => { setSelectedFileType(e.target.value); setCurrentPage(1); }}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="all">All File Types</option>
            <option value="pdf">PDF Documents</option>
            <option value="docx">Word (DOCX)</option>
            <option value="xlsx">Excel (XLSX)</option>
            <option value="pptx">PowerPoint (PPTX)</option>
            <option value="image">Images (PNG/JPG)</option>
            <option value="zip">ZIP Archives</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="newest">Sort By: Newest</option>
            <option value="oldest">Sort By: Oldest</option>
            <option value="name_asc">Sort By: Name A-Z</option>
            <option value="size_desc">Sort By: File Size</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid / List Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-sm font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl text-sm font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 dark:hover:bg-orange-950/40 transition text-sm font-bold flex items-center gap-1.5"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* 3-COLUMN MAIN LAYOUT: CENTER CONTENT + RIGHT SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* CENTER / MAIN CONTENT AREA (Span 3 cols on XL) */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] p-4 rounded-3xl space-y-3.5 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-5 skeleton-box"></div>
                    <div className="w-6 h-6 rounded-full skeleton-box"></div>
                  </div>
                  <div className="w-full h-32 skeleton-box"></div>
                  <div className="space-y-2">
                    <div className="w-3/4 h-4 skeleton-box"></div>
                    <div className="w-1/2 h-3 skeleton-box"></div>
                  </div>
                  <div className="pt-2 border-t border-[#F3F0FA] dark:border-[#2D1F47] flex justify-between items-center">
                    <div className="w-16 h-3 skeleton-box"></div>
                    <div className="w-12 h-4 skeleton-box"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedDocs.length === 0 ? (
            <div className="bg-white dark:bg-[#19102E] rounded-3xl border border-[#EAE4F8] dark:border-[#2D1F47] p-16 text-center space-y-4 shadow-[0_6px_24px_rgba(108,92,231,0.06)]">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#1E1235] dark:text-white">
                  No matching favorite documents found.
                </h3>
                <p className="text-sm text-[#7B7393] max-w-sm mx-auto mt-1 leading-relaxed">
                  Try adjusting your search query, category, or file type filter.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white text-sm font-extrabold shadow-md shadow-orange-500/25 hover:scale-105 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* DOCUMENT GRID (2 Cols on Tablet, 3-4 Cols on XL Desktop) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {paginatedDocs.map((doc) => {
                const extInfo = getExtensionBadge(doc.file_extension || doc.file_name.split('.').pop() || '', doc.mime_type);
                const catBadgeClass = getCategoryBadge(doc.category_name);

                return (
                  <div
                    key={doc.id}
                    className="bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] hover:border-[#6D28D9]/40 p-4 rounded-3xl space-y-3.5 card-hover-subtle group flex flex-col justify-between relative"
                  >
                    {/* Top Row: File Extension Badge Left + Gold Star Right */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-2xs ${extInfo.bg}`}>
                        {extInfo.label}
                      </span>
                      <button
                        onClick={() => { setSelectedDoc(doc); setShowRemoveModal(true); }}
                        className="p-1 text-amber-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                        title="Remove from favorites"
                      >
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      </button>
                    </div>

                    {/* File Thumbnail Preview Graphic */}
                    <FilePreviewThumbnail doc={doc} />

                    {/* Document Info */}
                    <div className="space-y-1.5 pt-1">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#FF6B00] dark:group-hover:text-orange-400 transition-colors truncate leading-snug" title={doc.title}>
                        {doc.title}
                      </h3>

                      {/* Category Pill */}
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${catBadgeClass}`}>
                          {doc.category_name || 'Uncategorized'}
                        </span>
                      </div>

                      {/* Date & Author */}
                      <p className="text-xs text-[#7B7393] dark:text-[#A39BB8] font-medium truncate pt-0.5">
                        {new Date(doc.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • By {doc.author_name || 'Joe'}
                      </p>
                    </div>

                    {/* Footer Row: File Size + Actions */}
                    <div className="pt-2 border-t border-[#F3F0FA] dark:border-[#2D1F47] flex items-center justify-between text-sm">
                      <span className="text-[#7B7393] dark:text-[#A39BB8] font-mono text-xs font-semibold">
                        {formatBytes(doc.file_size)}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl transition"
                          title="Download File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setSelectedDoc(doc); setShowRemoveModal(true); }}
                          className="p-1.5 text-[#7B7393] hover:text-[#1E1235] dark:hover:text-white hover:bg-[#F3F0FA] dark:hover:bg-[#1F143A] rounded-xl transition"
                          title="More options"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW TABLE */
            <div className="bg-white dark:bg-[#19102E] border border-[#EAE4F8] dark:border-[#2D1F47] rounded-3xl shadow-[0_6px_24px_rgba(108,92,231,0.06)] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F3F0FA] dark:bg-[#1F143A] text-[#7B7393] dark:text-[#A39BB8] text-xs uppercase tracking-wider font-extrabold border-b border-[#EAE4F8] dark:border-[#2D1F47]">
                    <th className="py-3.5 px-5">Document</th>
                    <th className="py-3.5 px-5">Category</th>
                    <th className="py-3.5 px-5">Date & Author</th>
                    <th className="py-3.5 px-5">Size</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F0FA] dark:divide-[#2D1F47] text-sm">
                  {paginatedDocs.map((doc) => {
                    const extInfo = getExtensionBadge(doc.file_extension || doc.file_name.split('.').pop() || '', doc.mime_type);
                    const catBadgeClass = getCategoryBadge(doc.category_name);

                    return (
                      <tr key={doc.id} className="hover:bg-[#F9F7FE] dark:hover:bg-[#261845] transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${extInfo.bg}`}>
                              {extInfo.label}
                            </span>
                            <div>
                              <span className="font-extrabold text-[#1E1235] dark:text-white block truncate max-w-[220px]">{doc.title}</span>
                              <span className="text-xs text-[#7B7393] truncate">{doc.file_name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${catBadgeClass}`}>
                            {doc.category_name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-[#7B7393] text-xs">
                          {new Date(doc.created_at).toLocaleDateString()} • By {doc.author_name || 'Joe'}
                        </td>
                        <td className="py-3.5 px-5 text-[#7B7393] font-mono text-xs">{formatBytes(doc.file_size)}</td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDownload(doc)}
                              className="p-1.5 text-[#7B7393] hover:text-[#6D28D9] hover:bg-[#F3F0FA] dark:hover:bg-[#1F143A] rounded-xl transition"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelectedDoc(doc); setShowRemoveModal(true); }}
                              className="p-1.5 text-amber-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
                              title="Remove"
                            >
                              <Star className="w-4 h-4 fill-amber-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          <div className="bg-white dark:bg-[#19102E] p-4 rounded-3xl border border-[#EAE4F8] dark:border-[#2D1F47] shadow-[0_6px_24px_rgba(108,92,231,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <span className="text-[#7B7393] dark:text-[#A39BB8] font-medium">
              Showing <strong className="text-[#1E1235] dark:text-white">1 to {paginatedDocs.length}</strong> of <strong className="text-[#1E1235] dark:text-white">{totalCount}</strong> results
            </span>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-[#EAE4F8] dark:border-[#2D1F47] text-[#7B7393] hover:text-[#6D28D9] hover:bg-[#F3F0FA] dark:hover:bg-[#1F143A] disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[1, 2, 3, 4, 5, '...', 8].map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={page === '...'}
                  className={`w-8 h-8 rounded-xl text-sm font-black transition-all ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-md shadow-orange-500/25 scale-105'
                      : page === '...'
                      ? 'text-slate-400 cursor-default'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage * itemsPerPage >= totalCount}
                className="p-2 rounded-xl border border-[#EAE4F8] dark:border-[#2D1F47] text-[#7B7393] hover:text-[#6D28D9] hover:bg-[#F3F0FA] dark:hover:bg-[#1F143A] disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Show per page dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[#7B7393] dark:text-[#A39BB8] font-medium">Show</span>
              <select
                value={itemsPerPage}
                onChange={() => {}}
                className="px-2.5 py-1.5 bg-[#F3F0FA] dark:bg-[#1F143A] border border-[#EAE4F8] dark:border-[#2D1F47] rounded-xl text-sm text-[#1E1235] dark:text-white font-bold"
              >
                <option value={8}>8</option>
                <option value={16}>16</option>
                <option value={24}>24</option>
              </select>
              <span className="text-[#7B7393] dark:text-[#A39BB8] font-medium">per page</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR PANEL */}
        <div className="space-y-6">
          {/* 1. Storage Usage Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5 text-center">
            <h3 className="text-base font-black text-slate-900 dark:text-white text-left">Storage Usage</h3>

            {/* Circular Progress Ring */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-orange-100 dark:text-orange-950"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#FF6B00]"
                  strokeDasharray="68, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">68%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Used</span>
              </div>
            </div>

            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              68 GB <span className="text-slate-500 font-medium">of 100 GB Used</span>
            </p>

            <button className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:brightness-110 text-white text-sm font-black shadow-lg shadow-orange-500/25 hover:scale-[1.02] transition flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 fill-white" /> Upgrade Storage
            </button>
          </div>

          {/* 2. Recent Activity Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Recent Activity</h3>
              <Link href="/user/activity" className="text-xs font-extrabold text-[#FF6B00] dark:text-orange-400 hover:underline">
                View All
              </Link>
            </div>

            {/* Activity Timeline List */}
            <div className="space-y-4 pt-1">
              {/* Item 1 */}
              <div>
                <p className="text-xs font-extrabold uppercase text-[#7B7393] dark:text-[#A39BB8] tracking-wider mb-2">Today</p>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    PDF
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-[#1E1235] dark:text-white truncate">Resume.pdf</p>
                    <p className="text-xs text-[#7B7393]">Added to favorites</p>
                  </div>
                  <span className="text-xs text-[#7B7393] font-mono">10:45 AM</span>
                </div>
              </div>

              {/* Item 2 */}
              <div>
                <p className="text-xs font-extrabold uppercase text-[#7B7393] dark:text-[#A39BB8] tracking-wider mb-2">Yesterday</p>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    PNG
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-[#1E1235] dark:text-white truncate">Passport_Scan_Copy.png</p>
                    <p className="text-xs text-[#7B7393]">Added to favorites</p>
                  </div>
                  <span className="text-xs text-[#7B7393] font-mono">07:30 PM</span>
                </div>
              </div>

              {/* Item 3 */}
              <div>
                <p className="text-xs font-extrabold uppercase text-[#7B7393] dark:text-[#A39BB8] tracking-wider mb-2">2 Days Ago</p>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    XLS
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-[#1E1235] dark:text-white truncate">Monthly_Report_July.xlsx</p>
                    <p className="text-xs text-[#7B7393]">Added to favorites</p>
                  </div>
                  <span className="text-xs text-[#7B7393] font-mono">09:15 AM</span>
                </div>
              </div>

              {/* Item 4 */}
              <div>
                <p className="text-xs font-extrabold uppercase text-[#7B7393] dark:text-[#A39BB8] tracking-wider mb-2">3 Days Ago</p>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    PPT
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-[#1E1235] dark:text-white truncate">Software_Architecture.pptx</p>
                    <p className="text-xs text-[#7B7393]">Added to favorites</p>
                  </div>
                  <span className="text-xs text-[#7B7393] font-mono">11:20 AM</span>
                </div>
              </div>

              {/* Item 5 */}
              <div>
                <p className="text-xs font-extrabold uppercase text-[#7B7393] dark:text-[#A39BB8] tracking-wider mb-2">4 Days Ago</p>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    PDF
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-[#1E1235] dark:text-white truncate">AWS_Certificate.pdf</p>
                    <p className="text-xs text-[#7B7393]">Added to favorites</p>
                  </div>
                  <span className="text-xs text-[#7B7393] font-mono">05:40 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Need More Storage Banner Card */}
          <div className="bg-gradient-to-br from-[#FF6B00] via-[#F97316] to-[#EA580C] p-6 rounded-3xl text-white shadow-xl shadow-orange-500/20 relative overflow-hidden flex flex-col justify-between space-y-4">
            <div className="space-y-2 relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black tracking-wider uppercase backdrop-blur-md">
                Pro Plan Feature
              </span>
              <h4 className="text-lg font-black tracking-tight leading-snug">Need More Storage?</h4>
              <p className="text-sm text-orange-100 leading-relaxed font-medium">
                Upgrade your plan to store more documents securely with 100ms lightning retrieval.
              </p>
            </div>

            <div className="relative z-10 pt-2 flex items-center justify-between gap-3">
              <button className="px-5 py-2.5 rounded-2xl bg-white text-[#FF6B00] hover:bg-orange-50 text-sm font-black shadow-md hover:scale-105 transition">
                Upgrade Now
              </button>
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
                <Package className="w-6 h-6" />
              </div>
            </div>

            {/* Subtle background glow */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* REMOVE FROM FAVORITES CONFIRMATION MODAL */}
      {showRemoveModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1235]/60 backdrop-blur-md animate-pop-in">
          <div className="bg-white dark:bg-[#19102E] rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-[#6D28D9]/20 border border-[#EAE4F8] dark:border-[#2D1F47] space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1E1235] dark:text-white">Remove from Favorites?</h3>
                <p className="text-sm text-[#7B7393] dark:text-[#A39BB8]">This will unstar the document</p>
              </div>
            </div>
            <p className="text-sm text-[#7B7393] dark:text-[#A39BB8] leading-relaxed">
              Are you sure you want to remove{' '}
              <strong className="text-[#1E1235] dark:text-white">&quot;{selectedDoc.title}&quot;</strong>{' '}
              from your favorite documents? You can easily re-add it at any time.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#EAE4F8] dark:border-[#2D1F47]">
              <button
                onClick={() => { setShowRemoveModal(false); setSelectedDoc(null); }}
                className="px-4 py-2.5 rounded-2xl border border-[#EAE4F8] dark:border-[#2D1F47] text-[#7B7393] dark:text-[#A39BB8] font-bold hover:bg-[#F3F0FA] dark:hover:bg-[#1F143A] transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveFavorite}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-md shadow-rose-600/20 hover:scale-105 transition flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
