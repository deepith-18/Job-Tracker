import { Flame, Calendar, Rocket, Grid } from 'lucide-react';
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

    days.forEach((day, index) => {
      const key = format(day, 'yyyy-MM-dd');
      const count = dayCounts[key] || 0;
      const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3;

      currentWeek.push({ date: day, count, level });

      if (currentWeek.length === 7 || index === days.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return {
      weeks,
      totalSent: applications.length,
    };
  }, [applications]);

  // Streak calculations
  const streakStats = useMemo(() => {
    let currentStreak = 0;
    let activeDays = 0;

    const dayCounts: Record<string, number> = {};
    applications.forEach((app) => {
      const key = format(new Date(app.appliedDate || app.createdAt), 'yyyy-MM-dd');
      dayCounts[key] = (dayCounts[key] || 0) + 1;
    });

    activeDays = Object.keys(dayCounts).length;

    // Check backwards from today
    let checkDate = new Date();
    while (true) {
      const key = format(checkDate, 'yyyy-MM-dd');
      if (dayCounts[key] && dayCounts[key] > 0) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    return { currentStreak, activeDays };
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
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Grid size={24} color="var(--accent)" />
          <span>Application Activity Heatmap</span>
        </h1>
        <p className="page-sub">
          Track daily submission velocity and maintain your application streak over 52 weeks
        </p>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Streak & Velocity Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ marginBottom: 6 }}><Flame size={24} color="var(--accent)" /></div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>
              {streakStats.currentStreak} Days
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 2 }}>Current Active Streak</div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ marginBottom: 6 }}><Calendar size={24} color="#10b981" /></div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981' }}>
              {streakStats.activeDays} Days
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 2 }}>Total Days Applied</div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ marginBottom: 6 }}><Rocket size={24} color="#8b5cf6" /></div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#8b5cf6' }}>
              {calendarData.totalSent} Apps
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 2 }}>Total Applications Sent</div>
          </div>
        </div>

        {/* 52-Week Contribution Grid Card */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} color="var(--t3)" />
              <span>52-Week Submission Grid</span>
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
