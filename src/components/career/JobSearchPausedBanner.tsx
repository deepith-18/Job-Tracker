import React from 'react';
import { PauseCircle, Play, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CareerStatus } from '../../types/career';

interface JobSearchPausedBannerProps {
  careerStatus?: CareerStatus;
  onResume: () => void;
  compact?: boolean;
}

export const JobSearchPausedBanner: React.FC<JobSearchPausedBannerProps> = ({
  careerStatus,
  onResume,
  compact = false,
}) => {
  const getContextMessage = () => {
    switch (careerStatus) {
      case 'OFFER_ACCEPTED':
        return 'Job search is paused because you accepted an offer. New application creation is locked until you choose to resume.';
      case 'WORKING':
        return 'Job search is currently paused while you are employed. You can resume at any time to explore new opportunities.';
      case 'NOT_SEARCHING':
        return 'Job search is paused. You can resume whenever you are ready to apply for new roles.';
      default:
        return 'Job search is currently paused. New application creation is disabled while your existing pipeline remains fully intact.';
    }
  };

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 14px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 10,
          fontSize: 12.5,
          color: 'var(--t1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PauseCircle size={16} style={{ color: '#d97706', flexShrink: 0 }} />
          <span>{getContextMessage()}</span>
        </div>
        <button
          type="button"
          onClick={onResume}
          className="btn btn-sm"
          style={{
            padding: '4px 10px',
            fontSize: 11.5,
            fontWeight: 700,
            background: '#d97706',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Play size={12} fill="#fff" />
          <span>Resume Search</span>
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.28)',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 260, flex: 1 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d97706',
            flexShrink: 0,
          }}
        >
          <PauseCircle size={22} />
        </div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)' }}>
            Job Search is Currently Paused
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>
            {getContextMessage()}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Link
          to="/profile"
          className="btn btn-ghost btn-sm"
          style={{
            fontSize: 12,
            padding: '6px 12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            textDecoration: 'none',
          }}
        >
          <Sliders size={13} />
          <span>Career Settings</span>
        </Link>

        <button
          type="button"
          onClick={onResume}
          className="btn btn-primary btn-sm"
          style={{
            padding: '7px 14px',
            fontSize: 12.5,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#d97706',
            borderColor: '#b45309',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <Play size={13} fill="#fff" />
          <span>Resume Job Search</span>
        </button>
      </div>
    </div>
  );
};

