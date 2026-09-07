import { Target, Rocket, Mic, Download } from 'lucide-react';
import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';

export const GoalTrackerPage: React.FC = () => {
  const { applications } = useApplications();
  const { addToast } = useToast();

  const [weeklyTarget, setWeeklyTarget] = useState(15);
  const [monthlyInterviewTarget, setMonthlyInterviewTarget] = useState(5);

  const currentWeeklyCount = applications.length;
  const currentInterviewsCount = applications.filter((a) => a.status === 'Interview' || a.status === 'Offer').length;

  const weeklyProgress = Math.min(100, Math.round((currentWeeklyCount / weeklyTarget) * 100));
  const interviewProgress = Math.min(100, Math.round((currentInterviewsCount / monthlyInterviewTarget) * 100));

  const exportCsvData = () => {
    const headers = ['Company', 'Role', 'Status', 'Applied Date', 'Deadline', 'Job Link', 'Source', 'Notes'];
    const rows = applications.map((a) => [
      `"${a.company.replace(/"/g, '""')}"`,
      `"${a.role.replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.appliedDate ? new Date(a.appliedDate).toISOString().split('T')[0] : ''}"`,
      `"${a.deadline ? new Date(a.deadline).toISOString().split('T')[0] : ''}"`,
      `"${(a.jobLink || '').replace(/"/g, '""')}"`,
      `"${(a.source || '').replace(/"/g, '""')}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Job_Orbit_Career_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Backup Exported', 'Downloaded CSV report', 'success');
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Target size={24} color="var(--accent)" />
          <span>Career Goals & Data Backup Center</span>
        </h1>
        <p className="page-sub">
          Set weekly application velocity goals, track milestone targets, and export data backups
        </p>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Goal Progress Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 20 }}>
          {/* Weekly Velocity Goal */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Rocket size={18} color="var(--accent)" />
                <span>Weekly Applications</span>
              </h3>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)' }}>
                {currentWeeklyCount} / {weeklyTarget}
              </span>
            </div>

            <div style={{ width: '100%', height: 10, background: 'var(--border-light)', borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
              <div
                style={{
                  width: `${weeklyProgress}%`,
                  height: '100%',
                  background: 'var(--accent)',
                  borderRadius: 6,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--t3)' }}>Target Applications:</span>
              <input
                type="number"
                className="inp"
                style={{ width: 80, padding: '4px 8px' }}
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Monthly Interview Target */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mic size={18} color="#10b981" />
                <span>Monthly Interviews</span>
              </h3>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>
                {currentInterviewsCount} / {monthlyInterviewTarget}
              </span>
            </div>

            <div style={{ width: '100%', height: 10, background: 'var(--border-light)', borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
              <div
                style={{
                  width: `${interviewProgress}%`,
                  height: '100%',
                  background: '#10b981',
                  borderRadius: 6,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--t3)' }}>Interview Milestone Target:</span>
              <input
                type="number"
                className="inp"
                style={{ width: 80, padding: '4px 8px' }}
                value={monthlyInterviewTarget}
                onChange={(e) => setMonthlyInterviewTarget(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        </div>

        {/* Data Backup & Export Section */}
        <div className="card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Download size={18} color="var(--accent)" />
              <span>Full Job Search Data Export</span>
            </h3>
            <p style={{ fontSize: 13, color: 'var(--t2)', margin: '4px 0 0' }}>
              Download a complete CSV backup of all application records, dates, salary notes, and links.
            </p>
          </div>

          <button onClick={exportCsvData} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Download size={16} />
            <span>Export CSV Backup</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
};
