import React from "react";
import { Utensils, GraduationCap, Coffee, type LucideIcon } from "lucide-react";
import styles from "./TransactionList.module.css";
import { formatMoney } from "../../../../utils/formatMoney";
import { formatShortDate } from "../../../../utils/formatDate";
import type { Transaction } from "../../../../types/dashboard";
import clsx from "clsx";

interface IconConfig {
  icon: LucideIcon;
  color: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

const CATEGORY_ICONS: Record<number, IconConfig> = {
  5: { icon: Utensils, color: "#4ECDC4" },
  6: { icon: Coffee, color: "#FF6B6B" },
  10: { icon: GraduationCap, color: "#4ECDC4" },
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Giao dịch gần đây</h3>
        <a href="#" className={styles.viewAll}>Xem tất cả</a>
      </div>

      <div className={styles.list}>
        {transactions.map((t) => {
          const config = CATEGORY_ICONS[t.category_id] || { icon: Utensils, color: "#6B7280" };
          const Icon = config.icon;
          
          return (
            <div key={t.transaction_id} className={styles.item}>
              <div className={styles.itemLeft}>
                <div 
                  className={styles.iconBox}
                  style={{ backgroundColor: `${config.color}15`, color: config.color }}
                >
                  <Icon size={18} />
                </div>
                <div className={styles.itemInfo}>
                  <h4>{t.note || "Giao dịch"}</h4>
                  <p>{formatShortDate(t.transaction_date)}</p>
                </div>
              </div>
              <div className={clsx(
                styles.amount, 
                t.type === "income" ? styles.income : styles.expense
              )}>
                {t.type === "income" ? "+" : "-"}
                {formatMoney(t.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionList;
