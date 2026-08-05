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
    const headers = ['Company', 'Role', 'Status', 'Applied Date', 'Job Link', 'Source', 'Notes'];
    const rows = applications.map((a) => [
      `"${a.company}"`,
      `"${a.role}"`,
      `"${a.status}"`,
      `"${a.appliedDate ? new Date(a.appliedDate).toISOString().split('T')[0] : ''}"`,
      `"${a.jobLink || ''}"`,
      `"${a.source || ''}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `ApplyFlow_Job_Search_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Backup Exported 📦', 'Downloaded CSV report', 'success');
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">🎯 Career Goals & Data Backup Center</h1>
        <p className="page-sub">
          Set weekly application velocity goals, track milestone targets, and export data backups
        </p>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Goal Progress Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Weekly Velocity Goal */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                🚀 Weekly Submission Goal
              </h3>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)' }}>
                {currentWeeklyCount} / {weeklyTarget} Apps
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: 10, borderRadius: 10, background: '#e2e8f0', overflow: 'hidden', marginBottom: 16 }}>
              <div
                style={{
                  width: `${weeklyProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  borderRadius: 10,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label className="lbl" style={{ margin: 0 }}>Target Apps / Week:</label>
              <input
                type="number"
                className="inp"
                style={{ width: 80, padding: '4px 8px' }}
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Monthly Interview Goal */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                🎙️ Monthly Interview Goal
              </h3>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>
                {currentInterviewsCount} / {monthlyInterviewTarget} Rounds
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: 10, borderRadius: 10, background: '#e2e8f0', overflow: 'hidden', marginBottom: 16 }}>
              <div
                style={{
                  width: `${interviewProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                  borderRadius: 10,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label className="lbl" style={{ margin: 0 }}>Target Interviews / Mo:</label>
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
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              📦 Full Job Search Data Export
            </h3>
            <p style={{ fontSize: 13, color: 'var(--t2)', margin: '4px 0 0' }}>
              Download a complete CSV backup of all application records, dates, salary notes, and links.
            </p>
          </div>

          <button onClick={exportCsvData} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: 12 }}>
            📥 Export CSV Backup
          </button>
        </div>
      </div>
    </AppShell>
  );
};
