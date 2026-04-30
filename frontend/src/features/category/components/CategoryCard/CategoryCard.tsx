import React from "react";
import styles from "./CategoryCard.module.css";
import type { CategoryStat } from "../../../../types/category";

interface CategoryCardProps {
  category: CategoryStat;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  };

  // Ánh xạ icon đơn giản
  const getIcon = (iconName: string) => {
    const icons: Record<string, string> = {
      home: "🏠",
      book: "📚",
      food: "🍔",
      shopping: "🛍️",
      car: "🚗",
      entertainment: "🎬",
      bill: "🧾",
      other: "📦",
      salary: "💵",
      gift: "🎁",
      award: "🏆",
    };
    return icons[iconName] || "📌";
  };

  const isExpense = category.type === "expense";

  return (
    <div className={styles.card}>
      <div className={styles.iconContainer} style={{ backgroundColor: category.color }}>
        <span className={styles.icon}>{getIcon(category.icon || "other")}</span>
      </div>
      
      <div className={styles.infoSection}>
        <h3 className={styles.name}>{category.name}</h3>
        <p className={styles.transactionCount}>{category.transaction_count} giao dịch</p>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.amountSection}>
        <span className={styles.amountLabel}>Tổng số tiền</span>
        <div className={styles.amount}>{formatCurrency(category.total_amount)}</div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressBarBg}>
          <div 
            className={styles.progressBarFill} 
            style={{ width: `${category.percentage}%`, backgroundColor: category.color }}
          ></div>
        </div>
        <div className={styles.percentageText}>
          {category.percentage.toFixed(1)}% tổng {isExpense ? "chi" : "thu"}
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
