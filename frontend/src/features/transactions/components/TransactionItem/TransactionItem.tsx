import React from "react";
import {
  UtensilsCrossed,
  TrendingUp,
  Coffee,
  Bus,
  ShoppingBag,
  Home,
  Zap,
  Smartphone,
  Receipt,
  HelpCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Transaction } from "../../types/transaction";
import styles from "./TransactionItem.module.css";

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

// Map icon_name string → Lucide component
const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  TrendingUp,
  Coffee,
  Bus,
  ShoppingBag,
  Home,
  Zap,
  Smartphone,
  Receipt,
};

const formatCurrency = (amount: number): string =>
  amount.toLocaleString("vi-VN") + " đ";

const formatDate = (dateStr: string): string => {
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "Không rõ ngày";

  const [, year, month, day] = match;
  return `${day} tháng ${month}, ${year}`;
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit, onDelete }) => {
  const isIncome = String(transaction.type).toLowerCase() === "income";
  const IconComponent = ICON_MAP[transaction.icon_name] ?? HelpCircle;
  const title = transaction.note?.trim() || transaction.category_name || "Giao dịch";

  return (
    <div className={styles.item}>
      {/* Icon */}
      <div
        className={`${styles.iconWrapper} ${
          isIncome ? styles.iconIncome : styles.iconExpense
        }`}
      >
        <IconComponent size={18} />
      </div>

      {/* Info */}
      <div className={styles.info}>
        <p className={styles.categoryName}>{title}</p>
        <p className={styles.meta}>
          <span className={styles.category}>{transaction.category_name}</span>
          <span className={styles.dot}>•</span>
          <span className={styles.date}>{formatDate(transaction.transaction_date)}</span>
        </p>
      </div>

      {/* Amount */}
      <div
        className={`${styles.amount} ${
          isIncome ? styles.amountIncome : styles.amountExpense
        }`}
      >
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </div>

      <button
        type="button"
        className={styles.editButton}
        aria-label="Sửa giao dịch"
        title="Sửa giao dịch"
        onClick={(event) => {
          event.stopPropagation();
          onEdit?.(transaction);
        }}
      >
        <Pencil size={17} />
      </button>

      <button
        type="button"
        className={styles.deleteButton}
        aria-label="Xoá giao dịch"
        title="Xoá giao dịch"
        onClick={(event) => {
          event.stopPropagation();
          onDelete?.(transaction);
        }}
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
};

export default TransactionItem;
