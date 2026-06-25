import React from "react";
import { User, Edit2 } from "lucide-react";
import MainLayout from "../../../layouts/MainLayout";
import styles from "./ProfilePage.module.css";
import { useProfileData } from "../hooks/useProfileData";
import ProfileBanner from "../components/ProfileBanner";
import PersonalInfo from "../components/PersonalInfo";
import StudentInfo from "../components/StudentInfo";
import SecuritySection from "../components/SecuritySection";

const ProfilePage: React.FC = () => {
  const { 
    profileData, 
    loading, 
    saving,
    error, 
    isEditing, 
    handleEdit, 
    handleCancel, 
    handleSave, 
    handleInputChange 
  } = useProfileData();

  if (loading) {
    return (
      <MainLayout>
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      </MainLayout>
    );
  }

  if (error || !profileData) {
    return (
      <MainLayout>
        <div className={styles.error}>{error || "Không tìm thấy dữ liệu hồ sơ."}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <h1 className={styles.titleText}>Hồ sơ cá nhân</h1>
            <User size={24} className={styles.titleIcon} />
          </div>
          <p className={styles.subtitle}>Quản lý thông tin tài khoản của bạn</p>
          
          <div className={styles.actionButtons}>
            {isEditing ? (
              <>
                <button className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
                  <span>Hủy</span>
                </button>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    <>
                      <Edit2 size={16} />
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button className={styles.editBtn} onClick={handleEdit}>
                <Edit2 size={16} />
                <span>Chỉnh sửa</span>
              </button>
            )}
          </div>
        </header>

        <div className={styles.content}>
          <ProfileBanner profile={profileData} />
          <PersonalInfo 
            profile={profileData} 
            isEditing={isEditing} 
            onInputChange={handleInputChange} 
          />
          <StudentInfo 
            profile={profileData} 
            isEditing={isEditing} 
            onInputChange={handleInputChange} 
          />
          <SecuritySection />
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
