import apiClient from "../../../services/apiClient";
import type { Notification } from "../types/notification";
import { mockNotifications } from "../../../data/mockNotifications";

const IS_MOCK = true;
let currentNotifications = [...mockNotifications];

export const notificationService = {
  getNotifications: async (userId?: number): Promise<Notification[]> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let data = [...currentNotifications].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      if (userId) {
        data = data.filter(n => n.user_id === userId);
      }
      return data;
    }

    const response = await apiClient.get<any, Notification[]>("/notifications", {
      params: { user_id: userId },
    });
    return response;
  },

  markAsRead: async (notificationId: number): Promise<Notification> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const notifIndex = currentNotifications.findIndex(n => n.notification_id === notificationId);
      if (notifIndex > -1) {
        currentNotifications[notifIndex] = { ...currentNotifications[notifIndex], is_read: true };
        return currentNotifications[notifIndex];
      }
      throw new Error("Notification not found");
    }
    const response = await apiClient.patch<any, Notification>(`/notifications/${notificationId}/read`);
    return response;
  },
  
  markAllAsRead: async (userId?: number): Promise<boolean> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      currentNotifications = currentNotifications.map(n => {
        if (!userId || n.user_id === userId) {
          return { ...n, is_read: true };
        }
        return n;
      });
      return true;
    }
    const response = await apiClient.patch<any, boolean>("/notifications/read-all", { user_id: userId });
    return response;
  },
  deleteNotification: async (notificationId: number): Promise<boolean> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const initialLength = currentNotifications.length;
      currentNotifications = currentNotifications.filter(n => n.notification_id !== notificationId);
      if (currentNotifications.length < initialLength) {
        return true;
      }
      throw new Error("Notification not found");
    }
    await apiClient.delete(`/notifications/${notificationId}`);
    return true;
  }
};
