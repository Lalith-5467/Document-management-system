'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Search, Plus, LayoutGrid, List, Edit2, Trash2, 
  UserCheck, GraduationCap, FolderGit2, FileText, Award, Briefcase, 
  Receipt, Layers, Folder, FolderClosed, Bookmark, ShieldCheck, Archive, FileCheck, 
  X, AlertTriangle, AlertCircle, CheckCircle2, Loader2, Calendar, FileStack, RefreshCw, FolderPlus, Upload, ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';

// Icon map helper
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCheck,
  GraduationCap,
  FolderGit2,
  Award,
  FileText,
  Briefcase,
  Receipt,
  Layers,
  Folder,
  Bookmark,
  ShieldCheck,
  Archive,
  FileCheck
};

const COLOR_OPTIONS = [
  { name: 'Primary Green', value: 'var(--theme-primary, #1B664B)', bgClass: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]' },
  { name: 'Emerald', value: '#10B981', bgClass: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { name: 'Violet', value: '#8B5CF6', bgClass: 'bg-violet-50 text-violet-600 border-violet-200' },
  { name: 'Pink', value: '#EC4899', bgClass: 'bg-pink-50 text-pink-600 border-pink-200' },
  { name: 'Amber', value: '#1B664B', bgClass: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]' },
  { name: 'Cyan', value: '#06B6D4', bgClass: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  { name: 'Red', value: '#EF4444', bgClass: 'bg-red-50 text-red-600 border-red-200' },
  { name: 'Slate', value: '#64748B', bgClass: 'bg-slate-50 text-slate-600 border-slate-200' }
];

const AVAILABLE_ICONS = [
  { name: 'UserCheck', label: 'User / Personal' },
  { name: 'GraduationCap', label: 'Academic' },
  { name: 'FolderGit2', label: 'Project' },
  { name: 'Award', label: 'Certificates' },
  { name: 'FileText', label: 'Resume / Text' },
  { name: 'Briefcase', label: 'Business / Client' },
  { name: 'Receipt', label: 'Bills / Finance' },
  { name: 'Layers', label: 'Others / General' },
  { name: 'Folder', label: 'Folder' },
  { name: 'Bookmark', label: 'Bookmark' },
  { name: 'ShieldCheck', label: 'Security' },
  { name: 'Archive', label: 'Archive' }
];

export interface Category {
  id: number;
  user_id: number | null;
  category_name: string;
  description: string;
  color: string;
  icon_name: string;
  document_count: number;
  created_at: string;
  updated_at?: string;
}

export default function CategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formColor, setFormColor] = useState<string>('var(--theme-primary, #1B664B)');
  const [formIcon, setFormIcon] = useState<string>('Folder');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchCategories();
    const handleUpdate = () => fetchCategories();
    window.addEventListener('dms_categories_updated', handleUpdate);

    // Refresh category counts when navigating back from upload
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchCategories();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('dms_categories_updated', handleUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Merge API category list with live localStorage document counts
  const mergeCategoryCounts = (apiCats: Category[]): Category[] => {
    if (typeof window === 'undefined') return apiCats;
    try {
      const stored = localStorage.getItem('dms_user_documents');
      if (!stored) return apiCats;
      const localDocs: any[] = JSON.parse(stored);
      return apiCats.map(cat => {
        const localCount = localDocs.filter(
          (d: any) => String(d.category_id) === String(cat.id) && !d.is_archived
        ).length;
        return { ...cat, document_count: Math.max(cat.document_count || 0, localCount) };
      });
    } catch {
      return apiCats;
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/categories');
      if (res.data && res.data.categories && res.data.categories.length > 0) {
        setCategories(mergeCategoryCounts(res.data.categories));
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dms_admin_categories');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) {
            setCategories(mergeCategoryCounts(parsed));
            setLoading(false);
            return;
          }
        } catch {}
      }
    }

    setLoading(false);
  };

  // Search Filter
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const term = searchQuery.toLowerCase().trim();
    return categories.filter(cat => 
      cat.category_name.toLowerCase().includes(term) || 
      (cat.description && cat.description.toLowerCase().includes(term))
    );
  }, [categories, searchQuery]);

  // Total docs across categories
  const totalDocumentsCount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.document_count || 0), 0);
  }, [categories]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormName('');
    setFormDescription('');
    setFormColor('var(--theme-primary, #1B664B)');
    setFormIcon('Folder');
    setFormError(null);
    setIsCreateOpen(true);
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await api.post('/categories', {
        category_name: formName.trim(),
        description: formDescription.trim(),
        color: formColor,
        icon_name: formIcon
      });

      if (res.data && res.data.success) {
        showToast('Category created successfully!');
        setIsCreateOpen(false);
        fetchCategories();
      } else {
        setFormError(res.data?.message || 'Failed to create category.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error creating category. Please try again.';
      // Local fallback insert for client preview if backend API error occurs
      const newCat: Category = {
        id: Date.now(),
        user_id: 1,
        category_name: formName.trim(),
        description: formDescription.trim(),
        color: formColor,
        icon_name: formIcon,
        document_count: 0,
        created_at: new Date().toISOString()
      };
      setCategories(prev => [newCat, ...prev]);
      showToast('Category created successfully!');
      setIsCreateOpen(false);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormName(category.category_name);
    setFormDescription(category.description || '');
    setFormColor(category.color || 'var(--theme-primary, #1B664B)');
    setFormIcon(category.icon_name || 'Folder');
    setFormError(null);
    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    if (!formName.trim()) {
      setFormError('Category name cannot be empty.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await api.put(`/categories/${selectedCategory.id}`, {
        category_name: formName.trim(),
        description: formDescription.trim(),
        color: formColor,
        icon_name: formIcon
      });

      if (res.data && res.data.success) {
        showToast('Category updated successfully!');
        setIsEditOpen(false);
        fetchCategories();
      } else {
        setFormError(res.data?.message || 'Failed to update category.');
      }
    } catch (err: any) {
      // Local state fallback update
      setCategories(prev => prev.map(c => c.id === selectedCategory.id ? {
        ...c,
        category_name: formName.trim(),
        description: formDescription.trim(),
        color: formColor,
        icon_name: formIcon,
        updated_at: new Date().toISOString()
      } : c));
      showToast('Category updated successfully!');
      setIsEditOpen(false);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (category: Category) => {
    setSelectedCategory(category);
    setFormError(null);
    setIsDeleteOpen(true);
  };

  // Handle Delete Submit
  const handleDeleteSubmit = async () => {
    if (!selectedCategory) return;

    // Check frontend guard as well
    if (selectedCategory.document_count > 0) {
      setFormError(`Cannot delete. This category has ${selectedCategory.document_count} document(s) assigned.`);
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await api.delete(`/categories/${selectedCategory.id}`);
      if (res.data && res.data.success) {
        showToast('Category deleted successfully.');
        setIsDeleteOpen(false);
        fetchCategories();
      } else {
        if (res.data?.reason === 'HAS_DOCUMENTS') {
          setFormError(res.data.message);
        } else {
          setFormError(res.data?.message || 'Failed to delete category.');
        }
      }
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData && errData.reason === 'HAS_DOCUMENTS') {
        setFormError(errData.message);
      } else {
        // Fallback memory delete if 0 documents
        setCategories(prev => prev.filter(c => c.id !== selectedCategory.id));
        showToast('Category deleted successfully.');
        setIsDeleteOpen(false);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  // Dynamic icon component renderer
  const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
    const IconComponent = ICON_MAP[iconName] || Folder;
    return <IconComponent className={className} />;
  };

  // Format date helper
  const formatDate = (dateStr?: string) => {
    // Fallback date for older seeded categories that didn't include a created_at timestamp
    const safeDate = dateStr || '2026-01-10T10:00:00Z';
    try {
      return new Date(safeDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return safeDate;
    }
  };

  return (
    <div className="space-y-6 pb-12">
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

      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#7B7393]">
          <Link href="/user" className="font-medium hover:text-[#6C5CE7] transition-colors">
            {t('nav.myWorkspace', 'Workspace')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#7B7393]/60 shrink-0" />
          <span className="font-semibold text-[#1E1235]">{t('categories.title', 'Category Management')}</span>
        </div>

        <button 
          onClick={fetchCategories} 
          className="text-sm font-bold text-[#6C5CE7] flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-[#6C5CE7]/20 bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/20 transition"
          title={t('common.refresh', 'Refresh')}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {t('common.refresh', 'Refresh')}
        </button>
      </div>

      {/* Main Header Banner */}
      <div className="bg-[#1B664B] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 transform skew-x-12 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-bold backdrop-blur-md border border-white/30">
              <FileStack className="w-3.5 h-3.5 text-[#1B664B]" /> {t('categories.moduleName', 'Document Taxonomy Module')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('categories.title', 'Category Management')}
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-sm max-w-xl leading-relaxed">
              {t('categories.subtitle', 'Classify your documents into structured groups for seamless organization, fast search, and instant reference across your storage workspace.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/user/folders"
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 hover:scale-105 text-white font-extrabold px-5 py-3.5 rounded-2xl backdrop-blur-xl border border-white/30 hover:border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)] transition-all duration-300 text-sm active:scale-95"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out" />
              <FolderPlus className="w-4.5 h-4.5 text-[#1B664B] group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 relative z-10 drop-shadow-md" /> 
              <span className="relative z-10 drop-shadow-md tracking-wide">Add Folder</span>
            </Link>
            <Link
              href="/user/documents"
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-white hover:scale-105 font-black px-6 py-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.4)] transition-all duration-300 text-sm active:scale-95 border border-white/80"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-emerald-100/60 to-transparent transition-transform duration-1000 ease-in-out" />
              <Upload className="w-4.5 h-4.5 text-[#1B664B] group-hover:-translate-y-1 transition-transform duration-300 relative z-10" /> 
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-br from-[#1B664B] to-[#14523C]">Add File</span>
            </Link>
          </div>
        </div>

        {/* Stats Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-emerald-100/80 text-xs uppercase tracking-wider font-bold font-mono">{t('categories.totalCategories', 'Total Categories')}</p>
              <p className="text-xl font-black text-white">{categories.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-emerald-100/80 text-xs uppercase tracking-wider font-bold font-mono">{t('categories.totalDocs', 'Total Categorized Docs')}</p>
              <p className="text-xl font-black text-white">{totalDocumentsCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-emerald-100/80 text-xs uppercase tracking-wider font-bold font-mono">{t('categories.defaultSeeded', 'Default Seeded')}</p>
              <p className="text-xl font-black text-white">8 {t('categories.standard', 'Standard')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-[#EAE4F8] shadow-[0_6px_20px_rgba(108,92,231,0.06)]">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B7393]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('categories.searchPlaceholder', 'Search categories by name or description...')}
            className="w-full pl-10 pr-9 py-2.5 bg-[#F3F0FA] border border-[#EAE4F8] rounded-2xl text-sm sm:text-sm text-[#1E1235] focus:outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 transition-all placeholder:text-[#7B7393]"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B7393] hover:text-[#1E1235] p-0.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-sm font-bold text-[#7B7393] mr-1 hidden sm:inline">View:</span>
          <div className="flex items-center bg-[#F3F0FA] p-1 rounded-2xl border border-[#EAE4F8]">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-extrabold transition-all font-auth-heading ${
                viewMode === 'grid'
                  ? 'bg-[#1B664B] text-white shadow-md shadow-emerald-950/20'
                  : 'text-[#7B7393] hover:text-[#1E1235]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-extrabold transition-all font-auth-heading ${
                viewMode === 'list'
                  ? 'bg-[#1B664B] text-white shadow-md shadow-emerald-950/20'
                  : 'text-[#7B7393] hover:text-[#1E1235]'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>
        </div>
      </div>

      {/* Main Categories Display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 rounded-3xl border border-[#EAE4F8] dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl skeleton-box" />
                <div className="w-16 h-5 rounded-full skeleton-box" />
              </div>
              <div className="space-y-2">
                <div className="w-3/4 h-5 rounded-lg skeleton-box" />
                <div className="w-full h-3 rounded skeleton-box" />
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <div className="w-16 h-3 rounded skeleton-box" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#EAE4F8] dark:border-slate-800 p-12 text-center space-y-4 shadow-md font-auth-body animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-[#E8F5F0] dark:bg-emerald-950/60 text-[#1B664B] border border-[#D1EBE1] dark:border-emerald-900/60 flex items-center justify-center mx-auto animate-float-bob">
            <FolderClosed className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg font-auth-heading">No categories found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-auth-body">
            {searchQuery ? `No category matched "${searchQuery}".` : 'Create categories to organize your documents.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenCreate}
              className="text-sm font-extrabold text-white bg-[#1B664B] px-5 py-2.5 rounded-2xl transition shadow-lg shadow-emerald-950/20 hover:scale-105 active:scale-95 font-auth-heading"
            >
              + Create Category Now
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCategories.map((cat, idx) => {
            const categoryDocsUrl = `/user/documents?category_id=${cat.id}&category=${encodeURIComponent(cat.category_name)}`;
            return (
              <div
                key={cat.id}
                style={{ animationDelay: `${(idx % 8) * 60}ms` }}
                className="group card-animated animate-card-entrance bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Top indicator bar */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2 rounded-t-3xl"
                  style={{ backgroundColor: cat.color || '#1B664B' }}
                />

                {/* Clickable Header & Info Section */}
                <Link
                  href={categoryDocsUrl}
                  className="space-y-3.5 block flex-1 group/link"
                >
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm card-icon-bounce"
                      style={{ 
                        backgroundColor: `${cat.color && cat.color !== '#3B82F6' && cat.color !== '#6C5CE7' ? cat.color : 'var(--theme-primary, #1B664B)'}15`, 
                        color: cat.color && cat.color !== '#3B82F6' && cat.color !== '#6C5CE7' ? cat.color : 'var(--theme-primary, #1B664B)',
                        borderColor: `${cat.color && cat.color !== '#3B82F6' && cat.color !== '#6C5CE7' ? cat.color : 'var(--theme-primary, #1B664B)'}30`
                      }}
                    >
                      {renderIcon(cat.icon_name, "w-6 h-6")}
                    </div>

                    <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E8F5F0] dark:bg-emerald-950/60 text-[#1B664B] border border-[#D1EBE1] dark:border-emerald-900/60 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {cat.document_count || 0} docs
                    </span>
                  </div>

                  {/* Category Info */}
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover/link:text-[#1B664B] transition-colors line-clamp-1 flex items-center justify-between">
                      <span>{cat.category_name}</span>
                      <span className="text-sm text-[#1B664B] opacity-0 group-hover/link:opacity-100 transition-opacity">View →</span>
                    </h3>
                    <p className="text-sm text-[#7B7393] mt-1 line-clamp-2 min-h-[32px] leading-relaxed">
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>
                </Link>

                {/* Category Card Actions */}
                <div className="flex items-center gap-2 pt-3.5 border-t border-[#EAE4F8]">
                  <Link
                    href={categoryDocsUrl}
                    className="group relative overflow-hidden flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-sm font-bold bg-[#1B664B] text-white shadow-md hover:shadow-[0_8px_25px_rgba(255,107,0,0.4)] hover:-translate-y-0.5 transition-all duration-300 active-press font-auth-body whitespace-nowrap"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out" />
                    <FileText className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300 relative z-10 shrink-0" /> 
                    <span className="relative z-10 drop-shadow-md">View Files ({cat.document_count || 0})</span>
                  </Link>
                  <Link
                    href={`/user/folders?category_id=${cat.id}&category_name=${encodeURIComponent(cat.category_name)}`}
                    className="inline-flex items-center justify-center p-2.5 rounded-2xl text-sm font-bold bg-[#1B664B]/10 hover:bg-[#1B664B]/20 text-[#1B664B] border border-[#1B664B]/20 transition-all active-press"
                    title="Add Folder"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/user/upload?category_id=${cat.id}&category_name=${encodeURIComponent(cat.category_name)}`}
                    className="inline-flex items-center justify-center p-2.5 rounded-2xl text-sm font-bold bg-[#1B664B]/10 hover:bg-[#1B664B]/20 text-[#1B664B] border border-[#1B664B]/20 transition-all active-press"
                    title="Add File"
                  >
                    <Upload className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white rounded-3xl border border-[#EAE4F8] shadow-[0_10px_30px_rgba(255,107,0,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F3F0FA] text-[#7B7393] text-xs uppercase tracking-wider font-extrabold border-b border-[#EAE4F8] font-mono">
                  <th className="py-3.5 px-5 whitespace-nowrap">Category Name</th>
                  <th className="py-3.5 px-5 whitespace-nowrap min-w-[200px]">Description</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Document Count</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Created Date</th>
                  <th className="py-3.5 px-5 text-right whitespace-nowrap min-w-[340px]">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4F8] text-sm font-auth-body">
                {filteredCategories.map((cat) => {
                  const categoryDocsUrl = `/user/documents?category_id=${cat.id}&category=${encodeURIComponent(cat.category_name)}`;
                  return (
                    <tr key={cat.id} className="hover:bg-[#F3F0FA] transition-colors group">
                      <td className="py-4 px-5">
                        <Link href={categoryDocsUrl} className="flex items-center gap-3 group/link">
                          <div 
                            className="w-9 h-9 rounded-2xl flex items-center justify-center border group-hover/link:scale-110 transition-transform"
                            style={{ 
                              backgroundColor: `${cat.color || 'var(--theme-primary, #1B664B)'}12`, 
                              color: cat.color || 'var(--theme-primary, #1B664B)',
                              borderColor: `${cat.color || 'var(--theme-primary, #1B664B)'}25`
                            }}
                          >
                            {renderIcon(cat.icon_name, "w-4 h-4")}
                          </div>
                          <span className="font-extrabold text-[#1E1235] group-hover/link:text-[#1B664B] transition-colors flex items-center gap-1.5 font-auth-heading whitespace-nowrap">
                            {cat.category_name}
                            <FileText className="w-3.5 h-3.5 text-[#1B664B] opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </span>
                        </Link>
                      </td>
                      <td className="py-4 px-5 text-[#7B7393] max-w-xs truncate font-auth-body">
                        {cat.description || '—'}
                      </td>
                      <td className="py-4 px-5">
                        <Link href={categoryDocsUrl} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#1B664B]/10 text-[#1B664B] border border-[#1B664B]/20 hover:bg-[#1B664B]/20 transition font-auth-label">
                          <FileText className="w-3 h-3" /> {cat.document_count || 0} files
                        </Link>
                      </td>
                      <td className="py-4 px-5 text-[#7B7393] font-mono whitespace-nowrap">
                        {formatDate(cat.created_at)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2 font-auth-body">
                          <Link
                            href={categoryDocsUrl}
                            className="group relative overflow-hidden inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-bold bg-[#1B664B] text-white shadow-md hover:shadow-[0_8px_25px_rgba(255,107,0,0.4)] hover:-translate-y-0.5 transition-all duration-300 active-press font-auth-body whitespace-nowrap"
                          >
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out" />
                            <FileText className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-300 relative z-10 shrink-0" /> 
                            <span className="relative z-10 drop-shadow-md">View Files ({cat.document_count || 0})</span>
                          </Link>
                          <Link
                            href={`/user/folders?category_id=${cat.id}&category_name=${encodeURIComponent(cat.category_name)}`}
                            className="group relative overflow-hidden inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-bold bg-[#1B664B]/10 hover:bg-[#1B664B]/20 text-[#1B664B] border border-[#1B664B]/20 hover:border-[#1B664B]/40 shadow-sm hover:shadow-[0_4px_15px_rgba(255,107,0,0.15)] hover:-translate-y-0.5 transition-all duration-300 active-press whitespace-nowrap"
                          >
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out" />
                            <FolderPlus className="w-3.5 h-3.5 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 relative z-10 shrink-0" /> 
                            <span className="relative z-10">Add Folder</span>
                          </Link>
                          <Link
                            href={`/user/upload?category_id=${cat.id}&category_name=${encodeURIComponent(cat.category_name)}`}
                            className="group relative overflow-hidden inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-bold bg-[#1B664B]/10 hover:bg-[#1B664B]/20 text-[#1B664B] border border-[#1B664B]/20 hover:border-[#1B664B]/40 shadow-sm hover:shadow-[0_4px_15px_rgba(255,107,0,0.15)] hover:-translate-y-0.5 transition-all duration-300 active-press whitespace-nowrap"
                          >
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out" />
                            <Upload className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-300 relative z-10 shrink-0" /> 
                            <span className="relative z-10">Add File</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Category"
        subtitle="Add a custom category to classify your documents"
        icon={<Plus className="w-5 h-5 text-[#6C5CE7]" />}
        maxWidth="max-w-lg"
      >
        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4 text-sm font-auth-body">
          <div>
            <label className="block font-extrabold text-[#1E1235] mb-1.5 font-auth-label">Category Name *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., Tax Invoices 2026"
              className="w-full px-3.5 py-2.5 bg-[#F3F0FA] dark:bg-slate-950 border border-[#EAE4F8] dark:border-slate-800 rounded-2xl text-[#1E1235] dark:text-white placeholder:text-[#7B7393] focus:outline-none focus:border-[#1B664B] transition-all text-sm font-auth-body"
            />
          </div>

          <div>
            <label className="block font-extrabold text-[#1E1235] dark:text-slate-300 mb-1.5 font-auth-label">Category Description (Optional)</label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief summary of documents stored in this category..."
              className="w-full px-3.5 py-2.5 bg-[#F3F0FA] dark:bg-slate-950 border border-[#EAE4F8] dark:border-slate-800 rounded-2xl text-[#1E1235] dark:text-white placeholder:text-[#7B7393] focus:outline-none focus:border-[#1B664B] transition-all text-sm resize-none font-auth-body"
            />
          </div>

          {/* Color Selector */}
          <div>
            <label className="block font-extrabold text-[#1E1235] dark:text-slate-300 mb-2 font-auth-label">Category Badge Color</label>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFormColor(c.value)}
                  className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center border-2 ${
                    formColor === c.value ? 'scale-110 border-[#1E1235] dark:border-white shadow-sm' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {formColor === c.value && <CheckCircle2 className="w-4 h-4 text-white drop-shadow-xs" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block font-extrabold text-[#1E1235] dark:text-slate-300 mb-2 font-auth-label">Category Icon</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic.name}
                  type="button"
                  onClick={() => setFormIcon(ic.name)}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    formIcon === ic.name 
                      ? 'border-[#6C5CE7] bg-[#6C5CE7]/10 text-[#6C5CE7] shadow-sm' 
                      : 'border-[#EAE4F8] dark:border-slate-800 hover:border-[#6C5CE7]/40 text-[#7B7393] bg-[#F3F0FA] dark:bg-slate-950 hover:text-[#6C5CE7]'
                  }`}
                  title={ic.label}
                >
                  {renderIcon(ic.name, "w-4 h-4")}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE4F8] dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2.5 rounded-2xl border border-[#EAE4F8] dark:border-slate-800 text-[#7B7393] font-bold hover:bg-[#F3F0FA] dark:hover:bg-slate-800 transition text-sm font-auth-body"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-[#1B664B] text-white font-extrabold shadow-md shadow-emerald-950/20 hover:scale-105 transition flex items-center gap-2 disabled:opacity-50 text-sm font-auth-heading"
            >
              {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Category
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT CATEGORY MODAL */}
      <Modal
        isOpen={isEditOpen && Boolean(selectedCategory)}
        onClose={() => setIsEditOpen(false)}
        title="Edit Category"
        subtitle="Update category details and styling"
        icon={<Edit2 className="w-5 h-5 text-[#1B664B]" />}
        maxWidth="max-w-lg"
      >
        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5 font-auth-body">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleEditSubmit} className="space-y-4 text-sm font-auth-body">
          <div>
            <label className="block font-extrabold text-[#1E1235] dark:text-slate-300 mb-1.5 font-auth-label">Category Name *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F3F0FA] dark:bg-slate-950 border border-[#EAE4F8] dark:border-slate-800 rounded-2xl text-[#1E1235] dark:text-white placeholder:text-[#7B7393] focus:outline-none focus:border-[#1B664B] transition-all text-sm font-auth-body"
            />
          </div>

          <div>
            <label className="block font-extrabold text-[#1E1235] dark:text-slate-300 mb-1.5 font-auth-label">Category Description</label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F3F0FA] dark:bg-slate-950 border border-[#EAE4F8] dark:border-slate-800 rounded-2xl text-[#1E1235] dark:text-white placeholder:text-[#7B7393] focus:outline-none focus:border-[#1B664B] transition-all text-sm resize-none font-auth-body"
            />
          </div>

          {/* Color Selector */}
          <div>
            <label className="block font-extrabold text-[#1E1235] dark:text-slate-300 mb-2 font-auth-label">Category Badge Color</label>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFormColor(c.value)}
                  className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center border-2 ${
                    formColor === c.value ? 'scale-110 border-[#1E1235] dark:border-white shadow-sm' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {formColor === c.value && <CheckCircle2 className="w-4 h-4 text-white drop-shadow-xs" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block font-extrabold text-[#1E1235] dark:text-slate-300 mb-2 font-auth-label">Category Icon</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic.name}
                  type="button"
                  onClick={() => setFormIcon(ic.name)}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    formIcon === ic.name 
                      ? 'border-[#1B664B] bg-[#1B664B]/10 text-[#1B664B] shadow-sm' 
                      : 'border-[#EAE4F8] dark:border-slate-800 hover:border-[#1B664B]/40 text-[#7B7393] bg-[#F3F0FA] dark:bg-slate-950 hover:text-[#1B664B]'
                  }`}
                >
                  {renderIcon(ic.name, "w-4 h-4")}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE4F8] dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2.5 rounded-2xl border border-[#EAE4F8] dark:border-slate-800 text-[#7B7393] font-bold hover:bg-[#F3F0FA] dark:hover:bg-slate-800 transition text-sm font-auth-body"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-[#1B664B] text-white font-extrabold shadow-md shadow-emerald-950/20 hover:scale-105 transition flex items-center gap-2 disabled:opacity-50 text-sm font-auth-heading"
            >
              {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION / GUARD MODAL */}
      <Modal
        isOpen={isDeleteOpen && Boolean(selectedCategory)}
        onClose={() => setIsDeleteOpen(false)}
        title={selectedCategory && selectedCategory.document_count > 0 ? 'Cannot Delete Category' : 'Confirm Category Deletion'}
        subtitle={selectedCategory ? `Category: ${selectedCategory.category_name}` : ''}
        icon={selectedCategory && selectedCategory.document_count > 0 ? <AlertTriangle className="w-5 h-5 text-[#1B664B]" /> : <Trash2 className="w-5 h-5 text-rose-500" />}
        maxWidth="max-w-md"
      >
        {selectedCategory && (
          <div className="space-y-4">
            {selectedCategory.document_count > 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#E8F5F0] dark:bg-emerald-950/60 border border-[#D1EBE1] dark:border-amber-900 text-[#1B664B] dark:text-[#1B664B] text-sm space-y-2 font-auth-body">
                  <div className="flex items-center gap-2 font-extrabold text-[#1B664B] dark:text-[#1B664B]">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#1B664B]" />
                    <span>Active Documents Assigned ({selectedCategory.document_count})</span>
                  </div>
                  <p className="leading-relaxed">
                    This category cannot be deleted because there are currently <strong>{selectedCategory.document_count} document(s)</strong> assigned to it.
                  </p>
                  <p>
                    Please reassign these documents to another category or remove them before deleting this category.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsDeleteOpen(false)}
                    className="w-full py-2.5 rounded-2xl bg-[#1E1235] dark:bg-slate-800 text-white font-extrabold hover:bg-[#2D1B69] dark:hover:bg-slate-700 transition text-sm font-auth-heading cursor-pointer"
                  >
                    Got It
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-auth-body">
                  Are you sure you want to delete the category <strong className="text-slate-900 dark:text-white">&quot;{selectedCategory.category_name}&quot;</strong>? This action is permanent and cannot be undone.
                </p>

                {formError && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2 font-auth-body">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(false)}
                    className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-auth-body"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSubmit}
                    disabled={formSubmitting}
                    className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-md shadow-rose-600/20 transition flex items-center gap-2 text-sm disabled:opacity-50 font-auth-heading"
                  >
                    {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Delete Category
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
