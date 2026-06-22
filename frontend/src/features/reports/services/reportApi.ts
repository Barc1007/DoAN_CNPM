import apiClient from "../../../services/apiClient";
import { cloneReportData } from "../data/mockReports";
import type { ReportData, ReportPeriod } from "../types/report";

const IS_MOCK = true;

export const reportApi = {
  getReport: async (period: ReportPeriod): Promise<ReportData> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      return cloneReportData(period);
    }

    const response = await apiClient.get<unknown, ReportData>("/reports", {
      params: { period },
    });
    return response;
  },

  exportReport: async (period: ReportPeriod): Promise<string> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return `report-${period}.xlsx`;
    }

    const response = await apiClient.get<unknown, { file_name: string }>("/reports/export", {
      params: { period },
    });
    return response.file_name;
  },
};
