import React from 'react';
import LoginForm from '../../components/LoginForm/LoginForm';
import AuthBanner from '../../components/AuthBanner/AuthBanner';
import styles from "./LoginPage.module.css";

const LoginPage: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      <LoginForm />
      <AuthBanner />
    </div>
  );
};

export default LoginPage;
