import React from 'react';
import type { Notification } from '../../types/notification';
import NotificationItem from '../NotificationItem/NotificationItem';
import styles from './NotificationList.module.css';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  onMarkAsRead,
  onDelete
}) => {
  if (isLoading) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.loadingSpinner}></div>
        <p>Đang tải thông báo...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Không có thông báo nào.</p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.notification_id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NotificationList;
