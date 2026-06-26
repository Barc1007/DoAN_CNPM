import React, { useEffect, useMemo, useState } from "react";
import { X, Wallet as WalletIcon } from "lucide-react";
import { goalApi } from "../../services/goalApi";
import { walletService } from "../../../wallet/services/walletService";
import { emitWalletChanged } from "../../../wallet/hooks/useWallets";
import type { SavingGoal } from "../../types/goal";
import type { Wallet } from "../../../wallet/types/wallet";
import { WALLET_TYPE_LABELS } from "../../../wallet/types/wallet";
import { getGoalMetrics, getGoalStatusText } from "../../utils/goalMetrics";
import { useAuth } from "../../../auth/context/AuthContext";
import styles from "./ContributeModal.module.css";

interface ContributeModalProps {
  goal: SavingGoal;
  onClose: () => void;
  onContributed: (goal: SavingGoal) => void;
}

const ContributeModal: React.FC<ContributeModalProps> = ({ goal, onClose, onContributed }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(goal.wallet_id ?? null);
  const [walletsLoading, setWalletsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const metrics = getGoalMetrics(goal);

  useEffect(() => {
    let mounted = true;
    const loadWallets = async () => {
      try {
        setWalletsLoading(true);
        const data = await walletService.getWallets(user?.user_id);
        if (mounted) {
          const active = data.filter((w) => w.is_active);
          setWallets(active);
          if (!goal.wallet_id && active.length > 0) {
            setSelectedWalletId(active[0].wallet_id);
          }
        }
      } catch {
        if (mounted) setError("Không thể tải danh sách ví");
      } finally {
        if (mounted) setWalletsLoading(false);
      }
    };
    loadWallets();
    return () => {
      mounted = false;
    };
  }, [user?.user_id, goal.wallet_id]);

  const selectedWallet = useMemo(
    () => wallets.find((w) => w.wallet_id === selectedWalletId) ?? null,
    [wallets, selectedWalletId]
  );

  const parsedAmount = useMemo(() => {
    const n = parseFloat(amount.replace(/[^0-9.]/g, ""));
    return Number.isNaN(n) ? 0 : n;
  }, [amount]);

  const insufficientBalance =
    selectedWallet !== null && parsedAmount > selectedWallet.current_balance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (parsedAmount <= 0) {
      setError("Số tiền không hợp lệ");
      return;
    }
    if (!selectedWalletId) {
      setError("Vui lòng chọn ví để trừ tiền");
      return;
    }
    if (insufficientBalance) {
      setError("Số dư ví không đủ để góp");
      return;
    }

    try {
      setLoading(true);
      console.log('[ContributeModal] submitting', {
        goalId: goal.goal_id,
        amount: parsedAmount,
        walletId: selectedWalletId,
      });
      const updated = await goalApi.contributeToGoal(goal.goal_id, {
        amount: parsedAmount,
        wallet_id: selectedWalletId,
        note: "Góp tiền vào mục tiêu",
      });
      console.log('[ContributeModal] success', updated);
      emitWalletChanged();
      onContributed(updated);
      onClose();
    } catch (err: unknown) {
      console.error('[ContributeModal] failed', err);
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
            <label>
              <WalletIcon size={14} className={styles.fieldIcon} />
              Trừ từ ví
            </label>
            {walletsLoading ? (
              <p className={styles.hint}>Đang tải danh sách ví...</p>
            ) : wallets.length === 0 ? (
              <p className={styles.hint}>Bạn chưa có ví nào đang hoạt động.</p>
            ) : (
              <>
                <select
                  className={styles.select}
                  value={selectedWalletId ?? ""}
                  onChange={(e) => setSelectedWalletId(Number(e.target.value))}
                  required
                >
                  {wallets.map((w) => (
                    <option key={w.wallet_id} value={w.wallet_id}>
                      {w.name} ({WALLET_TYPE_LABELS[w.wallet_type] || w.wallet_type})
                    </option>
                  ))}
                </select>
                {selectedWallet && (
                  <p className={styles.walletBalance}>
                    Số dư khả dụng:{" "}
                    <span
                      className={
                        insufficientBalance ? styles.balanceDanger : styles.balanceOk
                      }
                    >
                      {selectedWallet.current_balance.toLocaleString("vi-VN")} đ
                    </span>
                  </p>
                )}
              </>
            )}
          </div>

          <p className={styles.hint}>
            Mục tiêu: {goal.target_amount.toLocaleString("vi-VN")} đ<br />
            Đã góp: {goal.current_amount.toLocaleString("vi-VN")} đ<br />
            {getGoalStatusText(metrics)}
          </p>

          {insufficientBalance && (
            <p className={styles.error}>Số tiền vượt quá số dư ví đã chọn.</p>
          )}
          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || walletsLoading || wallets.length === 0}
          >
            {loading ? "Đang xử lý..." : "Góp tiền"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContributeModal;