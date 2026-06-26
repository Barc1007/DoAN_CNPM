import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types/auth";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_auth_failed: "Đăng nhập bằng Google thất bại. Vui lòng kiểm tra cấu hình OAuth hoặc log backend.",
  missing_google_code: "Google không trả về mã xác thực. Vui lòng thử đăng nhập lại.",
  invalid_google_profile: "Google không trả về email hợp lệ cho tài khoản này.",
  email_linked_to_other_google: "Email này đã được liên kết với một tài khoản Google khác.",
};

export const useGoogleCallback = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setStatus("error");
      setErrorMessage(GOOGLE_ERROR_MESSAGES[errorParam] || "Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
      setTimeout(() => { window.location.href = "/login"; }, 5000);
      return;
    }

    if (!tokenParam) {
      setStatus("error");
      setErrorMessage("Không nhận được thông tin xác thực.");
      setTimeout(() => { window.location.href = "/login"; }, 3000);
      return;
    }

    try {
      const userData: User = JSON.parse(tokenParam);
      if (!userData.token || !userData.user_id) {
        throw new Error("Invalid user data");
      }

      // Lưu vào localStorage trước, sau đó reload trang
      // để AuthProvider đọc lại từ localStorage (tránh race condition)
      loginWithToken(userData);
      setStatus("success");

      // Dùng window.location thay cho navigate để đảm bảo
      // trang load lại đầy đủ với user state từ localStorage
      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 800);
    } catch {
      setStatus("error");
      setErrorMessage("Dữ liệu xác thực không hợp lệ.");
      setTimeout(() => { window.location.href = "/login"; }, 3000);
    }
  }, [searchParams, loginWithToken]);

  return { status, errorMessage };
};

