import { useState, useEffect, useCallback } from "react";
import { categoryService } from "../services/categoryService";
import type { CategoryData } from "../../../types/category";

export const useCategoryData = (initialType: "expense" | "income" = "expense") => {
  const [type, setType] = useState<"expense" | "income">(initialType);
  const [data, setData] = useState<CategoryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await categoryService.getCategoryData(type);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu danh mục.");
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  const handleTabChange = (newType: "expense" | "income") => {
    setType(newType);
  };

  return {
    type,
    data,
    isLoading,
    error,
    handleTabChange,
    refetch: fetchCategoryData,
  };
};
