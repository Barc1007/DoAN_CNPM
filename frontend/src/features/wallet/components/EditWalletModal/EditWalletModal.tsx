import React, { useState } from "react";
import { X } from "lucide-react";
import type { Wallet, WalletType } from "../../types/wallet";
import { WALLET_TYPE_OPTIONS } from "../../types/wallet";
import { walletService } from "../../services/walletService";
import styles from "./EditWalletModal.module.css";

interface EditWalletModalProps {
  wallet: Wallet;
  onClose: () => void;
  onUpdated: (wallet: Wallet) => void;
}

const EditWalletModal: React.FC<EditWalletModalProps> = ({ wallet, onClose, onUpdated }) => {
  const [name, setName] = useState(wallet.name);
  const [balance, setBalance] = useState(String(wallet.initial_balance));
  const [walletType, setWalletType] = useState<WalletType>(wallet.wallet_type);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasTransactions = (wallet.transaction_count ?? 0) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Vui lòng nhập tên ví"); return; }
    const parsedBalance = parseFloat(balance.replace(/[^0-9.]/g, ""));
    if (!hasTransactions && (isNaN(parsedBalance) || parsedBalance < 0)) {
      setError("Số dư không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      const updated = await walletService.updateWallet(wallet.wallet_id, {
        name: name.trim(),
        ...(!hasTransactions ? { initial_balance: parsedBalance } : {}),
        wallet_type: walletType,
        is_active: wallet.is_active,
      });
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Sửa ví</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Tên ví</label>
            <input
              className={styles.input}
              placeholder="Ví dụ: Tiền mặt, MB Bank..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Số dư ban đầu (đ)</label>
            <input
              className={`${styles.input} ${hasTransactions ? styles.disabledInput : ""}`}
              placeholder="0"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              inputMode="numeric"
              disabled={hasTransactions}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Loại ví</label>
            <select
              className={styles.select}
              value={walletType}
              onChange={(e) =>
                setWalletType(e.target.value as WalletType)
              }
            >
              {WALLET_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{error}</p>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Huỷ
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWalletModal;
