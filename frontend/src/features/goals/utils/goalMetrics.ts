import { formatMoney } from "../../../utils/formatMoney";

interface GoalLike {
  targetAmount?: number;
  currentAmount?: number;
  target_amount?: number;
  current_amount?: number;
}

export interface GoalMetrics {
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  exceededAmount: number;
  progressPercent: number;
  isCompleted: boolean;
}

const safeNumber = (value: unknown): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

export const getGoalMetrics = (goal: GoalLike): GoalMetrics => {
  const targetAmount = safeNumber(goal.targetAmount ?? goal.target_amount ?? 0);
  const currentAmount = safeNumber(goal.currentAmount ?? goal.current_amount ?? 0);
  const remainingAmount = Math.max(targetAmount - currentAmount, 0);
  const exceededAmount = Math.max(currentAmount - targetAmount, 0);
  const progressPercent =
    targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
  const isCompleted = currentAmount >= targetAmount && targetAmount > 0;

  return {
    targetAmount,
    currentAmount,
    remainingAmount,
    exceededAmount,
    progressPercent,
    isCompleted,
  };
};

export const getGoalStatusText = (metrics: GoalMetrics): string => {
  if (!metrics.isCompleted) {
    return `Còn ${formatMoney(metrics.remainingAmount)} nữa là đạt mục tiêu! 🎯`;
  }

  if (metrics.exceededAmount > 0) {
    return `Đã đạt mục tiêu! Vượt ${formatMoney(metrics.exceededAmount)} 🎯`;
  }

  return "Đã hoàn thành mục tiêu tiết kiệm! 🎯";
};
