import React from "react";
import { CircleDollarSign, Target, TrendingUp } from "lucide-react";
import { formatMoney } from "../../../../utils/formatMoney";
import type { GoalSummary } from "../../types/goal";
import styles from "./GoalSummaryCards.module.css";

interface GoalSummaryCardsProps {
  summary: GoalSummary;
}

const GoalSummaryCards: React.FC<GoalSummaryCardsProps> = ({ summary }) => {
  return (
    <section className={styles.grid} aria-label="Tổng quan mục tiêu">
      <article className={`${styles.card} ${styles.primary}`}>
        <div className={styles.label}>
          <Target size={16} />
          <span>Tổng mục tiêu</span>
        </div>
        <strong>{summary.totalGoals} mục tiêu</strong>
      </article>

      <article className={styles.card}>
        <div className={styles.label}>
          <TrendingUp size={16} />
          <span>Đã tiết kiệm</span>
        </div>
        <strong className={styles.teal}>{formatMoney(summary.savedAmount)}</strong>
      </article>

      <article className={styles.card}>
        <div className={styles.label}>
          <CircleDollarSign size={16} />
          <span>Còn thiếu</span>
        </div>
        <strong>{formatMoney(summary.remainingAmount)}</strong>
      </article>
    </section>
  );
};

export default GoalSummaryCards;
