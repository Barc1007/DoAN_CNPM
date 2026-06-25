import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CreditCard, Plus, X, ArrowUpFromLine, ArrowDownToLine, Calendar, FileText, Wallet, Tag } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";
import { useTransactions } from "../hooks/useTransactions";
import StatsCards from "../components/StatsCards/StatsCards";
import Toolbar from "../components/Toolbar/Toolbar";
import TransactionList from "../components/TransactionList/TransactionList";
import { transactionService } from "../services/transactionService";
import { walletService } from "../../wallet/services/walletService";
import { categoryService } from "../../category/services/categoryService";
import { useAuth } from "../../auth/context/AuthContext";
import type { Transaction } from "../../../features/transactions/types/transaction";
import styles from "./TransactionsPage.module.css";

const TransactionsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const categoryQuery = searchParams.get("category") || "";

  const {
    filteredTransactions,
    stats,
    isLoading,
    error,
    filterType,
    searchQuery,
    handleFilterChange,
    handleSearchChange,
    refresh,
  } = useTransactions(categoryQuery);

  const today = new Date().toISOString().split('T')[0];
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    wallet_id: 0,
    category_id: 0,
    user_id: 0,
    amount: "",
    type: "expense" as "expense" | "income",
    transaction_date: today,
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [wallets, setWallets] = useState<{ wallet_id: number; name: string }[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [categories, setCategories] = useState<{ category_id: number; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const loadWallets = async () => {
      setLoadingWallets(true);
      try {
        const list = await walletService.getWallets();
        setWallets(list.map((w) => ({ wallet_id: w.wallet_id, name: w.name })));
      } catch {
        setWallets([]);
      } finally {
        setLoadingWallets(false);
      }
    };
    if (user?.user_id) loadWallets();
  }, [user?.user_id]);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await categoryService.getCategoryData(formData.type);
        setCategories(data.categories.map((c) => ({ category_id: c.category_id, name: c.name })));
      } catch {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, [formData.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      if (formData.wallet_id === 0) throw new Error("Vui lòng chọn ví");
      if (formData.category_id === 0) throw new Error("Vui lòng chọn danh mục");
      if (!formData.amount || Number(formData.amount) <= 0) throw new Error("Số tiền phải lớn hơn 0");

      const payload = {
        wallet_id: formData.wallet_id,
        category_id: formData.category_id,
        user_id: user?.user_id || 0,
        type: formData.type,
        amount: Number(formData.amount),
        transaction_date: formData.transaction_date,
        note: formData.note,
        category_name: "",
        icon_name: "default",
      } as Omit<Transaction, "transaction_id">;

      await transactionService.createTransaction(payload);
      setShowForm(false);
      setFormData({
        wallet_id: wallets.length > 0 ? wallets[0].wallet_id : 0,
        category_id: categories.length > 0 ? categories[0].category_id : 0,
        user_id: user?.user_id || 0,
        amount: "",
        type: "expense",
        transaction_date: today,
        note: "",
      });
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Thêm giao dịch thất bại";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Giao dịch</h1>
            <CreditCard size={24} className={styles.titleIcon} />
          </div>
        </div>

        <StatsCards stats={stats} />
        <Toolbar
          searchQuery={searchQuery}
          filterType={filterType}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
        />
        <TransactionList
          transactions={filteredTransactions}
          isLoading={isLoading}
          error={error}
        />

        <button className={styles.fab} onClick={() => setShowForm(true)}>
          <Plus size={26} />
        </button>

        {showForm && (
          <div className={styles.overlay} onClick={() => setShowForm(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Thêm giao dịch</h2>
                <button className={styles.closeBtn} onClick={() => setShowForm(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.typeTabs}>
                <button
                  type="button"
                  className={`${styles.typeTab} ${formData.type === 'expense' ? styles.typeTabActive : ''}`}
                  onClick={() => setFormData({...formData, type: 'expense'})}
                >
                  <ArrowUpFromLine size={16} />
                  <span>Chi tiêu</span>
                </button>
                <button
                  type="button"
                  className={`${styles.typeTab} ${formData.type === 'income' ? styles.typeTabActive : ''} ${styles.typeTabIncome}`}
                  onClick={() => setFormData({...formData, type: 'income'})}
                >
                  <ArrowDownToLine size={16} />
                  <span>Thu nhập</span>
                </button>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label><Wallet size={14} /> Ví</label>
                  <select
                    value={formData.wallet_id}
                    onChange={(e) => setFormData({...formData, wallet_id: Number(e.target.value)})}
                  >
                    {loadingWallets ? (
                      <option value={0}>Đang tải ví...</option>
                    ) : wallets.length === 0 ? (
                      <option value={0}>Không có ví nào</option>
                    ) : (
                      wallets.map((w) => (
                        <option key={w.wallet_id} value={w.wallet_id}>{w.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label><Tag size={14} /> Danh mục</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: Number(e.target.value)})}
                  >
                    {loadingCategories ? (
                      <option value={0}>Đang tải danh mục...</option>
                    ) : categories.length === 0 ? (
                      <option value={0}>Không có danh mục nào</option>
                    ) : (
                      categories.map((c) => (
                        <option key={c.category_id} value={c.category_id}>{c.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className={styles.row}>
                  <div className={styles.half}>
                    <div className={styles.formGroup}>
                      <label>Số tiền (đ)</label>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0"
                        required
                        min="0"
                      />
                    </div>
                  </div>
                  <div className={styles.half}>
                    <div className={styles.formGroup}>
                      <label><Calendar size={14} /> Ngày</label>
                      <input
                        type="date"
                        value={formData.transaction_date}
                        onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label><FileText size={14} /> Ghi chú</label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    placeholder="Nhập ghi chú..."
                  />
                </div>

                {submitError && (
                  <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{submitError}</p>
                )}
                <button 
                  type="submit" 
                  className={styles.submitBtn} 
                  disabled={submitting || formData.wallet_id === 0 || formData.category_id === 0 || !formData.amount}
                >
                  {submitting ? "Đang lưu..." : "Thêm giao dịch"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TransactionsPage;