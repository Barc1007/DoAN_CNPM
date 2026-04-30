import React from "react";
import styles from "./CategoryHeader.module.css";

interface CategoryHeaderProps {
  activeTab: "expense" | "income";
  onTabChange: (tab: "expense" | "income") => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.topSection}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>Quản lý Danh mục 🏷️</h1>
          <p className={styles.subtitle}>Tùy chỉnh các danh mục thu chi của bạn</p>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === "expense" ? styles.activeExpense : ""}`}
          onClick={() => onTabChange("expense")}
        >
          <span className={styles.tabIcon}>📉</span> Chi tiêu
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "income" ? styles.activeIncome : ""}`}
          onClick={() => onTabChange("income")}
        >
          <span className={styles.tabIcon}>📈</span> Thu nhập
        </button>
      </div>
    </div>
  );
};

export default CategoryHeader;
