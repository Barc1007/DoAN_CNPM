/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
import { useState, useEffect, useCallback } from "react";
import type { Wallet } from "../types/wallet";
import { walletService } from "../services/walletService";
import { useAuth } from "../../auth/context/AuthContext";

export const useWallets = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await walletService.getWallets(user?.user_id);
      setWallets(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi tải danh sách ví";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user?.user_id]);

  const deleteWallet = useCallback(
    async (walletId: number) => {
      try {
        await walletService.deleteWallet(walletId);
        setWallets((prev) => prev.filter((w) => w.wallet_id !== walletId));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Xoá ví thất bại";
        setError(msg);
      }
    },
    [user?.user_id]
  );

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const totalBalance = wallets.reduce((sum, w) => sum + (w.current_balance || 0), 0);
  const activeCount = wallets.length;

  return {
    wallets,
    totalBalance,
    activeCount,
    isLoading,
    error,
    refresh: fetchWallets,
    setWallets,
    deleteWallet,
  };
};
