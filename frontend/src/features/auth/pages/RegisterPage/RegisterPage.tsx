import React from 'react';
import RegisterForm from '../../components/RegisterForm/RegisterForm';
import AuthBanner from '../../components/AuthBanner/AuthBanner';
import styles from "../LoginPage/LoginPage.module.css";

const RegisterPage: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      <RegisterForm />
      <AuthBanner />
    </div>
  );
};

export default RegisterPage;
