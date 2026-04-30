import type { Wallet } from "../features/wallet/types/wallet";

export const MOCK_WALLETS: Wallet[] = [
  {
    wallet_id: 1,
    user_id: 1,
    name: "Tiền mặt",
    balance: 1250000,
    wallet_type: "Tiền mặt",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    wallet_id: 2,
    user_id: 1,
    name: "Techcombank",
    balance: 3500000,
    wallet_type: "Ngân hàng",
    created_at: "2024-01-05T00:00:00Z",
  },
  {
    wallet_id: 3,
    user_id: 1,
    name: "MoMo",
    balance: 850000,
    wallet_type: "Ví điện tử",
    created_at: "2024-01-10T00:00:00Z",
  },
  {
    wallet_id: 4,
    user_id: 1,
    name: "Tiết kiệm",
    balance: 5000000,
    wallet_type: "Khác",
    created_at: "2024-02-01T00:00:00Z",
  },
];
