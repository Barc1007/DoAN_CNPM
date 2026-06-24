import { walletService } from "../../wallet/services/walletService";
import { transactionService } from "../../transactions/services/transactionService";
import { goalApi } from "../../goals/services/goalApi";
import type { DashboardSummary, CategorySpend } from "../../../types/dashboard";

const IS_MOCK = false;

export const dashboardService = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    if (IS_MOCK) {
      const { MOCK_DASHBOARD_DATA } = await import("../../../data/mockDashboard");
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_DASHBOARD_DATA;
    }

    // Tải tất cả thông tin ví, giao dịch và mục tiêu tiết kiệm (đã được giải mã bên trong các Service tương ứng)
    const [wallets, transactions, goals] = await Promise.all([
      walletService.getWallets(),
      transactionService.getTransactions(),
      goalApi.getGoals(),
    ]);

    // 1. Tính tổng số dư các ví
    const totalBalance = wallets.reduce((sum, w) => sum + (w.current_balance || 0), 0);

    // 2. Tính tổng thu và chi từ lịch sử giao dịch
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (String(t.type).toUpperCase() === "INCOME") {
        totalIncome += amt;
      } else {
        totalExpense += amt;
      }
    });

    // 3. Lấy 5 giao dịch gần đây nhất
    // Sắp xếp theo ngày giao dịch giảm dần
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
    );
    const recentTransactions = sortedTransactions.slice(0, 5);

    // 4. Phân tích chi tiêu theo danh mục (top 5 danh mục chi tiêu nhiều nhất)
    const expenseTransactions = transactions.filter(
      (t) => String(t.type).toUpperCase() === "EXPENSE"
    );
    
    const categoryMap = new Map<string, number>();
    expenseTransactions.forEach((t) => {
      // Dùng tên danh mục (đã giải mã) làm key
      const catName = t.category_name || "Khác";
      const amt = Number(t.amount) || 0;
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + amt);
    });

    const categoryList = Array.from(categoryMap.entries()).map(([name, val]) => ({
      name,
      amount: val,
    }));

    // Sắp xếp giảm dần theo số tiền tiêu dùng
    categoryList.sort((a, b) => b.amount - a.amount);

    const colors = ["#4ECDC4", "#FF6B6B", "#FFE66D", "#A29BFE", "#FD79A8"];
    const categorySpent: CategorySpend[] = categoryList.slice(0, 5).map((item, index) => ({
      name: item.name,
      amount: item.amount,
      percentage: totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100 * 10) / 10 : 0,
      color: colors[index % colors.length],
    }));

    // 5. Lấy mục tiêu tiết kiệm hoạt động gần nhất
    const activeGoal = goals.find((g) => g.status === "active");
    const savingsGoal = activeGoal
      ? {
          saving_goal_id: activeGoal.goal_id,
          name: activeGoal.name,
          target_amount: Number(activeGoal.target_amount) || 0,
          current_amount: Number(activeGoal.current_amount) || 0,
          end_date: activeGoal.end_date || new Date().toISOString(),
        }
      : {
          saving_goal_id: 0,
          name: "Chưa có mục tiêu",
          target_amount: 0,
          current_amount: 0,
          end_date: new Date().toISOString(),
        };

    return {
      total_balance: totalBalance,
      total_income: totalIncome,
      total_expense: totalExpense,
      recent_transactions: recentTransactions,
      category_spent: categorySpent,
      savings_goal: savingsGoal,
    };
  },
};
