import React from "react";
import { CreditCard, Plus } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";
import { useTransactions } from "../hooks/useTransactions";
import StatsCards from "../components/StatsCards/StatsCards";
import Toolbar from "../components/Toolbar/Toolbar";
import TransactionList from "../components/TransactionList/TransactionList";
import styles from "./TransactionsPage.module.css";

const TransactionsPage: React.FC = () => {
  const {
    filteredTransactions,
    stats,
    isLoading,
    error,
    filterType,
    searchQuery,
    handleFilterChange,
    handleSearchChange,
  } = useTransactions();

  return (
    <MainLayout>
      <div className={styles.page}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Giao dịch</h1>
            <CreditCard size={24} className={styles.titleIcon} />
          </div>
          <p className={styles.subtitle}>Lịch sử chi tiêu và thu nhập của bạn</p>
        </div>

        {/* ── Stats Cards ── */}
        <StatsCards stats={stats} />

        {/* ── Toolbar ── */}
        <Toolbar
          searchQuery={searchQuery}
          filterType={filterType}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
        />

        {/* ── Transaction List ── */}
        <TransactionList
          transactions={filteredTransactions}
          isLoading={isLoading}
          error={error}
        />

        {/* ── FAB ── */}
        <button
          id="fab-add-transaction"
          className={styles.fab}
          aria-label="Thêm giao dịch mới"
          title="Thêm giao dịch mới"
        >
          <Plus size={26} />
        </button>
      </div>
    </MainLayout>
  );
};

export default TransactionsPage;
