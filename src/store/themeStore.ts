import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemePalette = 'indigo' | 'emerald' | 'cyan' | 'amber';

export const THEME_PALETTES: { id: ThemePalette; label: string; color: string }[] = [
  { id: 'indigo', label: 'Indigo Cyber', color: '#6366f1' },
  { id: 'emerald', label: 'Emerald Matrix', color: '#10b981' },
  { id: 'cyan', label: 'Cyber Cyan', color: '#06b6d4' },
  { id: 'amber', label: 'Sunset Amber', color: '#f59e0b' },
];

interface ThemeStore {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  palette: ThemePalette;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setPalette: (palette: ThemePalette) => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const applyThemeToDocument = (resolved: 'light' | 'dark', palette: ThemePalette = 'indigo') => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.setAttribute('data-palette', palette);
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark', // Default to sleek executive dark mode
      resolvedTheme: 'dark',
      palette: 'indigo',
      setTheme: (newTheme: ThemeMode) => {
        const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
        applyThemeToDocument(resolved, get().palette);
        set({ theme: newTheme, resolvedTheme: resolved });
      },
      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
        applyThemeToDocument(next, get().palette);
        set({ theme: next, resolvedTheme: next });
      },
      setPalette: (newPalette: ThemePalette) => {
        applyThemeToDocument(get().resolvedTheme, newPalette);
        set({ palette: newPalette });
      },
    }),
    {
      name: 'joborbit_theme_storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = state.theme === 'system' ? getSystemTheme() : state.theme;
          state.resolvedTheme = resolved;
          applyThemeToDocument(resolved, state.palette || 'indigo');
        }
      },
    }
  )
);

// Listen for system theme changes if set to system
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = useThemeStore.getState().theme;
    if (currentTheme === 'system') {
      const resolved = e.matches ? 'dark' : 'light';
      applyThemeToDocument(resolved, useThemeStore.getState().palette);
      useThemeStore.setState({ resolvedTheme: resolved });
    }
  });
}
