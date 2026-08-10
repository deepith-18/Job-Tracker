import { Flame, Calendar, Rocket } from 'lucide-react';
import React, { useMemo } from 'react';
import { eachDayOfInterval, subDays, format } from 'date-fns';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';

export const ActivityHeatmapPage: React.FC = () => {
  const { applications, loading } = useApplications();

  // Calculate 52 weeks (364 days) of activity
  const calendarData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 363),
      end: new Date(),
    });

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
    return { weeks, totalSent: applications.length };
  }, [applications]);

  // Streak calculations
  const streakStats = useMemo(() => {
    const dates = applications
      .map((a) => format(new Date(a.appliedDate || a.createdAt), 'yyyy-MM-dd'))
      .sort();

    const uniqueDates = Array.from(new Set(dates));
    let currentStreak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
      currentStreak = uniqueDates.length;
    }

    return { currentStreak: Math.max(1, currentStreak), activeDays: uniqueDates.length };
  }, [applications]);

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
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
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">🟩 Application Activity Heatmap</h1>
        <p className="page-sub">
          Track daily submission velocity and maintain your application streak over 52 weeks
        </p>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Streak & Velocity Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}><Flame className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /></div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>
              {streakStats.currentStreak} Days
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 2 }}>Current Active Streak</div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}><Calendar className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /></div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981' }}>
              {streakStats.activeDays} Days
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 2 }}>Total Days Applied</div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}><Rocket className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /></div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#8b5cf6' }}>
              {calendarData.totalSent} Apps
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 2 }}>Total Applications Sent</div>
          </div>
        </div>

        {/* 52-Week Contribution Grid Card */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>
              🗓️ 52-Week Submission Grid
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--t3)' }}>
              <span>Less</span>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#ebedf0' }} />
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#9be9a8' }} />
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#40c463' }} />
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#216e39' }} />
              <span>More</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto', paddingBottom: 10 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {calendarData.weeks.map((week, wIndex) => (
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
                          width: 13,
                          height: 13,
                          borderRadius: 3,
                          background: bg,
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease',
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
