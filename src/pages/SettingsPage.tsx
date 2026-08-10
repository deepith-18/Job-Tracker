import { Settings, Clipboard, Lightbulb, Save } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useAuthStore } from '../store/authStore';
import { useUserSettings } from '../hooks/useUserSettings';
import { useToast } from '../components/ui/ToastContext';

export const SettingsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings();
  const { addToast } = useToast();

  // Local form state — initialized from Firestore settings once loaded
  const [targetTitle, setTargetTitle] = useState('Senior Full-Stack Engineer');
  const [minSalary, setMinSalary] = useState(160000);
  const [remotePref, setRemotePref] = useState('Remote / Hybrid');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sync Firestore settings → local form state when data arrives
  useEffect(() => {
    if (!settingsLoading && settings) {
      setTargetTitle(settings.targetTitle || 'Senior Full-Stack Engineer');
      setMinSalary(settings.minSalary ?? 160000);
      setRemotePref(settings.remotePref || 'Remote / Hybrid');
      setEmailAlerts(settings.emailAlerts ?? true);
    }
  }, [settingsLoading, settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        targetTitle,
        minSalary,
        remotePref,
        emailAlerts,
      });
      addToast('Settings Saved', 'Preferences saved to cloud — synced across all devices', 'success');
    } catch {
      addToast('Save Failed', 'Could not save settings to Firestore. Check your connection.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title"><Settings className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> ApplyFlow Settings & Preferences</h1>
        <p className="page-sub">
          Manage career target preferences, notifications, and profile configurations
        </p>
      </div>

      <div className="pb" style={{ maxWidth: 640 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              👤 Profile & Account
            </h3>
            <Link
              to="/diagnostics"
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 10, fontSize: 12, padding: '6px 14px', textDecoration: 'none' }}
            >
              ⚡ Database Diagnostics →
            </Link>
          </div>

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
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => {
                    if (user?.uid) {
                      navigator.clipboard.writeText(user.uid);
                      addToast('UID Copied!', 'Compare this UID with your mobile device', 'success');
                    }
                  }}
                >
                  <Clipboard className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Copy UID
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--t3)', lineHeight: 1.4 }}>
              <Lightbulb className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> <strong>Universal Email Sync Active:</strong> Applications and documents are automatically synced across devices for <strong>{user?.email}</strong> regardless of login provider (Email/Password or Google button).
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
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '10px 24px', borderRadius: 12 }}>
                {saving ? <><Save className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Saving…</> : <><Save className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Save Preferences</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
};

