import apiClient from "../../../services/apiClient";
import type { Notification } from "../types/notification";

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<unknown, Notification[]>("/notifications");
    return response;
  },

  markAsRead: async (notificationId: number): Promise<Notification> => {
    const response = await apiClient.patch<unknown, Notification>(`/notifications/${notificationId}/read`);
    return response;
  },

  markAllAsRead: async (): Promise<boolean> => {
    const response = await apiClient.patch<unknown, boolean>("/notifications/read-all");
    return response;
  },

  deleteNotification: async (notificationId: number): Promise<boolean> => {
    await apiClient.delete(`/notifications/${notificationId}`);
    return true;
  },
};
