import React from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from "./LoginForm.module.css";
import { useLoginForm } from '../../hooks/useLoginForm';

const LoginForm: React.FC = () => {
  const {
    username, setUsername,
    password, setPassword,
    showPassword, togglePasswordVisibility,
    rememberMe, setRememberMe,
    loading, error, handleSubmit
  } = useLoginForm();

  return (
    <div className={styles.container}>
      <div className={styles.logoRow}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 24 24" fill="none" className={styles.logoSvg}>
             <rect x="3" y="6" width="18" height="12" rx="2" fill="#2f8f89" />
             <path d="M7 12H17M7 15H11" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h1 className={styles.brandTitle}>StudentMoney</h1>
          <p className={styles.brandSubtitle}>Quản lý chi tiêu sinh viên</p>
        </div>
      </div>

      <div className={styles.header}>
        <h2>Chào mừng trở lại! 👋</h2>
        <p>Đăng nhập để tiếp tục quản lý tài chính của bạn</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.inputGroup}>
          <label htmlFor="username">Tên đăng nhập</label>
          <div className={styles.inputWrapper}>
            <User className={styles.inputIcon} size={20} />
            <input 
              id="username"
              type="text" 
              placeholder="Nhập tên đăng nhập" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Mật khẩu</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={20} />
            <input 
              id="password"
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
            <button 
              type="button" 
              className={styles.eyeButton} 
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className={styles.actionsRow}>
          <label className={styles.rememberRow}>
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <a href="#" className={styles.forgotLink}>Quên mật khẩu?</a>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Đang xử lý..." : "→ Đăng nhập"}
        </button>
      </form>

      <div className={styles.registerPrompt}>
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </div>

      <div className={styles.demoNote}>
        <strong>Demo:</strong> Nhấn đăng nhập với tài khoản <strong>admin / 123456</strong> để trải nghiệm
      </div>
    </div>
  );
};

export default LoginForm;
