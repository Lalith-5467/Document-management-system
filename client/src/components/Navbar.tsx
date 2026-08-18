'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Menu, X, ArrowRight, LogIn, Sun, Moon } from 'lucide-react';
import { cmsStore, CMSNavItem } from '@/lib/cmsStore';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<CMSNavItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { theme, toggleTheme } = useTheme();

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
      className={`fixed top-0 left-0 right-0 w-full z-[9999] bg-white/95 dark:bg-[#0B1F17]/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-[#35D99A]/15 text-slate-900 dark:text-[#F5F7F6] transition-all duration-300 animate-header-slide-down ${
        isScrolled ? 'shadow-md shadow-slate-900/10 dark:shadow-black/40' : 'shadow-xs'
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
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#087443] dark:bg-[#19A974] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="font-black text-xl sm:text-2xl text-[#087443] dark:text-[#F5F7F6] tracking-tight leading-snug block font-auth-heading">
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
                className="nav-link-animated text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-[#087443] dark:hover:text-[#35D99A] transition-colors py-1"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Top Right Action Buttons: Theme Toggle, Sign In, Get Started */}
          <div className="hidden md:flex items-center gap-3">
            {/* Global Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 h-9 sm:h-10 px-3.5 rounded-full bg-slate-100 dark:bg-[#0E281E] border border-slate-200 dark:border-[#35D99A]/20 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-2xs group"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-4 h-4 text-[#35D99A] fill-[#35D99A]/20 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-xs font-bold text-[#35D99A] font-auth-heading">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-[#087443] fill-[#087443]/20 group-hover:rotate-45 transition-transform duration-300" />
                  <span className="text-xs font-bold text-[#087443] font-auth-heading">Light</span>
                </>
              )}
            </button>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 h-9 sm:h-10 px-5 py-2 text-sm font-bold text-slate-800 dark:text-[#F5F7F6] bg-slate-100 dark:bg-[#0E281E] border border-slate-200 dark:border-[#35D99A]/20 hover:bg-[#EEF6F2] dark:hover:bg-[#123325] hover:text-[#087443] dark:hover:text-[#35D99A] rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs group"
            >
              <LogIn className="w-3.5 h-3.5 text-[#087443] dark:text-[#35D99A] transition-transform group-hover:scale-110" />
              <span>Sign In</span>
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 h-9 sm:h-10 px-5 py-2 text-sm font-black text-white bg-[#087443] dark:bg-[#19A974] hover:bg-[#065F36] dark:hover:bg-[#35D99A] dark:hover:text-[#07110D] active:scale-95 rounded-full shadow-md transition-all duration-200 hover:scale-105"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0E281E] transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Moon className="w-5 h-5 text-[#35D99A]" /> : <Sun className="w-5 h-5 text-[#087443]" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0E281E] focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 dark:bg-[#0B1F17]/98 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-pop-in shadow-xl">
          <div className="flex flex-col space-y-1.5">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                onClick={(e) => scrollToSection(e, item.url)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-[#087443] dark:hover:text-[#35D99A] hover:bg-[#EEF6F2] dark:hover:bg-[#0E281E] transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/login"
              className="w-1/2 text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0E281E] text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-[#EEF6F2] dark:hover:bg-[#123325] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-1/2 text-center py-2.5 rounded-xl bg-[#087443] dark:bg-[#19A974] text-xs font-black text-white shadow-md transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      {/* Solid Scroll Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100/40 dark:bg-slate-800/40 overflow-hidden pointer-events-none">
        <div
          className="h-full bg-[#087443] dark:bg-[#19A974] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </header>
  );
}
