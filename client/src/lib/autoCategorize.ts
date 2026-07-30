export interface AutoCategoryResult {
  categoryName: string;
  confidence: 'high' | 'medium';
}

export function detectCategoryFromFilename(filename: string): AutoCategoryResult {
  const name = filename.toLowerCase();

  // Career & Employment
  if (/resume|cv|biodata|offer_?letter|experience|employment|recommendation|joining|relieving/i.test(name)) {
    return { categoryName: 'Career Documents', confidence: 'high' };
  }

  // Academic Records
  if (/marksheet|degree|diploma|transcript|semester|grade|result|certificate|school|college|university|exam/i.test(name)) {
    return { categoryName: 'Academic Records', confidence: 'high' };
  }

  // Personal Documents / Identity
  if (/passport|driving_?license|dl|aadhaar|pan_?card|voter|national_?id|citizenship|birth_?certificate/i.test(name)) {
    return { categoryName: 'Personal Documents', confidence: 'high' };
  }

  // Insurance
  if (/insurance|policy|health_?claim|vehicle_?insurance|term_?life|coverage|premium/i.test(name)) {
    return { categoryName: 'Insurance', confidence: 'high' };
  }

  // Finance & Taxes
  if (/invoice|tax_?report|tax|gst|bill|receipt|statement|bank_?statement|form16|audit|itr/i.test(name)) {
    return { categoryName: 'Finance', confidence: 'high' };
  }

  // Payroll
  if (/salary|payslip|pay_?stub|compensation|bonus|reimbursement/i.test(name)) {
    return { categoryName: 'Payroll', confidence: 'high' };
  }

  // Business
  if (/proposal|business|presentation|deck|pitch|strategy|roadmap|specs|architecture/i.test(name)) {
    return { categoryName: 'Business', confidence: 'high' };
  }

  // Legal
  if (/contract|agreement|nda|deed|lease|rent|terms|legal|affidavit|notary/i.test(name)) {
    return { categoryName: 'Legal', confidence: 'high' };
  }

  // Fallback default
  return { categoryName: 'General Documents', confidence: 'medium' };
}
