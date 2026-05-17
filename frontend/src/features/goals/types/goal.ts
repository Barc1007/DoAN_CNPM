export type GoalStatus = "active" | "completed" | "paused" | "cancelled";

export interface SavingGoal {
  goal_id: number;
  user_id: number;
  wallet_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
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
