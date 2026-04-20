import type { DashboardSummary } from "../types/dashboard";

export const MOCK_DASHBOARD_DATA: DashboardSummary = {
  totalBalance: 12450000,
  totalIncome: 15000000,
  totalExpense: 2550000,
  savingsGoal: {
    id: "goal-1",
    title: "Mua laptop mới",
    description: "Cho học tập và làm việc",
    currentAmount: 12450000,
    targetAmount: 15000000,
    percentage: 83,
  },
  categorySpent: [
    { name: "Ăn uống", amount: 800000, percentage: 31.4, color: "#FF6B6B" },
    { name: "Nhà trọ", amount: 1200000, percentage: 47.1, color: "#4ECDC4" },
    { name: "Học phí", amount: 0, percentage: 0.0, color: "#FFE66D" },
    { name: "Giải trí", amount: 350000, percentage: 13.7, color: "#A29BFE" },
  ],
  recentTransactions: [
    {
      id: "t1",
      title: "Cơm trưa quán gần trường",
      amount: 35000,
      type: "expense",
      category: "Ăn uống",
      date: "2026-04-14",
    },
    {
      id: "t2",
      title: "Học bổng tháng này",
      amount: 2000000,
      type: "income",
      category: "Thu nhập",
      date: "2026-04-13",
    },
    {
      id: "t3",
      title: "Cafe với bạn",
      amount: 50000,
      type: "expense",
      category: "Giải trí",
      date: "2026-04-12",
    },
    {
      id: "t4",
      title: "Xe buýt tuần này",
      amount: 40000,
      type: "expense",
      category: "Di chuyển",
      date: "2026-04-11",
    },
  ],
};
