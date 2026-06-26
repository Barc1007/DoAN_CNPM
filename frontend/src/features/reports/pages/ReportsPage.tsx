import React from "react";
import MainLayout from "../../../layouts/MainLayout";
import ReportPeriodTabs from "../components/ReportPeriodTabs/ReportPeriodTabs";
import ReportSummaryCards from "../components/ReportSummaryCards/ReportSummaryCards";
import CashflowBarChart from "../components/CashflowBarChart/CashflowBarChart";
import CategoryPieChart from "../components/CategoryPieChart/CategoryPieChart";
import ExpenseTrendChart from "../components/ExpenseTrendChart/ExpenseTrendChart";
import CategoryBreakdownTable from "../components/CategoryBreakdownTable/CategoryBreakdownTable";
import { useReportData } from "../hooks/useReportData";
import styles from "./ReportsPage.module.css";

const ReportsPage: React.FC = () => {
  const {
    period,
    data,
    isLoading,
    error,
    setPeriod,
  } = useReportData("month");

  return (
    <MainLayout>
      <div className={styles.page}>
        <ReportPeriodTabs activePeriod={period} onPeriodChange={setPeriod} />

        {isLoading && <div className={styles.state}>Đang tải dữ liệu báo cáo...</div>}
        {error && !isLoading && <div className={styles.state}>{error}</div>}

        {data && !isLoading && !error && (
          <>
            <ReportSummaryCards summary={data.summary} />

            <div className={styles.chartGrid}>
              <CashflowBarChart data={data.cashflow} />
              <CategoryPieChart data={data.category_breakdown} />
            </div>

            <ExpenseTrendChart data={data.expense_trend} />
            <CategoryBreakdownTable data={data.category_breakdown} />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ReportsPage;