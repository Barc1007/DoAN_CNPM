import React from "react";
import { Plus } from "lucide-react";
import styles from "./WalletHeader.module.css";

interface WalletHeaderProps {
  onAddWallet: () => void;
}

const WalletHeader: React.FC<WalletHeaderProps> = ({ onAddWallet }) => {
  return (
    <div className={styles.header}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>
          Quản lý Ví 👛
        </h1>
        <p className={styles.subtitle}>Theo dõi các tài khoản và ví của bạn</p>
      </div>
      <button className={styles.addBtn} onClick={onAddWallet}>
        <Plus size={16} />
        Thêm ví mới
      </button>
    </div>
  );
};

export default WalletHeader;
