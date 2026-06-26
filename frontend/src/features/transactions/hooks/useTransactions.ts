import { useState, useEffect, useMemo } from "react";
import type { Transaction, FilterType } from "../types/transaction";
import { transactionService } from "../services/transactionService";
import { useAuth } from "../../auth/context/AuthContext";

export const useTransactions = (initialSearchQuery = "") => {
  const { user } = useAuth();

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter & Search state
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setActionError(null);
      const response = await transactionService.getTransactions(user?.user_id);
      setAllTransactions(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi tải giao dịch";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Keep transaction fetching tied to the active user.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);


  // ── Business Logic ────────────────────────────────────────────────────────
  /** Lọc + tìm kiếm — không đặt trong component */
  const filteredTransactions = useMemo<Transaction[]>(() => {
    return allTransactions.filter((t) => {
      const matchesType =
        filterType === "ALL" || t.type.toUpperCase() === filterType;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        query === "" ||
        t.note.toLowerCase().includes(query) ||
        t.category_name.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [allTransactions, filterType, searchQuery]);

  /** Thống kê tổng thu, tổng chi, số giao dịch tháng hiện tại - Chuyển sang Service */
  const stats = useMemo(() => {
    return transactionService.calculateSummaryStats(allTransactions);
  }, [allTransactions]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFilterChange = (type: FilterType) => setFilterType(type);
  const handleSearchChange = (query: string) => setSearchQuery(query);
  const deleteTransaction = async (transactionId: number) => {
    try {
      setActionError(null);
      await transactionService.deleteTransaction(transactionId);
      setAllTransactions((prev) => prev.filter((t) => t.transaction_id !== transactionId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Xoá giao dịch thất bại";
      setActionError(message);
      throw err;
    }
  };

  return {
    filteredTransactions,
    stats,
    isLoading,
    error,
    actionError,
    clearActionError: () => setActionError(null),
    filterType,
    searchQuery,
    handleFilterChange,
    handleSearchChange,
    deleteTransaction,
    refresh: fetchTransactions,
  };
};
