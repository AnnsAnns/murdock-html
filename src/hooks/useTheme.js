import { useCallback, useEffect, useState } from 'react';

// Bort's enum order; `trans` ships in CSS but is skipped when cycling.
export const THEMES = [
  'latenightbath',
  'ayy4',
  'curiosities',
  'sunnyswamp',
  'standard_og',
  'werwolvdark',
  'nostalgia',
];

const STORAGE_KEY = 'murdock-theme';
const DEFAULT_THEME = 'latenightbath';

function readTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && THEMES.includes(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setTheme((current) => THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]);
  }, []);

  return { theme, cycleTheme };
}
