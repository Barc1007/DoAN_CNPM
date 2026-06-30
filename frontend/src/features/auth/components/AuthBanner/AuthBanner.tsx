import React from "react";
import { Wallet } from "lucide-react";
import styles from "./AuthBanner.module.css";

const AuthBanner: React.FC = () => {
  return (
    <div className={styles.banner}>
      <div className={styles.iconWrapper}>
        <Wallet size={80} color="white" />
      </div>
      <h2 className={styles.title}>
        Quản lý tài chính<br />thông minh
      </h2>
      <p className={styles.subtitle}>
        StudentMoney giúp sinh viên theo dõi thu chi, lập ngân sách và đạt mục tiêu tài chính dễ dàng
      </p>
    </div>
  );
};

export default AuthBanner;
