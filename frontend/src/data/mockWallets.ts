import type { Wallet } from "../features/wallet/types/wallet";

export const MOCK_WALLETS: Wallet[] = [
  {
    wallet_id: 1,
    user_id: 1,
    name: "Tiền mặt",
    initial_balance: 1250000,
    current_balance: 1250000,
    wallet_type: "cash",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    wallet_id: 2,
    user_id: 1,
    name: "Techcombank",
    initial_balance: 3500000,
    current_balance: 3500000,
    wallet_type: "bank",
    is_active: true,
    created_at: "2024-01-05T00:00:00Z",
  },
  {
    wallet_id: 3,
    user_id: 1,
    name: "MoMo",
    initial_balance: 850000,
    current_balance: 850000,
    wallet_type: "e-wallet",
    is_active: true,
    created_at: "2024-01-10T00:00:00Z",
  },
  {
    wallet_id: 4,
    user_id: 1,
    name: "Tiết kiệm",
    initial_balance: 5000000,
    current_balance: 5000000,
    wallet_type: "other",
    is_active: true,
    created_at: "2024-02-01T00:00:00Z",
  },
];