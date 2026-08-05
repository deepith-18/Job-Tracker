import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';

export const CareerRoadmapPage: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<'L4' | 'L5' | 'L6'>('L5');

  const roadmapData = {
    L4: {
      title: 'Software Engineer (L4 / Mid-Level)',
      comp: '$140,000 - $210,000 Total Comp',
      skills: ['Clean Code & Testing', 'Feature Ownership', 'Code Reviews', 'Basic System Design'],
      onboarding: [
        'Days 1-30: Complete dev setup, ship 2 small bug fixes, shadow team on-call.',
        'Days 31-60: Own a medium feature end-to-end, document architecture choices.',
        'Days 61-90: Proactively lead small sprint tasks and present demo in team sync.',
      ],
    },
    L5: {
      title: 'Senior Software Engineer (L5 / Lead)',
      comp: '$210,000 - $340,000 Total Comp',
      skills: ['System Architecture & Scalability', 'Cross-Team Leadership', 'Mentorship & Hiring', 'Technical Debt Reduction'],
      onboarding: [
        'Days 1-30: Understand system architecture, audit tech debt, build relationships with product/design.',
        'Days 31-60: Draft 1 major technical design document (RFC), lead core feature execution.',
        'Days 61-90: Establish best practices, mentor junior devs, optimize system SLAs.',
      ],
    },
    L6: {
      title: 'Staff Software Engineer (L6 / Multi-Team Lead)',
      comp: '$340,000 - $550,000 Total Comp',
      skills: ['Multi-Team Strategy', 'Org-wide Architecture', 'Executive Alignment', 'High Scale System Design'],
      onboarding: [
        'Days 1-30: Assess org architecture bottlenecks, realign engineering priorities with VP/Directors.',
        'Days 31-60: Formulate 1-year engineering vision document, resolve strategic cross-team blockers.',
        'Days 61-90: Drive org-wide technical migration, mentor 3+ Senior Engineers.',
      ],
    },
  };

  const activeData = roadmapData[selectedLevel];

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">🔮 Career Trajectory & 30-60-90 Day Onboarding Plan</h1>
        <p className="page-sub">
          Map career promotion levels (L4 &rarr; L5 &rarr; L6), compensation scaling, and onboarding execution plans
        </p>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Level Switcher */}
        <div style={{ display: 'flex', gap: 12 }}>
          {(['L4', 'L5', 'L6'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className="btn"
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                background: selectedLevel === lvl ? 'var(--accent-bg)' : '#ffffff',
                color: selectedLevel === lvl ? 'var(--accent)' : 'var(--t2)',
                border: selectedLevel === lvl ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              }}
            >
              Level {lvl}
            </button>
          ))}
        </div>

        {/* Level Detail Card */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              {activeData.title}
            </h2>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981', background: '#ecfdf5', padding: '4px 12px', borderRadius: 10 }}>
              💰 {activeData.comp}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
            {/* Required Skill Milestones */}
            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10 }}>
                ⭐ Target Core Competencies:
              </div>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--t1)', lineHeight: 1.6 }}>
                {activeData.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>

            {/* 30-60-90 Day Onboarding Plan */}
            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', marginBottom: 10 }}>
                🚀 30-60-90 Day Onboarding Roadmap:
              </div>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--t1)', lineHeight: 1.6 }}>
                {activeData.onboarding.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
