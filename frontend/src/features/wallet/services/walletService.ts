import apiClient from "../../../services/apiClient";
import type { Wallet } from "../types/wallet";
import { MOCK_WALLETS } from "../../../data/mockWallets";

const IS_MOCK = true;

export const walletService = {
  /**
   * Lấy danh sách ví của user
   */
  getWallets: async (userId?: number): Promise<Wallet[]> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return userId
        ? MOCK_WALLETS.filter((w) => w.user_id === userId)
        : MOCK_WALLETS;
    }

    const response = await apiClient.get<any, Wallet[]>("/wallets", {
      params: { user_id: userId },
    });
    return response;
  },

  /**
   * Tạo ví mới
   */
  createWallet: async (
    payload: Omit<Wallet, "wallet_id" | "created_at">
  ): Promise<Wallet> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const newWallet: Wallet = {
        ...payload,
        wallet_id: Date.now(),
        created_at: new Date().toISOString(),
      };
      MOCK_WALLETS.push(newWallet);
      return newWallet;
    }

    const response = await apiClient.post<any, Wallet>("/wallets", payload);
    return response;
  },

  /**
   * Cập nhật ví
   */
  updateWallet: async (
    walletId: number,
    payload: Partial<Omit<Wallet, "wallet_id" | "user_id" | "created_at">>
  ): Promise<Wallet> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const idx = MOCK_WALLETS.findIndex((w) => w.wallet_id === walletId);
      if (idx === -1) throw new Error("Không tìm thấy ví");
      MOCK_WALLETS[idx] = { ...MOCK_WALLETS[idx], ...payload };
      return MOCK_WALLETS[idx];
    }

    const response = await apiClient.put<any, Wallet>(
      `/wallets/${walletId}`,
      payload
    );
    return response;
  },

  /**
   * Xoá ví
   */
  deleteWallet: async (walletId: number): Promise<void> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const idx = MOCK_WALLETS.findIndex((w) => w.wallet_id === walletId);
      if (idx === -1) throw new Error("Không tìm thấy ví");
      MOCK_WALLETS.splice(idx, 1);
      return;
    }

    await apiClient.delete(`/wallets/${walletId}`);
  },
};
