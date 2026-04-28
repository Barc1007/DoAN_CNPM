import React from "react";
import type { TransactionStats } from "../../types/transaction";
import styles from "./StatsCards.module.css";
import { TrendingUp, TrendingDown, CalendarDays } from "lucide-react";

interface StatsCardsProps {
  stats: TransactionStats;
}

const formatCurrency = (amount: number): string =>
  amount.toLocaleString("vi-VN") + " đ";

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className={styles.grid}>
      {/* Card 1 — Tổng thu nhập */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <TrendingUp size={14} className={styles.labelIconIncome} />
          Tổng thu nhập
        </div>
        <div className={`${styles.cardAmount} ${styles.income}`}>
          +{formatCurrency(stats.totalIncome)}
        </div>
      </div>

      {/* Card 2 — Tổng chi tiêu */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <TrendingDown size={14} className={styles.labelIconExpense} />
          Tổng chi tiêu
        </div>
        <div className={`${styles.cardAmount} ${styles.expense}`}>
          -{formatCurrency(stats.totalExpense)}
        </div>
      </div>

      {/* Card 3 — Giao dịch tháng này (gradient) */}
      <div className={`${styles.card} ${styles.cardGradient}`}>
        <div className={styles.cardLabel}>
          <CalendarDays size={14} className={styles.labelIconGradient} />
          Giao dịch tháng này
        </div>
        <div className={`${styles.cardAmount} ${styles.gradientAmount}`}>
          {stats.currentMonthCount} giao dịch
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
