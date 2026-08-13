'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, FolderPlus, Search, X, CheckCircle2, FileUp } from 'lucide-react';

import Modal from '@/components/ui/Modal';

interface QuickActionsProps {
  onSearchFocus?: () => void;
}

export default function QuickActions({ onSearchFocus }: QuickActionsProps) {
  const [activeModal, setActiveModal] = useState<'upload' | 'folder' | null>(null);
  const [folderName, setFolderName] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName) return;
    setSuccessNotice(`Folder "${folderName}" created successfully!`);
    setFolderName('');
    setTimeout(() => {
      setActiveModal(null);
      setSuccessNotice('');
    }, 1500);
  };

  return (
    <>
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
          <p className="text-xs text-slate-500">Perform common tasks in your document vault</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Link
            href="/user/upload"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 rounded-xl shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02]"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </Link>

          <Link
            href="/dashboard/folders"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <FolderPlus className="w-4 h-4 text-slate-600" />
            <span>Create Folder</span>
          </Link>

          <Link
            href="/dashboard/documents"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <Search className="w-4 h-4 text-slate-600" />
            <span>Search Documents</span>
          </Link>
        </div>
      </div>

      {/* Modal Dialog for Upload Document */}
      <Modal
        isOpen={activeModal === 'upload'}
        onClose={() => setActiveModal(null)}
        title="Upload New Document"
        subtitle="Select category and file to upload into local storage vault."
        icon={<FileUp className="w-5 h-5 text-themePrimary" />}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 hover:border-themePrimary rounded-xl p-8 text-center space-y-3 bg-slate-50/50 cursor-pointer transition-colors">
            <Upload className="w-8 h-8 text-themePrimary mx-auto" />
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Drag & drop files here, or <span className="text-themePrimary font-semibold underline">browse</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Supports PDF, DOCX, PNG, JPG, TXT, ZIP (Max 25MB)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setSuccessNotice('Document upload feature prepared!');
                setTimeout(() => {
                  setActiveModal(null);
                  setSuccessNotice('');
                }, 1200);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 rounded-xl shadow-md shadow-orange-500/25"
            >
              Select File
            </button>
          </div>

          {successNotice && (
            <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{successNotice}</span>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Dialog for Create Folder */}
      <Modal
        isOpen={activeModal === 'folder'}
        onClose={() => setActiveModal(null)}
        title="Create New Folder"
        subtitle="Organize related records into custom folder structures."
        icon={<FolderPlus className="w-5 h-5 text-themePrimary" />}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateFolder} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 font-auth-label">
              Folder Name
            </label>
            <input
              type="text"
              required
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. 2026 Tax Documents"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-themePrimary"
            />
          </div>

          {successNotice && (
            <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{successNotice}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 rounded-xl shadow-md shadow-orange-500/25"
            >
              Create Folder
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
