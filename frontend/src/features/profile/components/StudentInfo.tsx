import React from "react";
import { User } from "lucide-react";
import styles from "./StudentInfo.module.css";
import type { UserProfile } from "../../../types/profile";

interface StudentInfoProps {
  profile: UserProfile;
  isEditing?: boolean;
  onInputChange?: (field: keyof UserProfile, value: unknown) => void;
}

const StudentInfo: React.FC<StudentInfoProps> = ({ profile, isEditing = false, onInputChange }) => {
  const handleChange = (field: keyof UserProfile, value: string) => {
    if (onInputChange) {
      onInputChange(field, value);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <User size={20} className={styles.headerIcon} />
        <h3 className={styles.title}>Thông tin sinh viên</h3>
      </div>
      
      <div className={styles.grid}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Trường học</label>
          <div className={`${styles.inputWrapper} ${isEditing ? styles.activeInput : ""}`}>
            <input 
              type="text" 
              value={profile.university || ""} 
              disabled={!isEditing} 
              className={styles.input}
              onChange={(e) => handleChange("university", e.target.value)}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Mã sinh viên</label>
          <div className={`${styles.inputWrapper} ${isEditing ? styles.activeInput : ""}`}>
            <input 
              type="text" 
              value={profile.student_id || ""} 
              disabled={!isEditing} 
              className={styles.input}
              onChange={(e) => handleChange("student_id", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentInfo;
