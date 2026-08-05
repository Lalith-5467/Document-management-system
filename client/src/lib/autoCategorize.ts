export interface AutoCategoryResult {
  categoryName: string;
  confidence: 'high' | 'medium';
}

/**
 * Detects the best category for a given filename.
 * Category names MUST match the seeded DB categories exactly:
 * 1=Personal Documents, 2=Academic Documents, 3=Project Documents,
 * 4=Certificates, 5=Resume, 6=Client Requirement Documents, 7=Bills, 8=Others
 */
export function detectCategoryFromFilename(filename: string): AutoCategoryResult | null {
  const name = filename.toLowerCase();

  // Resume / CV → category "Resume" (id: 5)
  if (/resume|cv|biodata|cover.?letter|portfolio|curriculum.?vitae/i.test(name)) {
    return { categoryName: 'Resume', confidence: 'high' };
  }

  // Academic → category "Academic Documents" (id: 2)
  if (/marksheet|degree|diploma|transcript|semester|grade|result|school|college|university|exam|academic/i.test(name)) {
    return { categoryName: 'Academic Documents', confidence: 'high' };
  }

  // Certificates → category "Certificates" (id: 4)
  if (/certificate|certification|award|badge|completion|license|accreditation/i.test(name)) {
    return { categoryName: 'Certificates', confidence: 'high' };
  }

  // Personal Identity → category "Personal Documents" (id: 1)
  if (/passport|driving.?license|aadhaar|pan.?card|voter|national.?id|citizenship|birth.?cert|identity|id.?proof/i.test(name)) {
    return { categoryName: 'Personal Documents', confidence: 'high' };
  }

  // Bills & Finance → category "Bills" (id: 7)
  if (/invoice|bill|receipt|tax|gst|statement|bank.?statement|form16|itr|utility|subscription|payment/i.test(name)) {
    return { categoryName: 'Bills', confidence: 'high' };
  }

  // Client / Business Docs → category "Client Requirement Documents" (id: 6)
  if (/brd|contract|agreement|nda|scope|sow|proposal|requirement|client|business|arch|specs/i.test(name)) {
    return { categoryName: 'Client Requirement Documents', confidence: 'high' };
  }

  // Project / Technical → category "Project Documents" (id: 3)
  if (/project|technical|architecture|design|diagram|report|specs|roadmap|presentation|deck|pitch/i.test(name)) {
    return { categoryName: 'Project Documents', confidence: 'high' };
  }

  // No match → return null so the upload page keeps its current category
  return null;
}

/**
 * Suggests a category name based on a folder name.
 * Used when user picks a folder in the upload form to auto-fill category.
 */
export function detectCategoryFromFolderName(folderName: string): AutoCategoryResult | null {
  const name = folderName.toLowerCase();

  if (/resume|cv|curriculum/i.test(name)) return { categoryName: 'Resume', confidence: 'high' };
  if (/academic|degree|transcript|university|college|school|marksheet/i.test(name)) return { categoryName: 'Academic Documents', confidence: 'high' };
  if (/certificate|award|badge|certif/i.test(name)) return { categoryName: 'Certificates', confidence: 'high' };
  if (/passport|identity|id.?proof|personal/i.test(name)) return { categoryName: 'Personal Documents', confidence: 'high' };
  if (/bill|invoice|tax|finance|receipt|payment/i.test(name)) return { categoryName: 'Bills', confidence: 'high' };
  if (/client|contract|brd|requirement|scope/i.test(name)) return { categoryName: 'Client Requirement Documents', confidence: 'high' };
  if (/project|technical|architecture/i.test(name)) return { categoryName: 'Project Documents', confidence: 'high' };

  return null;
}
