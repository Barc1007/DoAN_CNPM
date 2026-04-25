import React from "react";
import { User, Mail, Phone, Calendar, MapPin } from "lucide-react";
import styles from "./PersonalInfo.module.css";
import type { UserProfile } from "../../../types/profile";

interface PersonalInfoProps {
  profile: UserProfile;
  isEditing?: boolean;
  onInputChange?: (field: keyof UserProfile, value: any) => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ profile, isEditing = false, onInputChange }) => {
  const handleChange = (field: keyof UserProfile, value: string) => {
    if (onInputChange) {
      onInputChange(field, value);
    }
  };

  return (
    <div className={`${styles.card} ${isEditing ? styles.editing : ""}`}>
      <div className={styles.header}>
        <User size={20} className={styles.headerIcon} />
        <h3 className={styles.title}>Thông tin cá nhân</h3>
      </div>
      
      <div className={styles.grid}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Họ và tên</label>
          <div className={`${styles.inputWrapper} ${isEditing ? styles.activeInput : ""}`}>
            <User size={18} className={styles.inputIcon} />
            <input 
              type="text" 
              value={profile.full_name} 
              disabled={!isEditing} 
              className={styles.input}
              onChange={(e) => handleChange("full_name", e.target.value)}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Email</label>
          <div className={`${styles.inputWrapper} ${isEditing ? styles.activeInput : ""}`}>
            <Mail size={18} className={styles.inputIcon} />
            <input 
              type="email" 
              value={profile.email} 
              disabled={!isEditing} 
              className={styles.input}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Số điện thoại</label>
          <div className={`${styles.inputWrapper} ${isEditing ? styles.activeInput : ""}`}>
            <Phone size={18} className={styles.inputIcon} />
            <input 
              type="text" 
              value={profile.phone || ""} 
              disabled={!isEditing} 
              className={styles.input}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Ngày sinh</label>
          <div className={`${styles.inputWrapper} ${isEditing ? styles.activeInput : ""}`}>
            <Calendar size={18} className={styles.inputIcon} />
            <input 
              type="text" 
              value={profile.dob || ""} 
              disabled={!isEditing} 
              className={styles.input}
              onChange={(e) => handleChange("dob", e.target.value)}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Địa chỉ</label>
          <div className={`${styles.inputWrapper} ${isEditing ? styles.activeInput : ""}`}>
            <MapPin size={18} className={styles.inputIcon} />
            <input 
              type="text" 
              value={profile.address || ""} 
              disabled={!isEditing} 
              className={styles.input}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
