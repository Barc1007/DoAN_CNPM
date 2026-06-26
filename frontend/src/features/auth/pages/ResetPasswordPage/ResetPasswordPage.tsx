import React from 'react';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from "../../components/LoginForm/LoginForm.module.css";
import { useResetPassword } from "../../hooks/useResetPassword";

const ResetPasswordPage: React.FC = () => {
  const {
    email,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    loading, error,
    handleSubmit,
  } = useResetPassword();

  return (
    <div className={styles.container}>
      <div className={styles.logoRow}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 24 24" fill="none" className={styles.logoSvg}>
            <rect x="3" y="6" width="18" height="12" rx="2" fill="#4ECDC4" />
            <path d="M7 12H17M7 15H11" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h1 className={styles.brandTitle}>StudentMoney</h1>
          <p className={styles.brandSubtitle}>Quản lý chi tiêu sinh viên</p>
        </div>
      </div>

      <div className={styles.header}>
        <h2>Đặt lại mật khẩu</h2>
        <p>Tạo mật khẩu mới cho tài khoản <strong>{email}</strong></p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.inputGroup}>
          <label htmlFor="new-password">Mật khẩu mới</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="Ít nhất 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#718096',
            textDecoration: 'none',
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={16} />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
