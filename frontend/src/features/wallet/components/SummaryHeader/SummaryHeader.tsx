import React from "react";
import { LayoutGrid, Activity } from "lucide-react";
import styles from "./SummaryHeader.module.css";

interface SummaryHeaderProps {
  totalBalance: number;
  walletCount: number;
  activeCount: number;
}

const SummaryHeader: React.FC<SummaryHeaderProps> = ({
  totalBalance,
  walletCount,
  activeCount,
}) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount) + " đ";

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <span className={styles.icon}>🗂️</span>
        <span className={styles.label}>Tổng số dư tất cả ví</span>
      </div>
      <p className={styles.totalAmount}>{formatCurrency(totalBalance)}</p>
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>
            <LayoutGrid size={13} />
            Số ví
          </div>
          <div className={styles.statValue}>{walletCount}</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>
            <Activity size={13} />
            Ví hoạt động
          </div>
          <div className={styles.statValue}>{activeCount}</div>
        </div>
      </div>
    </div>
  );
};

export default SummaryHeader;
