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

          <div style={{ marginBottom: 20, fontSize: 13, color: 'var(--t2)' }}>
            Signed in as: <strong>{user?.email}</strong>
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
