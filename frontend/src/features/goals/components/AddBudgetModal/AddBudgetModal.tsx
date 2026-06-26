import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { categoryService } from "../../../category/services/categoryService";
import { budgetService } from "../../../category/services/budgetService";
import type { BudgetPayload } from "../../../category/services/budgetService";
import type { Category } from "../../../types/category";
import styles from "./AddBudgetModal.module.css";

interface AddBudgetModalProps {
  onClose: () => void;
  onCreated?: () => void;
  onUpdated?: () => void;
  existingBudget?: {
    budget_id: number;
    name: string;
    category_id: number | null;
    limit_amount: number;
    start_date: string;
    end_date: string;
    alert: number;
  } | null;
}

const now = new Date();
const getDefaultPeriod = () => {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, "0")}-${lastDay}`;
  return { start, end };
};

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  onClose,
  onCreated,
  onUpdated,
  existingBudget,
}) => {
  const isEdit = !!existingBudget;
  const defaultPeriod = getDefaultPeriod();

  const [name, setName] = useState(existingBudget?.name ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(
    existingBudget?.category_id ?? null
  );
  const [limitAmount, setLimitAmount] = useState(
    existingBudget?.limit_amount?.toString() ?? ""
  );
  const [startDate, setStartDate] = useState(
    existingBudget?.start_date?.slice(0, 10) ?? defaultPeriod.start
  );
  const [endDate, setEndDate] = useState(
    existingBudget?.end_date?.slice(0, 10) ?? defaultPeriod.end
  );
  const [alert, setAlert] = useState(existingBudget?.alert ?? 80);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCats = async () => {
      try {
        setLoadingCats(true);
        const data = await categoryService.getCategoryData("expense");
        setCategories(data.categories);
      } catch {
        // non-critical
      } finally {
        setLoadingCats(false);
      }
    };
    loadCats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Vui lòng nhập tên ngân sách");
      return;
    }

    const limit = parseFloat(limitAmount.replace(/[^0-9.]/g, ""));
    if (isNaN(limit) || limit <= 0) {
      setError("Hạn mức phải lớn hơn 0");
      return;
    }

    if (!startDate || !endDate) {
      setError("Vui lòng chọn khoảng thời gian");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    const payload: BudgetPayload = {
      name: name.trim(),
      limit_amount: limit,
      category_id: categoryId,
      start_date: startDate,
      end_date: endDate,
      alert,
    };

    try {
      setLoading(true);
      if (isEdit && existingBudget) {
        await budgetService.updateBudget(existingBudget.budget_id, payload);
        onUpdated?.();
      } else {
        await budgetService.createBudget(payload);
        onCreated?.();
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể lưu ngân sách");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{isEdit ? "Sửa ngân sách" : "Thêm ngân sách mới"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Tên ngân sách</label>
            <input
              placeholder="VD: Ngân sách tháng 6"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Danh mục (tùy chọn)</label>
            <select
              value={categoryId ?? ""}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : null)
              }
              disabled={loadingCats}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Hạn mức (đ)</label>
            <input
              type="number"
              placeholder="VD: 5000000"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              required
              min="0"
            />
          </div>

          <div className={styles.rows}>
            <div className={styles.field}>
              <label>Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Ngưỡng cảnh báo: {alert}%</label>
            <input
              type="range"
              min="50"
              max="100"
              value={alert}
              onChange={(e) => setAlert(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>50%</span>
              <span
                style={{
                  color:
                    alert === 100
                      ? "#ef4444"
                      : alert >= 80
                        ? "#f59e0b"
                        : "#10b981",
                  fontWeight: 700,
                }}
              >
                {alert}%
              </span>
              <span>100%</span>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading
              ? "Đang lưu..."
              : isEdit
                ? "Lưu thay đổi"
                : "Tạo ngân sách"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBudgetModal;
