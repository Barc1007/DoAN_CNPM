import React from "react";
import { Banknote, Building2, Smartphone, Folder } from "lucide-react";
import type { Wallet } from "../../types/wallet";
import styles from "./WalletCard.module.css";

interface WalletCardProps {
  wallet: Wallet;
  onClick?: (wallet: Wallet) => void;
}

const TYPE_META: Record<
  Wallet["wallet_type"],
  { cls: string; icon: React.ReactNode }
> = {
  "Tiền mặt": { cls: styles.cash, icon: <Banknote size={18} /> },
  "Ngân hàng": { cls: styles.bank, icon: <Building2 size={18} /> },
  "Ví điện tử": { cls: styles.ewallet, icon: <Smartphone size={18} /> },
  "Khác": { cls: styles.other, icon: <Folder size={18} /> },
};

const WalletCard: React.FC<WalletCardProps> = ({ wallet, onClick }) => {
  const meta = TYPE_META[wallet.wallet_type] ?? TYPE_META["Khác"];

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
      <p className={styles.balance}>{formatCurrency(wallet.balance)}</p>
      <span className={styles.typeBadge}>{wallet.wallet_type}</span>
    </div>
  );
};

export default WalletCard;
