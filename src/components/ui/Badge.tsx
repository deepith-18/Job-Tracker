import React from 'react';
import type { ApplicationStatus } from '../../types';

const CLS: Record<ApplicationStatus, string> = {
  Wishlist: 'badge-wishlist', Applied: 'badge-applied', 'OA/Assessment': 'badge-oa',
  Interview: 'badge-interview', Offer: 'badge-offer', Rejected: 'badge-rejected', Withdrawn: 'badge-withdrawn',
};
const DOT: Record<ApplicationStatus, string> = {
  Wishlist: '#94a3b8', Applied: '#6366f1', 'OA/Assessment': '#8b5cf6',
  Interview: '#f59e0b', Offer: '#10b981', Rejected: '#ef4444', Withdrawn: '#94a3b8',
};

interface BadgeProps {
  status: ApplicationStatus;
  interactive?: boolean;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({ status, interactive = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!interactive}
    className={`badge ${CLS[status]}`}
    style={{ cursor: interactive ? 'pointer' : 'default' }}
  >
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: DOT[status], flexShrink: 0, display: 'inline-block' }} />
    {status}
    {interactive && (
      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ opacity: 0.6 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    )}
  </button>
);
