import { Rocket, Mic, DollarSign, Flame, Zap, Award, Check } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';

interface Badge {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
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
      title: 'First Flight',
      desc: 'Submit your first job application',
      icon: <Rocket size={24} color="var(--accent)" />,
      unlocked: appCount >= 1,
      progress: Math.min(100, (appCount / 1) * 100),
    },
    {
      id: '2',
      title: 'Speed Demon',
      desc: 'Submit 10 applications to target companies',
      icon: <Zap size={24} color="#f59e0b" />,
      unlocked: appCount >= 10,
      progress: Math.min(100, (appCount / 10) * 100),
    },
    {
      id: '3',
      title: 'Interview Ace',
      desc: 'Advance to 3 technical interview rounds',
      icon: <Mic size={24} color="#8b5cf6" />,
      unlocked: interviewCount >= 3,
      progress: Math.min(100, (interviewCount / 3) * 100),
    },
    {
      id: '4',
      title: 'Offer Winner',
      desc: 'Secure an official job offer package',
      icon: <DollarSign size={24} color="#10b981" />,
      unlocked: offerCount >= 1,
      progress: Math.min(100, (offerCount / 1) * 100),
    },
    {
      id: '5',
      title: 'Streak Master',
      desc: 'Maintain an active submission streak across target companies',
      icon: <Flame size={24} color="#f97316" />,
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
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Award size={24} color="#f59e0b" />
          <span>Career Milestones & Achievements</span>
        </h1>
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
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 2 }}>
                Level {Math.floor(xpPoints / 250) + 1} — Active Candidate
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#fbbf24' }}>
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
                opacity: badge.unlocked ? 1 : 0.75,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    background: badge.unlocked ? 'var(--accent-bg)' : 'var(--page)',
                    border: '1px solid var(--border)',
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
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
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: badge.unlocked ? '#047857' : 'var(--t3)',
                      background: badge.unlocked ? '#ecfdf5' : 'var(--page)',
                      border: `1px solid ${badge.unlocked ? '#a7f3d0' : 'var(--border)'}`,
                      padding: '2px 6px',
                      borderRadius: 6,
                      marginTop: 4,
                    }}
                  >
                    {badge.unlocked ? (
                      <>
                        <Check size={11} />
                        <span>UNLOCKED</span>
                      </>
                    ) : (
                      'LOCKED'
                    )}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: 12.5, color: 'var(--t2)', margin: '0 0 12px', lineHeight: 1.5 }}>{badge.desc}</p>

              {/* Progress bar */}
              <div style={{ width: '100%', height: 6, borderRadius: 6, background: 'var(--border-light)', overflow: 'hidden' }}>
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
