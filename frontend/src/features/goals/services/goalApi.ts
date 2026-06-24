import apiClient from "../../../services/apiClient";
import type { SavingGoal } from "../types/goal";

const IS_MOCK = false;

export const goalApi = {
  getGoals: async (userId?: number): Promise<SavingGoal[]> => {
    if (IS_MOCK) {
      const { MOCK_GOALS } = await import("../data/mockGoals");
      await new Promise((resolve) => setTimeout(resolve, 400));
      return userId ? MOCK_GOALS.filter((goal) => goal.user_id === userId) : MOCK_GOALS;
    }

    const response = await apiClient.get<unknown, SavingGoal[]>("/goals", {
      params: { user_id: userId },
    });

    return response;
  },

  updateGoal: async (
    goalId: number,
    payload: Partial<SavingGoal>
  ): Promise<SavingGoal> => {
    if (IS_MOCK) {
      const { MOCK_GOALS } = await import("../data/mockGoals");
      await new Promise((resolve) => setTimeout(resolve, 400));
      const idx = MOCK_GOALS.findIndex((g) => g.goal_id === goalId);
      if (idx === -1) throw new Error("Không tìm thấy mục tiêu");
      MOCK_GOALS[idx] = { ...MOCK_GOALS[idx], ...payload };
      return MOCK_GOALS[idx];
    }

    const response = await apiClient.put<unknown, SavingGoal>(`/goals/${goalId}`, payload);
    return response;
  },

  contributeToGoal: async (goalId: number, payload: { amount: number; wallet_id?: number; note?: string }): Promise<SavingGoal> => {
    if (IS_MOCK) {
      const { MOCK_GOALS } = await import("../data/mockGoals");
      await new Promise((resolve) => setTimeout(resolve, 400));
      const idx = MOCK_GOALS.findIndex((g) => g.goal_id === goalId);
      if (idx === -1) throw new Error("Không tìm thấy mục tiêu");
      MOCK_GOALS[idx].current_amount = (MOCK_GOALS[idx].current_amount || 0) + payload.amount;
      return MOCK_GOALS[idx];
    }

    const response = await apiClient.patch<unknown, SavingGoal>(`/goals/${goalId}/contribute`, payload);
    return response;
  },

  deleteGoal: async (goalId: number): Promise<void> => {
    if (IS_MOCK) {
      const { MOCK_GOALS } = await import("../data/mockGoals");
      await new Promise((resolve) => setTimeout(resolve, 400));
      const idx = MOCK_GOALS.findIndex((g) => g.goal_id === goalId);
      if (idx === -1) throw new Error("Không tìm thấy mục tiêu");
      MOCK_GOALS.splice(idx, 1);
      return;
    }

    await apiClient.delete(`/goals/${goalId}`);
  },

  createGoal: async (
    payload: Omit<SavingGoal, "goal_id">
  ): Promise<SavingGoal> => {
    if (IS_MOCK) {
      const { MOCK_GOALS } = await import("../data/mockGoals");
      await new Promise((resolve) => setTimeout(resolve, 400));
      const newGoal: SavingGoal = {
        ...payload,
        goal_id: Date.now(),
      };
      MOCK_GOALS.push(newGoal);
      return newGoal;
    }

    const response = await apiClient.post<unknown, SavingGoal>("/goals", payload);
    
    return response;
  },
};
