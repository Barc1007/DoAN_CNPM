import React from "react";
import { Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import { formatMoney } from "../../../../utils/formatMoney";
import type { BudgetSummaryData } from "../../types/budget";
import styles from "./BudgetCard.module.css";

interface BudgetCardProps {
  budget: BudgetSummaryData;
  index?: number;
  onEdit?: (budget: BudgetSummaryData) => void;
  onDelete?: (budget: BudgetSummaryData) => void;
}

const toneOptions = ["teal", "coral", "yellow", "violet"] as const;
type Tone = (typeof toneOptions)[number];

const toneMap: Record<Tone, string> = {
  teal: "#14b8a6",
  coral: "#f43f5e",
  yellow: "#f59e0b",
  violet: "#8b5cf6",
};

const formatDateRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) => `${d.getDate()} thg ${d.getMonth() + 1}`;
  return `${fmt(s)} – ${fmt(e)}`;
};

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, index = 0, onEdit, onDelete }) => {
  const { usage_percent, limit_amount, spent_amount, alert, is_expired, is_active } = budget;
  const remaining = limit_amount - spent_amount;
  const isOver = usage_percent >= 100;
  const isNear = !isOver && usage_percent >= alert;
  const tone = toneOptions[index % toneOptions.length];

  const progressColor = isOver ? "#ef4444" : isNear ? "#f59e0b" : toneMap[tone];

  let statusLabel: string;
  if (is_expired) statusLabel = "Đã hết hạn";
  else if (isOver) statusLabel = "Vượt hạn mức";
  else if (isNear) statusLabel = "Gần đạt hạn mức";
  else if (is_active === false) statusLabel = "Chưa bắt đầu";
  else statusLabel = "Trong hạn mức";

  return (
    <article className={`${styles.card} ${styles[tone]}`}>
      <header className={styles.header}>
        <div className={styles.iconBox}>
          {budget.category_id && budget.category_name ? (
            <Wallet size={22} />
          ) : (
            <TrendingUp size={22} />
          )}
        </div>
        <div className={styles.headerText}>
          <h3>{budget.name}</h3>
          <p>
            {budget.category_name
              ? `Danh mục: ${budget.category_name}`
              : "Ngân sách tổng"}
          </p>
        </div>
        {(isOver || isNear) && (
          <div className={styles.badge} style={{ background: progressColor }}>
            <AlertTriangle size={13} />
            {isOver ? "Vượt" : "Gần"}
          </div>
        )}
      </header>

      <div className={styles.progressHeader}>
        <span>Tiến độ chi</span>
        <span
          className={`${styles.percent} ${isOver ? styles.percentOver : ""}`}
          style={{ color: isOver ? undefined : progressColor }}
        >
          {isOver ? (usage_percent - 100).toFixed(1) : usage_percent.toFixed(1)}%
        </span>
      </div>

      <div
        className={styles.track}
        style={{ "--alert": `${Math.min(Math.max(alert, 0), 100)}%` } as React.CSSProperties}
      >
        <div
          className={styles.fill}
          style={{
            width: `${Math.min(usage_percent, 100)}%`,
            background: progressColor,
            borderTopRightRadius: usage_percent >= 100 ? 999 : 0,
            borderBottomRightRadius: usage_percent >= 100 ? 999 : 0,
          }}
        />
        {isOver && (
          <>
            <span className={styles.overRibbon}>
              Vượt {formatMoney(spent_amount - limit_amount)}
            </span>
            <span className={styles.overMarker} title="Đã vượt hạn mức" />
          </>
        )}
        <div
          className={styles.alertMark}
          style={{ left: `${Math.min(Math.max(alert, 0), 100)}%` }}
          title={`Ngưỡng cảnh báo ${alert}%`}
        />
        <span
          className={styles.alertLabel}
          style={{ left: `${Math.min(Math.max(alert, 0), 100)}%` }}
        >
          {alert}%
        </span>
      </div>

      <div className={styles.amounts}>
        <strong style={{ color: progressColor }}>
          {formatMoney(spent_amount)}
        </strong>
        <span>{formatMoney(limit_amount)}</span>
      </div>

      <div className={styles.footer}>
        <div>
          <span className={styles.metaLabel}>
            {remaining >= 0 ? "Còn lại" : "Vượt"}
          </span>
          <strong style={{ color: remaining >= 0 ? "#0f172a" : "#ef4444" }}>
            {formatMoney(Math.abs(remaining))}
          </strong>
        </div>
        <div>
          <span className={styles.metaLabel}>Ngưỡng</span>
          <strong>{alert}%</strong>
        </div>
        <div>
          <span className={styles.metaLabel}>Kỳ</span>
          <strong>{formatDateRange(budget.start_date, budget.end_date)}</strong>
        </div>
      </div>

      <div className={styles.statusRow}>
        <span
          className={styles.statusBadge}
          style={{
            color: progressColor,
            background: `${progressColor}18`,
          }}
        >
          {statusLabel}
        </span>
        <div className={styles.actions}>
          {onEdit && (
            <button
              className={styles.actionBtn}
              onClick={() => onEdit(budget)}
            >
              Sửa
            </button>
          )}
          {onDelete && (
            <button
              className={styles.actionBtnDelete}
              onClick={() => onDelete(budget)}
            >
              Xoá
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default BudgetCard;
