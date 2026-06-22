import React from "react";
import { ArrowDownRight, ArrowUpRight, PiggyBank, WalletCards } from "lucide-react";
import { formatMoney } from "../../../../utils/formatMoney";
import styles from "./ReportSummaryCards.module.css";
import type { ReportSummary } from "../../types/report";

interface ReportSummaryCardsProps {
  summary: ReportSummary;
}

const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      label: "Tổng thu nhập",
      value: formatMoney(summary.total_income),
      icon: ArrowUpRight,
      tone: "income",
    },
    {
      label: "Tổng chi tiêu",
      value: formatMoney(summary.total_expense),
      icon: ArrowDownRight,
      tone: "expense",
    },
    {
      label: "Số dư",
      value: formatMoney(summary.balance),
      icon: WalletCards,
      tone: "balance",
    },
    {
      label: "Tỷ lệ tiết kiệm",
      value: `${summary.savings_rate.toFixed(1)}%`,
      icon: PiggyBank,
      tone: "saving",
    },
  ];

  return (
    <section className={styles.grid} aria-label="Tổng quan báo cáo">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article key={card.label} className={`${styles.card} ${styles[card.tone]}`}>
            <div className={styles.cardHeader}>
              <Icon size={18} />
              <span>{card.label}</span>
            </div>
            <strong>{card.value}</strong>
          </article>
        );
      })}
    </section>
  );
};

export default ReportSummaryCards;
