'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle,
  Loader2, GraduationCap, Briefcase, UserCheck, UserPlus, Phone, CheckCircle2, Check, X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePhone,
  updatePasswordRequirements,
  updatePasswordStrength,
  getFieldStatusClasses
} from '@/lib/validation';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  // Form Field State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<string>('individual');

  // UI Control State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Field Touched States
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  // Field Error States
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Field Input Refs for Auto-Focus on Invalid Submit
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  // Password Requirements & Strength
  const reqs = updatePasswordRequirements(password);
  const strength = updatePasswordStrength(password);

  // ─── Real-Time Input Change & Blur Handlers ─────────────────

  const handleNameChange = (val: string) => {
    setFullName(val);
    if (nameTouched) {
      const res = validateName(val);
      setNameError(res.error);
    }
  };
  const handleNameBlur = () => {
    setNameTouched(true);
    const res = validateName(fullName);
    setNameError(res.error);
  };

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
      const res = validatePassword(val);
      setPasswordError(res.error);
    }
    // Also re-validate confirm password live if touched
    if (confirmTouched) {
      const confRes = validateConfirmPassword(val, confirmPassword);
      setConfirmError(confRes.error);
    }
  };
  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    const res = validatePassword(password);
    setPasswordError(res.error);
  };

  const handleConfirmChange = (val: string) => {
    setConfirmPassword(val);
    if (confirmTouched) {
      const res = validateConfirmPassword(password, val);
      setConfirmError(res.error);
    }
  };
  const handleConfirmBlur = () => {
    setConfirmTouched(true);
    const res = validateConfirmPassword(password, confirmPassword);
    setConfirmError(res.error);
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (phoneTouched) {
      const res = validatePhone(val);
      setPhoneError(res.error);
    }
  };
  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    const res = validatePhone(phone);
    setPhoneError(res.error);
  };

  // ─── Live Overall Form Validation Status ─────────────────────

  const nameVal = validateName(fullName);
  const emailVal = validateEmail(email);
  const passVal = validatePassword(password);
  const confirmVal = validateConfirmPassword(password, confirmPassword);
  const phoneVal = validatePhone(phone);

  const isFormValid =
    nameVal.isValid &&
    emailVal.isValid &&
    passVal.isValid &&
    confirmVal.isValid &&
    phoneVal.isValid;

  // Toggle Password Visibilities
  const togglePasswordVisibility = () => setShowPassword(p => !p);
  const toggleConfirmVisibility = () => setShowConfirmPassword(p => !p);

  // ─── Handle Form Submission ──────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Touch all fields to show errors if any
    setNameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmTouched(true);
    setPhoneTouched(true);

    const nameCheck = validateName(fullName);
    const emailCheck = validateEmail(email);
    const passCheck = validatePassword(password);
    const confirmCheck = validateConfirmPassword(password, confirmPassword);
    const phoneCheck = validatePhone(phone);

    setNameError(nameCheck.error);
    setEmailError(emailCheck.error);
    setPasswordError(passCheck.error);
    setConfirmError(confirmCheck.error);
    setPhoneError(phoneCheck.error);

    // Auto-focus on the first invalid field
    if (!nameCheck.isValid) {
      nameRef.current?.focus();
      return;
    }
    if (!emailCheck.isValid) {
      emailRef.current?.focus();
      return;
    }
    if (!passCheck.isValid) {
      passwordRef.current?.focus();
      return;
    }
    if (!confirmCheck.isValid) {
      confirmRef.current?.focus();
      return;
    }
    if (!phoneCheck.isValid) {
      phoneRef.current?.focus();
      return;
    }

    setLoading(true);
    const result = await register(fullName.trim(), email.trim(), password, userType);
    setLoading(false);

    if (result.success) {
      if (userType === 'admin' || email.toLowerCase().includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/user');
      }
    } else {
      setErrorMsg(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden animate-fade-up">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-8 right-8 w-24 h-24 bg-[radial-gradient(#FF6B00_1px,transparent_1px)] [background-size:12px_12px] opacity-15 pointer-events-none" />

      {/* Centered White Registration Card */}
      <div className="w-full max-w-[520px] bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200/90 shadow-2xl shadow-slate-900/8 space-y-6 relative z-10 my-auto">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center justify-center group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8A00] flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform border border-white/20">
              <UserPlus className="w-7 h-7 stroke-[2.5]" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight font-auth-heading">
            Create Your <span className="text-[#FF6B00]">DocVault</span> Account
          </h2>
          <p className="text-xs text-[#6B7280] text-center font-medium leading-relaxed max-w-xs mx-auto font-auth-body">
            Create your secure workspace to manage, store and access documents anytime.
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
        <form onSubmit={handleSubmit} noValidate className="space-y-4 font-auth-body">
          {/* Registration Type Selection Cards */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-2 font-auth-label">
              I am registering as:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setUserType('student')}
                className={`p-3 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-1.5 cursor-pointer hover:-translate-y-0.5 font-auth-body ${
                  userType === 'student'
                    ? 'border-[#FF6B00] bg-orange-50/60 text-[#FF6B00] font-black shadow-xs scale-[1.02]'
                    : 'border-[#E8E8E8] bg-white text-[#6B7280] hover:border-slate-300 font-semibold'
                }`}
              >
                <GraduationCap className="w-5 h-5 text-[#FF6B00]" />
                <span className="text-xs">Student</span>
              </button>

              <button
                type="button"
                onClick={() => setUserType('professional')}
                className={`p-3 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-1.5 cursor-pointer hover:-translate-y-0.5 font-auth-body ${
                  userType === 'professional'
                    ? 'border-[#FF6B00] bg-orange-50/60 text-[#FF6B00] font-black shadow-xs scale-[1.02]'
                    : 'border-[#E8E8E8] bg-white text-[#6B7280] hover:border-slate-300 font-semibold'
                }`}
              >
                <Briefcase className="w-5 h-5 text-[#FF6B00]" />
                <span className="text-xs">Professional</span>
              </button>

              <button
                type="button"
                onClick={() => setUserType('individual')}
                className={`p-3 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-1.5 cursor-pointer hover:-translate-y-0.5 font-auth-body ${
                  userType === 'individual'
                    ? 'border-[#FF6B00] bg-orange-50/60 text-[#FF6B00] font-black shadow-xs scale-[1.02]'
                    : 'border-[#E8E8E8] bg-white text-[#6B7280] hover:border-slate-300 font-semibold'
                }`}
              >
                <UserCheck className="w-5 h-5 text-[#FF6B00]" />
                <span className="text-xs">Individual</span>
              </button>
            </div>
          </div>

          {/* 1. Full Name Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5 font-auth-label">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative font-auth-body">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                ref={nameRef}
                type="text"
                value={fullName}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e as any); } }}
                placeholder="John Doe"
                className={`w-full pl-10 pr-10 py-3 bg-white border rounded-[14px] text-xs text-[#1A1A1A] placeholder-[#6B7280]/60 focus:outline-none transition-all duration-300 font-medium font-auth-body ${getFieldStatusClasses(nameTouched, nameVal.isValid, nameError)}`}
              />
              {nameTouched && nameVal.isValid && !nameError && (
                <CheckCircle2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
              )}
            </div>
            {/* Inline Name Error */}
            {nameTouched && nameError && (
              <p className="text-red-500 text-[11px] font-semibold tracking-wide flex items-center gap-1.5 mt-1.5 animate-fade-in font-auth-body">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{nameError}</span>
              </p>
            )}
          </div>

          {/* 2. Email Address Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5 font-auth-label">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative font-auth-body">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                ref={emailRef}
                type="text"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e as any); } }}
                placeholder="john@example.com"
                className={`w-full pl-10 pr-10 py-3 bg-white border rounded-[14px] text-xs text-[#1A1A1A] placeholder-[#6B7280]/60 focus:outline-none transition-all duration-300 font-medium font-auth-body ${getFieldStatusClasses(emailTouched, emailVal.isValid, emailError)}`}
              />
              {emailTouched && emailVal.isValid && !emailError && (
                <CheckCircle2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
              )}
            </div>
            {/* Inline Email Error */}
            {emailTouched && emailError && (
              <p className="text-red-500 text-[11px] font-semibold tracking-wide flex items-center gap-1.5 mt-1.5 animate-fade-in font-auth-body">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          {/* 3. Phone Number Field (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 font-auth-body">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] font-auth-label">
                Phone Number
              </label>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-auth-label">Optional</span>
            </div>
            <div className="relative font-auth-body">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                ref={phoneRef}
                type="text"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={handlePhoneBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e as any); } }}
                placeholder="10-digit mobile number"
                className={`w-full pl-10 pr-10 py-3 bg-white border rounded-[14px] text-xs text-[#1A1A1A] placeholder-[#6B7280]/60 focus:outline-none transition-all duration-300 font-medium font-auth-body ${getFieldStatusClasses(phoneTouched, phoneVal.isValid, phoneError)}`}
              />
              {phoneTouched && phone.trim().length > 0 && phoneVal.isValid && !phoneError && (
                <CheckCircle2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
              )}
            </div>
            {/* Inline Phone Error */}
            {phoneTouched && phoneError && (
              <p className="text-red-500 text-[11px] font-semibold tracking-wide flex items-center gap-1.5 mt-1.5 animate-fade-in font-auth-body">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{phoneError}</span>
              </p>
            )}
          </div>

          {/* 4. Password Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5 font-auth-label">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative font-auth-body">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={handlePasswordBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e as any); } }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 bg-white border rounded-[14px] text-xs text-[#1A1A1A] placeholder-[#6B7280]/60 focus:outline-none transition-all duration-300 font-medium font-auth-body ${getFieldStatusClasses(passwordTouched, passVal.isValid, passwordError)}`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Live Password Strength Meter */}
            {password.length > 0 && (
              <div className="mt-2.5 space-y-1 animate-fade-in font-auth-body">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-[#6B7280] font-auth-label uppercase">Password Strength</span>
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

            {/* Live Password Requirements Checklist */}
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5 text-[11px] font-auth-body">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-auth-label mb-1">
                Password Requirements
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 font-medium font-auth-body">
                <div className={`flex items-center gap-1.5 transition-colors ${reqs.minLength ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                  {reqs.minLength ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />}
                  <span>Minimum 6 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${reqs.hasUpper ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                  {reqs.hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />}
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${reqs.hasLower ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                  {reqs.hasLower ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />}
                  <span>One lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${reqs.hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                  {reqs.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />}
                  <span>One number</span>
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${reqs.hasSpecial ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                  {reqs.hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />}
                  <span>One special character</span>
                </div>
              </div>
            </div>

            {/* Inline Password Error */}
            {passwordTouched && passwordError && (
              <p className="text-red-500 text-[11px] font-semibold tracking-wide flex items-center gap-1.5 mt-1.5 animate-fade-in font-auth-body">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{passwordError}</span>
              </p>
            )}
          </div>

          {/* 5. Confirm Password Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5 font-auth-label">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative font-auth-body">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                ref={confirmRef}
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => handleConfirmChange(e.target.value)}
                onBlur={handleConfirmBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e as any); } }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 bg-white border rounded-[14px] text-xs text-[#1A1A1A] placeholder-[#6B7280]/60 focus:outline-none transition-all duration-300 font-medium font-auth-body ${getFieldStatusClasses(confirmTouched, confirmVal.isValid, confirmError)}`}
              />
              <button
                type="button"
                onClick={toggleConfirmVisibility}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Inline Confirm Password Error */}
            {confirmTouched && confirmError && (
              <p className="text-red-500 text-[11px] font-semibold tracking-wide flex items-center gap-1.5 mt-1.5 animate-fade-in font-auth-body">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{confirmError}</span>
              </p>
            )}
          </div>

          {/* Primary Action Button (Disabled until form is valid) */}
          <button
            type="submit"
            disabled={loading || (nameTouched && emailTouched && passwordTouched && confirmTouched && !isFormValid)}
            className="w-full py-4 px-6 rounded-2xl text-xs sm:text-sm font-black tracking-wider uppercase text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] hover:brightness-110 shadow-lg shadow-orange-500/30 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 mt-4 cursor-pointer font-auth-heading"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-[#E8E8E8]">
          <p className="text-xs text-[#6B7280] font-medium font-auth-body">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-black text-[#FF6B00] hover:underline transition-all inline-block ml-1 font-auth-heading"
            >
              Sign In
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
