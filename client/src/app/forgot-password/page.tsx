'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, 
  AlertCircle, Loader2, CheckCircle2, KeyRound, RefreshCw, Sparkles 
} from 'lucide-react';
import api from '@/lib/api';
import {
  validateEmail,
  validatePassword,
  updatePasswordStrength
} from '@/lib/validation';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Wizard Steps: 'email' -> 'otp' -> 'new_password' -> 'success'
  const [step, setStep] = useState<'email' | 'otp' | 'new_password' | 'success'>('email');

  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI / Error State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  // Timer State for OTP Resend
  const [resendCooldown, setResendCooldown] = useState(0);

  // Password validation
  const passValidation = validatePassword(newPassword);
  const strength = updatePasswordStrength(newPassword);

  const startResendTimer = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP to Email (Only registered emails allowed)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setErrorMsg(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data.success) {
        setSuccessMsg(res.data.message || `Verification code sent to ${email}`);
        if (res.data.demoOtp) {
          setDemoOtpHint(res.data.demoOtp);
        }
        setStep('otp');
        startResendTimer();
      }
    } catch (err: any) {
      if (err.response?.status === 404 || (err.response?.data?.message && err.response.data.message.toLowerCase().includes('no registered'))) {
        setErrorMsg('This email address is not registered in DocVault. Only registered accounts can reset their password.');
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to send verification code. Please check your email.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-reset-otp', {
        email: email.trim(),
        otp: cleanOtp
      });

      if (res.data.success) {
        setResetToken(res.data.resetToken || '');
        setSuccessMsg('Code verified! Please create your new secure password.');
        setStep('new_password');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        token: resetToken,
        otp: otp.trim(),
        newPassword
      });

      if (res.data.success) {
        setStep('success');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-app)] dark:bg-[#07110D] text-[var(--text-primary)] dark:text-[#F5F7F6] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden transition-colors duration-200">
      
      {/* Professional Top Left Back Button with Cream Hover */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/login"
          className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/95 dark:bg-[#0E281E]/95 backdrop-blur-md border border-slate-200 dark:border-[#35D99A]/20 hover:border-[#087443] dark:hover:border-[#35D99A] hover:bg-[#EEF6F2] dark:hover:bg-[#123325] text-slate-800 dark:text-[#F5F7F6] hover:text-[#087443] dark:hover:text-[#35D99A] text-xs font-bold shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer font-auth-heading hover:-translate-y-0.5 whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 text-[#087443] dark:text-[#35D99A] group-hover:-translate-x-1 transition-transform duration-300 shrink-0" />
          <span className="text-slate-800 dark:text-[#F5F7F6] group-hover:text-[#087443] dark:group-hover:text-[#35D99A]">Back to Sign In</span>
        </Link>
      </div>

      <main className="w-full max-w-[460px] bg-white dark:bg-[#0E281E] text-slate-900 dark:text-[#F5F7F6] rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-[#35D99A]/20 relative z-10 my-auto animate-pop-in">
        
        <div className="flex justify-center mb-6">
          <Link href="/" className="group">
            <div className="p-2 sm:p-2.5 rounded-[26px] sm:rounded-[28px] bg-[#F0FDF4] border border-[#D1FAE5] shadow-xs group-hover:scale-105 transition-all duration-300">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-[20px] bg-[#1B664B] flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-7 h-7 sm:w-7.5 sm:h-7.5 stroke-[2.3] text-white" />
              </div>
            </div>
          </Link>
        </div>

          {step !== 'success' && (
            <div className="flex items-center justify-between gap-2 mb-8 pb-5 border-b border-slate-100">
              {[
                { id: 'email', label: '1. Email' },
                { id: 'otp', label: '2. Verify OTP' },
                { id: 'new_password', label: '3. New Password' }
              ].map((s, idx) => {
                const isActive = step === s.id;
                const isPassed = (step === 'otp' && idx === 0) || (step === 'new_password' && idx <= 1);
                return (
                  <div key={s.id} className="flex-1 text-center">
                    <div className={`h-1.5 rounded-full transition-all duration-300 mb-2 ${
                      isActive ? 'bg-[#1B664B]' : isPassed ? 'bg-[#1B664B]' : 'bg-slate-200'
                    }`} />
                    <span className={`text-[11px] font-bold font-mono tracking-wider uppercase ${
                      isActive ? 'text-[#1B664B]' : isPassed ? 'text-[#1B664B]' : 'text-slate-400'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 shadow-2xs animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {step === 'email' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-auth-heading">
                  Reset Password
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Enter your registered account email address. We'll send a 6-digit verification code to reset your password.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-700 mb-2 font-auth-heading">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      autoFocus
                      className="w-full h-[54px] pl-12 pr-4 bg-slate-50/60 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#1B664B] focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full h-[54px] rounded-2xl text-sm font-bold text-white bg-[#1B664B] hover:bg-[#15803D] active:bg-[#166534] shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] border border-[#D1FAE5] text-[#1B664B] flex items-center justify-center mx-auto shadow-xs">
                  <Mail className="w-7 h-7" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-auth-heading pt-2">
                  Enter Verification Code
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  We've sent a 6-digit OTP code to <strong className="text-slate-800">{email}</strong>.
                </p>
                {demoOtpHint && (
                  <p className="text-[11px] font-mono font-bold text-[#1B664B] bg-[#F0FDF4] border border-[#D1FAE5] px-3 py-1 rounded-lg inline-block">
                    Testing OTP Code: {demoOtpHint}
                  </p>
                )}
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-700 mb-2 font-auth-heading">
                    6-Digit OTP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    required
                    autoFocus
                    className="w-full h-[58px] text-center text-2xl font-mono tracking-[0.4em] font-extrabold bg-slate-50/60 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-300 focus:bg-white focus:border-[#1B664B] focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Change Email
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleSendOtp}
                    className="text-[#1B664B] hover:text-[#15803D] font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full h-[54px] rounded-2xl text-sm font-bold text-white bg-[#1B664B] hover:bg-[#15803D] active:bg-[#166534] shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'new_password' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-auth-heading">
                  Create New Password
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your identity has been verified. Enter a new password for your account.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-700 mb-2 font-auth-heading">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoFocus
                      className="w-full h-[54px] pl-12 pr-12 bg-slate-50/60 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#1B664B] focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-700 mb-2 font-auth-heading">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-[54px] pl-12 pr-12 bg-slate-50/60 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#1B664B] focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !newPassword || newPassword !== confirmPassword}
                  className="w-full h-[54px] rounded-2xl text-sm font-bold text-white bg-[#1B664B] hover:bg-[#15803D] active:bg-[#166534] shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving New Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Save & Reset Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-3xl bg-[#F0FDF4] text-[#1B664B] flex items-center justify-center mx-auto shadow-md border border-[#D1FAE5]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-auth-heading">
                  Password Reset Successfully!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your new password is now active and securely encrypted. You can now sign in to your DocVault account.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full h-[54px] rounded-2xl text-sm font-bold text-white bg-[#1B664B] hover:bg-[#15803D] active:bg-[#166534] shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <span>Sign In with New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        <p>© 2026 DocVault Document Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}
