import React from 'react';
import type { Notification } from '../../types/notification';
import styles from './NotificationItem.module.css';
import { CheckCircle2, Trash2, AlertTriangle, Bell, Info } from 'lucide-react';
import clsx from 'clsx';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const getIconConfig = () => {
    switch (notification.type) {
      case 'budget_alert':
        return { icon: <AlertTriangle size={24} />, className: styles.iconWarning, label: 'Cảnh Báo Ngân Sách' };
      case 'daily_reminder':
        return { icon: <Bell size={24} />, className: styles.iconReminder, label: 'Nhắc Nhở Hàng Ngày' };
      case 'system':
        return { icon: <Info size={24} />, className: styles.iconSystem, label: 'Hệ Thống' };
      default:
        return { icon: <Info size={24} />, className: styles.iconSystem, label: 'Hệ Thống' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${d}/${m}/${date.getFullYear()}`;
  };

  const iconConfig = getIconConfig();

  return (
    <div className={clsx(styles.itemContainer, !notification.is_read && styles.unreadItem)}>
      <div className={clsx(styles.iconContainer, iconConfig.className)}>
        {iconConfig.icon}
      </div>
      
      <div className={styles.contentContainer}>
        <h3 className={styles.title}>{notification.title}</h3>
        <p className={styles.message}>{notification.message}</p>
        <div className={styles.meta}>
          <span className={styles.date}>{formatDate(notification.created_at)}</span>
          <span className={styles.dot}>•</span>
          <span className={styles.typeLabel}>{iconConfig.label}</span>
        </div>
      </div>

      <div className={styles.actionsContainer}>
        {!notification.is_read && (
          <button 
            className={styles.actionButton} 
            onClick={() => onMarkAsRead(notification.notification_id)}
            title="Đánh dấu đã đọc"
          >
            <CheckCircle2 size={20} className={styles.checkIcon} />
          </button>
        )}
        <button 
          className={styles.actionButton} 
          onClick={() => onDelete(notification.notification_id)}
          title="Xóa"
        >
          <Trash2 size={20} className={styles.deleteIcon} />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
