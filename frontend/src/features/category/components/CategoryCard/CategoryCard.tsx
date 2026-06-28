import React, { useMemo, useState } from "react";
import {
  Award,
  Banknote,
  BookOpen,
  Bus,
  Check,
  Film,
  Gift,
  Home,
  ListFilter,
  MoreHorizontal,
  Pencil,
  Receipt,
  ShoppingBag,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./CategoryCard.module.css";
import type { CategoryStat } from "../../../../types/category";

interface CategoryCardProps {
  category: CategoryStat;
  onUpdateBudget: (categoryId: number, budgetLimit: number, alertPercent?: number) => void;
  onUpdateCategoryName: (categoryId: number, name: string) => void;
  onDeleteCategory: (categoryId: number, categoryName: string) => void;
  onViewTransactions: (categoryName: string) => void;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  home: Home,
  book: BookOpen,
  food: Utensils,
  shopping: ShoppingBag,
  car: Bus,
  entertainment: Film,
  bill: Receipt,
  other: MoreHorizontal,
  salary: Banknote,
  gift: Gift,
  award: Award,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
};

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onUpdateBudget,
  onUpdateCategoryName,
  onDeleteCategory,
  onViewTransactions,
}) => {
  const [editingMode, setEditingMode] = useState<"budget" | "name" | null>(null);
  const [budgetValue, setBudgetValue] = useState(String(category.budget_limit || ""));
  const [alertValue, setAlertValue] = useState(String(category.alert ?? 80));
  const [nameValue, setNameValue] = useState(category.name);
  const Icon = CATEGORY_ICONS[category.icon || "other"] || MoreHorizontal;
  const isExpense = category.type === "expense";
  const budgetLimit = category.budget_limit || 0;
  const remaining = budgetLimit - category.total_amount;
  const usedRate = budgetLimit > 0 ? category.total_amount / budgetLimit : 0;
  const percentage = isExpense ? usedRate * 100 : category.percentage;
  const progressPercent = Math.min(Math.round(percentage), 100);
  const displayPercentage = Math.min(Math.max(percentage, 0), 100);

  const status = useMemo(() => {
    if (!isExpense) {
      return {
        label: "Nguồn thu",
        pillClassName: styles.statusIncome,
        fillClassName: styles.fillIncome,
      };
    }

    if (budgetLimit <= 0) {
      return {
        label: "Chưa đặt",
        pillClassName: styles.statusNeutral,
        fillClassName: styles.fillNeutral,
      };
    }

    if (usedRate >= 1) {
      return {
        label: "Hết",
        pillClassName: styles.statusDanger,
        fillClassName: styles.fillDanger,
      };
    }

    const alertRatio = (category.alert ?? 80) / 100;
    if (usedRate >= alertRatio) {
      return {
        label: "Gần hết",
        pillClassName: styles.statusWarning,
        fillClassName: styles.fillWarning,
      };
    }

    return {
      label: "Tốt",
      pillClassName: styles.statusOk,
      fillClassName: styles.fillOk,
    };
  }, [budgetLimit, category.alert, isExpense, usedRate]);

  const handleBudgetSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextBudget = Number(budgetValue);
    const nextAlert = Number(alertValue);

    if (!Number.isFinite(nextBudget) || nextBudget < 0) {
      return;
    }

    onUpdateBudget(category.category_id, nextBudget, Number.isFinite(nextAlert) ? nextAlert : undefined);
    setEditingMode(null);
  };

  const handleNameSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!nameValue.trim()) {
      return;
    }

    onUpdateCategoryName(category.category_id, nameValue);
    setEditingMode(null);
  };

  const startBudgetEdit = () => {
    setBudgetValue(String(category.budget_limit || ""));
    setAlertValue(String(category.alert ?? 80));
    setEditingMode("budget");
  };

  const startNameEdit = () => {
    setNameValue(category.name);
    setEditingMode("name");
  };

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.identity}>
          <div
            className={styles.iconContainer}
            style={{ backgroundColor: `${category.color || "#14b8a6"}18`, color: category.color || "#14b8a6" }}
          >
            <Icon size={24} />
          </div>
          <div className={styles.titleGroup}>
            <h3 className={styles.name}>{category.name}</h3>
            <p className={styles.transactionCount}>{category.transaction_count} giao dịch</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          {isExpense ? (
            <button
              type="button"
              className={`${styles.statusPill} ${status.pillClassName} ${styles.statusPillButton}`}
              onClick={startBudgetEdit}
              title={budgetLimit > 0 ? "Chỉnh hạn mức & ngưỡng cảnh báo" : "Đặt hạn mức chi tiêu"}
            >
              {status.label}
            </button>
          ) : (
            <span className={`${styles.statusPill} ${status.pillClassName}`}>{status.label}</span>
          )}
          <button
            className={styles.iconButton}
            type="button"
            aria-label={`Xem giao dịch ${category.name}`}
            title="Xem giao dịch"
            onClick={() => onViewTransactions(category.name)}
          >
            <ListFilter size={16} />
          </button>
          <button
            className={styles.iconButton}
            type="button"
            aria-label={isExpense ? `Sửa tên danh mục ${category.name}` : `Sửa danh mục ${category.name}`}
            title="Sửa tên danh mục"
            onClick={startNameEdit}
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>

      <div className={styles.budgetBlock}>
        <div className={styles.lineItem}>
          <span>{isExpense ? "Đã chi" : "Đã nhận"}</span>
          <strong>{formatCurrency(category.total_amount)}</strong>
        </div>

        <div className={styles.progressBarBg}>
          <div
            className={`${styles.progressBarFill} ${status.fillClassName}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className={styles.lineItem}>
          <span>{isExpense ? "Ngân sách" : "Tỷ trọng"}</span>
          <strong>{isExpense && budgetLimit > 0 ? formatCurrency(budgetLimit) : `${category.percentage.toFixed(1)}%`}</strong>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.footer}>
        <div>
          <span>{isExpense ? (remaining >= 0 ? "Còn lại" : "Vượt mức") : "Danh mục"}</span>
          <strong className={remaining < 0 ? styles.negative : styles.remainingValue}>
            {isExpense && budgetLimit > 0 ? formatCurrency(Math.abs(remaining)) : category.name}
          </strong>
        </div>
        <div className={styles.rate}>
          <span>Tỷ lệ</span>
          <strong>{isExpense && budgetLimit <= 0 ? "0%" : `${displayPercentage.toFixed(1)}%`}</strong>
        </div>
      </div>

      {editingMode === "budget" && isExpense && (
        <form className={styles.editor} onSubmit={handleBudgetSubmit}>
          <label htmlFor={`budget-${category.category_id}`}>Hạn mức tháng (đ)</label>
          <div className={styles.inputRow}>
            <input
              id={`budget-${category.category_id}`}
              min={0}
              step={10000}
              type="number"
              value={budgetValue}
              onChange={(event) => setBudgetValue(event.target.value)}
              placeholder="Ví dụ: 2000000"
            />
          </div>

          <label htmlFor={`alert-${category.category_id}`}>Cảnh báo khi đạt (%)</label>
          <div className={styles.inputRow}>
            <input
              id={`alert-${category.category_id}`}
              min={1}
              max={100}
              step={1}
              type="number"
              value={alertValue}
              onChange={(event) => setAlertValue(event.target.value)}
              placeholder="80"
            />
            <button className={styles.saveButton} type="submit" aria-label="Lưu ngân sách" title="Lưu">
              <Check size={16} />
            </button>
            <button
              className={styles.saveButton}
              type="button"
              aria-label="Hủy chỉnh ngân sách"
              title="Hủy"
              onClick={() => setEditingMode(null)}
            >
              <X size={16} />
            </button>
          </div>
        </form>
      )}

      {editingMode === "name" && (
        <form className={styles.editor} onSubmit={handleNameSubmit}>
          <label htmlFor={`category-name-${category.category_id}`}>Tên danh mục</label>
          <div className={styles.inputRow}>
            <input
              id={`category-name-${category.category_id}`}
              type="text"
              value={nameValue}
              onChange={(event) => setNameValue(event.target.value)}
            />
            <button className={styles.saveButton} type="submit" aria-label="Lưu danh mục" title="Lưu danh mục">
              <Check size={16} />
            </button>
            <button
              className={styles.saveButton}
              type="button"
              aria-label="Hủy sửa danh mục"
              title="Hủy"
              onClick={() => setEditingMode(null)}
            >
              <X size={16} />
            </button>
          </div>
        </form>
      )}

      <div className={styles.quickActions}>
        <button className={styles.editCategoryButton} type="button" onClick={startNameEdit}>
          <Pencil size={14} />
          <span>Sửa tên</span>
        </button>
        <button
          className={`${styles.editCategoryButton} ${styles.deleteTextButton}`}
          type="button"
          onClick={() => onDeleteCategory(category.category_id, category.name)}
        >
          <Trash2 size={14} />
          <span>Xoá</span>
        </button>
      </div>
    </article>
  );
};

export default CategoryCard;
