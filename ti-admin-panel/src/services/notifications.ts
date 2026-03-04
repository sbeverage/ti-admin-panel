import { notificationsAPI } from './api';

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  level: NotificationLevel;
  createdAt: number;
  read: boolean;
}

export interface NotificationsSnapshot {
  notifications: AppNotification[];
  unreadCount: number;
}

const STORAGE_KEY = 'ti_admin_notifications_v1';
const MAX_NOTIFICATIONS = 50;
const UPDATE_EVENT = 'notifications:updated';

const readStorage = (): AppNotification[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to read notifications storage:', error);
    return [];
  }
};

const writeStorage = (notifications: AppNotification[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.warn('Failed to write notifications storage:', error);
  }
};

const emitUpdate = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
};

const toAppNotification = (raw: any): AppNotification => ({
  id: String(raw.id),
  title: raw.title,
  message: raw.message || undefined,
  level: raw.level || 'info',
  createdAt: new Date(raw.created_at || raw.createdAt || Date.now()).getTime(),
  read: !!raw.read_at || !!raw.read,
});

const storeSnapshot = (notifications: AppNotification[]) => {
  writeStorage(notifications.slice(0, MAX_NOTIFICATIONS));
  emitUpdate();
};

export const fetchNotifications = async (limit = 20): Promise<NotificationsSnapshot> => {
  try {
    const response = await notificationsAPI.getNotifications({ limit });
    if (!response.success) {
      throw new Error(response.error || 'Failed to load notifications');
    }

    const notifications = (response.data || []).map(toAppNotification);
    storeSnapshot(notifications);
    return {
      notifications,
      unreadCount: response.unreadCount ?? notifications.filter((item) => !item.read).length,
    };
  } catch (error) {
    const fallback = readStorage().sort((a, b) => b.createdAt - a.createdAt);
    return {
      notifications: fallback,
      unreadCount: fallback.filter((item) => !item.read).length,
    };
  }
};

export const addNotification = async (
  notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
) => {
  try {
    await notificationsAPI.createNotification({
      title: notification.title,
      message: notification.message,
      level: notification.level,
    });
  } catch (error) {
    const current = readStorage();
    const next: AppNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: Date.now(),
      read: false,
    };
    storeSnapshot([next, ...current]);
    return;
  }

  await fetchNotifications();
};

export const markAllRead = async () => {
  try {
    await notificationsAPI.markAllRead();
  } catch (error) {
    const updated = readStorage().map((item) => ({ ...item, read: true }));
    storeSnapshot(updated);
    return;
  }

  await fetchNotifications();
};

export const markRead = async (id: string) => {
  try {
    await notificationsAPI.markRead([id]);
  } catch (error) {
    const updated = readStorage().map((item) => (item.id === id ? { ...item, read: true } : item));
    storeSnapshot(updated);
    return;
  }

  await fetchNotifications();
};

export const subscribeToNotifications = (callback: () => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => callback();
  window.addEventListener(UPDATE_EVENT, handler);
  return () => window.removeEventListener(UPDATE_EVENT, handler);
};
