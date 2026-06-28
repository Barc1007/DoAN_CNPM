import { useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { downloadBackup } from '../services/backupService';

const ONE_DAY = 24 * 60 * 60 * 1000;
const STAMP_KEY = 'lastAutoBackupAt';

export const useAutoBackup = () => {
  const { settings, isLoading } = useSettings();

  useEffect(() => {
    if (isLoading || !settings.auto_backup) return;

    const last = Number(localStorage.getItem(STAMP_KEY) || 0);
    const now = Date.now();
    if (now - last < ONE_DAY) return;

    downloadBackup()
      .then(() => localStorage.setItem(STAMP_KEY, String(now)))
      .catch(() => { /* silent: người dùng tự tải khi cần */ });
  }, [isLoading, settings.auto_backup]);
};