import { User } from "../features/auth/types/auth";

export interface UserProfile extends User {
  phone?: string;
  dob?: string; // e.g. "15/1/2002"
  address?: string; // e.g. "Thành phố Hồ Chí Minh"
  university?: string; // e.g. "Đại học ABC"
  student_id?: string; // e.g. "SV123456"
  join_date?: string; // e.g. "tháng 1, 2026"
  stats?: {
    transactions: number;
    budgets: number;
    goals: number;
  };
}

export interface ProfileResponse {
  result: UserProfile;
}
