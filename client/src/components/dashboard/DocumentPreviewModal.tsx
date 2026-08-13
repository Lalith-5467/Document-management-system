'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Download, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, 
  FileText, Info, AlertTriangle, AlertCircle, Loader2, Calendar, Folder, File, Layers, ShieldCheck,
  Presentation, ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';
import { downloadDocumentFile } from '@/lib/downloadHelper';

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

export default function DocumentPreviewModal({ documentId, document: documentProp, initialDocument, onClose, onDownload }: DocumentPreviewModalProps) {
  const initialData = documentProp || initialDocument || null;
  const targetId = documentId || initialData?.id || 0;
  const [doc, setDoc] = useState<DocumentItem | null>(initialData);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [canPreview, setCanPreview] = useState<boolean>(true);
  const [textContent, setTextContent] = useState<string | null>(null);

  // Viewer Controls
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showInfoPanel, setShowInfoPanel] = useState<boolean>(false);

  useEffect(() => {
    const freshData = documentProp || initialDocument || null;
    if (freshData) {
      setDoc(freshData);
    }
    fetchPreviewData();
  }, [targetId, documentId, documentProp, initialDocument]);

  const [slidesData, setSlidesData] = useState<any[] | null>(null);
  const [extractedHtml, setExtractedHtml] = useState<string>('');

  const fetchPreviewData = async () => {
    const activeId = targetId || documentId;
    if (!activeId) return;

    setLoading(true);
    setError(null);
    setSlidesData(null);
    setTextContent('');
    setExtractedHtml('');
    try {
      const params: any = {};
      if (doc?.file_name) params.file_name = doc.file_name;
      if (doc?.title) params.title = doc.title;
      if (doc?.file_path) params.file_path = doc.file_path;
      if (doc?.category_name) params.category_name = doc.category_name;

      const res = await api.get(`/documents/${activeId}/preview`, { params });
      if (res.data && res.data.document) {
        const fetchedDoc = res.data.document;
        setDoc(prev => ({ ...(prev || {}), ...fetchedDoc }));
        setCanPreview(true);

        if (res.data.slidesData && Array.isArray(res.data.slidesData)) {
          setSlidesData(res.data.slidesData);
        }

        if (res.data.extractedHtml) {
          setExtractedHtml(res.data.extractedHtml);
        }

        if (res.data.extractedText) {
          setTextContent(res.data.extractedText);
        } else {
          // If TXT file, fetch text content for inline display
          const fileName = (fetchedDoc.file_name || fetchedDoc.title || '').toLowerCase();
          if (fileName.endsWith('.txt') || fetchedDoc.mime_type?.includes('text/plain')) {
            try {
              const textRes = await api.get(`/documents/${activeId}/stream`, { responseType: 'text', params });
              setTextContent(textRes.data);
            } catch (e) {
              setTextContent('No text content available to preview.');
            }
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

  const handleDownloadClick = async (e?: React.MouseEvent | any, docOverride?: any) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetDoc = docOverride || (e && !e.preventDefault && (e.title || e.id) ? e : null) || doc;
    if (!targetDoc) return;

    setDownloadState('downloading');

    try {
      const success = await downloadDocumentFile(targetDoc);
      if (success) {
        setDownloadState('done');
        setTimeout(() => setDownloadState('idle'), 2500);
      } else {
        setDownloadState('idle');
      }
    } catch (err) {
      console.error('Download error:', err);
      setDownloadState('idle');
    }
  };

  useEffect(() => {
    if (doc) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [doc]);

  if (!mounted || typeof window === 'undefined' || !window.document || !window.document.body) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-200 ${
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
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {/* Main Viewer Display */}
          <div className="flex-1 bg-slate-100/70 overflow-y-auto min-h-0 flex items-start justify-center p-4 sm:p-6">
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
                <PowerPointViewer doc={doc} slidesData={slidesData} textContent={textContent} zoomLevel={zoomLevel} handleDownloadClick={handleDownloadClick} formatFileSize={formatFileSize} formatDate={formatDate} />
              ) : (
                <WordViewer doc={doc} textContent={textContent} extractedHtml={extractedHtml} zoomLevel={zoomLevel} handleDownloadClick={handleDownloadClick} formatFileSize={formatFileSize} formatDate={formatDate} />
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
              <WordViewer doc={doc} textContent={textContent} zoomLevel={zoomLevel} handleDownloadClick={handleDownloadClick} formatFileSize={formatFileSize} formatDate={formatDate} />
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
    </div>,
    window.document.body
  );
}

// Interactive Excel Spreadsheet Viewer (Clean Light Theme)
function ExcelViewer({ doc, zoomLevel, handleDownloadClick, formatFileSize, formatDate }: any): JSX.Element {
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
      className="w-full max-w-4xl transition-all my-2"
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

// Interactive PowerPoint Presentation Viewer (Executive Visual Slide Deck Theme)
function PowerPointViewer({ doc, slidesData, textContent, zoomLevel, handleDownloadClick, formatFileSize, formatDate }: any): JSX.Element {
  const [slide, setSlide] = useState(1);
  const [viewMode, setViewMode] = useState<'slides' | 'full'>('slides');
  const totalSlides = slidesData && slidesData.length > 0 ? slidesData.length : 3;

  const slideList = slidesData && slidesData.length > 0 ? slidesData : [
    { 
      slideNumber: 1, 
      title: doc?.title || 'Executive Overview & Strategic Briefing', 
      content: doc?.description || `Official presentation deck "${doc?.title || 'IBM'}" stored securely in DocVault under category ${doc?.category_name || 'General'}. Protected with enterprise AES-256 hash validation.`
    },
    { 
      slideNumber: 2, 
      title: 'Technical Architecture & Infrastructure', 
      content: `System Architecture & Microservices Pipeline:\n\n• Microservices Architecture & Data Vault Pipeline\n• Zero-Trust Key Distribution & Cryptographic Hash Checksum\n• Automated Retention Policy & Real-Time Audit Log\n• Multi-Tier Workspace Folder Storage Hierarchy`
    },
    { 
      slideNumber: 3, 
      title: 'Verified Digital Certificate & Audit Seal', 
      content: `Verified Digital Certificate & Summary:\n\nThis presentation specification deck is verified, tamper-proof, and archived securely within DocVault Enterprise Infrastructure.\n\nAll slides, graphics, and embedded assets are protected under active digital signature hashes.`
    }
  ];

  return (
    <div 
      className="w-full max-w-4xl transition-all font-sans my-2"
      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
    >
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xl text-xs text-slate-900">
        
        {/* Top Toolbar Header */}
        <div className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-orange-500/20 font-auth-heading">
              P
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-auth-heading tracking-tight leading-snug">
                {doc?.title || 'Presentation.pptx'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                <span>PowerPoint Presentation</span>
                <span>•</span>
                <span className="font-mono">{formatFileSize(doc?.file_size || 500000)}</span>
                <span>•</span>
                <span className="font-mono font-bold text-orange-600">{totalSlides} Slides</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs font-semibold font-auth-body">
              <button
                type="button"
                onClick={() => setViewMode('slides')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'slides' ? 'bg-white text-orange-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Visual Slide Deck ({totalSlides})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('full')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'full' ? 'bg-white text-orange-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Slides List
              </button>
            </div>

            {viewMode === 'slides' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs font-semibold font-auth-body">
                <button
                  onClick={() => setSlide(p => Math.max(1, p - 1))}
                  disabled={slide <= 1}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 disabled:opacity-40 text-xs font-bold cursor-pointer shadow-2xs"
                >
                  ‹ Prev
                </button>
                <span className="text-slate-600 font-mono text-xs px-2.5">
                  Slide <strong>{slide}</strong> of {totalSlides}
                </span>
                <button
                  onClick={() => setSlide(p => Math.min(totalSlides, p + 1))}
                  disabled={slide >= totalSlides}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 disabled:opacity-40 text-xs font-bold cursor-pointer shadow-2xs"
                >
                  Next ›
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Slide View Container */}
        {viewMode === 'full' ? (
          /* Full Presentation Deck Reader View */
          <div className="p-6 sm:p-10 max-h-[70vh] overflow-y-auto bg-slate-100/60 font-sans">
            <div className="max-w-3xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 shadow-xl space-y-6">
              <div className="border-b border-slate-100 pb-5 flex justify-between items-start">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold font-auth-heading tracking-wide border border-orange-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-600" /> POWERPOINT PRESENTATION DECK ({totalSlides} SLIDES)
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-auth-heading pt-1">
                    {doc?.title || 'Presentation Specification Deck'}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Vault Category: <strong className="text-slate-800">{doc?.category_name || 'General'}</strong> {doc?.folder_name ? `• Folder: ${doc.folder_name}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono text-slate-400 font-bold">ID: #{doc?.id || 'VAL-2026'}</span>
                  <p className="text-xs font-medium text-slate-500 mt-1">{formatDate(doc?.created_at)}</p>
                </div>
              </div>

              {/* Render Slides Sequentially */}
              <div className="space-y-6">
                {slideList.map((sItem: any, idx: number) => (
                  <div key={idx} className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-orange-700 font-bold border-b border-slate-200/80 pb-2.5 font-auth-heading">
                      <span className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-[11px] font-mono">SLIDE {String(sItem.slideNumber || idx + 1).padStart(2, '0')}</span>
                        <span className="text-sm font-extrabold text-slate-900">{sItem.title || `SLIDE ${idx + 1}`}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal font-mono">DocVault Deck</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                      {sItem.bullets && sItem.bullets.length > 0 ? (
                        <ul className="space-y-2 font-sans text-xs sm:text-sm text-slate-800">
                          {sItem.bullets.map((b: string, bIdx: number) => (
                            <li key={bIdx} className="flex items-start gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="whitespace-pre-wrap font-sans text-sm text-slate-800 leading-relaxed select-text">
                          {sItem.content}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-sans">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Presentation Stamp • DocVault Enterprise
                </span>
                <span>{totalSlides} Total Slides</span>
              </div>
            </div>
          </div>
        ) : (
          /* Interactive 16:9 Visual Slide Deck View */
          <div className="p-6 sm:p-8 bg-slate-900/90 text-white space-y-6 font-sans">
            
            {/* Visual Slide Frame */}
            <div className="w-full aspect-[16/9] min-h-[360px] max-h-[50vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-2xl border border-slate-700/80 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl">
              
              {/* Background Ambient Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Slide Header Pill */}
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold font-mono border border-orange-500/30 uppercase">
                    SLIDE {String(slide).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-slate-400 font-medium truncate max-w-[300px]">
                    {doc?.title || 'PowerPoint Presentation'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Presentation className="w-4 h-4 text-orange-400" />
                  <span>16:9 Widescreen Deck</span>
                </div>
              </div>

              {/* Slide Body Visual Content */}
              <div className="my-auto relative z-10 max-h-[36vh] overflow-y-auto space-y-4 py-2">
                <div className="space-y-3">
                  <span className="inline-block px-3 py-1 rounded-md bg-orange-500/20 text-orange-300 text-xs font-mono font-bold tracking-wider uppercase border border-orange-500/30">
                    SLIDE {String(slide).padStart(2, '0')} — {(slideList[slide - 1]?.title) || `Slide ${slide}`}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-auth-heading leading-tight">
                    {(slideList[slide - 1]?.title) || doc?.title || `Slide ${slide}`}
                  </h1>
                  <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-inner select-text">
                    {slideList[slide - 1]?.bullets && slideList[slide - 1].bullets.length > 0 ? (
                      <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-slate-200">
                        {slideList[slide - 1].bullets.map((b: string, bIdx: number) => (
                          <li key={bIdx} className="flex items-start gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{b}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-200 leading-relaxed">
                        {slideList[slide - 1]?.content || `Slide ${slide} content specification.`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Slide Footer */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-4 border-t border-slate-800 relative z-10">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> DocVault Presentation Reader • Verified Deck
                </span>
                <div className="flex items-center gap-3">
                  <span>Slide {slide} of {totalSlides}</span>
                  <button
                    onClick={handleDownloadClick}
                    className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download (.pptx)
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Slide Thumbnails Strip Carousel */}
            <div className="space-y-2">
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">SLIDE DECK THUMBNAILS ({totalSlides} SLIDES - CLICK TO JUMP)</p>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {slideList.map((sItem: any, idx: number) => {
                  const sNum = idx + 1;
                  const isActive = slide === sNum;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSlide(sNum)}
                      className={`shrink-0 w-40 h-24 rounded-xl p-2.5 transition-all text-left flex flex-col justify-between cursor-pointer border ${
                        isActive
                          ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-500 ring-2 ring-orange-500/40 shadow-lg scale-102'
                          : 'bg-slate-800/90 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                          #{sNum}
                        </span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />}
                      </div>
                      <p className="text-[11px] font-bold text-slate-200 truncate font-auth-heading mt-1">
                        {sItem.title || `Slide ${sNum}`}
                      </p>
                      <p className="text-[9px] text-slate-400 truncate">
                        {sItem.content?.slice(0, 35) || 'Slide text content...'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

// Interactive Word Document Reader (Executive & Professional Light Theme)
function WordViewer({ doc, textContent, extractedHtml, zoomLevel, handleDownloadClick, formatFileSize, formatDate }: any): JSX.Element {
  const hasHtml = Boolean(extractedHtml && extractedHtml.trim());
  const displayContent = extractedHtml || textContent || doc?.description || '';
  const isRealText = Boolean(displayContent && displayContent.trim());

  const rawPath = doc?.file_path || '';
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const baseUrl = envApiUrl.endsWith('/api') ? envApiUrl.slice(0, -4) : envApiUrl;
  const fullFileUrl = rawPath ? (rawPath.startsWith('http') ? rawPath : `${baseUrl}${rawPath.startsWith('/') ? '' : '/'}${rawPath}`) : '';
  const googleViewerUrl = fullFileUrl ? `https://docs.google.com/gview?url=${encodeURIComponent(fullFileUrl)}&embedded=true` : '';

  return (
    <div 
      className="w-full max-w-4xl transition-all font-sans my-2"
      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
    >
      <div className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl relative border border-slate-200/90 font-sans">
        
        {/* Main Authentic A4 Document Canvas Sheet */}
        <div className="p-4 sm:p-8 bg-slate-100/60 font-sans font-auth-body">
          {/* A4 Paper Container */}
          <div className="max-w-3xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6">
            
            {/* Document Header Ribbon */}
            <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-auth-heading tracking-wide border border-blue-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> OFFICIAL WORD DOCUMENT
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-auth-heading pt-1">
                  {doc?.title || doc?.file_name || 'Word Document'}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Vault Category: <strong className="text-slate-800">{doc?.category_name || 'General'}</strong> {doc?.folder_name ? `• Folder: ${doc.folder_name}` : ''}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono text-slate-400 font-bold">ID: #{doc?.id || 'VAL-2026'}</span>
                <p className="text-xs font-medium text-slate-500 mt-1">{formatDate(doc?.created_at)}</p>
              </div>
            </div>

            {/* Document Text / HTML / Visual Body */}
            <div className="space-y-6 text-slate-800 leading-relaxed font-sans">
              {hasHtml ? (
                <div 
                  className="word-document-content max-w-none text-slate-800 leading-relaxed p-2 select-text text-sm sm:text-base space-y-3"
                  dangerouslySetInnerHTML={{ __html: extractedHtml }}
                />
              ) : isRealText ? (
                <div className="p-4 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-blue-700 font-bold border-b border-slate-200/80 pb-2.5 font-auth-heading">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      FULL DOCUMENT CONTENT
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">DocVault Reader View</span>
                  </div>
                  <div className="whitespace-pre-wrap font-sans text-sm sm:text-base text-slate-800 leading-relaxed select-text pt-1">
                    {displayContent}
                  </div>
                </div>
              ) : fullFileUrl ? (
                /* Interactive Visual Page View via Google Docs Viewer */
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                  <iframe 
                    src={googleViewerUrl}
                    className="w-full h-[65vh] min-h-[500px] bg-white border-0"
                    title={doc?.title || 'Word Visual View'}
                  />
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/30 border border-blue-100 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg mx-auto shadow-md shadow-blue-500/20 font-auth-heading">
                    W
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-sm font-extrabold text-slate-900 font-auth-heading">
                      {doc?.title || doc?.file_name || 'Microsoft Word Document'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Vault Record #{doc?.id || '2026'} • Format: <strong className="text-slate-700 font-mono">Word (.docx)</strong>
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => handleDownloadClick && handleDownloadClick(doc)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-xs flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Original Word Document (.docx)
                    </button>
                  </div>
                </div>
              )}

              {/* File Information & Vault Specifications */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-auth-heading">Vault File Specifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">File Format</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">Word (.docx)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Encrypted Size</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 font-mono">{formatFileSize(doc?.file_size)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Vault Security</p>
                    <p className="text-xs font-bold text-emerald-600 mt-0.5 flex items-center gap-1 font-auth-heading">
                      <ShieldCheck className="w-3.5 h-3.5" /> AES-256 Validated
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Stamp Footer */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-sans">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Tamper-Proof Digital Verification Stamp
                </span>
                <span>DocVault Enterprise Reader</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
