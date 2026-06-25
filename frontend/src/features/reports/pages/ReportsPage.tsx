import React from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useDashboardData } from "../../dashboard/hooks/useDashboardData";
import { getGoalMetrics } from "../../goals/utils/goalMetrics";
import styles from "./ReportsPage.module.css";

const ReportsPage: React.FC = () => {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <MainLayout>
        <div className={styles.loading}>Đang tải báo cáo...</div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout>
        <div className={styles.error}>{error || "Không có dữ liệu"}</div>
      </MainLayout>
    );
  }

  const goalMetrics = getGoalMetrics(data.savings_goal);

  return (
    <MainLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Báo cáo</h1>
          <p className={styles.subtitle}>Tổng quan tài chính của bạn</p>
        </div>

        <div className={styles.summaryGrid}>
          <div className={`${styles.summaryCard} ${styles.balanceCard}`}>
            <h3>Tổng số dư</h3>
            <p className={styles.bigNumber}>{data.total_balance.toLocaleString('vi-VN')} đ</p>
          </div>
          <div className={`${styles.summaryCard} ${styles.incomeCard}`}>
            <h3>Tổng thu nhập</h3>
            <p className={styles.bigNumber}>+{data.total_income.toLocaleString('vi-VN')} đ</p>
          </div>
          <div className={`${styles.summaryCard} ${styles.expenseCard}`}>
            <h3>Tổng chi tiêu</h3>
            <p className={styles.bigNumber}>-{data.total_expense.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Chi tiêu theo danh mục</h2>
          <div className={styles.categoryList}>
            {data.category_spent.map((cat, i) => (
              <div key={i} className={styles.categoryItem}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryName}>{cat.name}</span>
                  <span className={styles.categoryAmount}>{cat.amount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
                <span className={styles.categoryPercent}>{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Mục tiêu tiết kiệm</h2>
          <div className={styles.goalCard}>
            <h3>{data.savings_goal.name}</h3>
            {data.savings_goal.target_amount > 0 ? (
              <>
                <div className={styles.goalProgress}>
                  <div
                    className={styles.goalProgressFill}
                    style={{
                      width: `${goalMetrics.progressPercent}%`,
                    }}
                  />
                </div>
                <p className={styles.goalText}>
                  {data.savings_goal.current_amount.toLocaleString('vi-VN')} đ / {data.savings_goal.target_amount.toLocaleString('vi-VN')} đ
                </p>
              </>
            ) : (
              <p className={styles.noGoal}>Chưa có mục tiêu tiết kiệm</p>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Giao dịch gần đây</h2>
          <div className={styles.transactionList}>
            {data.recent_transactions.map((t) => (
              <div key={t.transaction_id} className={styles.transactionItem}>
                <div className={styles.txLeft}>
                  <span className={styles.txCategory}>{t.category_name}</span>
                  <span className={styles.txDate}>{new Date(t.transaction_date).toLocaleDateString('vi-VN')}</span>
                </div>
                <span className={t.type === 'income' ? styles.txIncome : styles.txExpense}>
                  {t.type === 'income' ? '+' : '-'}{Number(t.amount).toLocaleString('vi-VN')} đ
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
