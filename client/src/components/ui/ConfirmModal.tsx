'use client';

import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Info, CheckCircle2, Loader2, Trash2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
  icon?: React.ReactNode;
  maxWidth?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  icon,
  maxWidth = 'max-w-md'
}: ConfirmModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400',
          defaultIcon: <Trash2 className="w-6 h-6 text-rose-500" />,
          buttonBg: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/25',
          defaultConfirmText: 'Delete'
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400',
          defaultIcon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
          buttonBg: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/25',
          defaultConfirmText: 'Proceed'
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400',
          defaultIcon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
          buttonBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25',
          defaultConfirmText: 'Confirm'
        };
      case 'info':
      default:
        return {
          iconBg: 'bg-themePrimary/10 text-themePrimary dark:bg-themePrimary/20',
          defaultIcon: <Info className="w-6 h-6 text-themePrimary" />,
          buttonBg: 'bg-gradient-to-r from-themePrimary to-[#F97316] hover:brightness-110 text-white shadow-lg shadow-orange-500/25',
          defaultConfirmText: 'Confirm'
        };
    }
  };

  const vStyles = getVariantStyles();
  const finalConfirmText = confirmText || vStyles.defaultConfirmText;
  const displayIcon = icon || vStyles.defaultIcon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      showCloseButton={!isLoading}
      preventBackdropClick={isLoading}
      hideHeader
    >
      <div className="pt-2 pb-1 space-y-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${vStyles.iconBg}`}>
            {displayIcon}
          </div>
          <div className="space-y-1 min-w-0 flex-1 pt-0.5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-auth-heading">
              {title}
            </h3>
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-auth-body">
              {description}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50 ${vStyles.buttonBg}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{finalConfirmText}</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
