import api from '@/lib/api';

export interface NotificationItem {
  id: number | string;
  title: string;
  message: string;
  time?: string;
  type: 'info' | 'warning' | 'success' | 'expiry';
  is_read: boolean;
  link?: string;
  created_at: string;
}

const NOTIFICATION_KEY = 'dms_notifications';

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Passport Renewal Expiry Notice',
    message: 'Your Passport document is set to expire on July 29, 2026. Please renew or update your record.',
    type: 'expiry',
    is_read: false,
    link: '/user/expiry',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'notif-2',
    title: 'Document Uploaded Successfully',
    message: '"Software_Architecture_Proposal_2026.pdf" was vaulted into Projects & Technical Specs.',
    type: 'success',
    is_read: false,
    link: '/user/documents',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'notif-3',
    title: 'Storage Quota Alert',
    message: 'You have used 7.8 GB of your 10 GB storage plan. Upgrade to Enterprise for unlimited storage.',
    type: 'warning',
    is_read: false,
    link: '/user/subscription',
    created_at: new Date(Date.now() - 3600000 * 14).toISOString()
  },
  {
    id: 'notif-4',
    title: 'Document Added to Favorites',
    message: '"Senior_Developer_Resume_2026.docx" was added to your Favorite Documents collection.',
    type: 'info',
    is_read: true,
    link: '/user/favorites',
    created_at: new Date(Date.now() - 3600000 * 28).toISOString()
  }
];

function notifyListeners() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dms_notifications_updated'));
  }
}

export function getNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return SEED_NOTIFICATIONS;
  try {
    const saved = localStorage.getItem(NOTIFICATION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(SEED_NOTIFICATIONS));
  return SEED_NOTIFICATIONS;
}

export function getUnreadNotificationCount(): number {
  const notifs = getNotifications();
  return notifs.filter(n => !n.is_read).length;
}

export function syncExpiryNotifications(documents: any[]): NotificationItem[] {
  if (!Array.isArray(documents) || documents.length === 0) return getNotifications();

  const currentNotifs = getNotifications();
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let updated = [...currentNotifs];
  let changed = false;

  documents.forEach(doc => {
    if (!doc || !doc.expiry_date) return;

    const eDate = new Date(doc.expiry_date);
    if (isNaN(eDate.getTime())) return;

    const expZero = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate());
    const diffDays = Math.ceil((expZero.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    const title = doc.title || doc.file_name || 'Document';

    let notifId = '';
    let notifTitle = '';
    let notifMsg = '';

    if (diffDays <= 0) {
      notifId = `expiry-doc-${doc.id}-${doc.expiry_date}-expired`;
      notifTitle = `🔴 Document Expired: ${title}`;
      notifMsg = `Your document "${title}" expired on ${doc.expiry_date}. Action required for renewal.`;
    } else if (diffDays <= 7) {
      notifId = `expiry-doc-${doc.id}-${doc.expiry_date}-urgent`;
      notifTitle = `🟡 Expiring Soon (${diffDays} Days): ${title}`;
      notifMsg = `Your document "${title}" will expire in ${diffDays} day${diffDays === 1 ? '' : 's'} on ${doc.expiry_date}.`;
    } else if (diffDays <= 30) {
      notifId = `expiry-doc-${doc.id}-${doc.expiry_date}-reminder`;
      notifTitle = `🕒 Upcoming Expiry Reminder: ${title}`;
      notifMsg = `Reminder: "${title}" is set to expire on ${doc.expiry_date} (${diffDays} days remaining).`;
    }

    if (notifId) {
      const exists = updated.some(n => String(n.id) === notifId);
      if (!exists) {
        const newNotif: NotificationItem = {
          id: notifId,
          title: notifTitle,
          message: notifMsg,
          type: 'expiry',
          is_read: false,
          link: '/user/expiry',
          created_at: new Date().toISOString()
        };
        updated.unshift(newNotif);
        changed = true;
      }
    }
  });

  if (changed && typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated.slice(0, 100)));
    notifyListeners();
  }

  return updated;
}

export async function checkAndSyncExpiryNotifications(): Promise<NotificationItem[]> {
  try {
    const res = await api.get('/documents?limit=1000');
    if (res.data?.success && Array.isArray(res.data.documents)) {
      return syncExpiryNotifications(res.data.documents);
    }
  } catch (e) {
    console.warn('[NotificationStore] Failed to fetch documents for expiry sync:', e);
  }
  return getNotifications();
}

export function addNotification(title: string, message: string, type: 'info' | 'warning' | 'success' | 'expiry' = 'info', link?: string): NotificationItem {
  const newNotif: NotificationItem = {
    id: Date.now(),
    title,
    message,
    type,
    is_read: false,
    link: link || '/user/documents',
    created_at: new Date().toISOString()
  };

  const list = getNotifications();
  const updated = [newNotif, ...list];
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated.slice(0, 100)));
    notifyListeners();
  }
  return newNotif;
}

export function markNotificationAsRead(id: number | string): NotificationItem[] {
  const list = getNotifications();
  const updated = list.map(n => String(n.id) === String(id) ? { ...n, is_read: true } : n);
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
    notifyListeners();
  }
  return updated;
}

export function toggleNotificationRead(id: number | string): NotificationItem[] {
  const list = getNotifications();
  const updated = list.map(n => String(n.id) === String(id) ? { ...n, is_read: !n.is_read } : n);
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
    notifyListeners();
  }
  return updated;
}

export function markAllNotificationsAsRead(): NotificationItem[] {
  const list = getNotifications();
  const updated = list.map(n => ({ ...n, is_read: true }));
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
    notifyListeners();
  }
  return updated;
}

export function deleteNotification(id: number | string): NotificationItem[] {
  const list = getNotifications();
  const updated = list.filter(n => String(n.id) !== String(id));
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
    notifyListeners();
  }
  return updated;
}

export function clearNotifications(): NotificationItem[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify([]));
    notifyListeners();
  }
  return [];
}
