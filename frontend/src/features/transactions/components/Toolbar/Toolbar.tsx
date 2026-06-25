import React from "react";
import { Search } from "lucide-react";
import type { FilterType } from "../../types/transaction";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  searchQuery: string;
  filterType: FilterType;
  onSearchChange: (query: string) => void;
  onFilterChange: (type: FilterType) => void;
}

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Thu nhập", value: "INCOME" },
  { label: "Chi tiêu", value: "EXPENSE" },
];

const Toolbar: React.FC<ToolbarProps> = ({
  searchQuery,
  filterType,
  onSearchChange,
  onFilterChange,
}) => {
  return (
    <div className={styles.toolbar}>
      {/* Search input */}
      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} />
        <input
          id="transaction-search"
          type="text"
          className={styles.searchInput}
          placeholder="Tìm kiếm giao dịch..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter buttons */}
      <div className={styles.filterGroup}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            id={`filter-${opt.value.toLowerCase()}`}
            className={`${styles.filterBtn} ${
              filterType === opt.value ? styles.active : ""
            }`}
            onClick={() => onFilterChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
