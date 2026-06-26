import apiClient from "../../../services/apiClient";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
} from "../types/auth";

const IS_MOCK = false;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
  },

  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    const response = await apiClient.post<unknown, null>("/auth/forgot-password", data);
    return response;
  },

  verifyOtp: async (data: VerifyOtpRequest) => {
    const response = await apiClient.post<unknown, { reset_token: string }>("/auth/verify-otp", data);
    return response;
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await apiClient.post<unknown, null>("/auth/reset-password", data);
    return response;
  },
};
