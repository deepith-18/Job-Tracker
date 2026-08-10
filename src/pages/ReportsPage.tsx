import { BarChart, FileText, Clipboard } from 'lucide-react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';

export const ReportsPage: React.FC = () => {
  const { applications } = useApplications();
  const { addToast } = useToast();

  const [copied, setCopied] = useState(false);

  const totalApps = applications.length;
  const appliedCount = applications.filter((a) => a.status === 'Applied').length;
  const interviewCount = applications.filter((a) => a.status === 'Interview').length;
  const offerCount = applications.filter((a) => a.status === 'Offer').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;

  const responseRate = totalApps > 0 ? Math.round(((interviewCount + offerCount) / totalApps) * 100) : 0;

  const reportText = `================================================
ApplyFlow Executive Weekly Job Search Report
Date: ${format(new Date(), 'MMMM d, yyyy')}
================================================

SUMMARY METRICS:
------------------------------------------------
• Total Applications Tracked: ${totalApps}
• Active Applications (Applied): ${appliedCount}
• Scheduled Technical Interviews: ${interviewCount}
• Official Job Offers: ${offerCount}
• Rejections Logged: ${rejectedCount}
• Pipeline Conversion / Response Rate: ${responseRate}%

RECENT APPLICATIONS LOGGED:
------------------------------------------------
${applications.slice(0, 5).map((a) => `• ${a.company} — ${a.role} [${a.status}]`).join('\n') || '• No applications logged yet'}

STRATEGIC FOCUS FOR NEXT WEEK:
------------------------------------------------
1. Follow up on applications in Applied status > 14 days.
2. Conduct 2 AI Mock Interview sessions focusing on System Design & Behavioral STAR stories.
3. Network with 3 internal company advocates via LinkedIn InMail.

================================================
Generated via ApplyFlow — Job Search OS
================================================`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    addToast('Report Copied', 'Executive summary ready to share', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title"><BarChart className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Executive Weekly Report & Career Summary</h1>
        <p className="page-sub">
          Generate comprehensive executive reports summarizing pipeline conversion rates, interview progress, and action items
        </p>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Metric Cards Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>{totalApps}</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>Total Tracked Apps</div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{responseRate}%</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>Response Conversion Rate</div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6' }}>{interviewCount}</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>Active Interviews</div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{offerCount}</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>Official Offers</div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              <FileText className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Executive Progress Summary
            </h3>
            <button onClick={handleCopyReport} className="btn btn-primary btn-sm" style={{ borderRadius: 10 }}>
              {copied ? '✓ Copied' : <><Clipboard className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Copy Report Text</>}
            </button>
          </div>

          <textarea
            className="inp"
            rows={18}
            value={reportText}
            readOnly
            style={{ fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.6, background: '#f8fafc' }}
          />
        </div>
      </div>
    </AppShell>
  );
};
