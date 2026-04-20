import React from "react";
import { Utensils, GraduationCap, Coffee, Bus } from "lucide-react";
import styles from "./TransactionList.module.css";
import { formatMoney } from "../../../../utils/formatMoney";
import { formatShortDate } from "../../../../utils/formatDate";
import type { Transaction } from "../../../../types/dashboard";
import clsx from "clsx";

interface TransactionListProps {
  transactions: Transaction[];
}

const CATEGORY_ICONS: Record<string, any> = {
  "Ăn uống": { icon: Utensils, color: "#FF6B6B" },
  "Học bổng": { icon: GraduationCap, color: "#4ECDC4" },
  "Thu nhập": { icon: GraduationCap, color: "#4ECDC4" },
  "Giải trí": { icon: Coffee, color: "#A29BFE" },
  "Di chuyển": { icon: Bus, color: "#FFE66D" },
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
          const config = CATEGORY_ICONS[t.category] || { icon: Utensils, color: "#6B7280" };
          const Icon = config.icon;
          
          return (
            <div key={t.id} className={styles.item}>
              <div className={styles.itemLeft}>
                <div 
                  className={styles.iconBox}
                  style={{ backgroundColor: `${config.color}15`, color: config.color }}
                >
                  <Icon size={18} />
                </div>
                <div className={styles.itemInfo}>
                  <h4>{t.title}</h4>
                  <p>{formatShortDate(t.date)}</p>
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
