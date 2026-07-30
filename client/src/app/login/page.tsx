'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
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
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-400/8 rounded-full blur-3xl pointer-events-none" />

      {/* Centered White Card Box */}
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200/90 shadow-2xl shadow-slate-900/8 space-y-6 relative z-10 my-auto">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center justify-center group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8A00] flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform border border-white/20">
              <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-auth-heading">
            Sign In to <span className="text-[#FF6B00]">DocVault</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto font-auth-body">
            Access your secure encrypted document vault and record storage
          </p>
        </div>

        {/* Global Server Error Message */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs font-semibold animate-fade-in font-auth-body">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form - Vanilla JS Validation without HTML5 popups */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* 1. Email Address Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-1.5 font-auth-label">
              Email Address
            </label>
            <div className="relative font-auth-body">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={emailInputRef}
                type="text"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e as any); } }}
                placeholder="name@example.com"
                className={`w-full pl-10 pr-10 py-3 bg-white border rounded-[14px] text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium font-auth-body ${getFieldStatusClasses(emailTouched, emailRes.isValid, emailError)}`}
              />
              {emailTouched && emailRes.isValid && !emailError && (
                <CheckCircle2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
              )}
            </div>
            {/* Inline Email Error Message */}
            {emailTouched && emailError && (
              <p className="text-red-500 text-[11px] font-semibold tracking-wide flex items-center gap-1.5 mt-1.5 animate-fade-in font-auth-body">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          {/* 2. Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-900 font-auth-label">
                Password
              </label>
            </div>
            <div className="relative font-auth-body">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={handlePasswordBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e as any); } }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 bg-white border rounded-[14px] text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium font-auth-body ${getFieldStatusClasses(passwordTouched, passRes.isValid, passwordError)}`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div className="mt-2.5 space-y-1 animate-fade-in font-auth-body">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-500 font-auth-label uppercase">Password Strength</span>
                  <span className={strength.color}>{strength.label}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.bgColor} transition-all duration-500 rounded-full`}
                    style={{ width: strength.width }}
                  />
                </div>
              </div>
            )}

            {/* Inline Password Error Message */}
            {passwordTouched && passwordError && (
              <p className="text-red-500 text-[11px] font-semibold tracking-wide flex items-center gap-1.5 mt-1.5 animate-fade-in font-auth-body">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{passwordError}</span>
              </p>
            )}
          </div>

          {/* Submit Button (Disabled until form is valid) */}
          <button
            type="submit"
            disabled={loading || (emailTouched && passwordTouched && !isFormValid)}
            className="w-full py-4 px-6 rounded-2xl text-xs sm:text-sm font-black tracking-wider uppercase text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] hover:brightness-110 shadow-lg shadow-orange-500/30 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 mt-4 cursor-pointer font-auth-heading"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Vault</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-[#E8E8E8]">
          <p className="text-xs text-[#6B7280] font-medium font-auth-body">
            Don't have an account yet?{' '}
            <Link href="/register" className="font-black text-[#FF6B00] hover:underline transition-all font-auth-heading">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Back to Home Page Link */}
      <div className="text-center py-4 relative z-10">
        <Link href="/" className="text-xs font-bold text-[#6B7280] hover:text-[#FF6B00] transition-colors inline-flex items-center gap-1">
          ← Back to Home Page
        </Link>
      </div>
    </div>
  );
}
