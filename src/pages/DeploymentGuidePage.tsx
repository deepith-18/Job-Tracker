import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useToast } from '../components/ui/ToastContext';

export const DeploymentGuidePage: React.FC = () => {
  const { addToast } = useToast();

  const [activePlatform, setActivePlatform] = useState<'vercel' | 'netlify' | 'firebase'>('vercel');
  const [copied, setCopied] = useState(false);

  const vercelConfig = `{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`;

  const netlifyConfig = `/*    /index.html   200`;

  const firebaseConfig = `{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}`;

  const currentConfig = activePlatform === 'vercel' ? vercelConfig : activePlatform === 'netlify' ? netlifyConfig : firebaseConfig;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentConfig);
    setCopied(true);
    addToast('Config Copied 📋', `${activePlatform.toUpperCase()} deployment file`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">🚀 Production Hosting & Deployment Guide</h1>
        <p className="page-sub">
          Deploy ApplyFlow to Vercel, Netlify, or Firebase Hosting with zero configuration hassle
        </p>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Platform Selector */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { id: 'vercel', label: '⭐ Vercel (Recommended Best)' },
            { id: 'netlify', label: '🌐 Netlify' },
            { id: 'firebase', label: '🔥 Firebase Hosting' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id as any)}
              className="btn"
              style={{
                padding: '10px 18px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                background: activePlatform === p.id ? 'var(--accent-bg)' : '#ffffff',
                color: activePlatform === p.id ? 'var(--accent)' : 'var(--t2)',
                border: activePlatform === p.id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Platform Deployment Card */}
        <div className="card" style={{ padding: 24 }}>
          {activePlatform === 'vercel' && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>
                ⭐ Deploying to Vercel (Fastest & Best Option)
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 16 }}>
                Vercel is the recommended hosting provider for React & Vite apps. It provides global CDN edge networks, free SSL certificates, and instant preview deployments on every Git push.
              </p>

              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>
                Deployment Steps:
              </div>
              <ol style={{ paddingLeft: 20, fontSize: 13, color: 'var(--t1)', lineHeight: 1.7, marginBottom: 20 }}>
                <li>Push your repository to GitHub / GitLab / Bitbucket.</li>
                <li>Go to <strong>Vercel.com</strong> and click <strong>New Project</strong>.</li>
                <li>Import your repository. Vercel automatically detects Vite and sets the build command to <code>npm run build</code> and output folder to <code>dist</code>.</li>
                <li>Create a <code>vercel.json</code> file in your root folder for SPA client-side routing.</li>
              </ol>
            </div>
          )}

          {activePlatform === 'netlify' && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>
                🌐 Deploying to Netlify
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 16 }}>
                Netlify offers continuous deployment from Git and drag-and-drop artifact hosting.
              </p>

              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>
                Deployment Steps:
              </div>
              <ol style={{ paddingLeft: 20, fontSize: 13, color: 'var(--t1)', lineHeight: 1.7, marginBottom: 20 }}>
                <li>Run <code>npm run build</code> locally or connect your Git repository.</li>
                <li>Add a <code>public/_redirects</code> file for client-side routing.</li>
                <li>Deploy to Netlify via Git or drag the <code>dist</code> folder into Netlify Drop!</li>
              </ol>
            </div>
          )}

          {activePlatform === 'firebase' && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>
                🔥 Deploying to Firebase Hosting
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 16 }}>
                Since ApplyFlow uses Firebase Authentication and Firestore, Firebase Hosting allows seamless single-project management.
              </p>

              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>
                Deployment Steps:
              </div>
              <ol style={{ paddingLeft: 20, fontSize: 13, color: 'var(--t1)', lineHeight: 1.7, marginBottom: 20 }}>
                <li>Run <code>npx firebase-tools init hosting</code> in your terminal.</li>
                <li>Set your public directory to <code>dist</code> and configure as a single-page app (rewrite all URLs to <code>/index.html</code>).</li>
                <li>Run <code>npm run build && npx firebase-tools deploy</code>.</li>
              </ol>
            </div>
          )}

          {/* Config snippet codebox */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase' }}>
                {activePlatform === 'vercel' ? 'vercel.json' : activePlatform === 'netlify' ? 'public/_redirects' : 'firebase.json'}
              </span>
              <button onClick={handleCopy} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
                {copied ? '✓ Copied' : '📋 Copy Config'}
              </button>
            </div>

            <textarea
              className="inp"
              rows={6}
              value={currentConfig}
              readOnly
              style={{ fontFamily: 'monospace', fontSize: 12.5, background: '#f8fafc' }}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
};
