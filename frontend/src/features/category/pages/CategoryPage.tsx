import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CategoryPage.module.css";
import { useCategoryData } from "../hooks/useCategoryData";
import CategoryHeader from "../components/CategoryHeader/CategoryHeader";
import { categoryService } from "../services/categoryService";
import AddCategoryModal from "../components/AddCategoryModal/AddCategoryModal";
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
    refetch,
  } = useCategoryData("expense");

  const [showAddModal, setShowAddModal] = useState(false);

  const handleViewTransactions = (categoryName: string) => {
    navigate(`/transactions?category=${encodeURIComponent(categoryName)}`);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm('Bạn có chắc muốn xoá danh mục này?')) return;
    try {
      await categoryService.deleteCategory(categoryId);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xoá danh mục');
    }
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
          onAdd={() => setShowAddModal(true)}
        />

        {showAddModal && (
          <AddCategoryModal
            defaultType={type}
            onClose={() => setShowAddModal(false)}
            onCreated={() => {
              setShowAddModal(false);
              // refresh data
              refetch();
            }}
          />
        )}

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
                  onDelete={handleDeleteCategory}
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
