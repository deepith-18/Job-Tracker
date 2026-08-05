import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays, isToday, isPast } from 'date-fns';
import type { Application, ApplicationStatus } from '../../types';
import { JOURNEY_STEPS } from '../../types';
import { StatusDropdown } from './StatusDropdown';
import { updateApplication } from '../../firebase/firestore';

interface JourneyCardProps {
  app: Application;
  index: number;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
}

// Star rating display
const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="stars" title={`${rating}/5 dream factor`}>
    {[1,2,3,4,5].map(i => (
      <span key={i} className="star" style={{ color: i <= rating ? '#fbbf24' : '#e2e8f0' }}>★</span>
    ))}
  </div>
);

// Status to card class
const statusCardClass = (s: ApplicationStatus): string => {
  const map: Record<ApplicationStatus, string> = {
    Wishlist: 'status-wishlist', Applied: 'status-applied',
    'OA/Assessment': 'status-oa', Interview: 'status-interview',
    Offer: 'status-offer', Rejected: 'status-rejected', Withdrawn: 'status-withdrawn',
  };
  return map[s];
};

// Journey step index (for the stepper)
const stepIndex = (status: ApplicationStatus): number => {
  if (status === 'Rejected' || status === 'Withdrawn') return -1; // terminal
  return JOURNEY_STEPS.indexOf(status);
};

const Stepper: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const current = stepIndex(status);
  const isTerminal = current === -1;
  const isRejected = status === 'Rejected';

  if (isTerminal) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px',
          borderRadius: 20, fontSize: 12, fontWeight: 700,
          background: isRejected ? '#fff1f2' : '#f8fafc',
          color: isRejected ? '#be123c' : '#64748b',
          border: `1px solid ${isRejected ? '#fecdd3' : '#e2e8f0'}`,
        }}>
          {isRejected ? '✕ Rejected' : '○ Withdrawn'}
        </div>
      </div>
    );
  }

  return (
    <div className="stepper">
      {JOURNEY_STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const isOffer = step === 'Offer' && active;

        return (
          <div key={step} className="step" style={{ position: 'relative' }}>
            {/* Connector line */}
            {i < JOURNEY_STEPS.length - 1 && (
              <div className={`step-line${done || active ? ' done' : ''}`} />
            )}
            {/* Dot */}
            <div className={`step-dot ${isOffer ? 'offer' : done ? 'done' : active ? 'active' : 'future'}`}>
              {done ? (
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : active ? (
                <span style={{ fontSize: 8, fontWeight: 900 }}>●</span>
              ) : (
                <span style={{ fontSize: 8 }}>○</span>
              )}
            </div>
            {/* Label */}
            <div className={`step-label ${done ? 'done' : active ? 'active' : ''}`}>
              {step === 'OA/Assessment' ? 'OA' : step === 'Wishlist' ? 'Wish' : step}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const JourneyCard: React.FC<JourneyCardProps> = ({ app, index, onEdit, onDelete }) => {
  const [ddOpen, setDdOpen] = useState(false);

  const handleStatus = async (status: ApplicationStatus) => {
    await updateApplication(app.id, { status });
    setDdOpen(false);
  };

  // Deadline urgency
  const daysLeft = app.deadline ? differenceInDays(app.deadline, new Date()) : null;
  const isDeadlinePast = app.deadline && isPast(app.deadline) && !isToday(app.deadline!);
  const isDeadlineToday = app.deadline && isToday(app.deadline);

  const companyColor = `hsl(${app.company.charCodeAt(0) * 17 % 360}, 70%, 55%)`;

  return (
    <motion.div
      className={`journey-card ${statusCardClass(app.status)}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, scale: 0.97 }}
      transition={{ delay: index * 0.05, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      layout
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Company avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: 13, flexShrink: 0,
          background: `${companyColor}22`,
          border: `2px solid ${companyColor}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 900, color: companyColor,
          letterSpacing: '-0.04em', fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}>
          {app.company.charAt(0).toUpperCase()}
        </div>

        {/* Company info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', fontFamily: "'Plus Jakarta Sans',sans-serif", margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {app.company}
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 2 }}>{app.role}</p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              {app.rating > 0 && <Stars rating={app.rating} />}
              <button
                onClick={() => onEdit(app)}
                style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--t3)'; }}
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(app)}
                style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--t3)'; }}
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Stepper */}
      <Stepper status={app.status} />

      {/* Bottom meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
        {/* Quick status tap */}
        <StatusDropdown
          current={app.status}
          isOpen={ddOpen}
          onOpen={() => setDdOpen(true)}
          onClose={() => setDdOpen(false)}
          onSelect={handleStatus}
        />

        {app.appliedDate && (
          <span style={{ fontSize: 12, color: 'var(--t3)' }}>
            Applied {format(app.appliedDate, 'MMM d')}
          </span>
        )}

        {app.deadline && (
          <span className={`dl-near${isDeadlinePast ? ' dl-past' : isDeadlineToday ? ' dl-today' : ''}`}>
            {isDeadlinePast ? '⚠ Overdue' : isDeadlineToday ? '🔥 Due today' : `⏰ ${daysLeft}d left`}
            {' '}· {format(app.deadline, 'MMM d')}
          </span>
        )}

        {app.source && <span className="chip">{app.source}</span>}

        {app.jobLink && (
          <a href={app.jobLink} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Job Link
          </a>
        )}

        {app.rejectionReasons.length > 0 && (
          <span style={{ fontSize: 11.5, color: '#be123c', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 6, padding: '2px 7px' }}>
            📝 {app.rejectionReasons[0]}{app.rejectionReasons.length > 1 ? ` +${app.rejectionReasons.length - 1}` : ''}
          </span>
        )}
      </div>

      {app.notes && (
        <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 8, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {app.notes}
        </p>
      )}
    </motion.div>
  );
};
