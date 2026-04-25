import type { UserProfile } from "../types/profile";

export const MOCK_USERS: UserProfile[] = [
  {
    user_id: 1,
    username: "ngocthi",
    password: "123456",
    full_name: "Thái Ngọc Thi",
    email: "ngocthi1392005@mgail.com",
    phone: "0123456789",
    dob: "15/1/2005",
    address: "Thành phố Hồ Chí Minh",
    university: "Đại học ABC",
    student_id: "SV1392005",
    join_date: "tháng 9, 2023",
    stats: { transactions: 156, budgets: 8, goals: 3 }
  },
  {
    user_id: 2,
    username: "nguyenvana",
    password: "123456",
    full_name: "Nguyễn Văn An",
    email: "an.nv@gmail.com",
    phone: "0987654321",
    dob: "12/5/2002",
    address: "Hà Nội",
    university: "Đại học XYZ",
    student_id: "SV2000123",
    join_date: "tháng 1, 2024",
    stats: { transactions: 42, budgets: 3, goals: 1 }
  },
  {
    user_id: 3,
    username: "lethib",
    password: "123456",
    full_name: "Lê Thị Bình",
    email: "binh.lt@student.edu.vn",
    phone: "0912345678",
    dob: "20/10/2003",
    address: "Đà Nẵng",
    university: "Đại học KHTN",
    student_id: "SV3000456",
    join_date: "tháng 8, 2025",
    stats: { transactions: 120, budgets: 5, goals: 2 }
  },
  {
    user_id: 4,
    username: "tranvanc",
    password: "123456",
    full_name: "Trần Văn Cường",
    email: "cuong.tv@yahoo.com",
    phone: "0901234567",
    dob: "05/02/2001",
    address: "Cần Thơ",
    university: "Đại học Bách Khoa",
    student_id: "SV4000789",
    join_date: "tháng 10, 2022",
    stats: { transactions: 210, budgets: 10, goals: 5 }
  },
  {
    user_id: 5,
    username: "phamthid",
    password: "123456",
    full_name: "Phạm Thị Dung",
    email: "dung.pt@outlook.com",
    phone: "0934567890",
    dob: "08/08/2004",
    address: "Hải Phòng",
    university: "Đại học Kinh Tế",
    student_id: "SV5000123",
    join_date: "tháng 3, 2026",
    stats: { transactions: 15, budgets: 1, goals: 0 }
  }
];