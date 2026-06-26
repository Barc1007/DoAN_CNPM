import React from "react";
import { AlertTriangle, PiggyBank, ReceiptText, Target } from "lucide-react";
import styles from "./CategorySummary.module.css";
import type { CategoryData, CategoryType } from "../../../../types/category";

interface CategorySummaryProps {
  summary: CategoryData['summary'];
  type: CategoryType;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
};

const CategorySummary: React.FC<CategorySummaryProps> = ({ summary, type }) => {
  const isExpense = type === "expense";
  const budget = summary.budget;
  const remaining = budget?.total_remaining ?? 0;

  const metrics = isExpense && budget
    ? [
        {
          label: "Ngân sách",
          value: formatCurrency(budget.total_budget),
          icon: Target,
          tone: "budget",
        },
        {
          label: remaining >= 0 ? "Còn lại" : "Vượt mức",
          value: formatCurrency(Math.abs(remaining)),
          icon: PiggyBank,
          tone: remaining >= 0 ? "safe" : "danger",
        },
        {
          label: "Cần chú ý",
          value: `${budget.over_budget_categories + budget.near_limit_categories} danh mục`,
          icon: AlertTriangle,
          tone: budget.over_budget_categories > 0 ? "danger" : "warning",
        },
      ]
    : [
        {
          label: "Nguồn thu",
          value: `${summary.total_categories} danh mục`,
          icon: Target,
          tone: "budget",
        },
        {
          label: "Trung bình",
          value: formatCurrency(summary.average_per_category),
          icon: PiggyBank,
          tone: "safe",
        },
        {
          label: "Nhiều nhất",
          value: summary.top_category_name,
          icon: ReceiptText,
          tone: "budget",
        },
      ];

  return (
    <section className={styles.container} aria-label="Tổng quan danh mục">
      <article className={styles.primaryCard}>
        <div className={styles.primaryIcon}>
          <ReceiptText size={22} />
        </div>
        <div>
          <span className={styles.label}>{isExpense ? "Đã chi tháng này" : "Thu nhập tháng này"}</span>
          <strong className={styles.primaryValue}>{formatCurrency(summary.total_amount)}</strong>
          <p className={styles.meta}>{summary.total_transactions} giao dịch</p>
        </div>
      </article>

      <div className={styles.metricList}>
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article key={metric.label} className={`${styles.metricCard} ${styles[metric.tone]}`}>
              <div className={styles.metricIcon}>
                <Icon size={18} />
              </div>
              <div>
                <span className={styles.label}>{metric.label}</span>
                <strong className={styles.metricValue}>{metric.value}</strong>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default CategorySummary;
