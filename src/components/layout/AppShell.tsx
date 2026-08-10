import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { signOutUser } from '../../firebase/auth';
import { useAuthStore } from '../../store/authStore';
import { MobileCommandHub } from './MobileCommandHub';
import { useApplications } from '../../hooks/useApplications';
import { useUserSettings } from '../../hooks/useUserSettings';

interface AppShellProps {
  children: React.ReactNode;
}

// ── Nav icon helper
const Ico = ({ d, d2 }: { d: string; d2?: string }) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    {d2 && <path strokeLinecap="round" strokeLinejoin="round" d={d2} />}
  </svg>
);

const NAV_SECTIONS = [
  {
    id: 'dashboard',
    to: '/dashboard',
    label: 'Dashboard',
    icon: <Ico d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    match: ['/dashboard', '/mission'],
  },
  {
    id: 'applications',
    to: '/applications',
    label: 'Applications',
    icon: <Ico d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
    match: ['/applications', '/calendar', '/offer-matrix', '/offer-calculator', '/company-intel'],
    badge: null,
  },
  {
    id: 'journal',
    to: '/journal',
    label: 'Journal',
    icon: <Ico d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    match: ['/journal', '/interviews', '/documents', '/interview-prep', '/mock-interview', '/mindset', '/ai-email-assistant', '/interview-battlecards'],
  },
  {
    id: 'insights',
    to: '/insights',
    label: 'Insights',
    icon: <Ico d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    match: ['/insights', '/skills', '/heatmap', '/goals', '/reports', '/tech-trends', '/achievements', '/career-roadmap'],
  },
  {
    id: 'settings',
    to: '/settings',
    label: 'Settings',
    icon: <Ico d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" d2="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
    match: ['/settings', '/diagnostics', '/deployment-guide'],
  },
];

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const { error } = useApplications();
  const { settings, updateSettings } = useUserSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (settings.lastActive !== today) {
      const newStreak = settings.lastActive === yesterday ? settings.streak + 1 : 1;
      updateSettings({ streak: newStreak, lastActive: today });
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
  }, [user, settings.lastActive, settings.streak, updateSettings]);

  const streak = settings.streak;

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/login');
  };

  const initial = user?.email?.charAt(0).toUpperCase() ?? '?';
  const providerId = user?.providerData?.[0]?.providerId === 'google.com' ? 'Google OAuth' : 'Email/Password';
  const closeMobile = () => setMobileOpen(false);

  const isActive = (match: string[]) =>
    match.some((m) => location.pathname === m || location.pathname.startsWith(m + '/'));

  return (
    <div className={`shell ${collapsed ? 'sidebar-collapsed' : ''}`}>

      {/* ── Mobile Top Bar ── */}
      <div className="mobile-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="s-logo-icon" style={{ width: 32, height: 32 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>ApplyFlow</div>
            <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace', marginTop: 2 }}>
              {user?.email ? `${user.email.split('@')[0]}` : 'Guest'} • {user?.uid ? user.uid.slice(0, 6) : ''}
            </div>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-hamburger-btn"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && <div className="mobile-backdrop" onClick={closeMobile} />}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}>

        {/* Logo + Collapse Toggle */}
        <div className="s-logo">
          <div className="s-logo-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="s-logo-name">ApplyFlow</div>
              <div className="s-logo-tag">Job Search OS</div>
            </div>
          )}
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="s-collapse-btn"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={14} height={14}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d={collapsed
                  ? 'M9 5l7 7-7 7'
                  : 'M15 19l-7-7 7-7'}
              />
            </svg>
          </button>
        </div>

        {/* ── 5 Primary Nav Items ── */}
        <nav className="s-nav">
          {NAV_SECTIONS.map((item) => {
            const active = isActive(item.match);
            return (
              <NavLink
                key={item.id}
                to={item.to}
                onClick={closeMobile}
                title={collapsed ? item.label : undefined}
                className={`s-item s-item-main${active ? ' active' : ''}`}
              >
                <span className="s-icon">{item.icon}</span>
                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!collapsed && item.id === 'dashboard' && streak >= 2 && (
                  <span className="streak-pill">🔥{streak}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── User Footer ── */}
        <div className="s-bottom">
          <div
            className="s-user"
            onClick={handleSignOut}
            title={collapsed ? `${user?.email} (UID: ${user?.uid}) — Click to sign out` : 'Click to sign out'}
          >
            <div className="s-avatar">{initial}</div>
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#ffffff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'Logged In'}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace' }}>
                  UID: {user?.uid ? `${user.uid.slice(0, 8)}…` : '—'} • {providerId}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="main">
        {/* Sync Error Banner if Firestore failed */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              borderBottom: '1px solid #fecaca',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: 13,
              color: '#991b1b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠️</span>
              <div>
                <strong>Database Sync Alert:</strong> {error}
              </div>
            </div>
            <NavLink
              to="/diagnostics"
              style={{
                color: '#7f1d1d',
                fontWeight: 700,
                textDecoration: 'underline',
                fontSize: 12,
              }}
            >
              Run Diagnostics →
            </NavLink>
          </div>
        )}
        {children}
      </div>
      <MobileCommandHub />
    </div>
  );
};
