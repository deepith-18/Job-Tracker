import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/ui/ToastContext';

export const SettingsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { addToast } = useToast();

  const [targetTitle, setTargetTitle] = useState('Senior Full-Stack Engineer');
  const [minSalary, setMinSalary] = useState(160000);
  const [remotePref, setRemotePref] = useState('Remote / Hybrid');
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Settings Saved ⚙️', 'Preferences updated successfully', 'success');
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">⚙️ ApplyFlow Settings & Preferences</h1>
        <p className="page-sub">
          Manage career target preferences, notifications, and profile configurations
        </p>
      </div>

      <div className="pb" style={{ maxWidth: 640 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
            👤 Profile & Account
          </h3>

          {/* Account & Sync Diagnostic Panel */}
          <div
            style={{
              background: 'var(--accent-bg)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 18px',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Authenticated Account
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginTop: 2 }}>
                  {user?.email || 'Not signed in'}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: user?.providerData?.[0]?.providerId === 'google.com' ? '#e0f2fe' : '#f3e8ff',
                  color: user?.providerData?.[0]?.providerId === 'google.com' ? '#0369a1' : '#7e22ce',
                  border: user?.providerData?.[0]?.providerId === 'google.com' ? '1px solid #bae6fd' : '1px solid #e9d5ff',
                }}
              >
                {user?.providerData?.[0]?.providerId === 'google.com' ? 'Google OAuth' : 'Email/Password'}
              </span>
            </div>

            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--t2)', fontFamily: 'monospace' }}>
                UID: <strong style={{ color: 'var(--t1)' }}>{user?.uid}</strong>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 11, padding: '4px 10px' }}
                onClick={() => {
                  if (user?.uid) {
                    navigator.clipboard.writeText(user.uid);
                    addToast('UID Copied! 📋', 'Compare this UID with your mobile device', 'success');
                  }
                }}
              >
                📋 Copy UID
              </button>
            </div>

            <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--t3)', lineHeight: 1.4 }}>
              💡 <strong>Cross-Device Sync Tip:</strong> Make sure your Mobile device has the <strong>exact same UID</strong> shown above. If you signed in via Email/Password on Desktop and Google button on Mobile, Firebase creates two distinct UIDs. Log in using the exact same method on both devices to sync changes.
            </div>
          </div>

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="lbl">Target Role Title</label>
              <input
                className="inp"
                value={targetTitle}
                onChange={(e) => setTargetTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Lead"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="lbl">Minimum Base Salary ($)</label>
                <input
                  type="number"
                  className="inp"
                  value={minSalary}
                  onChange={(e) => setMinSalary(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="lbl">Work Location Preference</label>
                <select className="inp" value={remotePref} onChange={(e) => setRemotePref(e.target.value)}>
                  <option value="Remote / Hybrid">Remote / Hybrid</option>
                  <option value="Remote Only">Remote Only</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <input
                type="checkbox"
                id="emailAlerts"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="emailAlerts" style={{ fontSize: 13, color: 'var(--t1)', cursor: 'pointer', margin: 0 }}>
                Enable aging application alerts and follow-up reminders
              </label>
            </div>

            <div style={{ marginTop: 10, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: 12 }}>
                💾 Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
};
