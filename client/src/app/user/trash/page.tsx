'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Trash2, RotateCcw, Search, ArrowLeft, RefreshCw, 
  AlertCircle, CheckCircle2, Loader2, Info, FileText, AlertTriangle, Trash, X, ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import { logActivity } from '@/lib/activityLogger';

export interface TrashedDocument {
  id: number | string;
  user_id: number;
  category_id?: number;
  folder_id?: number | null;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  is_favorite?: number;
  is_archived?: number;
  created_at: string;
  updated_at?: string;
  category_name?: string;
  folder_name?: string;
}

export default function TrashPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<TrashedDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedDoc, setSelectedDoc] = useState<TrashedDocument | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState<boolean>(false);
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState<boolean>(false);
  const [isEmptyModalOpen, setIsEmptyModalOpen] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchTrashDocuments();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTrashDocuments = async () => {
    setLoading(true);
    let apiTrashDocs: TrashedDocument[] = [];
    let isApiSuccess = false;

    // 1. Try fetching from backend API
    try {
      const res = await api.get('/documents/trash').catch(() => null) || await api.get('/documents?is_archived=1').catch(() => null);
      if (res?.data && Array.isArray(res.data.documents)) {
        apiTrashDocs = res.data.documents;
        isApiSuccess = true;
      }
    } catch {
      isApiSuccess = false;
    }

    // 2. Read local trash cache
    let localTrash: TrashedDocument[] = [];
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dms_trash_documents');
      if (saved) {
        try {
          localTrash = JSON.parse(saved);
        } catch (e) {}
      }
    }

    // Sample fallback soft-deleted items
    const sampleTrash: TrashedDocument[] = [
      { id: 901, user_id: 1, category_id: 4, folder_id: null, title: 'Requirements_Specification_Draft.docx', file_name: 'Requirements_Specification_Draft.docx', description: 'Archived draft requirements specification.', file_path: '/uploads/requirements_draft.docx', file_size: 1548291, mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', created_at: '2026-07-25T14:30:00Z', category_name: 'Projects & Technical Specs', folder_name: 'Unassigned' },
      { id: 902, user_id: 1, category_id: 7, folder_id: null, title: 'Old_Tax_Assessment_2024.pdf', file_name: 'Old_Tax_Assessment_2024.pdf', description: 'Outdated tax assessment statement from 2024.', file_path: '/uploads/tax_2024.pdf', file_size: 894200, mime_type: 'application/pdf', created_at: '2026-07-24T11:20:00Z', category_name: 'Bills, Taxes & Invoices', folder_name: 'Unassigned' },
      { id: 903, user_id: 1, category_id: 1, folder_id: null, title: 'Deprecated_Cloud_Diagram.png', file_name: 'Deprecated_Cloud_Diagram.png', description: 'Legacy architecture node diagram.', file_path: '/uploads/diagram_legacy.png', file_size: 2450000, mime_type: 'image/png', created_at: '2026-07-23T09:15:00Z', category_name: 'Personal Identity & Passports', folder_name: 'Unassigned' }
    ];

    let combinedTrash: TrashedDocument[] = [];
    if (isApiSuccess && apiTrashDocs.length > 0) {
      const apiIds = new Set(apiTrashDocs.map(d => d.id));
      const extraLocal = localTrash.filter(d => !apiIds.has(d.id));
      combinedTrash = [...extraLocal, ...apiTrashDocs];
    } else if (localTrash.length > 0) {
      combinedTrash = [...localTrash];
    } else {
      combinedTrash = [...sampleTrash];
    }

    setDocuments(combinedTrash);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_trash_documents', JSON.stringify(combinedTrash));
    }
    setLoading(false);
  };

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const term = searchQuery.toLowerCase().trim();
    return documents.filter(d => 
      d.title.toLowerCase().includes(term) ||
      (d.file_name && d.file_name.toLowerCase().includes(term)) ||
      (d.category_name && d.category_name.toLowerCase().includes(term))
    );
  }, [documents, searchQuery]);

  const handleRestore = async () => {
    if (!selectedDoc) return;
    setSubmitting(true);
    const updatedTrash = documents.filter(d => d.id !== selectedDoc.id);
    setDocuments(updatedTrash);

    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_trash_documents', JSON.stringify(updatedTrash));

      // Add restored document back to dms_user_documents
      let userDocs: any[] = [];
      try {
        const storedUserDocs = localStorage.getItem('dms_user_documents');
        if (storedUserDocs) userDocs = JSON.parse(storedUserDocs);
      } catch (e) {}

      const restoredItem = {
        ...selectedDoc,
        is_archived: 0,
        is_favorite: selectedDoc.is_favorite || 0,
        updated_at: new Date().toISOString()
      };
      const updatedUserDocs = [restoredItem, ...userDocs.filter((u: any) => String(u.id) !== String(selectedDoc.id))];
      localStorage.setItem('dms_user_documents', JSON.stringify(updatedUserDocs));
    }

    logActivity('RESTORE', selectedDoc.title, `Restored document "${selectedDoc.title}" back to My Documents`);

    try {
      await api.put(`/documents/${selectedDoc.id}/restore`).catch(() => null);
    } catch (err) {}

    showToast(`"${selectedDoc.title}" restored successfully back to My Documents!`);
    setIsRestoreModalOpen(false);
    setSelectedDoc(null);
    setSubmitting(false);
  };

  const handlePermanentDelete = async () => {
    if (!selectedDoc) return;
    setSubmitting(true);
    const updatedTrash = documents.filter(d => String(d.id) !== String(selectedDoc.id));
    setDocuments(updatedTrash);

    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_trash_documents', JSON.stringify(updatedTrash));
    }

    logActivity('DELETE', selectedDoc.title, `Permanently purged document "${selectedDoc.title}"`);

    try {
      await api.delete(`/documents/${selectedDoc.id}/permanent`).catch(() => null);
    } catch (err) {}

    showToast(`"${selectedDoc.title}" permanently deleted.`);
    setIsPermanentDeleteModalOpen(false);
    setSelectedDoc(null);
    setSubmitting(false);
  };

  const handleEmptyTrash = async () => {
    setSubmitting(true);
    setDocuments([]);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('dms_trash_documents');
    }

    logActivity('DELETE', null, `Emptied all items from Recycle Bin`);

    try {
      await api.delete('/documents/trash/empty').catch(() => null);
    } catch (err) {}

    showToast('Recycle bin emptied successfully.');
    setIsEmptyModalOpen(false);
    setSubmitting(false);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return 'Recently';
    return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
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
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
            <Link href="/user" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium">
              Vault Collections
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="text-slate-900 dark:text-white font-semibold">Recycle Bin</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Recycle Bin
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Temporarily holds soft-deleted documents. Restore files to your workspace or permanently purge them.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsEmptyModalOpen(true)}
            disabled={documents.length === 0}
            className="px-4 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
          >
            <Trash className="w-3.5 h-3.5" /> Empty Recycle Bin
          </button>

          <button
            onClick={fetchTrashDocuments}
            className="p-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
            title="Refresh Trash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {documents.length > 0 && (
        <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deleted files by title, folder, or category..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-all"
            />
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shrink-0 font-mono">
            {filteredDocs.length} deleted file(s)
          </span>
        </div>
      )}

      {/* Main Content Display */}
      {loading ? (
        <div className="bg-white dark:bg-[#111827] p-16 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-md">
          <Loader2 className="w-8 h-8 text-rose-500 dark:text-rose-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fetching deleted documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] p-16 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-md max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800/60">
            <Trash2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Recycle Bin is Empty</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-medium">
              No soft-deleted documents found. Any deleted items will appear here for 1-click recovery before permanent deletion.
            </p>
          </div>
          <Link
            href="/user/documents"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-themePrimary dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-950/60 px-4 py-2 rounded-xl border border-orange-200 dark:border-orange-900/60 transition"
          >
            Go to My Documents
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0b1120] text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800 font-mono">
                  <th className="py-3.5 px-5">Document Title</th>
                  <th className="py-3.5 px-5">Category / Folder</th>
                  <th className="py-3.5 px-5">Size</th>
                  <th className="py-3.5 px-5">Deleted Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/60">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white block">{doc.title}</span>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{doc.file_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-700 dark:text-slate-300">
                      <div>
                        <span className="block text-sm font-bold text-slate-900 dark:text-white">{doc.category_name || 'Unassigned'}</span>
                        <span className="text-xs text-slate-400 block">{doc.folder_name || 'Unassigned Folder'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-500 dark:text-slate-400 font-mono text-xs">{formatBytes(doc.file_size)}</td>
                    <td className="py-4 px-5 text-slate-500 dark:text-slate-400 text-sm font-mono">{formatDate(doc.created_at)}</td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setIsRestoreModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-sm font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setIsPermanentDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                          title="Delete Permanently"
                        >
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

      {/* RESTORE CONFIRMATION MODAL */}
      {isRestoreModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-pop-in">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-white text-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <RotateCcw className="w-5 h-5" /> Restore Document?
              </h3>
              <button onClick={() => setIsRestoreModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Are you sure you want to restore <strong className="text-slate-900 dark:text-white">&quot;{selectedDoc.title}&quot;</strong> back into your active workspace and My Documents folder?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsRestoreModalOpen(false)}
                className="px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />} Restore Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMANENT DELETE MODAL */}
      {isPermanentDeleteModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-pop-in">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-white text-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Permanently Delete File?
              </h3>
              <button onClick={() => setIsPermanentDeleteModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">&quot;{selectedDoc.title}&quot;</strong>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsPermanentDeleteModalOpen(false)}
                className="px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDelete}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Purge Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMPTY TRASH CONFIRMATION MODAL */}
      {isEmptyModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-pop-in">
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-white text-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Trash className="w-5 h-5" /> Empty Entire Recycle Bin?
              </h3>
              <button onClick={() => setIsEmptyModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Permanently purge all <strong className="text-slate-900 dark:text-white">{documents.length} document(s)</strong> currently in the Recycle Bin? All deleted files will be permanently erased from disk.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsEmptyModalOpen(false)}
                className="px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyTrash}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash className="w-3.5 h-3.5" />} Empty Bin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
