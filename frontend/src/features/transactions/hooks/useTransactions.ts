import { useState, useEffect, useMemo } from "react";
import type { Transaction, FilterType, DateFilterMode } from "../types/transaction";
import { transactionService } from "../services/transactionService";
import { useAuth } from "../../auth/context/AuthContext";

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCurrentMonthValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: toDateInputValue(start),
    end: toDateInputValue(end),
  };
};

const normalizeTransactionDate = (value: string) => String(value).slice(0, 10);

export const useTransactions = (initialSearchQuery = "") => {
  const { user } = useAuth();
  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter & Search state
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>("MONTH");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentMonthValue());
  const [rangeStart, setRangeStart] = useState<string>(currentMonthRange.start);
  const [rangeEnd, setRangeEnd] = useState<string>(currentMonthRange.end);

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

      const txDate = normalizeTransactionDate(t.transaction_date);
      const matchesDate = (() => {
        if (dateFilterMode === "ALL_TIME") {
          return true;
        }

        if (dateFilterMode === "MONTH") {
          return selectedMonth ? txDate.startsWith(selectedMonth) : true;
        }

        const afterStart = rangeStart ? txDate >= rangeStart : true;
        const beforeEnd = rangeEnd ? txDate <= rangeEnd : true;
        return afterStart && beforeEnd;
      })();

      return matchesType && matchesSearch && matchesDate;
    });
  }, [allTransactions, dateFilterMode, filterType, rangeEnd, rangeStart, searchQuery, selectedMonth]);

  /** Thống kê theo danh sách giao dịch đang hiển thị */
  const stats = useMemo(() => {
    return transactionService.calculateSummaryStats(filteredTransactions);
  }, [filteredTransactions]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFilterChange = (type: FilterType) => setFilterType(type);
  const handleSearchChange = (query: string) => setSearchQuery(query);
  const handleDateFilterModeChange = (mode: DateFilterMode) => setDateFilterMode(mode);
  const handleSelectedMonthChange = (month: string) => setSelectedMonth(month);
  const handleRangeStartChange = (date: string) => setRangeStart(date);
  const handleRangeEndChange = (date: string) => setRangeEnd(date);
  const resetToCurrentMonth = () => {
    const currentRange = getCurrentMonthRange();
    setDateFilterMode("MONTH");
    setSelectedMonth(getCurrentMonthValue());
    setRangeStart(currentRange.start);
    setRangeEnd(currentRange.end);
  };

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
    dateFilterMode,
    selectedMonth,
    rangeStart,
    rangeEnd,
    handleDateFilterModeChange,
    handleSelectedMonthChange,
    handleRangeStartChange,
    handleRangeEndChange,
    resetToCurrentMonth,
    deleteTransaction,
    refresh: fetchTransactions,
  };
};
