import apiClient from '../../../services/apiClient';

export interface UserSettings {
  dark_mode: boolean;
  tx_notifications: boolean;
  budget_reminders: boolean;
  auto_backup: boolean;
}

export type SettingsPatch = Partial<UserSettings>;

const settingsService = {
  get: async (): Promise<UserSettings> => {
    const res = await apiClient.get('/settings');
    return res.data.result;
  },

  update: async (patch: SettingsPatch): Promise<UserSettings> => {
    const res = await apiClient.put('/settings', patch);
    return res.data.result;
  },
};

export default settingsService;