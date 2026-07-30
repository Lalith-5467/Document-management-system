'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  validateEmail,
  validateLoginPassword,
  updatePasswordStrength,
  getFieldStatusClasses
} from '@/lib/validation';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@dms.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Field Touched States
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Field Error States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Field Refs
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const strength = updatePasswordStrength(password);

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

  const emailRes = validateEmail(email);
  const passRes = validateLoginPassword(password);
  const isFormValid = emailRes.isValid && passRes.isValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    setEmailTouched(true);
    setPasswordTouched(true);

    const emailCheck = validateEmail(email);
    const passCheck = validateLoginPassword(password);

    setEmailError(emailCheck.error);
    setPasswordError(passCheck.error);

    if (!emailCheck.isValid) {
      emailRef.current?.focus();
      return;
    }
    if (!passCheck.isValid) {
      passwordRef.current?.focus();
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      const savedUser = localStorage.getItem('dms_user');
      let isUserAdmin = false;
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.user_type === 'admin' || parsed.role === 'admin' || email.toLowerCase().includes('admin')) {
            isUserAdmin = true;
          }
        } catch (e) {}
      }

      if (isUserAdmin || email.toLowerCase().includes('admin')) {
        router.push('/admin');
      } else {
        setErrorMsg('Access Denied: Account does not possess Administrator authorization.');
      }
    } else {
      setErrorMsg(result.message || 'Authentication failed. Please verify admin credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Glow effect background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <KeyRound className="w-8 h-8" />
            </div>
          </Link>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-2xs font-bold uppercase tracking-widest border border-blue-500/20 mb-2 font-auth-label">
              System Administration
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight font-auth-heading">
              DocVault Admin Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-auth-body">
              Protected authentication gateway for authorized system administrators
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 font-auth-body">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-start gap-3 text-rose-200 text-xs leading-relaxed animate-fade-in font-auth-body">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-auth-label">
                Administrator Email
              </label>
              <div className="relative font-auth-body">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  ref={emailRef}
                  type="text"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="admin@dms.com"
                  className={`w-full pl-11 pr-11 py-3 bg-slate-950 border rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none transition-all font-auth-body ${getFieldStatusClasses(emailTouched, emailRes.isValid, emailError)}`}
                />
                {emailTouched && emailRes.isValid && !emailError && (
                  <CheckCircle2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                )}
              </div>
              {emailTouched && emailError && (
                <p className="text-rose-400 text-[11px] font-semibold flex items-center gap-1.5 mt-1.5 animate-fade-in font-auth-body">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-auth-label">
                Security Password
              </label>
              <div className="relative font-auth-body">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={handlePasswordBlur}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-11 py-3 bg-slate-950 border rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none transition-all font-auth-body ${getFieldStatusClasses(passwordTouched, passRes.isValid, passwordError)}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-1 animate-fade-in font-auth-body">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500 font-auth-label uppercase">Security Level</span>
                    <span className={strength.color}>{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.bgColor} transition-all duration-500 rounded-full`}
                      style={{ width: strength.width }}
                    />
                  </div>
                </div>
              )}

              {passwordTouched && passwordError && (
                <p className="text-rose-400 text-[11px] font-semibold flex items-center gap-1.5 mt-1.5 animate-fade-in font-auth-body">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (emailTouched && passwordTouched && !isFormValid)}
              className="w-full py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-auth-heading"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Admin Credentials...</span>
                </>
              ) : (
                <>
                  <span>Enter Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <p className="text-2xs text-slate-500">
              Demo Admin Credentials: <code className="text-blue-400 font-mono">admin@dms.com</code> / <code className="text-blue-400 font-mono">admin123</code>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors">
            ← Return to Main Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
