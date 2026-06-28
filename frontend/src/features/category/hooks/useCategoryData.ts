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
    fetchCategoryData();
  }, [fetchCategoryData]);

  const handleTabChange = (newType: CategoryType) => {
    setType(newType);
  };

  const updateCategoryBudget = async (categoryId: number, budgetLimit: number, alertPercent?: number) => {
    try {
      const budgets = await budgetService.getBudgets();
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      const alertValue = Math.min(100, Math.max(1, Math.round(alertPercent ?? 80)));

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
          alert: alertValue,
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
          alert: alertValue,
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

  const addCategory = async (
    name: string,
    categoryType: CategoryType = type,
    budgetLimit?: number
  ) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("Tên danh mục không được để trống");
    }

    if (trimmedName.length < 2 || trimmedName.length > 50) {
      throw new Error("Tên danh mục phải từ 2 đến 50 ký tự");
    }

    if (!["expense", "income"].includes(categoryType)) {
      throw new Error("Vui lòng chọn loại danh mục");
    }

    if (
      categoryType === type &&
      data?.categories.some(
        (category) =>
          category.type === categoryType &&
          category.name.trim().toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      throw new Error("Danh mục này đã tồn tại");
    }

    if (
      budgetLimit !== undefined &&
      (!Number.isFinite(budgetLimit) || budgetLimit < 0)
    ) {
      throw new Error("Ngân sách phải là số hợp lệ và không nhỏ hơn 0");
    }

    await categoryService.createCategory({
      name: trimmedName,
      type: categoryType,
      ...(categoryType === "expense" && budgetLimit !== undefined
        ? { budget_limit: budgetLimit }
        : {}),
    });
    await fetchCategoryData();
  };

  const deleteCategory = async (categoryId: number) => {
    await categoryService.deleteCategory(categoryId);
    await fetchCategoryData();
  };

  return {
    type,
    data,
    isLoading,
    error,
    handleTabChange,
    updateCategoryBudget,
    updateCategoryName,
    addCategory,
    deleteCategory,
    refetch: fetchCategoryData,
  };
};
