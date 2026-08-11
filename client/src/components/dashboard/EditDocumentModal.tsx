'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Tag, Folder, Layers, FileText, CheckCircle2, AlertCircle, Loader2, Edit3, Move, AlignLeft, Calendar, HardDrive, Download
} from 'lucide-react';
import api from '@/lib/api';

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
  folder_name?: string;
}

export interface Category {
  id: number;
  category_name: string;
}

export interface FolderItem {
  id: number;
  folder_name: string;
}

interface EditDocumentModalProps {
  mode?: 'edit' | 'rename' | 'move' | 'details';
  document: DocumentItem;
  categories?: Category[];
  folders?: FolderItem[];
  onClose: () => void;
  onSuccess: (updatedDoc: any, message: string) => void;
  onDownload?: (doc: any) => void | Promise<void>;
}

export default function EditDocumentModal({
  mode = 'edit',
  document: initialDoc,
  categories: initialCategories,
  folders: initialFolders,
  onClose,
  onSuccess,
  onDownload
}: EditDocumentModalProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [folders, setFolders] = useState<FolderItem[]>(initialFolders || []);

  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      api.get('/categories').then(res => setCategories(res.data?.categories || [])).catch(() => {});
    }
    if (!initialFolders || initialFolders.length === 0) {
      api.get('/folders').then(res => setFolders(res.data?.folders || [])).catch(() => {});
    }
  }, []);
  const [title, setTitle] = useState(initialDoc.title || '');
  const [description, setDescription] = useState(initialDoc.description || '');
  const [categoryId, setCategoryId] = useState<string>(String(initialDoc.category_id || ''));
  const [folderId, setFolderId] = useState<string>(initialDoc.folder_id ? String(initialDoc.folder_id) : '');
  
  // Tags handling
  const [tags, setTags] = useState<string[]>(() => {
    if (!initialDoc.tags) return [];
    if (Array.isArray(initialDoc.tags)) return initialDoc.tags;
    return String(initialDoc.tags).split(',').map(t => t.trim()).filter(Boolean);
  });
  const [tagInput, setTagInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  useEffect(() => {
    setTitle(initialDoc.title || '');
    setDescription(initialDoc.description || '');
    setCategoryId(String(initialDoc.category_id || ''));
    setFolderId(initialDoc.folder_id ? String(initialDoc.folder_id) : '');
    const initialTags = initialDoc.tags
      ? String(initialDoc.tags).split(',').map(t => t.trim()).filter(Boolean)
      : [];
    setTags(initialTags);
    setErrorAlert(null);
  }, [initialDoc]);

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAlert(null);

    if (!title.trim()) {
      setErrorAlert('Document title is required.');
      return;
    }

    setLoading(true);

    try {
      let res;
      if (mode === 'rename') {
        res = await api.patch(`/documents/${initialDoc.id}/rename`, { title: title.trim() });
      } else if (mode === 'move') {
        res = await api.patch(`/documents/${initialDoc.id}/move`, { folder_id: folderId || null });
      } else {
        // Mode 'edit'
        res = await api.put(`/documents/${initialDoc.id}`, {
          title: title.trim(),
          description: description.trim(),
          category_id: categoryId,
          folder_id: folderId || null,
          tags: tags.join(',')
        });
      }

      if (res.data && res.data.success) {
        onSuccess(res.data.document || {
          ...initialDoc,
          title: title.trim(),
          description: description.trim(),
          category_id: Number(categoryId),
          folder_id: folderId ? Number(folderId) : null,
          tags: tags.join(','),
          updated_at: new Date().toISOString()
        }, res.data.message || 'Document updated successfully!');
        onClose();
      } else {
        setErrorAlert(res.data?.message || 'Failed to update document.');
      }
    } catch (err: any) {
      console.warn('[EditDocumentModal] Error:', err);
      const msg = err.response?.data?.message || 'Conflict or server error updating document.';
      setErrorAlert(msg);
      
      // Fallback local update if network issue
      if (!err.response) {
        const updatedLocal = {
          ...initialDoc,
          title: title.trim(),
          description: description.trim(),
          category_id: Number(categoryId),
          folder_id: folderId ? Number(folderId) : null,
          tags: tags.join(','),
          updated_at: new Date().toISOString()
        };
        onSuccess(updatedLocal, 'Document updated locally.');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number = 0) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Get current category/folder names
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentCategory = categories.find(c => String(c.id) === categoryId)?.category_name || initialDoc.category_name || 'General';
  const currentFolder = folders.find(f => String(f.id) === folderId)?.folder_name || initialDoc.folder_name || 'Root Vault';

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto m-auto text-slate-900 dark:text-white animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center font-bold">
              {mode === 'rename' && <Edit3 className="w-5 h-5" />}
              {mode === 'move' && <Move className="w-5 h-5 text-purple-600" />}
              {mode === 'details' && <FileText className="w-5 h-5 text-blue-600" />}
              {mode === 'edit' && <Layers className="w-5 h-5 text-emerald-600" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {mode === 'rename' && 'Rename Document Title'}
                {mode === 'move' && 'Move Document to Folder'}
                {mode === 'details' && 'Document Details & Metadata'}
                {mode === 'edit' && 'Edit Document Information'}
              </h2>
              <p className="text-2xs text-slate-500 font-mono truncate max-w-[280px]">
                {initialDoc.file_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert Banner */}
        {errorAlert && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorAlert}</span>
          </div>
        )}

        {/* VIEW DETAILS MODE */}
        {mode === 'details' ? (
          <div className="space-y-5 text-xs">
            <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Document Title</span>
              <p className="text-sm font-bold text-slate-900 leading-snug">{initialDoc.title}</p>
              {initialDoc.description && (
                <p className="text-slate-600 mt-1 leading-relaxed">{initialDoc.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-2xs font-bold uppercase text-slate-400 flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-blue-500" /> File Size
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm block">{formatFileSize(initialDoc.file_size)}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-2xs font-bold uppercase text-slate-400 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-emerald-500" /> File Type
                </span>
                <span className="font-mono font-bold text-slate-800 text-2xs block truncate uppercase">
                  {initialDoc.mime_type || 'Asset File'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-2xs font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Folder className="w-3 h-3 text-purple-500" /> Destination Folder
                </span>
                <span className="font-semibold text-slate-800 text-2xs block truncate">{currentFolder}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-2xs font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-500" /> Category
                </span>
                <span className="font-semibold text-slate-800 text-2xs block truncate">{currentCategory}</span>
              </div>
            </div>

            {/* Tags display */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <span className="text-2xs font-bold uppercase text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-brand-500" /> Document Tags
              </span>
              {tags.length === 0 ? (
                <p className="text-slate-400 text-2xs italic">No tags attached to this document.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 text-2xs font-semibold">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-2xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 font-bold uppercase block">Upload Date</span>
                <span className="text-slate-700 font-semibold mt-0.5 block">{formatDate(initialDoc.created_at)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 font-bold uppercase block">Last Modified Date</span>
                <span className="text-slate-700 font-semibold mt-0.5 block">{formatDate(initialDoc.updated_at || initialDoc.created_at)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              {onDownload && (
                <button
                  type="button"
                  onClick={() => onDownload(initialDoc)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-orange-500/25"
                >
                  <Download className="w-4 h-4" /> Download File
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* FORM MODES (edit, rename, move) */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Title field (always editable in edit and rename modes) */}
            {(mode === 'edit' || mode === 'rename') && (
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter descriptive title..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white text-xs"
                />
                <p className="text-2xs text-slate-400 mt-1">
                  Renaming the title changes how the document appears in search and folders without modifying the physical file asset.
                </p>
              </div>
            )}

            {/* Move mode folder selection */}
            {(mode === 'edit' || mode === 'move') && (
              <div>
                <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-themePrimary" />
                  Folder Destination
                </label>
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-themePrimary focus:bg-white text-xs font-medium"
                >
                  <option value="">Root Vault (No folder assignment)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>📁 {f.folder_name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Category selection */}
            {mode === 'edit' && (
              <div>
                <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  Document Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-themePrimary focus:bg-white text-xs font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.category_name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Description textarea */}
            {mode === 'edit' && (
              <div>
                <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
                  Description / Notes
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional notes or details about this document..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-themePrimary focus:bg-white text-xs resize-none"
                />
              </div>
            )}

            {/* Tags Manager */}
            {mode === 'edit' && (
              <div className="space-y-2">
                <label className="block font-semibold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-themePrimary" />
                  Document Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag (e.g. urgent, tax, 2026)..."
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-themePrimary text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition"
                  >
                    Add Tag
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-xl bg-orange-50 text-themePrimary border border-orange-200 text-2xs font-semibold flex items-center gap-1.5">
                        #{t}
                        <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-rose-600 text-slate-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {mode === 'rename' && 'Rename Document'}
                {mode === 'move' && 'Move to Folder'}
                {mode === 'edit' && 'Save Document Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
