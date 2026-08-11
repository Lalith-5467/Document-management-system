'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, CheckCircle2, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  validateEmail,
  validateLoginPassword,
  updatePasswordStrength,
  getFieldStatusClasses
} from '@/lib/validation';

const customStyles = `
  @keyframes slideUpFade {
    0% { opacity: 0; transform: translateY(16px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slideUpFade 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .cream-hover-input {
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .cream-hover-input:hover {
    background-color: #FFFDF8 !important;
    border-color: #DFD2BA !important;
  }
  .cream-hover-input:focus {
    background-color: #FFFFFF !important;
  }
  .cream-hover-btn {
    transition: all 0.25s ease;
  }
  .cream-hover-btn:hover {
    background-color: #FFFDF5 !important;
    border-color: #DFD2BA !important;
    box-shadow: 0 4px 15px rgba(215, 195, 160, 0.3) !important;
    transform: translateY(-1px);
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FAF8F4] via-[#F4F1EA] to-[#ECE7DF] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden animate-fade-up">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* Professional Top Left Back Button with Cream Hover */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-[#E6E0D4] hover:border-[#DFD2BA] hover:bg-[#FFFDF5] text-slate-700 hover:text-slate-900 text-xs font-bold shadow-xs hover:shadow-md hover:shadow-[#DFD2BA]/30 transition-all duration-300 group cursor-pointer font-auth-heading hover:-translate-y-0.5 whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF6B00] group-hover:-translate-x-1 transition-transform duration-300 shrink-0" />
          <span>Back to Home Page</span>
        </Link>
      </div>

      {/* Ambient Warm Cream & Soft Glowing Spheres */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#F5EAD6]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-orange-500/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#FAF2E4]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Card Container with Smooth Float Entrance */}
      <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-xl rounded-[32px] p-8 sm:p-10 shadow-[0_25px_70px_rgba(40,30,15,0.06)] hover:shadow-[0_30px_80px_rgba(40,30,15,0.09)] border border-[#E8E1D5] relative z-10 my-auto animate-card-float transition-shadow duration-500">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-2 group">
            <div className="w-14 h-14 rounded-[22px] bg-[#FF6500] flex items-center justify-center text-white shadow-[0_12px_30px_rgba(255,101,0,0.35)] group-hover:scale-110 group-hover:shadow-[0_16px_35px_rgba(255,101,0,0.45)] transition-all duration-300">
              <ShieldCheck className="w-7 h-7 stroke-[2.2] group-hover:rotate-6 transition-transform duration-300" />
            </div>
          </Link>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight font-auth-heading">
            Sign In to <span className="text-[#FF6B00]">DocVault</span>
          </h2>
          <p className="text-[15px] text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
            Access your secure encrypted document vault and record storage
          </p>
        </div>

        {/* Global Server Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-[16px] bg-red-50 text-red-600 text-sm font-medium flex items-center gap-3 border border-red-100 animate-shake-subtle shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          
          {/* 1. Email Address Field */}
          <div className="group">
            <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className={`relative ${emailTouched && emailError ? 'animate-shake-subtle' : ''}`}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center pointer-events-none text-slate-400 group-hover:text-[#D96B00] group-focus-within:text-[#FF6B00] group-focus-within:scale-110 transition-all duration-200">
                <Mail className="w-5 h-5" />
              </div>
              <input
                ref={emailInputRef}
                type="text"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e as any); } }}
                placeholder="name@example.com"
                className={`w-full h-[54px] pl-12 pr-12 bg-white border ${
                  emailError 
                    ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/15' 
                    : 'border-[#E6E0D4] hover:border-[#DFD2BA] hover:bg-[#FFFDF8] focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-500/15 focus:bg-white'
                } rounded-[16px] text-[15px] text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-200 font-medium cream-hover-input`}
              />
              {emailTouched && emailRes.isValid && !emailError && (
                <CheckCircle2 className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-check-pop" />
              )}
            </div>
            {/* Inline Email Error Message */}
            {emailTouched && emailError && (
              <p className="text-red-500 text-[12px] font-medium tracking-wide flex items-center gap-1.5 mt-2 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          {/* 2. Password Field */}
          <div className="group">
            <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className={`relative ${passwordTouched && passwordError ? 'animate-shake-subtle' : ''}`}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center pointer-events-none text-slate-400 group-hover:text-[#D96B00] group-focus-within:text-[#FF6B00] group-focus-within:scale-110 transition-all duration-200">
                <Lock className="w-5 h-5" />
              </div>
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={handlePasswordBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e as any); } }}
                placeholder="••••••••"
                className={`w-full h-[54px] pl-12 pr-12 bg-white border ${
                  passwordError 
                    ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/15' 
                    : 'border-[#E6E0D4] hover:border-[#DFD2BA] hover:bg-[#FFFDF8] focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-500/15 focus:bg-white'
                } rounded-[16px] text-[15px] text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-200 font-medium cream-hover-input`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-[#FAF5EC] hover:text-[#D96B00] flex items-center justify-center text-slate-400 hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password Options */}
            <div className="flex items-center justify-between mt-3.5">
              <label 
                className="flex items-center gap-2.5 cursor-pointer group select-none"
              >
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                  className="sr-only" 
                />
                <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center shrink-0 transition-all duration-200 ${
                  rememberMe 
                    ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-xs scale-105' 
                    : 'bg-white border-[#D6CEBF] hover:border-[#FF6B00] hover:bg-[#FFFDF8]'
                }`}>
                  {rememberMe && <Check className="w-3.5 h-3.5 text-white stroke-[3] animate-check-pop" />}
                </div>
                <span className="text-[13.5px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                  Remember me for 30 days
                </span>
              </label>
              
              <Link 
                href="/forgot-password" 
                className="text-[13.5px] font-bold text-[#FF6B00] hover:text-[#D96000] hover:underline underline-offset-2 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Inline Password Error Message */}
            {passwordTouched && passwordError && (
              <p className="text-red-500 text-[12px] font-medium tracking-wide flex items-center gap-1.5 mt-2 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{passwordError}</span>
              </p>
            )}
          </div>

          {/* Submit Button with Shine Sweep and Lift */}
          <button
            type="submit"
            disabled={loading || (emailTouched && passwordTouched && !isFormValid)}
            className="group relative overflow-hidden w-full h-[54px] rounded-[16px] text-[15px] font-bold text-white bg-gradient-to-r from-[#FF6B00] via-[#F76400] to-[#E05500] hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4 cursor-pointer"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-in-out" />
            {loading ? (
              <div className="relative z-10 flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing In...</span>
              </div>
            ) : (
              <div className="relative z-10 flex items-center gap-2">
                <span>Sign In To Vault</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-6 border-t border-[#EAE2D2] mt-8">
          <p className="text-[14px] text-slate-500 font-medium">
            Don't have an account yet?{' '}
            <Link href="/register" className="font-bold text-[#FF6B00] hover:text-[#D96000] hover:underline underline-offset-4 ml-1 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

