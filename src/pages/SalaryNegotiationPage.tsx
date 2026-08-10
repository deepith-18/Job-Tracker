import { DollarSign, Settings, Sparkles, FileText, Clipboard } from 'lucide-react';
import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useToast } from '../components/ui/ToastContext';

export const SalaryNegotiationPage: React.FC = () => {
  const { addToast } = useToast();

  const [company, setCompany] = useState('Stripe');
  const [initialBase, setInitialBase] = useState(165000);
  const [targetBase, setTargetBase] = useState(185000);
  const [competingOffer, setCompetingOffer] = useState('$190,000 Total Comp from Tech Corp');
  const [signOnBonus, setSignOnBonus] = useState(20000);

  const [emailDraft, setEmailDraft] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateNegotiation = (e: React.FormEvent) => {
    e.preventDefault();

    const draft = `Subject: Expressing Gratitude & Offer Discussion — ${company}

Hi Hiring Team,

Thank you so much for extending the offer to join ${company}! I am thrilled about the opportunity to work with your engineering team and contribute to ${company}'s growth.

After reviewing the details of the offer package:
• Offered Base Salary: $${initialBase.toLocaleString()}
• Target Base Expectation: $${targetBase.toLocaleString()}

Given my strong technical expertise in full-stack architecture and a competing offer at ${competingOffer}, I am hoping we can adjust the base compensation closer to $${targetBase.toLocaleString()} (or explore a one-time sign-on bonus of $${signOnBonus.toLocaleString()}).

If we can reach an agreement around these numbers, I am prepared to sign the offer immediately and begin onboarding!

Thank you again for your flexibility and support throughout this process.

Best regards,
Candidate`;

    setEmailDraft(draft);
    addToast('Negotiation Script Generated', `Target: $${targetBase.toLocaleString()}`, 'success');
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailDraft);
    setCopied(true);
    addToast('Copied to Clipboard', 'Ready to send to recruiter', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title"><DollarSign className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Salary Negotiation & Counter-Offer Copilot</h1>
        <p className="page-sub">
          Calculate equity vesting schedules, counter-offer targets, and generate proven salary negotiation scripts
        </p>
      </div>

      <div className="pb" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
        {/* Form Controls */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
            <Settings className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Offer Package Inputs
          </h3>

          <form onSubmit={handleGenerateNegotiation} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="lbl">Target Company</label>
              <input
                className="inp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe or Google"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="lbl">Offered Base ($)</label>
                <input
                  type="number"
                  className="inp"
                  value={initialBase}
                  onChange={(e) => setInitialBase(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="lbl">Counter Base Target ($)</label>
                <input
                  type="number"
                  className="inp"
                  value={targetBase}
                  onChange={(e) => setTargetBase(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <label className="lbl">Competing Offer / Leverage Details</label>
              <input
                className="inp"
                value={competingOffer}
                onChange={(e) => setCompetingOffer(e.target.value)}
                placeholder="e.g. $190,000 TC from Tech Corp"
              />
            </div>

            <div>
              <label className="lbl">Target Sign-On Bonus ($)</label>
              <input
                type="number"
                className="inp"
                value={signOnBonus}
                onChange={(e) => setSignOnBonus(parseInt(e.target.value) || 0)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ borderRadius: 12, marginTop: 4 }}>
              <Sparkles className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Generate Counter-Offer Script
            </button>
          </form>
        </div>

        {/* Script Preview */}
        <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              <FileText className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Counter-Offer Email Script
            </h3>
            {emailDraft && (
              <button onClick={handleCopyEmail} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
                {copied ? '✓ Copied' : <><Clipboard className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Copy Email Text</>}
              </button>
            )}
          </div>

          <textarea
            className="inp"
            rows={15}
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            placeholder="Fill details on the left and click Generate to produce your salary negotiation draft..."
            style={{ fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.6, flex: 1 }}
          />
        </div>
      </div>
    </AppShell>
  );
};
