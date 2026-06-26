import React from "react";
import type { Transaction } from "../../types/transaction";
import TransactionItem from "../TransactionItem/TransactionItem";
import styles from "./TransactionList.module.css";
import { ReceiptText } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading,
  error,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className={styles.stateContainer}>
        <div className={styles.spinner} />
        <p className={styles.stateText}>Đang tải giao dịch...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.stateContainer} ${styles.error}`}>
        <p className={styles.stateText}>⚠️ {error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={styles.stateContainer}>
        <ReceiptText size={48} className={styles.emptyIcon} />
        <p className={styles.stateText}>Không tìm thấy giao dịch nào.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.transaction_id}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TransactionList;
