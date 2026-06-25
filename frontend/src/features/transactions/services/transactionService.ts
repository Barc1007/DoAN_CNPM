import apiClient from "../../../services/apiClient";
import type { Transaction, TransactionStats } from "../types/transaction";

const IS_MOCK = false;

export const transactionService = {
  getTransactions: async (userId?: number): Promise<Transaction[]> => {
    if (IS_MOCK) {
      const { MOCK_TRANSACTIONS } = await import("../../../data/mockTransactions");
      await new Promise((resolve) => setTimeout(resolve, 600));

      const data = userId
        ? MOCK_TRANSACTIONS.filter((t) => t.user_id === userId)
        : MOCK_TRANSACTIONS;

      return data;
    }

    const response = await apiClient.get<unknown, Transaction[]>("/transactions", {
      params: { user_id: userId },
    });

    return response;
  },

  createTransaction: async (
    payload: Omit<Transaction, "transaction_id">
  ): Promise<Transaction> => {
    if (IS_MOCK) {
      const { MOCK_TRANSACTIONS } = await import("../../../data/mockTransactions");
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newTransaction: Transaction = {
        ...payload,
        transaction_id: Date.now(),
      };

      MOCK_TRANSACTIONS.push(newTransaction);
      return newTransaction;
    }

    const response = await apiClient.post<unknown, Transaction>("/transactions", payload);

    return response;
  },

  calculateSummaryStats: (transactions: Transaction[]): TransactionStats => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return transactions.reduce(
      (acc, t) => {
        if (String(t.type).toUpperCase() === "INCOME") acc.totalIncome += Number(t.amount);
        else acc.totalExpense += Number(t.amount);

        const match = String(t.transaction_date).match(/^(\d{4})-(\d{2})/);
        const year = match ? Number(match[1]) : NaN;
        const month = match ? Number(match[2]) : NaN;
        if (year === currentYear && month === currentMonth) {
          acc.currentMonthCount++;
        }

        return acc;
      },
      { totalIncome: 0, totalExpense: 0, currentMonthCount: 0 }
    );
  },
};
