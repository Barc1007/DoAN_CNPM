import type { Notification } from "../features/notifications/types/notification";

export const mockNotifications: Notification[] = [
  {
    notification_id: 1,
    user_id: 1,
    type: "WARNING",
    title: "Cảnh báo ngân sách",
    message: 'Bạn đã sử dụng 85% ngân sách "Ăn uống" tháng này (850,000/1,000,000đ)',
    is_read: false,
    created_at: "2026-04-17T10:00:00Z"
  },
  {
    notification_id: 2,
    user_id: 1,
    type: "REMINDER",
    title: "Nhắc nhở hàng ngày",
    message: "Bạn chưa ghi nhận giao dịch nào hôm nay. Đừng quên cập nhật chi tiêu nhé!",
    is_read: false,
    created_at: "2026-04-17T08:30:00Z"
  },
  {
    notification_id: 3,
    user_id: 1,
    type: "WARNING",
    title: "Vượt ngân sách",
    message: 'Ngân sách "Giải trí" đã vượt 105% giới hạn (525,000/500,000đ)',
    is_read: true,
    created_at: "2026-04-16T15:20:00Z"
  },
  {
    notification_id: 4,
    user_id: 1,
    type: "SYSTEM",
    title: "Cập nhật hệ thống",
    message: "StudentMoney v1.1 đã có nhiều tính năng mới! Cập nhật ngay để trải nghiệm.",
    is_read: true,
    created_at: "2026-04-15T09:00:00Z"
  },
  {
    notification_id: 5,
    user_id: 1,
    type: "SYSTEM",
    title: "Chào mừng bạn mới",
    message: "Cảm ơn bạn đã sử dụng StudentMoney. Hãy bắt đầu bằng việc thiết lập ngân sách đầu tiên nhé!",
    is_read: true,
    created_at: "2026-04-10T11:00:00Z"
  }
];
