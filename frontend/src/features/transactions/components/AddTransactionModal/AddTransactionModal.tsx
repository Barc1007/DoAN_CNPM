import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { TransactionType } from "../../types/transaction";
import { transactionService } from "../../services/transactionService";
import { walletService } from "../../../wallet/services/walletService";
import { categoryService } from "../../../category/services/categoryService";
import type { Wallet } from "../../../wallet/types/wallet";
import type { CategoryStat } from "../../../../types/category";
import { useAuth } from "../../../auth/context/AuthContext";
import MoneyInput from "../../../../components/MoneyInput/MoneyInput";
import styles from "../../../wallet/components/AddWalletModal/AddWalletModal.module.css";
import localStyles from "./AddTransactionModal.module.css";

interface AddTransactionModalProps {
  onClose: () => void;
  onAdded: () => void;
}

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  onClose,
  onAdded,
}) => {
  const { user } = useAuth();
  const [txType, setTxType] = useState<TransactionType>("EXPENSE");
  const [walletId, setWalletId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => toDateInputValue(new Date()));
  const [note, setNote] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingData(true);
        setError("");
        const [walletList, categoryData] = await Promise.all([
          walletService.getWallets(user?.user_id),
          categoryService.getCategoryData(txType === "INCOME" ? "income" : "expense"),
        ]);
        setWallets(walletList);
        setCategories(categoryData.categories);
        setWalletId(walletList[0]?.wallet_id ?? "");
        setCategoryId(categoryData.categories[0]?.category_id ?? "");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Không tải được dữ liệu");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [user?.user_id, txType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount.replace(/[^0-9]/g, ""));
    if (!walletId || !categoryId || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Vui lòng điền đầy đủ thông tin hợp lệ");
      return;
    }

    try {
      setLoading(true);
      await transactionService.createTransaction({
        user_id: user?.user_id ?? 0,
        wallet_id: Number(walletId),
        category_id: Number(categoryId),
        type: txType,
        amount: parsedAmount,
        transaction_date: date,
        note: note.trim(),
      });
      onAdded();
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
        <ModalHeader onClose={onClose} />

        {loadingData ? (
          <p className={localStyles.hint}>Đang tải...</p>
        ) : wallets.length === 0 ? (
          <p className={localStyles.errorHint}>
            Bạn chưa có ví nào. Hãy tạo ví trước khi thêm giao dịch.
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={localStyles.typeRow}>
              <button
                type="button"
                className={`${localStyles.typeBtn} ${txType === "EXPENSE" ? localStyles.typeExpenseActive : ""}`}
                onClick={() => setTxType("EXPENSE")}
              >
                Chi tiêu
              </button>
              <button
                type="button"
                className={`${localStyles.typeBtn} ${txType === "INCOME" ? localStyles.typeIncomeActive : ""}`}
                onClick={() => setTxType("INCOME")}
              >
                Thu nhập
              </button>
            </div>

            <FormField label="Danh mục">
              <select
                className={styles.select}
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
              >
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FormField>

            <div className={styles.field}>
              <label className={styles.label}>Số tiền (đ)</label>
              <MoneyInput
                className={styles.input}
                placeholder="0"
                value={amount}
                onChange={setAmount}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Ngày</label>
              <input
                type="date"
                className={styles.input}
                value={date}
                max={toDateInputValue(new Date())}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Ghi chú</label>
              <input
                className={styles.input}
                placeholder="Mô tả giao dịch..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {error && <p className={localStyles.errorHint}>{error}</p>}

            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Huỷ
              </button>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu giao dịch"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.modalHeader}>
      <h2 className={styles.modalTitle}>Thêm giao dịch mới</h2>
      <button type="button" className={styles.closeBtn} onClick={onClose}>
        <X size={20} />
      </button>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}

export default AddTransactionModal;
