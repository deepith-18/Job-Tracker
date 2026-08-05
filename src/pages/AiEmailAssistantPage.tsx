import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';

type TemplateType = 'cold_outreach' | 'post_interview_thankyou' | 'followup_14d' | 'decline_offer' | 'rejection_feedback';

export const AiEmailAssistantPage: React.FC = () => {
  const { applications } = useApplications();
  const { addToast } = useToast();

  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [templateType, setTemplateType] = useState<TemplateType>('cold_outreach');
  const [recruiterName, setRecruiterName] = useState('Hiring Team');
  const [extraDetails, setExtraDetails] = useState('Highlighted 5+ years of React, TypeScript, and microservices experience.');

  const [generatedDraft, setGeneratedDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const app = applications.find((a) => a.id === selectedAppId);
    const company = app ? app.company : 'Target Company';
    const role = app ? app.role : 'Senior Software Engineer';

    setGenerating(true);
    setTimeout(() => {
      let draft = '';

      if (templateType === 'cold_outreach') {
        draft = `Subject: Expression of Interest — ${role} Role at ${company}

Hi ${recruiterName},

I hope this email finds you well! I have been closely following ${company}'s work in the industry and wanted to reach out regarding potential opportunities on your engineering team.

With a strong background in building scalable web applications and technical expertise in full-stack architecture, I believe my skill set aligns very well with ${company}'s technical vision. ${extraDetails}

I would love to connect for 10 minutes to learn more about upcoming roles on your team. I have attached my resume for your review.

Best regards,
Candidate`;
      } else if (templateType === 'post_interview_thankyou') {
        draft = `Subject: Thank You — ${role} Interview with ${company}

Hi ${recruiterName},

Thank you for taking the time to speak with me today about the ${role} position at ${company}. I thoroughly enjoyed learning more about the team's technical roadmap and engineering culture.

Our discussion reinforced my enthusiasm for the role. ${extraDetails}

Please let me know if you need any additional information or work samples from my end. I look forward to hearing about the next steps in the process!

Best regards,
Candidate`;
      } else if (templateType === 'followup_14d') {
        draft = `Subject: Following Up — ${role} Application (${company})

Hi ${recruiterName},

I hope you are having a great week! I am following up on my application for the ${role} position at ${company}, submitted a couple of weeks ago.

I remain extremely interested in joining ${company} and contributing to the team's goals. ${extraDetails}

Could you share an update on the status of my application or timeline for the next steps?

Thank you for your time and assistance!

Best regards,
Candidate`;
      } else if (templateType === 'decline_offer') {
        draft = `Subject: Update Regarding ${role} Offer at ${company}

Hi ${recruiterName},

Thank you so much for offering me the ${role} position at ${company}. I am deeply grateful for the time and confidence your team extended throughout the interview process.

After careful consideration, I have decided to accept another offer that aligns slightly closer with my current career goals at this stage. This was a difficult decision given how impressed I was by ${company}'s team and vision.

I hope we can stay connected for future opportunities. I wish you and the team all the best!

Warm regards,
Candidate`;
      } else {
        draft = `Subject: Gratitude & Feedback Request — ${role} Application at ${company}

Hi ${recruiterName},

Thank you for letting me know about the outcome regarding the ${role} position at ${company}. While disappointed, I appreciate the opportunity to interview with your team.

If your team has a brief moment, I would be immensely grateful for any constructive feedback on my technical or behavioral rounds. I am always striving to sharpen my skills.

Thank you again for your time and consideration throughout the process!

Best regards,
Candidate`;
      }

      setGeneratedDraft(draft);
      setGenerating(false);
      addToast('AI Draft Generated ✉️', `Template: ${templateType.replace('_', ' ')}`, 'success');
    }, 500);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    addToast('Copied to Clipboard 📋', 'Ready to paste into your email client', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">✉️ AI Email Assistant & Recruiter Copilot</h1>
        <p className="page-sub">
          Generate recruiter cold outreach, post-interview thank you notes, and application follow-up emails
        </p>
      </div>

      <div className="pb" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
        {/* Generator Controls */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
            ⚙️ Email Configuration
          </h3>

          <form onSubmit={handleGenerateDraft} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="lbl">Template Scenario</label>
              <select
                className="inp"
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value as TemplateType)}
              >
                <option value="cold_outreach">Cold Recruiter Outreach</option>
                <option value="post_interview_thankyou">Post-Interview Thank You Note</option>
                <option value="followup_14d">Application Follow-Up (14+ Days)</option>
                <option value="decline_offer">Politely Decline Offer</option>
                <option value="rejection_feedback">Feedback Request Post-Rejection</option>
              </select>
            </div>

            <div>
              <label className="lbl">Target Application</label>
              <select
                className="inp"
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
              >
                <option value="">Select target application...</option>
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.company} — {a.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="lbl">Recruiter / Contact Name</label>
              <input
                className="inp"
                placeholder="e.g. Sarah Chen or Hiring Team"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
              />
            </div>

            <div>
              <label className="lbl">Key Details / Technical Focus</label>
              <textarea
                className="inp"
                rows={3}
                placeholder="e.g. Highlighted 5+ years of React, TypeScript, and microservices experience."
                value={extraDetails}
                onChange={(e) => setExtraDetails(e.target.value)}
              />
            </div>

            <button type="submit" disabled={generating} className="btn btn-primary" style={{ borderRadius: 12, marginTop: 4 }}>
              {generating ? 'Drafting Email…' : '✨ Generate AI Email Draft'}
            </button>
          </form>
        </div>

        {/* Draft Preview Display */}
        <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              📝 Email Preview & Draft
            </h3>
            {generatedDraft && (
              <button onClick={handleCopyDraft} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
                {copied ? '✓ Copied' : '📋 Copy Draft'}
              </button>
            )}
          </div>

          <textarea
            className="inp"
            rows={16}
            value={generatedDraft}
            onChange={(e) => setGeneratedDraft(e.target.value)}
            placeholder="Select options and click Generate to produce your tailored recruiter draft..."
            style={{ fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.6, flex: 1 }}
          />
        </div>
      </div>
    </AppShell>
  );
};
