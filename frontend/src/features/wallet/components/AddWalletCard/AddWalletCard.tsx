import React from "react";
import { Plus } from "lucide-react";
import styles from "./AddWalletCard.module.css";

interface AddWalletCardProps {
  onClick: () => void;
}

const AddWalletCard: React.FC<AddWalletCardProps> = ({ onClick }) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.iconCircle}>
        <Plus size={22} />
      </div>
      <p className={styles.label}>Thêm ví mới</p>
      <p className={styles.sub}>Tạo ví để quản lý tài chính</p>
    </div>
  );
};

export default AddWalletCard;
