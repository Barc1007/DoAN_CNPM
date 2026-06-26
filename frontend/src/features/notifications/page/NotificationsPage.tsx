import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationFilter from '../components/NotificationFilter/NotificationFilter';
import NotificationList from '../components/NotificationList/NotificationList';
import styles from './NotificationsPage.module.css';
import { CheckCircle2 } from 'lucide-react';
import MainLayout from '../../../layouts/MainLayout';

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    filter,
    setFilter,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  return (
    <MainLayout>
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Thông báo 🔔</h1>
            <p className={styles.subtitle}>
              Bạn có <span className={styles.highlight}>{unreadCount}</span> thông báo chưa đọc
            </p>
          </div>
          <button 
            className={styles.markAllButton} 
            onClick={() => markAllAsRead()}
            disabled={unreadCount === 0 || isLoading}
          >
            <CheckCircle2 size={18} />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        </div>

        <NotificationFilter 
          currentFilter={filter}
          onFilterChange={setFilter}
          unreadCount={unreadCount}
        />

        <NotificationList 
          notifications={notifications}
          isLoading={isLoading}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
