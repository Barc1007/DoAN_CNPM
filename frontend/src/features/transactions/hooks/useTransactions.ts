import { useState, useEffect, useMemo } from "react";
import type { Transaction, FilterType, TransactionStats } from "../types/transaction";
import { transactionService } from "../services/transactionService";
import { useAuth } from "../../auth/context/AuthContext";

export const useTransactions = () => {
  const { user } = useAuth();

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search state
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
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
    fetchTransactions();
  }, [user?.user_id]);


  // ── Business Logic ────────────────────────────────────────────────────────
  /** Lọc + tìm kiếm — không đặt trong component */
  const filteredTransactions = useMemo<Transaction[]>(() => {
    return allTransactions.filter((t) => {
      const matchesType =
        filterType === "ALL" || t.type === filterType;
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

  return {
    filteredTransactions,
    stats,
    isLoading,
    error,
    filterType,
    searchQuery,
    handleFilterChange,
    handleSearchChange,
    refresh: fetchTransactions,
  };
};
