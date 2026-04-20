import { useState, useEffect } from "react";
import type { DashboardSummary } from "../../../types/dashboard";
import { getDashboardSummary } from "../services/dashboardService";

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getDashboardSummary();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refresh: fetchDashboardData,
  };
};
