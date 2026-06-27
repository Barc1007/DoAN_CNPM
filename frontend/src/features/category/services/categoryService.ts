import apiClient from "../../../services/apiClient";
import type { Category, CategoryData, CategoryType } from "../../../types/category";

const IS_MOCK = false;

const cloneCategoryData = (data: CategoryData): CategoryData => ({
  summary: {
    ...data.summary,
    budget: data.summary.budget ? { ...data.summary.budget } : undefined,
  },
  categories: data.categories.map((category) => ({ ...category })),
});

export const categoryService = {
  /**
   * Lấy dữ liệu tổng quan và danh sách danh mục
   */
  getCategoryData: async (type: "expense" | "income"): Promise<CategoryData> => {
    if (IS_MOCK) {
      const { MOCK_EXPENSE_DATA, MOCK_INCOME_DATA } = await import("../../../data/mockCategory");
      await new Promise((resolve) => setTimeout(resolve, 600));
      return cloneCategoryData(type === "expense" ? MOCK_EXPENSE_DATA : MOCK_INCOME_DATA);
    }

    const response = await apiClient.get<unknown, CategoryData>("/categories", {
      params: { type },
    });

    return response;
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
