import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REJECTION_REASONS } from '../../types';

interface RejectionDialogProps {
  isOpen: boolean;
  company: string;
  onSave: (reasons: string[]) => void;
  onSkip: () => void;
}

export const RejectionDialog: React.FC<RejectionDialogProps> = ({ isOpen, company, onSave, onSkip }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (r: string) => setSelected(s => s.includes(r) ? s.filter(x => x !== r) : [...s, r]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-bd"
          style={{ zIndex: 300 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-box"
            style={{ maxWidth: 440 }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
          >
            <div style={{ padding: '24px 24px 0' }}>
              {/* Icon + title */}
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 22 }}>📚</span>
              </div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 17, fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
                What happened with {company}?
              </h3>
              <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 20, lineHeight: 1.5 }}>
                Every rejection is a lesson. Tracking the reason helps you improve. 💪
              </p>

              {/* Checkboxes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {REJECTION_REASONS.map(r => {
                  const checked = selected.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggle(r)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
                        background: checked ? 'var(--accent-bg)' : '#f8f9ff',
                        border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                        color: checked ? 'var(--accent)' : 'var(--t2)',
                        fontSize: 12.5, fontWeight: checked ? 700 : 500,
                        transition: 'all 0.15s ease', textAlign: 'left',
                      }}
                    >
                      <div style={{
                        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                        background: checked ? 'var(--accent)' : '#fff',
                        border: `2px solid ${checked ? 'var(--accent)' : '#d1d5db'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {checked && (
                          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={onSkip}>Skip</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { onSave(selected); setSelected([]); }}
                disabled={selected.length === 0}
              >
                Save Learnings ({selected.length})
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
