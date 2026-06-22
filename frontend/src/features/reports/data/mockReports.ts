import type { ReportData, ReportPeriod } from "../types/report";

export const MOCK_REPORTS: Record<ReportPeriod, ReportData> = {
  week: {
    period: "week",
    summary: {
      total_income: 5200000,
      total_expense: 2650000,
      balance: 2550000,
      savings_rate: 49.0,
    },
    cashflow: [
      { label: "T2", income: 1200000, expense: 420000 },
      { label: "T3", income: 0, expense: 360000 },
      { label: "T4", income: 2000000, expense: 510000 },
      { label: "T5", income: 0, expense: 280000 },
      { label: "T6", income: 1500000, expense: 620000 },
      { label: "T7", income: 500000, expense: 310000 },
      { label: "CN", income: 0, expense: 150000 },
    ],
    category_breakdown: [
      { category_id: 3, name: "Ăn uống", amount: 820000, percentage: 30.9, previous_change: 4, color: "#2f8f89" },
      { category_id: 5, name: "Đi lại", amount: 480000, percentage: 18.1, previous_change: -2, color: "#b87935" },
      { category_id: 6, name: "Giải trí", amount: 420000, percentage: 15.8, previous_change: 8, color: "#a65f7a" },
      { category_id: 7, name: "Hóa đơn", amount: 550000, percentage: 20.8, previous_change: 1, color: "#4f6f9f" },
      { category_id: 8, name: "Khác", amount: 380000, percentage: 14.4, previous_change: -5, color: "#6f638f" },
    ],
    expense_trend: [
      { date: "T2", amount: 420000 },
      { date: "T3", amount: 360000 },
      { date: "T4", amount: 510000 },
      { date: "T5", amount: 280000 },
      { date: "T6", amount: 620000 },
      { date: "T7", amount: 310000 },
      { date: "CN", amount: 150000 },
    ],
  },
  month: {
    period: "month",
    summary: {
      total_income: 19500000,
      total_expense: 14800000,
      balance: 4700000,
      savings_rate: 24.1,
    },
    cashflow: [
      { label: "T1", income: 4200000, expense: 3000000 },
      { label: "T2", income: 5600000, expense: 3600000 },
      { label: "T3", income: 4700000, expense: 3200000 },
      { label: "T4", income: 5000000, expense: 5000000 },
    ],
    category_breakdown: [
      { category_id: 2, name: "Học phí", amount: 5600000, percentage: 37.8, previous_change: -1, color: "#4f6f9f" },
      { category_id: 1, name: "Thuê nhà", amount: 3400000, percentage: 23.0, previous_change: 2, color: "#b87935" },
      { category_id: 3, name: "Ăn uống", amount: 2700000, percentage: 18.2, previous_change: 1, color: "#2f8f89" },
      { category_id: 6, name: "Giải trí", amount: 1800000, percentage: 12.2, previous_change: 10, color: "#a65f7a" },
      { category_id: 8, name: "Khác", amount: 1300000, percentage: 8.8, previous_change: -3, color: "#6f638f" },
    ],
    expense_trend: [
      { date: "11/4", amount: 1200000 },
      { date: "12/4", amount: 850000 },
      { date: "13/4", amount: 1500000 },
      { date: "14/4", amount: 930000 },
      { date: "15/4", amount: 2050000 },
      { date: "16/4", amount: 1050000 },
      { date: "17/4", amount: 1300000 },
    ],
  },
  quarter: {
    period: "quarter",
    summary: {
      total_income: 58500000,
      total_expense: 42100000,
      balance: 16400000,
      savings_rate: 28.0,
    },
    cashflow: [
      { label: "Tháng 1", income: 19000000, expense: 12900000 },
      { label: "Tháng 2", income: 18500000, expense: 13600000 },
      { label: "Tháng 3", income: 21000000, expense: 15600000 },
    ],
    category_breakdown: [
      { category_id: 2, name: "Học phí", amount: 15200000, percentage: 36.1, previous_change: -4, color: "#4f6f9f" },
      { category_id: 1, name: "Thuê nhà", amount: 9800000, percentage: 23.3, previous_change: 1, color: "#b87935" },
      { category_id: 3, name: "Ăn uống", amount: 7600000, percentage: 18.1, previous_change: 5, color: "#2f8f89" },
      { category_id: 5, name: "Đi lại", amount: 4200000, percentage: 10.0, previous_change: -2, color: "#596f99" },
      { category_id: 8, name: "Khác", amount: 5300000, percentage: 12.5, previous_change: 6, color: "#6f638f" },
    ],
    expense_trend: [
      { date: "Tuần 1", amount: 9200000 },
      { date: "Tuần 2", amount: 11100000 },
      { date: "Tuần 3", amount: 8700000 },
      { date: "Tuần 4", amount: 13100000 },
    ],
  },
  year: {
    period: "year",
    summary: {
      total_income: 234000000,
      total_expense: 171600000,
      balance: 62400000,
      savings_rate: 26.7,
    },
    cashflow: [
      { label: "Q1", income: 58500000, expense: 42100000 },
      { label: "Q2", income: 61200000, expense: 46300000 },
      { label: "Q3", income: 54800000, expense: 39400000 },
      { label: "Q4", income: 59500000, expense: 43800000 },
    ],
    category_breakdown: [
      { category_id: 2, name: "Học phí", amount: 62000000, percentage: 36.1, previous_change: 4, color: "#4f6f9f" },
      { category_id: 1, name: "Thuê nhà", amount: 40800000, percentage: 23.8, previous_change: 0, color: "#b87935" },
      { category_id: 3, name: "Ăn uống", amount: 31200000, percentage: 18.2, previous_change: 7, color: "#2f8f89" },
      { category_id: 6, name: "Giải trí", amount: 19600000, percentage: 11.4, previous_change: 12, color: "#a65f7a" },
      { category_id: 8, name: "Khác", amount: 18000000, percentage: 10.5, previous_change: -3, color: "#6f638f" },
    ],
    expense_trend: [
      { date: "T1", amount: 12900000 },
      { date: "T2", amount: 13600000 },
      { date: "T3", amount: 15600000 },
      { date: "T4", amount: 14100000 },
      { date: "T5", amount: 16100000 },
      { date: "T6", amount: 16100000 },
      { date: "T7", amount: 12400000 },
      { date: "T8", amount: 13700000 },
      { date: "T9", amount: 13300000 },
      { date: "T10", amount: 14200000 },
      { date: "T11", amount: 15300000 },
      { date: "T12", amount: 14300000 },
    ],
  },
};

export const cloneReportData = (period: ReportPeriod): ReportData => {
  const report = MOCK_REPORTS[period];

  return {
    period: report.period,
    summary: { ...report.summary },
    cashflow: report.cashflow.map((point) => ({ ...point })),
    category_breakdown: report.category_breakdown.map((item) => ({ ...item })),
    expense_trend: report.expense_trend.map((point) => ({ ...point })),
  };
};
