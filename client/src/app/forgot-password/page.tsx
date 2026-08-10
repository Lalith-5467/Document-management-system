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

  // Step 1: Send OTP to Email
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
      setErrorMsg(err.response?.data?.message || 'Failed to send verification code. Please check your email.');
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
    <div className="min-h-screen bg-[#FAF7F0] text-slate-900 flex flex-col justify-between selection:bg-[#FF6B00] selection:text-white font-sans">
      {/* Top Navbar */}
      <header className="px-6 py-5 sm:px-12 flex items-center justify-between border-b border-[#EAE3D2] bg-white/70 backdrop-blur-md sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8533] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-tight font-auth-heading">
              Doc<span className="text-[#FF6B00]">Vault</span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">
              Enterprise Suite
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#FF6B00] px-4 py-2 rounded-xl border border-[#E6E0D4] bg-white hover:border-[#FF6B00]/40 transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* Main Form Center Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg bg-white border border-[#E6E0D4] rounded-[28px] p-8 sm:p-12 shadow-xl shadow-amber-900/5 relative overflow-hidden">
          
          {/* Subtle Ambient Background Accent */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Stepper Pill Indicator */}
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
                      isActive ? 'bg-[#FF6B00]' : isPassed ? 'bg-emerald-500' : 'bg-slate-200'
                    }`} />
                    <span className={`text-[11px] font-bold font-mono tracking-wider uppercase ${
                      isActive ? 'text-[#FF6B00]' : isPassed ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Alert Message Box */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && step !== 'success' && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Registered Email */}
          {step === 'email' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF6B00] flex items-center justify-center mx-auto shadow-sm shadow-orange-500/15">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-auth-heading pt-2">
                  Forgot Password?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Enter your registered account email and we'll send a 6-digit OTP code to reset your password.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-700 mb-2 font-auth-heading">
                    Registered Email Address <span className="text-red-500">*</span>
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
                      className="w-full h-[54px] pl-12 pr-4 bg-slate-50/60 border border-[#E6E0D4] rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-500/15 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full h-[54px] rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#FF6B00] via-[#F76400] to-[#E05500] hover:brightness-105 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* STEP 2: Verify 6-digit OTP Code */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF6B00] flex items-center justify-center mx-auto shadow-sm shadow-orange-500/15">
                  <Mail className="w-7 h-7" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-auth-heading pt-2">
                  Enter Verification Code
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  We've sent a 6-digit OTP code to <strong className="text-slate-800">{email}</strong>.
                </p>
                {demoOtpHint && (
                  <p className="text-[11px] font-mono font-bold text-orange-600 bg-orange-50 border border-orange-200/80 px-3 py-1 rounded-lg inline-block">
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
                    className="w-full h-[58px] text-center text-2xl font-mono tracking-[0.4em] font-extrabold bg-slate-50/60 border border-[#E6E0D4] rounded-2xl text-slate-900 placeholder-slate-300 focus:bg-white focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-500/15 outline-none transition-all"
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
                    className="text-[#FF6B00] hover:text-[#D96000] font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full h-[54px] rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#FF6B00] via-[#F76400] to-[#E05500] hover:brightness-105 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: Create New Password */}
          {step === 'new_password' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm shadow-emerald-500/15">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-auth-heading pt-2">
                  Create New Password
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Choose a new, strong password for your account.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* New Password */}
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
                      className="w-full h-[54px] pl-12 pr-12 bg-slate-50/60 border border-[#E6E0D4] rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-500/15 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold font-mono">
                        <span className="text-slate-500">Strength:</span>
                        <span className={
                          strength.label === 'Strong' ? 'text-emerald-600' :
                          strength.label === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                        }>
                          {strength.label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            strength.label === 'Strong' ? 'bg-emerald-500 w-full' :
                            strength.label === 'Medium' ? 'bg-amber-500 w-2/3' : 'bg-rose-500 w-1/3'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
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
                      className="w-full h-[54px] pl-12 pr-12 bg-slate-50/60 border border-[#E6E0D4] rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-500/15 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-rose-500 text-xs font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !newPassword || newPassword !== confirmPassword}
                  className="w-full h-[54px] rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#FF6B00] via-[#F76400] to-[#E05500] hover:brightness-105 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* STEP 4: Success Screen */}
          {step === 'success' && (
            <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-3xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 border border-emerald-200">
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
                  className="w-full h-[54px] rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#FF6B00] via-[#F76400] to-[#E05500] hover:brightness-105 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Sign In with New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-[#EAE3D2] bg-white/40">
        <p>© 2026 DocVault Enterprise Workspace. All rights reserved.</p>
      </footer>
    </div>
  );
}
