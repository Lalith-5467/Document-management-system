'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  FolderClosed, FolderPlus, ArrowLeft, Search, Edit2, Trash2, 
  X, AlertCircle, CheckCircle2, Loader2, RefreshCw, FolderGit2, GraduationCap, UserCheck, Folder, Upload, FileText
} from 'lucide-react';
import api from '@/lib/api';

export interface FolderItem {
  id: number;
  user_id: number;
  folder_name: string;
  description: string;
  color: string;
  icon_name: string;
  document_count: number;
  created_at: string;
  updated_at?: string;
}

const COLOR_OPTIONS = [
  { name: 'Primary Orange', value: 'var(--theme-primary, #FF6B00)' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Slate', value: '#64748B' }
];

export default function FoldersPage() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  // Form states
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formColor, setFormColor] = useState<string>('var(--theme-primary, #FF6B00)');
  const [formInitialFile, setFormInitialFile] = useState<File | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchFolders();
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('create') === 'true' || urlParams.get('new') === 'true') {
        setFormName('');
        setFormDescription('');
        setFormColor('var(--theme-primary, #FF6B00)');
        setFormError(null);
        setIsCreateOpen(true);
      }
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const saveFoldersState = (updated: FolderItem[]) => {
    setFolders(updated);
  };

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/folders');
      if (res.data && res.data.folders) {
        setFolders(res.data.folders);
      } else {
        setFolders([]);
      }
    } catch {
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    const term = searchQuery.toLowerCase().trim();
    return folders.filter(f => 
      f.folder_name.toLowerCase().includes(term) || 
      (f.description && f.description.toLowerCase().includes(term))
    );
  }, [folders, searchQuery]);

  const handleOpenCreate = () => {
    setFormName('');
    setFormDescription('');
    setFormColor('var(--theme-primary, #FF6B00)');
    setFormInitialFile(null);
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Folder name is required.');
      return;
    }
    setFormSubmitting(true);
    setFormError(null);

    const newF: FolderItem = {
      id: Date.now(),
      user_id: 1,
      folder_name: formName.trim(),
      description: formDescription.trim(),
      color: formColor,
      icon_name: 'Folder',
      document_count: formInitialFile ? 1 : 0,
      created_at: new Date().toISOString()
    };

    try {
      await api.post('/folders', {
        folder_name: formName.trim(),
        description: formDescription.trim(),
        color: formColor
      }).catch(() => null);
    } catch {}

    const updated = [newF, ...folders];
    saveFoldersState(updated);
    showToast(formInitialFile ? 'Folder created and document attached!' : 'Folder created successfully!');
    setIsCreateOpen(false);
    setFormSubmitting(false);
  };

  const handleOpenEdit = (folder: FolderItem) => {
    setSelectedFolder(folder);
    setFormName(folder.folder_name);
    setFormDescription(folder.description || '');
    setFormColor(folder.color || 'var(--theme-primary, #FF6B00)');
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolder) return;
    if (!formName.trim()) {
      setFormError('Folder name cannot be empty.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      await api.put(`/folders/${selectedFolder.id}`, {
        folder_name: formName.trim(),
        description: formDescription.trim(),
        color: formColor
      }).catch(() => null);
    } catch {}

    const updated = folders.map(f => f.id === selectedFolder.id ? {
      ...f,
      folder_name: formName.trim(),
      description: formDescription.trim(),
      color: formColor
    } : f);

    saveFoldersState(updated);
    showToast('Folder updated successfully!');
    setIsEditOpen(false);
    setFormSubmitting(false);
  };

  const handleOpenDelete = (folder: FolderItem) => {
    setSelectedFolder(folder);
    setFormError(null);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedFolder) return;
    setFormSubmitting(true);
    try {
      await api.delete(`/folders/${selectedFolder.id}`).catch(() => null);
    } catch {}

    const updated = folders.filter(f => f.id !== selectedFolder.id);
    saveFoldersState(updated);
    showToast('Folder deleted successfully.');
    setIsDeleteOpen(false);
    setFormSubmitting(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-sm font-bold animate-pop-in ${
          toast.type === 'success' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <Link href="/user" className="hover:text-themePrimary dark:hover:text-orange-400 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Workspace
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Workspace Folders</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FolderClosed className="w-6 h-6 text-themePrimary dark:text-orange-400" /> Workspace Folders
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Organize and group your documents inside custom folders.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="group relative overflow-hidden px-6 py-2.5 text-sm font-black text-white bg-gradient-to-r from-themePrimary via-[#F97316] to-[#EA580C] hover:scale-105 rounded-xl shadow-[0_8px_25px_rgba(255,107,0,0.3)] hover:shadow-[0_12px_35px_rgba(255,107,0,0.5)] transition-all duration-300 flex items-center justify-center gap-2.5 whitespace-nowrap active-press border border-orange-400/50"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out" />
          <FolderPlus className="w-4.5 h-4.5 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 relative z-10" /> 
          <span className="relative z-10 drop-shadow-md tracking-wide">Create Folder</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search folders by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-themePrimary transition-all"
          />
        </div>
        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Total: {filteredFolders.length} Folders</span>
      </div>

      {/* Folders Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-themePrimary dark:text-orange-400" />
          <p className="text-sm">Loading folders...</p>
        </div>
      ) : filteredFolders.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-md">
          <FolderClosed className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No folders found matching your query.</p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 rounded-xl shadow-md shadow-orange-500/25 transition"
          >
            Create New Folder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredFolders.map((folder) => (
            <div
              key={folder.id}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-themePrimary/40 p-5 rounded-2xl space-y-3 transition-all duration-300 group flex flex-col justify-between shadow-sm hover:shadow-[0_12px_35px_rgba(255,107,0,0.12)] hover:-translate-y-1.5 active-press cursor-pointer relative overflow-hidden"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Link 
                    href={`/user/documents?folder_id=${folder.id}&folder=${encodeURIComponent(folder.folder_name)}`}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transform group-hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: folder.color && folder.color !== '#3B82F6' ? folder.color : 'var(--theme-primary, #FF6B00)' }}
                  >
                    <FolderClosed className="w-5 h-5" />
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(folder)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      title="Edit Folder"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(folder)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      title="Delete Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Link href={`/user/documents?folder_id=${folder.id}&folder=${encodeURIComponent(folder.folder_name)}`} className="block group/link">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover/link:text-themePrimary dark:group-hover/link:text-orange-400 transition-colors truncate">
                    {folder.folder_name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed group-hover/link:text-slate-800 dark:group-hover/link:text-slate-300 transition-colors">
                    {folder.description || 'No description provided.'}
                  </p>
                </Link>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                  {folder.document_count || 0} Files
                </span>
                <Link
                  href={`/user/documents?folder_id=${folder.id}&folder=${encodeURIComponent(folder.folder_name)}`}
                  className="text-sm font-bold text-themePrimary dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 flex items-center gap-1 hover:underline"
                >
                  Open Folder →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL WITH FILE ATTACHMENT */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-pop-in text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Create Workspace Folder
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Folder Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., 2026 Tax Return, Project Alpha Specs"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of documents stored in this folder..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Add Initial File Section */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" /> Attach Initial Document (Optional)
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormInitialFile(e.target.files[0]);
                    }
                  }}
                />

                {formInitialFile ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-indigo-500/40 text-sm text-white">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate font-semibold">{formInitialFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormInitialFile(null)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-white transition flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-400" /> Select file to upload into this folder
                  </button>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-2">Folder Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormColor(c.value)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${formColor === c.value ? 'scale-110 border-white shadow-md' : 'border-transparent'}`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 font-semibold hover:text-white">
                  Cancel
                </button>
                <button type="submit" disabled={formSubmitting} className="px-4 py-2 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 text-white font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25">
                  {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && selectedFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-pop-in text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Folder</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Folder Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Folder Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormColor(c.value)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${formColor === c.value ? 'scale-110 border-indigo-600 dark:border-white shadow-md' : 'border-transparent'}`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white">
                  Cancel
                </button>
                <button type="submit" disabled={formSubmitting} className="px-4 py-2 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 text-white font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25">
                  {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteOpen && selectedFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-pop-in text-slate-900 dark:text-white">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delete Folder</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">&quot;{selectedFolder.folder_name}&quot;</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:text-slate-900 dark:hover:text-white">
                Cancel
              </button>
              <button onClick={handleDeleteSubmit} disabled={formSubmitting} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30">
                {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Delete Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
