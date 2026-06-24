import React, { useState } from "react";
import { Lock, ChevronRight, Eye, EyeOff } from "lucide-react";
import styles from "./SecuritySection.module.css";

const SecuritySection: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Xác nhận mật khẩu không khớp" });
      return;
    }

    setLoading(true);
    try {
      // TODO: Gọi API đổi mật khẩu
      console.log("Change password:", { currentPassword, newPassword });
      
      // Giả lập thành công
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowForm(false);
    } catch {
      setMessage({ type: "error", text: "Đổi mật khẩu thất bại. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPasswords(!showPasswords);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Lock size={20} className={styles.headerIcon} />
        <h3 className={styles.title}>Bảo mật</h3>
      </div>

      <div className={styles.actionList}>
        {!showForm ? (
          <div
            className={styles.actionItem}
            onClick={() => setShowForm(true)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.actionLeft}>
              <div className={styles.iconCircle}>
                <Lock size={18} className={styles.actionIcon} />
              </div>
              <div className={styles.actionText}>
                <h4 className={styles.actionTitle}>Đổi mật khẩu</h4>
                <p className={styles.actionDesc}>Cập nhật mật khẩu của bạn</p>
              </div>
            </div>
            <ChevronRight size={20} className={styles.arrowIcon} />
          </div>
        ) : (
          <form className={styles.passwordForm} onSubmit={handleSubmit}>
            {message && (
              <div className={`${styles.message} ${styles[message.type]}`}>
                {message.text}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPasswords ? "text" : "password"}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPasswords ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPasswords ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.togglePasswordBtn}
                onClick={togglePasswordVisibility}
              >
                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                {showPasswords ? "Ẩn" : "Hiện"} mật khẩu
              </button>
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowForm(false);
                    setMessage(null);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Hủy
                </button>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SecuritySection;