import { useCallback, useEffect, useMemo, useState } from "react";
import { budgetService } from "../../category/services/budgetService";
import type { BudgetResponse } from "../../category/services/budgetService";
import type { BudgetSummary, BudgetSummaryData } from "../types/budget";

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<BudgetSummaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await budgetService.getBudgets();

      const mapped: BudgetSummaryData[] = data.map((b) => {
        const rawLimit = typeof b.limit_amount === "string"
          ? parseFloat(b.limit_amount)
          : (b.limit_amount ?? 0);
        const rawSpent = typeof b.spent_amount === "string"
          ? parseFloat(b.spent_amount)
          : (b.spent_amount ?? 0);
        const limit = isNaN(rawLimit) ? 0 : rawLimit;
        const spent = isNaN(rawSpent) ? 0 : rawSpent;
        const usage = limit > 0 ? (spent / limit) * 100 : 0;

        return {
          budget_id: b.budget_id,
          user_id: b.user_id,
          category_id: b.category_id,
          category_name: b.category_name,
          name: b.name,
          limit_amount: limit,
          spent_amount: spent,
          start_date: b.start_date,
          end_date: b.end_date,
          alert: b.alert ?? 80,
          usage_percent: Math.round(usage * 100) / 100,
          is_active: b.is_active,
          is_expired: b.is_expired,
        };
      });

      setBudgets(mapped);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tải ngân sách");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const summary = useMemo<BudgetSummary>(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit_amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent_amount, 0);
    const overBudgetCount = budgets.filter((b) => b.usage_percent >= 100).length;
    const nearLimitCount = budgets.filter(
      (b) => b.usage_percent >= b.alert && b.usage_percent < 100
    ).length;

    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      overBudgetCount,
      nearLimitCount,
      activeBudgetCount: budgets.length,
    };
  }, [budgets]);

  return { budgets, summary, isLoading, error, refresh: fetchBudgets, setBudgets };
};
