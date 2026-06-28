export type WalletType = "cash" | "bank" | "e-wallet" | "credit" | "other";

export interface Wallet {
  wallet_id: number;
  user_id: number;
  name: string;
  initial_balance: number;
  current_balance: number;
  wallet_type: WalletType;
  is_active: boolean;
  transaction_count?: number;
  created_at: string;
}

export const WALLET_TYPE_LABELS: Record<string, string> = {
  "cash": "Tiền mặt",
  "bank": "Ngân hàng",
  "e-wallet": "Ví điện tử",
  "credit": "Tín dụng",
  "other": "Khác",
};

export const WALLET_TYPE_OPTIONS = Object.keys(WALLET_TYPE_LABELS).map((key) => ({
  value: key,
  label: WALLET_TYPE_LABELS[key],
}));
