import React, { useState, useMemo } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { AnalyticsSection } from '../components/analytics/AnalyticsSection';
import { useApplications } from '../hooks/useApplications';
import type { ApplicationStatus } from '../types';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { eachDayOfInterval, subDays, format } from 'date-fns';

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'skills', label: '🎯 Skills Radar' },
  { id: 'heatmap', label: '🔥 Activity Heatmap' },
  { id: 'goals', label: '🎯 Goals' },
  { id: 'reports', label: '📈 Reports' },
  { id: 'trends', label: '🌍 Tech Trends' },
];

export const InsightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { applications } = useApplications();

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 0 }}>
        <h1 className="page-title">📊 Insights</h1>
        <p className="page-sub" style={{ marginBottom: 16 }}>Analytics, skill tracking, goals, and market intelligence</p>

        {/* Tab Bar */}
        <div className="page-tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`page-tab-btn${activeTab === tab.id ? ' active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
        <OverviewTab applications={applications} />
      </div>
      <div style={{ display: activeTab === 'skills' ? 'block' : 'none' }}>
        <SkillsTab />
      </div>
      <div style={{ display: activeTab === 'heatmap' ? 'block' : 'none' }}>
        <HeatmapTab applications={applications} />
      </div>
      <div style={{ display: activeTab === 'goals' ? 'block' : 'none' }}>
        <GoalsTab applications={applications} />
      </div>
      <div style={{ display: activeTab === 'reports' ? 'block' : 'none' }}>
        <ReportsTab applications={applications} />
      </div>
      <div style={{ display: activeTab === 'trends' ? 'block' : 'none' }}>
        <TrendsTab />
      </div>
    </AppShell>
  );
};

// ── Overview Tab
const OverviewTab: React.FC<{ applications: any[] }> = ({ applications }) => {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'All'>('All');
  return (
    <div className="pb">
      <AnalyticsSection
        applications={applications}
        selectedStatusFilter={statusFilter}
        onStatusSelect={(s) => setStatusFilter(s)}
      />
    </div>
  );
};

// ── Skills Radar Tab
const DEFAULT_SKILLS = [
  { skill: 'DSA', level: 75 },
  { skill: 'System Design', level: 65 },
  { skill: 'Frontend', level: 85 },
  { skill: 'Backend', level: 70 },
  { skill: 'Behavioral', level: 80 },
  { skill: 'OOP', level: 60 },
];

const SkillsTab: React.FC = () => {
  const [skills, setSkills] = useState(DEFAULT_SKILLS);

  const updateSkill = (i: number, val: number) => {
    const updated = [...skills];
    updated[i] = { ...updated[i], level: val };
    setSkills(updated);
  };

  return (
    <div className="pb" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>🎯 Skill Proficiency Radar</div>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={skills.map((s) => ({ subject: s.skill, level: s.level, fullMark: 100 }))}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar dataKey="level" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>📐 Adjust Skill Levels</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {skills.map((s, i) => (
            <div key={s.skill}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: 'var(--t2)', marginBottom: 4 }}>
                <span>{s.skill}</span><span style={{ color: 'var(--accent)' }}>{s.level}%</span>
              </div>
              <input type="range" min={0} max={100} value={s.level} onChange={(e) => updateSkill(i, Number(e.target.value))} style={{ width: '100%' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Heatmap Tab
const HeatmapTab: React.FC<{ applications: any[] }> = ({ applications }) => {
  const calendarData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 363), end: new Date() });
    const dayCounts: Record<string, number> = {};
    applications.forEach((app) => {
      const key = format(new Date(app.appliedDate || app.createdAt), 'yyyy-MM-dd');
      dayCounts[key] = (dayCounts[key] || 0) + 1;
    });
    const weeks: { date: Date; count: number; level: number }[][] = [];
    let currentWeek: { date: Date; count: number; level: number }[] = [];
    days.forEach((date) => {
      const key = format(date, 'yyyy-MM-dd');
      const count = dayCounts[key] || 0;
      const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3;
      currentWeek.push({ date, count, level });
      if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; }
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);
    return weeks;
  }, [applications]);

  const COLORS = ['#eef2ff', '#c7d2fe', '#818cf8', '#4f46e5'];
  const total = applications.length;
  const thisWeek = applications.filter((a) => {
    const d = new Date(a.appliedDate || a.createdAt);
    return d >= subDays(new Date(), 7);
  }).length;

  return (
    <div className="pb">
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[['Total Applications', total, '#6366f1'], ['This Week', thisWeek, '#10b981'], ['Active Streak', '7 days', '#f59e0b']].map(([label, val, color]) => (
          <div key={label as string} className="card" style={{ flex: 1, padding: 18, borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: color as string }}>{val}</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 20, overflowX: 'auto' }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>📅 52-Week Activity Heatmap</div>
        <div style={{ display: 'flex', gap: 3 }}>
          {calendarData.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {week.map((day, di) => (
                <div key={di} title={`${format(day.date, 'MMM d')} — ${day.count} apps`} style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[day.level], cursor: 'default' }} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 12, fontSize: 11, color: 'var(--t3)' }}>
          <span>Less</span>
          {COLORS.map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />)}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

// ── Goals Tab
const GoalsTab: React.FC<{ applications: any[] }> = ({ applications }) => {
  const goals = [
    { id: '1', label: 'Apply to 5 companies this week', current: Math.min(applications.length, 5), target: 5, color: '#6366f1' },
    { id: '2', label: 'Get 3 interview invitations', current: applications.filter((a) => a.status === 'Interview').length, target: 3, color: '#10b981' },
    { id: '3', label: 'Reach 60% response rate', current: 42, target: 60, color: '#f59e0b' },
  ];

  return (
    <div className="pb" style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          return (
            <div key={g.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{g.label}</div>
                <div style={{ fontWeight: 800, color: g.color }}>{g.current}/{g.target}</div>
              </div>
              <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: g.color, borderRadius: 999, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 6 }}>{pct}% complete</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Reports Tab
const ReportsTab: React.FC<{ applications: any[] }> = ({ applications }) => {
  const total = applications.length;
  const offers = applications.filter((a) => a.status === 'Offer').length;
  const rejected = applications.filter((a) => a.status === 'Rejected').length;
  const responseRate = total > 0 ? Math.round(((offers + applications.filter((a) => a.status === 'Interview').length) / total) * 100) : 0;

  const metrics = [
    { label: 'Total Applications', value: total, icon: '📋', color: '#6366f1' },
    { label: 'Offers Received', value: offers, icon: '🎉', color: '#10b981' },
    { label: 'Response Rate', value: `${responseRate}%`, icon: '📨', color: '#f59e0b' },
    { label: 'Rejections', value: rejected, icon: '❌', color: '#ef4444' },
  ];

  return (
    <div className="pb">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {metrics.map((m) => (
          <div key={m.label} className="stat" style={{ borderTop: `3px solid ${m.color}` }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
            <div className="stat-val" style={{ color: m.color }}>{m.value}</div>
            <div className="stat-label">{m.label}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>📊 Application Funnel</div>
        {[
          { label: 'Applied', count: total, color: '#6366f1' },
          { label: 'Responded', count: Math.round(total * 0.42), color: '#8b5cf6' },
          { label: 'Interviewed', count: applications.filter((a) => a.status === 'Interview').length, color: '#f59e0b' },
          { label: 'Offered', count: offers, color: '#10b981' },
        ].map((step) => (
          <div key={step.label} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              <span>{step.label}</span><span>{step.count}</span>
            </div>
            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${total > 0 ? (step.count / total) * 100 : 0}%`, background: step.color, borderRadius: 999 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Tech Trends Tab
const TrendsTab: React.FC = () => {
  const trends = [
    { skill: 'TypeScript', demand: 94, growth: '+18%', category: 'Frontend' },
    { skill: 'React / Next.js', demand: 91, growth: '+12%', category: 'Frontend' },
    { skill: 'Python (AI/ML)', demand: 89, growth: '+31%', category: 'AI/ML' },
    { skill: 'Go (Golang)', demand: 78, growth: '+22%', category: 'Backend' },
    { skill: 'Kubernetes / K8s', demand: 75, growth: '+19%', category: 'DevOps' },
    { skill: 'LLM / GenAI APIs', demand: 86, growth: '+67%', category: 'AI/ML' },
    { skill: 'PostgreSQL', demand: 82, growth: '+9%', category: 'Database' },
    { skill: 'Rust', demand: 58, growth: '+41%', category: 'Systems' },
  ];

  return (
    <div className="pb">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {trends.sort((a, b) => b.demand - a.demand).map((t) => (
          <div key={t.skill} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{t.skill}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--accent-bg)', color: 'var(--accent)', fontWeight: 700 }}>{t.category}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#f0fdf4', color: '#065f46', fontWeight: 800 }}>{t.growth}</span>
              </div>
              <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${t.demand}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 999 }} />
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent)', minWidth: 48, textAlign: 'right' }}>{t.demand}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
