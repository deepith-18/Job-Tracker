import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const SHORTCUT_GROUPS = [
    {
      title: 'Global Controls',
      items: [
        { keys: ['⌘', 'K'], label: 'Open Spotlight Command Palette' },
        { keys: ['?'], label: 'Toggle this Shortcuts Cheatsheet' },
        { keys: ['Esc'], label: 'Close Active Modal, Drawer, or Menu' },
      ],
    },
    {
      title: 'Quick Navigation',
      items: [
        { keys: ['G', 'D'], label: 'Jump to Dashboard Overview' },
        { keys: ['G', 'A'], label: 'Jump to Applications Pipeline' },
        { keys: ['G', 'J'], label: 'Jump to Interview Journal & Prep' },
        { keys: ['G', 'I'], label: 'Jump to Insights & Telemetry' },
        { keys: ['G', 'O'], label: 'Jump to About & Creator Credits' },
      ],
    },
    {
      title: 'Pipeline Actions',
      items: [
        { keys: ['N'], label: 'Quick Capture New Application Lead' },
        { keys: ['/'], label: 'Focus Search Filter inside Pipeline' },
      ],
    },
  ];

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'var(--card)',
            borderRadius: 22,
            maxWidth: 540,
            width: '100%',
            padding: '24px 28px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            border: '1px solid var(--border)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  background: 'var(--accent-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                }}
              >
                <Keyboard style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  Keyboard Shortcuts
                </h3>
                <span style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 500 }}>
                  High-velocity hotkeys for Job Orbit
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--t3)',
                padding: 4,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Shortcut Groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.title}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--t3)',
                    marginBottom: 8,
                  }}
                >
                  {group.title}
                </div>
                <div
                  style={{
                    background: 'var(--page)',
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                  }}
                >
                  {group.items.map((item, idx) => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 14px',
                        borderBottom: idx !== group.items.length - 1 ? '1px solid var(--border)' : 'none',
                        fontSize: 13,
                        color: 'var(--t1)',
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{item.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {item.keys.map((k) => (
                          <kbd
                            key={k}
                            style={{
                              padding: '2px 7px',
                              borderRadius: 6,
                              background: 'var(--card-hover)',
                              border: '1px solid var(--border)',
                              fontSize: 11,
                              fontWeight: 700,
                              color: 'var(--t2)',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              fontFamily: 'inherit',
                            }}
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Tip */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11.5,
              color: 'var(--t3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles style={{ width: 12, height: 12, color: 'var(--accent)' }} />
              <span>Tip: Press <kbd style={{ background: '#f5f5f4', padding: '1px 5px', borderRadius: 4, fontWeight: 700, border: '1px solid var(--border)' }}>?</kbd> anywhere to open this cheatsheet</span>
            </div>
            <span>v2.5.0</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
