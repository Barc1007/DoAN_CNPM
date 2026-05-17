import { useState, useEffect, useCallback } from "react";
import { categoryService } from "../services/categoryService";
import type { CategoryData, CategoryType } from "../../../types/category";

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
      setData(withBudgetSummary(response));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu danh mục.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    // Data loading is intentionally started when the selected tab changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategoryData();
  }, [fetchCategoryData]);

  const handleTabChange = (newType: CategoryType) => {
    setType(newType);
  };

  const updateCategoryBudget = (categoryId: number, budgetLimit: number) => {
    setData((currentData) => {
      if (!currentData) {
        return currentData;
      }

      const updatedData: CategoryData = {
        ...currentData,
        categories: currentData.categories.map((category) =>
          category.category_id === categoryId
            ? { ...category, budget_limit: Math.max(0, Math.round(budgetLimit)) }
            : category
        ),
      };

      return withBudgetSummary(updatedData);
    });
  };

  const updateCategoryName = (categoryId: number, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    setData((currentData) => {
      if (!currentData) {
        return currentData;
      }

      return {
        ...currentData,
        categories: currentData.categories.map((category) =>
          category.category_id === categoryId
            ? { ...category, name: trimmedName }
            : category
        ),
      };
    });
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
