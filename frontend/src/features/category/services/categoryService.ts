import apiClient from "../../../services/apiClient";
import type { CategoryData } from "../../../types/category";
import { MOCK_EXPENSE_DATA, MOCK_INCOME_DATA } from "../../../data/mockCategory";

const IS_MOCK = true;

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
      // Giả lập delay mạng
      await new Promise((resolve) => setTimeout(resolve, 600));
      return cloneCategoryData(type === "expense" ? MOCK_EXPENSE_DATA : MOCK_INCOME_DATA);
    }

    const response = await apiClient.get<unknown, CategoryData>("/categories", {
      params: { type },
    });
    return response;
  },
};
