import React, { useState, useMemo } from 'react';
import {
  Send,
  CheckCircle2,
  Mail,
  Check,
  Building2,
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { useToast } from '../ui/ToastContext';
import type { Application } from '../../types';

interface OutreachCadenceRadarProps {
  applications: Application[];
}

interface CadenceItem {
  app: Application;
  daysElapsed: number;
  stage: 'Post-Apply Touchpoint' | 'Post-Interview Thank You' | 'Post-Interview Decision Ping' | 'Cold / Archive';
  urgency: 'high' | 'medium' | 'low';
  recommendedAction: string;
  draftSubject: string;
  draftBody: string;
}

export const OutreachCadenceRadar: React.FC<OutreachCadenceRadarProps> = ({
  applications,
}) => {
  const { addToast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'High Urgency' | 'Interviews' | 'Applied'>('All');
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);
  const [activeDraftAppId, setActiveDraftAppId] = useState<string | null>(null);

  const cadenceList = useMemo(() => {
    const now = new Date();
    const items: CadenceItem[] = [];

    applications.forEach((app) => {
      if (['Offer', 'Rejected', 'Withdrawn', 'Wishlist'].includes(app.status)) return;

      const created = new Date(app.createdAt);
      const applied = app.appliedDate ? new Date(app.appliedDate) : created;
      const updated = app.updatedAt ? new Date(app.updatedAt) : created;
      const daysSinceUpdate = differenceInDays(now, updated);
      const daysSinceApplied = differenceInDays(now, applied);

      if (app.status === 'Interview') {
        if (daysSinceUpdate <= 2) {
          items.push({
            app,
            daysElapsed: daysSinceUpdate,
            stage: 'Post-Interview Thank You',
            urgency: 'high',
            recommendedAction: 'Send 24-hour thank you note & technical recap',
            draftSubject: `Thank you — ${app.role} Interview with ${app.company}`,
            draftBody: `Hi [Interviewer Name],\n\nThank you for taking the time to speak with me today regarding the ${app.role} role at ${app.company}. I thoroughly enjoyed discussing [Key Architecture / Engineering Challenge Discussed] and learning more about how the team approaches engineering velocity.\n\nOur conversation reinforced my enthusiasm for joining ${app.company}. Please let me know if you need any additional code samples or architectural documentation from my side.\n\nBest regards,\n[Your Name]`,
          });
        } else if (daysSinceUpdate >= 7) {
          items.push({
            app,
            daysElapsed: daysSinceUpdate,
            stage: 'Post-Interview Decision Ping',
            urgency: 'high',
            recommendedAction: 'Polite inquiry on hiring committee timeline',
            draftSubject: `Checking in — ${app.role} interview status at ${app.company}`,
            draftBody: `Hi [Recruiter / Coordinator Name],\n\nI hope your week is off to a great start!\n\nI wanted to briefly follow up on our recent interview rounds for the ${app.role} position. I remain deeply excited about the opportunity to contribute to ${app.company}.\n\nDo you have any updates on the hiring committee's decision or next steps in the process?\n\nThank you again for your time and guidance.\n\nWarm regards,\n[Your Name]`,
          });
        }
      } else if (app.status === 'Applied') {
        if (daysSinceApplied >= 5 && daysSinceApplied <= 14) {
          items.push({
            app,
            daysElapsed: daysSinceApplied,
            stage: 'Post-Apply Touchpoint',
            urgency: 'medium',
            recommendedAction: 'Polite LinkedIn / Recruiter connection note',
            draftSubject: `Application Follow-Up: ${app.role} — [Your Name]`,
            draftBody: `Hi [Recruiter Name],\n\nI recently submitted my application for the ${app.role} opening at ${app.company}. Given my background in [Your Top 2 Skills, e.g. React & TypeScript] and shipping resilient distributed systems, I am very excited about your team's mission.\n\nI would love the opportunity to briefly introduce myself and share how my technical background aligns with what you are building at ${app.company}.\n\nThank you for your time and consideration!\n\nBest,\n[Your Name]`,
          });
        } else if (daysSinceApplied > 21) {
          items.push({
            app,
            daysElapsed: daysSinceApplied,
            stage: 'Cold / Archive',
            urgency: 'low',
            recommendedAction: 'Final touchpoint or mark as Ghosted to clean pipeline',
            draftSubject: `Closing the loop — ${app.role} at ${app.company}`,
            draftBody: `Hi [Recruiter Name],\n\nI wanted to check in one last time regarding my application for ${app.role} at ${app.company}. If the position has already been filled or paused, no problem at all — I will keep an eye out for future openings that match my background.\n\nThank you again for your consideration!\n\nBest regards,\n[Your Name]`,
          });
        }
      }
    });

    return items.sort((a, b) => {
      const urgencyScore = { high: 3, medium: 2, low: 1 };
      return urgencyScore[b.urgency] - urgencyScore[a.urgency];
    });
  }, [applications]);

  const filteredItems = useMemo(() => {
    return cadenceList.filter((item) => {
      if (selectedFilter === 'High Urgency') return item.urgency === 'high';
      if (selectedFilter === 'Interviews') return item.app.status === 'Interview';
      if (selectedFilter === 'Applied') return item.app.status === 'Applied';
      return true;
    });
  }, [cadenceList, selectedFilter]);

  const handleCopyEmail = (body: string, appId: string) => {
    navigator.clipboard.writeText(body);
    setCopiedAppId(appId);
    addToast('Follow-Up Email Copied', 'Paste into your email client', 'success');
    setTimeout(() => setCopiedAppId(null), 2000);
  };

  const highUrgencyCount = cadenceList.filter((c) => c.urgency === 'high').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* ── Top Header Banner ── */}
      <div
        className="card"
        style={{
          padding: '22px 24px',
          borderRadius: 18,
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
            }}
          >
            <Send style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Smart Outreach Cadence & Follow-Up Radar
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--t3)', margin: 0, marginTop: 3 }}>
              Never let an application slip through the cracks. Automated touchpoint tracking with ready-to-send diplomatic follow-up emails.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              background: highUrgencyCount > 0 ? '#fef3c7' : '#dcfce7',
              color: highUrgencyCount > 0 ? '#b45309' : '#15803d',
              fontSize: 12,
              fontWeight: 800,
              border: highUrgencyCount > 0 ? '1px solid #fde68a' : '1px solid #bbf7d0',
            }}
          >
            {highUrgencyCount > 0 ? `${highUrgencyCount} Actionable Touchpoints Today` : 'Pipeline Up-To-Date'}
          </span>
        </div>
      </div>

      {/* ── Filter Buttons Bar ── */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {(['All', 'High Urgency', 'Interviews', 'Applied'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedFilter(tab)}
            className="btn btn-sm"
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 10,
              background: selectedFilter === tab ? 'var(--accent)' : 'var(--card)',
              color: selectedFilter === tab ? '#ffffff' : 'var(--t2)',
              border: '1px solid var(--border)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Follow-Up Queue Cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredItems.length === 0 ? (
          <div
            className="card"
            style={{
              padding: 36,
              textAlign: 'center',
              borderRadius: 16,
              border: '1px dashed var(--border)',
              color: 'var(--t3)',
            }}
          >
            <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>No Pending Follow-Ups Right Now</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              All your applications and interviews have been touched recently. When an application passes 5 days without response, it will appear here automatically.
            </div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isDraftOpen = activeDraftAppId === item.app.id;
            return (
              <div
                key={item.app.id}
                className="card"
                style={{
                  borderRadius: 16,
                  border: item.urgency === 'high' ? '1.5px solid #f59e0b' : '1px solid var(--border)',
                  background: 'var(--card)',
                  padding: '18px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building2 size={16} color="var(--t3)" />
                      <strong style={{ fontSize: 15, color: 'var(--t1)' }}>{item.app.company}</strong>
                      <span style={{ fontSize: 12, color: 'var(--t3)' }}>• {item.app.role}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 8,
                          background: item.urgency === 'high' ? '#fef3c7' : '#f1f5f9',
                          color: item.urgency === 'high' ? '#b45309' : '#64748b',
                        }}
                      >
                        {item.stage} ({item.daysElapsed} days elapsed)
                      </span>

                      <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>
                        {item.recommendedAction}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => setActiveDraftAppId(isDraftOpen ? null : item.app.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12 }}
                    >
                      {isDraftOpen ? 'Hide Email Draft' : 'Preview Follow-up Email'}
                    </button>

                    <button
                      onClick={() => handleCopyEmail(item.draftBody, item.app.id)}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '5px 12px' }}
                    >
                      {copiedAppId === item.app.id ? <Check size={13} /> : <Mail size={13} />}
                      <span>{copiedAppId === item.app.id ? 'Copied Draft' : 'Copy Email'}</span>
                    </button>
                  </div>
                </div>

                {/* Expandable Draft Email */}
                {isDraftOpen && (
                  <div
                    style={{
                      background: 'var(--page)',
                      padding: 16,
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      marginTop: 6,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 4 }}>
                      Subject: <strong>{item.draftSubject}</strong>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        fontSize: 12.5,
                        color: 'var(--t2)',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        lineHeight: 1.55,
                        background: 'var(--card)',
                        padding: 12,
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                      }}
                    >
                      {item.draftBody}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
