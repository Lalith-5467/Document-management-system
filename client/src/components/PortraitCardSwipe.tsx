'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  ShieldCheck, Lock, Search, Layers, Zap, FolderGit2, GraduationCap,
  FileText, Award, Briefcase, UserCheck, HardDrive, Database, Globe,
  ArrowRight, CheckCircle2, Shield, ChevronLeft, ChevronRight
} from 'lucide-react';
import { CMSFeature } from '@/lib/cmsStore';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck, Lock, Search, Layers, Zap, FolderGit2, GraduationCap,
  FileText, Award, Briefcase, UserCheck, HardDrive, Database, Globe
};

const PORTRAIT_COLOR_SCHEMES = [
  {
    border: 'border-[#D1EBE1] dark:border-emerald-800/80 hover:border-[#1B664B]',
    iconBg: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    badge: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    bulletCheck: 'text-[#1B664B]',
    bullets: ['AES-256 Bit Encryption', 'Zero-Knowledge Isolation', 'Tamper-Proof Integrity']
  },
  {
    border: 'border-[#D1EBE1] dark:border-emerald-800/80 hover:border-[#1B664B]',
    iconBg: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    badge: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    bulletCheck: 'text-[#1B664B]',
    bullets: ['Full-Text OCR Search', 'Sub-100ms Indexing', 'Tag & Keyword Filtering']
  },
  {
    border: 'border-[#D1EBE1] dark:border-emerald-800/80 hover:border-[#1B664B]',
    iconBg: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    badge: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    bulletCheck: 'text-[#1B664B]',
    bullets: ['Auto-Category Tagging', 'Smart Metadata Extract', 'Folder Hierarchy Sync']
  },
  {
    border: 'border-[#D1EBE1] dark:border-emerald-800/80 hover:border-[#1B664B]',
    iconBg: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    badge: 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1]',
    bulletCheck: 'text-[#1B664B]',
    bullets: ['Strict RBAC Control', 'Audit Logs & Trails', 'Granular File Permissions']
  }
];

interface PortraitCardSwipeProps {
  features: CMSFeature[];
}

export default function PortraitCardSwipe({ features }: PortraitCardSwipeProps) {
  if (!features || features.length === 0) return null;

  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive Cards Per Page (Desktop: 3, Tablet: 2, Mobile: 1)
  const [cardsPerPage, setCardsPerPage] = useState<number>(3);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Drag tracking refs
  const startXRef = useRef<number>(0);
  const currentDragRef = useRef<number>(0);
  const lastXRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);

  // Detect responsive viewport width
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setCardsPerPage(1); // Mobile: 1 complete card
      } else if (w < 1024) {
        setCardsPerPage(2); // Tablet: 2 complete cards
      } else {
        setCardsPerPage(3); // Desktop: 3 complete cards
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Group features into complete page sets
  const featurePages = useMemo(() => {
    const pages: CMSFeature[][] = [];
    for (let i = 0; i < features.length; i += cardsPerPage) {
      pages.push(features.slice(i, i + cardsPerPage));
    }
    return pages;
  }, [features, cardsPerPage]);

  const totalPages = featurePages.length;

  // Clamp pageIndex if cardsPerPage changes
  useEffect(() => {
    if (pageIndex >= totalPages) {
      setPageIndex(Math.max(0, totalPages - 1));
    }
  }, [totalPages, pageIndex]);

  // Navigate to target page
  const goToPage = useCallback((target: number) => {
    const clamped = Math.max(0, Math.min(totalPages - 1, target));
    setIsAnimating(true);
    setPageIndex(clamped);
    setDragOffset(0);
    currentDragRef.current = 0;

    setTimeout(() => {
      setIsAnimating(false);
    }, 350);
  }, [totalPages]);

  // Pointer Handlers for Mouse & Touch Dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== undefined && e.button !== 0) return;

    setIsDragging(true);
    setIsAnimating(false);
    hasMovedRef.current = false;

    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    currentDragRef.current = 0;

    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 5) {
      hasMovedRef.current = true;
    }

    const now = performance.now();
    const timeDelta = now - lastTimeRef.current;
    if (timeDelta > 0) {
      velocityRef.current = (e.clientX - lastXRef.current) / timeDelta;
      lastXRef.current = e.clientX;
      lastTimeRef.current = now;
    }

    let effectiveDelta = deltaX;
    const isFirstPage = pageIndex === 0;
    const isLastPage = pageIndex === totalPages - 1;

    // Apply smooth rubber-band resistance at boundary pages
    if ((isFirstPage && deltaX > 0) || (isLastPage && deltaX < 0)) {
      effectiveDelta = deltaX * 0.22;
    }

    currentDragRef.current = effectiveDelta;
    setDragOffset(effectiveDelta);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }

    const deltaX = currentDragRef.current;
    const velocity = velocityRef.current;
    const threshold = 60; // minimum drag pixels to trigger page transition

    let nextIndex = pageIndex;
    if (deltaX < -threshold || velocity < -0.3) {
      nextIndex = pageIndex + 1;
    } else if (deltaX > threshold || velocity > 0.3) {
      nextIndex = pageIndex - 1;
    }

    goToPage(nextIndex);
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToPage(pageIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPage(pageIndex - 1);
    }
  };

  const renderIcon = (iconName: string, fallback: React.ComponentType<{ className?: string }> = Zap) => {
    const Component = ICON_MAP[iconName] || fallback;
    return <Component className="w-6 h-6" />;
  };

  return (
    <div 
      className="w-full relative pt-2 pb-4 outline-none select-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Interactive Feature Cards Group View"
    >
      {/* Header Controls Bar: Next/Previous Cards Navigation */}
      <div className="flex items-center justify-between pb-3 px-1 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
            Page {pageIndex + 1} of {totalPages}
          </span>
        </div>

        {/* Arrow Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(pageIndex - 1)}
            disabled={pageIndex === 0}
            className={`p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-center ${
              pageIndex === 0 
                ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400' 
                : 'bg-white hover:bg-[#1B664B] hover:text-white border-[#D1EBE1] text-[#1B664B] shadow-sm hover:scale-105 active:scale-95'
            }`}
            title="Previous Group of Cards"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            onClick={() => goToPage(pageIndex + 1)}
            disabled={pageIndex === totalPages - 1}
            className={`px-4 py-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-2 font-bold text-xs ${
              pageIndex === totalPages - 1 
                ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400' 
                : 'bg-[#1B664B] text-white hover:bg-[#14523C] border-[#1B664B] shadow-md shadow-emerald-950/20 hover:scale-105 active:scale-95'
            }`}
            title="Next Group of Cards"
          >
            <span>Next Cards</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewport Container (Strict Overflow Clipping - 0 Partial Cards) */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full overflow-hidden cursor-grab active:cursor-grabbing py-2"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Track Container holding Page Groups */}
        <div
          className="flex w-full"
          style={{
            transform: `translate3d(calc(-${pageIndex * 100}% + ${dragOffset}px), 0px, 0px)`,
            transitionDuration: isAnimating ? '350ms' : '0ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {featurePages.map((pageGroup, pIdx) => (
            <div
              key={pIdx}
              className={`w-full shrink-0 grid gap-6 px-1 ${
                cardsPerPage === 3 
                  ? 'grid-cols-3' 
                  : cardsPerPage === 2 
                  ? 'grid-cols-2' 
                  : 'grid-cols-1'
              }`}
            >
              {pageGroup.map((feat, fIdx) => {
                const globalIndex = pIdx * cardsPerPage + fIdx;
                const scheme = PORTRAIT_COLOR_SCHEMES[globalIndex % PORTRAIT_COLOR_SCHEMES.length];

                return (
                  <div
                    key={feat.id}
                    className={`
                      w-full bg-white border ${scheme.border}
                      rounded-[28px] p-7 flex flex-col justify-between relative overflow-hidden group 
                      shadow-xs hover:shadow-xl hover:border-[#1B664B] hover:-translate-y-1.5 hover:scale-[1.015]
                      transition-all duration-300 min-h-[380px] cursor-pointer
                      ${isDragging ? 'pointer-events-none' : ''}
                    `}
                  >
                    {/* Top Accent Ambient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#E8F5F0]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Card Header: Icon & Badge */}
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-14 h-14 rounded-2xl ${scheme.iconBg} border flex items-center justify-center shadow-xs group-hover:scale-[1.08] group-hover:-translate-y-1 transition-all duration-300`}>
                          {renderIcon(feat.icon, Shield)}
                        </div>
                        <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-3 py-1 rounded-full border ${scheme.badge}`}>
                          Capability #{globalIndex + 1}
                        </span>
                      </div>

                      {/* Card Title & Description */}
                      <div className="space-y-2 pt-2">
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-[#1B664B] transition-colors font-auth-heading tracking-tight leading-snug">
                          {feat.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed line-clamp-3">
                          {feat.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Middle: Feature Checkpoints */}
                    <div className="relative z-10 space-y-2.5 pt-4 border-t border-slate-100 mt-4">
                      {scheme.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${scheme.bulletCheck}`} />
                          <span className="truncate">{bullet}</span>
                        </div>
                      ))}
                    </div>

                    {/* Card Footer: Action Link */}
                    <div className="relative z-10 pt-4 flex items-center justify-between border-t border-slate-100/80 mt-4">
                      <span className="text-xs font-black text-slate-900 group-hover:text-[#1B664B] transition-colors">
                        Explore Feature
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-700 group-hover:bg-[#1B664B] group-hover:text-white group-hover:border-[#1B664B] flex items-center justify-center transition-all duration-200">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
