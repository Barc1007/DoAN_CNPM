import React from "react";
import { Plus } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";
import AddGoalButton from "../components/AddGoalButton/AddGoalButton";
import GoalCard from "../components/GoalCard/GoalCard";
import GoalProgressOverview from "../components/GoalProgressOverview/GoalProgressOverview";
import GoalSummaryCards from "../components/GoalSummaryCards/GoalSummaryCards";
import { useGoals } from "../hooks/useGoals";
import styles from "./GoalsPage.module.css";

const GoalsPage: React.FC = () => {
  const { goals, summary, isLoading, error } = useGoals();

  if (isLoading) {
    return (
      <MainLayout>
        <div className={styles.state}>Đang tải dữ liệu mục tiêu...</div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className={styles.state}>{error}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Mục tiêu tiết kiệm</h1>
          <p>Lập kế hoạch và theo dõi các mục tiêu tiết kiệm của bạn</p>
        </header>

        <GoalSummaryCards summary={summary} />
        <GoalProgressOverview summary={summary} />

        <section className={styles.goalGrid} aria-label="Danh sách mục tiêu">
          {goals.map((goal, index) => (
            <GoalCard key={goal.goal_id} goal={goal} index={index} />
          ))}
        </section>

        <AddGoalButton />

        <button className={styles.fab} type="button" aria-label="Thêm mục tiêu">
          <Plus size={28} />
        </button>
      </div>
    </MainLayout>
  );
};

export default GoalsPage;
