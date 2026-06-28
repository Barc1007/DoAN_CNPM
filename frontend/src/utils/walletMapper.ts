import type { Wallet } from "../features/wallet/types/wallet";

const mapWalletTypeFromApi = (value: string): Wallet["wallet_type"] => {
  const normalized = value.toLowerCase();
  if (normalized === "cash") return "cash";
  if (normalized === "bank") return "bank";
  if (normalized === "e-wallet") return "e-wallet";
  if (normalized === "credit") return "credit";
  return "other";
};

const mapWalletTypeToApi = (value: Wallet["wallet_type"]): string => {
  return value;
};

export const mapWalletFromApi = (raw: Record<string, unknown>): Wallet => ({
  wallet_id: Number(raw.wallet_id),
  user_id: Number(raw.user_id),
  name: String(raw.name ?? ""),
  initial_balance: Number(raw.initial_balance ?? 0),
  current_balance: Number(raw.current_balance ?? raw.initial_balance ?? 0),
  wallet_type: mapWalletTypeFromApi(String(raw.wallet_type ?? "other")),
  is_active: Boolean(raw.is_active ?? true),
  transaction_count: Number(raw.transaction_count ?? 0),
  created_at: String(raw.created_at ?? new Date().toISOString()),
});

export const mapWalletToApi = (payload: Partial<Omit<Wallet, "wallet_id" | "created_at">>) => ({
  ...payload,
  wallet_type: payload.wallet_type ? mapWalletTypeToApi(payload.wallet_type) : undefined,
});
