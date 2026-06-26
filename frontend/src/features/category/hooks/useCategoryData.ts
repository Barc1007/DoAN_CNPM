import { useState, useEffect, useCallback } from "react";
import { categoryService } from "../services/categoryService";
import type { CategoryData, CategoryType } from "../../../types/category";
import { budgetService } from "../services/budgetService";

const withBudgetSummary = (data: CategoryData): CategoryData => {
  if (!data.summary.budget) {
    return data;
  }

  const budgetedCategories = data.categories.filter(
    (category) => category.type === "expense" && typeof category.budget_limit === "number"
  );
  const totalBudget = budgetedCategories.reduce(
    (total, category) => total + (category.budget_limit || 0),
    0
  );
  const totalSpent = budgetedCategories.reduce(
    (total, category) => total + category.total_amount,
    0
  );
  const overBudgetCategories = budgetedCategories.filter(
    (category) => category.total_amount > (category.budget_limit || 0)
  ).length;
  const nearLimitCategories = budgetedCategories.filter((category) => {
    const limit = category.budget_limit || 0;
    if (limit <= 0) {
      return false;
    }
    const usedRate = category.total_amount / limit;
    return usedRate >= 0.8 && usedRate <= 1;
  }).length;

  return {
    ...data,
    summary: {
      ...data.summary,
      budget: {
        total_budget: totalBudget,
        total_remaining: totalBudget - totalSpent,
        budgeted_categories: budgetedCategories.length,
        over_budget_categories: overBudgetCategories,
        near_limit_categories: nearLimitCategories,
      },
    },
  };
};

const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useCategoryData = (initialType: CategoryType = "expense") => {
  const [type, setType] = useState<CategoryType>(initialType);
  const [data, setData] = useState<CategoryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await categoryService.getCategoryData(type);

      // Try to load budgets for current user and merge budget limits into categories
      try {
        const budgets = await budgetService.getBudgets();
        const now = new Date();
        const activeBudgets = budgets.filter((b) => {
          const start = new Date(b.start_date);
          const end = new Date(b.end_date);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          return now >= start && now <= end && b.category_id;
        });

        const byCategory: Record<number, number> = {};
        activeBudgets.forEach((b) => {
          const cid = Number(b.category_id);
          const limit = Number(b.limit_amount) || 0;
          if (cid) byCategory[cid] = limit;
        });

        const merged = {
          ...response,
          categories: response.categories.map((c) => ({
            ...c,
            budget_limit: byCategory[c.category_id] ?? c.budget_limit,
          })),
          summary: {
            ...response.summary,
            // attach a budget object so withBudgetSummary computes derived budget summary
            budget: response.summary.budget ?? {},
          },
        };

        setData(withBudgetSummary(merged));
      } catch (err) {
        // If budgets fail, still set categories without budget info
        setData(withBudgetSummary(response));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu danh mục.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  const handleTabChange = (newType: CategoryType) => {
    setType(newType);
  };

  const updateCategoryBudget = async (categoryId: number, budgetLimit: number) => {
    try {
      const budgets = await budgetService.getBudgets();
      const now = new Date();
      const startOfMonth = formatDateToISO(new Date(now.getFullYear(), now.getMonth(), 1));
      const endOfMonth = formatDateToISO(new Date(now.getFullYear(), now.getMonth() + 1, 0));

      const existingBudget = budgets.find((b) => {
        if (b.category_id !== categoryId) return false;
        const start = new Date(b.start_date);
        const end = new Date(b.end_date);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return now >= start && now <= end;
      });

      if (existingBudget) {
        await budgetService.updateBudget(existingBudget.budget_id, {
          limit_amount: Math.max(0, Math.round(budgetLimit)),
        });
      } else {
        const category = data?.categories.find((c) => c.category_id === categoryId);
        const categoryName = category ? category.name : "Danh mục";

        await budgetService.createBudget({
          category_id: categoryId,
          name: "Ngân sách " + categoryName,
          limit_amount: Math.max(0, Math.round(budgetLimit)),
          start_date: startOfMonth,
          end_date: endOfMonth,
          alert: 80,
        });
      }

      await fetchCategoryData();
    } catch (err) {
      console.error("Lỗi khi cập nhật ngân sách:", err);
    }
  };

  const updateCategoryName = async (categoryId: number, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    try {
      await categoryService.updateCategoryName(categoryId, trimmedName);
      await fetchCategoryData();
    } catch (err) {
      console.error("Lỗi khi cập nhật tên danh mục:", err);
    }
  };

  return {
    type,
    data,
    isLoading,
    error,
    handleTabChange,
    updateCategoryBudget,
    updateCategoryName,
    refetch: fetchCategoryData,
  };
};