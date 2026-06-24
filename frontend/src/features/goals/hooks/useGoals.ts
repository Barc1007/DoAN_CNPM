/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { goalApi } from "../services/goalApi";
import type { GoalSummary, SavingGoal } from "../types/goal";

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await goalApi.getGoals(user?.user_id);
      setGoals(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không thể tải danh sách mục tiêu";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.user_id]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const summary = useMemo<GoalSummary>(() => {
    const safeNum = (v: number) => (typeof v === 'number' && isFinite(v) ? v : 0);
    const targetAmount = goals.reduce((sum, g) => sum + safeNum(g.target_amount), 0);
    const savedAmount = goals.reduce((sum, g) => sum + safeNum(g.current_amount), 0);
    const remainingAmount = Math.max(targetAmount - savedAmount, 0);
    const progressPercent =
      targetAmount > 0
        ? Math.round((savedAmount / targetAmount) * 1000) / 10
        : 0;

    return {
      totalGoals: goals.length,
      savedAmount,
      remainingAmount,
      progressPercent: Math.min(Math.max(progressPercent || 0, 0), 100),
      targetAmount,
    };
  }, [goals]);

  return {
    goals,
    summary,
    isLoading,
    error,
    refresh: fetchGoals,
    setGoals,
  };
};
