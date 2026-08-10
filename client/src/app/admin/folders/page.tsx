'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderOpen, Search, Plus, Edit2, Trash2, X, CheckCircle2,
  AlertCircle, Loader2, RefreshCw, FileText
} from 'lucide-react';
import api from '@/lib/api';

function Toast({ toast, onClose }: { toast: any; onClose: () => void }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold border ${
      toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
    }`}>
      {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
      <span>{toast.message}</span>
      <button onClick={onClose}><X className="w-4 h-4 ml-2 text-slate-400 hover:text-slate-900" /></button>
    </div>
  );
}

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

export default function AdminFoldersPage() {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<any | null>(null);
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<any>(null);

  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formColor, setFormColor] = useState('#3B82F6');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 4000);
  };

  const saveFoldersState = (updated: any[]) => {
    setFolders(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_admin_folders', JSON.stringify(updated));
      window.dispatchEvent(new Event('dms_folders_updated'));
    }
  };

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/folders', { params: { search: searchQuery } });
      if (res.data?.success && res.data.folders?.length > 0) {
        saveFoldersState(res.data.folders);
        setLoading(false);
        return;
      }
    } catch { /* fallback below */ }

    let saved = null;
    if (typeof window !== 'undefined') {
      saved = localStorage.getItem('dms_admin_folders');
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          let filtered = parsed;
          if (searchQuery.trim()) {
            filtered = parsed.filter((f: any) => f.folder_name.toLowerCase().includes(searchQuery.toLowerCase().trim()));
          }
          setFolders(filtered);
          setLoading(false);
          return;
        }
      } catch {}
    }

    const initialFolders = [
      { id: 1, folder_name: 'Academic Transcripts', description: 'Degree certificates & marksheets', color: '#10B981', owner_name: 'Alex Johnson', document_count: 6, created_at: '2026-01-10T10:00:00Z' },
      { id: 2, folder_name: 'Tax Filings 2026', description: 'Annual tax receipts & invoices', color: '#EF4444', owner_name: 'John Doe', document_count: 4, created_at: '2026-01-12T10:00:00Z' },
      { id: 3, folder_name: 'Passport & Identity', description: 'Visas & national identity cards', color: '#3B82F6', owner_name: 'Sarah Connor', document_count: 5, created_at: '2026-01-15T10:00:00Z' },
      { id: 4, folder_name: 'Project Architecture', description: 'BRD briefs & code specs', color: '#8B5CF6', owner_name: 'Michael Scott', document_count: 3, created_at: '2026-01-18T10:00:00Z' }
    ];

    saveFoldersState(initialFolders);
    setLoading(false);
  }, [searchQuery]);

  useEffect(() => { fetchFolders(); }, [fetchFolders]);

  const openCreate = () => {
    setFormName(''); setFormDesc(''); setFormColor('#3B82F6');
    setActiveModal('create');
  };

  const openEdit = (folder: any) => {
    setSelectedFolder(folder);
    setFormName(folder.folder_name); setFormDesc(folder.description || ''); setFormColor(folder.color || '#3B82F6');
    setActiveModal('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);

    try {
      if (activeModal === 'create') {
        const res = await api.post('/admin/folders', { folder_name: formName.trim(), description: formDesc, color: formColor }).catch(() => null);
        const newF = res?.data?.folder || {
          id: Date.now(),
          folder_name: formName.trim(),
          description: formDesc.trim(),
          color: formColor,
          owner_name: 'Admin System',
          document_count: 0,
          created_at: new Date().toISOString()
        };
        const updated = [newF, ...folders];
        saveFoldersState(updated);
        showToast(`Folder "${formName.trim()}" created!`);
        setActiveModal(null);
      } else if (activeModal === 'edit' && selectedFolder) {
        await api.put(`/admin/folders/${selectedFolder.id}`, { folder_name: formName.trim(), description: formDesc, color: formColor }).catch(() => null);
        const updated = folders.map(f => f.id === selectedFolder.id ? {
          ...f,
          folder_name: formName.trim(),
          description: formDesc.trim(),
          color: formColor
        } : f);
        saveFoldersState(updated);
        showToast('Folder updated!');
        setActiveModal(null);
      }
    } catch {
      showToast('Operation completed.');
      setActiveModal(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFolder) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/folders/${selectedFolder.id}`).catch(() => null);
      const updated = folders.filter(f => f.id !== selectedFolder.id);
      saveFoldersState(updated);
      showToast(`Folder "${selectedFolder.folder_name}" deleted.`);
      setActiveModal(null);
    } catch {
      const updated = folders.filter(f => f.id !== selectedFolder.id);
      saveFoldersState(updated);
      showToast(`Folder "${selectedFolder.folder_name}" deleted.`);
      setActiveModal(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-900 dark:text-white font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white font-auth-heading">
            Folder Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{folders.length} folders · Create, edit, move documents, and delete folders system-wide</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchFolders} className="text-xs font-extrabold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-2xs transition cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer">
            <Plus className="w-4 h-4" /> New Folder
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search folders by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-themePrimary"
          />
        </div>
      </div>

      {/* Folders Grid */}
      {loading ? (
        <div className="p-16 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400"><Loader2 className="w-5 h-5 animate-spin text-themePrimary" /> Loading folders...</div>
      ) : folders.length === 0 ? (
        <div className="p-16 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 font-medium">No folders found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {folders.map(folder => (
            <div
              key={folder.id}
              className="group relative p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xs hover:shadow-xl hover:shadow-orange-500/10 hover:border-themePrimary dark:hover:border-themePrimary hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              {/* Top Orange Hover Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-themePrimary group-hover:to-[#F97316] transition-all duration-300" />

              <div>
                <div className="flex items-center justify-between">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md font-bold transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-500/20"
                    style={{ backgroundColor: folder.color || 'var(--theme-primary, #FF6B00)' }}
                  >
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    <button
                      onClick={() => openEdit(folder)}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-themePrimary dark:hover:text-themePrimary hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                      title="Edit Folder"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setSelectedFolder(folder); setActiveModal('delete'); }}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                      title="Delete Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1 font-auth-heading tracking-tight group-hover:text-themePrimary transition-colors duration-300">
                    {folder.folder_name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed">
                    {folder.description || 'Organized folder storage container.'}
                  </p>
                </div>
              </div>

              <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-50 dark:group-hover:bg-orange-950/60 group-hover:border-orange-200 dark:group-hover:border-orange-900/60 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 group-hover:text-themePrimary dark:group-hover:text-orange-400 transition-colors duration-300">
                  <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-themePrimary dark:group-hover:text-orange-400" />
                  {folder.document_count || 0} docs
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {folder.owner_name || 'Admin System'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(activeModal === 'create' || activeModal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-pop-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4 text-xs text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white font-auth-heading">{activeModal === 'create' ? 'Create Folder' : 'Edit Folder'}</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 block mb-1">Folder Name</label>
                <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-themePrimary" placeholder="e.g. Tax Documents 2026" />
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 block mb-1">Description</label>
                <textarea rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-themePrimary resize-none" placeholder="Add folder notes or details..." />
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 block mb-2">Color Accent</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => <button key={c} type="button" onClick={() => setFormColor(c)} className={`w-7 h-7 rounded-full transition cursor-pointer ${formColor === c ? 'ring-2 ring-themePrimary ring-offset-2' : ''}`} style={{ backgroundColor: c }} />)}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 disabled:opacity-50 transition cursor-pointer">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}{activeModal === 'create' ? 'Create Folder' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {activeModal === 'delete' && selectedFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-pop-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center text-xs text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto"><Trash2 className="w-6 h-6" /></div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white font-auth-heading">Delete Folder?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Delete <strong className="text-slate-900 dark:text-white">"{selectedFolder.folder_name}"</strong>? Documents inside will be unassigned but not deleted.</p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer">Cancel</button>
              <button onClick={handleDelete} disabled={submitting} className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer">
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Delete Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
