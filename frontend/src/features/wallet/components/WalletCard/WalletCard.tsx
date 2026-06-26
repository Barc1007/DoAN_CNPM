import React from "react";
import { Banknote, Building2, Smartphone, Folder } from "lucide-react";
import type { Wallet } from "../../types/wallet";
import { WALLET_TYPE_LABELS } from "../../types/wallet";
import styles from "./WalletCard.module.css";

interface WalletCardProps {
  wallet: Wallet;
  onClick?: (wallet: Wallet) => void;
  onEdit?: (wallet: Wallet) => void;
  onDelete?: (wallet: Wallet) => void;
}

const TYPE_META: Record<
  Wallet["wallet_type"],
  { cls: string; icon: React.ReactNode }
> = {
  cash: { cls: styles.cash, icon: <Banknote size={18} /> },
  bank: { cls: styles.bank, icon: <Building2 size={18} /> },
  "e-wallet": { cls: styles.ewallet, icon: <Smartphone size={18} /> },
  credit: { cls: styles.other, icon: <Folder size={18} /> },
  other: { cls: styles.other, icon: <Folder size={18} /> },
};

const WalletCard: React.FC<WalletCardProps> = ({ wallet, onClick, onEdit, onDelete }) => {
  const meta = TYPE_META[wallet.wallet_type] ?? TYPE_META["other"];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount) + " đ";

  return (
    <div
      className={`${styles.card} ${meta.cls}`}
      onClick={() => onClick?.(wallet)}
    >
      <div className={styles.topRow}>
        <div className={styles.iconBox}>{meta.icon}</div>
        <p className={styles.name}>{wallet.name}</p>
      </div>
      <p className={styles.balance}>{formatCurrency(wallet.current_balance)}</p>
      <span className={styles.typeBadge}>{WALLET_TYPE_LABELS[wallet.wallet_type] || wallet.wallet_type}</span>
      <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
        <button className={styles.editBtn} onClick={() => onEdit?.(wallet)}>Sửa</button>
        <button className={styles.deleteBtn} onClick={() => onDelete?.(wallet)}>Xoá</button>
      </div>
    </div>
  );
};

export default WalletCard;
