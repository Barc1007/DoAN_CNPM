import type { Wallet } from "../features/wallet/types/wallet";

const mapWalletTypeFromApi = (value: string): Wallet["wallet_type"] => {
  const normalized = value.toLowerCase();
  if (normalized === "cash") return "Tiền mặt";
  if (normalized === "bank") return "Ngân hàng";
  if (normalized === "e-wallet") return "Ví điện tử";
  return "Khác";
};

const mapWalletTypeToApi = (value: Wallet["wallet_type"]): string => {
  if (value === "Tiền mặt") return "cash";
  if (value === "Ngân hàng") return "bank";
  if (value === "Ví điện tử") return "e-wallet";
  return "other";
};

export const mapWalletFromApi = (raw: Record<string, unknown>): Wallet => ({
  wallet_id: Number(raw.wallet_id),
  user_id: Number(raw.user_id),
  name: String(raw.name ?? ""),
  balance: Number(raw.current_balance ?? raw.balance ?? raw.initial_balance ?? 0),
  wallet_type: mapWalletTypeFromApi(String(raw.wallet_type ?? "other")),
  created_at: String(raw.created_at ?? new Date().toISOString()),
});

export const mapWalletToApi = (payload: Partial<Omit<Wallet, "wallet_id" | "created_at">>) => ({
  ...payload,
  wallet_type: payload.wallet_type ? mapWalletTypeToApi(payload.wallet_type) : undefined,
  initial_balance: payload.balance,
});
