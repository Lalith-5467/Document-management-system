import React from 'react';
import { LucideIcon } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  colorScheme: 'blue' | 'emerald' | 'purple' | 'amber' | 'cyan' | 'rose';
  trend?: string;
  index?: number;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  trend,
  index = 0,
}: StatCardProps) {
  const schemeClasses = {
    blue: 'bg-blue-50/80 text-blue-600 border-blue-200/80 group-hover:bg-blue-100/80 group-hover:border-blue-300',
    emerald: 'bg-emerald-50/80 text-emerald-600 border-emerald-200/80 group-hover:bg-emerald-100/80 group-hover:border-emerald-300',
    purple: 'bg-orange-50/80 text-themePrimary border-orange-200/80 group-hover:bg-orange-100/80 group-hover:border-orange-300',
    amber: 'bg-amber-50/80 text-amber-600 border-amber-200/80 group-hover:bg-amber-100/80 group-hover:border-amber-300',
    cyan: 'bg-cyan-50/80 text-cyan-600 border-cyan-200/80 group-hover:bg-cyan-100/80 group-hover:border-cyan-300',
    rose: 'bg-rose-50/80 text-rose-600 border-rose-200/80 group-hover:bg-rose-100/80 group-hover:border-rose-300',
  };

  return (
    <div
      style={{ animationDelay: `${index * 70}ms` }}
      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-3 flex flex-col justify-between group cursor-default relative overflow-hidden animate-fade-in"
    >
      {/* Subtle hover accent light */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/5 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${schemeClasses[colorScheme]} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-sm`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between relative z-10">
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          <AnimatedCounter value={value} duration={900} />
        </div>
        {trend && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 transition-transform group-hover:scale-105">
            {trend}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 truncate relative z-10">
        {subtitle}
      </p>
    </div>
  );
}

