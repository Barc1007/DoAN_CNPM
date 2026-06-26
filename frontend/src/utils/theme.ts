export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'darkMode';

export const getStoredTheme = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const applyTheme = (dark: boolean) => {
  const theme: Theme = dark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
};

export const persistTheme = (dark: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(dark));
  } catch {
    /* noop */
  }
};