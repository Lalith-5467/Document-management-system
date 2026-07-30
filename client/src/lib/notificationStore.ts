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
    link: '/user/calendar',
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
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated.slice(0, 50)));
  }
  return newNotif;
}

export function markNotificationAsRead(id: number | string): NotificationItem[] {
  const list = getNotifications();
  const updated = list.map(n => String(n.id) === String(id) ? { ...n, is_read: true } : n);
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function markAllNotificationsAsRead(): NotificationItem[] {
  const list = getNotifications();
  const updated = list.map(n => ({ ...n, is_read: true }));
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function clearNotifications(): NotificationItem[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify([]));
  }
  return [];
}
