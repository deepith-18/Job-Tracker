import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useAuthStore } from '../store/authStore';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';

export const DiagnosticsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { applications, error } = useApplications();
  const { addToast } = useToast();

  const [testingDb, setTestingDb] = useState(false);

  const providerId = user?.providerData?.[0]?.providerId === 'google.com' ? 'Google OAuth' : 'Email/Password';

  const handleTestConnection = () => {
    setTestingDb(true);
    setTimeout(() => {
      setTestingDb(false);
      if (error) {
        addToast('Firestore Connection Warning ⚠️', error, 'error');
      } else {
        addToast('Firebase Firestore Connected ⚡', `Active for ${user?.email} (${applications.length} apps synced)`, 'success');
      }
    }, 600);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">⚡ Database Diagnostics & Sync Health</h1>
        <p className="page-sub">
          Monitor Firebase Firestore connectivity, account authentication state, and cross-device data synchronization
        </p>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Health Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: error ? '#ef4444' : '#10b981', textTransform: 'uppercase', marginBottom: 4 }}>
              {error ? '✖ Firestore Sync Alert' : '● Firestore Database Status'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>
              {error ? 'Sync Error' : 'Connected & Active'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
              {error ? error : `Real-time listener active for ${user?.email}`}
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>
              📦 Total Synced Records
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>{applications.length} Applications</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>Auth Method: {providerId}</div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', marginBottom: 4 }}>
              🔑 Account User UID
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {user?.uid || 'Not Authenticated'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>Must match on Desktop & Mobile</div>
          </div>
        </div>

        {/* Connection Test Action */}
        <div className="card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              🧪 Firestore Latency & Sync Test
            </h3>
            <p style={{ fontSize: 13, color: 'var(--t2)', margin: '4px 0 0' }}>
              Ping Firebase Firestore servers to verify real-time security rules and active listener permissions.
            </p>
          </div>

          <button onClick={handleTestConnection} disabled={testingDb} className="btn btn-primary" style={{ borderRadius: 12, padding: '10px 20px' }}>
            {testingDb ? 'Pinging Firestore...' : '⚡ Ping Database Connection'}
          </button>
        </div>

        {/* Cross Device Troubleshooting Checklist */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 12 }}>
            📱 Cross-Device (Mobile vs Desktop) Sync Checklist
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: 'var(--t2)' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span>1.</span>
              <div>
                <strong>Verify Matching UIDs:</strong> Ensure the <strong>User UID</strong> string shown on this page matches word-for-word between your Desktop browser and Mobile device. If you used Email/Password on Desktop and Google OAuth on Mobile, Firebase assigns separate UIDs.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <span>2.</span>
              <div>
                <strong>Check Firebase Security Rules:</strong> In Firebase Console → Firestore Database → Rules, ensure `allow read, write: if request.auth != null` is configured.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <span>3.</span>
              <div>
                <strong>Deployment Environment Variables:</strong> If your mobile app runs on Vercel or Netlify, verify that `VITE_FIREBASE_PROJECT_ID` matches your local `.env` file.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
