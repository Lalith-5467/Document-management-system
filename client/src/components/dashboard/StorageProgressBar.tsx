import React from 'react';
import { HardDrive, Info } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

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
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-300 space-y-4 animate-fade-in group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#E8F5F0] dark:bg-emerald-950/40 text-[#1B664B] border border-[#D1EBE1] dark:border-emerald-800/80 group-hover:scale-105 transition-transform">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Storage Usage Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Local disk space allocation in server/uploads/</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-base font-extrabold text-slate-900 dark:text-white">
            <AnimatedCounter value={usedGb} /> GB
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {' '}of {limitGb} GB used (<AnimatedCounter value={percentage} />%)
          </span>
        </div>
      </div>

      {/* Progress Bar Container with Smooth Transition */}
      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5">
        <div
          style={{ width: `${percentage}%` }}
          className="h-full bg-[#1B664B] transition-all duration-1000 ease-out rounded-full shadow-xs"
        />
      </div>

      {/* Category Color Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
        <div className="flex items-center gap-2 group/legend">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 group-hover/legend:scale-125 transition-transform" />
          <span className="text-slate-600 dark:text-slate-400">Personal (35%)</span>
        </div>
        <div className="flex items-center gap-2 group/legend">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover/legend:scale-125 transition-transform" />
          <span className="text-slate-600 dark:text-slate-400">Academic (25%)</span>
        </div>
        <div className="flex items-center gap-2 group/legend">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E8F5F0]0 group-hover/legend:scale-125 transition-transform" />
          <span className="text-slate-600 dark:text-slate-400">Client BRDs (20%)</span>
        </div>
        <div className="flex items-center gap-2 group/legend">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover/legend:scale-125 transition-transform" />
          <span className="text-slate-600 dark:text-slate-400">Free Space (84%)</span>
        </div>
      </div>
    </div>
  );
}

