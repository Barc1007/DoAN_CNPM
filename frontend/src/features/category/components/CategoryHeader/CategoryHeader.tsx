import React from "react";
import { LayoutGrid, Plus } from "lucide-react";
import styles from "./CategoryHeader.module.css";
import type { CategoryType } from "../../../../types/category";

interface CategoryHeaderProps {
  activeTab: CategoryType;
  onTabChange: (tab: CategoryType) => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.topSection}>
        <div className={styles.titleWrapper}>
          <div className={styles.titleRow}>
            <LayoutGrid size={26} className={styles.titleIcon} />
            <h1 className={styles.title}>Danh mục & ngân sách</h1>
          </div>
          <p className={styles.subtitle}>Theo dõi mức chi từng danh mục trong tháng</p>
        </div>
        <button className={styles.addButton} type="button" title="Thêm danh mục">
          <Plus size={18} />
          <span>Thêm danh mục</span>
        </button>
      </div>

      <div className={styles.tabsContainer}>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "expense" ? styles.activeExpense : ""}`}
          onClick={() => onTabChange("expense")}
        >
          Chi tiêu theo danh mục
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "income" ? styles.activeIncome : ""}`}
          onClick={() => onTabChange("income")}
        >
          Nguồn thu
        </button>
      </div>
    </header>
  );
};

export default CategoryHeader;
