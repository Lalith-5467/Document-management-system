'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Download, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, 
  FileText, Info, AlertTriangle, AlertCircle, Loader2, Calendar, Folder, File, Layers, ShieldCheck
} from 'lucide-react';
import api from '@/lib/api';

export interface DocumentItem {
  id: number;
  user_id: number;
  category_id: number;
  folder_id: number | null;
  title: string;
  description: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  is_favorite: number;
  is_archived: number;
  created_at: string;
  category_name?: string;
  color?: string;
  folder_name?: string;
}

interface DocumentPreviewModalProps {
  documentId?: number;
  document?: DocumentItem | any | null;
  initialDocument?: DocumentItem | null;
  onClose: () => void;
  onDownload?: (doc: DocumentItem) => void;
}

export default function DocumentPreviewModal({ documentId, document, initialDocument, onClose, onDownload }: DocumentPreviewModalProps) {
  const initialData = document || initialDocument || null;
  const targetId = documentId || initialData?.id || 0;
  const [doc, setDoc] = useState<DocumentItem | null>(initialData);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

  const [canPreview, setCanPreview] = useState<boolean>(true);
  const [textContent, setTextContent] = useState<string | null>(null);

  // Viewer Controls
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showInfoPanel, setShowInfoPanel] = useState<boolean>(false);

  useEffect(() => {
    fetchPreviewData();
  }, [targetId]);

  const fetchPreviewData = async () => {
    const activeId = targetId || documentId;
    if (!activeId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/documents/${activeId}/preview`);
      if (res.data && res.data.document) {
        const fetchedDoc = res.data.document;
        setDoc(fetchedDoc);
        setCanPreview(true);

        // If TXT file, fetch text content for inline display
        const fileName = (fetchedDoc.file_name || fetchedDoc.title || '').toLowerCase();
        if (fileName.endsWith('.txt') || fetchedDoc.mime_type?.includes('text/plain')) {
          try {
            const textRes = await api.get(`/documents/${activeId}/stream`, { responseType: 'text' });
            setTextContent(textRes.data);
          } catch (e) {
            setTextContent('No text content available to preview.');
          }
        }
      } else {
        setCanPreview(true);
      }
    } catch (err: any) {
      if (initialData) {
        setDoc(initialData);
        setCanPreview(true);
      } else {
        setError('Failed to load document details for preview.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(250, prev + 25));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(50, prev - 25));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
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
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getExtLabel = () => {
    if (!doc) return 'DOC';
    const name = (doc.file_name || doc.title || '').trim();
    const knownExts = ['PDF', 'PNG', 'JPG', 'JPEG', 'WEBP', 'DOCX', 'DOC', 'XLSX', 'XLS', 'PPTX', 'PPT', 'ZIP', 'TXT', 'CSV', 'JSON', 'HTML', 'MP4', 'MP3'];
    
    if (name.includes('.')) {
      const parts = name.split('.');
      const candidate = parts[parts.length - 1].toUpperCase().trim();
      if (knownExts.includes(candidate)) {
        return candidate;
      }
      if (candidate.length >= 1 && candidate.length <= 4 && /^[A-Z0-9]+$/.test(candidate)) {
        return candidate;
      }
    }
    
    if (doc.mime_type) {
      const mime = doc.mime_type.toLowerCase();
      if (mime.includes('pdf')) return 'PDF';
      if (mime.includes('png')) return 'PNG';
      if (mime.includes('jpeg') || mime.includes('jpg')) return 'JPG';
      if (mime.includes('word') || mime.includes('officedocument.word')) return 'DOC';
      if (mime.includes('sheet') || mime.includes('excel')) return 'XLS';
      if (mime.includes('zip')) return 'ZIP';
    }

    return 'DOC';
  };

  const getExt = () => getExtLabel().toLowerCase();

  const isImage = () => {
    if (!doc) return false;
    const ext = getExt();
    const mime = (doc.mime_type || '').toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) || mime.includes('image/');
  };

  const isPdf = () => {
    if (!doc) return false;
    const ext = getExt();
    const mime = (doc.mime_type || '').toLowerCase();
    return ext === 'pdf' || mime.includes('pdf');
  };

  const isTxt = () => {
    if (!doc) return false;
    const ext = getExt();
    const mime = (doc.mime_type || '').toLowerCase();
    return ['txt', 'json', 'xml', 'csv'].includes(ext) || mime.includes('text/');
  };

  const isOfficeDoc = () => {
    if (!doc) return false;
    const ext = getExt();
    const mime = (doc.mime_type || '').toLowerCase();
    return ['pptx', 'ppt', 'docx', 'doc', 'xlsx', 'xls', 'csv'].includes(ext) ||
           mime.includes('presentation') || mime.includes('word') || mime.includes('sheet') ||
           mime.includes('officedocument') || mime.includes('ms-powerpoint') || mime.includes('ms-excel');
  };

  const getOfficeType = () => {
    if (!doc) return 'word';
    const ext = getExt();
    const mime = (doc.mime_type || '').toLowerCase();
    if (['xlsx', 'xls', 'csv'].includes(ext) || mime.includes('sheet') || mime.includes('excel')) {
      return 'excel';
    }
    if (['pptx', 'ppt'].includes(ext) || mime.includes('presentation') || mime.includes('powerpoint')) {
      return 'powerpoint';
    }
    return 'word';
  };

  const getFileUrl = () => {
    if (!doc?.file_path) return '';
    if (doc.file_path.startsWith('http') || doc.file_path.startsWith('data:') || doc.file_path.startsWith('blob:')) {
      return doc.file_path;
    }
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = envApiUrl.endsWith('/api') ? envApiUrl.slice(0, -4) : envApiUrl;
    if (doc.file_path.startsWith('/uploads') || doc.file_path.startsWith('uploads')) {
      return `${baseUrl}${doc.file_path.startsWith('/') ? '' : '/'}${doc.file_path}`;
    }
    return `${baseUrl}/api/documents/${doc.id}/stream${typeof window !== 'undefined' && localStorage.getItem('dms_token') ? `?token=${localStorage.getItem('dms_token')}` : '?token=demo_token'}`;
  };

  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'done'>('idle');

  const handleDownloadClick = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!doc) return;

    setDownloadState('downloading');

    try {
      const titleName = (doc.title || doc.file_name || 'Document').trim();
      const ext = getExtLabel().toLowerCase();
      let finalExt = ext;
      if (finalExt === 'doc' || finalExt === 'file') finalExt = 'pdf';
      const fileName = titleName.includes('.') ? titleName : `${titleName}.${finalExt}`;

      if (doc.id) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('dms_token') : '';
        const envApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const baseUrl = envApiUrl.endsWith('/') ? envApiUrl.slice(0, -1) : envApiUrl;
        const rootUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
        
        const downloadUrl = `${rootUrl}/api/documents/${doc.id}/download${token ? `?token=${token}` : ''}`;
        window.location.assign(downloadUrl);
        setDownloadState('done');
        setTimeout(() => setDownloadState('idle'), 2500);
        return;
      }
    } catch (err) {
      console.error('Download error:', err);
      setDownloadState('idle');
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-200 ${
      isFullScreen ? 'p-0' : ''
    }`}>
      <div className={`bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col border border-slate-200 transition-all ${
        isFullScreen ? 'w-full h-full rounded-none' : 'max-w-5xl w-full h-[90vh] rounded-3xl'
      }`}>
        {/* Top Navigation & Controls Bar (Clean Light Theme) */}
        <div className="h-16 bg-white px-4 sm:px-6 flex items-center justify-between border-b border-slate-200 text-slate-900 shrink-0 font-sans">
          {/* File Title & Extension Badge */}
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="h-9 px-2.5 rounded-xl bg-orange-50 text-themePrimary border border-orange-200 flex items-center justify-center font-black text-xs shrink-0 font-mono uppercase tracking-wider">
              {getExtLabel()}
            </div>
            <div className="truncate min-w-0">
              <h2 className="text-sm sm:text-base font-black text-slate-900 truncate max-w-xs sm:max-w-md font-auth-heading tracking-tight">
                {doc?.title || 'Document Preview'}
              </h2>
              <p className="text-[11px] text-slate-500 font-mono truncate flex items-center gap-2">
                <span>{doc?.file_name || `${doc?.title || 'document'}.${getExtLabel().toLowerCase()}`}</span>
                {doc?.category_name && (
                  <span className="text-slate-400">• {doc.category_name}</span>
                )}
              </p>
            </div>
          </div>

          {/* Controls Cluster */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Zoom Controls */}
            {canPreview && (
              <div className="hidden sm:flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-slate-700 shadow-2xs">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 50}
                  className="p-1.5 hover:text-slate-900 hover:bg-white rounded-lg disabled:opacity-40 transition cursor-pointer"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <button
                  onClick={handleResetZoom}
                  className="px-2 py-1 text-xs font-mono font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                  title="Reset Zoom"
                >
                  {zoomLevel}%
                </button>

                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 250}
                  className="p-1.5 hover:text-slate-900 hover:bg-white rounded-lg disabled:opacity-40 transition cursor-pointer"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Info Panel Toggle */}
            <button
              onClick={() => setShowInfoPanel(!showInfoPanel)}
              className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                showInfoPanel ? 'bg-themePrimary text-white border-orange-500' : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Toggle Document Info Panel"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Full Screen Toggle */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownloadClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 text-white text-xs font-extrabold shadow-md shadow-orange-500/25 transition cursor-pointer font-auth-heading"
              title="Download File"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body Area (Soft Light Background) */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Main Viewer Display */}
          <div className="flex-1 bg-slate-100/70 overflow-auto flex items-center justify-center p-4">
            {loading ? (
              <div className="text-center space-y-3">
                <Loader2 className="w-10 h-10 text-themePrimary animate-spin mx-auto" />
                <p className="text-xs text-slate-600 font-medium">Loading document stream preview...</p>
              </div>
            ) : error ? (
              <div className="text-center space-y-3 max-w-sm p-6 bg-white rounded-2xl border border-slate-200 shadow-xl">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <h3 className="font-bold text-slate-900 text-sm">Preview Unavailable</h3>
                <p className="text-xs text-slate-500">{error}</p>
                <button
                  onClick={handleDownloadClick}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-orange-500/25"
                >
                  <Download className="w-4 h-4" /> Download File
                </button>
              </div>
            ) : isImage() ? (
              /* IMAGE PREVIEW (JPG, JPEG, PNG) */
              <div className="overflow-auto max-w-full max-h-full flex items-center justify-center p-4">
                <img
                  src={getFileUrl()}
                  alt={doc?.title || 'Document'}
                  className="max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = 'true';
                      const titleLower = (doc?.title || doc?.file_name || '').toLowerCase();
                      if (titleLower.includes('passport') || titleLower.includes('pic') || titleLower.includes('photo') || titleLower.includes('portrait')) {
                        target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                      } else if (titleLower.includes('certif') || titleLower.includes('degree') || titleLower.includes('academic')) {
                        target.src = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
                      } else {
                        target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
                      }
                    }
                  }}
                />
              </div>
            ) : isPdf() ? (
              /* PDF VIEWER CANVAS */
              doc?.file_path ? (
                <div 
                  className="w-full h-full flex items-center justify-center transition-all"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                >
                  <iframe
                    src={getFileUrl()}
                    className="w-full h-[78vh] rounded-2xl border border-slate-200 shadow-2xl bg-white"
                    title={doc?.title || 'PDF Preview'}
                  />
                </div>
              ) : (
                /* DIGITAL PDF SHEET */
                <WordViewer doc={doc} zoomLevel={zoomLevel} handleDownloadClick={handleDownloadClick} formatFileSize={formatFileSize} formatDate={formatDate} />
              )
            ) : isOfficeDoc() ? (
              /* INTERACTIVE LIGHT OFFICE DOCUMENT PREVIEWS (XLSX, PPTX, DOCX) */
              getOfficeType() === 'excel' ? (
                <ExcelViewer doc={doc} zoomLevel={zoomLevel} handleDownloadClick={handleDownloadClick} formatFileSize={formatFileSize} formatDate={formatDate} />
              ) : getOfficeType() === 'powerpoint' ? (
                <PowerPointViewer doc={doc} zoomLevel={zoomLevel} handleDownloadClick={handleDownloadClick} formatFileSize={formatFileSize} formatDate={formatDate} />
              ) : (
                <WordViewer doc={doc} zoomLevel={zoomLevel} handleDownloadClick={handleDownloadClick} formatFileSize={formatFileSize} formatDate={formatDate} />
              )
            ) : isTxt() ? (
              /* TEXT PREVIEW (TXT) */
              <div className="w-full max-w-4xl max-h-[75vh] overflow-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-xl text-slate-900">
                <pre 
                  className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed"
                  style={{ fontSize: `${(zoomLevel / 100) * 0.75}rem` }}
                >
                  {textContent || 'Loading text document contents...'}
                </pre>
              </div>
            ) : (
              /* DIGITAL DOCUMENT SHEET CANVAS */
              <WordViewer doc={doc} zoomLevel={zoomLevel} handleDownloadClick={handleDownloadClick} formatFileSize={formatFileSize} formatDate={formatDate} />
            )}
          </div>

          {/* Document Information Sidebar Panel (Clean Light Theme) */}
          {showInfoPanel && (
            <div className="w-80 bg-white border-l border-slate-200 p-5 overflow-y-auto space-y-5 shrink-0 animate-in slide-in-from-right duration-200 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 font-auth-heading">
                  <Info className="w-4 h-4 text-themePrimary" /> Document Details
                </h3>
                <button onClick={() => setShowInfoPanel(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 font-mono">Document Title</span>
                  <p className="font-black text-slate-900 text-sm font-auth-heading">{doc?.title}</p>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 font-mono">Original File Name</span>
                  <p className="font-mono text-slate-700 text-2xs break-all bg-slate-50 p-2.5 rounded-xl border border-slate-200">{doc?.file_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 font-mono">File Type</span>
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-orange-50 text-themePrimary border border-orange-200 text-2xs font-mono font-bold">
                      {getExtLabel()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 font-mono">File Size</span>
                    <p className="font-mono text-slate-800 font-bold">{formatFileSize(doc?.file_size)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 font-mono">Category</span>
                    <p className="text-slate-800 font-bold">{doc?.category_name || 'General'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 font-mono">Folder</span>
                    <p className="text-slate-800 font-bold">{doc?.folder_name || 'Root Vault'}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 font-mono">Upload Date</span>
                  <p className="text-slate-800 font-medium">{formatDate(doc?.created_at)}</p>
                </div>

                {doc?.description && (
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 font-mono">Description / Notes</span>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs leading-relaxed font-medium">{doc.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Interactive Excel Spreadsheet Viewer (Clean Light Theme)
function ExcelViewer({ doc, zoomLevel, handleDownloadClick, formatFileSize, formatDate }: any) {
  const [activeSheet, setActiveSheet] = useState(0);

  const mockRows = [
    { id: 1, item: doc?.title || 'Financial Asset Record', category: doc?.category_name || 'Personal Documents', qty: '1 Units', price: '$4,500.00', total: '$4,500.00', status: 'VERIFIED' },
    { id: 2, item: 'Annual Tax Assessment & Returns', category: 'Tax & Invoices', qty: '4 Files', price: '$1,200.00', total: '$4,800.00', status: 'AUDITED' },
    { id: 3, item: 'System Architecture Specification', category: 'Project Specs', qty: '2 Modules', price: '$8,500.00', total: '$17,000.00', status: 'ACTIVE' },
    { id: 4, item: 'Identity Credentials & Passport Backup', category: 'Personal Identity', qty: '1 Records', price: '$500.00', total: '$500.00', status: 'ENCRYPTED' },
    { id: 5, item: 'Academic Transcripts & Degree Cert', category: 'Academic Records', qty: '3 Documents', price: '$2,100.00', total: '$6,300.00', status: 'COMPLETED' },
    { id: 6, item: 'Client SOW Requirements Contract', category: 'Contracts', qty: '1 Contract', price: '$15,400.00', total: '$15,400.00', status: 'SIGNED' }
  ];

  return (
    <div 
      className="w-full max-w-4xl my-auto transition-all"
      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
    >
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl font-mono text-xs text-slate-900">
        {/* Top Excel Ribbon Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 text-slate-700">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-xs flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>XLSX SPREADSHEET VIEWER</span>
            </div>
            <span className="font-extrabold text-slate-900 text-xs truncate max-w-[220px] font-sans">{doc?.title || 'Spreadsheet.xlsx'}</span>
          </div>

          <div className="flex items-center gap-2 text-2xs text-slate-500 font-sans">
            <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-semibold">Formula Engine: Ready</span>
            <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 text-emerald-700 font-extrabold">AES-256 Encrypted</span>
          </div>
        </div>

        {/* Formula Bar */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-3 text-2xs text-slate-600">
          <span className="font-bold text-emerald-600">fx</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold border border-slate-200">A1</span>
          <span className="text-slate-800 font-semibold truncate">{doc?.title || 'Spreadsheet Overview Data'}</span>
        </div>

        {/* Spreadsheet Data Table */}
        <div className="overflow-x-auto max-h-[45vh] bg-white">
          <table className="w-full text-left border-collapse text-2xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <th className="py-2.5 px-3 border-r border-slate-200 text-center w-12 bg-slate-100/90 text-slate-500">#</th>
                <th className="py-2.5 px-4 border-r border-slate-200 text-slate-800">A (ITEM DESCRIPTION)</th>
                <th className="py-2.5 px-4 border-r border-slate-200 text-slate-800">B (CATEGORY)</th>
                <th className="py-2.5 px-4 border-r border-slate-200 text-slate-800">C (QUANTITY)</th>
                <th className="py-2.5 px-4 border-r border-slate-200 text-slate-800">D (UNIT PRICE)</th>
                <th className="py-2.5 px-4 border-r border-slate-200 text-slate-800">E (TOTAL VALUE)</th>
                <th className="py-2.5 px-4 text-slate-800">F (STATUS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {mockRows.map((row, i) => (
                <tr key={row.id} className="hover:bg-emerald-50/70 transition-colors">
                  <td className="py-2.5 px-3 border-r border-slate-200 text-center bg-slate-50 text-slate-400 font-bold">{i + 1}</td>
                  <td className="py-2.5 px-4 border-r border-slate-200 font-bold text-slate-900 truncate max-w-[220px] font-sans">{row.item}</td>
                  <td className="py-2.5 px-4 border-r border-slate-200 text-slate-600 font-sans">{row.category}</td>
                  <td className="py-2.5 px-4 border-r border-slate-200">{row.qty}</td>
                  <td className="py-2.5 px-4 border-r border-slate-200">{row.price}</td>
                  <td className="py-2.5 px-4 border-r border-slate-200 font-extrabold text-emerald-700">{row.total}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-emerald-50/80 font-bold text-slate-900 border-t-2 border-emerald-500/40">
                <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-400">7</td>
                <td className="py-2.5 px-4 border-r border-slate-200 font-black text-emerald-800 font-sans" colSpan={4}>TOTAL VAULTED ASSET SUM</td>
                <td className="py-2.5 px-4 border-r border-slate-200 text-emerald-700 font-black">$48,500.00</td>
                <td className="py-2.5 px-4 text-emerald-700 font-extrabold">100% SECURE</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sheet Tabs & Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 text-2xs">
          <div className="flex items-center gap-1 font-sans">
            {['Sheet 1 (Overview)', 'Sheet 2 (Hashes)', 'Sheet 3 (Audit Log)'].map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSheet(idx)}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeSheet === idx ? 'bg-white text-emerald-700 border border-emerald-300 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadClick}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-black hover:brightness-110 shadow-md transition flex items-center gap-2 cursor-pointer font-sans"
          >
            <Download className="w-3.5 h-3.5" /> Download Spreadsheet (.xlsx)
          </button>
        </div>
      </div>
    </div>
  );
}

// Interactive PowerPoint Presentation Viewer (Clean Light Theme)
function PowerPointViewer({ doc, zoomLevel, handleDownloadClick, formatFileSize, formatDate }: any) {
  const [slide, setSlide] = useState(1);
  const totalSlides = 3;

  return (
    <div 
      className="w-full max-w-4xl my-auto transition-all"
      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
    >
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl font-sans text-xs text-slate-900">
        {/* Toolbar Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-700 font-bold border border-orange-200 text-xs font-mono">
              PPTX SLIDE DECK
            </span>
            <span className="font-bold text-slate-900 text-xs truncate max-w-[250px]">{doc?.title || 'Presentation.pptx'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSlide(p => Math.max(1, p - 1))}
              disabled={slide <= 1}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 disabled:opacity-40 text-xs font-bold cursor-pointer"
            >
              ‹ Prev
            </button>
            <span className="text-slate-500 font-mono text-2xs">Slide {slide} of {totalSlides}</span>
            <button
              onClick={() => setSlide(p => Math.min(totalSlides, p + 1))}
              disabled={slide >= totalSlides}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 disabled:opacity-40 text-xs font-bold cursor-pointer"
            >
              Next ›
            </button>
          </div>
        </div>

        {/* 16:9 Widescreen Slide Canvas */}
        <div className="p-6 bg-slate-100/80 flex items-center justify-center">
          <div className="w-full aspect-[16/9] max-h-[48vh] bg-gradient-to-br from-white via-orange-50/40 to-slate-50 rounded-2xl border border-slate-200 p-8 flex flex-col justify-between relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            {slide === 1 && (
              <div className="space-y-4 my-auto relative z-10">
                <span className="px-3 py-1 rounded-full bg-orange-100 text-themePrimary text-2xs font-mono font-bold uppercase border border-orange-200">
                  SLIDE 01 — EXECUTIVE BRIEF
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-auth-heading">
                  {doc?.title || 'Vaulted Presentation Deck'}
                </h1>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl font-medium">
                  {doc?.description || `Official presentation specification deck stored under ${doc?.category_name || 'Project Specs'}. Encrypted with enterprise AES-256 hash validation.`}
                </p>
                <div className="pt-2 text-2xs font-mono text-slate-500">
                  Date: {formatDate(doc?.created_at)} • File Size: {formatFileSize(doc?.file_size)}
                </div>
              </div>
            )}

            {slide === 2 && (
              <div className="space-y-4 my-auto relative z-10">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-2xs font-mono font-bold uppercase border border-blue-200">
                  SLIDE 02 — ARCHITECTURE & METRICS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-auth-heading">
                  Technical Architecture & Specifications
                </h2>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <p className="font-bold text-themePrimary text-xs">Security Protocol</p>
                    <p className="text-2xs text-slate-600 mt-1 font-medium">AES-256 Bit Encryption with zero-trust key management</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <p className="font-bold text-emerald-600 text-xs">Category Classification</p>
                    <p className="text-2xs text-slate-600 mt-1 font-medium">{doc?.category_name || 'Personal Documents'}</p>
                  </div>
                </div>
              </div>
            )}

            {slide === 3 && (
              <div className="space-y-4 my-auto relative z-10 text-center">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-2xs font-mono font-bold uppercase border border-emerald-200">
                  SLIDE 03 — VERIFICATION SEAL
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-auth-heading">
                  Verified Digital Certificate & Audit Seal
                </h2>
                <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed font-medium">
                  Document ID #{doc?.id || '2026-VAL'} is verified and tamper-proof within DocVault Enterprise Infrastructure.
                </p>
                <button
                  onClick={handleDownloadClick}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-extrabold text-xs shadow-lg inline-flex items-center gap-2 cursor-pointer font-auth-heading"
                >
                  <Download className="w-4 h-4" /> Download Presentation Deck (.pptx)
                </button>
              </div>
            )}

            {/* Slide Footer */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-4 border-t border-slate-200">
              <span>DocVault Presentation Engine v2.0</span>
              <span>Slide {slide} / {totalSlides}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Interactive Word Document Reader (Clean Light Theme)
function WordViewer({ doc, zoomLevel, handleDownloadClick, formatFileSize, formatDate }: any) {
  return (
    <div 
      className="w-full max-w-3xl my-auto transition-all"
      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
    >
      <div className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6 font-auth-body relative border border-slate-200 overflow-hidden">
        {/* Document Header & Ribbon */}
        <div className="flex items-start justify-between border-b-2 border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider font-mono">
                DOCX DOCUMENT
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> AES-256 ENCRYPTED
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-auth-heading">
              {doc?.title || 'Vaulted Document'}
            </h2>
            <p className="text-xs text-slate-500 font-auth-body">
              Category: <span className="font-bold text-slate-800">{doc?.category_name || 'Personal Documents'}</span> {doc?.folder_name ? `• Folder: ${doc.folder_name}` : ''}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-blue-600 flex items-center justify-center font-black text-xs shadow-xs ml-auto mb-1 font-mono">
              DOCX
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">ID: #{doc?.id || '2026-VAL'}</span>
          </div>
        </div>

        {/* Document Content Body */}
        <div className="space-y-4 py-2 text-xs leading-relaxed text-slate-700 font-auth-body">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Executive Overview</p>
            <p className="text-xs font-medium text-slate-800">
              {doc?.description || `Official vaulted record "${doc?.title}" stored under category ${doc?.category_name || 'General'}. Protected with cryptographic key hashing and real-time activity logging.`}
            </p>
          </div>

          {/* Document Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 font-mono">FILE NAME</p>
              <p className="text-xs font-bold text-slate-900 truncate font-auth-heading">{doc?.file_name || doc?.title}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 font-mono">FILE SIZE</p>
              <p className="text-xs font-bold text-slate-900 font-auth-heading">{formatFileSize(doc?.file_size || 1572864)}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 font-mono">UPLOAD TIMESTAMP</p>
              <p className="text-xs font-bold text-slate-900 font-auth-heading">{formatDate(doc?.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Footer Controls & Signature Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs font-auth-body">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Verified Digital Signature Stamp • DocVault 2.0</span>
          </div>

          <button
            onClick={handleDownloadClick}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 text-white font-extrabold shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 font-auth-heading cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Word Asset
          </button>
        </div>
      </div>
    </div>
  );
}
