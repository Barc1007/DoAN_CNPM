/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import type { DashboardSummary } from "../../../types/dashboard";
import { dashboardService } from "../services/dashboardService";
import { WALLET_CHANGED_EVENT } from "../../wallet/hooks/useWallets";

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("[useDashboardData] fetching");
      const result = await dashboardService.getDashboardSummary();
      console.log("[useDashboardData] fetched", result);
      setData(result);
    } catch (err: unknown) {
      console.error("[useDashboardData] error:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const handler = () => {
      console.log("[useDashboardData] received wallet:changed, refreshing");
      fetchDashboardData();
    };
    window.addEventListener(WALLET_CHANGED_EVENT, handler);
    return () => window.removeEventListener(WALLET_CHANGED_EVENT, handler);
  }, [fetchDashboardData]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchDashboardData,
  };
};
