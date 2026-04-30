import apiClient from "../../../services/apiClient";
import type { Transaction } from "../types/transaction";
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
};
