import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from "../../components/LoginForm/LoginForm.module.css";
import { useVerifyOtp } from "../../hooks/useVerifyOtp";

const VerifyOtpPage: React.FC = () => {
  const {
    email,
    otp,
    loading,
    error,
    countdown,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleResend,
  } = useVerifyOtp();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

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
        <h2>Nhập mã xác minh</h2>
        <p>Chúng tôi đã gửi mã 6 số đến <strong>{email}</strong></p>
      </div>

      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        {error && <div className={styles.error}>{error}</div>}

        {/* OTP inputs */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
          marginBottom: '0.5rem',
        }}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              style={{
                width: '48px',
                height: '56px',
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: '700',
                border: `2px solid ${digit ? '#4ECDC4' : '#E2E8F0'}`,
                borderRadius: '0.75rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                background: '#fff',
                caretColor: '#4ECDC4',
              }}
            />
          ))}
        </div>

        {loading && (
          <p style={{ textAlign: 'center', color: '#718096', fontSize: '0.9rem', margin: 0 }}>
            Đang xác minh...
          </p>
        )}

        {/* Resend */}
        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#718096' }}>
          Không nhận được mã?{" "}
          {countdown > 0 ? (
            <span style={{ color: '#A0AEC0' }}>
              Gửi lại sau {countdown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              style={{
                background: 'none',
                border: 'none',
                color: '#4ECDC4',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: 0,
              }}
            >
              Gửi lại mã
            </button>
          )}
        </div>
      </form>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link
          to="/forgot-password"
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
          Nhập email khác
        </Link>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
