import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  onQuickAddFocus?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: '#ffffff',
        border: '1px dashed var(--border)',
        borderRadius: 20,
        padding: '64px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div
        className="animate-float"
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          marginBottom: 20,
          boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
        }}
      >
        🚀
      </div>

      <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>
        No applications yet — paste a job link above to start.
      </h3>

      <p style={{ fontSize: 14, color: 'var(--t2)', maxWidth: 420, lineHeight: 1.6, marginBottom: 24 }}>
        Use the Quick-Add bar at the top to type <code>Company — Role</code> or paste a URL to instantly track your job search.
      </p>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          background: 'var(--accent-bg)',
          borderRadius: 20,
          fontSize: 12.5,
          fontWeight: 700,
          color: 'var(--accent)',
          border: '1px solid #c7d2fe',
        }}
      >
        <span>💡 Pro-tip: Press Enter after typing to create a card in Wishlist status</span>
      </div>
    </motion.div>
  );
};
