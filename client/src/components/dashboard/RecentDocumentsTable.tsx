import React from 'react';
import {
  FileText,
  Eye,
  Download,
  Star,
  Clock,
  MoreVertical,
  Tag,
  ArrowUpRight,
  FolderGit2,
  GraduationCap,
  Award,
  Briefcase,
  UserCheck
} from 'lucide-react';

export interface DocumentItem {
  id: number;
  title: string;
  file_name: string;
  category_name: string;
  file_size: number | string;
  mime_type?: string;
  created_at?: string;
  viewed_at?: string;
  is_favorite?: boolean;
}

interface RecentDocumentsTableProps {
  recentUploads: DocumentItem[];
  recentlyViewed: DocumentItem[];
}

export default function RecentDocumentsTable({
  recentUploads,
  recentlyViewed,
}: RecentDocumentsTableProps) {
  // Helper to format file size
  const formatSize = (size: number | string) => {
    if (typeof size === 'string') return size;
    if (size >= 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
    if (size >= 1024) return (size / 1024).toFixed(1) + ' KB';
    return size + ' B';
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Academic Records':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Resumes & CVs':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Personal Documents':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Client Requirements':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Certificates':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Recently Uploaded Documents (8 cols) */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Recently Uploaded Documents</h3>
            <p className="text-xs text-slate-500">Latest files added to your document vault</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {recentUploads.length} files
          </span>
        </div>

        {recentUploads.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2 border-2 border-dashed border-slate-100 rounded-xl">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-medium">No documents uploaded yet</p>
            <p className="text-xs text-slate-400">Use the Upload Document button to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-2">Document</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Size</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentUploads.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-2 font-medium text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 border border-brand-100">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate max-w-[200px] sm:max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{doc.title}</div>
                        <div className="text-[10px] text-slate-400">
                          Uploaded {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recently'}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-2">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getCategoryBadge(doc.category_name)}`}>
                        {doc.category_name}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 text-slate-500 font-mono text-[11px]">
                      {formatSize(doc.file_size)}
                    </td>

                    <td className="py-3.5 px-2 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                        <button
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
                          title="Favorite"
                        >
                          <Star className={`w-4 h-4 ${doc.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recently Viewed Documents (4 cols) */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Recently Viewed</h3>
              <p className="text-xs text-slate-500">Quick access to frequent files</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {recentlyViewed.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-200 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-7 h-7 rounded-md bg-white border border-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 truncate">{item.title}</div>
                    <div className="text-[10px] text-slate-400">{item.viewed_at || '1 hour ago'}</div>
                  </div>
                </div>

                <ArrowUpRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-center">
          <button className="text-xs font-semibold text-brand-600 hover:underline">
            View All Activity Log →
          </button>
        </div>
      </div>
    </div>
  );
}
