import React, { useState } from "react";
import { X } from "lucide-react";
import type { Wallet } from "../../../../types/wallet";
import { walletService } from "../../services/walletService";
import { useAuth } from "../../../auth/context/AuthContext";
import styles from "./AddWalletModal.module.css";

interface AddWalletModalProps {
  onClose: () => void;
  onAdded: (wallet: Wallet) => void;
}

const WALLET_TYPES: Wallet["wallet_type"][] = [
  "Tiền mặt",
  "Ngân hàng",
  "Ví điện tử",
  "Khác",
];

const AddWalletModal: React.FC<AddWalletModalProps> = ({ onClose, onAdded }) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [walletType, setWalletType] = useState<Wallet["wallet_type"]>("Tiền mặt");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Vui lòng nhập tên ví"); return; }
    const parsedBalance = parseFloat(balance.replace(/[^0-9.]/g, ""));
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      setError("Số dư không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      const newWallet = await walletService.createWallet({
        user_id: user?.user_id ?? 1,
        name: name.trim(),
        balance: parsedBalance,
        wallet_type: walletType,
      });
      onAdded(newWallet);
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
          <h2 className={styles.modalTitle}>Thêm ví mới</h2>
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
              className={styles.input}
              placeholder="0"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Loại ví</label>
            <select
              className={styles.select}
              value={walletType}
              onChange={(e) =>
                setWalletType(e.target.value as Wallet["wallet_type"])
              }
            >
              {WALLET_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
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
              {loading ? "Đang lưu..." : "Tạo ví"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWalletModal;
