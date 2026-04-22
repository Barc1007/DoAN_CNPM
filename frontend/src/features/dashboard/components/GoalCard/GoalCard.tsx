import React from "react";
import { Target, Laptop } from "lucide-react";
import styles from "./GoalCard.module.css";
import { formatMoney } from "../../../../utils/formatMoney";

interface GoalCardProps {
  name: string;
  description: string;
  current_amount: number;
  target_amount: number;
  percentage: number;
}

const GoalCard: React.FC<GoalCardProps> = ({
  name,
  description,
  current_amount,
  target_amount,
  percentage,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Target size={20} />
        </div>
        <h3 className={styles.title}>Mục tiêu tiết kiệm</h3>
      </div>

      <div className={styles.goalInfo}>
        <div className={styles.goalIcon}>
          <Laptop size={24} />
        </div>
        <div className={styles.goalText}>
          <h4>{name}</h4>
          <p>{description}</p>
        </div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>Tiến độ</span>
          <span>{percentage}%</span>
        </div>
        <div className={styles.progressBarBg}>
          <div 
            className={styles.progressBarFill} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className={styles.amounts}>
        <span>{formatMoney(current_amount)}</span>
        <span style={{ color: "var(--color-text-muted)" }}>
          {formatMoney(target_amount)}
        </span>
      </div>

      <p className={styles.status}>
        Còn <span>{formatMoney(target_amount - current_amount)}</span> nữa là đạt mục tiêu! 🎯
      </p>
    </div>
  );
};

export default GoalCard;
