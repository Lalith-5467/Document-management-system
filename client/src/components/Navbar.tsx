'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Menu, X, ArrowRight, LogIn } from 'lucide-react';
import { cmsStore, CMSNavItem } from '@/lib/cmsStore';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<CMSNavItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const unsub = cmsStore.subscribe((data) => {
      const activeNavs = (data.navigation || [])
        .filter(n => n.status === 'active')
        .sort((a, b) => a.displayOrder - b.displayOrder);
      setNavItems(activeNavs);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (url.startsWith('#')) {
      e.preventDefault();
      setMobileMenuOpen(false);
      const targetId = url.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-[9999] bg-white/95 backdrop-blur-xl text-slate-900 transition-shadow duration-300 animate-header-slide-down ${
        isScrolled ? 'shadow-md shadow-slate-900/10' : 'shadow-xs'
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 9999,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1B664B] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight leading-snug block font-auth-heading">
              DocVault
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                onClick={(e) => scrollToSection(e, item.url)}
                className="nav-link-animated text-sm font-bold text-slate-700 hover:text-[#1B664B] transition-colors py-1"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Top Right Action Buttons: Sign In and Get Started */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 h-9 sm:h-10 px-5 py-2 text-sm font-bold text-slate-800 bg-slate-100 border border-slate-200 hover:bg-[#E8F5F0] hover:text-[#1B664B] hover:border-[#D1EBE1] rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs group"
            >
              <LogIn className="w-3.5 h-3.5 text-[#1B664B] transition-transform group-hover:scale-110" />
              <span>Sign In</span>
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 h-9 sm:h-10 px-5 py-2 text-sm font-black text-white bg-[#1B664B] hover:bg-[#14523C] active:bg-[#0F402E] rounded-full shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-pop-in shadow-xl">
          <div className="flex flex-col space-y-1.5">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                onClick={(e) => scrollToSection(e, item.url)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:text-[#1B664B] hover:bg-[#E8F5F0] transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <Link
              href="/login"
              className="w-1/2 text-center py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 hover:bg-[#E8F5F0] hover:text-[#1B664B] hover:border-[#D1EBE1] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-1/2 text-center py-2.5 rounded-xl bg-[#1B664B] hover:bg-[#14523C] active:bg-[#0F402E] text-xs font-black text-white shadow-md transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      {/* Solid Scroll Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100/40 overflow-hidden pointer-events-none">
        <div
          className="h-full bg-[#1B664B] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </header>
  );
}
