import React from "react";
import { Wallet, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { formatMoney } from "../../../../utils/formatMoney";
import type { BudgetSummary } from "../../types/budget";
import styles from "./BudgetSummaryCards.module.css";

interface BudgetSummaryCardsProps {
  summary: BudgetSummary;
}

const BudgetSummaryCards: React.FC<BudgetSummaryCardsProps> = ({ summary }) => {
  const hasWarnings = summary.overBudgetCount > 0 || summary.nearLimitCount > 0;

  return (
    <section className={styles.grid} aria-label="Tổng quan ngân sách">
      <article className={`${styles.card} ${styles.primary}`}>
        <div className={styles.label}>
          <Wallet size={16} />
          <span>Tổng ngân sách</span>
        </div>
        <strong>{formatMoney(summary.totalBudget)}</strong>
        <small>{summary.activeBudgetCount} ngân sách</small>
      </article>

      <article className={styles.card}>
        <div className={styles.label}>
          <TrendingUp size={16} />
          <span>Đã chi</span>
        </div>
        <strong className={styles.coral}>{formatMoney(summary.totalSpent)}</strong>
        <small>
          {summary.totalBudget > 0
            ? `${((summary.totalSpent / summary.totalBudget) * 100).toFixed(1)}%`
            : "0%"}
        </small>
      </article>

      <article className={styles.card}>
        <div className={styles.label}>
          <DollarSign size={16} />
          <span>Còn lại</span>
        </div>
        <strong
          className={summary.totalRemaining < 0 ? styles.coral : styles.teal}
        >
          {formatMoney(Math.abs(summary.totalRemaining))}
        </strong>
        <small>{summary.totalRemaining < 0 ? "Vượt ngân sách" : "Trong hạn mức"}</small>
      </article>

      {hasWarnings && (
        <article className={`${styles.card} ${styles.warning}`}>
          <div className={styles.label}>
            <AlertTriangle size={16} />
            <span>Cảnh báo</span>
          </div>
          <strong className={summary.overBudgetCount > 0 ? styles.coral : styles.yellow}>
            {summary.overBudgetCount + summary.nearLimitCount} danh mục
          </strong>
          <small>
            {summary.overBudgetCount > 0
              ? `${summary.overBudgetCount} vượt hạn mức`
              : ""}{summary.nearLimitCount > 0 ? `${summary.nearLimitCount} gần hạn` : ""}
          </small>
        </article>
      )}
    </section>
  );
};

export default BudgetSummaryCards;
