import React, { useState } from 'react';
import MainLayout from '../../../layouts/MainLayout';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Bell, 
  BellRing, 
  Cloud, 
  User, 
  Monitor, 
  Languages, 
  Download, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import styles from './SettingsPage.module.css';
import SettingSection from '../components/SettingSection';
import type { SettingSectionType } from '../types/settings';
import { useAuth } from '../../auth/context/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  
  // State for toggles (mock)
  const [quickSettings, setQuickSettings] = useState({
    darkMode: false,
    txNotifications: true,
    budgetReminders: true,
    autoBackup: false
  });

  const handleToggle = (id: string, value: boolean) => {
    setQuickSettings(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const displayName = user?.full_name || user?.username || "Sinh Viên A";
  const displayEmail = user?.email || "sinhvien@edu.vn";
  const initials = displayName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || "SV";

  const sections: SettingSectionType[] = [
    {
      id: 'account',
      title: 'Tài khoản',
      icon: User,
      items: [
        { id: 'profile-info', icon: User, label: 'Thông tin cá nhân', description: 'Cập nhật tên, email và ảnh đại diện', type: 'link' },
        { id: 'security', icon: ShieldCheck, label: 'Mật khẩu & Bảo mật', description: 'Thay đổi mật khẩu và cài đặt bảo mật', type: 'link' },
      ]
    },
    {
      id: 'interface',
      title: 'Giao diện',
      icon: Monitor,
      items: [
        { id: 'display-mode', icon: Moon, label: 'Chế độ hiển thị', description: 'Sáng, tối hoặc tự động', type: 'link' },
        { id: 'language', icon: Languages, label: 'Ngôn ngữ', value: 'Tiếng Việt', type: 'select' },
      ]
    },
    {
      id: 'notifications',
      title: 'Thông báo',
      icon: Bell,
      items: [
        { id: 'tx-notif-detail', icon: Bell, label: 'Thông báo giao dịch', description: 'Nhận thông báo khi có giao dịch mới', type: 'link' },
        { id: 'budget-notif-detail', icon: BellRing, label: 'Nhắc nhở ngân sách', description: 'Cảnh báo khi sắp vượt ngân sách', type: 'link' },
      ]
    },
    {
      id: 'data',
      title: 'Dữ liệu',
      icon: Download,
      items: [
        { id: 'export-data', icon: Download, label: 'Xuất dữ liệu', description: 'Tải về lịch sử giao dịch dưới dạng CSV', type: 'link' },
        { id: 'backup-data', icon: Cloud, label: 'Sao lưu dữ liệu', description: 'Tự động sao lưu dữ liệu lên cloud', type: 'link' },
      ]
    },
    {
      id: 'support',
      title: 'Hỗ trợ',
      icon: HelpCircle,
      items: [
        { id: 'help-center', icon: HelpCircle, label: 'Trợ giúp & Hỗ trợ', description: 'Hướng dẫn sử dụng và liên hệ', type: 'link' },
      ]
    }
  ];

  const quickSettingsSection: SettingSectionType = {
    id: 'quick-settings',
    title: 'Cài đặt nhanh',
    items: [
      { id: 'darkMode', icon: Moon, label: 'Chế độ tối', description: 'Giảm độ sáng màn hình', type: 'toggle', value: quickSettings.darkMode },
      { id: 'txNotifications', icon: Bell, label: 'Thông báo giao dịch', description: 'Nhận thông báo khi có giao dịch', type: 'toggle', value: quickSettings.txNotifications },
      { id: 'budgetReminders', icon: BellRing, label: 'Nhắc nhở ngân sách', description: 'Cảnh báo khi vượt ngân sách', type: 'toggle', value: quickSettings.budgetReminders },
      { id: 'autoBackup', icon: Cloud, label: 'Tự động sao lưu', description: 'Sao lưu dữ liệu hàng ngày', type: 'toggle', value: quickSettings.autoBackup },
    ]
  };

  return (
    <MainLayout>
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>Cài đặt <SettingsIcon className={styles.titleIcon} size={28} /></h1>
            <p className={styles.subtitle}>Quản lý tài khoản và tùy chỉnh ứng dụng</p>
          </div>
        </header>

        <div className={styles.userCard}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{displayName}</h2>
            <p className={styles.userEmail}>{displayEmail}</p>
            <p className={styles.userJoinDate}>Thành viên từ tháng 1, 2026</p>
          </div>
          <button className={styles.editBtn}>Chỉnh sửa</button>
        </div>

        <div className={styles.content}>
          <div className={styles.quickSettingsContainer}>
             <SettingSection section={quickSettingsSection} onToggle={handleToggle} />
          </div>

          <div className={styles.sectionsGrid}>
            {sections.map(section => (
              <SettingSection key={section.id} section={section} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
