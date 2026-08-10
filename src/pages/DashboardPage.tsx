import { AlertTriangle, Clipboard, Calendar, TrendingUp, Rocket, Briefcase, FileText, BarChart } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppShell } from '../components/layout/AppShell';
import { QuickAddBar } from '../components/dashboard/QuickAddBar';
import { useApplications } from '../hooks/useApplications';
import { useAuthStore } from '../store/authStore';
import { differenceInDays, isToday, isPast, isTomorrow } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  Wishlist: '#94a3b8', Applied: '#6366f1', 'OA/Assessment': '#8b5cf6',
  Interview: '#f59e0b', Offer: '#10b981', Rejected: '#ef4444', Withdrawn: '#94a3b8',
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => (
  <span style={{
    fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
    background: `${STATUS_COLORS[status]}22`, color: STATUS_COLORS[status],
    border: `1px solid ${STATUS_COLORS[status]}44`,
    whiteSpace: 'nowrap',
  }}>{status}</span>
);

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { applications, loading } = useApplications();

  const rawName = user?.displayName || user?.email?.split('@')[0] || 'there';
  const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Derived data
  const total = applications.length;
  const interviews = applications.filter((a) => a.status === 'Interview');
  const offers = applications.filter((a) => a.status === 'Offer');
  const overdue = applications.filter((a) => a.deadline && isPast(new Date(a.deadline)) && !isToday(new Date(a.deadline)) && a.status !== 'Rejected');
  const dueSoon = applications.filter((a) => {
    if (!a.deadline) return false;
    const d = new Date(a.deadline);
    const days = differenceInDays(d, new Date());
    return days >= 0 && days <= 3;
  });
  const needsFollowUp = applications.filter((a) => {
    const updated = new Date(a.updatedAt || a.createdAt);
    return differenceInDays(new Date(), updated) >= 7 && ['Applied', 'OA/Assessment'].includes(a.status);
  });
  const recent = [...applications].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()).slice(0, 5);
  const upcomingInterviews = applications.filter((a) => a.deadline && (isToday(new Date(a.deadline)) || isTomorrow(new Date(a.deadline)))).slice(0, 3);

  const thisWeekApps = applications.filter((a) => {
    const d = new Date(a.createdAt);
    return differenceInDays(new Date(), d) <= 7;
  }).length;

  const responseRate = total > 0 ? Math.round(((offers.length + interviews.length) / total) * 100) : 0;

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <svg width={42} height={42} viewBox="0 0 24 24" fill="none" className="animate-spin-os">
              <circle cx="12" cy="12" r="10" stroke="#e0e7ff" strokeWidth={3} />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" />
            </svg>
            <p style={{ marginTop: 14, fontSize: 13.5, color: 'var(--t2)', fontWeight: 600 }}>Loading ApplyFlow…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* ── Header ── */}
      <div className="ph" style={{ paddingBottom: 20 }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="page-title">{greeting}, {firstName} 👋</h1>
          <p className="page-sub">Here's what needs your attention today</p>
        </motion.div>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* ── Quick Add ── */}
        <QuickAddBar applications={applications} />

        {/* ── Today's Focus ── */}
        {(overdue.length > 0 || dueSoon.length > 0 || needsFollowUp.length > 0 || upcomingInterviews.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>Today's Focus</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {overdue.map((a) => (
                <div key={a.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderLeft: '3px solid #ef4444' }}>
                  <span style={{ fontSize: 16 }}><AlertTriangle className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{a.company}</span>
                    <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 8 }}>deadline passed</span>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              ))}
              {upcomingInterviews.map((a) => (
                <div key={a.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderLeft: '3px solid #f59e0b' }}>
                  <span style={{ fontSize: 16 }}>🗓️</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{a.company}</span>
                    <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 8 }}>
                      {isToday(new Date(a.deadline!)) ? 'interview today!' : 'interview tomorrow'}
                    </span>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              ))}
              {needsFollowUp.slice(0, 3).map((a) => (
                <div key={a.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderLeft: '3px solid #6366f1' }}>
                  <span style={{ fontSize: 16 }}>📬</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{a.company}</span>
                    <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 8 }}>follow up recommended</span>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Weekly Stats ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Total Applications', value: total, icon: <Clipboard className="inline-block w-4 h-4 mr-1.5 align-text-bottom" />, color: '#6366f1' },
              { label: 'This Week', value: thisWeekApps, icon: <Calendar className="inline-block w-4 h-4 mr-1.5 align-text-bottom" />, color: '#8b5cf6' },
              { label: 'Interviews', value: interviews.length, icon: '🎤', color: '#f59e0b' },
              { label: 'Response Rate', value: `${responseRate}%`, icon: <TrendingUp className="inline-block w-4 h-4 mr-1.5 align-text-bottom" />, color: '#10b981' },
            ].map((stat) => (
              <div key={stat.label} className="card" style={{ padding: '16px 18px', borderTop: `3px solid ${stat.color}` }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 11.5, color: 'var(--t2)', marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Two column: Recent Applications + Quick Links ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Recent Applications */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>📌 Recent Applications</h2>
              <Link to="/applications" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)' }}>View all →</Link>
            </div>
            {recent.length === 0 ? (
              <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--t3)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}><Rocket className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /></div>
                <div style={{ fontWeight: 700 }}>No applications yet</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Add your first application above</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recent.map((app) => (
                  <div key={app.id} className="card card-hover" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🏢</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{app.company}</div>
                      <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.role}</div>
                    </div>
                    <StatusPill status={app.status} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Links Panel */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', marginBottom: 12 }}>🔗 Quick Access</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { to: '/applications', icon: <Briefcase className="inline-block w-4 h-4 mr-1.5 align-text-bottom" />, label: 'Kanban Board', sub: 'Drag & drop applications' },
                { to: '/journal', icon: <FileText className="inline-block w-4 h-4 mr-1.5 align-text-bottom" />, label: 'Interview Journal', sub: 'Log notes & questions' },
                { to: '/insights', icon: <BarChart className="inline-block w-4 h-4 mr-1.5 align-text-bottom" />, label: 'Analytics', sub: 'Track your progress' },
                { to: '/journal?tab=mock', icon: '🎤', label: 'Mock Interview', sub: 'Practice your answers' },
                { to: '/journal?tab=mindset', icon: '🧘', label: 'Mindset Studio', sub: 'Calm pre-interview nerves' },
              ].map((link) => (
                <Link key={link.to} to={link.to} style={{ textDecoration: 'none' }}>
                  <div className="card card-hover" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{link.icon}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{link.label}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 1 }}>{link.sub}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
};
