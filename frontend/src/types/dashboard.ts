export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

export interface CategorySpend {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface SavingGoal {
  id: string;
  title: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  percentage: number;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  recentTransactions: Transaction[];
  categorySpent: CategorySpend[];
  savingsGoal: SavingGoal;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  result: T;
}
