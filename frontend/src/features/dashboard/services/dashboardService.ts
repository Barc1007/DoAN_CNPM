import apiClient, { IS_MOCK } from "../../../services/apiClient";
import type { DashboardSummary, ApiResponse } from "../../../types/dashboard";
import { MOCK_DASHBOARD_DATA } from "../../../data/mockDashboard";

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  if (IS_MOCK) {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return MOCK_DASHBOARD_DATA;
  }

  const response = await apiClient.get<ApiResponse<DashboardSummary>>("/dashboard/summary");
  // Ensure we return the .result property as required
  return response.data.result;
};
