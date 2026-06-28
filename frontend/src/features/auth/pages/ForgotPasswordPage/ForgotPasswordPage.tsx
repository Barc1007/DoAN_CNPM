import React from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from "../../components/LoginForm/LoginForm.module.css";
import { useForgotPassword } from "../../hooks/useForgotPassword";

const ForgotPasswordPage: React.FC = () => {
  const {
    email, setEmail,
    loading, error, success,
    handleSubmit, handleContinue,
  } = useForgotPassword();

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
        <h2>Quên mật khẩu?</h2>
        <p>Nhập email đã đăng ký để nhận mã xác minh</p>
      </div>

      {success ? (
        <div>
          <div style={{
            background: '#E6FFFA',
            color: '#319795',
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            lineHeight: 1.6,
          }}>
            Đã gửi mã xác minh 6 số đến <strong>{email}</strong>.
            Kiểm tra hộp thư (hoặc thư rác) và nhấn tiếp tục.
          </div>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleContinue}
          >
            Tiếp tục
          </button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={20} />
              <input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                autoComplete="email"
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi mã xác minh"}
          </button>
        </form>
      )}

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

export default ForgotPasswordPage;
