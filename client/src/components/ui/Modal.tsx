'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

let activeModalCount = 0;

function lockScroll() {
  if (typeof document === 'undefined') return;
  activeModalCount++;
  if (activeModalCount === 1) {
    document.body.style.overflow = 'hidden';
  }
}

function unlockScroll() {
  if (typeof document === 'undefined') return;
  activeModalCount = Math.max(0, activeModalCount - 1);
  if (activeModalCount === 0) {
    document.body.style.overflow = '';
  }
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
  preventBackdropClick?: boolean;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
  containerClassName?: string;
  bodyClassName?: string;
  hideHeader?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'max-w-lg',
  showCloseButton = true,
  preventBackdropClick = false,
  headerExtra,
  footer,
  containerClassName = '',
  bodyClassName = '',
  hideHeader = false
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    lockScroll();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unlockScroll();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof window === 'undefined' || !document || !document.body) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!preventBackdropClick && e.target === backdropRef.current) {
      onClose();
    }
  };

  return createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md transition-all duration-200 animate-fade-in font-auth-body overflow-hidden"
    >
      <div
        className={`relative z-[100000] w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col text-slate-900 dark:text-white animate-pop-in my-auto overflow-hidden max-h-[calc(100dvh-32px)] ${maxWidth} ${containerClassName}`}
      >
        {/* Optional Modal Header */}
        {!hideHeader && (title || showCloseButton) && (
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3 pr-4 min-w-0">
              {icon && <div className="shrink-0">{icon}</div>}
              <div className="min-w-0">
                {title && (
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading truncate">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-auth-body truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerExtra}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Content Body */}
        <div className={`flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 min-h-0 text-sm font-auth-body ${bodyClassName}`}>
          {children}
        </div>

        {/* Optional Modal Footer */}
        {footer && (
          <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
