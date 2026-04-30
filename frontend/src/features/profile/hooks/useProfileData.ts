import { useState, useEffect } from "react";
import type { UserProfile } from "../../../types/profile";
import { profileService } from "../services/profileService";
import { useAuth } from "../../auth/context/AuthContext";

export const useProfileData = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [editedData, setEditedData] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await profileService.getProfile(user?.user_id);
        setProfileData(data);
        setEditedData(data);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.user_id]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(profileData);
  };

  const handleSave = async () => {
    if (!editedData) return;
    try {
      setSaving(true);
      setError(null);
      const data = await profileService.updateProfile(editedData);
      setProfileData(data);
      setIsEditing(false);
      // Optional: Show success message
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Không thể cập nhật thông tin hồ sơ.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    if (editedData) {
      setEditedData({ ...editedData, [field]: value });
    }
  };

  return { 
    profileData: isEditing ? editedData : profileData, 
    loading, 
    saving,
    error, 
    isEditing, 
    handleEdit, 
    handleCancel, 
    handleSave, 
    handleInputChange 
  };
};
