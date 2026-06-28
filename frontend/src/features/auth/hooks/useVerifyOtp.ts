import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";

const RESEND_COOLDOWN = 60;

export const useVerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
      return;
    }
    setCountdown(RESEND_COOLDOWN);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (updated.every((d) => d !== "")) {
      handleVerify(updated.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!/^\d{6}$/.test(pasted)) return;
    const updated = pasted.split("");
    setOtp(updated);
    setError("");
    handleVerify(pasted);
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await authService.verifyOtp({ email, otp: code });
      setResetToken(res.reset_token);
      navigate("/reset-password", {
        state: { email, reset_token: res.reset_token },
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Mã xác minh không đúng hoặc đã hết hạn";
      setError(msg);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCountdown(RESEND_COOLDOWN);
    setError("");
    setOtp(["", "", "", "", "", ""]);
    try {
      await authService.forgotPassword({ email });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể gửi lại mã");
    }
  };

  return {
    email,
    otp,
    loading,
    error,
    countdown,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleResend,
  };
};
