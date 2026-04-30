import React from "react";
import styles from "./CategoryPage.module.css";
import { useCategoryData } from "../hooks/useCategoryData";
import CategoryHeader from "../components/CategoryHeader/CategoryHeader";
import CategorySummary from "../components/CategorySummary/CategorySummary";
import CategoryCard from "../components/CategoryCard/CategoryCard";
import MainLayout from "../../../layouts/MainLayout";

const CategoryPage: React.FC = () => {
  const { type, data, isLoading, error, handleTabChange } = useCategoryData("expense");

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
                <CategoryCard key={category.category_id} category={category} />
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default CategoryPage;
