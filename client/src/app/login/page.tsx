'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, CheckCircle2, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  validateEmail,
  validateLoginPassword,
  updatePasswordStrength,
  getFieldStatusClasses
} from '@/lib/validation';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Field Touched States
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Field Error States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Field Refs for Auto-Focus on invalid submit
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Password Strength
  const strength = updatePasswordStrength(password);

  // ─── Real-Time Field Validation ──────────────────────────────

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailTouched) {
      const res = validateEmail(val);
      setEmailError(res.error);
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    const res = validateEmail(email);
    setEmailError(res.error);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (passwordTouched) {
      const res = validateLoginPassword(val);
      setPasswordError(res.error);
    }
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    const res = validateLoginPassword(password);
    setPasswordError(res.error);
  };

  // Re-evaluate validity whenever inputs change
  const emailRes = validateEmail(email);
  const passRes = validateLoginPassword(password);
  const isFormValid = emailRes.isValid && passRes.isValid;

  // Toggle Password Visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Mark all fields as touched to trigger inline errors
    setEmailTouched(true);
    setPasswordTouched(true);

    const emailCheck = validateEmail(email);
    const passCheck = validateLoginPassword(password);

    setEmailError(emailCheck.error);
    setPasswordError(passCheck.error);

    // Auto-focus on the first invalid field
    if (!emailCheck.isValid) {
      emailInputRef.current?.focus();
      return;
    }
    if (!passCheck.isValid) {
      passwordInputRef.current?.focus();
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      router.push('/user');
    } else {
      setErrorMsg(result.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden animate-fade-up">
      {/* Centered White Card Box */}
      <div className="w-full max-w-[460px] bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.04)] space-y-8 relative z-10 my-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center justify-center group mb-2">
            <div className="w-[60px] h-[60px] rounded-[20px] bg-[#FF6B00] flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
            </div>
          </Link>
          <h2 className="text-[32px] font-black text-[#1A1A1A] tracking-tight leading-tight">
            Sign In to <span className="text-[#FF6B00]">DocVault</span>
          </h2>
          <p className="text-[15px] text-[#64748B] font-medium leading-relaxed max-w-[320px] mx-auto">
            Access your secure encrypted document vault and record storage
          </p>
        </div>

        {/* Global Server Error Message */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-[14px] font-semibold animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* 1. Email Address Field */}
          <div>
            <label className="block text-[13px] font-black uppercase tracking-wide text-[#1A1A1A] mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={emailInputRef}
                type="text"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e as any); } }}
                placeholder="name@example.com"
                className={`w-full h-[56px] pl-12 pr-12 bg-white border ${emailError ? 'border-red-300' : 'border-slate-200 focus:border-[#FF6B00]'} rounded-[16px] text-[15px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 font-medium`}
              />
              {emailTouched && emailRes.isValid && !emailError && (
                <CheckCircle2 className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
              )}
            </div>
            {/* Inline Email Error Message */}
            {emailTouched && emailError && (
              <p className="text-red-500 text-[12px] font-semibold tracking-wide flex items-center gap-1.5 mt-2 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          {/* 2. Password Field */}
          <div>
            <label className="block text-[13px] font-black uppercase tracking-wide text-[#1A1A1A] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={handlePasswordBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e as any); } }}
                placeholder="••••••••"
                className={`w-full h-[56px] pl-12 pr-12 bg-white border ${passwordError ? 'border-red-300' : 'border-slate-200 focus:border-[#FF6B00]'} rounded-[16px] text-[15px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 font-medium`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Professional Login Options */}
            <div className="flex items-center justify-between mt-4 mb-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="w-[18px] h-[18px] rounded-[4px] border border-slate-300 flex items-center justify-center group-hover:border-slate-400 transition-colors">
                  <input 
                    type="checkbox" 
                    className="opacity-0 absolute w-0 h-0" 
                  />
                  <Check className="w-3.5 h-3.5 text-transparent" />
                </div>
                <span className="text-[14px] font-medium text-[#64748B] group-hover:text-slate-700 transition-colors">
                  Remember me for 30 days
                </span>
              </label>
              
              <Link 
                href="/forgot-password" 
                className="text-[14px] font-black text-[#FF6B00] hover:text-[#E65C00] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Inline Password Error Message */}
            {passwordTouched && passwordError && (
              <p className="text-red-500 text-[12px] font-semibold tracking-wide flex items-center gap-1.5 mt-2 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{passwordError}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (emailTouched && passwordTouched && !isFormValid)}
            className="w-full h-[56px] rounded-[16px] text-[15px] font-black tracking-wide uppercase text-white bg-[#FF6B00] hover:brightness-110 shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In To Vault</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-8 border-t border-slate-100 mt-8">
          <p className="text-[14px] text-[#64748B] font-medium">
            Don't have an account yet?{' '}
            <Link href="/register" className="font-black text-[#FF6B00] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Back to Home Page Link */}
      <div className="text-center mt-8 relative z-10">
        <Link href="/" className="text-[14px] font-bold text-[#64748B] hover:text-[#1A1A1A] transition-colors inline-flex items-center gap-2">
          ← Back to Home Page
        </Link>
      </div>
    </div>
  );
}
