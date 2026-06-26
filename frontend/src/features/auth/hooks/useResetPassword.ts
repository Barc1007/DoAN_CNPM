import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";

export const useResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state as { email?: string; reset_token?: string }) || {};
  const email = state.email || "";
  const reset_token = state.reset_token || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!reset_token) {
      setError("Phiên đặt lại mật khẩu đã hết hạn. Vui lòng thực hiện lại.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ reset_token, new_password: password });
      alert("Đặt lại mật khẩu thành công! Hãy đăng nhập với mật khẩu mới.");
      navigate("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    handleSubmit,
  };
};
