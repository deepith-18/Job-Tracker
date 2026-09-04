import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BarChart2,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
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
  Ghosted: '#64748b',
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
  const [showGlossary, setShowGlossary] = useState(false);
  const [sourceViewMode, setSourceViewMode] = useState<'chart' | 'table'>('table');

  const hasActiveFilters = dateRange !== 'all' || sourceFilter !== 'all' || roleFilter !== 'all';

  const resetFilters = () => {
    setDateRange('all');
    setSourceFilter('all');
    setRoleFilter('all');
  };

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

  // 3. Source Effectiveness & ROI Matrix Data
  const sourceEffectiveness = useMemo(() => {
    const map: Record<string, { total: number; interviews: number; offers: number }> = {};
    filteredApps.forEach((app) => {
      const src = app.source || 'Other';
      if (!map[src]) map[src] = { total: 0, interviews: 0, offers: 0 };
      map[src].total++;
      if (['Interview', 'Offer'].includes(app.status)) {
        map[src].interviews++;
      }
      if (app.status === 'Offer') {
        map[src].offers++;
      }
    });

    return Object.entries(map)
      .map(([source, { total, interviews, offers }]) => ({
        source,
        total,
        interviews,
        offers,
        interviewRate: total > 0 ? Math.round((interviews / total) * 100) : 0,
        offerRate: total > 0 ? Math.round((offers / total) * 100) : 0,
        sharePct: filteredApps.length > 0 ? Math.round((total / filteredApps.length) * 100) : 0,
      }))
      .sort((a, b) => b.interviewRate - a.interviewRate || b.total - a.total);
  }, [filteredApps]);

  // 4. Bottleneck & Pipeline Diagnostic Engine
  const bottleneckAnalysis = useMemo(() => {
    const total = filteredApps.length;
    if (total === 0) {
      return {
        stage: 'No Data',
        severity: 'neutral' as const,
        leakPct: 0,
        title: 'Awaiting Application Data',
        description: 'Log or import your job applications to generate live pipeline diagnostics and stage leakage analysis.',
        recommendation: 'Add opportunities from LinkedIn, company careers pages, or employee referrals to see automated insights.',
        topChannel: null,
        ghostedCount: 0,
        ghostedPct: 0,
      };
    }

    const applied = filteredApps.filter((a) => a.status !== 'Wishlist').length;
    const oa = filteredApps.filter((a) =>
      ['OA/Assessment', 'Interview', 'Offer', 'Rejected'].includes(a.status)
    ).length;
    const interview = filteredApps.filter((a) => ['Interview', 'Offer'].includes(a.status)).length;
    const offer = filteredApps.filter((a) => a.status === 'Offer').length;

    // Leak calculations
    const appToScreenLeak = applied > 0 ? Math.max(0, Math.round(((applied - oa) / applied) * 100)) : 0;
    const screenToIntLeak = oa > 0 ? Math.max(0, Math.round(((oa - interview) / oa) * 100)) : 0;
    const intToOfferLeak = interview > 0 ? Math.max(0, Math.round(((interview - offer) / interview) * 100)) : 0;

    // Ghosting calculation (unanswered > 21 days)
    const now = new Date();
    const ghostedCount = filteredApps.filter((a) => {
      if (a.status === 'Ghosted') return true;
      if (['Applied'].includes(a.status)) {
        const ref = a.appliedDate || a.createdAt;
        return differenceInDays(now, new Date(ref)) > 21;
      }
      return false;
    }).length;
    const ghostedPct = Math.round((ghostedCount / total) * 100);

    // Top channel with at least 1 application
    const topChannel = sourceEffectiveness.length > 0 ? sourceEffectiveness[0] : null;

    if (applied >= 3 && appToScreenLeak >= 60) {
      return {
        stage: 'Application ➔ Screening Gate',
        severity: 'warning' as const,
        leakPct: appToScreenLeak,
        title: `Screening Gate Bottleneck (${appToScreenLeak}% Drop-off)`,
        description: `${applied - oa} out of ${applied} applications were eliminated or received no human reply before the initial screening stage.`,
        recommendation: 'Target resume keyword density directly to ATS job specs, quantify key impact metrics in bullet points, and prioritize 1st-degree employee referrals.',
        topChannel,
        ghostedCount,
        ghostedPct,
      };
    }

    if (oa >= 2 && screenToIntLeak >= 50) {
      return {
        stage: 'OA / Screen ➔ Live Interview',
        severity: 'warning' as const,
        leakPct: screenToIntLeak,
        title: `Assessment & Screening Barrier (${screenToIntLeak}% Drop-off)`,
        description: `${oa - interview} candidates did not convert past technical assessments (OA) or recruiter initial phone screens.`,
        recommendation: 'Dedicate 30 mins daily to timed algorithmic problem-solving (Medium LeetCode) and craft concise 2-minute elevator pitches for recruiter calls.',
        topChannel,
        ghostedCount,
        ghostedPct,
      };
    }

    if (interview >= 2 && intToOfferLeak >= 70) {
      return {
        stage: 'Interview ➔ Written Offer',
        severity: 'info' as const,
        leakPct: intToOfferLeak,
        title: `Final Conversion Gap (${intToOfferLeak}% Drop-off)`,
        description: `Strong interview volume (${interview} rounds), but closing final written offers requires elevating executive presence and objection handling.`,
        recommendation: 'Rehearse structured STAR behavioral responses with clear business outcomes, and prepare 3 high-leverage reverse questions for leadership.',
        topChannel,
        ghostedCount,
        ghostedPct,
      };
    }

    return {
      stage: 'Balanced Pipeline Flow',
      severity: 'success' as const,
      leakPct: 0,
      title: 'Pipeline Flow Healthy & Balanced',
      description: 'Your applications are progressing smoothly through initial screening, interview loops, and decision checkpoints.',
      recommendation: 'Maintain consistent weekly submission volume and send polite follow-ups for any opportunities pending feedback past 7 business days.',
      topChannel,
      ghostedCount,
      ghostedPct,
    };
  }, [filteredApps, sourceEffectiveness]);

  // 5. Status Donut Data
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

  // 6. Rolling 30-Day Trend Data
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

  // 7. GitHub-style Activity Heatmap (Last 16 weeks)
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

    // 2. From Persistent User Activity Log (checking both new and legacy storage keys)
    if (user?.uid) {
      try {
        const keys = [`joborbit_activity_log_${user.uid}`, `applyflow_activity_log_${user.uid}`];
        for (const k of keys) {
          const stored = localStorage.getItem(k);
          if (stored) {
            const parsed: Record<string, number> = JSON.parse(stored);
            Object.entries(parsed).forEach(([dateStr, count]) => {
              dayMap[dateStr] = Math.max(dayMap[dateStr] || 0, count);
            });
          }
        }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
      {/* ── Global Analytics Toolbar / Filters ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--card), var(--card-hover))',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
            }}
          >
            <Sparkles style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                Overview & Pipeline Intelligence
              </h3>
              {hasActiveFilters && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: '#e0e7ff',
                    color: 'var(--accent)',
                  }}
                >
                  Filtered: {filteredApps.length} of {applications.length}
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--t2)', margin: 0 }}>
              Live stage conversion metrics, benchmark indicators, and strategic bottlenecks
            </p>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Glossary Toggle Button */}
          <button
            onClick={() => setShowGlossary(!showGlossary)}
            className="btn btn-ghost btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: showGlossary ? 'var(--accent)' : 'var(--t2)',
              borderColor: showGlossary ? 'var(--accent)' : 'var(--border)',
            }}
            title="Toggle Metric Explanations & Industry Benchmarks"
          >
            <HelpCircle style={{ width: 14, height: 14 }} />
            <span>Metric Glossary</span>
            {showGlossary ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
          </button>

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

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="btn btn-ghost btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11.5,
                color: 'var(--danger)',
                padding: '6px 10px',
              }}
              title="Reset all filters to defaults"
            >
              <RotateCcw style={{ width: 12, height: 12 }} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Expandable Metric Clarity & Definitions Guide ── */}
      <AnimatePresence>
        {showGlossary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="card"
              style={{
                padding: '18px 22px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #cbd5e1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <HelpCircle style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                <h4 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  Metric Definitions & Industry Benchmarks Guide
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div style={{ background: 'var(--card)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5, color: '#3b82f6', marginBottom: 4 }}>
                    ⚡ Response Rate
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--t2)', lineHeight: 1.45 }}>
                    Percentage of applications receiving any recruiter update (OA, interview, or decision).
                    <div style={{ marginTop: 4, fontWeight: 600, color: 'var(--t3)' }}>
                      Tech median: 15% – 20%
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--card)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5, color: '#d97706', marginBottom: 4 }}>
                    🎙️ Interview Rate
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--t2)', lineHeight: 1.45 }}>
                    Ratio of submissions progressing to formal live screening rounds or technical panels.
                    <div style={{ marginTop: 4, fontWeight: 600, color: 'var(--t3)' }}>
                      Tech target: 10% – 15%
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--card)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5, color: '#16a34a', marginBottom: 4 }}>
                    🏆 Offer Rate
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--t2)', lineHeight: 1.45 }}>
                    Proportion of all submitted applications culminating in official written job offers.
                    <div style={{ marginTop: 4, fontWeight: 600, color: 'var(--t3)' }}>
                      Tech target: 2% – 5%
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--card)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5, color: '#7c3aed', marginBottom: 4 }}>
                    ⏳ Avg Days to Response
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--t2)', lineHeight: 1.45 }}>
                    Calendar days elapsed from initial application submission to first employer contact.
                    <div style={{ marginTop: 4, fontWeight: 600, color: 'var(--t3)' }}>
                      Healthy pacing: &lt; 14 days
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Key Stat Cards with Industry Benchmark Badges ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
        {/* Response Rate */}
        <motion.div className="stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ background: '#eef2ff' }}>⚡</div>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                background: metrics.responseRate >= 18 ? '#dcfce7' : '#f1f5f9',
                color: metrics.responseRate >= 18 ? '#15803d' : '#64748b',
              }}
            >
              {metrics.responseRate >= 18 ? 'Healthy (15-20%)' : 'Benchmark: 15-20%'}
            </span>
          </div>
          <div className="stat-val" style={{ color: 'var(--accent)', marginTop: 8 }}>{metrics.responseRate}%</div>
          <div className="stat-label">Response Rate</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>Recruiter & status engagement</div>
        </motion.div>

        {/* Interview Rate */}
        <motion.div className="stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ background: '#fffbeb' }}>🎙️</div>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                background: metrics.interviewRate >= 12 ? '#dcfce7' : '#fef3c7',
                color: metrics.interviewRate >= 12 ? '#15803d' : '#b45309',
              }}
            >
              {metrics.interviewRate >= 12 ? 'Competitive (10-15%)' : 'Target: 10-15%'}
            </span>
          </div>
          <div className="stat-val" style={{ color: '#d97706', marginTop: 8 }}>{metrics.interviewRate}%</div>
          <div className="stat-label">Interview Rate</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>Screenings & live panels</div>
        </motion.div>

        {/* Offer Rate */}
        <motion.div className="stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ background: '#f0fdf4' }}>🏆</div>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                background: metrics.offerRate >= 3 ? '#dcfce7' : '#f1f5f9',
                color: metrics.offerRate >= 3 ? '#15803d' : '#64748b',
              }}
            >
              {metrics.offerRate >= 3 ? 'High Close (2-5%)' : 'Target: 2-5%'}
            </span>
          </div>
          <div className="stat-val" style={{ color: '#16a34a', marginTop: 8 }}>{metrics.offerRate}%</div>
          <div className="stat-label">Offer Rate</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>Final offer conversion</div>
        </motion.div>

        {/* Avg Days to Response */}
        <motion.div className="stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-icon" style={{ background: '#f5f3ff' }}>⏳</div>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                background: metrics.avgDaysToResponse <= 14 ? '#dcfce7' : '#fee2e2',
                color: metrics.avgDaysToResponse <= 14 ? '#15803d' : '#b91c1c',
              }}
            >
              {metrics.avgDaysToResponse <= 14 ? 'Swift (<14d)' : 'Slow (>14d)'}
            </span>
          </div>
          <div className="stat-val" style={{ color: '#7c3aed', marginTop: 8 }}>{metrics.avgDaysToResponse}d</div>
          <div className="stat-label">Avg Days to Response</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>Time to first status feedback</div>
        </motion.div>
      </div>

      {/* ── Executive Pipeline Diagnostic & Bottleneck Card ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div
          className="card"
          style={{
            padding: '20px 24px',
            border:
              bottleneckAnalysis.severity === 'warning'
                ? '1px solid rgba(245, 158, 11, 0.35)'
                : bottleneckAnalysis.severity === 'success'
                ? '1px solid rgba(16, 185, 129, 0.35)'
                : '1px solid var(--border)',
            background:
              bottleneckAnalysis.severity === 'warning'
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, var(--card) 100%)'
                : bottleneckAnalysis.severity === 'success'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, var(--card) 100%)'
                : 'linear-gradient(135deg, var(--card-hover) 0%, var(--card) 100%)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            {/* Left Diagnosis */}
            <div style={{ flex: '1 1 480px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {bottleneckAnalysis.severity === 'warning' ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 14,
                      background: '#ffedd5',
                      color: '#c2410c',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <AlertTriangle style={{ width: 13, height: 13 }} />
                    Pipeline Bottleneck Detected
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 14,
                      background: '#dcfce7',
                      color: '#15803d',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <CheckCircle2 style={{ width: 13, height: 13 }} />
                    Pipeline Health Check
                  </span>
                )}
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)' }}>
                  Stage: {bottleneckAnalysis.stage}
                </span>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: '0 0 6px 0' }}>
                {bottleneckAnalysis.title}
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t2)', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                {bottleneckAnalysis.description}
              </p>

              {/* Actionable Strategy Box */}
              <div
                style={{
                  background: 'var(--card-hover)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <div style={{ color: 'var(--accent)', marginTop: 2 }}>
                  <ArrowRight style={{ width: 15, height: 15 }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Recommended Tactical Move
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--t1)', marginTop: 2 }}>
                    {bottleneckAnalysis.recommendation}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Vital Stats */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {bottleneckAnalysis.topChannel && (
                <div
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    minWidth: 140,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)' }}>Top Converting Channel</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0d9488', marginTop: 3 }}>
                    {bottleneckAnalysis.topChannel.source}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>
                    {bottleneckAnalysis.topChannel.interviewRate}% interview rate
                  </div>
                </div>
              )}

              <div
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  minWidth: 140,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)' }}>Stale / Silent Roles</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: bottleneckAnalysis.ghostedCount > 0 ? '#ea580c' : '#10b981', marginTop: 3 }}>
                  {bottleneckAnalysis.ghostedCount} apps ({bottleneckAnalysis.ghostedPct}%)
                </div>
                <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>
                  &gt;21 days with no reply
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Grid Row 1: Funnel Chart & Donut Chart ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Funnel Chart */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              🔻 Application Pipeline Funnel & Stage Drop-off
            </h3>
            <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>Step-by-step conversion</span>
          </div>
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
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              🍩 Status Distribution
            </h3>
            <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>Click slice to filter</span>
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

      {/* ── Grid Row 2: Response-Time Histogram & Source ROI Matrix ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
        {/* Response-Time Histogram */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              ⏱️ Response-Time Distribution
            </h3>
            <span style={{ fontSize: 11, color: 'var(--t3)' }}>Days to first contact</span>
          </div>
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

        {/* Source Effectiveness & Channel ROI Matrix */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                🎯 Channel Conversion & Source ROI
              </h3>
              <p style={{ fontSize: 11.5, color: 'var(--t2)', margin: '2px 0 0 0' }}>
                Compare yields across job boards, referrals, and company portals
              </p>
            </div>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'var(--border-light)', padding: 2, borderRadius: 8 }}>
              <button
                onClick={() => setSourceViewMode('table')}
                style={{
                  border: 'none',
                  background: sourceViewMode === 'table' ? 'var(--card)' : 'transparent',
                  color: sourceViewMode === 'table' ? 'var(--accent)' : 'var(--t2)',
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: sourceViewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <TableIcon style={{ width: 12, height: 12 }} />
                <span>ROI Table</span>
              </button>
              <button
                onClick={() => setSourceViewMode('chart')}
                style={{
                  border: 'none',
                  background: sourceViewMode === 'chart' ? 'var(--card)' : 'transparent',
                  color: sourceViewMode === 'chart' ? 'var(--accent)' : 'var(--t2)',
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: sourceViewMode === 'chart' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <BarChart2 style={{ width: 12, height: 12 }} />
                <span>Bar Chart</span>
              </button>
            </div>
          </div>

          {sourceViewMode === 'table' ? (
            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--t3)', fontSize: 11 }}>
                    <th style={{ padding: '6px 8px', fontWeight: 700 }}>Channel / Source</th>
                    <th style={{ padding: '6px 8px', fontWeight: 700 }}>Applications</th>
                    <th style={{ padding: '6px 8px', fontWeight: 700 }}>Interview Rate</th>
                    <th style={{ padding: '6px 8px', fontWeight: 700 }}>Offers</th>
                    <th style={{ padding: '6px 8px', fontWeight: 700 }}>Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceEffectiveness.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 16, textAlign: 'center', color: 'var(--t3)' }}>
                        No sources recorded
                      </td>
                    </tr>
                  ) : (
                    sourceEffectiveness.map((s) => {
                      const isHighROI = s.interviewRate >= 25;
                      const isSolid = s.interviewRate >= 12;
                      const isLowYield = s.total >= 4 && s.interviewRate < 10;

                      return (
                        <tr key={s.source} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 8px', fontWeight: 700, color: 'var(--t1)' }}>
                            {s.source}
                          </td>
                          <td style={{ padding: '8px 8px', color: 'var(--t2)' }}>
                            <strong>{s.total}</strong> ({s.sharePct}%)
                          </td>
                          <td style={{ padding: '8px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 45, height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${Math.min(100, s.interviewRate)}%`,
                                    height: '100%',
                                    background: isHighROI ? '#10b981' : isSolid ? '#f59e0b' : '#94a3b8',
                                  }}
                                />
                              </div>
                              <span style={{ fontWeight: 700, color: 'var(--t1)', fontSize: 11.5 }}>
                                {s.interviewRate}%
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '8px 8px', color: 'var(--t1)', fontWeight: 600 }}>
                            {s.offers > 0 ? `🎉 ${s.offers}` : '—'}
                          </td>
                          <td style={{ padding: '8px 8px' }}>
                            {isHighROI ? (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: '#dcfce7', color: '#15803d' }}>
                                ⭐ High ROI
                              </span>
                            ) : isSolid ? (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: '#e0e7ff', color: 'var(--accent)' }}>
                                ✅ Solid Yield
                              </span>
                            ) : isLowYield ? (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: '#fee2e2', color: '#b91c1c' }}>
                                ⚠️ Low Yield
                              </span>
                            ) : (
                              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 10, background: '#f1f5f9', color: '#64748b' }}>
                                Emerging
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
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
                  <Bar dataKey="interviewRate" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Grid Row 3: 30-Day Rolling Trend Line & Weekly Heatmap ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Rolling 30-Day Trend */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              📈 Rolling 30-Day Activity Trend (Sent vs. Responses)
            </h3>
            <span style={{ fontSize: 11, color: 'var(--t3)' }}>Daily velocity</span>
          </div>
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
          <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
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
