import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  colorScheme: 'blue' | 'emerald' | 'purple' | 'amber' | 'cyan' | 'rose';
  trend?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  trend,
}: StatCardProps) {
  const schemeClasses = {
    blue: 'bg-blue-50/80 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50/80 text-emerald-600 border-emerald-200',
    purple: 'bg-orange-50/80 text-themePrimary border-orange-200',
    amber: 'bg-amber-50/80 text-amber-600 border-amber-200',
    cyan: 'bg-cyan-50/80 text-cyan-600 border-cyan-200',
    rose: 'bg-rose-50/80 text-rose-600 border-rose-200',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${schemeClasses[colorScheme]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </div>
        {trend && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            {trend}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 truncate">
        {subtitle}
      </p>
    </div>
  );
}
