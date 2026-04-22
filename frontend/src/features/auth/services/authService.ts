import apiClient from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/dashboard";
import type { User, LoginRequest, RegisterRequest } from "../types/auth";
import { MOCK_USERS } from "../../../data/userData";

const IS_MOCK = true;

export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<User>> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const user = MOCK_USERS.find(
        u => u.username === credentials.username && u.password === credentials.password
      );

      if (user) {
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return {
          status: 200,
          message: "Đăng nhập thành công",
          result: userWithoutPassword as User
        };
      } else {
        throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      }
    }

    const response = await apiClient.post("/auth/login", credentials);
    return response.data as ApiResponse<User>;
  },

  register: async (credentials: RegisterRequest): Promise<ApiResponse<User>> => {
    if (IS_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const newUser: User = {
        user_id: MOCK_USERS.length + 1,
        username: credentials.username,
        email: credentials.email,
        full_name: credentials.full_name
      };

      MOCK_USERS.push({ ...newUser, password: credentials.password });

      return {
        status: 201,
        message: "Đăng ký thành công",
        result: newUser
      };
    }

    const response = await apiClient.post("/auth/register", credentials);
    return response.data as ApiResponse<User>;
  }
};
