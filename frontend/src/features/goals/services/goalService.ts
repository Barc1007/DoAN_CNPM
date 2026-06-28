import apiClient from "../../../services/apiClient";

export interface Goal {
  goal_id: number;
  user_id: number;
  wallet_id: number | null;
  name: string;
  target_amount: number;
  current_amount: number;
  start_date: string | null;
  end_date: string | null;
  status: "active" | "completed" | "cancelled";
  created_at: string;
  progress_percent: number;
}

export interface CreateGoalPayload {
  name: string;
  target_amount: number;
  end_date?: string;
  wallet_id?: number;
}

export interface ContributePayload {
  amount: number;
  wallet_id?: number;
  note?: string;
}

export const goalService = {
  getGoals: async (userId?: number): Promise<Goal[]> => {
    const response = await apiClient.get<any, Goal[]>("/goals", {
      params: { user_id: userId },
    });
    return response;
  },

  createGoal: async (payload: CreateGoalPayload): Promise<Goal> => {
    const response = await apiClient.post<any, Goal>("/goals", payload);
    return response;
  },

  contribute: async (
    goalId: number,
    payload: ContributePayload
  ): Promise<Goal> => {
    const response = await apiClient.patch<any, Goal>(
      `/goals/${goalId}/contribute`,
      payload
    );
    return response;
  },

  deleteGoal: async (goalId: number): Promise<void> => {
    await apiClient.delete(`/goals/${goalId}`);
  },
};
