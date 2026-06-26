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
import { useBudgets } from "../hooks/useBudgets";
import type { SavingGoal } from "../types/goal";
import type { BudgetSummaryData } from "../types/budget";
import BudgetCard from "../components/BudgetCard/BudgetCard";
import BudgetSummaryCards from "../components/BudgetSummaryCards/BudgetSummaryCards";
import AddBudgetModal from "../components/AddBudgetModal/AddBudgetModal";
import styles from "./GoalsPage.module.css";
import tabStyles from "./GoalsPageTabs.module.css";

type Tab = "goals" | "budgets";

const GoalsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>("goals");

  /* ---- Goals state ---- */
  const { goals, summary: goalSummary, isLoading: goalsLoading, error: goalsError, refresh: refreshGoals, setGoals } = useGoals();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<SavingGoal | null>(null);

  /* ---- Budgets state ---- */
  const { budgets, summary: budgetSummary, isLoading: budgetsLoading, error: budgetsError, refresh: refreshBudgets, setBudgets } = useBudgets();
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetSummaryData | null>(null);

  const isLoading = tab === "goals" ? goalsLoading : budgetsLoading;
  const error = tab === "goals" ? goalsError : budgetsError;

  if (isLoading) {
    return (
      <MainLayout>
        <div className={tabStyles.state}>Đang tải dữ liệu...</div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className={tabStyles.state}>{error}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Ngân sách & Mục tiêu</h1>
          <p>Quản lý chi tiêu và theo dõi mục tiêu tiết kiệm</p>
        </header>

        {/* Tab navigation */}
        <nav className={tabStyles.tabs} aria-label="Chuyển đổi chế độ xem">
          <button
            className={`${tabStyles.tab} ${tab === "goals" ? tabStyles.active : ""}`}
            onClick={() => setTab("goals")}
            type="button"
          >
            Mục tiêu tiết kiệm
          </button>
          <button
            className={`${tabStyles.tab} ${tab === "budgets" ? tabStyles.active : ""}`}
            onClick={() => setTab("budgets")}
            type="button"
          >
            Ngân sách
          </button>
        </nav>

        {/* ===== GOALS TAB ===== */}
        {tab === "goals" && (
          <>
            <GoalSummaryCards summary={goalSummary} />
            <GoalProgressOverview summary={goalSummary} />

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
                    const g = goals.find((g) => g.goal_id === goalId);
                    if (g) setContributingGoal(g);
                  }}
                />
              ))}
            </section>

            <AddGoalButton onClick={() => setShowAddGoal(true)} />

            {showAddGoal && (
              <AddGoalModal onClose={() => setShowAddGoal(false)} onCreated={refreshGoals} />
            )}

            {editingGoal && (
              <EditGoalModal
                goal={editingGoal}
                onClose={() => setEditingGoal(null)}
                onUpdated={(updated) => {
                  setGoals((prev: SavingGoal[]) =>
                    prev.map((g) => (g.goal_id === updated.goal_id ? updated : g))
                  );
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
                  setGoals((prev: SavingGoal[]) =>
                    prev.map((g) => (g.goal_id === updated.goal_id ? updated : g))
                  );
                }}
              />
            )}

            <button
              className={styles.fab}
              type="button"
              aria-label="Thêm mục tiêu"
              onClick={() => setShowAddGoal(true)}
            >
              <Plus size={28} />
            </button>
          </>
        )}

        {/* ===== BUDGETS TAB ===== */}
        {tab === "budgets" && (
          <>
            <BudgetSummaryCards summary={budgetSummary} />

            {budgets.length === 0 ? (
              <div className={tabStyles.empty}>
                <p>Chưa có ngân sách nào.</p>
                <p>Hãy tạo ngân sách để theo dõi chi tiêu của bạn.</p>
                <button
                  className={tabStyles.emptyBtn}
                  type="button"
                  onClick={() => setShowAddBudget(true)}
                >
                  Tạo ngân sách đầu tiên
                </button>
              </div>
            ) : (
              <section className={tabStyles.budgetGrid} aria-label="Danh sách ngân sách">
                {budgets.map((budget, index) => (
                  <BudgetCard
                    key={budget.budget_id}
                    budget={budget}
                    index={index}
                    onEdit={(b) => setEditingBudget(b)}
                    onDelete={(b) => {
                      if (window.confirm(`Xoá ngân sách "${b.name}"?`)) {
                        const deleteBudget = async () => {
                          await import("../../category/services/budgetService")
                            .then((m) => m.budgetService.deleteBudget(b.budget_id));
                          refreshBudgets();
                        };
                        deleteBudget();
                      }
                    }}
                  />
                ))}
              </section>
            )}

            <button
              className={styles.fab}
              type="button"
              aria-label="Thêm ngân sách"
              onClick={() => setShowAddBudget(true)}
            >
              <Plus size={28} />
            </button>

            {showAddBudget && (
              <AddBudgetModal
                onClose={() => setShowAddBudget(false)}
                onCreated={refreshBudgets}
              />
            )}

            {editingBudget && (
              <AddBudgetModal
                existingBudget={editingBudget}
                onClose={() => setEditingBudget(null)}
                onUpdated={refreshBudgets}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default GoalsPage;
