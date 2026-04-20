import React from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import styles from "./SummaryCard.module.css";
import { formatMoney } from "../../../../utils/formatMoney";

interface SummaryCardProps {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  totalBalance, 
  totalIncome, 
  totalExpense 
}) => {
  return (
    <div className={styles.summary}>
      <div className={styles.label}>
        <Wallet size={16} />
        <span>Tổng số dư</span>
      </div>
      <h2 className={styles.balance}>{formatMoney(totalBalance)}</h2>

      <div className={styles.subCards}>
        <div className={styles.subCard}>
          <div className={styles.iconWrapper}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p className={styles.subLabel}>Thu nhập</p>
            <p className={styles.subAmount}>{formatMoney(totalIncome)}</p>
          </div>
        </div>
        
        <div className={styles.subCard}>
          <div className={styles.iconWrapper}>
            <TrendingDown size={20} />
          </div>
          <div>
            <p className={styles.subLabel}>Chi tiêu</p>
            <p className={styles.subAmount}>{formatMoney(totalExpense)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
