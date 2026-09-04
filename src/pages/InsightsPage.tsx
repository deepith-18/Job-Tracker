import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart3,
  Target,
  Flame,
  CheckCircle2,
  TrendingUp,
  Globe,
  Plus,
  Trash2,
  RotateCcw,
  Clipboard,
  Download,
  Check,
  Search,
  Briefcase,
  Award,
  Clock,
  XCircle,
  Calendar,
  Grid,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { AnalyticsSection } from '../components/analytics/AnalyticsSection';
import { OutcomeConfusionMatrix } from '../components/analytics/OutcomeConfusionMatrix';
import { useApplications } from '../hooks/useApplications';
import { useUserSettings } from '../hooks/useUserSettings';
import { useSkills } from '../hooks/useSkills';
import { useToast } from '../components/ui/ToastContext';
import type { Application, ApplicationStatus } from '../types';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  eachDayOfInterval,
  subDays,
  format,
  startOfDay,
  getDay,
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// ── TABS (Vector Lucide icons, no emojis) ──
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'matrix', label: 'Outcome Confusion Matrix', icon: Grid },
  { id: 'skills', label: 'Skills Radar', icon: Target },
  { id: 'heatmap', label: 'Activity Heatmap', icon: Flame },
  { id: 'goals', label: 'Career Goals', icon: CheckCircle2 },
  { id: 'reports', label: 'Executive Reports', icon: TrendingUp },
  { id: 'trends', label: 'Tech Trends & Gap Analysis', icon: Globe },
];

export const InsightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { applications } = useApplications();

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 0 }}>
        <h1 className="page-title">Career Intelligence & Insights</h1>
        <p className="page-sub" style={{ marginBottom: 16 }}>
          Performance analytics, skill proficiency radar, milestone tracking, and market intelligence.
        </p>

        {/* Tab Bar */}
        <div className="page-tab-bar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`page-tab-btn${isActive ? ' active' : ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon style={{ width: 15, height: 15 }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
        <OverviewTab applications={applications} />
      </div>
      <div style={{ display: activeTab === 'matrix' ? 'block' : 'none' }}>
        <div className="pb" style={{ paddingTop: 16 }}>
          <OutcomeConfusionMatrix applications={applications} />
        </div>
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

// ═══════════════════════════════════════════════════════════════
// 1. OVERVIEW TAB (Analytics Section)
// ═══════════════════════════════════════════════════════════════
const OverviewTab: React.FC<{ applications: Application[] }> = ({ applications }) => {
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

// ═══════════════════════════════════════════════════════════════
// 2. SKILLS RADAR TAB (Proficiency Radar + Custom Skill Management)
// ═══════════════════════════════════════════════════════════════
const SkillsTab: React.FC = () => {
  const { skills, updateSkillLevel, addCustomSkill, removeSkill, resetSkills } = useSkills();
  const { addToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(60);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      addToast('Validation Error', 'Please enter a skill name', 'error');
      return;
    }
    addCustomSkill(newSkillName.trim(), newSkillLevel);
    addToast('Skill Added', `Added "${newSkillName.trim()}" to your radar`, 'success');
    setNewSkillName('');
    setNewSkillLevel(60);
    setShowAddModal(false);
  };

  const handleRemove = (id: string, name: string) => {
    removeSkill(id);
    addToast('Skill Removed', `Removed "${name}" from radar`, 'info');
  };

  const avgProficiency = skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + s.level, 0) / skills.length)
    : 0;

  return (
    <div className="pb">
      {/* Top Banner & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="stat" style={{ padding: '10px 18px', minWidth: 160, display: 'inline-flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase' }}>Overall Average</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{avgProficiency}%</span>
          </div>
          <div className="stat" style={{ padding: '10px 18px', minWidth: 160, display: 'inline-flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase' }}>Tracked Skills</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>{skills.length} domains</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              resetSkills();
              addToast('Skills Reset', 'Restored default core engineering skills', 'info');
            }}
            className="btn btn-ghost btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            title="Reset to default engineering skills"
          >
            <RotateCcw style={{ width: 13, height: 13 }} />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            <span>Add Custom Skill</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Radar Chart + Adjuster List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 20 }}>
        {/* Left: Radar Chart */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 15, width: '100%', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target style={{ width: 17, height: 17, color: 'var(--accent)' }} />
            <span>Technical Competency Map</span>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skills.map((s) => ({ subject: s.skill, level: s.level, fullMark: 100 }))}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="level" stroke="#6366f1" fill="#6366f1" fillOpacity={0.28} strokeWidth={2.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 8, textAlign: 'center' }}>
            Real-time visual distribution of your self-assessed domain strengths.
          </div>
        </div>

        {/* Right: Interactive Sliders & Management */}
        <div className="card" style={{ padding: 24, maxHeight: 440, overflowY: 'auto' }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Calibrate Proficiency Levels</span>
            <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 500 }}>0 to 100%</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {skills.map((s) => (
              <div key={s.id || s.skill} style={{ background: 'var(--page)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{s.skill}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: s.level >= 75 ? '#065f46' : s.level >= 50 ? '#b45309' : '#475569',
                        background: s.level >= 75 ? '#ecfdf5' : s.level >= 50 ? '#fffbeb' : '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: 10,
                      }}
                    >
                      {s.level}%
                    </span>
                    <button
                      onClick={() => handleRemove(s.id, s.skill)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#ef4444', padding: '2px 4px' }}
                      title="Remove skill"
                    >
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={s.level}
                  onChange={(e) => updateSkillLevel(s.id, Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Custom Skill Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15,23,42,0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 28,
                width: '100%',
                maxWidth: 480,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                <span>Add Skill Domain to Radar</span>
              </h3>
              <form onSubmit={handleAddSkill} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="lbl">Skill / Domain Name *</label>
                  <input
                    className="inp"
                    placeholder="e.g. Distributed Caching, Next.js, Kubernetes"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="lbl">Initial Proficiency Level: {newSkillLevel}%</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add to Radar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 3. ACTIVITY HEATMAP TAB (52-Week Activity & Velocity Analytics)
// ═══════════════════════════════════════════════════════════════
const HeatmapTab: React.FC<{ applications: Application[] }> = ({ applications }) => {
  const { settings } = useUserSettings();
  const [windowRange, setWindowRange] = useState<'90d' | '180d' | '365d'>('365d');

  const daysBack = windowRange === '90d' ? 90 : windowRange === '180d' ? 180 : 364;

  const calendarData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), daysBack), end: new Date() });
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
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);
    return weeks;
  }, [applications, daysBack]);

  // Day of week breakdown (0 = Sun, 6 = Sat)
  const dayOfWeekStats = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    applications.forEach((app) => {
      const d = new Date(app.appliedDate || app.createdAt);
      counts[getDay(d)]++;
    });
    const maxIdx = counts.indexOf(Math.max(...counts));
    return {
      peakDay: days[maxIdx],
      peakCount: counts[maxIdx],
      breakdown: days.map((day, i) => ({ day, count: counts[i] })),
    };
  }, [applications]);

  // Real consecutive active streak
  const activeStreak = useMemo(() => {
    if (applications.length === 0) return 0;
    const activeDays = new Set<string>();
    applications.forEach((app) => {
      const d = new Date(app.appliedDate || app.createdAt);
      activeDays.add(format(startOfDay(d), 'yyyy-MM-dd'));
    });
    let streak = 0;
    let cursor = startOfDay(new Date());
    while (activeDays.has(format(cursor, 'yyyy-MM-dd'))) {
      streak++;
      cursor = subDays(cursor, 1);
    }
    if (streak === 0) {
      cursor = startOfDay(subDays(new Date(), 1));
      while (activeDays.has(format(cursor, 'yyyy-MM-dd'))) {
        streak++;
        cursor = subDays(cursor, 1);
      }
    }
    return Math.max(streak, settings.streak || 0);
  }, [applications, settings.streak]);

  const COLORS = ['#f1f5f9', '#c7d2fe', '#818cf8', '#4f46e5'];
  const totalInWindow = useMemo(() => {
    const start = subDays(new Date(), daysBack);
    return applications.filter((a) => new Date(a.appliedDate || a.createdAt) >= start).length;
  }, [applications, daysBack]);

  const thisWeekCount = applications.filter((a) => {
    const d = new Date(a.appliedDate || a.createdAt);
    return d >= subDays(new Date(), 7);
  }).length;

  return (
    <div className="pb">
      {/* Velocity Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="card" style={{ padding: 18, borderTop: '3px solid var(--accent)' }}>
          <div style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>Activity in Window</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', marginTop: 4 }}>{totalInWindow} apps</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>Logged applications</div>
        </div>
        <div className="card" style={{ padding: 18, borderTop: '3px solid #10b981' }}>
          <div style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>Recent 7 Days</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>{thisWeekCount} submissions</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>Current weekly velocity</div>
        </div>
        <div className="card" style={{ padding: 18, borderTop: '3px solid #f59e0b' }}>
          <div style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>Active Daily Streak</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
            {activeStreak} day{activeStreak !== 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>Continuous application pace</div>
        </div>
        <div className="card" style={{ padding: 18, borderTop: '3px solid #8b5cf6' }}>
          <div style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>Peak Application Day</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6', marginTop: 4 }}>{dayOfWeekStats.peakDay}</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{dayOfWeekStats.peakCount} total logged</div>
        </div>
      </div>

      {/* Heatmap Card */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar style={{ width: 17, height: 17, color: 'var(--accent)' }} />
            <span>Submission Cadence Heatmap</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { label: 'Last 3 Months', val: '90d' },
              { label: 'Last 6 Months', val: '180d' },
              { label: 'Full Year', val: '365d' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setWindowRange(opt.val as any)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 14,
                  fontSize: 12,
                  fontWeight: 600,
                  border: windowRange === opt.val ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: windowRange === opt.val ? 'var(--accent-bg)' : 'var(--card)',
                  color: windowRange === opt.val ? 'var(--accent)' : 'var(--t2)',
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap Grid */}
        <div style={{ overflowX: 'auto', paddingBottom: 10 }}>
          <div style={{ display: 'flex', gap: 4, minWidth: 'max-content' }}>
            {calendarData.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={`${format(day.date, 'MMM d, yyyy')}: ${day.count} application${day.count !== 1 ? 's' : ''}`}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: COLORS[day.level],
                      cursor: 'default',
                      transition: 'transform 0.1s ease',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: 'var(--t3)' }}>Darker shades indicate higher daily submission volume.</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: 'var(--t3)' }}>
            <span>Less</span>
            {COLORS.map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 4. CAREER GOALS TAB (Live System Goals + Custom Milestones)
// ═══════════════════════════════════════════════════════════════
interface CustomGoal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  category: 'Applications' | 'Interviews' | 'Study & Prep' | 'Networking';
  deadline: string;
  completed: boolean;
}

const DEFAULT_GOALS: CustomGoal[] = [
  {
    id: 'cg-1',
    title: 'Solve LeetCode Top 75 questions',
    current: 42,
    target: 75,
    unit: 'problems',
    category: 'Study & Prep',
    deadline: '2026-03-31',
    completed: false,
  },
  {
    id: 'cg-2',
    title: 'Conduct System Design mock interviews',
    current: 3,
    target: 5,
    unit: 'sessions',
    category: 'Study & Prep',
    deadline: '2026-04-15',
    completed: false,
  },
  {
    id: 'cg-3',
    title: 'Reach out to alumni for technical referrals',
    current: 7,
    target: 10,
    unit: 'referrals',
    category: 'Networking',
    deadline: '2026-04-01',
    completed: false,
  },
];

const GoalsTab: React.FC<{ applications: Application[] }> = ({ applications }) => {
  const { addToast } = useToast();
  const [goals, setGoals] = useState<CustomGoal[]>(() => {
    const saved = localStorage.getItem('applyflow_career_goals');
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState(10);
  const [newUnit, setNewUnit] = useState('tasks');
  const [newCategory, setNewCategory] = useState<CustomGoal['category']>('Study & Prep');
  const [newDeadline, setNewDeadline] = useState('');

  useEffect(() => {
    localStorage.setItem('applyflow_career_goals', JSON.stringify(goals));
  }, [goals]);

  // System dynamic goals computed from applications
  const systemGoals = useMemo(() => {
    const totalApps = applications.length;
    const totalInterviews = applications.filter((a) => a.status === 'Interview' || a.status === 'Offer').length;
    const totalOffers = applications.filter((a) => a.status === 'Offer').length;

    return [
      {
        id: 'sys-1',
        title: 'Target Application Submissions',
        current: totalApps,
        target: Math.max(25, Math.ceil((totalApps + 1) / 10) * 10),
        unit: 'applications',
        color: '#6366f1',
      },
      {
        id: 'sys-2',
        title: 'Secured Interview Rounds',
        current: totalInterviews,
        target: Math.max(5, Math.ceil((totalInterviews + 1) / 5) * 5),
        unit: 'interviews',
        color: '#f59e0b',
      },
      {
        id: 'sys-3',
        title: 'Final Job Offers Target',
        current: totalOffers,
        target: Math.max(2, totalOffers + 1),
        unit: 'offers',
        color: '#10b981',
      },
    ];
  }, [applications]);

  const handleIncrement = (id: string, delta: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const nextVal = Math.max(0, g.current + delta);
          return { ...g, current: nextVal, completed: nextVal >= g.target };
        }
        return g;
      })
    );
  };

  const handleToggleComplete = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const nextCompleted = !g.completed;
          return {
            ...g,
            completed: nextCompleted,
            current: nextCompleted ? g.target : Math.max(0, g.target - 1),
          };
        }
        return g;
      })
    );
  };

  const handleDeleteGoal = (id: string, title: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    addToast('Goal Removed', `Deleted "${title}"`, 'info');
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addToast('Validation Error', 'Goal title is required', 'error');
      return;
    }
    const created: CustomGoal = {
      id: `goal-${Date.now()}`,
      title: newTitle.trim(),
      current: 0,
      target: Number(newTarget) || 5,
      unit: newUnit.trim() || 'tasks',
      category: newCategory,
      deadline: newDeadline,
      completed: false,
    };
    setGoals([created, ...goals]);
    setShowAddModal(false);
    setNewTitle('');
    setNewTarget(10);
    setNewUnit('tasks');
    setNewDeadline('');
    addToast('Goal Created', 'New milestone added to your tracker', 'success');
  };

  return (
    <div className="pb">
      {/* Live Pipeline Milestones */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14, color: 'var(--t1)' }}>
          Active Pipeline Targets (Live Data)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {systemGoals.map((g) => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            return (
              <div key={g.id} className="card" style={{ padding: 18, borderLeft: `4px solid ${g.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)' }}>{g.title}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: g.color }}>
                    {g.current} / {g.target} {g.unit}
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: g.color, borderRadius: 10, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6 }}>{pct}% achieved</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Goals & Action Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--t1)' }}>Personal Preparation Milestones</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
              Custom targets for coding practice, portfolio updates, and networking outreach.
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            <span>Add Personal Goal</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            return (
              <div
                key={g.id}
                className="card card-hover"
                style={{
                  padding: 18,
                  border: g.completed ? '1px solid var(--success)' : '1px solid var(--border)',
                  background: g.completed ? 'var(--success-bg)' : 'var(--card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={() => handleToggleComplete(g.id)}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        border: g.completed ? 'none' : '1.5px solid var(--border)',
                        background: g.completed ? 'var(--success)' : 'var(--card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {g.completed && <Check style={{ width: 14, height: 14, color: '#fff' }} />}
                    </button>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: g.completed ? 'var(--success)' : 'var(--t1)',
                          textDecoration: g.completed ? 'line-through' : 'none',
                        }}
                      >
                        {g.title}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                          {g.category}
                        </span>
                        {g.deadline && <span style={{ fontSize: 11.5, color: 'var(--t3)' }}>Target: {g.deadline}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Increment / Decrement & Delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--page)', padding: '2px 6px', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <button
                        onClick={() => handleIncrement(g.id, -1)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 6px', fontSize: 12 }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: 12.5, fontWeight: 800, minWidth: 60, textAlign: 'center' }}>
                        {g.current} / {g.target}
                      </span>
                      <button
                        onClick={() => handleIncrement(g.id, 1)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 6px', fontSize: 12 }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteGoal(g.id, g.title)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#ef4444', padding: '4px' }}
                      title="Delete goal"
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 10, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: g.completed ? 'var(--success)' : 'var(--accent)',
                      borderRadius: 10,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15,23,42,0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 28,
                width: '100%',
                maxWidth: 480,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                <span>Create Preparation Milestone</span>
              </h3>
              <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="lbl">Milestone Title *</label>
                  <input
                    className="inp"
                    placeholder="e.g. Complete Full Stack open source project"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="lbl">Target Count *</label>
                    <input
                      type="number"
                      min={1}
                      className="inp"
                      value={newTarget}
                      onChange={(e) => setNewTarget(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <label className="lbl">Unit / Metric</label>
                    <input
                      className="inp"
                      placeholder="e.g. hours, PRs, problems"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="lbl">Category</label>
                    <select
                      className="inp"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as CustomGoal['category'])}
                    >
                      <option value="Study & Prep">Study & Prep</option>
                      <option value="Applications">Applications</option>
                      <option value="Networking">Networking</option>
                      <option value="Interviews">Interviews</option>
                    </select>
                  </div>
                  <div>
                    <label className="lbl">Target Date</label>
                    <input
                      type="date"
                      className="inp"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Milestone
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 5. EXECUTIVE REPORTS TAB (Real Funnel Math + Exportable Report)
// ═══════════════════════════════════════════════════════════════
const ReportsTab: React.FC<{ applications: Application[] }> = ({ applications }) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const total = applications.length;
  const appliedCount = applications.filter((a) => a.status !== 'Wishlist').length;
  const oaCount = applications.filter((a) => ['OA/Assessment', 'Interview', 'Offer'].includes(a.status)).length;
  const interviewCount = applications.filter((a) => ['Interview', 'Offer'].includes(a.status)).length;
  const offerCount = applications.filter((a) => a.status === 'Offer').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;
  const ghostedCount = applications.filter((a) => a.status === 'Ghosted').length;

  const interviewConversion = appliedCount > 0 ? Math.round((interviewCount / appliedCount) * 100) : 0;
  const offerConversion = interviewCount > 0 ? Math.round((offerCount / interviewCount) * 100) : 0;

  const metrics = [
    { label: 'Total Applications', value: total, icon: Briefcase, color: '#6366f1' },
    { label: 'Interview Rate', value: `${interviewConversion}%`, icon: Award, color: '#10b981' },
    { label: 'Offers Secured', value: offerCount, icon: CheckCircle2, color: '#065f46' },
    { label: 'Ghosted / Unresponsive', value: ghostedCount, icon: Clock, color: '#64748b' },
    { label: 'Rejections Logged', value: rejectedCount, icon: XCircle, color: '#ef4444' },
  ];

  const generateReportMarkdown = () => {
    return `# Career Pipeline Executive Intelligence Report
Generated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}

## Pipeline Summary
- Total Tracked Applications: ${total}
- Formal Submissions: ${appliedCount}
- OA / Technical Assessments: ${oaCount}
- Advanced to Interviews: ${interviewCount} (${interviewConversion}% conversion from application)
- Offers Received: ${offerCount} (${offerConversion}% conversion from interview)
- Ghosted / Stale Applications: ${ghostedCount}
- Rejections Logged: ${rejectedCount}

## Pipeline Conversion Funnel
1. Applied: ${appliedCount} (100%)
2. Assessment / OA: ${oaCount} (${appliedCount > 0 ? Math.round((oaCount / appliedCount) * 100) : 0}%)
3. Interview Stage: ${interviewCount} (${appliedCount > 0 ? Math.round((interviewCount / appliedCount) * 100) : 0}%)
4. Job Offers: ${offerCount} (${appliedCount > 0 ? Math.round((offerCount / appliedCount) * 100) : 0}%)

## Recommended Strategic Focus
${
  interviewConversion < 15
    ? '- Recommendation: Optimize ATS resume keywords and seek direct employee referrals to boost interview callback rate.'
    : '- Recommendation: Pipeline top-of-funnel is healthy. Focus intensive prep on System Design and behavioral STAR responses.'
}
`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportMarkdown());
    setCopied(true);
    addToast('Report Copied', 'Executive report copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReport = () => {
    const text = generateReportMarkdown();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-report-${format(new Date(), 'yyyy-MM-dd')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Report Downloaded', 'Saved executive report to file', 'success');
  };

  return (
    <div className="pb">
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card" style={{ padding: 18, borderTop: `3px solid ${m.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>{m.label}</span>
                <Icon style={{ width: 16, height: 16, color: m.color }} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: m.color }}>{m.value}</div>
            </div>
          );
        })}
      </div>

      {/* Real Funnel Card */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--t1)' }}>Calculated Pipeline Conversion Funnel</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
              Stage-by-stage progression derived from your actual application records.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleCopyReport}
              className="btn btn-ghost btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              {copied ? <Check style={{ width: 14, height: 14 }} /> : <Clipboard style={{ width: 14, height: 14 }} />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
            <button
              onClick={handleDownloadReport}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Download style={{ width: 14, height: 14 }} />
              <span>Download .md</span>
            </button>
          </div>
        </div>

        {/* Funnel Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: '1. Applications Submitted', count: appliedCount, color: '#6366f1', pct: 100 },
            {
              label: '2. OA / Technical Assessment',
              count: oaCount,
              color: '#8b5cf6',
              pct: appliedCount > 0 ? Math.round((oaCount / appliedCount) * 100) : 0,
            },
            {
              label: '3. Technical & Panel Interviews',
              count: interviewCount,
              color: '#f59e0b',
              pct: appliedCount > 0 ? Math.round((interviewCount / appliedCount) * 100) : 0,
            },
            {
              label: '4. Formal Job Offers',
              count: offerCount,
              color: '#10b981',
              pct: appliedCount > 0 ? Math.round((offerCount / appliedCount) * 100) : 0,
            },
          ].map((step) => (
            <div key={step.label} style={{ background: 'var(--page)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                <span style={{ color: 'var(--t1)' }}>{step.label}</span>
                <span style={{ color: step.color }}>
                  {step.count} ({step.pct}% of submissions)
                </span>
              </div>
              <div style={{ height: 8, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${step.pct}%`,
                    background: step.color,
                    borderRadius: 999,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 6. TECH TRENDS TAB & SKILL GAP ANALYZER
// ═══════════════════════════════════════════════════════════════
interface TechTrend {
  skill: string;
  demand: number; // 0 - 100
  growth: string;
  category: 'Frontend' | 'Backend' | 'AI & ML' | 'DevOps & Cloud' | 'Databases' | 'Systems';
  description: string;
}

const INDUSTRY_TRENDS: TechTrend[] = [
  { skill: 'TypeScript', demand: 95, growth: '+18%', category: 'Frontend', description: 'Industry standard type-safe JavaScript across enterprise applications' },
  { skill: 'React / Next.js', demand: 92, growth: '+14%', category: 'Frontend', description: 'Dominant UI library and full-stack React framework with SSR and App Router' },
  { skill: 'Python (AI & ML)', demand: 91, growth: '+34%', category: 'AI & ML', description: 'Language of choice for model fine-tuning, PyTorch, and AI workflows' },
  { skill: 'LLM & GenAI Integration', demand: 89, growth: '+68%', category: 'AI & ML', description: 'RAG architectures, vector embeddings, and LangChain/OpenAI SDKs' },
  { skill: 'Go (Golang)', demand: 82, growth: '+24%', category: 'Backend', description: 'High-performance microservices, concurrency routines, and cloud tooling' },
  { skill: 'PostgreSQL', demand: 86, growth: '+11%', category: 'Databases', description: 'Gold standard relational DB with JSONB, extensions (pgvector), and ACID reliability' },
  { skill: 'Kubernetes & Docker', demand: 80, growth: '+19%', category: 'DevOps & Cloud', description: 'Container orchestration, CI/CD automation, and cloud-native deployments' },
  { skill: 'Rust', demand: 68, growth: '+45%', category: 'Systems', description: 'Memory-safe systems programming, WebAssembly runtimes, and high-throughput engines' },
  { skill: 'GraphQL & REST APIs', demand: 84, growth: '+8%', category: 'Backend', description: 'Scalable schema design, rate limiting, and contract-driven API development' },
];

const TrendsTab: React.FC = () => {
  const { skills, addCustomSkill } = useSkills();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrends = INDUSTRY_TRENDS.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddTrendToSkills = (skillName: string) => {
    const existing = skills.find((s) => s.skill.toLowerCase() === skillName.toLowerCase());
    if (existing) {
      addToast('Already Tracked', `"${skillName}" is already on your Skills Radar (${existing.level}%)`, 'info');
      return;
    }
    addCustomSkill(skillName, 55);
    addToast('Added to Radar', `"${skillName}" added to your Skills Radar at 55%`, 'success');
  };

  return (
    <div className="pb">
      {/* Controls: Search + Categories */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
            <Search
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 15,
                height: 15,
                color: 'var(--t3)',
              }}
            />
            <input
              className="inp"
              style={{ paddingLeft: 34 }}
              placeholder="Search tech stack or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['All', 'Frontend', 'Backend', 'AI & ML', 'DevOps & Cloud', 'Databases', 'Systems'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  border: selectedCategory === cat ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: selectedCategory === cat ? 'var(--accent-bg)' : 'var(--card)',
                  color: selectedCategory === cat ? 'var(--accent)' : 'var(--t2)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trends List with Skill Gap Matcher */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredTrends.map((t) => {
          const userSkillMatch = skills.find(
            (s) => s.skill.toLowerCase() === t.skill.toLowerCase() || t.skill.toLowerCase().includes(s.skill.toLowerCase())
          );

          return (
            <div key={t.skill} className="card card-hover" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)' }}>{t.skill}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'var(--accent-bg)', color: 'var(--accent)', fontWeight: 700 }}>
                    {t.category}
                  </span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#ecfdf5', color: '#065f46', fontWeight: 800 }}>
                    {t.growth} YoY Demand
                  </span>
                </div>

                {/* Skill Matcher Button */}
                <div>
                  {userSkillMatch ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#065f46',
                        background: '#ecfdf5',
                        padding: '4px 10px',
                        borderRadius: 12,
                      }}
                    >
                      <Check style={{ width: 13, height: 13 }} />
                      <span>On Your Radar ({userSkillMatch.level}%)</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddTrendToSkills(t.skill)}
                      className="btn btn-ghost btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, borderColor: 'var(--accent)', color: 'var(--accent)' }}
                    >
                      <Plus style={{ width: 13, height: 13 }} />
                      <span>Add to My Skills</span>
                    </button>
                  )}
                </div>
              </div>

              <div style={{ fontSize: 12.5, color: 'var(--t2)', marginBottom: 12 }}>
                {t.description}
              </div>

              {/* Market Demand Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>
                  <span>Industry Hiring Index</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{t.demand}/100</span>
                </div>
                <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${t.demand}%`,
                      background: 'linear-gradient(90deg, var(--accent), var(--accent-h))',
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
