import { useCallback, useEffect, useState } from 'react';
import settingsService from '../services/settingsService';
import type { UserSettings, SettingsPatch } from '../services/settingsService';

const DEFAULTS: UserSettings = {
  dark_mode: false,
  tx_notifications: true,
  budget_reminders: true,
  auto_backup: false,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = () => {
    const stored = localStorage.getItem('user');
    if (!stored) return false;
    try {
      const user = JSON.parse(stored);
      return !!user.token;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated()) {
      setIsLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await settingsService.get();
        if (!cancelled) setSettings({ ...DEFAULTS, ...data });
      } catch {
        if (!cancelled) setError('Không tải được cài đặt');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const update = useCallback(async (patch: SettingsPatch) => {
    const prev = settings;
    const optimistic = { ...prev, ...patch };
    setSettings(optimistic);
    try {
      const saved = await settingsService.update(patch);
      setSettings({ ...DEFAULTS, ...saved });
      return saved;
    } catch (err) {
      setSettings(prev);
      throw err;
    }
  }, [settings]);

  return { settings, isLoading, error, update };
};