/**
 * Comprehensive Vanilla JavaScript Form Validation Module
 * DocVault Enterprise Authentication & Form Validation Engine
 */

export interface PasswordRequirements {
  minLength: boolean;
  maxLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  noSpaces: boolean;
}

export interface PasswordStrength {
  score: number;
  label: 'Weak' | 'Medium' | 'Strong';
  color: string;
  bgColor: string;
  borderColor: string;
  width: string;
}

export interface ValidationResult {
  isValid: boolean;
  error: string;
}

// ─── 1. Password Requirements & Strength Assessment ─────────

/**
 * Assesses individual password rule requirements live.
 */
export function updatePasswordRequirements(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 6,
    maxLength: password.length > 0,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noSpaces: password.length > 0 && !/\s/.test(password),
  };
}

/**
 * Computes live password strength level and visual parameters.
 * Weak (Red), Medium (Orange), Strong (Green)
 */
export function updatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Weak',
      color: 'text-slate-400',
      bgColor: 'bg-slate-200 dark:bg-slate-800',
      borderColor: 'border-slate-300',
      width: '0%',
    };
  }

  const reqs = updatePasswordRequirements(password);
  let score = 0;
  if (reqs.minLength) score++;
  if (reqs.hasUpper) score++;
  if (reqs.hasLower) score++;
  if (reqs.hasNumber) score++;
  if (reqs.hasSpecial) score++;

  if (score <= 2) {
    return {
      score: 1,
      label: 'Weak',
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      borderColor: 'border-red-500',
      width: '33%',
    };
  } else if (score <= 4) {
    return {
      score: 2,
      label: 'Medium',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500',
      borderColor: 'border-orange-500',
      width: '66%',
    };
  } else {
    return {
      score: 3,
      label: 'Strong',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500',
      borderColor: 'border-emerald-500',
      width: '100%',
    };
  }
}

// ─── 2. Input Field Validation Functions ──────────────────────

/**
 * Validates Full Name:
 * - Required
 * - Minimum 3 characters
 * - Maximum 50 characters
 * - Only letters and spaces allowed
 */
export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Full Name is required.' };
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Full Name must be at least 3 characters.' };
  }
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Full Name cannot exceed 50 characters.' };
  }
  const lettersAndSpacesOnly = /^[A-Za-z\s]+$/;
  if (!lettersAndSpacesOnly.test(trimmed)) {
    return { isValid: false, error: 'Full Name can only contain letters and spaces.' };
  }
  return { isValid: true, error: '' };
}

/**
 * Validates Email Address:
 * - Required
 * - Must be in a valid email format
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email Address is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  return { isValid: true, error: '' };
}

/**
 * Validates Password (Register):
 * - Required
 * - Minimum 6 characters
 * - Accepts any valid password 6+ characters long
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters.' };
  }
  if (/\s/.test(password)) {
    return { isValid: false, error: 'Password cannot contain spaces.' };
  }
  return { isValid: true, error: '' };
}

/**
 * Validates Password (Login):
 * - Required
 * - Minimum 6 characters
 * - Do not allow empty or whitespace-only values
 */
export function validateLoginPassword(password: string): ValidationResult {
  const trimmed = password.trim();
  if (!password || !trimmed) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters.' };
  }
  return { isValid: true, error: '' };
}

/**
 * Validates Confirm Password:
 * - Required
 * - Must match Password field exactly
 */
export function validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password.' };
  }
  if (confirmPassword !== password) {
    return { isValid: false, error: 'Passwords do not match.' };
  }
  return { isValid: true, error: '' };
}

/**
 * Validates Phone Number (Optional):
 * - If entered, must contain exactly 10 digits
 * - Accept only numbers
 * - No letters or symbols
 */
export function validatePhone(phone: string): ValidationResult {
  const trimmed = phone.trim();
  if (!trimmed) {
    // Optional field - valid if empty
    return { isValid: true, error: '' };
  }
  const tenDigitsRegex = /^\d{10}$/;
  if (!tenDigitsRegex.test(trimmed)) {
    return { isValid: false, error: 'Phone number must contain exactly 10 digits.' };
  }
  return { isValid: true, error: '' };
}

/**
 * Validates Login Form (Email & Password)
 */
export function validateLogin(email: string, password: string): { isValid: boolean; errors: { email: string; password: string } } {
  const emailRes = validateEmail(email);
  const passRes = validateLoginPassword(password);
  return {
    isValid: emailRes.isValid && passRes.isValid,
    errors: {
      email: emailRes.error,
      password: passRes.error,
    },
  };
}

// ─── 3. UI Helper Classes (Error & Success styling) ────────────

/**
 * Returns CSS border & glow classes for input fields based on validation state.
 */
export function getFieldStatusClasses(isTouched: boolean, isValid: boolean, errorMsg: string): string {
  if (!isTouched) {
    return 'border-slate-200 dark:border-slate-800 focus:border-themePrimary focus:ring-2 focus:ring-orange-500/20';
  }
  if (isValid && !errorMsg) {
    return 'border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/10';
  }
  return 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/10 dark:bg-red-950/10';
}

// ─── 4. Document Upload Validation Functions ───────────────────

export const ALLOWED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'zip'];
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export function validateDocumentFile(file: File | null): ValidationResult {
  if (!file) {
    return { isValid: false, error: 'Please select or drag a document file to upload.' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, error: 'File size exceeds the maximum allowed limit of 25 MB.' };
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
    return { isValid: false, error: 'Unsupported file format. Please upload PDF, Word, Excel, PowerPoint, Image, or ZIP.' };
  }
  return { isValid: true, error: '' };
}

export function validateDocumentTitle(title: string): ValidationResult {
  const trimmed = title.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Document title is required.' };
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Document title must be at least 3 characters.' };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: 'Document title cannot exceed 100 characters.' };
  }
  return { isValid: true, error: '' };
}

export function validateDocumentDescription(description: string): ValidationResult {
  const trimmed = description.trim();
  if (trimmed.length > 500) {
    return { isValid: false, error: 'Description cannot exceed 500 characters.' };
  }
  return { isValid: true, error: '' };
}

export function validateExpiryDate(expiryDate: string): ValidationResult {
  if (!expiryDate) {
    return { isValid: false, error: 'Expiry date is required.' };
  }
  const selectedDate = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(selectedDate.getTime())) {
    return { isValid: false, error: 'Please enter a valid expiry date.' };
  }
  if (selectedDate < today) {
    return { isValid: false, error: 'Expiry date cannot be in the past.' };
  }
  return { isValid: true, error: '' };
}
