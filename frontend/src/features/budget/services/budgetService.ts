import apiClient from "../../../services/apiClient";

export interface Budget {
  budget_id: number;
  user_id: number;
  category_id: number | null;
  name: string;
  limit_amount: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
  alert: number;
  category_name: string | null;
  usage_percent: number;
}

export interface CreateBudgetPayload {
  name: string;
  limit_amount: number;
  category_id?: number;
  start_date: string;
  end_date: string;
  alert?: number;
}

export const budgetService = {
  getBudgets: async (userId?: number): Promise<Budget[]> => {
    const response = await apiClient.get<any, Budget[]>("/budgets", {
      params: { user_id: userId },
    });
    return response;
  },

  createBudget: async (payload: CreateBudgetPayload): Promise<Budget> => {
    const response = await apiClient.post<any, Budget>("/budgets", payload);
    return response;
  },

  deleteBudget: async (budgetId: number): Promise<void> => {
    await apiClient.delete(`/budgets/${budgetId}`);
  },
};
