export type GoalStatus = "active" | "completed" | "paused" | "cancelled";

export interface SavingGoal {
  goal_id: number;
  user_id: number;
  wallet_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  remaining_amount?: number;
  exceeded_amount?: number;
  progress_percent?: number;
  is_completed?: boolean;
  remainingAmount?: number;
  exceededAmount?: number;
  progressPercent?: number;
  isCompleted?: boolean;
  start_date: string;
  end_date: string;
  status: GoalStatus;
}

export interface GoalSummary {
  totalGoals: number;
  savedAmount: number;
  remainingAmount: number;
  progressPercent: number;
  targetAmount: number;
}
