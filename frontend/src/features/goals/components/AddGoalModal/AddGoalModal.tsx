import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../../auth/context/AuthContext";
import { goalApi } from "../../services/goalApi";
import styles from "./AddGoalModal.module.css";

interface AddGoalModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ onClose, onCreated }) => {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Vui lòng nhập tên mục tiêu");
      return;
    }
    const target = parseFloat(targetAmount.replace(/[^0-9.]/g, ""));
    if (isNaN(target) || target <= 0) {
      setError("Số tiền mục tiêu không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      await goalApi.createGoal({
        user_id: user?.user_id ?? 1,
        wallet_id: 0,
        name: name.trim(),
        target_amount: target,
        current_amount: 0,
        start_date: today,
        end_date: endDate || today,
        status: 'active',
      });
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tạo mục tiêu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Thêm mục tiêu mới</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Tên mục tiêu</label>
            <input
              placeholder="VD: Mua laptop, Du lịch..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Số tiền mục tiêu (đ)</label>
            <input
              type="number"
              placeholder="1000000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
              min="0"
            />
          </div>

          <div className={styles.field}>
            <label>Hạn hoàn thành</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo mục tiêu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal;
