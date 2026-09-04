import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Flame,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Application } from '../../types';
import { differenceInDays } from 'date-fns';

interface SearchHealthWidgetProps {
  applications: Application[];
  weeklyGoal?: number;
  streak?: number;
}

export const SearchHealthWidget: React.FC<SearchHealthWidgetProps> = ({
  applications,
  weeklyGoal = 5,
  streak = 1,
}) => {
  const total = applications.length;
  const thisWeekApps = applications.filter((a) => {
    const d = new Date(a.createdAt);
    return differenceInDays(new Date(), d) <= 7;
  }).length;

  const activePipeline = applications.filter((a) =>
    ['Applied', 'OA/Assessment', 'Interview'].includes(a.status)
  );

  const interviews = applications.filter((a) => a.status === 'Interview');
  const offers = applications.filter((a) => a.status === 'Offer');

  const needsFollowUp = applications.filter((a) => {
    const updated = new Date(a.updatedAt || a.createdAt);
    return differenceInDays(new Date(), updated) >= 7 && a.status === 'Applied';
  });

  // Calculate Search Health Score (0 - 100)
  let score = 50; // base baseline
  if (total > 0) score += 10;
  if (thisWeekApps >= weeklyGoal) score += 20;
  else if (thisWeekApps > 0) score += Math.round((thisWeekApps / weeklyGoal) * 20);
  if (interviews.length > 0) score += 15;
  if (offers.length > 0) score += 10;
  if (needsFollowUp.length === 0) score += 10;
  else score -= Math.min(15, needsFollowUp.length * 3);
  if (streak >= 3) score += 5;

  const finalScore = Math.max(20, Math.min(100, score));

  let tierLabel = 'Steady Pipeline';
  let tierColor = '#6366f1';
  let tierEmoji = '⚡';

  if (finalScore >= 85) {
    tierLabel = 'High Momentum';
    tierColor = '#10b981';
    tierEmoji = '🚀';
  } else if (finalScore < 60) {
    tierLabel = 'Needs Pipeline Boost';
    tierColor = '#f59e0b';
    tierEmoji = '⚠️';
  }

  return (
    <div
      className="card"
      style={{
        padding: '22px 24px',
        background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
        border: '1.5px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        {/* Left Score Gauge & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* Radial Score Pill */}
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: `conic-gradient(${tierColor} ${finalScore * 3.6}deg, var(--page) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 5,
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'var(--card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--t1)', lineHeight: 1 }}>
                {finalScore}
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>
                Index
              </span>
            </div>
          </div>

          {/* Heading & Status */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: tierColor,
                  background: `${tierColor}15`,
                  border: `1px solid ${tierColor}30`,
                  padding: '2px 8px',
                  borderRadius: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>{tierEmoji}</span>
                <span>{tierLabel}</span>
              </span>
              <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>
                • Job Search Readiness
              </span>
            </div>

            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', margin: '4px 0 2px 0' }}>
              Search Momentum Index
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--t2)', margin: 0 }}>
              {activePipeline.length} opportunities currently in motion across your target pipeline.
            </p>
          </div>
        </div>

        {/* Action button */}
        <Link
          to="/insights"
          className="btn btn-ghost btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            fontWeight: 700,
            color: 'var(--accent)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            background: 'var(--card)',
            textDecoration: 'none',
          }}
        >
          <Sparkles style={{ width: 13, height: 13 }} />
          <span>Detailed Diagnostics</span>
          <ArrowRight style={{ width: 12, height: 12 }} />
        </Link>
      </div>

      {/* Quick Status Checkpoints Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 10,
          marginTop: 18,
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--page)', padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
            <TrendingUp style={{ width: 15, height: 15 }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>Weekly Velocity</div>
            <div style={{ fontSize: 11, color: 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {thisWeekApps} of {weeklyGoal} goal submissions
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--page)', padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: needsFollowUp.length > 0 ? '#fffbeb' : '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: needsFollowUp.length > 0 ? '#d97706' : '#059669', flexShrink: 0 }}>
            {needsFollowUp.length > 0 ? <AlertCircle style={{ width: 15, height: 15 }} /> : <CheckCircle2 style={{ width: 15, height: 15 }} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>Follow-up Vigilance</div>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>
              {needsFollowUp.length > 0 ? `${needsFollowUp.length} roles await nudges` : 'All leads up to date'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--page)', padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fdf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea', flexShrink: 0 }}>
            <Calendar style={{ width: 15, height: 15 }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>Active Rounds</div>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>
              {interviews.length} technical & panel stages
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--page)', padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', flexShrink: 0 }}>
            <Flame style={{ width: 15, height: 15 }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>Active Streak</div>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>
              {streak} consecutive active {streak === 1 ? 'day' : 'days'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
