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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FAF8F4] via-[#F4F1EA] to-[#ECE7DF] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden selection:bg-[#FF6B00] selection:text-white">
      
      {/* Professional Top Left Back Button with Cream Hover */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/login"
          className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-[#E6E0D4] hover:border-[#DFD2BA] hover:bg-[#FFFDF5] text-slate-700 hover:text-slate-900 text-xs font-bold shadow-xs hover:shadow-md hover:shadow-[#DFD2BA]/30 transition-all duration-300 group cursor-pointer font-auth-heading hover:-translate-y-0.5 whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF6B00] group-hover:-translate-x-1 transition-transform duration-300 shrink-0" />
          <span>Back to Sign In</span>
        </Link>
      </div>

      {/* Ambient Warm Cream & Soft Glowing Spheres */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#F5EAD6]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-orange-500/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#FAF2E4]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Card Container */}
      <main className="w-full max-w-[500px] bg-white/95 backdrop-blur-xl rounded-[32px] p-8 sm:p-10 shadow-[0_25px_70px_rgba(40,30,15,0.06)] border border-[#E8E1D5] relative z-10 my-auto">
        
        {/* Top DocVault Logo Badge */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center group">
            <div className="p-2 sm:p-2.5 rounded-[26px] sm:rounded-[28px] bg-gradient-to-b from-[#FFF2E8] to-[#FFE7D5] ring-4 ring-[#FF6B00]/10 border border-[#FF6B00]/20 shadow-[0_4px_20px_rgba(255,107,0,0.12)] group-hover:scale-105 group-hover:ring-[#FF6B00]/20 group-hover:shadow-[0_8px_30px_rgba(255,107,0,0.22)] transition-all duration-300">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-[20px] bg-gradient-to-br from-[#FF7A00] via-[#FF6500] to-[#EE5800] flex items-center justify-center text-white shadow-[0_10px_25px_rgba(255,101,0,0.35)]">
                <ShieldCheck className="w-7 h-7 sm:w-7.5 sm:h-7.5 stroke-[2.3] text-white drop-shadow-xs" />
              </div>
            </div>
          </Link>
        </div>
          
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
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-700 text-xs font-semibold space-y-2 animate-in fade-in duration-200 shadow-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span className="flex-1 leading-relaxed">{errorMsg}</span>
              </div>
              {errorMsg.includes('not registered') && (
                <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-rose-600 font-medium">Don&apos;t have a DocVault account yet?</span>
                  <Link
                    href="/register"
                    className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-xs transition-all inline-flex items-center gap-1 shrink-0"
                  >
                    <span>Register Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
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

        </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400">
        <p>© 2026 DocVault Document Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}
