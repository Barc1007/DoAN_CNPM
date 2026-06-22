import type { DashboardSummary } from "../types/dashboard";

export const MOCK_DASHBOARD_DATA: DashboardSummary = {
  total_balance: 2500000,
  total_income: 5000000,
  total_expense: 2500000,
  savings_goal: {
    saving_goal_id: 1,
    name: "Mua laptop mới",
    current_amount: 15000000,
    target_amount: 20000000,
    end_date: "2026-12-31",
  },
  category_spent: [
    { name: "Tiền trọ & điện nước", amount: 1500000, percentage: 60.0, color: "#2f8f89" },
    { name: "Ăn uống 3 bữa", amount: 800000, percentage: 32.0, color: "#b95662" },
    { name: "Cafe/Trà sữa", amount: 150000, percentage: 6.0, color: "#b8a15d" },
    { name: "Nạp thẻ điện thoại", amount: 50000, percentage: 2.0, color: "#6f638f" },
  ],
  recent_transactions: [
    {
      transaction_id: 1,
      user_id: 1,
      wallet_id: 1,
      category_id: 5,
      note: "Đóng tiền phòng trọ tháng 4",
      amount: 1500000,
      type: "expense",
      transaction_date: "2026-04-14",
    },
    {
      transaction_id: 2,
      user_id: 1,
      wallet_id: 1,
      category_id: 10, // ID của category 'Thu nhập'
      note: "Gia đình gửi tiền sinh hoạt",
      amount: 4000000,
      type: "income",
      transaction_date: "2026-04-13",
    },
    {
      transaction_id: 3,
      user_id: 1,
      wallet_id: 1,
      category_id: 6, 
      note: "Trà sữa Phúc Long với bạn",
      amount: 55000,
      type: "expense",
      transaction_date: "2026-04-12",
    }
  ],
};
