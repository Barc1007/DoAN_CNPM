import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../layouts/MainLayout';
import { 
  Settings as SettingsIcon, 
  Moon, Bell, BellRing, Cloud, User, Monitor, HelpCircle,
  ArrowRight, Eye, EyeOff, Lock, Check, X
} from 'lucide-react';
import styles from './SettingsPage.module.css';
import { useAuth } from '../../auth/context/AuthContext';
import apiClient from '../../../services/apiClient';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try { return localStorage.getItem('darkMode') === 'true'; } catch { return false; }
  });
  const [txNotifications, setTxNotifications] = useState<boolean>(() => {
    try { return localStorage.getItem('txNotifications') !== 'false'; } catch { return true; }
  });
  const [budgetReminders, setBudgetReminders] = useState<boolean>(() => {
    try { return localStorage.getItem('budgetReminders') !== 'false'; } catch { return true; }
  });
  const [autoBackup, setAutoBackup] = useState<boolean>(() => {
    try { return localStorage.getItem('autoBackup') === 'true'; } catch { return false; }
  });

  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ok: boolean; text: string} | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const displayName = user?.full_name || user?.username || "Sinh Viên A";
  const displayEmail = user?.email || "sinhvien@edu.vn";
  const initials = displayName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || "SV";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);

    if (newPassword.length < 6) {
      setPwMsg({ ok: false, text: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ ok: false, text: "Xác nhận mật khẩu không khớp" });
      return;
    }

    setPwLoading(true);
    try {
      await apiClient.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwMsg({ ok: true, text: "Đổi mật khẩu thành công!" });
      setTimeout(() => {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPwMsg(null);
      }, 1500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message || "Đổi mật khẩu thất bại";
      setPwMsg({ ok: false, text: msg });
    } finally {
      setPwLoading(false);
    }
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

        <div className={styles.userCard} onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{displayName}</h2>
            <p className={styles.userEmail}>{displayEmail}</p>
          </div>
          <ArrowRight size={20} />
        </div>

        {/* Quick Settings */}
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Cài đặt nhanh</h3>
          {[
            { id: 'dark', label: 'Chế độ tối', icon: Moon, val: darkMode, set: setDarkMode },
            { id: 'tx', label: 'Thông báo giao dịch', icon: Bell, val: txNotifications, set: setTxNotifications },
            { id: 'budget', label: 'Nhắc nhở ngân sách', icon: BellRing, val: budgetReminders, set: setBudgetReminders },
            { id: 'backup', label: 'Tự động sao lưu', icon: Cloud, val: autoBackup, set: setAutoBackup },
          ].map(item => (
            <div key={item.id} className={styles.toggleRow}>
              <div className={styles.toggleLeft}>
                <item.icon size={18} className={styles.toggleIcon} />
                <span>{item.label}</span>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={item.val} 
                  onChange={e => {
                    const checked = e.target.checked;
                    item.set(checked);
                    try { localStorage.setItem(item.id === 'dark' ? 'darkMode' : item.id, String(checked)); } catch { /* ignore */ }
                  }} 
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          ))}
        </div>

        {/* Account Section */}
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Tài khoản</h3>
          <div className={styles.linkRow} onClick={() => navigate('/profile')}>
            <div className={styles.linkLeft}><User size={18} /><span>Thông tin cá nhân</span></div>
            <ArrowRight size={18} />
          </div>
          <div className={styles.linkRow} onClick={() => setShowPasswordModal(true)}>
            <div className={styles.linkLeft}><Lock size={18} /><span>Mật khẩu & Bảo mật</span></div>
            <ArrowRight size={18} />
          </div>
        </div>

        {/* App Section */}
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Ứng dụng</h3>
          <div className={styles.linkRow}>
            <div className={styles.linkLeft}><Monitor size={18} /><span>Ngôn ngữ</span></div>
            <span className={styles.linkValue}>Tiếng Việt</span>
          </div>
          <div className={styles.linkRow}>
            <div className={styles.linkLeft}><HelpCircle size={18} /><span>Hỗ trợ</span></div>
            <ArrowRight size={18} />
          </div>
        </div>

        {/* Logout */}
        <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>
          Đăng xuất
        </button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowPasswordModal(false); setPwMsg(null); }}>
          <div className={styles.passwordModal} onClick={e => e.stopPropagation()}>
            <div className={styles.pwHeader}>
              <h3>Đổi mật khẩu</h3>
              <button className={styles.pwClose} onClick={() => { setShowPasswordModal(false); setPwMsg(null); }}>
                <X size={20} />
              </button>
            </div>

            {pwMsg && (
              <div className={`${styles.pwMsg} ${pwMsg.ok ? styles.pwSuccess : styles.pwError}`}>
                {pwMsg.ok ? <Check size={16} /> : <X size={16} />}
                {pwMsg.text}
              </div>
            )}

            <form className={styles.pwForm} onSubmit={handleChangePassword}>
              <div className={styles.pwField}>
                <label>Mật khẩu hiện tại</label>
                <div className={styles.pwInput}>
                  <input type={showPw ? "text" : "password"} value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)} placeholder="Nhập mật khẩu hiện tại" required />
                </div>
              </div>
              <div className={styles.pwField}>
                <label>Mật khẩu mới</label>
                <div className={styles.pwInput}>
                  <input type={showPw ? "text" : "password"} value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} placeholder="Nhập mật khẩu mới" required />
                </div>
              </div>
              <div className={styles.pwField}>
                <label>Xác nhận mật khẩu mới</label>
                <div className={styles.pwInput}>
                  <input type={showPw ? "text" : "password"} value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" required />
                </div>
              </div>
              <button type="button" className={styles.pwToggle} onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPw ? "Ẩn" : "Hiện"} mật khẩu
              </button>
              <button type="submit" className={styles.pwSubmit} disabled={pwLoading}>
                {pwLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default SettingsPage;