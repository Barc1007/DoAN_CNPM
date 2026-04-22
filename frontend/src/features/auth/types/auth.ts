export interface User {
  user_id: number;
  username: string;
  email: string;
  password?: string;
  full_name: string;
}

export interface LoginRequest {
  username: string;
  password?: string;
}
