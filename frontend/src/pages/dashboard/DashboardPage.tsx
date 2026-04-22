import React from "react";
import MainLayout from "../../layouts/MainLayout";
import SummaryCard from "../../features/dashboard/components/SummaryCard";
import GoalCard from "../../features/dashboard/components/GoalCard";
import ChartCard from "../../features/dashboard/components/ChartCard";
import TransactionList from "../../features/dashboard/components/TransactionList";
import { useDashboardData } from "../../features/dashboard/hooks/useDashboardData";
import { formatDate } from "../../utils/formatDate";
import { Plus } from "lucide-react";
import styles from "./DashboardPage.module.css";

const DashboardPage: React.FC = () => {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <MainLayout>
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout>
        <div className={styles.error}>Lỗi: {error || "Không có dữ liệu"}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <header className={styles.header}>
        <h1 className={styles.greeting}>Xin chào, Sinh viên! 👋</h1>
        <p className={styles.date}>Hôm nay là ngày {formatDate(new Date())}</p>
      </header>

      <div className={styles.grid}>
        <section className={styles.leftColumn}>
          <SummaryCard 
            totalBalance={data.totalBalance}
            totalIncome={data.totalIncome}
            totalExpense={data.totalExpense}
          />
          <ChartCard 
            data={data.categorySpent}
            totalExpense={data.totalExpense}
          />
        </section>

        <section className={styles.rightColumn}>
          <GoalCard {...data.savingsGoal} />
          <TransactionList transactions={data.recentTransactions} />
        </section>
      </div>

      <button className={styles.fab}>
        <Plus size={32} />
      </button>
    </MainLayout>
  );
};

export default DashboardPage;
