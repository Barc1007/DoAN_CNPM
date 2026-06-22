import React from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import styles from "./RegisterForm.module.css";
import { useRegisterForm } from '../../hooks/useRegisterForm';
import { Link } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  const {
    fullName, setFullName,
    username, setUsername,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, togglePasswordVisibility,
    loading, error, handleSubmit
  } = useRegisterForm();
  
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
        <h2>Tạo tài khoản mới 🎉</h2>
        <p>Bắt đầu hành trình quản lý tài chính thông minh</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.inputGroup}>
          <label htmlFor="fullName">Họ và tên</label>
          <div className={styles.inputWrapper}>
            <User className={styles.inputIcon} size={20} />
            <input 
              id="fullName"
              type="text" 
              placeholder="Nguyễn Văn A" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

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

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={20} />
            <input 
              id="confirmPassword"
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Đang xử lý..." : "→] Đăng ký"}
        </button>
      </form>

      <div className={styles.registerPrompt}>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </div>

      <div className={styles.demoNote}>
        <strong>Demo:</strong> Nhấn đăng ký với bất kỳ thông tin nào để trải nghiệm
      </div>
    </div>
  );
};

export default RegisterForm;
