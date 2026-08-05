import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useToast } from '../components/ui/ToastContext';

export const PortfolioGeneratorPage: React.FC = () => {
  const { addToast } = useToast();

  const [devTitle, setDevTitle] = useState('Senior Full-Stack Engineer');
  const [keySkills, setKeySkills] = useState('React, TypeScript, Node.js, Go, PostgreSQL, AWS');
  const [topProject, setTopProject] = useState('ApplyFlow — High-Scale Job Search OS with AI ATS Optimization');

  const [pitch, setPitch] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGeneratePitch = (e: React.FormEvent) => {
    e.preventDefault();

    const text = `30-SECOND ELEVATOR PITCH:
"Hi! I'm a ${devTitle} specializing in building high-performance web applications using ${keySkills}. Most recently, I built ${topProject}, focusing on scalable architecture and rapid user execution. I'm passionate about building sleek, resilient products and solving complex engineering challenges."

PORTFOLIO BIO SUMMARY:
• Role: ${devTitle}
• Tech Stack: ${keySkills}
• Flagship Project: ${topProject}
• GitHub: https://github.com/candidate
• Portfolio: https://candidate.dev`;

    setPitch(text);
    addToast('Elevator Pitch Generated 🚀', devTitle, 'success');
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    addToast('Copied to Clipboard 📋', 'Ready for interview intro', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">🎨 Developer Portfolio & 30-Second Elevator Pitch</h1>
        <p className="page-sub">
          Craft compelling 30-second elevator pitches, portfolio summaries, and interview intro statements
        </p>
      </div>

      <div className="pb" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
        {/* Form Controls */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
            ⚙️ Engineer Profile Inputs
          </h3>

          <form onSubmit={handleGeneratePitch} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="lbl">Target Engineering Title</label>
              <input
                className="inp"
                value={devTitle}
                onChange={(e) => setDevTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="lbl">Core Technical Stack</label>
              <input
                className="inp"
                value={keySkills}
                onChange={(e) => setKeySkills(e.target.value)}
              />
            </div>

            <div>
              <label className="lbl">Flagship Project / Accomplishment</label>
              <textarea
                className="inp"
                rows={3}
                value={topProject}
                onChange={(e) => setTopProject(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ borderRadius: 12, marginTop: 4 }}>
              ✨ Generate Pitch & Portfolio Bio
            </button>
          </form>
        </div>

        {/* Generated Pitch */}
        <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              📝 Elevator Pitch Script
            </h3>
            {pitch && (
              <button onClick={handleCopyPitch} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
                {copied ? '✓ Copied' : '📋 Copy Pitch Text'}
              </button>
            )}
          </div>

          <textarea
            className="inp"
            rows={14}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="Fill details on the left and click Generate to produce your elevator pitch..."
            style={{ fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.6, flex: 1 }}
          />
        </div>
      </div>
    </AppShell>
  );
};
