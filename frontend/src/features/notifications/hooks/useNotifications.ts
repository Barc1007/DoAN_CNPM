/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Notification, NotificationFilterType } from '../types/notification';
import { notificationService } from '../services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<NotificationFilterType>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ================= FETCH =================
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch {
      setError('Lỗi khi tải thông báo. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ================= ACTIONS =================

  // Mark 1 notification as read (optimistic)
  const markAsRead = async (id: number) => {
    const prev = notifications;

    setNotifications(prevState =>
      prevState.map(n =>
        n.notification_id === id ? { ...n, is_read: true } : n
      )
    );

    try {
      await notificationService.markAsRead(id);
    } catch {
      setNotifications(prev); // rollback
      setError('Không thể đánh dấu đã đọc.');
    }
  };

  // Mark all as read (optimistic)
  const markAllAsRead = async () => {
    const prev = notifications;

    setNotifications(prevState =>
      prevState.map(n => ({ ...n, is_read: true }))
    );

    try {
      await notificationService.markAllAsRead();
    } catch {
      setNotifications(prev); // rollback
      setError('Không thể đánh dấu tất cả.');
    }
  };

  // Delete notification (optimistic + rollback)
  const deleteNotification = async (id: number) => {
    const prev = notifications;

    setNotifications(prevState =>
      prevState.filter(n => n.notification_id !== id)
    );

    try {
      await notificationService.deleteNotification(id);
    } catch {
      setNotifications(prev); // rollback
      setError('Xóa thông báo thất bại.');
    }
  };

  // ================= DERIVED STATE =================

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case 'UNREAD':
        return notifications.filter(n => !n.is_read);
      case 'WARNING':
        return notifications.filter(n => n.type === 'WARNING');
      case 'REMINDER':
        return notifications.filter(n => n.type === 'REMINDER');
      case 'SYSTEM':
        return notifications.filter(n => n.type === 'SYSTEM');
      default:
        return notifications;
    }
  }, [notifications, filter]);

  const unreadCount = useMemo(() => {
    return notifications.reduce((count, n) => count + (!n.is_read ? 1 : 0), 0);
  }, [notifications]);

  // ================= RETURN =================
  return {
    notifications: filteredNotifications,
    rawNotifications: notifications, // nếu cần dùng full list
    filter,
    setFilter,
    isLoading,
    error,
    unreadCount,

    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications
  };
};