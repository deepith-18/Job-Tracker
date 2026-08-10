import { Handshake, Sparkles, Clipboard } from 'lucide-react';
import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useToast } from '../components/ui/ToastContext';

export const AlumniNetworkPage: React.FC = () => {
  const { addToast } = useToast();

  const [alumniSchool, setAlumniSchool] = useState('UC Berkeley / Stanford');
  const [targetCompany, setTargetCompany] = useState('Google');
  const [alumniName, setAlumniName] = useState('Alex Rivera');
  const [targetRole, setTargetRole] = useState('Senior Full-Stack Engineer');

  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateOutreach = (e: React.FormEvent) => {
    e.preventDefault();

    const msg = `Hi ${alumniName},

I noticed we both share a background from ${alumniSchool}! I'm currently exploring the ${targetRole} opportunity at ${targetCompany} and have been really impressed by the team's engineering work.

I would love to ask you a couple of quick questions about ${targetCompany}'s team culture and engineering environment. Would you be open to a 10-minute virtual coffee chat next week?

Either way, thank you for your time and stay connected!

Best,
Candidate`;

    setGeneratedMessage(msg);
    addToast('Alumni Outreach Drafted 🎓', `Target: ${alumniName} at ${targetCompany}`, 'success');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    addToast('Message Copied', 'Ready for LinkedIn InMail', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">🎓 Alumni & University Network Warm Outreach</h1>
        <p className="page-sub">
          Connect with university alumni working at your target companies for internal referrals and coffee chats
        </p>
      </div>

      <div className="pb" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
        {/* Outreach Form */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
            <Handshake className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Alumni Connection Details
          </h3>

          <form onSubmit={handleGenerateOutreach} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="lbl">Alumni Full Name</label>
              <input
                className="inp"
                value={alumniName}
                onChange={(e) => setAlumniName(e.target.value)}
                placeholder="e.g. Alex Rivera"
              />
            </div>

            <div>
              <label className="lbl">Target Company</label>
              <input
                className="inp"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Google or Stripe"
              />
            </div>

            <div>
              <label className="lbl">Shared School / University / Org</label>
              <input
                className="inp"
                value={alumniSchool}
                onChange={(e) => setAlumniSchool(e.target.value)}
                placeholder="e.g. UC Berkeley or Stanford Alumni"
              />
            </div>

            <div>
              <label className="lbl">Target Role Applied For</label>
              <input
                className="inp"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ borderRadius: 12, marginTop: 4 }}>
              <Sparkles className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Draft Warm Alumni Message
            </button>
          </form>
        </div>

        {/* Message Preview */}
        <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              ✉️ LinkedIn InMail / Message Preview
            </h3>
            {generatedMessage && (
              <button onClick={handleCopyMessage} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
                {copied ? '✓ Copied' : <><Clipboard className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Copy Message</>}
              </button>
            )}
          </div>

          <textarea
            className="inp"
            rows={14}
            value={generatedMessage}
            onChange={(e) => setGeneratedMessage(e.target.value)}
            placeholder="Fill in alumni details and click Generate to produce your personalized message..."
            style={{ fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.6, flex: 1 }}
          />
        </div>
      </div>
    </AppShell>
  );
};
