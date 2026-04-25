import React from "react";
import { Lock, ChevronRight } from "lucide-react";
import styles from "./SecuritySection.module.css";

const SecuritySection: React.FC = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Lock size={20} className={styles.headerIcon} />
        <h3 className={styles.title}>Bảo mật</h3>
      </div>
      
      <div className={styles.actionList}>
        <div className={styles.actionItem}>
          <div className={styles.actionLeft}>
            <div className={styles.iconCircle}>
              <Lock size={18} className={styles.actionIcon} />
            </div>
            <div className={styles.actionText}>
              <h4 className={styles.actionTitle}>Đổi mật khẩu</h4>
              <p className={styles.actionDesc}>Cập nhật mật khẩu của bạn</p>
            </div>
          </div>
          <ChevronRight size={20} className={styles.arrowIcon} />
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;
