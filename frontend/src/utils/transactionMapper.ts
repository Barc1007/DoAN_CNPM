import type { Transaction, TransactionType } from "../features/transactions/types/transaction";

const CATEGORY_ICONS: Record<string, string> = {
  "Ăn uống": "UtensilsCrossed",
  "Di chuyển": "Bus",
  "Học phí": "GraduationCap",
  "Giải trí": "Coffee",
  "Mua sắm": "ShoppingBag",
  "Tiền nhà": "Home",
  "Hóa đơn điện/nước": "Zap",
  "Lương / Trợ cấp": "TrendingUp",
  "Tiền thưởng": "Receipt",
  "Tiền phụ huynh": "Smartphone",
  "Thu nhập khác": "TrendingUp",
};

const normalizeDate = (value: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const mapTransactionFromApi = (raw: Record<string, unknown>): Transaction => {
  const rawType = String(raw.type ?? "").toLowerCase();
  const type: TransactionType = rawType === "income" ? "INCOME" : "EXPENSE";
  const categoryName = String(raw.category_name ?? "");

  return {
    transaction_id: Number(raw.transaction_id),
    user_id: Number(raw.user_id),
    wallet_id: Number(raw.wallet_id),
    category_id: Number(raw.category_id),
    type,
    amount: Number(raw.amount),
    transaction_date: normalizeDate(String(raw.transaction_date ?? "")),
    note: String(raw.note ?? ""),
    category_name: categoryName,
    icon_name: CATEGORY_ICONS[categoryName] ?? "Receipt",
  };
};

export const mapTransactionToApi = (payload: {
  wallet_id: number;
  category_id: number;
  amount: number;
  transaction_date?: string;
  note?: string;
  user_id?: number;
}) => ({
  user_id: payload.user_id,
  wallet_id: payload.wallet_id,
  category_id: payload.category_id,
  amount: payload.amount,
  transaction_date: payload.transaction_date || new Date().toISOString(),
  note: payload.note || null,
});
