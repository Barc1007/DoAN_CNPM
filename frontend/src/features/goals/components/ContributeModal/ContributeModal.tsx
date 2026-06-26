import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { goalApi } from "../../services/goalApi";
import { walletService } from "../../../wallet/services/walletService";
import type { SavingGoal } from "../../types/goal";
import { getGoalMetrics, getGoalStatusText } from "../../utils/goalMetrics";
import styles from "./ContributeModal.module.css";

interface ContributeModalProps {
  goal: SavingGoal;
  onClose: () => void;
  onContributed: (goal: SavingGoal) => void;
}

const ContributeModal: React.FC<ContributeModalProps> = ({ goal, onClose, onContributed }) => {
  const [amount, setAmount] = useState("");
  const [wallets, setWallets] = useState<{ wallet_id: number; name: string }[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<number>(goal.wallet_id || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const metrics = getGoalMetrics(goal);

  useEffect(() => {
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

    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Số tiền không hợp lệ");
      return;
    }

    if (!selectedWalletId) {
      setError("Vui lòng chọn ví để góp tiền");
      return;
    }

    try {
      setLoading(true);
      const updated = await goalApi.contributeToGoal(goal.goal_id, {
        amount: parsedAmount,
        wallet_id: selectedWalletId,
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

          <div className={styles.field}>
            <label>Chọn ví</label>
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(Number(e.target.value))}
              required
            >
              <option value={0}>-- Chọn ví --</option>
              {wallets.map((wallet) => (
                <option key={wallet.wallet_id} value={wallet.wallet_id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </div>

          <p className={styles.hint}>
            Mục tiêu: {goal.target_amount.toLocaleString("vi-VN")} đ<br />
            Đã góp: {goal.current_amount.toLocaleString("vi-VN")} đ<br />
            {getGoalStatusText(metrics)}
          </p>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading || wallets.length === 0}>
            {loading ? "Đang xử lý..." : "Góp tiền"}
          </button>

          {wallets.length === 0 && (
            <p className={styles.error}>Không có ví nào để chọn. Vui lòng tạo ví trước khi góp tiền.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContributeModal;
