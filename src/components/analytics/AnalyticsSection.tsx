import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  format,
  subDays,
  differenceInDays,
  isAfter,
  startOfYear,
  eachDayOfInterval,
} from 'date-fns';
import type { Application, ApplicationStatus, DateRangeOption } from '../../types';
import { COMMON_SOURCES } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface AnalyticsSectionProps {
  applications: Application[];
  selectedStatusFilter: ApplicationStatus | 'All';
  onStatusSelect: (status: ApplicationStatus | 'All') => void;
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Wishlist: '#94a3b8',
  Applied: '#3b82f6',
  'OA/Assessment': '#8b5cf6',
  Interview: '#f59e0b',
  Offer: '#10b981',
  Rejected: '#ef4444',
  Withdrawn: '#64748b',
};

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  applications,
  selectedStatusFilter,
  onStatusSelect,
}) => {
  const user = useAuthStore((s) => s.user);
  // Global dashboard filter states
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Filtered applications based on global filters
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      // Date range filter
      if (dateRange !== 'all') {
        const appDate = app.appliedDate || app.createdAt;
        const now = new Date();
        if (dateRange === '7d' && differenceInDays(now, new Date(appDate)) > 7) return false;
        if (dateRange === '30d' && differenceInDays(now, new Date(appDate)) > 30) return false;
        if (dateRange === '90d' && differenceInDays(now, new Date(appDate)) > 90) return false;
        if (dateRange === 'year' && !isAfter(new Date(appDate), startOfYear(now))) return false;
      }

      // Source filter
      if (sourceFilter !== 'all') {
        if ((app.source || 'Other').toLowerCase() !== sourceFilter.toLowerCase()) return false;
      }

      // Role type filter
      if (roleFilter !== 'all') {
        const roleLower = app.role.toLowerCase();
        const filterLower = roleFilter.toLowerCase();
        if (!roleLower.includes(filterLower)) return false;
      }

      return true;
    });
  }, [applications, dateRange, sourceFilter, roleFilter]);

  // Key Metrics
  const metrics = useMemo(() => {
    const total = filteredApps.length;
    if (total === 0) {
      return {
        total: 0,
        responseRate: 0,
        interviewRate: 0,
        offerRate: 0,
        avgDaysToResponse: 0,
      };
    }

    let respondedCount = 0;
    let interviewCount = 0;
    let offerCount = 0;
    let totalResponseDays = 0;
    let itemsWithResponseTime = 0;

    filteredApps.forEach((app) => {
      const isResponded = ['OA/Assessment', 'Interview', 'Offer', 'Rejected'].includes(app.status);
      const isInterview = ['Interview', 'Offer'].includes(app.status);
      const isOffer = app.status === 'Offer';

      if (isResponded) respondedCount++;
      if (isInterview) interviewCount++;
      if (isOffer) offerCount++;

      // Response time calculation
      const refApplied = app.appliedDate || app.createdAt;
      const respDate = app.firstResponseDate || (isResponded ? app.updatedAt : null);

      if (respDate && refApplied) {
        const days = Math.max(0, differenceInDays(new Date(respDate), new Date(refApplied)));
        totalResponseDays += days;
        itemsWithResponseTime++;
      }
    });

    const responseRate = Math.round((respondedCount / total) * 100);
    const interviewRate = Math.round((interviewCount / total) * 100);
    const offerRate = Math.round((offerCount / total) * 100);
    const avgDaysToResponse =
      itemsWithResponseTime > 0 ? Math.round((totalResponseDays / itemsWithResponseTime) * 10) / 10 : 0;

    return { total, responseRate, interviewRate, offerRate, avgDaysToResponse };
  }, [filteredApps]);

  // 1. Funnel Data
  const funnelData = useMemo(() => {
    const applied = filteredApps.filter((a) => a.status !== 'Wishlist').length;
    const oa = filteredApps.filter((a) =>
      ['OA/Assessment', 'Interview', 'Offer', 'Rejected'].includes(a.status)
    ).length;
    const interview = filteredApps.filter((a) => ['Interview', 'Offer'].includes(a.status)).length;
    const offer = filteredApps.filter((a) => a.status === 'Offer').length;

    const oaConversion = applied > 0 ? Math.round((oa / applied) * 100) : 0;
    const intConversion = oa > 0 ? Math.round((interview / oa) * 100) : 0;
    const offerConversion = interview > 0 ? Math.round((offer / interview) * 100) : 0;

    return [
      { stage: 'Applied', count: applied, conversionPct: 100, color: '#3b82f6' },
      { stage: 'OA / Screen', count: oa, conversionPct: oaConversion, color: '#8b5cf6' },
      { stage: 'Interview', count: interview, conversionPct: intConversion, color: '#f59e0b' },
      { stage: 'Offer 🎉', count: offer, conversionPct: offerConversion, color: '#10b981' },
    ];
  }, [filteredApps]);

  // 2. Response Time Histogram Data
  const histogramData = useMemo(() => {
    const buckets = {
      '0-3 days': 0,
      '4-7 days': 0,
      '8-14 days': 0,
      '15-30 days': 0,
      '30+ days': 0,
      Ghosted: 0,
    };

    const now = new Date();
    filteredApps.forEach((app) => {
      const refApplied = app.appliedDate || app.createdAt;
      const daysSince = differenceInDays(now, new Date(refApplied));
      const isResponded = ['OA/Assessment', 'Interview', 'Offer', 'Rejected'].includes(app.status);

      if (!isResponded) {
        if (daysSince > 30) buckets['Ghosted']++;
        return;
      }

      const respDate = app.firstResponseDate || app.updatedAt;
      const respDays = Math.max(0, differenceInDays(new Date(respDate), new Date(refApplied)));

      if (respDays <= 3) buckets['0-3 days']++;
      else if (respDays <= 7) buckets['4-7 days']++;
      else if (respDays <= 14) buckets['8-14 days']++;
      else if (respDays <= 30) buckets['15-30 days']++;
      else buckets['30+ days']++;
    });

    return Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }));
  }, [filteredApps]);

  // 3. Source Effectiveness Data
  const sourceEffectiveness = useMemo(() => {
    const map: Record<string, { total: number; interviews: number }> = {};
    filteredApps.forEach((app) => {
      const src = app.source || 'Other';
      if (!map[src]) map[src] = { total: 0, interviews: 0 };
      map[src].total++;
      if (['Interview', 'Offer'].includes(app.status)) {
        map[src].interviews++;
      }
    });

    return Object.entries(map).map(([source, { total, interviews }]) => ({
      source,
      total,
      interviews,
      interviewRate: total > 0 ? Math.round((interviews / total) * 100) : 0,
    }));
  }, [filteredApps]);

  // 4. Status Donut Data
  const donutData = useMemo(() => {
    const counts: Partial<Record<ApplicationStatus, number>> = {};
    filteredApps.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      name: status as ApplicationStatus,
      value: count,
      color: STATUS_COLORS[status as ApplicationStatus] || '#94a3b8',
    }));
  }, [filteredApps]);

  // 5. Rolling 30-Day Trend Data
  const rollingTrendData = useMemo(() => {
    const last30 = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    return last30.map((day) => {
      const dateStr = format(day, 'MMM d');

      const appsSent = filteredApps.filter((app) => {
        const d = app.appliedDate || app.createdAt;
        return format(new Date(d), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      }).length;

      const responsesReceived = filteredApps.filter((app) => {
        if (!app.firstResponseDate) return false;
        return format(new Date(app.firstResponseDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      }).length;

      return { date: dateStr, Sent: appsSent, Responses: responsesReceived };
    });
  }, [filteredApps]);

  // 6. GitHub-style Activity Heatmap (Last 16 weeks) with Per-User Persistence
  const heatmapWeeks = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 111), // 16 weeks * 7 days - 1
      end: new Date(),
    });

    const dayMap: Record<string, number> = {};

    // 1. From Applications
    filteredApps.forEach((app) => {
      const key = format(new Date(app.appliedDate || app.createdAt), 'yyyy-MM-dd');
      dayMap[key] = (dayMap[key] || 0) + 1;
    });

    // 2. From Persistent User Activity Log (per user)
    if (user?.uid) {
      try {
        const storageKey = `applyflow_activity_log_${user.uid}`;
        const storedLog: Record<string, number> = JSON.parse(localStorage.getItem(storageKey) || '{}');
        Object.entries(storedLog).forEach(([dateStr, count]) => {
          dayMap[dateStr] = Math.max(dayMap[dateStr] || 0, count);
        });
      } catch (e) {
        console.error('Error reading heatmap log:', e);
      }
    }

    const grid: { date: Date; count: number; level: number }[][] = [];
    let currentWeek: { date: Date; count: number; level: number }[] = [];

    days.forEach((date) => {
      const key = format(date, 'yyyy-MM-dd');
      const count = dayMap[key] || 0;
      const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3;

      currentWeek.push({ date, count, level });
      if (currentWeek.length === 7) {
        grid.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) grid.push(currentWeek);
    return grid;
  }, [filteredApps, user]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
      {/* ── Global Analytics Toolbar / Filters ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff, #fafbff)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>📈</span>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Analytics & Insights
            </h3>
            <p style={{ fontSize: 12, color: 'var(--t2)', margin: 0 }}>
              Real-time pipeline diagnostics across {filteredApps.length} applications
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Date Range */}
          <div>
            <select
              className="inp"
              style={{ padding: '6px 12px', fontSize: 12, width: 'auto' }}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
            >
              <option value="all">🗓️ All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              className="inp"
              style={{ padding: '6px 12px', fontSize: 12, width: 'auto' }}
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="all">🌐 All Sources</option>
              {COMMON_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              className="inp"
              style={{ padding: '6px 12px', fontSize: 12, width: 'auto' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">💼 All Role Types</option>
              <option value="software">Software Engineer</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="full stack">Full Stack</option>
              <option value="product">Product</option>
              <option value="data">Data</option>
              <option value="design">Design</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Summary Key Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
        <motion.div className="stat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="stat-icon" style={{ background: '#eef2ff' }}>⚡</div>
          <div className="stat-val" style={{ color: 'var(--accent)' }}>{metrics.responseRate}%</div>
          <div className="stat-label">Response Rate</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>Active recruiter engagement</div>
        </motion.div>

        <motion.div className="stat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="stat-icon" style={{ background: '#fffbeb' }}>🎙️</div>
          <div className="stat-val" style={{ color: '#d97706' }}>{metrics.interviewRate}%</div>
          <div className="stat-label">Interview Rate</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>Screenings & rounds</div>
        </motion.div>

        <motion.div className="stat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon" style={{ background: '#f0fdf4' }}>🏆</div>
          <div className="stat-val" style={{ color: '#16a34a' }}>{metrics.offerRate}%</div>
          <div className="stat-label">Offer Rate</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>Final conversion success</div>
        </motion.div>

        <motion.div className="stat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="stat-icon" style={{ background: '#f5f3ff' }}>⏳</div>
          <div className="stat-val" style={{ color: '#7c3aed' }}>{metrics.avgDaysToResponse}d</div>
          <div className="stat-label">Avg Days to Response</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>Time to first status update</div>
        </motion.div>
      </div>

      {/* ── Grid Row 1: Funnel Chart & Donut Chart ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Funnel Chart */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
            🔻 Application Pipeline Funnel & Stage Leakage
          </h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="stage" type="category" stroke="#475569" fontSize={12} width={100} />
                <Tooltip
                  formatter={(val: unknown, _name: unknown, entry: { payload?: { conversionPct: number } }) => [
                    `${val} apps (${entry.payload?.conversionPct ?? 0}% step rate)`,
                    'Applications',
                  ]}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Chart */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>
              🍩 Status Distribution
            </h3>
            <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>Click slice to filter board</span>
          </div>

          <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {donutData.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--t3)' }}>No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    onClick={(entry) => onStatusSelect((entry?.name as ApplicationStatus) || 'All')}
                    style={{ cursor: 'pointer' }}
                  >
                    {donutData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={selectedStatusFilter === entry.name ? '#4f46e5' : '#ffffff'}
                        strokeWidth={selectedStatusFilter === entry.name ? 3 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: unknown, name: unknown) => [`${val} applications`, String(name || '')]}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Grid Row 2: Response-Time Histogram & Source Effectiveness ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Response-Time Histogram */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
            ⏱️ Response-Time Histogram (Days to First Reply)
          </h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  formatter={(val: unknown) => [`${val} applications`, 'Count']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Effectiveness */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
            🎯 Source Effectiveness (Interview Rate % by Channel)
          </h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceEffectiveness} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="source" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  formatter={(val: unknown) => [`${val}% interview rate`, 'Effectiveness']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="interviewRate" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Grid Row 3: 30-Day Rolling Trend Line & Weekly Heatmap ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Rolling 30-Day Trend */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
            📈 Rolling 30-Day Activity Trend (Sent vs. Responses)
          </h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rollingTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="Sent" stroke="#6366f1" fillOpacity={1} fill="url(#colorSent)" strokeWidth={2} />
                <Area type="monotone" dataKey="Responses" stroke="#10b981" fillOpacity={1} fill="url(#colorResp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GitHub-style Contribution Heatmap */}
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', marginBottom: 14 }}>
            🟩 Weekly Application Activity Heatmap
          </h3>
          <p style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 16 }}>
            Daily submission momentum over the past 16 weeks
          </p>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div
              style={{
                display: 'flex',
                gap: 4,
                overflowX: 'auto',
                paddingBottom: 8,
              }}
            >
              {heatmapWeeks.map((week, wIndex) => (
                <div key={wIndex} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {week.map((day, dIndex) => {
                    const bg =
                      day.level === 0
                        ? '#ebedf0'
                        : day.level === 1
                        ? '#9be9a8'
                        : day.level === 2
                        ? '#40c463'
                        : '#216e39';

                    return (
                      <div
                        key={dIndex}
                        title={`${format(day.date, 'MMM d, yyyy')}: ${day.count} applications sent`}
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 3,
                          background: bg,
                          transition: 'transform 0.1s ease',
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--t3)', marginTop: 12 }}>
              <span>Less</span>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#ebedf0' }} />
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#9be9a8' }} />
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#40c463' }} />
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#216e39' }} />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
