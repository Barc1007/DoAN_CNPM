import React, { useState } from 'react';
import styles from './AddCategoryModal.module.css';
import { categoryService } from '../../services/categoryService';

interface Props {
  defaultType?: 'expense' | 'income';
  onClose: () => void;
  onCreated?: () => void;
}

const AddCategoryModal: React.FC<Props> = ({ defaultType = 'expense', onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>(defaultType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) return setError('Vui lòng nhập tên danh mục');
    try {
      setLoading(true);
      await categoryService.createCategory({ name: trimmed, type });
      onCreated && onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tạo danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h3>Tạo danh mục mới</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label>Tên</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={styles.row}>
            <label>Loại</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="expense">Chi tiêu</option>
              <option value="income">Nguồn thu</option>
            </select>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.actions}>
            <button type="button" onClick={onClose} disabled={loading}>Huỷ</button>
            <button type="submit" disabled={loading}>{loading ? 'Đang tạo...' : 'Tạo'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
