import type { User } from "../features/auth/types/auth";

export const MOCK_USERS: User[] = [
  {
    user_id: 1,
    username: "ngocthi",
    password: "123456",
    full_name: "Thái Ngọc Thi",
    email: "ngocthi1392005@mgail.com"
  },
  {
    user_id: 2,
    username: "nguyenvana",
    password: "123456",
    full_name: "Nguyễn Văn An",
    email: "an.nv@gmail.com"
  },
  {
    user_id: 3,
    username: "lethib",
    password: "123456",
    full_name: "Lê Thị Bình",
    email: "binh.lt@student.edu.vn"
  },
  {
    user_id: 4,
    username: "tranvanc",
    password: "123456",
    full_name: "Trần Văn Cường",
    email: "cuong.tv@yahoo.com"
  },
  {
    user_id: 5,
    username: "phamthid",
    password: "123456",
    full_name: "Phạm Thị Dung",
    email: "dung.pt@outlook.com"
  }
];