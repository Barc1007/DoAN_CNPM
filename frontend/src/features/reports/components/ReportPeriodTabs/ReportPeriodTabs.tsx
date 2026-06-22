import React from "react";
import styles from "./ReportPeriodTabs.module.css";
import type { ReportPeriod } from "../../types/report";

interface ReportPeriodTabsProps {
  activePeriod: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
}

const PERIOD_OPTIONS: { label: string; value: ReportPeriod }[] = [
  { label: "Tuần này", value: "week" },
  { label: "Tháng này", value: "month" },
  { label: "Quý này", value: "quarter" },
  { label: "Năm nay", value: "year" },
];

const ReportPeriodTabs: React.FC<ReportPeriodTabsProps> = ({
  activePeriod,
  onPeriodChange,
}) => {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Kỳ báo cáo">
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.value}
          className={`${styles.tabButton} ${activePeriod === option.value ? styles.active : ""}`}
          type="button"
          role="tab"
          aria-selected={activePeriod === option.value}
          onClick={() => onPeriodChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ReportPeriodTabs;
