import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Layers,
  Mic,
  ArrowUpRight,
  User,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { QuickAddBar } from '../components/dashboard/QuickAddBar';
import { SearchHealthWidget } from '../components/dashboard/SearchHealthWidget';
import { useApplications } from '../hooks/useApplications';
import { useAuthStore } from '../store/authStore';
import { useUserSettings } from '../hooks/useUserSettings';
import { differenceInDays, isToday, isPast, isTomorrow, format, formatDistanceToNow } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  Wishlist: '#78716c',
  Applied: '#0d9488',
  'OA/Assessment': '#7c3aed',
  Interview: '#d97706',
  Offer: '#059669',
  Ghosted: '#57534e',
  Rejected: '#e11d48',
  Withdrawn: '#78716c',
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const color = STATUS_COLORS[status] || '#94a3b8';
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 20,
        background: `${color}18`,
        color,
        border: `1px solid ${color}33`,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
};

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { applications, loading } = useApplications();
  const { settings } = useUserSettings();

  const rawName = settings?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Candidate';
  const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayStr = format(new Date(), 'EEEE, MMMM d, yyyy');

  // Core calculations
  const total = applications.length;
  const activePipeline = applications.filter((a) => !['Rejected', 'Withdrawn', 'Ghosted'].includes(a.status));
  const interviews = applications.filter((a) => a.status === 'Interview');
  const offers = applications.filter((a) => a.status === 'Offer');
  const ghosted = applications.filter((a) => a.status === 'Ghosted');

  // Action center alerts
  const overdue = applications.filter(
    (a) => a.deadline && isPast(new Date(a.deadline)) && !isToday(new Date(a.deadline)) && !['Rejected', 'Offer'].includes(a.status)
  );

  const upcomingDeadlines = applications.filter(
    (a) => a.deadline && (isToday(new Date(a.deadline)) || isTomorrow(new Date(a.deadline))) && !['Rejected', 'Offer'].includes(a.status)
  );

  const needsFollowUp = applications.filter((a) => {
    const updated = new Date(a.updatedAt || a.createdAt);
    return differenceInDays(new Date(), updated) >= 7 && ['Applied', 'OA/Assessment'].includes(a.status);
  });

  const staleApplications = applications.filter((a) => {
    const updated = new Date(a.updatedAt || a.createdAt);
    return differenceInDays(new Date(), updated) >= (settings?.staleThresholdDays || 14) && a.status === 'Applied';
  });

  const thisWeekApps = applications.filter((a) => {
    const d = new Date(a.createdAt);
    return differenceInDays(new Date(), d) <= 7;
  }).length;

  const responseRate = total > 0 ? Math.round(((offers.length + interviews.length) / total) * 100) : 0;

  const recent = [...applications]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 6);

  // Pipeline distribution segments
  const distributionSegments = [
    { status: 'Wishlist', count: applications.filter((a) => a.status === 'Wishlist').length, color: '#94a3b8' },
    { status: 'Applied', count: applications.filter((a) => a.status === 'Applied').length, color: '#6366f1' },
    { status: 'OA/Assessment', count: applications.filter((a) => a.status === 'OA/Assessment').length, color: '#8b5cf6' },
    { status: 'Interview', count: interviews.length, color: '#f59e0b' },
    { status: 'Offer', count: offers.length, color: '#10b981' },
    { status: 'Ghosted', count: ghosted.length, color: '#64748b' },
    { status: 'Rejected', count: applications.filter((a) => a.status === 'Rejected').length, color: '#ef4444' },
  ];

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <svg width={42} height={42} viewBox="0 0 24 24" fill="none" className="animate-spin-os">
              <circle cx="12" cy="12" r="10" stroke="#e0e7ff" strokeWidth={3} />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" />
            </svg>
            <p style={{ marginTop: 14, fontSize: 13.5, color: 'var(--t2)', fontWeight: 600 }}>Loading workspace…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* ── Executive Header ── */}
      <div className="ph" style={{ paddingBottom: 20 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {todayStr}
              </div>
              <h1 className="page-title" style={{ marginTop: 2 }}>
                {greeting}, {firstName}
              </h1>
              <p className="page-sub" style={{ margin: 0 }}>
                {activePipeline.length} active opportunities in motion • Target: {settings?.targetTitle || 'Software Engineer'}
              </p>
            </div>

            {/* Top Quick Actions */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link
                to="/applications"
                className="btn btn-ghost btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              >
                <Briefcase style={{ width: 14, height: 14 }} />
                <span>Open Kanban</span>
              </Link>
              <Link
                to="/profile"
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              >
                <User style={{ width: 14, height: 14 }} />
                <span>Profile Hub</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* ── Quick Application Input Bar ── */}
        <QuickAddBar applications={applications} />

        {/* ── Metric Cards Overview ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div className="card" style={{ padding: '16px 20px', borderTop: '3px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Briefcase style={{ width: 15, height: 15, color: '#6366f1' }} />
                  <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>Active Pipeline</span>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#e0e7ff', color: 'var(--accent)' }}>
                  {offers.length > 0 ? `${offers.length} offer in hand 🎉` : `${total} total tracked`}
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', lineHeight: 1 }}>{activePipeline.length}</div>
              <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 4 }}>In-flight applications in review</div>
            </div>

            <div className="card" style={{ padding: '16px 20px', borderTop: '3px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar style={{ width: 15, height: 15, color: '#f59e0b' }} />
                  <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>Interview Stages</span>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: interviews.length > 0 ? '#fef3c7' : '#f1f5f9', color: interviews.length > 0 ? '#b45309' : '#64748b' }}>
                  {interviews.length > 0 ? `${interviews.length} in motion` : 'Ready to prep'}
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>{interviews.length}</div>
              <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 4 }}>Live technical & recruiter panels</div>
            </div>

            <div className="card" style={{ padding: '16px 20px', borderTop: '3px solid #8b5cf6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp style={{ width: 15, height: 15, color: '#8b5cf6' }} />
                  <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>Velocity (7 Days)</span>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: thisWeekApps >= (settings?.weeklyGoal || 5) ? '#dcfce7' : '#ede9fe', color: thisWeekApps >= (settings?.weeklyGoal || 5) ? '#15803d' : '#7c3aed' }}>
                  {thisWeekApps >= (settings?.weeklyGoal || 5) ? 'Weekly goal met 🎯' : `${Math.max(0, (settings?.weeklyGoal || 5) - thisWeekApps)} left to goal`}
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#8b5cf6', lineHeight: 1 }}>{thisWeekApps}</div>
              <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 4 }}>Applications sent this week</div>
            </div>

            <div className="card" style={{ padding: '16px 20px', borderTop: '3px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 style={{ width: 15, height: 15, color: '#10b981' }} />
                  <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>Response Rate</span>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: responseRate >= 18 ? '#dcfce7' : '#f1f5f9', color: responseRate >= 18 ? '#15803d' : '#64748b' }}>
                  {responseRate >= 18 ? 'Above avg (>18%)' : 'Industry avg: 15-20%'}
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981', lineHeight: 1 }}>{responseRate}%</div>
              <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 4 }}>Interview callback ratio</div>
            </div>
          </div>
        </motion.div>

        {/* ── Search Momentum & Pipeline Health Index Widget ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <SearchHealthWidget
            applications={applications}
            weeklyGoal={settings?.weeklyGoal || 5}
            streak={settings?.streak || 1}
          />
        </motion.div>

        {/* ── Visual Pipeline Distribution ── */}
        {total > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>Pipeline Distribution ({total} Total)</span>
                <Link to="/applications" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
                  Filter on Board →
                </Link>
              </div>

              {/* Multi-segment distribution bar */}
              <div style={{ height: 10, borderRadius: 8, overflow: 'hidden', display: 'flex', background: 'var(--border-light)', gap: 1 }}>
                {distributionSegments.map((seg) => {
                  if (seg.count === 0) return null;
                  const pct = Math.max(2, (seg.count / total) * 100);
                  return (
                    <div
                      key={seg.status}
                      title={`${seg.status}: ${seg.count} (${Math.round((seg.count / total) * 100)}%)`}
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: seg.color,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  );
                })}
              </div>

              {/* Distribution legend pills */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12, fontSize: 11.5, color: 'var(--t2)' }}>
                {distributionSegments.map((seg) => (
                  <div key={seg.status} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color }} />
                    <span>{seg.status}:</span>
                    <strong style={{ color: 'var(--t1)' }}>{seg.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Action Center: Priority Focus Items ── */}
        {(upcomingDeadlines.length > 0 || overdue.length > 0 || needsFollowUp.length > 0 || staleApplications.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Clock style={{ width: 17, height: 17, color: 'var(--accent)' }} />
                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>Priority Action Items</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Upcoming interviews today / tomorrow */}
                {upcomingDeadlines.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      background: 'var(--page)',
                      padding: '12px 16px',
                      borderRadius: 12,
                      borderLeft: '4px solid #f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Calendar style={{ width: 16, height: 16, color: '#f59e0b' }} />
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--t1)' }}>{a.company}</span>
                        <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 8 }}>
                          {a.role} — {isToday(new Date(a.deadline!)) ? 'Interview Scheduled Today' : 'Interview Tomorrow'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StatusPill status={a.status} />
                      <Link to="/journal?tab=mock" className="btn btn-ghost btn-sm" style={{ fontSize: 11.5, padding: '4px 10px' }}>
                        Prep Interview
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Overdue Deadlines */}
                {overdue.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      background: 'var(--page)',
                      padding: '12px 16px',
                      borderRadius: 12,
                      borderLeft: '4px solid #ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <AlertTriangle style={{ width: 16, height: 16, color: '#ef4444' }} />
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--t1)' }}>{a.company}</span>
                        <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 8 }}>
                          Deadline passed on {a.deadline ? format(new Date(a.deadline), 'MMM d') : 'recently'}
                        </span>
                      </div>
                    </div>
                    <StatusPill status={a.status} />
                  </div>
                ))}

                {/* Recommended Follow-up */}
                {needsFollowUp.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    style={{
                      background: 'var(--page)',
                      padding: '12px 16px',
                      borderRadius: 12,
                      borderLeft: '4px solid #6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Clock style={{ width: 16, height: 16, color: '#6366f1' }} />
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--t1)' }}>{a.company}</span>
                        <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 8 }}>
                          Applied {formatDistanceToNow(new Date(a.updatedAt || a.createdAt), { addSuffix: true })} — follow-up recommended
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StatusPill status={a.status} />
                      <Link to="/journal?tab=email" className="btn btn-ghost btn-sm" style={{ fontSize: 11.5, padding: '4px 10px' }}>
                        Draft Email
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Two Columns: Recent Applications + Command Shortcuts ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          {/* Left: Recent Activity Applications */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>Recent Pipeline Activity</h2>
              <Link to="/applications" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>
                View all applications →
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>
                <Briefcase style={{ width: 36, height: 36, margin: '0 auto 10px', opacity: 0.4 }} />
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>No applications logged yet</div>
                <div style={{ fontSize: 12.5, marginTop: 4 }}>Use the quick add bar above or import jobs to start tracking.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recent.map((app) => (
                  <Link
                    key={app.id}
                    to="/applications"
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      className="card card-hover"
                      style={{
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: 'var(--accent-bg)',
                            color: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 15,
                            flexShrink: 0,
                          }}
                        >
                          {app.company.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {app.company}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {app.role} • {formatDistanceToNow(new Date(app.updatedAt || app.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StatusPill status={app.status} />
                        <ChevronRight style={{ width: 14, height: 14, color: 'var(--t3)' }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Fast Navigation Shortcuts */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', marginBottom: 14 }}>Workspace Shortcuts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                {
                  to: '/applications',
                  icon: Briefcase,
                  color: '#6366f1',
                  title: 'Kanban Pipeline',
                  subtitle: 'Drag & drop stages and review cards',
                },
                {
                  to: '/journal?tab=flashcards',
                  icon: Layers,
                  color: '#8b5cf6',
                  title: 'Flashcard Studio',
                  subtitle: 'System Design & algorithms practice',
                },
                {
                  to: '/journal?tab=mock',
                  icon: Mic,
                  color: '#f59e0b',
                  title: 'Mock Simulator',
                  subtitle: 'Timed STAR method response practice',
                },
                {
                  to: '/insights',
                  icon: TrendingUp,
                  color: '#10b981',
                  title: 'Analytics & Goals',
                  subtitle: 'Activity heatmap & competency radar',
                },
                {
                  to: '/profile',
                  icon: User,
                  color: '#64748b',
                  title: 'Profile & Settings',
                  subtitle: 'Target compensation & data backup',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                    <div
                      className="card card-hover"
                      style={{
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: `${item.color}15`,
                            color: item.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon style={{ width: 17, height: 17 }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--t1)' }}>{item.title}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 1 }}>{item.subtitle}</div>
                        </div>
                      </div>
                      <ArrowUpRight style={{ width: 14, height: 14, color: 'var(--t3)' }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
};
