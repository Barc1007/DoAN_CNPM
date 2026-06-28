import apiClient from "../../../services/apiClient";
import type { ReportData, ReportPeriod } from "../types/report";

export const reportApi = {
  getReport: async (period: ReportPeriod): Promise<ReportData> => {
    const response = await apiClient.get<unknown, ReportData>("/reports", {
      params: { period },
    });
    return response;
  },
};