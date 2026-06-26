import React from "react";
import MainLayout from "../../../layouts/MainLayout";
import SummaryCard from "../components/SummaryCard";
import GoalCard from "../components/GoalCard";
import ChartCard from "../components/ChartCard";
import TransactionList from "../components/TransactionList";
import { useDashboardData } from "../hooks/useDashboardData";
import { formatDate } from "../../../utils/formatDate";
import styles from "./DashboardPage.module.css";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { getGoalMetrics } from "../../goals/utils/goalMetrics";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
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

  const goalMetrics = getGoalMetrics(data.savings_goal);
  const goalDeadline = data.savings_goal.end_date
    ? formatDate(new Date(data.savings_goal.end_date))
    : "Chưa có hạn chót";

  return (
    <MainLayout>
      <header className={styles.header}>
        <h1 className={styles.greeting}>Xin chào, {user?.full_name || user?.username || "Sinh viên"}! 👋</h1>
        <p className={styles.date}>Hôm nay là ngày {formatDate(new Date())}</p>
      </header>

      <div className={styles.grid}>
        <section className={styles.leftColumn}>
          <SummaryCard 
            total_balance={data.total_balance}
            total_income={data.total_income}
            total_expense={data.total_expense}
          />
          <ChartCard 
            category_spent={data.category_spent}
            total_expense={data.total_expense}
          />
        </section>

        <section className={styles.rightColumn}>
          <GoalCard 
            name={data.savings_goal.name}
            description={`Hạn chót: ${goalDeadline}`}
            current_amount={data.savings_goal.current_amount}
            target_amount={data.savings_goal.target_amount}
            percentage={Math.round(goalMetrics.progressPercent)}
          />
          <TransactionList transactions={data.recent_transactions} />
        </section>
      </div>

    </MainLayout>
  );
};

export default DashboardPage;
