import React, { useState } from "react";
import { Plus } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";
import AddGoalButton from "../components/AddGoalButton/AddGoalButton";
import GoalCard from "../components/GoalCard/GoalCard";
import GoalProgressOverview from "../components/GoalProgressOverview/GoalProgressOverview";
import GoalSummaryCards from "../components/GoalSummaryCards/GoalSummaryCards";
import AddGoalModal from "../components/AddGoalModal/AddGoalModal";
import EditGoalModal from "../components/EditGoalModal/EditGoalModal";
import ContributeModal from "../components/ContributeModal/ContributeModal";
import { useGoals } from "../hooks/useGoals";
import type { SavingGoal } from "../types/goal";
import styles from "./GoalsPage.module.css";

const GoalsPage: React.FC = () => {
  const { goals, summary, isLoading, error, refresh, setGoals } = useGoals();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<SavingGoal | null>(null);

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
            <GoalCard
              key={goal.goal_id}
              goal={goal}
              index={index}
              onEdit={(g) => setEditingGoal(g)}
              onDelete={(g) => {
                if (window.confirm(`Xoá mục tiêu "${g.name}"?`)) {
                  setEditingGoal(g);
                }
              }}
              onContribute={(goalId) => {
                const goal = goals.find((g) => g.goal_id === goalId);
                if (goal) setContributingGoal(goal);
              }}
            />
          ))}
        </section>

        <AddGoalButton onClick={() => setShowAddGoal(true)} />

        {showAddGoal && (
          <AddGoalModal onClose={() => setShowAddGoal(false)} onCreated={refresh} />
        )}

        {editingGoal && (
          <EditGoalModal
            goal={editingGoal}
            onClose={() => setEditingGoal(null)}
            onUpdated={(updated) => {
              setGoals((prev: SavingGoal[]) => prev.map((g) => g.goal_id === updated.goal_id ? updated : g));
            }}
            onDeleted={(goalId) => {
              setGoals((prev: SavingGoal[]) => prev.filter((g) => g.goal_id !== goalId));
            }}
          />
        )}

        {contributingGoal && (
          <ContributeModal
            goal={contributingGoal}
            onClose={() => setContributingGoal(null)}
            onContributed={(updated) => {
              setGoals((prev: SavingGoal[]) => prev.map((g) => g.goal_id === updated.goal_id ? updated : g));
            }}
          />
        )}

        <button className={styles.fab} type="button" aria-label="Thêm mục tiêu">
          <Plus size={28} />
        </button>
      </div>
    </MainLayout>
  );
};

export default GoalsPage;
