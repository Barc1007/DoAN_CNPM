import React, { useCallback, useEffect, useState } from "react";
import { Plus, PieChart, Trash2 } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";
import { budgetService, type Budget } from "../services/budgetService";
import { categoryService } from "../../category/services/categoryService";
import type { CategoryStat } from "../../../types/category";
import { formatShortDate } from "../../../utils/formatDate";
import styles from "./FeaturePage.module.css";
import modalStyles from "../../wallet/components/AddWalletModal/AddWalletModal.module.css";

const BudgetPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [budgetList, catData] = await Promise.all([
        budgetService.getBudgets(),
        categoryService.getCategoryData("expense"),
      ]);
      setBudgets(budgetList);
      setCategories(catData.categories);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi tải ngân sách");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xoá ngân sách này?")) return;
    await budgetService.deleteBudget(id);
    setBudgets((prev) => prev.filter((b) => b.budget_id !== id));
  };

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <PageTitle icon={<PieChart size={24} />} title="Ngân sách" subtitle="Theo dõi hạn mức chi tiêu theo danh mục" />
          <button className={styles.addBtn} onClick={() => setShowModal(true)}>
            <Plus size={18} /> Thêm ngân sách
          </button>
        </header>

        {loading && <p className={styles.hint}>Đang tải...</p>}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.grid}>
          {budgets.map((b) => {
            const pct = b.usage_percent ?? 0;
            const displayPct = Math.min(Math.max(pct, 0), 100);
            const overAlert = pct >= (b.alert ?? 80);
            return (
              <div key={b.budget_id} className={styles.card}>
                <CardTop
                  title={b.name}
                  subtitle={b.category_name || "Tất cả danh mục chi"}
                  onDelete={() => handleDelete(b.budget_id)}
                />
                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressFill} ${overAlert ? styles.progressDanger : ""}`}
                    style={{ width: `${displayPct}%` }}
                  />
                </div>
                <p className={styles.amountRow}>
                  <span>{Number(b.spent_amount).toLocaleString("vi-VN")} đ</span>
                  <span>/ {Number(b.limit_amount).toLocaleString("vi-VN")} đ</span>
                </p>
                <p className={styles.meta}>
                  {displayPct}% đã dùng · {formatShortDate(b.start_date)} → {formatShortDate(b.end_date)}
                </p>
              </div>
            );
          })}
        </div>

        {!loading && budgets.length === 0 && (
          <p className={styles.empty}>Chưa có ngân sách. Nhấn &quot;Thêm ngân sách&quot; để bắt đầu.</p>
        )}
      </div>

      {showModal && (
        <AddBudgetModal
          categories={categories}
          onClose={() => setShowModal(false)}
          onAdded={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </MainLayout>
  );
};

function PageTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h1 className={styles.title}>
        {title} {icon}
      </h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
}

function CardTop({
  title,
  subtitle,
  onDelete,
}: {
  title: string;
  subtitle: string;
  onDelete: () => void;
}) {
  return (
    <div className={styles.cardTop}>
      <CardInfo title={title} subtitle={subtitle} />
      <button type="button" className={styles.iconBtn} onClick={onDelete} title="Xoá">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function CardInfo({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3>{title}</h3>
      <p className={styles.cardSub}>{subtitle}</p>
    </div>
  );
}

interface AddBudgetModalProps {
  categories: CategoryStat[];
  onClose: () => void;
  onAdded: () => void;
}

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  categories,
  onClose,
  onAdded,
}) => {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const toDateInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState(() => toDateInputValue(new Date()));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return toDateInputValue(d);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(limit.replace(/[^0-9.]/g, ""));
    if (!name.trim() || isNaN(parsed) || parsed <= 0) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    try {
      setLoading(true);
      await budgetService.createBudget({
        name: name.trim(),
        limit_amount: parsed,
        category_id: categoryId ? Number(categoryId) : undefined,
        start_date: startDate,
        end_date: endDate,
      });
      onAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi tạo ngân sách");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={modalStyles.modalTitle}>Thêm ngân sách</h2>
        <form className={modalStyles.form} onSubmit={handleSubmit}>
          <input className={modalStyles.input} placeholder="Tên ngân sách" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={modalStyles.input} placeholder="Hạn mức (đ)" value={limit} onChange={(e) => setLimit(e.target.value)} />
          <select className={modalStyles.select} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Tất cả chi tiêu</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>{c.name}</option>
            ))}
          </select>
          <input type="date" className={modalStyles.input} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className={modalStyles.input} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}
          <div className={modalStyles.actions}>
            <button type="button" className={modalStyles.cancelBtn} onClick={onClose}>Huỷ</button>
            <button type="submit" className={modalStyles.submitBtn} disabled={loading}>
              {loading ? "Đang lưu..." : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetPage;
