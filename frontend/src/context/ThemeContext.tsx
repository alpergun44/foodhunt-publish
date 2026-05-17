/**
 * FoodHunt — Theme Context (light / dark)
 * Sistem tercihi default, kullanıcı seçimi localStorage'da kalır.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type ThemePreference = Theme | 'system';

interface ThemeContextValue {
  theme: Theme;             // şu an etkin olan
  preference: ThemePreference; // kullanıcı seçimi
  setPreference: (p: ThemePreference) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'foodhunt_theme';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'system';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // theme-color meta — iOS status bar
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0A0A0A' : '#FAFAFA');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(getInitialPreference);
  const [theme, setTheme] = useState<Theme>(() =>
    getInitialPreference() === 'system' ? getSystemTheme() : (getInitialPreference() as Theme)
  );

  // Tema değişimi
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Tercih değişimi
  useEffect(() => {
    if (preference === 'system') {
      localStorage.removeItem(STORAGE_KEY);
      setTheme(getSystemTheme());
    } else {
      localStorage.setItem(STORAGE_KEY, preference);
      setTheme(preference);
    }
  }, [preference]);

  // Sistem tercih değişimini dinle (kullanıcı manuel seçim yapmadıysa)
  useEffect(() => {
    if (preference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setTheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  const setPreference = (p: ThemePreference) => setPreferenceState(p);
  const toggle = () => setPreferenceState(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
