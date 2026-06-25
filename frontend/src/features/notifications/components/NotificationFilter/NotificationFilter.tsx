import React from 'react';
import type { NotificationFilterType } from '../../types/notification';
import styles from './NotificationFilter.module.css';
import { BellRing, Bell, AlertTriangle, Info } from 'lucide-react';
import clsx from 'clsx';

interface NotificationFilterProps {
  currentFilter: NotificationFilterType;
  onFilterChange: (filter: NotificationFilterType) => void;
  unreadCount: number;
}

const NotificationFilter: React.FC<NotificationFilterProps> = ({
  currentFilter,
  onFilterChange,
  unreadCount
}) => {
  const tabs = [
    { id: 'ALL', label: 'Tất cả', icon: <BellRing size={16} /> },
    { id: 'UNREAD', label: 'Chưa đọc', icon: <Bell size={16} />, badge: unreadCount },
    { id: 'WARNING', label: 'Cảnh báo', icon: <AlertTriangle size={16} /> },
    { id: 'REMINDER', label: 'Nhắc nhở', icon: <Bell size={16} /> },
    { id: 'SYSTEM', label: 'Hệ thống', icon: <Info size={16} /> },
  ];

  return (
    <div className={styles.filterContainer}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={clsx(
            styles.filterTab,
            currentFilter === tab.id && styles.activeTab
          )}
          onClick={() => onFilterChange(tab.id as NotificationFilterType)}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className={styles.badge}>{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default NotificationFilter;
