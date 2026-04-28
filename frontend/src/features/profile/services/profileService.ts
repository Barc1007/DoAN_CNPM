import apiClient from "../../../services/apiClient";
import type { UserProfile, ProfileResponse } from "../../../types/profile";
import { MOCK_USERS } from "../../../data/userData";

const IS_MOCK = true;
const STORAGE_KEY = "mock_users_data";

const getMockUsers = (): UserProfile[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored mock users", e);
    }
  }
  return MOCK_USERS;
};

export const profileService = {
  getProfile: async (userId?: number): Promise<ProfileResponse> => {
    if (IS_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const users = getMockUsers();
      const user = userId 
        ? users.find(u => u.user_id === userId) || users[0]
        : users[0];
        
      return { result: user };
    }

    const response = await apiClient.get<ProfileResponse>("/profile");
    return response.data;
  },

  updateProfile: async (profileData: UserProfile): Promise<ProfileResponse> => {
    if (IS_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const users = getMockUsers();
      const index = users.findIndex(u => u.user_id === profileData.user_id);
      if (index !== -1) {
        users[index] = { ...users[index], ...profileData };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        
        // Also update the session user if it's the one we're editing
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const currentUser = JSON.parse(storedUser);
          if (currentUser.user_id === profileData.user_id) {
            localStorage.setItem("user", JSON.stringify(users[index]));
          }
        }

        return { result: users[index] };
      }
      throw new Error("Không tìm thấy người dùng");
    }

    const response = await apiClient.put<ProfileResponse>("/profile", profileData);
    return response.data;
  }
};
