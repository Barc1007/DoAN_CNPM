// Khớp chính xác với schema bảng transactions trong DB
export type TransactionType = string;

export interface Transaction {
  transaction_id: number;
  user_id: number;
  wallet_id: number;
  category_id: number;
  type: string;
  amount: number;
  transaction_date: string; // ISO date string "YYYY-MM-DD"
  note: string;
  // Trường phụ trợ để render UI (join từ bảng categories)
  category_name: string;
  icon_name: string;
}

export type FilterType = "ALL" | "INCOME" | "EXPENSE";

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  currentMonthCount: number;
}