import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Briefcase,
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  User,
  Plus,
  ArrowRight,
  X,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { useApplications } from '../../hooks/useApplications';
import { useThemeStore } from '../../store/themeStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { applications } = useApplications();
  const navigate = useNavigate();
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Static navigation routes
  const staticCommands = [
    {
      id: 'cmd-dashboard',
      category: 'Navigation',
      title: 'Go to Dashboard',
      subtitle: 'Executive overview and telemetry',
      icon: LayoutDashboard,
      action: () => navigate('/dashboard'),
    },
    {
      id: 'cmd-applications',
      category: 'Navigation',
      title: 'Go to Applications Pipeline',
      subtitle: 'Kanban, table, and cards views',
      icon: Briefcase,
      action: () => navigate('/applications'),
    },
    {
      id: 'cmd-journal',
      category: 'Navigation',
      title: 'Go to Interview Journal',
      subtitle: 'Notes, battlecards, and prep studio',
      icon: BookOpen,
      action: () => navigate('/journal'),
    },
    {
      id: 'cmd-insights',
      category: 'Navigation',
      title: 'Go to Insights & Analytics',
      subtitle: 'Velocity, conversion rates, and goal radar',
      icon: TrendingUp,
      action: () => navigate('/insights'),
    },
    {
      id: 'cmd-profile',
      category: 'Navigation',
      title: 'Go to Profile & Settings',
      subtitle: 'Candidate bio, target roles, and data export',
      icon: User,
      action: () => navigate('/profile'),
    },
    {
      id: 'cmd-about',
      category: 'Navigation',
      title: 'About Job Orbit & Creator Credits',
      subtitle: 'Designed & architected by Deepith • System tech stack & vision',
      icon: Sparkles,
      action: () => navigate('/about'),
    },
    {
      id: 'cmd-theme',
      category: 'Preferences',
      title: `Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`,
      subtitle: `Currently in ${resolvedTheme} mode • Easy sight appearance`,
      icon: resolvedTheme === 'dark' ? Sun : Moon,
      action: () => toggleTheme(),
    },
    {
      id: 'cmd-add-app',
      category: 'Actions',
      title: 'Add New Job Application',
      subtitle: 'Open the job application modal',
      icon: Plus,
      action: () => navigate('/applications?action=new'),
    },
  ];

  // Dynamic application matches
  const matchedApps = query.trim()
    ? applications
        .filter(
          (a) =>
            a.company.toLowerCase().includes(query.toLowerCase()) ||
            a.role.toLowerCase().includes(query.toLowerCase()) ||
            a.status.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
        .map((a) => ({
          id: `app-${a.id}`,
          category: 'Applications',
          title: `${a.company} — ${a.role}`,
          subtitle: `Status: ${a.status} • Rating: ${a.rating ? `${a.rating}/5 stars` : 'Unrated'}`,
          icon: Briefcase,
          action: () => navigate(`/applications?search=${encodeURIComponent(a.company)}`),
        }))
    : [];

  const matchedStatic = query.trim()
    ? staticCommands.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : staticCommands;

  const allItems = [...matchedApps, ...matchedStatic];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allItems[selectedIndex]) {
          allItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allItems, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(28, 25, 23, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '80px 16px 24px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 420 }}
            style={{
              width: '100%',
              maxWidth: 620,
              background: 'var(--card)',
              borderRadius: 18,
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <Search style={{ width: 18, height: 18, color: 'var(--accent)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search companies, roles, actions, pages… (Esc to close)"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--t1)',
                  background: 'transparent',
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--t3)',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  <X style={{ width: 15, height: 15 }} />
                </button>
              )}
            </div>

            {/* Results List */}
            <div
              style={{
                maxHeight: 380,
                overflowY: 'auto',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {allItems.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--t3)', fontSize: 13.5 }}>
                  No matching companies or actions found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                allItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 12,
                        cursor: 'pointer',
                        background: isSelected ? 'var(--page)' : 'transparent',
                        border: isSelected ? '1px solid var(--border)' : '1px solid transparent',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 9,
                            background: isSelected ? '#ffffff' : 'var(--page)',
                            border: '1px solid var(--border)',
                            color: isSelected ? 'var(--accent)' : 'var(--t2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon style={{ width: 16, height: 16 }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: isSelected ? 'var(--accent)' : 'var(--t1)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              fontSize: 11.5,
                              color: 'var(--t3)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginTop: 1,
                            }}
                          >
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'var(--border-light)',
                            color: 'var(--t3)',
                          }}
                        >
                          {item.category}
                        </span>
                        {isSelected && <ArrowRight style={{ width: 14, height: 14, color: 'var(--accent)' }} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Hints */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 18px',
                borderTop: '1px solid var(--border)',
                background: 'var(--page)',
                fontSize: 11.5,
                color: 'var(--t3)',
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span>
                  <kbd style={{ padding: '2px 6px', background: 'var(--card-hover)', color: 'var(--t2)', border: '1px solid var(--border)', borderRadius: 5, fontWeight: 700 }}>↑</kbd>{' '}
                  <kbd style={{ padding: '2px 6px', background: 'var(--card-hover)', color: 'var(--t2)', border: '1px solid var(--border)', borderRadius: 5, fontWeight: 700 }}>↓</kbd> navigate
                </span>
                <span>
                  <kbd style={{ padding: '2px 6px', background: 'var(--card-hover)', color: 'var(--t2)', border: '1px solid var(--border)', borderRadius: 5, fontWeight: 700 }}>↵</kbd> select
                </span>
                <span>
                  <kbd style={{ padding: '2px 6px', background: 'var(--card-hover)', color: 'var(--t2)', border: '1px solid var(--border)', borderRadius: 5, fontWeight: 700 }}>Esc</kbd> close
                </span>
              </div>
              <span style={{ fontWeight: 600 }}>Spotlight Search</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
