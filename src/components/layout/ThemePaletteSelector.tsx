import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore, ThemePalette } from '../../store/themeStore';

const PALETTES: { id: ThemePalette; label: string; color: string }[] = [
  { id: 'indigo', label: 'Indigo Cyber', color: '#6366f1' },
  { id: 'emerald', label: 'Emerald Matrix', color: '#10b981' },
  { id: 'cyan', label: 'Cyber Cyan', color: '#06b6d4' },
  { id: 'amber', label: 'Sunset Amber', color: '#f59e0b' },
];

interface ThemePaletteSelectorProps {
  showThemeToggle?: boolean;
}

export const ThemePaletteSelector: React.FC<ThemePaletteSelectorProps> = ({
  showThemeToggle = true,
}) => {
  const { resolvedTheme, toggleTheme, palette, setPalette } = useThemeStore();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--page)',
        padding: '3px 8px',
        borderRadius: 20,
        border: '1px solid var(--border)',
      }}
    >
      {/* Light / Dark Mode Toggle */}
      {showThemeToggle && (
        <>
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
        </>
      )}

      {/* Palette Color Dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {PALETTES.map((p) => {
          const isActive = palette === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPalette(p.id)}
              style={{
                width: 17,
                height: 17,
                borderRadius: '50%',
                background: p.color,
                border: isActive ? '2px solid var(--t1)' : '1px solid rgba(0,0,0,0.15)',
                cursor: 'pointer',
                transform: isActive ? 'scale(1.2)' : 'scale(1)',
                boxShadow: isActive ? `0 0 8px ${p.color}80` : 'none',
                transition: 'all 0.15s ease',
                padding: 0,
                position: 'relative',
              }}
              title={`Switch accent to ${p.label}`}
              aria-label={p.label}
            />
          );
        })}
      </div>
    </div>
  );
};
