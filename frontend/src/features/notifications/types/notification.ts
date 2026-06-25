export type NotificationType = "WARNING" | "REMINDER" | "SYSTEM";

export interface Notification {
  notification_id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string; // ISO format string
}

export type NotificationFilterType = "ALL" | "UNREAD" | "WARNING" | "REMINDER" | "SYSTEM";
