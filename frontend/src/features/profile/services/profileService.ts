import apiClient from "../../../services/apiClient";
import type { UserProfile } from "../../../types/profile";

const IS_MOCK = false;

export const profileService = {
  getProfile: async (_userId?: number): Promise<UserProfile> => {
    if (IS_MOCK) {
      const { MOCK_USERS } = await import("../../../data/userData");
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_USERS[0];
    }

    const response = await apiClient.get<unknown, UserProfile>("/profile");
    return response;
  },

  updateProfile: async (profileData: UserProfile): Promise<UserProfile> => {
    if (IS_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return profileData;
    }

    const response = await apiClient.put<unknown, UserProfile>("/profile", profileData);
    return response;
  }
};