import React, { useState } from "react";
import { X } from "lucide-react";
import type { CategoryType } from "../../../../types/category";
import styles from "./AddCategoryModal.module.css";

interface AddCategoryModalProps {
  initialType: CategoryType;
  onClose: () => void;
  onSubmit: (name: string, type: CategoryType) => Promise<void>;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  initialType,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>(initialType);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(name, type);
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
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="category-type">Loại danh mục</label>
            <select
              id="category-type"
              value={type}
              onChange={(event) => setType(event.target.value as CategoryType)}
            >
              <option value="expense">Chi tiêu</option>
              <option value="income">Thu nhập</option>
            </select>
          </div>

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
