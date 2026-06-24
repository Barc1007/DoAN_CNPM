import React from "react";
import { Bike, CalendarDays, GraduationCap, Laptop, Plane } from "lucide-react";
import { formatMoney } from "../../../../utils/formatMoney";
import type { GoalStatus, SavingGoal } from "../../types/goal";
import styles from "./GoalCard.module.css";

type GoalTone = "teal" | "coral" | "yellow" | "violet";

interface GoalCardProps {
  goal: SavingGoal;
  index?: number;
  onEdit?: (goal: SavingGoal) => void;
  onDelete?: (goal: SavingGoal) => void;
  onContribute?: (goalId: number, amount: number) => void;
}

const visualOptions = [
  { icon: Laptop, label: "Laptop", tone: "teal" },
  { icon: Plane, label: "Du lịch", tone: "coral" },
  { icon: GraduationCap, label: "Học tập", tone: "yellow" },
  { icon: Bike, label: "Xe đạp", tone: "violet" },
] satisfies Array<{ icon: React.ElementType; label: string; tone: GoalTone }>;

const statusLabels: Record<GoalStatus, string> = {
  active: "Đang thực hiện",
  completed: "Hoàn thành",
  paused: "Tạm dừng",
  cancelled: "Đã hủy",
};

const formatDeadline = (value: string) => {
  const date = new Date(value);
  return `${date.getDate()} thg ${date.getMonth() + 1}, ${date.getFullYear()}`;
};

const getDaysLeft = (deadline: string) => {
  const today = new Date();
  const endDate = new Date(deadline);
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  return Math.ceil((endDate.getTime() - today.getTime()) / 86400000);
};

const GoalCard: React.FC<GoalCardProps> = ({ goal, index = 0, onEdit, onDelete, onContribute }) => {
  const safeTarget = typeof goal.target_amount === 'number' && isFinite(goal.target_amount) ? goal.target_amount : 0;
  const safeCurrent = typeof goal.current_amount === 'number' && isFinite(goal.current_amount) ? goal.current_amount : 0;
  const progress = safeTarget > 0
    ? Math.round((safeCurrent / safeTarget) * 100)
    : 0;
  const remaining = Math.max(safeTarget - safeCurrent, 0);
  const daysLeft = getDaysLeft(goal.end_date);
  const dailyAmount = daysLeft > 0 ? Math.ceil(remaining / daysLeft) : remaining;
  const visual = visualOptions[index % visualOptions.length];
  const Icon = visual.icon;

  return (
    <article className={`${styles.card} ${styles[visual.tone]}`}>
      <header className={styles.header}>
        <div className={styles.iconBox} aria-label={visual.label}>
          <Icon size={24} />
        </div>
        <div>
          <h3>{goal.name}</h3>
          <p>{statusLabels[goal.status]} từ {formatDeadline(goal.start_date)}</p>
        </div>
      </header>

      <div className={styles.progressHeader}>
        <span>Tiến độ</span>
        <strong>{progress}%</strong>
      </div>

      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.amounts}>
        <strong>{formatMoney(goal.current_amount)}</strong>
        <span>{formatMoney(goal.target_amount)}</span>
      </div>

      <div className={styles.actions}>
        {onEdit && (
          <button className={styles.actionBtn} onClick={() => onEdit(goal)}>
            Sửa
          </button>
        )}
        {onDelete && (
          <button className={styles.actionBtnDelete} onClick={() => onDelete(goal)}>
            Xoá
          </button>
        )}
        {onContribute && (
          <button className={styles.actionBtn} onClick={() => onContribute(goal.goal_id, goal.target_amount)}>
            Góp tiền
          </button>
        )}
      </div>

      <footer className={styles.footer}>
        <div>
          <span className={styles.metaLabel}>
            <CalendarDays size={15} />
            Hạn chót
          </span>
          <strong>{formatDeadline(goal.end_date)}</strong>
          <small>Còn {Math.max(daysLeft, 0)} ngày</small>
        </div>
        <div>
          <span className={styles.metaLabel}>Còn thiếu</span>
          <strong className={styles.remaining}>{formatMoney(remaining)}</strong>
          <small>{formatMoney(dailyAmount)}/ngày</small>
        </div>
      </footer>
    </article>
  );
};

export default GoalCard;
