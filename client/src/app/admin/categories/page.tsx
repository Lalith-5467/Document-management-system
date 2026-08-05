'use client';

import React, { useState, useEffect } from 'react';
import {
  Tags, Plus, Edit2, Trash2, X, CheckCircle2, AlertCircle, Loader2, RefreshCw, Folder, Layers, FileText
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal States
  const [selectedCat, setSelectedCat] = useState<any | null>(null);
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | 'delete' | null>(null);

  // Form Fields
  const [catName, setCatName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [color, setColor] = useState<string>('var(--theme-primary, #FF6B00)');
  const [iconName, setIconName] = useState<string>('Folder');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const saveCatsState = (updated: any[]) => {
    setCategories(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_admin_categories', JSON.stringify(updated));
      window.dispatchEvent(new Event('dms_categories_updated'));
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    let saved = null;
    if (typeof window !== 'undefined') {
      saved = localStorage.getItem('dms_admin_categories');
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setCategories(parsed);
          setLoading(false);
          return;
        }
      } catch {}
    }

    try {
      const res = await api.get('/admin/categories');
      if (res.data?.success && res.data.categories?.length > 0) {
        saveCatsState(res.data.categories);
        setLoading(false);
        return;
      }
    } catch { /* fallback below */ }

    const initialCats = [
      { id: 1, category_name: 'Personal Identity & Passports', description: 'National IDs, Passports, Visas, Driver Licenses, Birth Certificates', color: 'var(--theme-primary, #FF6B00)', icon_name: 'UserCheck', document_count: 5, created_at: '2026-01-10T10:00:00Z' },
      { id: 2, category_name: 'Academic Records & Diplomas', description: 'Degrees, Transcripts, Semester Marksheets, Diplomas, Board Certificates', color: '#10B981', icon_name: 'GraduationCap', document_count: 6, created_at: '2026-01-12T10:00:00Z' },
      { id: 3, category_name: 'Career & Employment Assets', description: 'Resume versions, CVs, Offer & Relieving Letters, Pay Slips, Portfolios', color: '#F59E0B', icon_name: 'FileText', document_count: 4, created_at: '2026-01-15T10:00:00Z' },
      { id: 4, category_name: 'Projects & Technical Specs', description: 'BRDs, Architecture Diagrams, Code Specs, Technical Proposals', color: '#8B5CF6', icon_name: 'FolderGit2', document_count: 3, created_at: '2026-01-18T10:00:00Z' },
      { id: 5, category_name: 'Certificates & Achievements', description: 'Professional Certifications, Cloud Credentials, Training Badges', color: '#EC4899', icon_name: 'Award', document_count: 2, created_at: '2026-01-20T10:00:00Z' },
      { id: 6, category_name: 'Client Requirements & Contracts', description: 'Client BRDs, SOW Agreements, NDAs, Service Contracts', color: '#06B6D4', icon_name: 'Briefcase', document_count: 3, created_at: '2026-01-22T10:00:00Z' },
      { id: 7, category_name: 'Bills, Taxes & Invoices', description: 'Tax Return Filings, Utility Invoices, Bank Statements, Subscriptions', color: '#EF4444', icon_name: 'Receipt', document_count: 4, created_at: '2026-01-25T10:00:00Z' },
      { id: 8, category_name: 'Legal & Property Documents', description: 'Property Deeds, Lease Agreements, Insurance Policies, Legal Contracts', color: '#6366F1', icon_name: 'ShieldCheck', document_count: 2, created_at: '2026-01-26T10:00:00Z' },
      { id: 9, category_name: 'Medical & Health Records', description: 'Vaccination Certificates, Health Insurance Policies, Diagnostic Reports', color: '#14B8A6', icon_name: 'Bookmark', document_count: 2, created_at: '2026-01-27T10:00:00Z' },
      { id: 10, category_name: 'General & Uncategorized', description: 'Miscellaneous notes, temporary files & quick uploads', color: '#64748B', icon_name: 'Layers', document_count: 1, created_at: '2026-01-28T10:00:00Z' }
    ];

    saveCatsState(initialCats);
    setLoading(false);
  };

  const handleOpenCreate = () => {
    setCatName('');
    setDescription('');
    setColor('var(--theme-primary, #FF6B00)');
    setIconName('Folder');
    setActiveModal('create');
  };

  const handleOpenEdit = (cat: any) => {
    setSelectedCat(cat);
    setCatName(cat.category_name);
    setDescription(cat.description || '');
    setColor(cat.color || 'var(--theme-primary, #FF6B00)');
    setIconName(cat.icon_name || 'Folder');
    setActiveModal('edit');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSubmitting(true);

    try {
      let res;
      try {
        res = await api.post('/categories', {
          category_name: catName.trim(),
          description: description.trim(),
          color,
          icon_name: iconName
        }).catch(() => null);
      } catch {
        res = await api.post('/admin/categories', {
          category_name: catName.trim(),
          description: description.trim(),
          color,
          icon_name: iconName
        }).catch(() => null);
      }

      const createdCat = res?.data?.category || {
        id: Date.now(),
        category_name: catName.trim(),
        description: description.trim(),
        color,
        icon_name: iconName,
        document_count: 0
      };

      const updated = [createdCat, ...categories];
      saveCatsState(updated);
      showToast(`Category "${catName.trim()}" created successfully!`);
      setActiveModal(null);
    } catch {
      const createdCat = {
        id: Date.now(),
        category_name: catName.trim(),
        description: description.trim(),
        color,
        icon_name: iconName,
        document_count: 0
      };
      const updated = [createdCat, ...categories];
      saveCatsState(updated);
      showToast(`Category "${catName.trim()}" created successfully!`);
      setActiveModal(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat || !catName.trim()) return;
    setSubmitting(true);

    try {
      await api.put(`/admin/categories/${selectedCat.id}`, {
        category_name: catName.trim(),
        description: description.trim(),
        color,
        icon_name: iconName
      }).catch(() => null);
    } catch {}

    const updated = categories.map(c => c.id === selectedCat.id ? {
      ...c,
      category_name: catName.trim(),
      description: description.trim(),
      color,
      icon_name: iconName
    } : c);

    saveCatsState(updated);
    showToast(`Category updated successfully!`);
    setActiveModal(null);
    setSubmitting(false);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedCat) return;
    setSubmitting(true);

    try {
      await api.delete(`/admin/categories/${selectedCat.id}`).catch(() => null);
    } catch {}

    const updated = categories.filter(c => c.id !== selectedCat.id);
    saveCatsState(updated);
    showToast(`Category "${selectedCat.category_name}" deleted.`);
    setActiveModal(null);
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-900 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold border ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-auth-heading">
            Category Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Define system document categories, edit colors and taxonomy descriptors, or remove obsolete categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            className="text-xs font-extrabold px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2 bg-white rounded-3xl border border-slate-200 shadow-2xs font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-themePrimary" /> Loading system categories...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group relative p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-xl hover:shadow-orange-500/10 hover:border-themePrimary hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              {/* Top Orange Hover Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-themePrimary group-hover:to-[#F97316] transition-all duration-300" />

              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-500/20 shrink-0"
                      style={{ backgroundColor: cat.color || 'var(--theme-primary, #FF6B00)' }}
                    >
                      <Folder className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm font-auth-heading tracking-tight group-hover:text-themePrimary transition-colors duration-300">
                        {cat.category_name}
                      </h3>
                      <span className="text-[11px] font-mono font-extrabold text-themePrimary bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                        {cat.document_count || 0} documents
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-themePrimary hover:bg-white transition cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => { setSelectedCat(cat); setActiveModal('delete'); }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white transition cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mt-3 font-medium leading-relaxed">
                  {cat.description || 'System taxonomy category for organizing user documents.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-400">
                <span className="flex items-center gap-1 text-slate-500">
                  <FileText className="w-3 h-3 text-themePrimary" /> Document Label Tag
                </span>
                <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: cat.color || 'var(--theme-primary, #FF6B00)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {(activeModal === 'create' || activeModal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 font-auth-heading">
                <Tags className="w-5 h-5 text-themePrimary" />
                {activeModal === 'create' ? 'Add New Category' : 'Edit Category'}
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={activeModal === 'create' ? handleCreateSubmit : handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Legal Contracts"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of documents stored in this category..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-themePrimary resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">Badge Color Accent</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border-0 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-slate-800 text-xs font-bold">{color}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 disabled:opacity-50 transition cursor-pointer flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {activeModal === 'create' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {activeModal === 'delete' && selectedCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-center text-xs text-slate-900">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 font-auth-heading">Delete Category?</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Are you sure you want to delete category <strong className="text-slate-900">&quot;{selectedCat.category_name}&quot;</strong>?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
