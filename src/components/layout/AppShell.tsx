import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  TrendingUp,
  User,
  Flame,
  AlertTriangle,
  Menu,
  X,
  ExternalLink,
  Plus,
  LogOut,
  Search,
  Info,
  Keyboard,
  Sun,
  Moon,
  CheckCircle2,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandPalette } from './CommandPalette';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { BrandLogo } from '../common/BrandLogo';
import { useAuthStore } from '../../store/authStore';
import { signOutUser } from '../../firebase/auth';
import { useApplications } from '../../hooks/useApplications';
import { useUserSettings } from '../../hooks/useUserSettings';
import { useThemeStore } from '../../store/themeStore';

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_SECTIONS = [
  {
    id: 'dashboard',
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    match: ['/dashboard', '/mission'],
  },
  {
    id: 'applications',
    to: '/applications',
    label: 'Applications',
    icon: Briefcase,
    match: ['/applications', '/calendar', '/offer-matrix', '/offer-calculator', '/company-intel'],
  },
  {
    id: 'journal',
    to: '/journal',
    label: 'Journal',
    icon: BookOpen,
    match: ['/journal', '/interviews', '/documents', '/interview-prep', '/mock-interview', '/mindset', '/ai-email-assistant', '/interview-battlecards'],
  },
  {
    id: 'insights',
    to: '/insights',
    label: 'Insights',
    icon: TrendingUp,
    match: ['/insights', '/skills', '/heatmap', '/goals', '/reports', '/tech-trends', '/achievements', '/career-roadmap'],
  },
];

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const { applications, error } = useApplications();
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [boostSuccess, setBoostSuccess] = useState(false);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);

  // Global Cmd+K / Ctrl+K & '?' keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      } else if (e.key === '?' && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShortcutsOpen(false);
        setPaletteOpen(false);
        setMobileOpen(false);
        setStreakModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Safe streak check: Only update once settings are finished loading from Firestore
  useEffect(() => {
    if (!user || settingsLoading) return;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (settings.lastActive && settings.lastActive !== today) {
      const newStreak = settings.lastActive === yesterday ? (settings.streak || 1) + 1 : 1;
      updateSettings({ streak: newStreak, lastActive: today });
    } else if (!settings.lastActive) {
      updateSettings({ streak: Math.max(settings.streak || 1, 1), lastActive: today });
    }

    try {
      const todayISO = new Date().toISOString().split('T')[0];
      const storageKey = `applyflow_activity_log_${user.uid}`;
      const existing: Record<string, number> = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (!existing[todayISO]) {
        existing[todayISO] = 1;
        localStorage.setItem(storageKey, JSON.stringify(existing));
      }
    } catch (e) {
      console.error('Heatmap activity log error:', e);
    }
  }, [user, settingsLoading, settings.lastActive, settings.streak, updateSettings]);

  // Compute live streak from actual application dates + activity log + settings
  const computedStreak = useMemo(() => {
    const activeDays = new Set<string>();

    applications.forEach((app) => {
      const d = app.appliedDate || app.createdAt;
      if (d) {
        const dateStr = new Date(d).toISOString().split('T')[0];
        activeDays.add(dateStr);
      }
    });

    if (user?.uid) {
      try {
        const storageKey = `applyflow_activity_log_${user.uid}`;
        const existing: Record<string, number> = JSON.parse(localStorage.getItem(storageKey) || '{}');
        Object.keys(existing).forEach((d) => activeDays.add(d));
      } catch {
        // ignore
      }
    }

    const todayISO = new Date().toISOString().split('T')[0];
    if (settings.lastActive === new Date().toDateString()) {
      activeDays.add(todayISO);
    }

    const now = new Date();
    let count = 0;
    const cursor = new Date(now);
    const getISO = (d: Date) => d.toISOString().split('T')[0];

    // Check starting today
    while (activeDays.has(getISO(cursor))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }

    // If no activity yet today, check starting yesterday
    if (count === 0) {
      cursor.setTime(now.getTime());
      cursor.setDate(cursor.getDate() - 1);
      while (activeDays.has(getISO(cursor))) {
        count++;
        cursor.setDate(cursor.getDate() - 1);
      }
    }

    return Math.max(count, settings.streak || 1);
  }, [applications, user, settings.lastActive, settings.streak]);

  const handleBoostStreak = () => {
    const today = new Date().toDateString();
    const todayISO = new Date().toISOString().split('T')[0];
    const newStreak = computedStreak + 1;
    updateSettings({ streak: newStreak, lastActive: today });

    if (user?.uid) {
      try {
        const storageKey = `applyflow_activity_log_${user.uid}`;
        const existing: Record<string, number> = JSON.parse(localStorage.getItem(storageKey) || '{}');
        existing[todayISO] = (existing[todayISO] || 0) + 1;
        localStorage.setItem(storageKey, JSON.stringify(existing));
      } catch {
        // ignore
      }
    }

    setBoostSuccess(true);
    setTimeout(() => setBoostSuccess(false), 2500);
  };

  const streak = computedStreak;
  const initial = (settings?.displayName || user?.email || 'U').charAt(0).toUpperCase();
  const displayName = settings?.displayName || (user?.email ? user.email.split('@')[0] : 'Candidate');
  const activeCount = applications.filter((a) => ['Applied', 'OA/Assessment', 'Interview'].includes(a.status)).length;
  const interviewCount = applications.filter((a) => a.status === 'Interview').length;

  const isActive = (match: string[]) =>
    match.some((m) => location.pathname === m || location.pathname.startsWith(m + '/'));

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/login');
  };

  return (
    <div className="shell">
      {/* ── Floating Top Glass Island Navigation ── */}
      <header className="floating-nav-wrapper">
        <nav className="floating-island-nav">
          {/* Left Brand & Streak */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <NavLink to="/dashboard" className="nav-brand">
              <BrandLogo size={36} showGlow />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="nav-brand-title">Job Orbit</span>
                <span className="nav-brand-badge">Career OS</span>
              </div>
            </NavLink>

            {/* Clickable Active Streak Pill */}
            <button
              type="button"
              onClick={() => setStreakModalOpen(true)}
              className="nav-streak-pill"
              title={`${streak} day active streak • Click to view activity & boost`}
              style={{
                cursor: 'pointer',
                border: 'none',
                outline: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                transition: 'transform 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Flame style={{ width: 14, height: 14, color: 'var(--streak)' }} />
              <span>{streak}d streak</span>
            </button>
          </div>

          {/* Center Navigation Pills (Desktop Only) */}
          <div className="nav-pills">
            {NAV_SECTIONS.map((item) => {
              const active = isActive(item.match);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  className={`nav-pill-item${active ? ' active' : ''}`}
                >
                  <Icon style={{ width: 15, height: 15 }} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Right Search, Profile Capsule & Mobile Toggle */}
          <div className="nav-right-actions">
            {/* Quick Spotlight Search Trigger */}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="nav-search-btn"
              title="Quick Search & Actions (Ctrl+K / ⌘K)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 12px',
                borderRadius: 12,
                background: 'var(--page)',
                border: '1px solid var(--border)',
                color: 'var(--t2)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Search style={{ width: 14, height: 14, color: 'var(--accent)' }} />
              <span className="nav-search-label" style={{ color: 'var(--t3)' }}>Search…</span>
              <kbd
                style={{
                  fontSize: 10,
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  color: 'var(--t3)',
                  fontWeight: 700,
                }}
              >
                ⌘K
              </kbd>
            </button>

            {/* Shortcuts Guide Button */}
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              className="nav-shortcuts-btn"
              title="Keyboard Shortcuts Cheatsheet (?)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                borderRadius: 12,
                background: 'var(--page)',
                border: '1px solid var(--border)',
                color: 'var(--t2)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Keyboard style={{ width: 15, height: 15 }} />
            </button>

            {/* Theme Toggle Button (Light/Dark Mode) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="nav-theme-btn"
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label={`Current theme is ${resolvedTheme}. Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode.`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                borderRadius: 12,
                background: 'var(--page)',
                border: '1px solid var(--border)',
                color: resolvedTheme === 'dark' ? '#fbbf24' : 'var(--t2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {resolvedTheme === 'dark' ? (
                <Sun style={{ width: 15, height: 15 }} />
              ) : (
                <Moon style={{ width: 15, height: 15 }} />
              )}
            </button>

            <NavLink
              to="/profile"
              className="nav-profile-pill"
              title="View Profile & Settings"
            >
              <div className="nav-profile-avatar">{initial}</div>
              <span className="nav-profile-name" style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </span>
            </NavLink>

            <NavLink
              to="/about"
              className="nav-about-btn"
              title="About Job Orbit & Creator Credits (Deepith)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 12,
                background: location.pathname === '/about' ? '#ffffff' : 'var(--page)',
                border: '1px solid var(--border)',
                color: location.pathname === '/about' ? 'var(--accent)' : 'var(--t2)',
                boxShadow: location.pathname === '/about' ? '0 1px 3px rgba(28, 25, 23, 0.05)' : 'none',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Info style={{ width: 14, height: 14, color: location.pathname === '/about' ? 'var(--accent)' : 'var(--t2)' }} />
              <span className="nav-about-label">About</span>
            </NavLink>

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-nav-toggle"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Sheet if Open */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(28, 25, 23, 0.55)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 16px 24px',
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{
              background: 'var(--card)',
              borderRadius: 22,
              padding: '20px 18px',
              marginTop: 58,
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Profile Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <div className="nav-profile-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                {initial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email || 'Logged In Candidate'}
                </div>
              </div>
              {streak >= 1 && (
                <div className="nav-streak-pill" style={{ display: 'inline-flex' }}>
                  <Flame style={{ width: 13, height: 13, color: 'var(--streak)' }} />
                  <span>{streak}d</span>
                </div>
              )}
            </div>

            {/* Mobile Executive Summary Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10,
                background: 'var(--page)',
                padding: 10,
                borderRadius: 14,
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ padding: '8px 10px', background: 'var(--card)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>Active Leads</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', marginTop: 2 }}>{activeCount}</div>
              </div>
              <div style={{ padding: '8px 10px', background: 'var(--card)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>Interviews</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#d97706', marginTop: 2 }}>{interviewCount}</div>
              </div>
            </div>

            {/* Navigation Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {NAV_SECTIONS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.match);
                return (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '11px 14px',
                      borderRadius: 12,
                      fontSize: 13.5,
                      fontWeight: 700,
                      textDecoration: 'none',
                      background: active ? 'var(--accent-bg)' : 'transparent',
                      color: active ? 'var(--accent)' : 'var(--t1)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon style={{ width: 17, height: 17 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </NavLink>
                );
              })}

              <NavLink
                to="/profile"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 13.5,
                  fontWeight: 700,
                  textDecoration: 'none',
                  background: location.pathname === '/profile' || location.pathname === '/settings' ? 'var(--accent-bg)' : 'transparent',
                  color: location.pathname === '/profile' || location.pathname === '/settings' ? 'var(--accent)' : 'var(--t1)',
                }}
              >
                <User style={{ width: 17, height: 17 }} />
                <span>Profile & Settings</span>
              </NavLink>

              <NavLink
                to="/about"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 13.5,
                  fontWeight: 700,
                  textDecoration: 'none',
                  background: location.pathname === '/about' ? 'var(--accent-bg)' : 'transparent',
                  color: location.pathname === '/about' ? 'var(--accent)' : 'var(--t1)',
                }}
              >
                <Info style={{ width: 17, height: 17 }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>About & Credits</span>
                  <span style={{ fontSize: 10.5, color: 'var(--accent)', fontWeight: 600 }}>Crafted by Deepith</span>
                </div>
              </NavLink>
            </div>

            {/* Mobile Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 700,
                color: 'var(--t1)',
                background: 'var(--page)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {resolvedTheme === 'dark' ? <Sun style={{ width: 17, height: 17, color: '#fbbf24' }} /> : <Moon style={{ width: 17, height: 17, color: 'var(--t2)' }} />}
              <span style={{ flex: 1, textAlign: 'left' }}>Theme</span>
              <span style={{ fontSize: 12, color: 'var(--accent)', textTransform: 'capitalize', fontWeight: 600 }}>{resolvedTheme} Mode</span>
            </button>

            {/* Sign Out Action */}
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                color: '#dc2626',
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                cursor: 'pointer',
                marginTop: 4,
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <LogOut style={{ width: 15, height: 15 }} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Main Workspace Content ── */}
      <main className="main">
        {/* Sync Error Alert Banner if Firestore connection is interrupted */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 14,
              padding: '12px 20px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: 13,
              color: '#991b1b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle style={{ width: 16, height: 16, color: '#ef4444' }} />
              <div>
                <strong>Database Sync Notice:</strong> {error}
              </div>
            </div>
            <NavLink
              to="/diagnostics"
              style={{
                color: '#7f1d1d',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'underline',
                fontSize: 12,
              }}
            >
              <span>Run Diagnostics</span>
              <ExternalLink style={{ width: 12, height: 12 }} />
            </NavLink>
          </div>
        )}

        {children}

        {/* ── Real-World Workspace Footer & Credits (Only on Dashboard & pinned to bottom) ── */}
        {location.pathname === '/dashboard' && (
          <footer
            style={{
              marginTop: 'auto',
              paddingTop: 36,
              paddingBottom: 24,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              fontSize: 12,
              color: 'var(--t3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BrandLogo size={18} />
              <span style={{ fontWeight: 700, color: 'var(--t1)' }}>Job Orbit</span>
              <span>•</span>
              <span>Crafted with passion by <strong style={{ color: 'var(--accent)' }}>Deepith</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <NavLink to="/about" style={{ color: 'var(--t2)', textDecoration: 'none', fontWeight: 600 }}>
                About & Credits
              </NavLink>
              <NavLink to="/diagnostics" style={{ color: 'var(--t2)', textDecoration: 'none', fontWeight: 600 }}>
                System Status
              </NavLink>
              <span>v2.5.0</span>
            </div>
          </footer>
        )}
      </main>

      {/* ── Creative Mobile Quick-Capture FAB Button ── */}
      <NavLink
        to="/applications?action=new"
        className="mobile-fab"
        title="Add Application"
      >
        <Plus style={{ width: 18, height: 18 }} />
        <span>Add Lead</span>
      </NavLink>

      {/* ── Global Command+K Spotlight Palette ── */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* ── Global Keyboard Shortcuts Cheatsheet Modal ── */}
      <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* ── Interactive Streak & Activity Modal ── */}
      <AnimatePresence>
        {streakModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
            onClick={() => setStreakModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{
                width: '100%',
                maxWidth: 420,
                padding: 24,
                borderRadius: 16,
                background: 'var(--card)',
                border: '1.5px solid var(--border)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setStreakModalOpen(false)}
                className="btn-ghost"
                style={{ position: 'absolute', top: 12, right: 12, padding: 6, borderRadius: 8 }}
              >
                ✕
              </button>

              {/* Animated Flame Badge */}
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)',
                  border: '1.5px solid rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 24px rgba(245, 158, 11, 0.25)',
                }}
              >
                <Flame style={{ width: 36, height: 36, color: 'var(--streak)' }} />
              </div>

              <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--t1)', margin: 0 }}>
                {streak} Day Active Streak
              </h3>
              <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 6, lineHeight: 1.5 }}>
                You're building consistent interview momentum. Daily submissions and prep keep your career trajectory on fire!
              </p>

              {/* Status pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: 12.5,
                  fontWeight: 700,
                  margin: '12px 0 18px',
                }}
              >
                <CheckCircle2 style={{ width: 14, height: 14 }} />
                <span>Streak Protected Today</span>
              </div>

              {/* Stats Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'var(--card-hover)',
                  border: '1px solid var(--border)',
                  marginBottom: 18,
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase' }}>Active Applications</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginTop: 2 }}>{activeCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase' }}>Interviews in Pipeline</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', marginTop: 2 }}>{interviewCount}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleBoostStreak}
                  className="btn"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 13,
                    background: boostSuccess ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                    color: '#fff',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <Sparkles style={{ width: 15, height: 15 }} />
                  <span>{boostSuccess ? 'Streak Boosted! 🔥 (+1 Day)' : 'Boost Today\'s Activity Streak'}</span>
                </button>

                <button
                  onClick={() => {
                    setStreakModalOpen(false);
                    navigate('/insights');
                  }}
                  className="btn"
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 12.5,
                    background: 'var(--card-hover)',
                    border: '1px solid var(--border)',
                    color: 'var(--t1)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Calendar style={{ width: 14, height: 14, color: 'var(--accent)' }} />
                  <span>View 52-Week Heatmap & Velocity</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
