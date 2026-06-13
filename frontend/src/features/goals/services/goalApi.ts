import apiClient from "../../../services/apiClient";
import { MOCK_GOALS } from "../data/mockGoals";
import type { SavingGoal } from "../types/goal";

const IS_MOCK = true;

export const goalApi = {
  getGoals: async (userId?: number): Promise<SavingGoal[]> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return userId ? MOCK_GOALS.filter((goal) => goal.user_id === userId) : MOCK_GOALS;
    }

    const response = await apiClient.get<any, SavingGoal[]>("/goals", {
      params: { user_id: userId },
    });
    return response;
  },

  createGoal: async (
    payload: Omit<SavingGoal, "goal_id">
  ): Promise<SavingGoal> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const newGoal: SavingGoal = {
        ...payload,
        goal_id: Date.now(),
      };
      MOCK_GOALS.push(newGoal);
      return newGoal;
    }

    const response = await apiClient.post<any, SavingGoal>("/goals", payload);
    return response;
  },
};
