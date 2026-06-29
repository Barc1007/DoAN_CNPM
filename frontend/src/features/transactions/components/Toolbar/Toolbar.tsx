import React from "react";
import { CalendarDays, RotateCcw, Search } from "lucide-react";
import type { DateFilterMode, FilterType } from "../../types/transaction";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  searchQuery: string;
  filterType: FilterType;
  dateFilterMode: DateFilterMode;
  selectedMonth: string;
  rangeStart: string;
  rangeEnd: string;
  onSearchChange: (query: string) => void;
  onFilterChange: (type: FilterType) => void;
  onDateFilterModeChange: (mode: DateFilterMode) => void;
  onSelectedMonthChange: (month: string) => void;
  onRangeStartChange: (date: string) => void;
  onRangeEndChange: (date: string) => void;
  onResetToCurrentMonth: () => void;
}

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Thu nhập", value: "INCOME" },
  { label: "Chi tiêu", value: "EXPENSE" },
];

const DATE_FILTER_OPTIONS: { label: string; value: DateFilterMode }[] = [
  { label: "Theo tháng", value: "MONTH" },
  { label: "Khoảng ngày", value: "RANGE" },
  { label: "Toàn bộ", value: "ALL_TIME" },
];

const Toolbar: React.FC<ToolbarProps> = ({
  searchQuery,
  filterType,
  dateFilterMode,
  selectedMonth,
  rangeStart,
  rangeEnd,
  onSearchChange,
  onFilterChange,
  onDateFilterModeChange,
  onSelectedMonthChange,
  onRangeStartChange,
  onRangeEndChange,
  onResetToCurrentMonth,
}) => {
  return (
    <div className={styles.toolbar}>
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

      <div className={styles.datePanel}>
        <div className={styles.dateModeGroup}>
          {DATE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.dateModeBtn} ${
                dateFilterMode === opt.value ? styles.dateModeActive : ""
              }`}
              onClick={() => onDateFilterModeChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {dateFilterMode === "MONTH" && (
          <label className={styles.dateInputWrapper}>
            <CalendarDays size={16} />
            <span>Tháng</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => onSelectedMonthChange(e.target.value)}
            />
          </label>
        )}

        {dateFilterMode === "RANGE" && (
          <div className={styles.rangeInputs}>
            <label className={styles.dateInputWrapper}>
              <span>Từ</span>
              <input
                type="date"
                value={rangeStart}
                max={rangeEnd || undefined}
                onChange={(e) => onRangeStartChange(e.target.value)}
              />
            </label>
            <label className={styles.dateInputWrapper}>
              <span>Đến</span>
              <input
                type="date"
                value={rangeEnd}
                min={rangeStart || undefined}
                onChange={(e) => onRangeEndChange(e.target.value)}
              />
            </label>
          </div>
        )}

        <button
          type="button"
          className={styles.resetDateBtn}
          onClick={onResetToCurrentMonth}
          title="Về tháng hiện tại"
          aria-label="Về tháng hiện tại"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
