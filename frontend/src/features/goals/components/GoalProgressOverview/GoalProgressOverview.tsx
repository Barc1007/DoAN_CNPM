import React from "react";
import { formatMoney } from "../../../../utils/formatMoney";
import type { GoalSummary } from "../../types/goal";
import styles from "./GoalProgressOverview.module.css";

interface GoalProgressOverviewProps {
  summary: GoalSummary;
}

const GoalProgressOverview: React.FC<GoalProgressOverviewProps> = ({ summary }) => {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2>Tiến độ chung</h2>
          <p>
            {formatMoney(summary.savedAmount)} / {formatMoney(summary.targetAmount)}
          </p>
        </div>
        <strong>{summary.progressPercent.toFixed(1)}%</strong>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${Math.min(summary.progressPercent, 100)}%` }}
        />
      </div>
    </section>
  );
};

export default GoalProgressOverview;
