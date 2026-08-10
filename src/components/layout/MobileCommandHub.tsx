import { Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandCategory {
  title: string;
  items: { to: string; label: string; icon: React.ReactNode; isAi?: boolean }[];
}

const Ic = ({ d }: { d: string }) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const CATEGORIES: CommandCategory[] = [
  {
    title: '🏠 Home',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: <Ic d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    ],
  },
  {
    title: 'Applications',
    items: [
      { to: '/applications', label: 'Kanban Board', icon: <Ic d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
      { to: '/calendar', label: 'Interview Calendar', icon: <Ic d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
      { to: '/company-intel', label: 'Company Intel', icon: <Ic d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> },
      { to: '/offer-calculator', label: 'Offer Calculator', icon: <Ic d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /> },
    ],
  },
  {
    title: '📚 Journal',
    items: [
      { to: '/journal', label: 'Interview Notes', icon: <Ic d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /> },
      { to: '/journal', label: 'Documents', icon: <Ic d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
      { to: '/journal', label: 'Mock Interview', isAi: true, icon: <Ic d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" /> },
      { to: '/journal', label: 'Mindset Studio', icon: <Ic d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    ],
  },
  {
    title: 'Insights',
    items: [
      { to: '/insights', label: 'Analytics', icon: <Ic d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
      { to: '/insights', label: 'Skills Radar', icon: <Ic d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /> },
      { to: '/insights', label: 'Activity Heatmap', icon: <Ic d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
      { to: '/insights', label: 'Tech Trends', icon: <Ic d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /> },
    ],
  },
  {
    title: '🤖 AI Tools',
    items: [
      { to: '/ats-optimizer', label: 'ATS Optimizer', isAi: true, icon: <Ic d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /> },
      { to: '/auto-apply-copilot', label: 'Auto-Apply AI', isAi: true, icon: <Ic d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /> },
      { to: '/salary-negotiation', label: 'Salary Negotiator', isAi: true, icon: <Ic d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
      { to: '/referrals', label: 'Referral CRM', icon: <Ic d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
    ],
  },
];

export const MobileCommandHub: React.FC = () => {
  const [hubOpen, setHubOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    setHubOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* ── Liquid Glass Bottom Dock Bar (Mobile Only) ── */}
      <div className="mobile-bottom-dock">
        <NavLink to="/dashboard" className={({ isActive }) => `dock-item${isActive ? ' active' : ''}`}>
          <div className="dock-icon-box">
            <Ic d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </div>
          <span className="dock-label">Home</span>
        </NavLink>

        <NavLink to="/applications" className={({ isActive }) => `dock-item${isActive ? ' active' : ''}`}>
          <div className="dock-icon-box">
            <Ic d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </div>
          <span className="dock-label">Apps</span>
        </NavLink>

        {/* Center Launchpad Button */}
        <button onClick={() => setHubOpen(true)} className="dock-hub-btn" aria-label="Open Launchpad">
          <span className="dock-hub-inner">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ffffff" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </span>
        </button>

        <NavLink to="/journal" className={({ isActive }) => `dock-item${isActive ? ' active' : ''}`}>
          <div className="dock-icon-box">
            <Ic d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </div>
          <span className="dock-label">Journal</span>
        </NavLink>

        <NavLink to="/insights" className={({ isActive }) => `dock-item${isActive ? ' active' : ''}`}>
          <div className="dock-icon-box">
            <Ic d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </div>
          <span className="dock-label">Insights</span>
        </NavLink>
      </div>

      {/* ── Full-Screen Launchpad Overlay ── */}
      <AnimatePresence>
        {hubOpen && (
          <motion.div
            className="mobile-hub-overlay"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="mobile-hub-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="hub-badge-3d">
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ffffff" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                    ApplyFlow Launchpad
                  </h2>
                  <div style={{ fontSize: 11.5, color: '#a5b4fc', fontWeight: 600 }}>
                    All Features & AI Tools
                  </div>
                </div>
              </div>
              <button onClick={() => setHubOpen(false)} className="mobile-hub-close">✕</button>
            </div>

            {/* Hub Feature Grid */}
            <div className="mobile-hub-body">
              {CATEGORIES.map((cat) => (
                <div key={cat.title} style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                    {cat.title}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {cat.items.map((item) => (
                      <div
                        key={item.label}
                        onClick={() => handleNavigate(item.to)}
                        className="mobile-hub-card"
                      >
                        <div className={`hub-card-icon-3d ${item.isAi ? 'ai-pulse' : ''}`}>
                          {item.icon}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                            {item.label}
                          </span>
                          {item.isAi && (
                            <span style={{ fontSize: 9.5, fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>
                              <Sparkles className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> AI Powered
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
