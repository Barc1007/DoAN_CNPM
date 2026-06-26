export interface User {
  user_id: number;
  username: string;
  email: string;
  password?: string;
  full_name: string;
  token?: string;
  auth_provider?: 'local' | 'google';
}

export interface LoginRequest {
  username: string;
  password?: string;
}

export interface RegisterRequest {
  full_name: string;
  username: string;
  email: string;
  password?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  reset_token: string;
  new_password: string;
}

