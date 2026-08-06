'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export interface ActionOption {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  actionOption?: ActionOption;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
  disabled = false,
  actionOption
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value)) || options[0];

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative inline-block font-sans ${className}`} ref={dropdownRef}>
      {/* Select Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(p => !p)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-white border rounded-2xl text-xs font-black text-slate-800 shadow-2xs transition-all cursor-pointer ${
          isOpen ? 'border-themePrimary ring-2 ring-orange-500/20 shadow-md' : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/40'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="truncate max-w-[180px]">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-themePrimary' : ''}`} />
      </button>

      {/* Floating Orange Hover Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 min-w-[230px] w-full bg-white border border-slate-200/90 rounded-2xl shadow-2xl py-1.5 z-[100] max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={String(opt.value) + opt.label}
                  onClick={() => {
                    onChange(String(opt.value));
                    setIsOpen(false);
                  }}
                  className={`group flex items-center justify-between px-3.5 py-2.5 mx-1.5 my-0.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white shadow-md shadow-orange-500/20 font-black'
                      : 'text-slate-700 hover:bg-gradient-to-r hover:from-themePrimary hover:to-[#F97316] hover:text-white hover:shadow-md hover:shadow-orange-500/20'
                  }`}
                >
                  <span className="truncate flex-1">{opt.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 shrink-0 text-white" />
                  )}
                </div>
              );
            })}
          </div>

          {actionOption && (
            <div className="pt-1.5 mt-1 border-t border-slate-100 px-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  actionOption.onClick();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-themePrimary hover:bg-orange-50 transition cursor-pointer font-auth-heading text-left"
              >
                {actionOption.icon || <Plus className="w-4 h-4 text-themePrimary shrink-0" />}
                <span className="truncate">{actionOption.label}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
