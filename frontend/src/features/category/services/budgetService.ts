import apiClient from "../../../services/apiClient";

export interface BudgetPayload {
  name: string;
  limit_amount: number | string;
  category_id?: number | null;
  start_date: string;
  end_date: string;
  alert?: number;
}

export interface BudgetResponse {
  budget_id: number;
  user_id: number;
  category_id: number | null;
  name: string;
  limit_amount: string;
  spent_amount: string | number;
  start_date: string;
  end_date: string;
  alert: number;
  category_name?: string;
}

export const budgetService = {
  getBudgets: async (userId?: number): Promise<BudgetResponse[]> => {
    const response = await apiClient.get<unknown, BudgetResponse[]>("/budgets", {
      params: { user_id: userId },
    });
    return response;
  },

  createBudget: async (payload: BudgetPayload): Promise<BudgetResponse> => {
    const response = await apiClient.post<unknown, BudgetResponse>("/budgets", payload);
    return response;
  },

  updateBudget: async (
    budgetId: number,
    payload: Partial<BudgetPayload>
  ): Promise<BudgetResponse> => {
    const response = await apiClient.put<unknown, BudgetResponse>(
      `/budgets/${budgetId}`,
      payload
    );
    return response;
  },

  deleteBudget: async (budgetId: number): Promise<void> => {
    await apiClient.delete(`/budgets/${budgetId}`);
  },
};
