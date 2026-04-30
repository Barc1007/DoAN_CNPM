import React from "react";
import styles from "./CategorySummary.module.css";
import type { CategoryData } from "../../../../types/category";

interface CategorySummaryProps {
  summary: CategoryData['summary'];
  type: "expense" | "income";
}

const CategorySummary: React.FC<CategorySummaryProps> = ({ summary, type }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  };

  const isExpense = type === "expense";

  return (
    <div className={styles.container}>
      <div className={`${styles.mainCard} ${isExpense ? styles.expenseCard : styles.incomeCard}`}>
        <div className={styles.cardHeader}>
          <span className={styles.icon}>{isExpense ? "💸" : "💰"}</span>
          <span className={styles.label}>Tổng {isExpense ? "chi tiêu" : "thu nhập"}</span>
        </div>
        <div className={styles.amount}>{formatCurrency(summary.total_amount)}</div>
        <div className={styles.transactionCount}>{summary.total_transactions} giao dịch</div>
      </div>

      <div className={styles.statsCard}>
        <h3 className={styles.statsTitle}>Thống kê nhanh</h3>
        <div className={styles.statsList}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Tổng danh mục</span>
            <span className={styles.statValue}>{summary.total_categories}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Trung bình / danh mục</span>
            <span className={styles.statValue}>{formatCurrency(summary.average_per_category)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Danh mục nhiều nhất</span>
            <span className={styles.statValue}>{summary.top_category_name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySummary;
