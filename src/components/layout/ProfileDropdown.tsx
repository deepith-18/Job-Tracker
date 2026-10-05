import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  User,
  Sun,
  Moon,
  Keyboard,
  Info,
  LogOut,
  Briefcase,
  Shield,
  Flame,
  Check,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore, THEME_PALETTES } from '../../store/themeStore';
import { useUserSettings } from '../../hooks/useUserSettings';
import { useApplications } from '../../hooks/useApplications';
import { signOutUser } from '../../firebase/auth';

interface ProfileDropdownProps {
  onOpenShortcuts: () => void;
  onOpenStreakModal: () => void;
  streak: number;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  onOpenShortcuts,
  onOpenStreakModal,
  streak,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const { settings } = useUserSettings();
  const { applications } = useApplications();
  const { resolvedTheme, toggleTheme, palette, setPalette } = useThemeStore();

  const initial = (settings?.displayName || user?.email || 'U').charAt(0).toUpperCase();
  const displayName = settings?.displayName || (user?.email ? user.email.split('@')[0] : 'Candidate');
  const targetRole = settings?.targetTitle || 'Software Engineer';
  const activeCount = applications.filter((a) => ['Applied', 'OA/Assessment', 'Interview'].includes(a.status)).length;
  const offerCount = applications.filter((a) => a.status === 'Offer').length;

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOutUser();
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* ── Avatar Capsule Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '3px 10px 3px 4px',
          borderRadius: 24,
          background: isOpen ? 'var(--card-hover)' : 'var(--page)',
          border: isOpen ? '1.5px solid var(--accent)' : '1px solid var(--border)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 3px var(--accent-glow)' : 'var(--shadow)',
        }}
        title="Account & Quick Settings"
        aria-expanded={isOpen}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12.5,
            fontWeight: 800,
            boxShadow: '0 2px 8px var(--accent-glow)',
            flexShrink: 0,
          }}
        >
          {initial}
        </div>
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: 'var(--t1)',
            maxWidth: 80,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </span>
      </button>

      {/* ── Glassmorphic Dropdown Popover ── */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 300,
            background: 'var(--card)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: 18,
            border: '1px solid var(--border)',
            boxShadow: '0 16px 36px -4px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--accent-glow)',
            zIndex: 9999,
            overflow: 'hidden',
            animation: 'fadeInSlide 0.15s ease',
          }}
        >
          {/* User Profile Header */}
          <div
            style={{
              padding: '16px 18px',
              background: 'linear-gradient(135deg, var(--page) 0%, var(--card) 100%)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 800,
                  boxShadow: '0 4px 12px var(--accent-glow)',
                  flexShrink: 0,
                }}
              >
                {initial}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--accent)', fontWeight: 600, marginTop: 1 }}>
                  {targetRole}
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 12,
                padding: '7px 10px',
                borderRadius: 10,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--t2)' }}>
                <Briefcase size={12} color="var(--accent)" />
                <span><strong>{activeCount}</strong> active</span>
              </div>
              {offerCount > 0 && (
                <div style={{ color: '#10b981', background: '#10b98115', padding: '1px 6px', borderRadius: 6 }}>
                  {offerCount} {offerCount === 1 ? 'offer' : 'offers'}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenStreakModal();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  color: 'var(--streak)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
                title="View Streak Activity"
              >
                <Flame size={12} />
                <span>{streak}d</span>
              </button>
            </div>
          </div>

          {/* ── Appearance & Theme Customizer (Cleanly Nested!) ── */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Appearance
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="btn btn-ghost btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 8,
                  color: 'var(--t1)',
                  border: '1px solid var(--border)',
                  background: 'var(--page)',
                }}
              >
                {resolvedTheme === 'dark' ? <Sun size={12} color="#f59e0b" /> : <Moon size={12} color="var(--accent)" />}
                <span>{resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>

            {/* Accent Palette Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>Accent Color Theme</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {THEME_PALETTES.map((p) => {
                  const isActive = palette === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPalette(p.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        padding: '6px 8px',
                        borderRadius: 8,
                        background: isActive ? 'var(--page)' : 'transparent',
                        border: isActive ? `1.5px solid ${p.color}` : '1px solid var(--border)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: p.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isActive && <Check size={8} color="#ffffff" strokeWidth={3} />}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: isActive ? 800 : 600,
                          color: isActive ? 'var(--t1)' : 'var(--t2)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {p.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Quick Tools & Navigation Links ── */}
          <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <NavLink
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="dropdown-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--t1)',
                textDecoration: 'none',
                transition: 'all 0.12s ease',
              }}
            >
              <User size={14} color="var(--accent)" />
              <span style={{ flex: 1 }}>Profile & Settings</span>
              <ChevronRight size={13} color="var(--t3)" />
            </NavLink>

            <NavLink
              to="/search-doctor"
              onClick={() => setIsOpen(false)}
              className="dropdown-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--t1)',
                textDecoration: 'none',
                transition: 'all 0.12s ease',
              }}
            >
              <Activity size={14} color="#10b981" />
              <span style={{ flex: 1 }}>Pipeline Diagnostics</span>
              <span style={{ fontSize: 10, color: '#10b981', fontWeight: 800, background: '#10b98115', padding: '1px 6px', borderRadius: 6 }}>
                Audit
              </span>
            </NavLink>

            <NavLink
              to="/war-room"
              onClick={() => setIsOpen(false)}
              className="dropdown-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--t1)',
                textDecoration: 'none',
                transition: 'all 0.12s ease',
              }}
            >
              <Shield size={14} color="#f59e0b" />
              <span style={{ flex: 1 }}>Live Interview War Room</span>
              <ChevronRight size={13} color="var(--t3)" />
            </NavLink>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenShortcuts();
              }}
              className="dropdown-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--t1)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.12s ease',
              }}
            >
              <Keyboard size={14} color="var(--t2)" />
              <span style={{ flex: 1 }}>Keyboard Shortcuts</span>
              <kbd style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'var(--page)', border: '1px solid var(--border)', color: 'var(--t3)' }}>
                ?
              </kbd>
            </button>

            <NavLink
              to="/about"
              onClick={() => setIsOpen(false)}
              className="dropdown-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--t1)',
                textDecoration: 'none',
                transition: 'all 0.12s ease',
              }}
            >
              <Info size={14} color="var(--t3)" />
              <span style={{ flex: 1 }}>About Job Orbit</span>
              <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>Deepith</span>
            </NavLink>
          </div>

          {/* ── Sign Out ── */}
          <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '8px 10px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--danger)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.12s ease',
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
