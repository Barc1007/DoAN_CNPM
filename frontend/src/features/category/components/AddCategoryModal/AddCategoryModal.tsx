import React, { useState } from "react";
import { X } from "lucide-react";
import type { CategoryType } from "../../../../types/category";
import styles from "./AddCategoryModal.module.css";

interface AddCategoryModalProps {
  initialType: CategoryType;
  onClose: () => void;
  onSubmit: (name: string, type: CategoryType, budgetLimit?: number) => Promise<void>;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  initialType,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType | "">(initialType);
  const [budgetLimit, setBudgetLimit] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Tên danh mục không được để trống");
      return;
    }

    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setError("Tên danh mục phải từ 2 đến 50 ký tự");
      return;
    }

    if (!type) {
      setError("Vui lòng chọn loại danh mục");
      return;
    }

    const normalizedBudget = budgetLimit.trim();
    let parsedBudget: number | undefined;

    if (type === "expense" && normalizedBudget) {
      parsedBudget = Number(normalizedBudget);
      if (!Number.isFinite(parsedBudget) || parsedBudget < 0) {
        setError("Ngân sách phải là số hợp lệ và không nhỏ hơn 0");
        return;
      }
    }

    try {
      setLoading(true);
      await onSubmit(trimmedName, type, parsedBudget);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể thêm danh mục");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h2>Thêm danh mục</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="category-name">Tên danh mục</label>
            <input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ví dụ: Cà phê, Làm thêm..."
              minLength={2}
              maxLength={50}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="category-type">Loại danh mục</label>
            <select
              id="category-type"
              value={type}
              onChange={(event) => {
                const nextType = event.target.value as CategoryType | "";
                setType(nextType);
                if (nextType !== "expense") {
                  setBudgetLimit("");
                }
              }}
              required
            >
              <option value="" disabled>Chọn loại danh mục</option>
              <option value="expense">Chi tiêu</option>
              <option value="income">Nguồn thu</option>
            </select>
          </div>

          {type === "expense" && (
            <div className={styles.field}>
              <label htmlFor="category-budget">Ngân sách tháng (tuỳ chọn)</label>
              <input
                id="category-budget"
                type="number"
                min={0}
                step={10000}
                value={budgetLimit}
                onChange={(event) => setBudgetLimit(event.target.value)}
                placeholder="Ví dụ: 2000000"
              />
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Huỷ
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Đang thêm..." : "Thêm danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
