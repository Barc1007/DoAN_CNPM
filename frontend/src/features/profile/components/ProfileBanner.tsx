import React from "react";
import styles from "./ProfileBanner.module.css";
import type { UserProfile } from "../../../types/profile";

interface ProfileBannerProps {
  profile: UserProfile;
}

const ProfileBanner: React.FC<ProfileBannerProps> = ({ profile }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className={styles.bannerContainer}>
      <div className={styles.avatarBox}>
        <span className={styles.avatarText}>{getInitials(profile.full_name || "")}</span>
      </div>
      
      <div className={styles.infoBox}>
        <h2 className={styles.userName}>{profile.full_name}</h2>
        <p className={styles.userEmail}>{profile.email}</p>
        <p className={styles.joinDate}>Thành viên từ {profile.join_date}</p>
        
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Giao dịch</span>
            <span className={styles.statValue}>{profile.stats?.transactions || 0}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Ngân sách</span>
            <span className={styles.statValue}>{profile.stats?.budgets || 0}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Mục tiêu</span>
            <span className={styles.statValue}>{profile.stats?.goals || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBanner;
