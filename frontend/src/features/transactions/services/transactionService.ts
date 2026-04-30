import apiClient from "../../../services/apiClient";
import type { Transaction, TransactionStats } from "../types/transaction";
import { MOCK_TRANSACTIONS } from "../../../data/mockTransactions";

const IS_MOCK = true;

export const transactionService = {
  /**
   * Lấy danh sách toàn bộ giao dịch của user
   */
  getTransactions: async (userId?: number): Promise<Transaction[]> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const data = userId
        ? MOCK_TRANSACTIONS.filter((t) => t.user_id === userId)
        : MOCK_TRANSACTIONS;

      return data;
    }

    const response = await apiClient.get<any, Transaction[]>("/transactions", {
      params: { user_id: userId },
    });
    return response;
  },

  /**
   * Tạo giao dịch mới
   */
  createTransaction: async (
    payload: Omit<Transaction, "transaction_id">
  ): Promise<Transaction> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newTransaction: Transaction = {
        ...payload,
        transaction_id: Date.now(),
      };

      return newTransaction;
    }

    const response = await apiClient.post<any, Transaction>("/transactions", payload);
    return response;
  },

  /**
   * Tính toán thống kê từ danh sách giao dịch (Business Logic)
   */
  calculateSummaryStats: (transactions: Transaction[]): TransactionStats => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed

    return transactions.reduce(
      (acc, t) => {
        // Cộng tổng thu/chi
        if (t.type === "INCOME") acc.totalIncome += Number(t.amount);
        else acc.totalExpense += Number(t.amount);

        // Đếm số giao dịch trong tháng hiện tại
        const [year, month] = t.transaction_date.split("-").map(Number);
        if (year === currentYear && month === currentMonth) {
          acc.currentMonthCount++;
        }

        return acc;
      },
      { totalIncome: 0, totalExpense: 0, currentMonthCount: 0 }
    );
  },
};
