export type ReportPeriod = "week" | "month" | "quarter" | "year";

export interface ReportSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  savings_rate: number;
}

export interface CashflowPoint {
  label: string;
  income: number;
  expense: number;
}

export interface CategoryReportItem {
  category_id: number;
  name: string;
  amount: number;
  percentage: number;
  previous_change: number;
  color: string;
}

export interface ExpenseTrendPoint {
  date: string;
  amount: number;
}

export interface ReportData {
  period: ReportPeriod;
  summary: ReportSummary;
  cashflow: CashflowPoint[];
  category_breakdown: CategoryReportItem[];
  expense_trend: ExpenseTrendPoint[];
}
