import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore, ThemePalette } from '../../store/themeStore';

const PALETTES: { id: ThemePalette; label: string; color: string }[] = [
  { id: 'indigo', label: 'Indigo Cyber', color: '#6366f1' },
  { id: 'emerald', label: 'Emerald Matrix', color: '#10b981' },
  { id: 'cyan', label: 'Cyber Cyan', color: '#06b6d4' },
  { id: 'amber', label: 'Sunset Amber', color: '#f59e0b' },
];

export const ThemePaletteSelector: React.FC = () => {
  const { resolvedTheme, toggleTheme, palette, setPalette } = useThemeStore();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--page)',
        padding: '3px 8px',
        borderRadius: 20,
        border: '1px solid var(--border)',
      }}
    >
      {/* Light / Dark Mode Toggle */}
      <button
        onClick={toggleTheme}
        className="btn btn-ghost"
        style={{
          padding: 4,
          borderRadius: 8,
          color: 'var(--t2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
      >
        {resolvedTheme === 'dark' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#6366f1" />}
      </button>

      <div style={{ width: 1, height: 14, background: 'var(--border)' }} />

      {/* Palette Color Dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {PALETTES.map((p) => {
          const isActive = palette === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPalette(p.id)}
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: p.color,
                border: isActive ? '2px solid var(--t1)' : '1px solid transparent',
                cursor: 'pointer',
                transform: isActive ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.15s ease',
                padding: 0,
              }}
              title={`Switch accent to ${p.label}`}
            />
          );
        })}
      </div>
    </div>
  );
};
