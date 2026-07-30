'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Upload, Layers, Search,
  Sparkles, LogIn,
} from 'lucide-react';
import { cmsStore, CMSCarouselSlide } from '@/lib/cmsStore';

export default function FloatingArrowHeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<CMSCarouselSlide[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const DURATION = 4500;

  useEffect(() => {
    const unsub = cmsStore.subscribe((data) => {
      const active = (data.carousel || []).filter(s => s.status === 'active');
      setSlides(active);
    });
    return unsub;
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (slides.length === 0) return;
    timerRef.current = setInterval(nextSlide, DURATION);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, slides.length]);

  // Reset current if out of bounds
  useEffect(() => {
    if (current >= slides.length && slides.length > 0) {
      setCurrent(0);
    }
  }, [slides.length, current]);

  if (slides.length === 0) return null;

  const currSlide = slides[current];

  const accentGradient = currSlide.accentGradient || 'from-[#FF6B00] via-[#F97316] to-[#FF8A00]';
  const btnBg = `bg-gradient-to-r ${accentGradient} hover:brightness-110 shadow-orange-500/30`;

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 overflow-hidden">
      {/* Background Glow Effect */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] rounded-full blur-[150px] pointer-events-none transition-all duration-700 opacity-20"
        style={{ backgroundColor: '#FF6B00' }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[500px]">
        {/* Left Column: Hero Text Content */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-xs font-black tracking-wider text-[#FF6B00] shadow-xs">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <span>{currSlide.badge}</span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              {currSlide.title}{' '}
              <span className={`bg-gradient-to-r ${accentGradient} bg-clip-text text-transparent block sm:inline`}>
                {currSlide.highlight}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
              {currSlide.sub}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href={currSlide.primaryCtaHref || '/register'}
              className={`px-6 py-3.5 rounded-2xl text-white text-xs font-black shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 ${btnBg}`}
            >
              <span>{currSlide.primaryCtaLabel || 'Get Started'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={currSlide.secondaryCtaHref || '/login'}
              className="px-6 py-3.5 rounded-2xl bg-[#09090B] text-white border border-zinc-800 hover:bg-black text-xs font-black shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-[#FF6B00]" />
              <span>{currSlide.secondaryCtaLabel || 'Sign In'}</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Slide Image */}
        <div className="lg:col-span-6 w-full h-full flex flex-col justify-center relative">
          <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[480px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xl shadow-slate-900/15 bg-white group">
            <img
              key={currSlide.id}
              src={currSlide.slideImage}
              alt={currSlide.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 animate-page-fade"
            />
          </div>
        </div>
      </div>

      {/* Floating Left and Right Navigation Arrow Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md text-[#FF6B00] border border-slate-200/90 shadow-xl flex items-center justify-center hover:bg-[#FF6B00] hover:text-white hover:border-[#FF6B00] hover:scale-110 active:scale-95 transition-all duration-200"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md text-[#FF6B00] border border-slate-200/90 shadow-xl flex items-center justify-center hover:bg-[#FF6B00] hover:text-white hover:border-[#FF6B00] hover:scale-110 active:scale-95 transition-all duration-200"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Carousel Dots Indicator */}
      <div className="flex items-center justify-center gap-2 pt-6 relative z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === current
                ? 'w-8 bg-[#FF6B00]'
                : 'w-2.5 bg-zinc-300 hover:bg-zinc-400'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
