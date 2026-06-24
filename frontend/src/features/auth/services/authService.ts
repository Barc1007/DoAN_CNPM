import apiClient from "../../../services/apiClient";
import type { User, LoginRequest, RegisterRequest } from "../types/auth";

const IS_MOCK = false;

export const authService = {
  login: async (credentials: LoginRequest): Promise<User> => {
    if (IS_MOCK) {
      const { MOCK_USERS } = await import("../../../data/userData");
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const user = MOCK_USERS.find(
        u => u.username === credentials.username && u.password === credentials.password
      );

      if (user) {
        const { ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      } else {
        throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      }
    }

    const response = await apiClient.post<unknown, User>("/auth/login", credentials);
    return response;
  },

  register: async (credentials: RegisterRequest): Promise<User> => {
    if (IS_MOCK) {
      const { MOCK_USERS } = await import("../../../data/userData");
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const newUser: User = {
        user_id: MOCK_USERS.length + 1,
        username: credentials.username,
        email: credentials.email,
        full_name: credentials.full_name
      };

      MOCK_USERS.push({ ...newUser, password: credentials.password });
      return newUser;
    }

    const response = await apiClient.post<unknown, User>("/auth/register", credentials);
    return response;
  }
};