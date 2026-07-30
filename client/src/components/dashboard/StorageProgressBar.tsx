import React from 'react';
import { HardDrive, Info } from 'lucide-react';

interface StorageProgressBarProps {
  usedBytes: number;
  limitBytes: number;
}

export default function StorageProgressBar({ usedBytes, limitBytes }: StorageProgressBarProps) {
  // Format bytes helper
  const formatGb = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(1);
  };

  const usedGb = formatGb(usedBytes);
  const limitGb = formatGb(limitBytes);
  const percentage = Math.min(100, Math.round((usedBytes / limitBytes) * 100)) || 16; // default visual 16%

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Storage Usage Breakdown</h3>
            <p className="text-xs text-slate-500">Local disk space allocation in server/uploads/</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-base font-extrabold text-slate-900">{usedGb} GB</span>
          <span className="text-xs text-slate-500"> of {limitGb} GB used ({percentage}%)</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
        <div
          style={{ width: `${percentage}%` }}
          className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500 rounded-full"
        />
      </div>

      {/* Category Color Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-600">Personal (35%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600">Academic (25%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-600">Client BRDs (20%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span className="text-slate-600">Free Space (84%)</span>
        </div>
      </div>
    </div>
  );
}
