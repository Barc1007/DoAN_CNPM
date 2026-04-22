import apiClient from "../../../services/apiClient";
import type { DashboardSummary } from "../../../types/dashboard";
import { MOCK_DASHBOARD_DATA } from "../../../data/mockDashboard";

const IS_MOCK = true;

export const dashboardService = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_DASHBOARD_DATA;
    }

    const response = await apiClient.get("/dashboard/summary");
    return response.data.result as unknown as DashboardSummary;
  },
};
