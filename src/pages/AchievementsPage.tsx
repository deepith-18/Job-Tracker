import React from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';

interface Badge {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0 - 100
}

export const AchievementsPage: React.FC = () => {
  const { applications } = useApplications();

  const appCount = applications.length;
  const interviewCount = applications.filter((a) => a.status === 'Interview' || a.status === 'Offer').length;
  const offerCount = applications.filter((a) => a.status === 'Offer').length;

  const badges: Badge[] = [
    {
      id: '1',
      title: '🚀 First Flight',
      desc: 'Submit your first job application',
      icon: '🚀',
      unlocked: appCount >= 1,
      progress: Math.min(100, (appCount / 1) * 100),
    },
    {
      id: '2',
      title: '⚡ Speed Demon',
      desc: 'Submit 10 applications to target companies',
      icon: '⚡',
      unlocked: appCount >= 10,
      progress: Math.min(100, (appCount / 10) * 100),
    },
    {
      id: '3',
      title: '🎙️ Interview Ace',
      desc: 'Advance to 3 technical interview rounds',
      icon: '🎙️',
      unlocked: interviewCount >= 3,
      progress: Math.min(100, (interviewCount / 3) * 100),
    },
    {
      id: '4',
      title: '💰 Offer Winner',
      desc: 'Secure a official job offer package',
      icon: '💰',
      unlocked: offerCount >= 1,
      progress: Math.min(100, (offerCount / 1) * 100),
    },
    {
      id: '5',
      title: '🔥 Streak Master',
      desc: 'Maintain a active submission streak for 7 days',
      icon: '🔥',
      unlocked: appCount >= 5,
      progress: Math.min(100, (appCount / 5) * 100),
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const xpPoints = appCount * 50 + interviewCount * 150 + offerCount * 500;

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">🏆 Career Milestones & Achievements</h1>
        <p className="page-sub">
          Earn XP, unlock milestone badges, and track your job search gamification level
        </p>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Level & XP Banner */}
        <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#c7d2fe', textTransform: 'uppercase' }}>
                Job Search Rank
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 2 }}>
                Level {Math.floor(xpPoints / 250) + 1} — Elite Job Hunter
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#fbbf24' }}>
                {xpPoints} XP
              </div>
              <div style={{ fontSize: 12, color: '#e0e7ff' }}>
                {unlockedCount} of {badges.length} Badges Unlocked
              </div>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {badges.map((badge) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card"
              style={{
                padding: 20,
                border: badge.unlocked ? '1.5px solid #10b981' : '1px solid var(--border)',
                opacity: badge.unlocked ? 1 : 0.7,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 32,
                    background: badge.unlocked ? '#ecfdf5' : '#f1f5f9',
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {badge.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                    {badge.title}
                  </h3>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: badge.unlocked ? '#047857' : 'var(--t3)',
                      background: badge.unlocked ? '#ecfdf5' : '#f1f5f9',
                      padding: '2px 6px',
                      borderRadius: 6,
                    }}
                  >
                    {badge.unlocked ? '✓ UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: 12.5, color: 'var(--t2)', margin: '0 0 12px' }}>{badge.desc}</p>

              {/* Progress bar */}
              <div style={{ width: '100%', height: 6, borderRadius: 6, background: '#e2e8f0', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${badge.progress}%`,
                    height: '100%',
                    background: badge.unlocked ? '#10b981' : 'var(--accent)',
                    borderRadius: 6,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};
