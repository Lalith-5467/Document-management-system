'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Search, Layers, Zap, FolderGit2, GraduationCap,
  FileText, Award, Briefcase, UserCheck, HardDrive, Database, Globe,
  ChevronUp, ChevronDown, Sparkles, ArrowRight, CheckCircle2, Shield
} from 'lucide-react';
import { CMSFeature } from '@/lib/cmsStore';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck, Lock, Search, Layers, Zap, FolderGit2, GraduationCap,
  FileText, Award, Briefcase, UserCheck, HardDrive, Database, Globe
};

const COLOR_SCHEMES = [
  {
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    border: 'border-emerald-200 dark:border-emerald-800/80',
    hoverBorder: 'group-hover:border-emerald-500',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tagBg: 'bg-emerald-50/80 text-emerald-800 border-emerald-200/60',
    glow: 'shadow-emerald-500/10',
    accentColor: '#10B981'
  },
  {
    gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    border: 'border-[#D1EBE1] dark:border-amber-800/80',
    hoverBorder: 'group-hover:border-amber-500',
    iconBg: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    badgeBg: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    tagBg: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    glow: 'shadow-emerald-950/20',
    accentColor: '#1B664B'
  },
  {
    gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    border: 'border-purple-200 dark:border-purple-800/80',
    hoverBorder: 'group-hover:border-purple-500',
    iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    tagBg: 'bg-purple-50/80 text-purple-800 border-purple-200/60',
    glow: 'shadow-purple-500/10',
    accentColor: '#8B5CF6'
  },
  {
    gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    border: 'border-blue-200 dark:border-blue-800/80',
    hoverBorder: 'group-hover:border-blue-500',
    iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    tagBg: 'bg-blue-50/80 text-blue-800 border-blue-200/60',
    glow: 'shadow-blue-500/10',
    accentColor: '#3B82F6'
  },
  {
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    border: 'border-[#D1EBE1] dark:border-emerald-800/80',
    hoverBorder: 'group-hover:border-[#1B664B]',
    iconBg: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    badgeBg: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    tagBg: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    glow: 'shadow-emerald-500/10',
    accentColor: '#1B664B'
  },
  {
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    border: 'border-[#D1EBE1] dark:border-emerald-800/80',
    hoverBorder: 'group-hover:border-[#1B664B]',
    iconBg: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    badgeBg: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    tagBg: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    glow: 'shadow-emerald-500/10',
    accentColor: '#1B664B'
  }
];

interface VerticalCardStackProps {
  features: CMSFeature[];
}

export default function VerticalCardStack({ features }: VerticalCardStackProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  if (!features || features.length === 0) return null;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % features.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;

    // Swipe up -> Next card, Swipe down -> Prev card
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    setTouchStart(null);
  };

  const renderIcon = (iconName: string, fallback: React.ComponentType<{ className?: string }> = Zap) => {
    const Component = ICON_MAP[iconName] || fallback;
    return <Component className="w-6 h-6" />;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Navigation Pills & Counter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2">
          {features.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activeIndex === idx
                  ? 'w-8 bg-[#1B664B] shadow-md'
                  : 'w-2.5 bg-slate-200 hover:bg-[#1B664B]'
              }`}
              title={`View Feature ${idx + 1}`}
            />
          ))}
          <span className="ml-2 text-xs font-mono font-bold text-slate-500">
            {activeIndex + 1} / {features.length}
          </span>
        </div>

        {/* Up / Down Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:border-[#1B664B] hover:text-[#1B664B] hover:bg-[#E8F5F0] transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="Previous Vertical Card"
          >
            <ChevronUp className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <button
            onClick={handleNext}
            className="p-2.5 rounded-2xl bg-[#1B664B] hover:bg-[#14523C] active:bg-[#0F402E] text-white font-bold transition-all duration-200 shadow-md hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1 text-xs"
            title="Next Vertical Card"
          >
            <span className="hidden sm:inline">Next Card</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Vertical Card Stack Container */}
      <div
        className="relative min-h-[380px] sm:min-h-[340px] w-full flex items-center justify-center touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {features.map((feat, idx) => {
          // Calculate relative position offset from active card
          let offset = idx - activeIndex;
          if (offset < 0) offset += features.length; // wrap around for loop

          const isCurrent = offset === 0;
          const isNext = offset === 1;
          const isSecondNext = offset === 2;

          // Compute 3D vertical stacking transformations
          let translateY = 0;
          let scale = 1;
          let opacity = 1;
          let zIndex = features.length - offset;

          if (isCurrent) {
            translateY = 0;
            scale = 1;
            opacity = 1;
          } else if (isNext) {
            translateY = 24; // 24px vertical offset down
            scale = 0.95;
            opacity = 0.75;
          } else if (isSecondNext) {
            translateY = 48; // 48px vertical offset down
            scale = 0.90;
            opacity = 0.45;
          } else {
            // Hidden cards stacked deeper in background
            translateY = 64;
            scale = 0.85;
            opacity = 0;
            zIndex = 0;
          }

          const colorScheme = COLOR_SCHEMES[idx % COLOR_SCHEMES.length];

          return (
            <div
              key={feat.id}
              onClick={() => setActiveIndex(idx)}
              style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                opacity: opacity,
                zIndex: zIndex,
                transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
              className={`absolute inset-x-0 mx-auto max-w-3xl bg-white border ${
                isCurrent ? `${colorScheme.border} shadow-2xl ${colorScheme.glow}` : 'border-slate-200/80 shadow-md'
              } rounded-[28px] p-6 sm:p-8 cursor-pointer select-none transition-all overflow-hidden group`}
            >
              {/* Top Decorative Ambient Gradient Bar */}
              <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${colorScheme.gradient}`} />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-14 h-14 rounded-2xl ${colorScheme.iconBg} border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {renderIcon(feat.icon, Shield)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${colorScheme.badgeBg} font-mono`}>
                        Capabilities #{idx + 1}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 animate-pulse">
                          Active View
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-auth-heading">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
                    isCurrent
                      ? 'bg-slate-900 text-white hover:bg-[#1B664B] hover:border-[#1B664B] shadow-md'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{isCurrent ? 'Next Capability' : 'Select Card'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
