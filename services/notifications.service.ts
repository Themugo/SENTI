/**
 * Notifications Service — Mock implementation
 */

import { mockNotifications, mockSupportTickets } from '@/services/mock-data';
import type { Notification, SupportTicket } from '@/types';

function delay<T>(data: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const notificationsService = {
  async getAll(): Promise<Notification[]> {
    return delay([...mockNotifications]);
  },

  async getUnread(): Promise<Notification[]> {
    return delay(mockNotifications.filter((n) => !n.read));
  },

  async markAsRead(id: string): Promise<{ success: boolean }> {
    return delay({ success: true });
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    return delay({ success: true });
  },

  async getSupportTickets(): Promise<SupportTicket[]> {
    return delay([...mockSupportTickets]);
  },
};
