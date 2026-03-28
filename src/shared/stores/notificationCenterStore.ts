import { create } from 'zustand';
import { generateCorrelationId } from '../services/http/correlationId';
import type { NotificationSeverity } from '../types';

export interface AdminNotificationItem {
  id: string;
  title: string;
  body?: string;
  severity?: NotificationSeverity;
  createdAtUtc: string;
  readAtUtc?: string | null;
}

export interface NotificationCenterStoreState {
  items: AdminNotificationItem[];
  add: (item: Omit<AdminNotificationItem, 'id' | 'createdAtUtc'> & Partial<Pick<AdminNotificationItem, 'id' | 'createdAtUtc'>>) => string;
  dismiss: (id: string) => void;
  markRead: (id: string) => void;
  clear: () => void;
}

export const useNotificationCenterStore = create<NotificationCenterStoreState>((set) => ({
  items: [],

  add: (item) => {
    const id = item.id ?? generateCorrelationId();
    const createdAtUtc = item.createdAtUtc ?? new Date().toISOString();
    const full: AdminNotificationItem = {
      id,
      title: item.title,
      body: item.body,
      severity: item.severity,
      createdAtUtc,
      readAtUtc: item.readAtUtc,
    };
    set((s) => ({ items: [full, ...s.items].slice(0, 50) }));
    return id;
  },

  dismiss: (id) => {
    set((s) => ({ items: s.items.filter((n) => n.id !== id) }));
  },

  markRead: (id) => {
    set((s) => ({
      items: s.items.map((n) =>
        n.id === id ? { ...n, readAtUtc: new Date().toISOString() } : n
      ),
    }));
  },

  clear: () => {
    set({ items: [] });
  },
}));
