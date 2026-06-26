import React, { useState } from "react";
import { X } from "lucide-react";
import { goalApi } from "../../services/goalApi";
import { walletService } from "../../../wallet/services/walletService";
import type { SavingGoal } from "../../types/goal";
import styles from "./EditGoalModal.module.css";

interface EditGoalModalProps {
  goal: SavingGoal;
  onClose: () => void;
  onUpdated: (goal: SavingGoal) => void;
  onDeleted?: (goalId: number) => void;
}

const EditGoalModal: React.FC<EditGoalModalProps> = ({ goal, onClose, onUpdated, onDeleted }) => {
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(String(goal.target_amount));
  const [currentAmount, setCurrentAmount] = useState(String(goal.current_amount));
  const [endDate, setEndDate] = useState(goal.end_date?.split("T")[0] ?? "");
  const [wallets, setWallets] = useState<{ wallet_id: number; name: string }[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<number>(goal.wallet_id || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  React.useEffect(() => {
    const loadWallets = async () => {
      try {
        const list = await walletService.getWallets();
        setWallets(list.map((w: { wallet_id: number; name: string }) => ({ wallet_id: w.wallet_id, name: w.name })));
      } catch {
        setWallets([]);
      }
    };
    loadWallets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Vui lòng nhập tên mục tiêu"); return; }
    const target = parseFloat(targetAmount.replace(/[^0-9.]/g, ""));
    const current = parseFloat(currentAmount.replace(/[^0-9.]/g, "")) || 0;
    if (isNaN(target) || target <= 0) {
      setError("Số tiền mục tiêu không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      const updated = await goalApi.updateGoal(goal.goal_id, {
        name: name.trim(),
        target_amount: target,
        current_amount: current,
        end_date: endDate,
        wallet_id: selectedWalletId || undefined,
      });
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      if (onDeleted) onDeleted(goal.goal_id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xoá mục tiêu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Chỉnh sửa mục tiêu</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Tên mục tiêu</label>
            <input
              className={styles.input}
              placeholder="VD: Mua laptop, Du lịch..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.rows}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Số tiền mục tiêu (đ)</label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="1000000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                  min="0"
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Số tiền hiện có (đ)</label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Hạn hoàn thành</label>
            <input
              type="date"
              className={styles.input}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ví liên kết (tùy chọn)</label>
            <select
              className={styles.select}
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(Number(e.target.value))}
            >
              <option value={0}>Không chọn ví</option>
              {wallets.map((w) => (
                <option key={w.wallet_id} value={w.wallet_id}>{w.name}</option>
              ))}
            </select>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            {!showDeleteConfirm ? (
              <button type="button" className={styles.deleteBtn} onClick={() => setShowDeleteConfirm(true)}>
                Xoá mục tiêu
              </button>
            ) : (
              <div className={styles.deleteConfirm}>
                <span>Chắc chắn xoá?</span>
                <button type="button" className={styles.confirmYes} onClick={handleDelete} disabled={loading}>
                  Có
                </button>
                <button type="button" className={styles.confirmNo} onClick={() => setShowDeleteConfirm(false)}>
                  Không
                </button>
              </div>
            )}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGoalModal;
