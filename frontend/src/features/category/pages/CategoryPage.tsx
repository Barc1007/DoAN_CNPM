import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CategoryPage.module.css";
import { useCategoryData } from "../hooks/useCategoryData";
import CategoryHeader from "../components/CategoryHeader/CategoryHeader";
import CategorySummary from "../components/CategorySummary/CategorySummary";
import CategoryCard from "../components/CategoryCard/CategoryCard";
import AddCategoryModal from "../components/AddCategoryModal/AddCategoryModal";
import MainLayout from "../../../layouts/MainLayout";

const CategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const {
    type,
    data,
    isLoading,
    error,
    handleTabChange,
    updateCategoryBudget,
    updateCategoryName,
    addCategory,
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
          onAddCategory={() => setShowAddModal(true)}
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

        {showAddModal && (
          <AddCategoryModal
            initialType={type}
            onClose={() => setShowAddModal(false)}
            onSubmit={addCategory}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default CategoryPage;
