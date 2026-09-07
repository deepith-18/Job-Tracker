import { Rocket, Zap, Globe, Copy, Check } from 'lucide-react';
import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useToast } from '../components/ui/ToastContext';

export const AutoApplyCopilotPage: React.FC = () => {
  const { addToast } = useToast();

  const [copied, setCopied] = useState(false);

  const autofillProfile = {
    firstName: 'Candidate',
    lastName: 'Engineer',
    email: 'candidate@applyflow.dev',
    phone: '+1 (555) 019-2834',
    linkedIn: 'https://linkedin.com/in/candidate',
    github: 'https://github.com/candidate',
    portfolio: 'https://candidate.dev',
    location: 'San Francisco, CA (Open to Remote)',
    authorizedUs: 'Yes',
    sponsorshipNeeded: 'No',
    preferredSalary: '$185,000 - $220,000',
  };

  const jsonString = JSON.stringify(autofillProfile, null, 2);

  const handleCopyProfile = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    addToast('Autofill Payload Copied', 'Ready for Greenhouse / Lever / Workday', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Rocket size={24} color="var(--accent)" />
          <span>Auto-Apply Copilot & Autofill Bridge</span>
        </h1>
        <p className="page-sub">
          One-click candidate profile payload for instant autofill across Workday, Greenhouse, Lever, and Ashby
        </p>
      </div>

      <div className="pb" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 20 }}>
        {/* Profile Payload Card */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="var(--accent)" />
              <span>Unified Candidate Autofill Payload</span>
            </h3>
            <button onClick={handleCopyProfile} className="btn btn-primary btn-sm" style={{ borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Profile Payload</span>
                </>
              )}
            </button>
          </div>

          <textarea
            className="inp"
            rows={14}
            value={jsonString}
            readOnly
            style={{ fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.6, background: 'var(--page)' }}
          />
        </div>

        {/* Supported Portals Card */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} color="var(--accent)" />
            <span>Supported Application Portals</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { name: 'Greenhouse', status: 'Active (1-Click)', color: '#10b981' },
              { name: 'Lever', status: 'Active (1-Click)', color: '#10b981' },
              { name: 'Ashby', status: 'Active (1-Click)', color: '#10b981' },
              { name: 'Workday', status: 'Supported', color: '#6366f1' },
              { name: 'BambooHR', status: 'Supported', color: '#6366f1' },
            ].map((portal) => (
              <div
                key={portal.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'var(--page)',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{portal.name}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: portal.color,
                    background: 'var(--card)',
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: `1px solid ${portal.color}`,
                  }}
                >
                  ● {portal.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
};
