export type NotificationType = "budget_alert" | "daily_reminder" | "system";

export interface Notification {
  notification_id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export type NotificationFilterType =
  | "ALL"
  | "UNREAD"
  | "BUDGET"
  | "REMINDER"
  | "SYSTEM";

export const filterTypeToBackend: Record<
  Exclude<NotificationFilterType, "ALL" | "UNREAD">,
  NotificationType
> = {
  BUDGET: "budget_alert",
  REMINDER: "daily_reminder",
  SYSTEM: "system",
};