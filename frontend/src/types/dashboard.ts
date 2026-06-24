export interface User {
  user_id: number;
  username: string;
  email: string;
  password?: string;
  full_name: string;
}

export interface Category {
  category_id: number;
  name: string;
  type: string;
}

export interface Wallet {
  wallet_id: number;
  user_id: number;
  name: string;
  balance: number;
  wallet_type: string;
}

export interface Transaction {
  transaction_id: number;
  user_id: number;
  wallet_id: number;
  category_id: number;
  category_name?: string;
  type: string;
  amount: number;
  transaction_date: string;
  note?: string;
}

export interface Budget {
  budget_id: number;
  user_id: number;
  category_id: number;
  name: string;
  limit_amount: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
  alert: number;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
}

export interface SavingGoal {
  saving_goal_id: number;
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
  end_date: string;
  status?: string;
}

export interface CategorySpend {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface DashboardSummary {
  total_balance: number;
  total_income: number;
  total_expense: number;
  recent_transactions: Transaction[];
  category_spent: CategorySpend[];
  savings_goal: SavingGoal;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  result: T;
}
