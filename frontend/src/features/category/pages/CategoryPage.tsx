import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CategoryPage.module.css";
import { useCategoryData } from "../hooks/useCategoryData";
import CategoryHeader from "../components/CategoryHeader/CategoryHeader";
import CategorySummary from "../components/CategorySummary/CategorySummary";
import CategoryCard from "../components/CategoryCard/CategoryCard";
import MainLayout from "../../../layouts/MainLayout";

const CategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    type,
    data,
    isLoading,
    error,
    handleTabChange,
    updateCategoryBudget,
    updateCategoryName,
  } = useCategoryData("expense");

  const handleViewTransactions = (categoryName: string) => {
    navigate(`/transactions?category=${encodeURIComponent(categoryName)}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>Đang tải dữ liệu...</div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className={styles.errorContainer}>{error}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.pageContainer}>
        <CategoryHeader
          activeTab={type}
          onTabChange={handleTabChange}
        />

        {data && (
          <>
            <CategorySummary summary={data.summary} type={type} />
            
            <div className={styles.gridContainer}>
              {data.categories.map((category) => (
                <CategoryCard
                  key={category.category_id}
                  category={category}
                  onUpdateBudget={updateCategoryBudget}
                  onUpdateCategoryName={updateCategoryName}
                  onViewTransactions={handleViewTransactions}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default CategoryPage;
