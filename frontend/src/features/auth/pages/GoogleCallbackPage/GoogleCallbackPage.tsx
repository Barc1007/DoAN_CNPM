import React from 'react';
import { useGoogleCallback } from '../../hooks/useGoogleCallback';
import styles from './GoogleCallbackPage.module.css';

const GoogleCallbackPage: React.FC = () => {
  const { status, errorMessage } = useGoogleCallback();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <svg viewBox="0 0 24 24" fill="none" className={styles.logoSvg}>
            <rect x="3" y="6" width="18" height="12" rx="2" fill="#4ECDC4" />
            <path d="M7 12H17M7 15H11" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className={styles.brandName}>StudentMoney</span>
        </div>

        {status === 'loading' && (
          <>
            <div className={styles.spinner} />
            <h2 className={styles.title}>Đang xử lý đăng nhập...</h2>
            <p className={styles.subtitle}>Vui lòng chờ trong giây lát</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.title}>Đăng nhập thành công!</h2>
            <p className={styles.subtitle}>Đang chuyển hướng đến dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className={styles.errorIcon}>✗</div>
            <h2 className={styles.titleError}>Đăng nhập thất bại</h2>
            <p className={styles.subtitle}>{errorMessage}</p>
            <p className={styles.redirect}>Đang chuyển hướng về trang đăng nhập...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
