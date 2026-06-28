import { useCallback, useEffect, useState } from "react";
import { reportApi } from "../services/reportApi";
import type { ReportData, ReportPeriod } from "../types/report";

export const useReportData = (initialPeriod: ReportPeriod = "month") => {
  const [period, setPeriod] = useState<ReportPeriod>(initialPeriod);
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const report = await reportApi.getReport(period);
      setData(report);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải dữ liệu báo cáo.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReport();
  }, [fetchReport]);

  return {
    period,
    data,
    isLoading,
    error,
    setPeriod,
    refresh: fetchReport,
  };
};