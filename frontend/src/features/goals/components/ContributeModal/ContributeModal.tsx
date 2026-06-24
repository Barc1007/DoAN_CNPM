import React, { useState } from "react";
import { X } from "lucide-react";
import { goalApi } from "../../services/goalApi";
import type { SavingGoal } from "../../types/goal";
import styles from "./ContributeModal.module.css";

interface ContributeModalProps {
  goal: SavingGoal;
  onClose: () => void;
  onContributed: (goal: SavingGoal) => void;
}

const ContributeModal: React.FC<ContributeModalProps> = ({ goal, onClose, onContributed }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Số tiền không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      const updated = await goalApi.contributeToGoal(goal.goal_id, {
        amount: parsedAmount,
        wallet_id: goal.wallet_id,
        note: "Góp tiền vào mục tiêu",
      });
      onContributed(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Góp tiền thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Góp tiền vào "{goal.name}"</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Số tiền góp (đ)</label>
            <input
              type="number"
              placeholder="Nhập số tiền"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              autoFocus
            />
          </div>

          <p className={styles.hint}>
            Mục tiêu: {goal.target_amount.toLocaleString("vi-VN")} đ<br />
            Đã góp: {goal.current_amount.toLocaleString("vi-VN")} đ<br />
            Còn thiếu: {(goal.target_amount - goal.current_amount).toLocaleString("vi-VN")} đ
          </p>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Đang xử lý..." : "Góp tiền"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContributeModal;