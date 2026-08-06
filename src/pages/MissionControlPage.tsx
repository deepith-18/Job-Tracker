import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays, isToday, isPast, isFuture } from 'date-fns';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Badge } from '../components/ui/Badge';
import { useApplications } from '../hooks/useApplications';
import { useUserSettings } from '../hooks/useUserSettings';
import { useAuthStore } from '../store/authStore';
import type { ApplicationStatus } from '../types';

const STATUS_BAR: Record<ApplicationStatus, string> = {
  Wishlist: '#94a3b8', Applied: '#6366f1', 'OA/Assessment': '#8b5cf6',
  Interview: '#f59e0b', Offer: '#10b981', Rejected: '#ef4444', Withdrawn: '#94a3b8',
};

interface StatProps { icon: string; label: string; value: number | string; sub?: string; bg: string; delay: number; }
const Stat: React.FC<StatProps> = ({ icon, label, value, sub, bg, delay }) => (
  <motion.div className="stat" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3, ease: [0.16,1,0.3,1] }}>
    <div className="stat-icon" style={{ background: bg }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
    </div>
    <div className="stat-val">{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>{sub}</div>}
  </motion.div>
);

export const MissionControlPage: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const { applications, loading } = useApplications();
  const { settings, updateSettings } = useUserSettings();
  const [editGoal, setEditGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(settings.goal));

  const goal = settings.goal;
  const streak = settings.streak;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user?.email?.split('@')[0] ?? 'there';

  const stats = useMemo(() => {
    const total = applications.length;
    const byStatus: Partial<Record<ApplicationStatus, number>> = {};
    applications.forEach(a => { byStatus[a.status] = (byStatus[a.status] ?? 0) + 1; });

    const active = (byStatus['Applied'] ?? 0) + (byStatus['OA/Assessment'] ?? 0);
    const interviews = byStatus['Interview'] ?? 0;
    const offers = byStatus['Offer'] ?? 0;
    const rejected = byStatus['Rejected'] ?? 0;

    const upcoming = applications
      .filter(a => a.deadline && (isFuture(a.deadline) || isToday(a.deadline)))
      .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime()).slice(0, 5);

    const overdue = applications.filter(a =>
      a.deadline && isPast(a.deadline) && !isToday(a.deadline) &&
      !['Rejected', 'Withdrawn', 'Offer'].includes(a.status)
    );

    // Top rejection reasons
    const reasonCounts: Record<string, number> = {};
    applications.forEach(a => a.rejectionReasons.forEach(r => { reasonCounts[r] = (reasonCounts[r] ?? 0) + 1; }));
    const topReasons = Object.entries(reasonCounts).sort((a,b) => b[1]-a[1]).slice(0, 3);

    const recent = [...applications].sort((a,b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 6);

    return { total, byStatus, active, interviews, offers, rejected, upcoming, overdue, topReasons, recent };
  }, [applications]);

  const pct = Math.min(100, Math.round((stats.total / goal) * 100));
  const remaining = Math.max(0, goal - stats.total);

  const handleGoalSave = () => {
    const n = Math.max(1, parseInt(goalInput) || 100);
    updateSettings({ goal: n });
    setEditGoal(false);
  };

  if (loading) {
    return (
      <AppShell>
        <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}>
          <svg width={36} height={36} viewBox="0 0 24 24" fill="none" className="animate-spin-os">
            <circle cx="12" cy="12" r="10" stroke="#e0e7ff" strokeWidth={2.5} />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />
          </svg>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1136 0%, #1e1b4b 60%, #312e81 100%)',
        padding: '28px 28px 100px', marginBottom: -80, position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{ position:'absolute', top:-60, right:80, width:220, height:220, borderRadius:'50%', background:'rgba(99,102,241,0.15)', filter:'blur(40px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, left:40, width:160, height:160, borderRadius:'50%', background:'rgba(139,92,246,0.12)', filter:'blur(30px)', pointerEvents:'none' }} />

        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
          <p style={{ fontSize:12.5, color:'#a5b4fc', fontWeight:600, marginBottom:4, display:'flex', alignItems:'center', gap:6 }}>
            <span>📅</span> {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          <h1 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:26, fontWeight:800, color:'#fff', marginBottom:6, letterSpacing:'-0.02em' }}>
            {greeting}, {name} 👋
          </h1>
          <p style={{ fontSize:14, color:'#818cf8' }}>
            {stats.total === 0
              ? "Start your job hunt — log your first application!"
              : stats.offers > 0
              ? `You have ${stats.offers} offer${stats.offers > 1 ? 's' : ''}! 🎉 Keep the momentum going.`
              : stats.interviews > 0
              ? `${stats.interviews} interview${stats.interviews > 1 ? 's' : ''} in progress — you're doing great!`
              : `${stats.active} active application${stats.active !== 1 ? 's' : ''} — stay consistent!`}
          </p>
        </motion.div>

        {/* Streak */}
        {streak >= 1 && (
          <motion.div
            initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.2 }}
            style={{
              position:'absolute', top:28, right:28,
              background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)',
              borderRadius:14, padding:'12px 16px', textAlign:'center',
            }}
          >
            <div style={{ fontSize:26, marginBottom:2 }}>🔥</div>
            <div style={{ fontSize:22, fontWeight:800, color:'#fbbf24', lineHeight:1 }}>{streak}</div>
            <div style={{ fontSize:10.5, color:'#fcd34d', fontWeight:600 }}>day streak</div>
          </motion.div>
        )}
      </div>

      <div className="pb" style={{ paddingTop: 0 }}>
        {/* ── Goal Progress Card ── */}
        <motion.div
          className="card"
          style={{ padding:'20px 24px', marginBottom:22, zIndex:1, position:'relative' }}
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.35 }}
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, flexWrap:'wrap', gap:8 }}>
            <div>
              <h3 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:16, fontWeight:800, color:'var(--t1)', marginBottom:3 }}>
                🎯 Application Goal
              </h3>
              {remaining > 0 ? (
                <p style={{ fontSize:13, color:'var(--t2)' }}>
                  Only <strong style={{ color:'var(--accent)' }}>{remaining}</strong> more to reach your goal of {goal}!
                </p>
              ) : (
                <p style={{ fontSize:13, color:'var(--success)', fontWeight:700 }}>🎉 Goal reached! Set a new one?</p>
              )}
            </div>
            {editGoal ? (
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <input
                  type="number" min={1} className="inp" style={{ width:80, padding:'6px 10px', fontSize:13 }}
                  value={goalInput} onChange={e => setGoalInput(e.target.value)} autoFocus
                />
                <button className="btn btn-primary btn-sm" onClick={handleGoalSave}>Set</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditGoal(false)}>✕</button>
              </div>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => { setGoalInput(String(goal)); setEditGoal(true); }}>
                Edit Goal
              </button>
            )}
          </div>

          <div className="goal-bar" style={{ marginBottom:10 }}>
            <motion.div
              className="goal-bar-fill"
              initial={{ width:0 }}
              animate={{ width:`${pct}%` }}
              transition={{ delay:0.4, duration:0.9, ease:[0.34,1.56,0.64,1] }}
            />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--t3)' }}>
            <span>{stats.total} applied</span>
            <span style={{ fontWeight:700, color:'var(--accent)' }}>{pct}%</span>
            <span>Goal: {goal}</span>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:14, marginBottom:24 }}>
          <Stat delay={0.1} icon="📋" label="Total Applied" value={stats.total} bg="#eef2ff" />
          <Stat delay={0.15} icon="⚡" label="Active" value={stats.active} sub="Applied + OA" bg="#f5f3ff" />
          <Stat delay={0.2} icon="🎙" label="Interviews" value={stats.interviews} bg="#fffbeb" />
          <Stat delay={0.25} icon="🏆" label="Offers" value={stats.offers} sub={stats.total > 0 ? `${Math.round((stats.offers/stats.total)*100)}% rate` : ''} bg="#f0fdf4" />
          <Stat delay={0.3} icon="✕" label="Rejections" value={stats.rejected} bg="#fff1f2" />
        </div>

        {/* ── Overdue alert ── */}
        {stats.overdue.length > 0 && (
          <motion.div
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', gap:12, marginBottom:24 }}
          >
            <span style={{ fontSize:22 }}>⚠️</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'#9a3412' }}>{stats.overdue.length} overdue deadline{stats.overdue.length > 1 ? 's' : ''} need attention</div>
              <div style={{ fontSize:12.5, color:'#c2410c', marginTop:2 }}>{stats.overdue.map(a => a.company).join(' · ')}</div>
            </div>
            <Link to="/applications" className="btn btn-ghost btn-sm">View →</Link>
          </motion.div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
          {/* ── Upcoming Deadlines ── */}
          <motion.div className="card" style={{ padding:'20px' }} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.35 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, fontWeight:800, color:'var(--t1)' }}>⏰ Upcoming Deadlines</h3>
              <Link to="/applications" style={{ fontSize:12, color:'var(--accent)', fontWeight:600 }}>All →</Link>
            </div>
            {stats.upcoming.length === 0 ? (
              <div style={{ textAlign:'center', padding:'20px 0', fontSize:13, color:'var(--t3)' }}>🎉 No upcoming deadlines</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {stats.upcoming.map(app => {
                  const dl = differenceInDays(app.deadline!, new Date());
                  const urgent = dl <= 3;
                  const todayFlag = isToday(app.deadline!);
                  return (
                    <div key={app.id} style={{
                      display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10,
                      background: todayFlag ? '#fff7ed' : urgent ? '#fef3c7' : '#f8f9ff',
                      border:`1px solid ${todayFlag ? '#fed7aa' : urgent ? '#fde68a' : 'var(--border-light)'}`,
                    }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{app.company}</div>
                        <div style={{ fontSize:11.5, color:'var(--t2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{app.role}</div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:12, fontWeight:800, color: todayFlag ? '#9a3412' : urgent ? '#92400e' : 'var(--t2)' }}>
                          {todayFlag ? '🔥 Today' : `${dl}d`}
                        </div>
                        <div style={{ fontSize:10.5, color:'var(--t3)' }}>{format(app.deadline!, 'MMM d')}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* ── Status breakdown + Top mistakes ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Status breakdown */}
            <motion.div className="card" style={{ padding:'20px' }} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25, duration:0.35 }}>
              <h3 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, fontWeight:800, color:'var(--t1)', marginBottom:14 }}>📊 Status Breakdown</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {(Object.entries(stats.byStatus) as [ApplicationStatus, number][]).sort((a,b) => b[1]-a[1]).map(([status, count]) => {
                  const pct = stats.total > 0 ? Math.round((count/stats.total)*100) : 0;
                  return (
                    <div key={status}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:4 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <div style={{ width:7, height:7, borderRadius:'50%', background:STATUS_BAR[status] }} />
                          <span style={{ color:'var(--t1)', fontWeight:500 }}>{status}</span>
                        </div>
                        <span style={{ color:'var(--t2)', fontWeight:700 }}>{count} <span style={{ fontWeight:400, color:'var(--t3)', fontSize:11 }}>({pct}%)</span></span>
                      </div>
                      <div className="bar-track">
                        <motion.div className="bar-fill" style={{ background: STATUS_BAR[status], width:`${pct}%` }}
                          initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ delay:0.5, duration:0.6, ease:[0.34,1.56,0.64,1] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Top rejection mistakes */}
            {stats.topReasons.length > 0 && (
              <motion.div className="card" style={{ padding:'20px' }} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3, duration:0.35 }}>
                <h3 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, fontWeight:800, color:'var(--t1)', marginBottom:14 }}>📚 Top Mistakes to Fix</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {stats.topReasons.map(([reason, count], i) => (
                    <div key={reason} style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:20, height:20, borderRadius:6, background:['#fee2e2','#fef3c7','#f0fdf4'][i], display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:['#be123c','#92400e','#065f46'][i], flexShrink:0 }}>
                        {i+1}
                      </div>
                      <span style={{ fontSize:13, color:'var(--t1)', fontWeight:500, flex:1 }}>{reason}</span>
                      <span style={{ fontSize:11.5, fontWeight:700, color:'var(--t3)' }}>{count}×</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Recent Activity ── */}
        {stats.recent.length > 0 && (
          <motion.div className="tbl-wrap" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35, duration:0.35 }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, fontWeight:800, color:'var(--t1)' }}>🕐 Recent Activity</h3>
              <Link to="/applications" style={{ fontSize:12, color:'var(--accent)', fontWeight:600 }}>All applications →</Link>
            </div>
            <table className="tbl">
              <thead><tr>
                <th>Company</th><th>Role</th><th>Status</th><th>Updated</th><th>Deadline</th>
              </tr></thead>
              <tbody>
                {stats.recent.map((app) => {
                  const daysLeft = app.deadline ? differenceInDays(app.deadline, new Date()) : null;
                  const past = app.deadline && isPast(app.deadline) && !isToday(app.deadline);
                  const near = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
                  return (
                    <tr key={app.id} className={past ? 'row-past' : isToday(app.deadline ?? new Date('1970')) ? 'row-today' : near ? 'row-near' : ''}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                          <div style={{ width:28, height:28, borderRadius:8, background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'var(--accent)', flexShrink:0 }}>
                            {app.company.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight:600 }}>{app.company}</span>
                        </div>
                      </td>
                      <td style={{ fontSize:13 }}>{app.role}</td>
                      <td><Badge status={app.status} /></td>
                      <td style={{ fontSize:12, color:'var(--t3)' }}>{format(app.updatedAt, 'MMM d, HH:mm')}</td>
                      <td style={{ fontSize:12.5, fontWeight: past || near ? 700 : 400, color: past ? '#be123c' : near ? '#92400e' : 'var(--t2)' }}>
                        {app.deadline ? `${past ? '⚠ ' : near ? '⏰ ' : ''}${format(app.deadline, 'MMM d, yyyy')}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Empty state */}
        {applications.length === 0 && (
          <div className="card" style={{ padding:0 }}>
            <div className="empty">
              <div className="animate-float" style={{ width:72, height:72, borderRadius:22, background:'linear-gradient(135deg, #eef2ff, #e0e7ff)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, fontSize:32 }}>
                🚀
              </div>
              <h3 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:20, fontWeight:800, color:'var(--t1)', marginBottom:8 }}>
                Your Mission Starts Here
              </h3>
              <p style={{ fontSize:14, color:'var(--t2)', maxWidth:320, marginBottom:24, lineHeight:1.6 }}>
                Log your first application and CareerOS will help you land your dream job.
              </p>
              <Link to="/applications">
                <button className="btn btn-primary btn-lg">
                  🎯 Log First Application
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
