export interface Wallet {
  wallet_id: number;
  user_id: number;
  name: string;
  balance: number;
  wallet_type: "Tiền mặt" | "Ngân hàng" | "Ví điện tử" | "Khác";
  created_at: string;
}
