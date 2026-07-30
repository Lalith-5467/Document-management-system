import api from './api';

export interface ActivityItem {
  id: number | string;
  user_id?: number;
  action_type: string; // 'UPLOAD' | 'DOWNLOAD' | 'DELETE' | 'RESTORE' | 'FAVORITE_ADD' | 'FAVORITE_REMOVE' | 'EDIT' | 'MOVE' | 'CREATE_FOLDER' | 'CREATE_CATEGORY' | 'RENEW' | 'LOGIN';
  document_name?: string | null;
  details: string;
  created_at: string; // ISO string
}

const STORAGE_KEY = 'dms_user_activities';

/**
 * Log a user action to both local storage and the backend API
 */
export async function logActivity(action_type: string, document_name: string | null = null, details: string = '') {
  const newLog: ActivityItem = {
    id: Date.now(),
    user_id: 1,
    action_type: action_type.toUpperCase(),
    document_name: document_name || null,
    details: details || '',
    created_at: new Date().toISOString()
  };

  // 1. Save to local storage for instant real-time audit log updating
  if (typeof window !== 'undefined') {
    let currentLogs: ActivityItem[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) currentLogs = JSON.parse(stored);
    } catch (e) {}

    const updated = [newLog, ...currentLogs.filter(l => String(l.id) !== String(newLog.id))];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 100))); // Keep last 100 activities
  }

  // 2. Post log to backend API asynchronously
  try {
    await api.post('/activity', {
      action_type: action_type.toUpperCase(),
      document_name: document_name || null,
      details: details || ''
    }).catch(() => null);
  } catch (err) {
    // Silent catch for smooth client offline support
  }

  return newLog;
}

/**
 * Get combined activities from local storage and backend API
 */
export async function getUserActivities(params?: any): Promise<{ activities: ActivityItem[]; totalCount: number }> {
  let localLogs: ActivityItem[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) localLogs = JSON.parse(stored);
    } catch (e) {}
  }

  let apiLogs: ActivityItem[] = [];
  try {
    const res = await api.get('/activity', { params }).catch(() => null);
    if (res?.data?.activities && Array.isArray(res.data.activities)) {
      apiLogs = res.data.activities;
    }
  } catch (err) {}

  // Initial seed fallback activities if no actions performed yet
  const defaultSeeds: ActivityItem[] = [
    { id: 'seed-1', user_id: 1, action_type: 'UPLOAD', document_name: 'Software_Architecture_Proposal_2026.pdf', details: 'Uploaded document to Projects & Technical Specs', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'seed-2', user_id: 1, action_type: 'FAVORITE_ADD', document_name: 'Senior_Developer_Resume_2026.docx', details: 'Starred document as Favorite', created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
    { id: 'seed-3', user_id: 1, action_type: 'CREATE_FOLDER', document_name: null, details: 'Created workspace folder "Project Architecture"', created_at: new Date(Date.now() - 3600000 * 12).toISOString() },
    { id: 'seed-4', user_id: 1, action_type: 'PREVIEW', document_name: 'Official_Passport_Scan_Copy.png', details: 'Viewed document in browser preview', created_at: new Date(Date.now() - 3600000 * 18).toISOString() },
    { id: 'seed-5', user_id: 1, action_type: 'LOGIN', document_name: null, details: 'User session authenticated successfully', created_at: new Date(Date.now() - 3600000 * 24).toISOString() }
  ];

  let combined: ActivityItem[] = [];
  if (localLogs.length > 0 || apiLogs.length > 0) {
    const apiIds = new Set(apiLogs.map(l => String(l.id)));
    const extraLocal = localLogs.filter(l => !apiIds.has(String(l.id)));
    combined = [...extraLocal, ...apiLogs];
  } else {
    combined = defaultSeeds;
  }

  // Sort descending by created_at date
  combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    activities: combined,
    totalCount: combined.length
  };
}

/**
 * Clear activity log history
 */
export async function clearUserActivities(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  try {
    await api.delete('/activity').catch(() => null);
  } catch (e) {}
}
