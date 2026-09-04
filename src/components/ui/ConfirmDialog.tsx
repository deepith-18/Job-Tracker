import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Delete Application',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  loading = false,
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onCancel()}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 9999,
        }}
      >
        <motion.div
          className="modal-card"
          style={{
            maxWidth: 440,
            width: '100%',
            background: 'var(--card)',
            borderRadius: 16,
            padding: '28px 26px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--border)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 28, stiffness: 400 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Trash2 style={{ width: 20, height: 20 }} />
            </div>

            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', margin: '0 0 8px 0', lineHeight: 1.3 }}>
              {title}
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--t2)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              {message}
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onCancel}
                disabled={loading}
                style={{
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={onConfirm}
                disabled={loading}
                style={{
                  padding: '9px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  borderRadius: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Trash2 style={{ width: 14, height: 14 }} />
                <span>{loading ? 'Deleting…' : confirmLabel}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
