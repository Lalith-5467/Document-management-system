'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
  User, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Edit2,
  GraduationCap, Briefcase, UserCheck, UserPlus, Phone, CheckCircle2, Check, CheckCircle,
  Building2, MapPin, Globe, Map, BriefcaseBusiness, ShieldCheck, Folder, Zap, Monitor, ArrowLeft, ChevronDown
} from 'lucide-react';

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Artificial Intelligence', 'Electronics', 'Electrical', 'Mechanical', 'Civil', 'Commerce', 'Business Administration', 'Mathematics', 'Physics', 'Chemistry', 'English', 'Other'];
const YEARS = ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Post Graduate', 'Research Scholar'];
const INDUSTRIES = ['Information Technology', 'Healthcare', 'Finance', 'Banking', 'Government', 'Education', 'Manufacturing', 'Construction', 'Legal', 'Media', 'Marketing', 'Other'];
const EXPERIENCES = ['Fresher', '1–2 Years', '3–5 Years', '6–10 Years', '10+ Years'];

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
  .cream-hover-card {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .cream-hover-card:hover {
    background-color: #FFFDF5 !important;
    border-color: #DFD0B8 !important;
    box-shadow: 0 10px 30px -5px rgba(215, 195, 160, 0.25) !important;
    transform: translateY(-2px);
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

const InputField = ({ icon: Icon, label, required, error, value, ...props }: any) => {
  const isFilled = value && value.toString().length > 0;
  return (
    <div className={`relative mb-4 group w-full ${error ? 'animate-shake-subtle' : ''}`}>
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center transition-all duration-200 pointer-events-none">
          <Icon className={`w-5 h-5 transition-all duration-200 ${error ? 'text-red-400' : 'text-slate-400 group-hover:text-[#D96B00] group-focus-within:text-[#1B664B] group-focus-within:scale-110'}`} />
        </div>
      )}
      <div className="relative">
        <input
          {...props}
          value={value}
          placeholder=" "
          className={`peer w-full h-[56px] ${Icon ? 'pl-12' : 'pl-4'} pr-4 pt-5 pb-1 bg-white border ${
            error 
              ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/15' 
              : 'border-[#E6E0D4] hover:border-[#DFD2BA] hover:bg-[#FFFDF8] focus:border-[#1B664B] focus:ring-4 focus:ring-emerald-500/20 focus:bg-white'
          } rounded-[16px] text-[15px] text-slate-900 focus:outline-none transition-all duration-200 font-medium cream-hover-input`}
        />
        <label className={`absolute left-${Icon ? '12' : '4'} text-slate-400 pointer-events-none transition-all duration-200 font-medium ${
          isFilled ? 'top-2 text-[11px] text-slate-400' : 'top-1/2 -translate-y-1/2 text-[15px] peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-[#1B664B]'
        }`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      {error && (
        <p className="text-red-500 text-[12px] font-medium mt-1.5 pl-1 flex items-center gap-1.5 animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

const SelectField = ({ icon: Icon, label, options, required, error, value, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isFilled = value && value.toString().length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative mb-4 group w-full ${error ? 'animate-shake-subtle' : ''}`} ref={dropdownRef}>
      {Icon && (
        <div className="absolute left-4 top-7 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center transition-all duration-200 pointer-events-none">
          <Icon className={`w-5 h-5 transition-all duration-200 ${error ? 'text-red-400' : isOpen ? 'text-[#1B664B] scale-110' : 'text-slate-400 group-hover:text-[#D96B00]'}`} />
        </div>
      )}
      <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div
          className={`w-full h-[56px] ${Icon ? 'pl-12' : 'pl-4'} pr-10 pt-5 pb-1 bg-white border ${
            error 
              ? 'border-red-300 ring-4 ring-red-500/15' 
              : isOpen
                ? 'border-[#1B664B] ring-4 ring-emerald-500/20 bg-white shadow-xs'
                : 'border-[#E6E0D4] hover:border-[#DFD2BA] hover:bg-[#FFFDF8]'
          } rounded-[16px] text-[15px] ${value ? 'text-slate-900 font-semibold' : 'text-transparent'} transition-all duration-200 font-medium cream-hover-input flex items-center justify-between select-none`}
        >
          <span className="truncate">{value || ' '}</span>
        </div>
        <label className={`absolute left-${Icon ? '12' : '4'} text-slate-400 pointer-events-none transition-all duration-200 font-medium ${
          isFilled || isOpen ? 'top-2 text-[11px] text-[#1B664B] font-semibold' : 'top-1/2 -translate-y-1/2 text-[15px]'
        }`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 ${
          isOpen ? 'rotate-180 text-[#1B664B]' : 'text-slate-400 group-hover:text-[#D96B00]'
        }`}>
          <ChevronDown className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      {/* Custom Floating Options Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[62px] z-50 bg-white border border-[#E8E1D5] rounded-[20px] shadow-[0_15px_45px_rgba(40,30,15,0.15)] py-2 max-h-[240px] overflow-y-auto animate-pop-in scrollbar-thin">
          <div className="px-4 py-2 text-[11px] font-bold text-[#1B664B] uppercase tracking-wider border-b border-slate-100 bg-[#FFFDF8] mb-1">
            Select {label}
          </div>
          {options.map((opt: string) => {
            const isSelected = value === opt;
            return (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`px-4 py-3 text-[14px] font-medium cursor-pointer transition-all duration-150 flex items-center justify-between ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#1B664B] to-[#E05500] text-white font-bold'
                    : 'text-slate-700 hover:bg-[#1B664B] hover:text-white'
                }`}
              >
                <span>{opt}</span>
                {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-[12px] font-medium mt-1.5 pl-1 flex items-center gap-1.5 animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
};

const CountryCodeSelect = ({ value, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const countryOptions = [
    { code: '+91', label: '+91 (IN)' },
    { code: '+1', label: '+1 (US)' },
    { code: '+44', label: '+44 (UK)' },
    { code: '+61', label: '+61 (AU)' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-[115px] shrink-0" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[56px] pl-3.5 pr-7 bg-white border ${
          isOpen ? 'border-[#1B664B] ring-4 ring-emerald-500/20' : 'border-[#E6E0D4] hover:border-[#DFD2BA] hover:bg-[#FFFDF8]'
        } rounded-[16px] text-[15px] font-bold text-slate-800 flex items-center justify-between cursor-pointer select-none transition-all duration-300 cream-hover-input`}
      >
        <div className="flex items-center gap-1.5">
          <Globe className={`w-4 h-4 ${isOpen ? 'text-[#1B664B]' : 'text-slate-400 group-hover:text-[#D96B00]'}`} />
          <span>{value}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 absolute right-2.5 top-1/2 -translate-y-1/2 ${isOpen ? 'rotate-180 text-[#1B664B]' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-[62px] w-[140px] z-50 bg-white border border-[#E8E1D5] rounded-[18px] shadow-[0_12px_35px_rgba(40,30,15,0.14)] py-1.5 overflow-hidden animate-slide-up">
          {countryOptions.map(opt => (
            <div
              key={opt.code}
              onClick={() => {
                onChange(opt.code);
                setIsOpen(false);
              }}
              className={`px-3.5 py-2.5 text-[13px] font-bold cursor-pointer transition-colors ${
                value === opt.code
                  ? 'bg-[#1B664B] text-white'
                  : 'text-slate-700 hover:bg-[#1B664B] hover:text-white'
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
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

  // Email OTP Verification State
  const [emailOtp, setEmailOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [otpErrorMsg, setOtpErrorMsg] = useState('');
  
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
  const [countryCode, setCountryCode] = useState('+91');

  // Resend timer effect
  useEffect(() => {
    let timer: any;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpTimer]);

  const handleSendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setOtpErrorMsg("Please enter a valid email address first.");
      return;
    }
    setOtpSending(true);
    setOtpErrorMsg("");
    setOtpSuccessMsg("");

    try {
      const res = await api.post('/auth/send-email-otp', { email });
      setOtpSending(false);
      if (res.data && res.data.success) {
        setOtpSent(true);
        setOtpSuccessMsg(res.data.message || `Verification code sent to ${email}`);
        setOtpTimer(60);
      } else {
        setOtpErrorMsg(res.data?.message || "Failed to send OTP.");
      }
    } catch (err: any) {
      setOtpSending(false);
      setOtpErrorMsg(err.response?.data?.message || "Failed to send OTP email.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!emailOtp || emailOtp.length < 4) {
      setOtpErrorMsg("Please enter the 6-digit verification code.");
      return;
    }
    setOtpVerifying(true);
    setOtpErrorMsg("");
    setOtpSuccessMsg("");

    try {
      const res = await api.post('/auth/verify-email-otp', { email, otp: emailOtp });
      setOtpVerifying(false);
      if (res.data && res.data.success) {
        setIsEmailVerified(true);
        setOtpSuccessMsg("Email verified successfully!");
        setErrors((prev: any) => ({ ...prev, email: undefined }));
      } else {
        setOtpErrorMsg(res.data?.message || "Invalid or expired OTP code.");
      }
    } catch (err: any) {
      setOtpVerifying(false);
      setOtpErrorMsg(err.response?.data?.message || "Invalid verification code.");
    }
  };

  const validateStep = (step: number) => {
    let errs: any = { ...errors };
    let isValid = true;
    
    if (step === 2) {
      if (!/^[a-zA-Z\s]{3,50}$/.test(fullName)) { errs.fullName = "Name should contain only letters (3-50 chars)."; isValid = false; } else { delete errs.fullName; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errs.email = "Please enter a valid email address."; isValid = false; } else { delete errs.email; }
      if (!isEmailVerified) { errs.email = "Please verify your email address via OTP first."; isValid = false; } else if (errs.email === "Please verify your email address via OTP first.") { delete errs.email; }
      if (!/^[6-9]\d{9}$/.test(mobileNumber)) { errs.mobileNumber = "Mobile number must contain exactly 10 digits starting with 6-9."; isValid = false; } else { delete errs.mobileNumber; }
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
      phoneVerified: true,
      emailVerified: true,
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

  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9\s]/.test(password)) score++;
    
    if (score < 3) return { label: 'Weak', color: 'text-red-500', bg: 'bg-red-500', w: 'w-1/3' };
    if (score < 5) return { label: 'Medium', color: 'text-[#1B664B]', bg: 'bg-[#E8F5F0]0', w: 'w-2/3' };
    return { label: 'Strong', color: 'text-emerald-500', bg: 'bg-emerald-500', w: 'w-full' };
  };

  if (successMsg) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-[32px] p-10 text-center shadow-xl border border-slate-200">
          <div className="w-16 h-16 bg-[#F0FDF4] text-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Aboard!</h2>
          <p className="text-slate-500 mb-8 font-medium">Your DocVault account has been created securely.</p>
          <Link href="/login" className="block w-full py-4 rounded-[16px] text-white font-bold bg-[#1B664B] hover:bg-[#14523C] active:bg-[#0F402E] shadow-md transition-all duration-300">
            Access Your Vault →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden animate-fade-up">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      {/* Professional Top Left Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white border border-slate-200 hover:border-[#1B664B] hover:bg-[#E8F5F0] text-slate-700 hover:text-slate-900 text-xs font-bold shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer font-auth-heading hover:-translate-y-0.5 whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 text-[#1B664B] group-hover:-translate-x-1 transition-transform duration-300 shrink-0" />
          <span>Back to Home Page</span>
        </Link>
      </div>

      {/* Main Centered Card Container */}
      <div className="w-full max-w-[480px] bg-white rounded-[32px] shadow-xl border border-slate-200 relative z-10 flex flex-col my-8 animate-card-float transition-shadow duration-500">
        <div className="p-8 sm:p-10">
          
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <Link href="/" className="inline-flex items-center justify-center mb-2 group">
              <div className="w-14 h-14 rounded-[22px] bg-[#1B664B] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-all duration-300">
                <ShieldCheck className="w-7 h-7 stroke-[2.2] group-hover:rotate-6 transition-transform duration-300" />
              </div>
            </Link>
            <h2 className="text-[28px] sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight font-auth-heading">
              Create your account
            </h2>
            <p className="text-[15px] text-slate-500 font-medium max-w-sm mx-auto">
              Store, organize and manage your documents securely.
            </p>
          </div>

          {/* Step Indicator with Green Progress */}
          <div className="flex items-center justify-center mb-9 max-w-sm mx-auto">
            <div className="flex items-center w-full">
              {[
                { step: 1, label: 'Role' },
                { step: 2, label: 'Info' },
                { step: 3, label: 'Details' },
                { step: 4, label: 'Security' }
              ].map((item, idx) => {
                const isCurrent = currentStep === item.step;
                const isDone = currentStep > item.step;
                return (
                  <React.Fragment key={item.step}>
                    <div className="flex flex-col items-center relative z-10">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-[#1B664B] text-white shadow-md ring-4 ring-[#E8F5F0] scale-110' 
                          : isDone 
                            ? 'bg-[#E8F5F0] text-[#1B664B] border border-[#D1EBE1]' 
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {isDone ? <Check className="w-4 h-4 stroke-[3] animate-check-pop" /> : item.step}
                      </div>
                      <span className={`text-[10px] font-semibold mt-1.5 transition-colors ${
                        isCurrent ? 'text-[#1B664B] font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    {idx < 3 && (
                      <div className={`flex-1 h-0.5 mx-1 -mt-4 transition-all duration-300 ${
                        currentStep > item.step ? 'bg-[#1B664B]' : 'bg-slate-200'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          
          {/* Validation Banner (Compact Modern) */}
          {globalError && (
            <div className="mb-6 p-4 rounded-[16px] bg-red-50 text-red-600 text-sm font-medium flex items-center gap-3 border border-red-100 animate-shake-subtle shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{globalError}</span>
            </div>
          )}

          {/* Forms Section */}
          <div>
            {/* STEP 1: ROLE SELECTION */}
            {currentStep === 1 && (
              <div className="animate-slide-up">
                <div className="flex flex-col gap-3.5">
                  {[
                    { id: 'student', icon: GraduationCap, title: 'Student', desc: 'Academic records & certificates' },
                    { id: 'professional', icon: BriefcaseBusiness, title: 'Professional', desc: 'Company documents & contracts' },
                    { id: 'individual', icon: User, title: 'Individual', desc: 'Personal documents & records' }
                  ].map((role) => {
                    const isSelected = userType === role.id;
                    return (
                      <label 
                        key={role.id}
                        onClick={() => setUserType(role.id)}
                        className={`relative p-5 rounded-[20px] cursor-pointer transition-all duration-300 flex flex-row items-center gap-4 group ${
                          isSelected 
                            ? 'bg-[#1B664B] text-white border-transparent shadow-lg scale-[1.01]' 
                            : 'bg-white border border-slate-200 hover:bg-[#E8F5F0] hover:border-[#1B664B] text-slate-900 shadow-xs hover:shadow-md hover:-translate-y-0.5'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all duration-300 ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : 'bg-[#E8F5F0] text-slate-600 group-hover:bg-[#D1EBE1] group-hover:text-[#1B664B]'
                        }`}>
                          <role.icon className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-[15px] font-bold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900 group-hover:text-slate-900'}`}>
                            {role.title}
                          </h3>
                          <p className={`text-[12px] mt-0.5 font-medium ${isSelected ? 'text-emerald-100' : 'text-slate-500 group-hover:text-slate-600'}`}>
                            {role.desc}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                          isSelected 
                            ? 'border-white bg-white' 
                            : 'border-slate-300 group-hover:border-[#D96B00] group-hover:bg-[#FFFDF5]'
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#1B664B]" />}
                        </div>
                        <input type="radio" name="accountType" className="hidden" checked={isSelected} readOnly />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: PERSONAL INFORMATION & EMAIL VERIFICATION */}
            {currentStep === 2 && (
              <div className="animate-slide-up space-y-4">
                <div className="flex flex-col gap-0">
                  <InputField icon={User} label="Full Name" required value={fullName} onChange={(e: any) => setFullName(e.target.value)} error={errors.fullName} />
                  
                  <InputField 
                    icon={Mail} 
                    label="Email Address" 
                    required 
                    disabled={isEmailVerified}
                    value={email} 
                    onChange={(e: any) => {
                      setEmail(e.target.value);
                      if (isEmailVerified) setIsEmailVerified(false);
                    }} 
                    error={errors.email} 
                  />

                  {/* Email OTP Verification Section */}
                  {isEmailVerified ? (
                    <div className="-mt-2 mb-4 px-4 py-3 rounded-[16px] bg-[#ECFDF5] text-emerald-800 border border-emerald-200/80 text-xs font-bold flex items-center justify-between animate-fade-in shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className="text-[13px] font-bold text-emerald-900">Email Address Verified</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setIsEmailVerified(false); setOtpSent(false); }}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200/70 px-2.5 py-1 rounded-full transition-all duration-200 flex items-center gap-1 shrink-0"
                      >
                        <Edit2 className="w-3 h-3" /> Edit Email
                      </button>
                    </div>
                  ) : (
                    <div className="-mt-2 mb-4">
                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpSending || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                          className="w-full py-2.5 px-4 rounded-[14px] text-xs font-bold text-[#1B664B] bg-[#FAF5EC] border border-[#EADECA] hover:bg-[#1B664B] hover:text-white hover:border-[#1B664B] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                        >
                          {otpSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP Email...</> : <><Mail className="w-4 h-4" /> Send Verification Code to Email</>}
                        </button>
                      ) : (
                        <div className="p-5 rounded-[22px] bg-gradient-to-br from-[#FFFDF8] via-[#FAF6EE] to-[#F5EBD9] border border-[#E8DCC4] shadow-[0_10px_30px_rgba(215,195,160,0.2)] animate-slide-up space-y-4 relative overflow-hidden">
                          {/* Ambient background glow accent */}
                          <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#1B664B]/8 rounded-full blur-xl pointer-events-none" />

                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-[#1B664B] to-[#E05500] text-white flex items-center justify-center shadow-xs">
                                <ShieldCheck className="w-4.5 h-4.5 stroke-[2.2]" />
                              </div>
                              <div>
                                <h4 className="text-[13px] font-bold text-slate-900 tracking-tight leading-none">
                                  Verification Code
                                </h4>
                                <span className="text-[11px] text-slate-500 font-medium mt-1 block truncate max-w-[190px]">
                                  Sent to {email}
                                </span>
                              </div>
                            </div>

                            {/* Timer / Resend Badge */}
                            <div>
                              {otpTimer > 0 ? (
                                <div className="px-2.5 py-1 rounded-full bg-[#FAF0E0] border border-[#E5D7BF] text-[#D96B00] text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                                  <span>Resend in</span>
                                  <span className="font-extrabold text-[#1B664B]">{otpTimer}s</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleSendOtp}
                                  disabled={otpSending}
                                  className="px-3 py-1 rounded-full bg-white border border-[#DFD2BA] text-[#1B664B] hover:bg-[#1B664B] hover:text-white text-[11px] font-bold transition-all duration-200 shadow-2xs"
                                >
                                  {otpSending ? "Sending..." : "Resend Code"}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Input & Verify Row */}
                          <div className="flex gap-2.5 items-center">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                maxLength={6}
                                value={emailOtp}
                                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="6-DIGIT CODE"
                                className="w-full h-[50px] px-4 bg-white border border-[#DFD2BA] focus:border-[#1B664B] focus:ring-4 focus:ring-emerald-500/20 focus:bg-white rounded-[16px] text-center text-[18px] font-extrabold tracking-[8px] text-slate-900 placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-[12px] placeholder:font-semibold focus:outline-none transition-all duration-300 shadow-inner"
                              />
                            </div>
                            
                            <button
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={otpVerifying || emailOtp.length < 4}
                              className="h-[50px] px-5 rounded-[16px] font-bold text-[13px] text-white bg-gradient-to-r from-[#1B664B] via-[#F76400] to-[#E05500] hover:brightness-105 shadow-md shadow-emerald-950/20 hover:shadow-lg hover:shadow-emerald-950/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                              {otpVerifying ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Verifying...</span>
                                </>
                              ) : (
                                <>
                                  <span>Verify Code</span>
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </>
                              )}
                            </button>
                          </div>

                          {/* Status Feedback Banners */}
                          {otpSuccessMsg && (
                            <div className="p-3 rounded-[14px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[12px] font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{otpSuccessMsg}</span>
                            </div>
                          )}

                          {otpErrorMsg && (
                            <div className="p-3 rounded-[14px] bg-red-50 text-red-600 border border-red-200/80 text-[12px] font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
                              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                              <span>{otpErrorMsg}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile Phone Field */}
                  <div className="relative mb-4 group w-full">
                    <div className="flex gap-2">
                      <CountryCodeSelect value={countryCode} onChange={setCountryCode} />
                      <div className="relative flex-1">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center transition-all duration-300 pointer-events-none">
                          <Phone className={`w-5 h-5 transition-colors duration-300 ${errors.mobileNumber ? 'text-red-400' : 'text-slate-400 group-hover:text-[#D96B00] group-focus-within:text-[#1B664B]'}`} />
                        </div>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={mobileNumber} 
                            onChange={e => setMobileNumber(e.target.value)} 
                            placeholder=" "
                            className={`peer w-full h-[56px] pl-12 pr-4 pt-5 pb-1 bg-white border ${
                              errors.mobileNumber 
                                ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/15' 
                                : 'border-[#E6E0D4] hover:border-[#DFD2BA] hover:bg-[#FFFDF8] focus:border-[#1B664B] focus:ring-4 focus:ring-emerald-500/20 focus:bg-white'
                            } rounded-[16px] text-[15px] font-medium focus:outline-none transition-all duration-300 disabled:bg-slate-50 disabled:text-slate-400 cream-hover-input`} 
                          />
                          <label className={`absolute left-12 text-slate-400 pointer-events-none transition-all duration-300 font-medium ${
                            mobileNumber.length > 0 ? 'top-2 text-[11px] text-slate-400' : 'top-1/2 -translate-y-1/2 text-[15px] peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-[#1B664B]'
                          }`}>
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    {errors.mobileNumber && (
                      <p className="text-red-500 text-[12px] font-medium mt-1.5 pl-1 flex items-center gap-1.5 animate-fade-in">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.mobileNumber}
                      </p>
                    )}
                  </div>
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

            {/* STEP 4: ACCOUNT SECURITY */}
            {currentStep === 4 && (
              <div className="animate-slide-up">
                <div className="flex flex-col gap-4">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center transition-all duration-300 pointer-events-none">
                      <Lock className={`w-5 h-5 transition-colors duration-300 ${errors.password ? 'text-red-400' : 'text-slate-400 group-hover:text-[#D96B00] group-focus-within:text-[#1B664B]'}`} />
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder=" "
                        className={`peer w-full h-[56px] pl-12 pr-12 pt-5 pb-1 bg-white border ${
                          errors.password 
                            ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/15' 
                            : 'border-[#E6E0D4] hover:border-[#DFD2BA] hover:bg-[#FFFDF8] focus:border-[#1B664B] focus:ring-4 focus:ring-emerald-500/20 focus:bg-white'
                        } rounded-[16px] text-[15px] font-medium focus:outline-none transition-all duration-300 cream-hover-input`} 
                      />
                      <label className={`absolute left-12 text-slate-400 pointer-events-none transition-all duration-300 font-medium ${
                        password.length > 0 ? 'top-2 text-[11px] text-slate-400' : 'top-1/2 -translate-y-1/2 text-[15px] peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-[#1B664B]'
                      }`}>
                        Password <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-[#FAF5EC] hover:text-[#D96B00] flex items-center justify-center text-slate-400 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {errors.password && <p className="text-red-500 text-[12px] font-medium mt-1.5 pl-1 flex items-center gap-1.5 animate-fade-in"><AlertCircle className="w-3.5 h-3.5" />{errors.password}</p>}
                  </div>

                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center transition-all duration-300 pointer-events-none">
                      <Lock className={`w-5 h-5 transition-colors duration-300 ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400 group-hover:text-[#D96B00] group-focus-within:text-[#1B664B]'}`} />
                    </div>
                    <div className="relative">
                      <input 
                        type={showConfirm ? 'text' : 'password'} 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        placeholder=" "
                        className={`peer w-full h-[56px] pl-12 pr-12 pt-5 pb-1 bg-white border ${
                          errors.confirmPassword 
                            ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/15' 
                            : 'border-[#E6E0D4] hover:border-[#DFD2BA] hover:bg-[#FFFDF8] focus:border-[#1B664B] focus:ring-4 focus:ring-emerald-500/20 focus:bg-white'
                        } rounded-[16px] text-[15px] font-medium focus:outline-none transition-all duration-300 cream-hover-input`} 
                      />
                      <label className={`absolute left-12 text-slate-400 pointer-events-none transition-all duration-300 font-medium ${
                        confirmPassword.length > 0 ? 'top-2 text-[11px] text-slate-400' : 'top-1/2 -translate-y-1/2 text-[15px] peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-[#1B664B]'
                      }`}>
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-[#FAF5EC] hover:text-[#D96B00] flex items-center justify-center text-slate-400 transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-500 text-[12px] font-medium mt-1.5 pl-1 flex items-center gap-1.5 animate-fade-in"><AlertCircle className="w-3.5 h-3.5" />{errors.confirmPassword}</p>}
                  </div>
                </div>

                {password.length > 0 && (
                  <div className="mt-6 bg-[#FAF6EE] p-5 rounded-[20px] border border-[#EAE2D2] animate-slide-up">
                    <div className="mb-3 text-[12px] font-bold flex justify-between">
                      <span className="text-slate-600">Password Strength</span>
                      <span className={getPasswordStrength().color}>{getPasswordStrength().label}</span>
                    </div>
                    <div className="h-2 bg-[#EFE9DC] rounded-full overflow-hidden mb-4">
                      <div className={`h-full ${getPasswordStrength().bg} transition-all duration-500 ease-out`} style={{ width: getPasswordStrength().w }} />
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-[12px] font-medium text-slate-500">
                      <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-emerald-600 font-semibold' : ''}`}><CheckCircle className="w-3.5 h-3.5" /> 8+ Characters</div>
                      <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-emerald-600 font-semibold' : ''}`}><CheckCircle className="w-3.5 h-3.5" /> 1 Uppercase</div>
                      <div className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-emerald-600 font-semibold' : ''}`}><CheckCircle className="w-3.5 h-3.5" /> 1 Lowercase</div>
                      <div className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-emerald-600 font-semibold' : ''}`}><CheckCircle className="w-3.5 h-3.5" /> 1 Number</div>
                      <div className={`flex items-center gap-2 ${/[^A-Za-z0-9\s]/.test(password) ? 'text-emerald-600 font-semibold' : ''}`}><CheckCircle className="w-3.5 h-3.5" /> 1 Special Char</div>
                      <div className={`flex items-center gap-2 ${!/\s/.test(password) && password.length > 0 ? 'text-emerald-600 font-semibold' : ''}`}><CheckCircle className="w-3.5 h-3.5" /> No Spaces</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3.5">
            {currentStep > 1 && (
              <button 
                type="button" 
                onClick={handleBack} 
                className="h-[54px] px-7 rounded-[16px] font-bold text-[15px] text-slate-700 bg-white border border-[#E6E0D4] hover:bg-[#FFFDF5] hover:border-[#DFD2BA] hover:shadow-xs active:scale-95 transition-all duration-200 flex items-center gap-2 cream-hover-btn cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 hover:-translate-x-0.5 transition-transform" /> Back
              </button>
            )}
            
            {currentStep < 4 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                className="group relative overflow-hidden flex-1 h-[54px] rounded-[16px] font-bold text-[15px] text-white bg-[#1B664B] hover:bg-[#14523C] active:bg-[#0F402E] shadow-md transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                <div className="relative z-10 flex items-center gap-2">
                  <span>Continue</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={loading || !userType} 
                className="group relative overflow-hidden flex-1 h-[54px] rounded-[16px] font-bold text-[15px] text-white bg-[#1B664B] hover:bg-[#14523C] active:bg-[#0F402E] shadow-md transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                {loading ? (
                  <div className="relative z-10 flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="relative z-10 flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    <span>Create Account</span>
                  </div>
                )}
              </button>
            )}
          </div>

          <div className="mt-8 text-center text-[14px] text-slate-500 font-medium">
            Already have an account? <Link href="/login" className="font-bold text-[#1B664B] hover:text-[#D96000] hover:underline underline-offset-4 ml-1 transition-colors">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
