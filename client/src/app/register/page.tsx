'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  User, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Edit2,
  GraduationCap, Briefcase, UserCheck, UserPlus, Phone, CheckCircle2, Check, CheckCircle,
  Building2, MapPin, Globe, Map, BriefcaseBusiness, ShieldCheck, Folder, Zap, Monitor, ArrowLeft
} from 'lucide-react';

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Artificial Intelligence', 'Electronics', 'Electrical', 'Mechanical', 'Civil', 'Commerce', 'Business Administration', 'Mathematics', 'Physics', 'Chemistry', 'English', 'Other'];
const YEARS = ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Post Graduate', 'Research Scholar'];
const INDUSTRIES = ['Information Technology', 'Healthcare', 'Finance', 'Banking', 'Government', 'Education', 'Manufacturing', 'Construction', 'Legal', 'Media', 'Marketing', 'Other'];
const EXPERIENCES = ['Fresher', '1–2 Years', '3–5 Years', '6–10 Years', '10+ Years'];

const customStyles = `
  @keyframes slideUpFade {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slideUpFade 0.4s ease-out forwards;
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const InputField = ({ icon: Icon, label, required, error, value, ...props }: any) => {
  const isFilled = value && value.toString().length > 0;
  return (
    <div className="relative mb-4 group w-full">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center transition-all duration-300 pointer-events-none">
          <Icon className={`w-5 h-5 transition-colors duration-300 ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-themePrimary'}`} />
        </div>
      )}
      <div className="relative">
        <input
          {...props}
          value={value}
          placeholder=" "
          className={`peer w-full h-[56px] ${Icon ? 'pl-12' : 'pl-4'} pr-4 pt-5 pb-1 bg-white border ${error ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/15' : 'border-slate-200 focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-500/15'} rounded-[14px] text-[15px] text-slate-900 focus:outline-none transition-all duration-300 font-medium`}
        />
        <label className={`absolute left-${Icon ? '12' : '4'} text-slate-500 pointer-events-none transition-all duration-300 font-medium ${isFilled ? 'top-1.5 text-[11px] text-slate-400' : 'top-1/2 -translate-y-1/2 text-[15px] peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-themePrimary'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      {error && (
        <p className="text-red-500 text-[12px] font-medium mt-1 pl-1">
          {error}
        </p>
      )}
    </div>
  );
};

const SelectField = ({ icon: Icon, label, options, required, error, value, onChange }: any) => {
  const isFilled = value && value.toString().length > 0;
  return (
    <div className="relative mb-4 group w-full">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center transition-all duration-300 pointer-events-none">
          <Icon className={`w-5 h-5 transition-colors duration-300 ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-themePrimary'}`} />
        </div>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`peer w-full h-[56px] ${Icon ? 'pl-12' : 'pl-4'} pr-10 pt-5 pb-1 bg-white border ${error ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/15' : 'border-slate-200 focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-500/15'} rounded-[14px] text-[15px] ${value ? 'text-slate-900' : 'text-transparent'} focus:outline-none transition-all duration-300 font-medium appearance-none`}
        >
          <option value="" disabled className="text-slate-400">Select {label}</option>
          {options.map((opt: string) => <option key={opt} value={opt} className="text-slate-900">{opt}</option>)}
        </select>
        <label className={`absolute left-${Icon ? '12' : '4'} text-slate-500 pointer-events-none transition-all duration-300 font-medium ${isFilled ? 'top-1.5 text-[11px] text-slate-400' : 'top-1/2 -translate-y-1/2 text-[15px] peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-themePrimary'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 peer-focus:text-themePrimary transition-all duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-[12px] font-medium mt-1 pl-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [userType, setUserType] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Personal Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  // Role Specific (Student)
  const [collegeName, setCollegeName] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [studentId, setStudentId] = useState('');
  
  // Role Specific (Professional)
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [industry, setIndustry] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  
  // Role Specific (Individual)
  const [occupation, setOccupation] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  
  // Security
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Status
  const [errors, setErrors] = useState<any>({});
  const [globalError, setGlobalError] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // OTP
  const [countryCode, setCountryCode] = useState('+91');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setupRecaptcha = () => {
    if (typeof window !== 'undefined' && !(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  };

  useEffect(() => {
    setupRecaptcha();
  }, []);

  useEffect(() => {
    let int: any;
    if (otpTimer > 0) int = setInterval(() => setOtpTimer(p => p - 1), 1000);
    return () => clearInterval(int);
  }, [otpTimer]);

  const validateStep = (step: number) => {
    let errs: any = { ...errors };
    let isValid = true;
    
    if (step === 2) {
      if (!/^[a-zA-Z\s]{3,50}$/.test(fullName)) { errs.fullName = "Name should contain only letters (3-50 chars)."; isValid = false; } else { delete errs.fullName; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errs.email = "Please enter a valid email address."; isValid = false; } else { delete errs.email; }
      if (!/^[6-9]\d{9}$/.test(mobileNumber)) { errs.mobileNumber = "Mobile number must contain exactly 10 digits starting with 6-9."; isValid = false; } else { delete errs.mobileNumber; }
      if (!otpVerified) { errs.otp = "Please verify your mobile number with OTP."; isValid = false; } else { delete errs.otp; }
    } else if (step === 3) {
      if (userType === 'student') {
        if (!collegeName || collegeName.length < 5 || collegeName.length > 100) { errs.collegeName = "College Name must be 5-100 characters."; isValid = false; } else { delete errs.collegeName; }
        if (!department) { errs.department = "Department is required."; isValid = false; } else { delete errs.department; }
        if (!yearOfStudy) { errs.yearOfStudy = "Year of study is required."; isValid = false; } else { delete errs.yearOfStudy; }
      } else if (userType === 'professional') {
        if (!companyName || companyName.length < 3 || companyName.length > 100) { errs.companyName = "Company Name must be 3-100 characters."; isValid = false; } else { delete errs.companyName; }
        if (!designation) { errs.designation = "Designation is required."; isValid = false; } else { delete errs.designation; }
        if (!industry) { errs.industry = "Industry is required."; isValid = false; } else { delete errs.industry; }
        if (!yearsOfExperience) { errs.yearsOfExperience = "Years of experience is required."; isValid = false; } else { delete errs.yearsOfExperience; }
      } else if (userType === 'individual') {
        if (!country) { errs.country = "Country is required."; isValid = false; } else { delete errs.country; }
        if (!state) { errs.state = "State is required."; isValid = false; } else { delete errs.state; }
        if (!city) { errs.city = "City is required."; isValid = false; } else { delete errs.city; }
      }
    }
    
    setErrors(errs);
    if (!isValid) {
      setGlobalError("Please complete the highlighted fields.");
    } else {
      setGlobalError("");
    }
    return isValid;
  };

  const handleNext = () => {
    if (currentStep === 1 && !userType) {
      setGlobalError("Please select an account type.");
      return;
    }
    if (currentStep > 1 && !validateStep(currentStep)) {
      return;
    }
    setGlobalError("");
    setCurrentStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setGlobalError("");
    setCurrentStep(prev => prev - 1);
  };

  const validateForm = () => {
    let errs: any = {};
    
    // Personal Validation
    if (!/^[a-zA-Z\s]{3,50}$/.test(fullName)) errs.fullName = "Name should contain only letters (3-50 chars).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) errs.mobileNumber = "Mobile number must contain exactly 10 digits starting with 6-9.";
    if (!otpVerified) errs.otp = "Please verify your mobile number with OTP.";
    
    // Role Validation
    if (userType === 'student') {
      if (!collegeName || collegeName.length < 5 || collegeName.length > 100) errs.collegeName = "College Name must be 5-100 characters.";
      if (!department) errs.department = "Department is required.";
      if (!yearOfStudy) errs.yearOfStudy = "Year of study is required.";
    } else if (userType === 'professional') {
      if (!companyName || companyName.length < 3 || companyName.length > 100) errs.companyName = "Company Name must be 3-100 characters.";
      if (!designation) errs.designation = "Designation is required.";
      if (!industry) errs.industry = "Industry is required.";
      if (!yearsOfExperience) errs.yearsOfExperience = "Years of experience is required.";
    } else if (userType === 'individual') {
      if (!country) errs.country = "Country is required.";
      if (!state) errs.state = "State is required.";
      if (!city) errs.city = "City is required.";
    }
    
    // Security Validation
    if (password.length < 8 || password.length > 32) errs.password = "Password must be 8-32 characters long.";
    else if (!/[A-Z]/.test(password)) errs.password = "Password must contain one uppercase letter.";
    else if (!/[a-z]/.test(password)) errs.password = "Password must contain one lowercase letter.";
    else if (!/[0-9]/.test(password)) errs.password = "Password must contain one number.";
    else if (!/[^A-Za-z0-9\s]/.test(password)) errs.password = "Password must contain one special character.";
    else if (/\s/.test(password)) errs.password = "Password cannot contain spaces.";
    
    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) {
      setGlobalError("Please select an account type.");
      return;
    }
    
    if (!validateForm()) {
      setGlobalError("Please complete the highlighted fields.");
      return;
    }

    setLoading(true);
    setGlobalError('');

    const userData = {
      userType, fullName, email, mobileNumber, password,
      phoneVerified: otpVerified,
      collegeName, department, yearOfStudy, studentId,
      companyName, designation, industry, yearsOfExperience, employeeId,
      occupation, country, state, city
    };

    const result = await register(userData);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(true);
    } else {
      setGlobalError(result.message);
    }
  };

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setErrors({ ...errors, mobileNumber: "Mobile number must contain exactly 10 digits starting with 6-9." });
      return;
    }
    setErrors({ ...errors, mobileNumber: null });
    setOtpSending(true);
    
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedNumber = `${countryCode}${mobileNumber}`;
      const result = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(result);
      setOtpSending(false);
      setOtpSent(true);
      setOtpTimer(60);
      setOtpAttempts(1);
    } catch (error: any) {
      console.error(error);
      setOtpSending(false);
      setErrors({ ...errors, mobileNumber: "Failed to send OTP. " + error.message });
      if ((window as any).recaptchaVerifier) {
         try {
           (window as any).recaptchaVerifier.render().then((widgetId: any) => {
             (window as any).grecaptcha.reset(widgetId);
           });
         } catch(e) {}
      }
    }
  };

  const handleResendOtp = async () => {
    if (otpAttempts >= 3) return;
    setOtpSending(true);
    setErrors({ ...errors, otp: null });
    
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedNumber = `${countryCode}${mobileNumber}`;
      const result = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(result);
      setOtpSending(false);
      setOtpTimer(60);
      setOtpAttempts(prev => prev + 1);
    } catch (error: any) {
      setOtpSending(false);
      setErrors({ ...errors, otp: "Failed to resend OTP. " + error.message });
    }
  };

  const handleEditNumber = () => {
    setOtpSent(false);
    setOtpTimer(0);
    setOtpValues(['', '', '', '', '', '']);
    setErrors({ ...errors, otp: null });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto focus next
    if (value !== '' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otpValues[index] === '' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtpValues = [...otpValues];
      for (let i = 0; i < pastedData.length; i++) {
        newOtpValues[i] = pastedData[i];
      }
      setOtpValues(newOtpValues);
      
      const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const currentOtp = otpValues.join('');
    if (currentOtp.length !== 6) {
      setErrors({ ...errors, otp: "Please enter the complete 6-digit OTP." });
      return;
    }
    
    if (!confirmationResult) {
      setErrors({ ...errors, otp: "Please request an OTP first." });
      return;
    }
    
    setOtpVerifying(true);
    
    try {
      await confirmationResult.confirm(currentOtp);
      setOtpVerifying(false);
      setOtpVerified(true);
      setErrors({ ...errors, otp: null });
    } catch (error: any) {
      setOtpVerifying(false);
      setErrors({ ...errors, otp: "Invalid OTP. Please try again." });
    }
  };

  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9\s]/.test(password)) score++;
    
    if (score < 3) return { label: 'Weak', color: 'text-red-500', bg: 'bg-red-500', w: 'w-1/3' };
    if (score < 5) return { label: 'Medium', color: 'text-orange-500', bg: 'bg-orange-500', w: 'w-2/3' };
    return { label: 'Strong', color: 'text-emerald-500', bg: 'bg-emerald-500', w: 'w-full' };
  };

  if (successMsg) {
    return (
      <div className="min-h-screen w-full bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[24px] p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Aboard!</h2>
          <p className="text-slate-500 mb-8 font-medium">Your DocVault account has been created securely.</p>
          <Link href="/login" className="block w-full py-4 rounded-[14px] text-white font-bold bg-themePrimary hover:brightness-110 shadow-lg shadow-orange-500/20 transition-all duration-300">
            Access Your Vault →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden animate-fade-up">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-400/8 rounded-full blur-3xl pointer-events-none" />
      
      {/* Main Centered Card */}
      <div className="w-full max-w-[460px] bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-slate-100 relative z-10 flex flex-col my-8">
        <div className="p-8 sm:p-10">
          
          {/* Header */}
          <div className="text-center space-y-3 mb-10">
            <Link href="/" className="inline-flex items-center justify-center mb-2">
              <div className="w-12 h-12 rounded-[14px] bg-themePrimary flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
            </Link>
            <h2 className="text-[28px] sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
              Create your account
            </h2>
            <p className="text-[15px] text-slate-500 font-medium">
              Store, organize and manage your documents securely.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-10 max-w-sm mx-auto">
            <div className="flex items-center w-full">
              {[1, 2, 3, 4].map((step, idx) => (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 z-10 ${
                    currentStep === step 
                      ? 'bg-themePrimary text-white shadow-md shadow-orange-500/20 ring-4 ring-orange-50' 
                      : currentStep > step 
                        ? 'bg-orange-100 text-themePrimary' 
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {currentStep > step ? <Check className="w-4 h-4" /> : step}
                  </div>
                  {idx < 3 && (
                    <div className={`flex-1 h-1 transition-all duration-300 ${
                      currentStep > step + 0 ? 'bg-orange-200' : 'bg-slate-100'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Validation Banner (Compact Modern) */}
          {globalError && (
            <div className="mb-8 p-3.5 rounded-[12px] bg-red-50 text-red-600 text-sm font-medium flex items-center gap-3 border border-red-100 animate-fade-in shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{globalError}</span>
            </div>
          )}

          {/* Forms Section */}
          <div>
            {/* STEP 1: ROLE SELECTION */}
            {currentStep === 1 && (
              <div className="animate-slide-up">
                <div className="flex flex-col gap-3">
                  {[
                    { id: 'student', icon: GraduationCap, title: 'Student', desc: 'Academic records' },
                    { id: 'professional', icon: BriefcaseBusiness, title: 'Professional', desc: 'Company documents' },
                    { id: 'individual', icon: User, title: 'Individual', desc: 'Personal documents' }
                  ].map((role) => (
                    <label 
                      key={role.id}
                      onClick={() => setUserType(role.id)}
                      className={`relative p-4 rounded-[16px] border cursor-pointer transition-all duration-300 flex flex-row items-center gap-4 group ${
                        userType === role.id 
                          ? 'border-themePrimary bg-themePrimary text-white shadow-lg shadow-orange-500/20' 
                          : 'border-slate-200 bg-white hover:border-themePrimary/40'
                      }`}
                    >
                      <role.icon className={`w-6 h-6 transition-colors ${userType === role.id ? 'text-white' : 'text-slate-400 group-hover:text-themePrimary'}`} />
                      <div className="flex-1">
                        <h3 className={`text-[15px] font-bold ${userType === role.id ? 'text-white' : 'text-slate-900'}`}>{role.title}</h3>
                        <p className={`text-[12px] mt-0.5 font-medium ${userType === role.id ? 'text-orange-100' : 'text-slate-500'}`}>{role.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                        userType === role.id ? 'border-white' : 'border-slate-300'
                      }`}>
                        {userType === role.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                      <input type="radio" name="accountType" className="hidden" checked={userType === role.id} readOnly />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: ROLE SPECIFIC INFORMATION */}
            {currentStep === 3 && (
              <div className="animate-slide-up">
                {userType === 'student' && (
                  <div className="flex flex-col gap-0">
                    <InputField icon={Building2} label="College / University Name" required value={collegeName} onChange={(e: any) => setCollegeName(e.target.value)} error={errors.collegeName} />
                    <SelectField icon={GraduationCap} label="Department" options={DEPARTMENTS} required value={department} onChange={setDepartment} error={errors.department} />
                    <SelectField icon={MapPin} label="Year of Study" options={YEARS} required value={yearOfStudy} onChange={setYearOfStudy} error={errors.yearOfStudy} />
                    <InputField icon={User} label="Student ID (Optional)" value={studentId} onChange={(e: any) => setStudentId(e.target.value)} />
                  </div>
                )}

                {userType === 'professional' && (
                  <div className="flex flex-col gap-0">
                    <InputField icon={Building2} label="Company Name" required value={companyName} onChange={(e: any) => setCompanyName(e.target.value)} error={errors.companyName} />
                    <InputField icon={User} label="Designation" required value={designation} onChange={(e: any) => setDesignation(e.target.value)} error={errors.designation} />
                    <SelectField icon={Globe} label="Industry" options={INDUSTRIES} required value={industry} onChange={setIndustry} error={errors.industry} />
                    <SelectField icon={BriefcaseBusiness} label="Years of Experience" options={EXPERIENCES} required value={yearsOfExperience} onChange={setYearsOfExperience} error={errors.yearsOfExperience} />
                    <InputField icon={UserCheck} label="Employee ID (Optional)" value={employeeId} onChange={(e: any) => setEmployeeId(e.target.value)} />
                  </div>
                )}

                {userType === 'individual' && (
                  <div className="flex flex-col gap-0">
                    <InputField icon={BriefcaseBusiness} label="Occupation (Optional)" value={occupation} onChange={(e: any) => setOccupation(e.target.value)} />
                    <InputField icon={Globe} label="Country" required value={country} onChange={(e: any) => setCountry(e.target.value)} error={errors.country} />
                    <InputField icon={Map} label="State" required value={state} onChange={(e: any) => setState(e.target.value)} error={errors.state} />
                    <InputField icon={MapPin} label="City" required value={city} onChange={(e: any) => setCity(e.target.value)} error={errors.city} />
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: PERSONAL INFORMATION */}
            {currentStep === 2 && (
              <div className="animate-slide-up">
                <div className="flex flex-col gap-0">
                  <InputField icon={User} label="Full Name" required value={fullName} onChange={(e: any) => setFullName(e.target.value)} error={errors.fullName} />
                  <InputField icon={Mail} label="Email Address" required value={email} onChange={(e: any) => setEmail(e.target.value)} error={errors.email} />
                </div>
                
                <div className="relative group w-full">
                  {!otpSent || otpVerified ? (
                    <div className="flex flex-col gap-3 animate-fade-in">
                      <div className="flex gap-2">
                        <div className="relative w-[110px] shrink-0">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-5 h-5 flex items-center justify-center pointer-events-none text-slate-400">
                            <Globe className="w-4 h-4" />
                          </div>
                          <select 
                            disabled={otpVerified || otpSending}
                            value={countryCode}
                            onChange={e => setCountryCode(e.target.value)}
                            className="w-full h-[56px] pl-9 pr-2 bg-white border border-slate-200 focus:border-[#FF6B00] rounded-[14px] text-[15px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-orange-500/15 transition-all duration-300 appearance-none disabled:bg-slate-50 disabled:text-slate-400"
                          >
                            <option value="+91">+91 (IN)</option>
                            <option value="+1">+1 (US)</option>
                            <option value="+44">+44 (UK)</option>
                            <option value="+61">+61 (AU)</option>
                          </select>
                        </div>
                        <div className="relative flex-1">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center transition-all duration-300 pointer-events-none">
                            <Phone className={`w-5 h-5 transition-colors duration-300 ${errors.mobileNumber ? 'text-red-400' : 'text-slate-400 group-focus-within:text-themePrimary'}`} />
                          </div>
                          <div className="relative">
                            <input 
                              type="text" 
                              disabled={otpVerified || otpSending} 
                              value={mobileNumber} 
                              onChange={e => setMobileNumber(e.target.value)} 
                              placeholder=" "
                              className={`peer w-full h-[56px] pl-12 pr-4 pt-5 pb-1 bg-white border ${errors.mobileNumber ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/15' : 'border-slate-200 focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-500/15'} rounded-[14px] text-[15px] font-medium focus:outline-none transition-all duration-300 disabled:bg-slate-50 disabled:text-slate-400`} 
                            />
                            <label className={`absolute left-12 text-slate-500 pointer-events-none transition-all duration-300 font-medium ${mobileNumber.length > 0 ? 'top-1.5 text-[11px] text-slate-400' : 'top-1/2 -translate-y-1/2 text-[15px] peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-[#FF6B00]'}`}>
                              Mobile Number <span className="text-red-500">*</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {errors.mobileNumber && <p className="text-red-500 text-[12px] font-medium pl-1 animate-fade-in">{errors.mobileNumber}</p>}
                        </div>
                        {!otpVerified && (
                          <button type="button" onClick={handleSendOtp} disabled={otpSending || otpAttempts >= 3} className="md:w-[160px] shrink-0 px-6 py-0 bg-white hover:bg-[#FFF5ED] text-[#FF6B00] border border-[#FF6B00]/30 text-[15px] font-bold rounded-[14px] transition-all duration-300 shadow-sm disabled:opacity-50 h-[56px] flex items-center justify-center gap-2">
                            {otpSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending</> : 'Send OTP'}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5 animate-slide-up p-5 rounded-[16px] border border-orange-100 bg-orange-50/50">
                      <div className="flex items-center justify-between pb-4 border-b border-orange-100/60">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-orange-400/80 uppercase tracking-wider mb-0.5">Verification Code Sent To</span>
                          <span className="text-[15px] font-bold text-slate-800">{countryCode} {mobileNumber}</span>
                        </div>
                        <button type="button" onClick={handleEditNumber} className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-[#FF6B00] hover:border-[#FF6B00] flex items-center justify-center transition-all shadow-sm" title="Edit phone number">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2 justify-between max-w-[340px] mx-auto w-full">
                          {otpValues.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => { otpInputRefs.current[idx] = el; }}
                              type="text"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              onPaste={handleOtpPaste}
                              disabled={otpVerifying}
                              className={`w-12 h-[56px] bg-white border ${errors.otp ? 'border-red-300 focus:border-red-400 focus:ring-red-500/15' : 'border-slate-200 focus:border-[#FF6B00] focus:ring-orange-500/15'} rounded-[12px] text-[20px] font-bold text-center focus:ring-4 focus:outline-none transition-all duration-300 shadow-sm disabled:opacity-50`}
                            />
                          ))}
                        </div>
                        {errors.otp && <p className="text-red-500 text-[12px] font-medium text-center animate-fade-in">{errors.otp}</p>}
                      </div>
                      
                      <button type="button" onClick={handleVerifyOtp} disabled={otpVerifying || otpValues.join('').length !== 6} className="w-full h-[56px] bg-themePrimary hover:brightness-110 shadow-lg shadow-orange-500/20 text-white text-[15px] font-bold rounded-[14px] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50">
                        {otpVerifying ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying Code</> : 'Verify OTP'}
                      </button>
                      
                      <div className="flex items-center justify-center mt-1">
                        <button type="button" onClick={handleResendOtp} disabled={otpTimer > 0 || otpAttempts >= 3 || otpSending} className="text-[13px] font-bold text-slate-500 hover:text-[#FF6B00] disabled:opacity-50 disabled:hover:text-slate-500 transition-colors flex items-center gap-1.5">
                          {otpTimer > 0 ? `Resend code in ${otpTimer}s` : otpAttempts >= 3 ? 'Maximum attempts reached' : 'Resend Code'}
                          {otpSending && otpTimer === 0 && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {otpVerified && (
                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-[14px] flex items-center gap-3 text-emerald-700 text-[14px] font-semibold animate-fade-in">
                      <CheckCircle2 className="w-5 h-5" />
                      Mobile Number Verified Successfully
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: ACCOUNT SECURITY */}
            {currentStep === 4 && (
              <div className="animate-slide-up">
                <div className="flex flex-col gap-4">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center transition-all duration-300 pointer-events-none">
                      <Lock className={`w-5 h-5 transition-colors duration-300 ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-themePrimary'}`} />
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder=" "
                        className={`peer w-full h-[56px] pl-12 pr-12 pt-5 pb-1 bg-white border ${errors.password ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/15' : 'border-slate-200 focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-500/15'} rounded-[14px] text-[15px] font-medium focus:outline-none transition-all duration-300`} 
                      />
                      <label className={`absolute left-12 text-slate-500 pointer-events-none transition-all duration-300 font-medium ${password.length > 0 ? 'top-1.5 text-[11px] text-slate-400' : 'top-1/2 -translate-y-1/2 text-[15px] peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-[#FF6B00]'}`}>
                        Password <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {errors.password && <p className="text-red-500 text-[12px] font-medium mt-1 pl-1">{errors.password}</p>}
                  </div>

                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center transition-all duration-300 pointer-events-none">
                      <Lock className={`w-5 h-5 transition-colors duration-300 ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400 group-focus-within:text-themePrimary'}`} />
                    </div>
                    <div className="relative">
                      <input 
                        type={showConfirm ? 'text' : 'password'} 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        placeholder=" "
                        className={`peer w-full h-[56px] pl-12 pr-12 pt-5 pb-1 bg-white border ${errors.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/15' : 'border-slate-200 focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-500/15'} rounded-[14px] text-[15px] font-medium focus:outline-none transition-all duration-300`} 
                      />
                      <label className={`absolute left-12 text-slate-500 pointer-events-none transition-all duration-300 font-medium ${confirmPassword.length > 0 ? 'top-1.5 text-[11px] text-slate-400' : 'top-1/2 -translate-y-1/2 text-[15px] peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-[#FF6B00]'}`}>
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-500 text-[12px] font-medium mt-1 pl-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {password.length > 0 && (
                  <div className="mt-6 bg-slate-50 p-5 rounded-[16px] border border-slate-100 animate-slide-up">
                    <div className="mb-3 text-[12px] font-bold flex justify-between">
                      <span className="text-slate-500">Password Strength</span>
                      <span className={getPasswordStrength().color}>{getPasswordStrength().label}</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                      <div className={`h-full ${getPasswordStrength().bg} transition-all duration-500 ease-out`} style={{ width: getPasswordStrength().w }} />
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-[12px] font-medium text-slate-500">
                      <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-emerald-500' : ''}`}><CheckCircle className="w-3.5 h-3.5" /> 8+ Characters</div>
                      <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-emerald-500' : ''}`}><CheckCircle className="w-3.5 h-3.5" /> 1 Uppercase</div>
                      <div className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-emerald-500' : ''}`}><CheckCircle className="w-3.5 h-3.5" /> 1 Lowercase</div>
                      <div className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-emerald-500' : ''}`}><CheckCircle className="w-3.5 h-3.5" /> 1 Number</div>
                      <div className={`flex items-center gap-2 ${/[^A-Za-z0-9\s]/.test(password) ? 'text-emerald-500' : ''}`}><CheckCircle className="w-3.5 h-3.5" /> 1 Special Char</div>
                      <div className={`flex items-center gap-2 ${!/\s/.test(password) && password.length > 0 ? 'text-emerald-500' : ''}`}><CheckCircle className="w-3.5 h-3.5" /> No Spaces</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex gap-4">
            {currentStep > 1 && (
              <button 
                type="button" 
                onClick={handleBack} 
                className="h-[56px] px-8 rounded-[14px] font-bold text-[15px] text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-300 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            
            {currentStep < 4 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                disabled={currentStep === 2 && !otpVerified}
                className="flex-1 h-[56px] rounded-[14px] font-bold text-[15px] text-white bg-themePrimary hover:brightness-110 shadow-lg shadow-orange-500/20 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={loading || !userType} 
                className="flex-1 h-[56px] rounded-[14px] font-bold text-[15px] text-white bg-themePrimary hover:brightness-110 shadow-lg shadow-orange-500/20 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : <><UserPlus className="w-5 h-5" /> Create Account</>}
              </button>
            )}
          </div>

          <div className="mt-8 text-center text-[14px] text-slate-500 font-medium">
            Already have an account? <Link href="/login" className="font-bold text-themePrimary hover:underline underline-offset-4 ml-1">Sign In</Link>
          </div>
          <div id="recaptcha-container"></div>
        </div>
      </div>

      {/* Back to Home Page Link */}
      <div className="text-center mt-2 relative z-10 mb-8">
        <Link href="/" className="text-[14px] font-bold text-[#64748B] hover:text-[#1A1A1A] transition-colors inline-flex items-center gap-2">
          ← Back to Home Page
        </Link>
      </div>
    </div>
  );
}
