import apiClient from "../../../services/apiClient";
import type { Category, CategoryData, CategoryStat, CategoryType } from "../../../types/category";

const IS_MOCK = false;

const cloneCategoryData = (data: CategoryData): CategoryData => ({
  summary: {
    ...data.summary,
    budget: data.summary.budget ? { ...data.summary.budget } : undefined,
  },
  categories: data.categories.map((category) => ({ ...category })),
});

const normalizeCategoryName = (name: string) =>
  name.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();

const mergeCategoryStats = (
  current: CategoryStat,
  next: CategoryStat
): CategoryStat => {
  const isSameCategory = current.category_id === next.category_id;
  const preferred =
    typeof current.budget_limit !== "number" && typeof next.budget_limit === "number"
      ? next
      : current;
  const fallback = preferred === current ? next : current;
  const budget =
    typeof preferred.budget_limit === "number"
      ? { budget_limit: preferred.budget_limit, alert: preferred.alert }
      : typeof fallback.budget_limit === "number"
        ? { budget_limit: fallback.budget_limit, alert: fallback.alert }
        : {};

  return {
    ...preferred,
    ...budget,
    transaction_count: isSameCategory
      ? Math.max(current.transaction_count, next.transaction_count)
      : current.transaction_count + next.transaction_count,
    total_amount: isSameCategory
      ? Math.max(current.total_amount, next.total_amount)
      : current.total_amount + next.total_amount,
  };
};

const withUniqueCategories = (data: CategoryData): CategoryData => {
  const categoryByName = new Map<string, CategoryStat>();

  data.categories.forEach((category) => {
    const key = `${category.type}:${normalizeCategoryName(category.name)}`;
    const current = categoryByName.get(key);
    categoryByName.set(key, current ? mergeCategoryStats(current, category) : { ...category });
  });

  const categories = Array.from(categoryByName.values());
  const totalAmount =
    data.summary.total_amount ||
    categories.reduce((total, category) => total + category.total_amount, 0);
  const categoriesWithPercent = categories.map((category) => ({
    ...category,
    percentage:
      totalAmount > 0
        ? Math.round((category.total_amount / totalAmount) * 100 * 100) / 100
        : 0,
  }));

  return {
    ...data,
    summary: {
      ...data.summary,
      total_categories: categoriesWithPercent.length,
      average_per_category:
        categoriesWithPercent.length > 0
          ? Math.round(totalAmount / categoriesWithPercent.length)
          : 0,
      top_category_name: categoriesWithPercent[0]?.name || "",
    },
    categories: categoriesWithPercent,
  };
};

export const categoryService = {
  /**
   * Lấy dữ liệu tổng quan và danh sách danh mục
   */
  getCategoryData: async (type: "expense" | "income"): Promise<CategoryData> => {
    if (IS_MOCK) {
      const { MOCK_EXPENSE_DATA, MOCK_INCOME_DATA } = await import("../../../data/mockCategory");
      await new Promise((resolve) => setTimeout(resolve, 600));
      return withUniqueCategories(cloneCategoryData(type === "expense" ? MOCK_EXPENSE_DATA : MOCK_INCOME_DATA));
    }

    const response = await apiClient.get<unknown, CategoryData>("/categories", {
      params: { type },
    });

    return withUniqueCategories(response);
  },

  /**
   * Cập nhật tên danh mục
   */
  updateCategoryName: async (categoryId: number, name: string): Promise<unknown> => {
    return apiClient.put<unknown, unknown>(`/categories/${categoryId}`, { name });
  },

  createCategory: async (payload: {
    name: string;
    type: CategoryType;
    budget_limit?: number;
  }): Promise<Category> => {
    return apiClient.post<unknown, Category>("/categories", payload);
  },

  deleteCategory: async (categoryId: number): Promise<void> => {
    await apiClient.delete(`/categories/${categoryId}`);
  },
};
