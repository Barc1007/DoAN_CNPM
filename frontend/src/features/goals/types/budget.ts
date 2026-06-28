export interface BudgetSummaryData {
  budget_id: number;
  user_id: number;
  category_id: number | null;
  category_name?: string | null;
  name: string;
  limit_amount: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
  alert: number;
  usage_percent: number;
  is_active?: boolean;
  is_expired?: boolean;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overBudgetCount: number;
  nearLimitCount: number;
  activeBudgetCount: number;
}
