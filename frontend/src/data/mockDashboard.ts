import type { DashboardSummary } from "../types/dashboard";

export const MOCK_DASHBOARD_DATA: DashboardSummary = {
  totalBalance: 2500000,
  totalIncome: 5000000,
  totalExpense: 2500000,
  savingsGoal: {
    id: "goal-1",
    title: "Mua laptop mới",
    description: "Tiết kiệm tiền để đổi laptop phục vụ làm đồ án",
    currentAmount: 15000000,
    targetAmount: 20000000,
    percentage: 75,
  },
  categorySpent: [
    { name: "Tiền trọ & điện nước", amount: 1500000, percentage: 60.0, color: "#4ECDC4" },
    { name: "Ăn uống 3 bữa", amount: 800000, percentage: 32.0, color: "#FF6B6B" },
    { name: "Cafe/Trà sữa", amount: 150000, percentage: 6.0, color: "#FFE66D" },
    { name: "Nạp thẻ điện thoại", amount: 50000, percentage: 2.0, color: "#A29BFE" },
  ],
  recentTransactions: [
    {
      id: "t1",
      title: "Đóng tiền phòng trọ tháng 4",
      amount: 1500000,
      type: "expense",
      category: "Nhà ở",
      date: "2026-04-14",
    },
    {
      id: "t2",
      title: "Gia đình gửi tiền sinh hoạt",
      amount: 4000000,
      type: "income",
      category: "Thu nhập",
      date: "2026-04-13",
    },
    {
      id: "t3",
      title: "Trà sữa Phúc Long với bạn",
      amount: 55000,
      type: "expense",
      category: "Giải trí",
      date: "2026-04-12",
    },
    {
      id: "t4",
      title: "Nạp tiền điện thoại Viettel",
      amount: 50000,
      type: "expense",
      category: "Liên lạc",
      date: "2026-04-11",
    },
    {
      id: "t5",
      title: "Tiền ăn trưa ở Canteen trường",
      amount: 35000,
      type: "expense",
      category: "Ăn uống",
      date: "2026-04-10",
    },
  ],
};
