import apiClient from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/dashboard";
import type { Transaction } from "../types/transaction";
import { MOCK_TRANSACTIONS } from "../../../data/mockTransactions";

const IS_MOCK = true;

export const transactionService = {
  /**
   * Lấy danh sách toàn bộ giao dịch của user
   */
  getTransactions: async (userId?: number): Promise<ApiResponse<Transaction[]>> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const data = userId
        ? MOCK_TRANSACTIONS.filter((t) => t.user_id === userId)
        : MOCK_TRANSACTIONS;

      return {
        status: 200,
        message: "Lấy danh sách giao dịch thành công",
        result: data,
      };
    }

    const response = await apiClient.get<ApiResponse<Transaction[]>>("/transactions", {
      params: { user_id: userId },
    });
    return response.data;
  },

  /**
   * Tạo giao dịch mới
   */
  createTransaction: async (
    payload: Omit<Transaction, "transaction_id">
  ): Promise<ApiResponse<Transaction>> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newTransaction: Transaction = {
        ...payload,
        transaction_id: Date.now(),
      };

      return {
        status: 201,
        message: "Tạo giao dịch thành công",
        result: newTransaction,
      };
    }

    const response = await apiClient.post<ApiResponse<Transaction>>("/transactions", payload);
    return response.data;
  },
};
