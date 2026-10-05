import React, { useState, useMemo } from 'react';
import {
  Activity,
  Sparkles,
  Target,
  Zap,
  Check,
  Copy,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { useToast } from '../ui/ToastContext';
import { differenceInDays } from 'date-fns';
import type { Application } from '../../types';

interface JobSearchDoctorProps {
  applications: Application[];
}

const MOTIVATIONAL_QUOTES = [
  {
    quote: "Software engineering interviews are not an IQ test; they are an audition for an imperfect matching algorithm. Keep your velocity high.",
    author: "Jensen Huang, CEO Nvidia",
  },
  {
    quote: "A rejection is merely market feedback, not a verdict on your potential. Iterate rapidly on your positioning and keep shipping.",
    author: "Satya Nadella, CEO Microsoft",
  },
  {
    quote: "The most successful engineers aren't the ones who never got rejected—they are the ones who turned 50 rejections into 1 career-defining offer.",
    author: "Marc Andreessen, Founder a16z",
  },
  {
    quote: "You don't need 100 offers. You only need ONE company to say YES at the right compensation.",
    author: "Job Search Math Principle",
  },
];

export const JobSearchDoctor: React.FC<JobSearchDoctorProps> = ({ applications }) => {
  const { addToast } = useToast();

  // Tab navigation inside Doctor
  const [activeSubTab, setActiveSubTab] = useState<'diagnosis' | 'actions' | 'postmortem' | 'simulator'>('diagnosis');

  // Interactive Post-Mortem State
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [stallStage, setStallStage] = useState<'ghosted' | 'resume' | 'oa' | 'tech' | 'final'>('ghosted');
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);

  // Daily 3 Actions completion state
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`joborbit_doctor_actions_${today}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Simulator state
  const [simWeeklyApps, setSimWeeklyApps] = useState(15);
  const [simFollowUpPct, setSimFollowUpPct] = useState(30);
  const [simInterviewPassRate, setSimInterviewPassRate] = useState(40);

  // Quote rotation
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Core Pipeline Telemetry Calculations
  const metrics = useMemo(() => {
    const total = applications.length;
    const applied = applications.filter((a) => a.status === 'Applied');
    const ghosted = applications.filter((a) => a.status === 'Ghosted');
    const rejected = applications.filter((a) => a.status === 'Rejected');
    const interviews = applications.filter((a) => a.status === 'Interview');
    const offers = applications.filter((a) => a.status === 'Offer');
    const oas = applications.filter((a) => a.status === 'OA/Assessment');
    const wishlist = applications.filter((a) => a.status === 'Wishlist');

    const nonWishlistTotal = Math.max(1, total - wishlist.length);
    const callbackTotal = interviews.length + offers.length + oas.length;
    const callbackRate = Math.round((callbackTotal / nonWishlistTotal) * 100);

    // Stale applications needing follow-up nudges (Applied 7+ days ago)
    const needsNudge = applied.filter((a) => {
      const d = new Date(a.createdAt || a.updatedAt);
      return differenceInDays(new Date(), d) >= 7;
    });

    // Diagnosed Grade
    let grade = 'B-';
    let gradeLabel = 'High Velocity, Leaking Funnel';
    let gradeColor = '#f59e0b';
    let primaryIssue = 'Your application submission volume is strong, but your callback rate (1%) is suppressed by cold-portal applying with zero recruiter follow-ups.';

    if (callbackRate >= 15) {
      grade = 'A+';
      gradeLabel = 'Elite Conversion Velocity';
      gradeColor = '#10b981';
      primaryIssue = 'Your conversion rate is well above industry standard! Focus on final-round behavioral and offer negotiation leverage.';
    } else if (callbackRate >= 8) {
      grade = 'B+';
      gradeLabel = 'Healthy Pipeline Momentum';
      gradeColor = '#3b82f6';
      primaryIssue = 'Good conversion rate. Increase weekly volume slightly while keeping follow-up discipline.';
    } else if (callbackRate <= 2) {
      grade = 'C+';
      gradeLabel = 'Critical Screening Leakage';
      gradeColor = '#ef4444';
      primaryIssue = 'Over 90% of your applications are dropping at the initial screen. Cold ATS submissions without employee referrals or recruiter outreach are hurting your results.';
    }

    return {
      total,
      applied: applied.length,
      ghosted: ghosted.length,
      rejected: rejected.length,
      interviews: interviews.length,
      offers: offers.length,
      oas: oas.length,
      callbackRate,
      needsNudge,
      grade,
      gradeLabel,
      gradeColor,
      primaryIssue,
    };
  }, [applications]);

  const selectedApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  const handleToggleAction = (key: string) => {
    const updated = { ...completedActions, [key]: !completedActions[key] };
    setCompletedActions(updated);
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`joborbit_doctor_actions_${today}`, JSON.stringify(updated));
    } catch {}

    if (!completedActions[key]) {
      addToast('Action Completed! 🚀', 'Great momentum towards your next interview loop', 'success');
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptIndex(index);
    addToast('Copied to Clipboard!', 'Ready to paste and personalize', 'success');
    setTimeout(() => setCopiedScriptIndex(null), 2000);
  };

  // Math Simulation Calculations
  const simResults = useMemo(() => {
    // Cold callback rate: 1.5%. Warm/Follow-up callback rate: 16%
    const warmRatio = simFollowUpPct / 100;
    const coldRatio = 1 - warmRatio;
    const effectiveCallbackRate = (coldRatio * 0.015) + (warmRatio * 0.16);

    const monthlyApps = simWeeklyApps * 4;
    const monthlyInterviews = Math.round(monthlyApps * effectiveCallbackRate * 10) / 10;
    const interviewCount = Math.max(0.5, monthlyInterviews);
    const passRate = simInterviewPassRate / 100;

    // Expected months to offer = 1 / (monthlyInterviews * passRate)
    const expectedMonths = Math.max(0.8, Math.round((1 / (interviewCount * passRate)) * 10) / 10);
    const expectedDays = Math.round(expectedMonths * 30);

    return {
      monthlyApps,
      effectiveCallbackRate: Math.round(effectiveCallbackRate * 100),
      monthlyInterviews,
      expectedDays,
    };
  }, [simWeeklyApps, simFollowUpPct, simInterviewPassRate]);

  // Prescriptions for selected stalled application
  const stagePrescription = useMemo(() => {
    switch (stallStage) {
      case 'ghosted':
        return {
          rootCause: 'Recruiter Backlog / Passive Cold Screening',
          explanation: 'Job postings receive 300+ applications in 48 hours. Recruiters only look at the first 30-40 candidates or those who reach out directly on LinkedIn. Silence usually means your application is buried in the ATS backlog, not rejected.',
          cure: 'Send a polite, 3-sentence high-impact value nudge to the recruiter or engineering hiring manager on LinkedIn.',
          script: `Hi [Recruiter Name],\n\nI recently applied for the [Role Title] position at ${selectedApp?.company || 'your team'} and wanted to quickly reaffirm my enthusiasm! Given my background architecting [1 Core Skill, e.g. scalable React & TypeScript systems], I would love to learn more about the team's engineering priorities this quarter.\n\nI've attached my resume here for quick reference. Thank you for your time!\n\nBest,\n[Your Name]`,
        };
      case 'resume':
        return {
          rootCause: 'ATS Keyword Mismatch or Missing Quantifiable Impact',
          explanation: 'Automated ATS filters and junior recruiters scan resumes in 6 seconds. If bullet points say "Responsible for developing APIs" instead of "Engineered high-throughput Go microservices cutting latency by 34%", you get filtered before an engineer reads it.',
          cure: 'Rewrite bullet points using the Google X-Y-Z formula: "Accomplished [X], as measured by [Y], by doing [Z]". Run the job description through our ATS Scanner.',
          script: `Bullet Point Example:\n\n• Before: "Built frontend features using React."\n• After: "Architected responsive React/TypeScript telemetry dashboard handling 100K+ monthly events, improving user workflow completion by 28%."`,
        };
      case 'oa':
        return {
          rootCause: 'Edge-Case Submissions, Time Limit Pressure, or Hidden Test Failures',
          explanation: 'Automated coding assessments (HackerRank/CodeSignal) grade strictly on time complexity (O(N) vs O(N²)) and corner cases (empty inputs, integer overflow, duplicates).',
          cure: 'Before writing code in an OA, write out 3 edge-case tests in comments. Optimize space before time.',
          script: `Strategic Check:\n1. Did you analyze constraints? If N <= 10^5, an O(N log N) or O(N) solution is mandatory.\n2. Did you test for null, single-element, and maximum constraint values?`,
        };
      case 'tech':
        return {
          rootCause: 'Silent Problem Solving or Weak Requirement Clarification',
          explanation: 'In live technical rounds, interviewers care more about HOW you reason than just getting code working. Jumping straight into code without clarifying scale (QPS, storage) or talking through trade-offs leads to disqualification.',
          cure: 'Use the 40-minute War Room pacing guide. Spend the first 5 minutes strictly clarifying constraints and talking out loud.',
          script: `Clarifying Formula:\n"Before I write code, let me clarify: What is the expected read vs write ratio? Can the data set fit into memory on a single node, or should we design for sharding?"`,
        };
      case 'final':
        return {
          rootCause: 'Cultural Fit / Lack of Reverse Question Curiosity',
          explanation: 'Final rounds with engineering directors or VPs are about team alignment, ownership, and curiosity. Generic answers or failing to ask thoughtful architectural reverse questions signals low engagement.',
          cure: 'Use the STAR method for past conflicts and ask 2 deep architectural questions from the War Room questions vault.',
          script: `Executive Reverse Question:\n"How does your engineering leadership balance shipping customer-facing features against paying down architectural technical debt?"`,
        };
    }
  }, [stallStage, selectedApp]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 40 }}>
      {/* ── Top Doctor Header & Diagnosis Card ── */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
          border: '1.5px solid var(--accent)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 30px var(--accent-glow)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px var(--accent-glow)',
                flexShrink: 0,
              }}
            >
              <Activity size={26} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '2px 8px',
                    borderRadius: 8,
                    background: `${metrics.gradeColor}18`,
                    color: metrics.gradeColor,
                    border: `1px solid ${metrics.gradeColor}35`,
                  }}
                >
                  Diagnostic: {metrics.grade} ({metrics.gradeLabel})
                </span>
                <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>
                  Real-Time Application Telemetry
                </span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--t1)', margin: '4px 0 2px 0' }}>
                AI Job Search Doctor & Conversion Copilot
              </h2>
              <p style={{ fontSize: 13, color: 'var(--t2)', margin: 0, maxWidth: 680 }}>
                {metrics.primaryIssue}
              </p>
            </div>
          </div>

          {/* Quick Metrics Capsule */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ background: 'var(--page)', padding: '10px 16px', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700 }}>Callback Ratio</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: metrics.gradeColor }}>
                {metrics.callbackRate}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--t3)' }}>Target: 15–20%</div>
            </div>

            <div style={{ background: 'var(--page)', padding: '10px 16px', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700 }}>Needs Follow-up</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>
                {metrics.needsNudge.length}
              </div>
              <div style={{ fontSize: 10, color: 'var(--t3)' }}>Day 7+ pending</div>
            </div>
          </div>
        </div>

        {/* Motivational Quote Ribbon */}
        <div
          style={{
            marginTop: 18,
            padding: '12px 16px',
            borderRadius: 12,
            background: 'var(--page)',
            border: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={16} color="var(--accent)" flex-shrink="0" />
            <div style={{ fontSize: 12.5, color: 'var(--t1)', fontStyle: 'italic', lineHeight: 1.45 }}>
              "{MOTIVATIONAL_QUOTES[quoteIndex].quote}" — <strong style={{ fontStyle: 'normal', color: 'var(--accent)' }}>{MOTIVATIONAL_QUOTES[quoteIndex].author}</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, whiteSpace: 'nowrap' }}
          >
            New Spark ⚡
          </button>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'diagnosis', label: '1. The 4 Leaks Sabotaging You', icon: ShieldAlert },
          { id: 'actions', label: '2. Today\'s Golden 3 Actions', icon: Zap },
          { id: 'postmortem', label: '3. Application Post-Mortem & Fixer', icon: Target },
          { id: 'simulator', label: '4. Offer Probability Simulator', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className="btn btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 12.5,
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: 12,
                cursor: 'pointer',
                background: isActive ? 'var(--accent)' : 'var(--card)',
                color: isActive ? '#ffffff' : 'var(--t2)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: The 4 Leaks Sabotaging You ── */}
      {activeSubTab === 'diagnosis' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
          {/* Leak 1 */}
          <div className="card" style={{ padding: 22, borderRadius: 18, border: '1.5px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: '#fef2f2', color: '#ef4444' }}>
                CRITICAL LEAK #1
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#ef4444' }}>−14% Callback Loss</span>
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', margin: '0 0 6px 0' }}>
              The "Cold Portal" Application Trap
            </h4>
            <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5, margin: 0 }}>
              Applying strictly via LinkedIn "Easy Apply" or generic careers portals puts your resume into an automated pile with 300+ people. Only 1.5% of cold applications turn into phone screens.
            </p>
            <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: 'var(--page)', border: '1px solid var(--border)', fontSize: 11.5 }}>
              <strong style={{ color: 'var(--accent)' }}>Doctor's Remedy:</strong> For your top 5 target companies, find 1 engineer or alumni on LinkedIn. A warm internal referral increases your callback rate by <strong>12x (18%+)</strong>.
            </div>
          </div>

          {/* Leak 2 */}
          <div className="card" style={{ padding: 22, borderRadius: 18, border: '1.5px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: '#fffbeb', color: '#b45309' }}>
                HIGH IMPACT LEAK #2
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#f59e0b' }}>{metrics.needsNudge.length} Roles Stalled</span>
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', margin: '0 0 6px 0' }}>
              The "Zero Follow-up" Ghosting Vacuum
            </h4>
            <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5, margin: 0 }}>
              You have {metrics.needsNudge.length} applications submitted over 7 days ago with zero follow-ups. Recruiters are overwhelmed. Over 28% of interview callbacks happen solely because the candidate sent a polite nudge!
            </p>
            <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: 'var(--page)', border: '1px solid var(--border)', fontSize: 11.5 }}>
              <strong style={{ color: '#f59e0b' }}>Doctor's Remedy:</strong> Send a 3-sentence polite follow-up on Day 7 to 10. (See the template in Tab 3).
            </div>
          </div>

          {/* Leak 3 */}
          <div className="card" style={{ padding: 22, borderRadius: 18, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: 'var(--page)', color: 'var(--t2)' }}>
                EFFICIENCY LEAK #3
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)' }}>Speed Advantage</span>
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', margin: '0 0 6px 0' }}>
              Missing the "48-Hour Golden Window"
            </h4>
            <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5, margin: 0 }}>
              Job postings older than 5 days typically already have their candidate shortlist formed. Applying on day 10 means your resume is rarely opened even if you are qualified.
            </p>
            <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: 'var(--page)', border: '1px solid var(--border)', fontSize: 11.5 }}>
              <strong style={{ color: 'var(--accent)' }}>Doctor's Remedy:</strong> Set up job alerts and prioritize applying within 24 to 48 hours of a role going live.
            </div>
          </div>

          {/* Leak 4 */}
          <div className="card" style={{ padding: 22, borderRadius: 18, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: 'var(--page)', color: 'var(--t2)' }}>
                LEARNING LEAK #4
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#10b981' }}>Post-Mortem Loop</span>
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', margin: '0 0 6px 0' }}>
              Repeating Mistakes Without Post-Mortem
            </h4>
            <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5, margin: 0 }}>
              Logging 20 rejections without categorizing WHY they occurred (Resume screen vs OA vs System Design) means you aren't fixing the root bottleneck before applying to the next 50.
            </p>
            <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: 'var(--page)', border: '1px solid var(--border)', fontSize: 11.5 }}>
              <strong style={{ color: '#10b981' }}>Doctor's Remedy:</strong> Use our Post-Mortem tool (Tab 3) after every rejection to upgrade your answers.
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Today's Golden 3 Actions ── */}
      {activeSubTab === 'actions' && (
        <div
          className="card"
          style={{
            padding: 24,
            borderRadius: 18,
            border: '1px solid var(--border)',
            background: 'var(--card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                Today's Golden 3 High-Conversion Actions
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)', margin: '3px 0 0 0' }}>
                Stop feeling overwhelmed by 100+ applications. Execute these 3 high-probability steps today to spark interviews.
              </p>
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)' }}>
              {Object.values(completedActions).filter(Boolean).length} of 3 Done
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Action 1 */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 14,
                background: completedActions['act1'] ? 'var(--success-bg)' : 'var(--page)',
                border: completedActions['act1'] ? '1px solid var(--success)' : '1px solid var(--border)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="checkbox"
                checked={completedActions['act1'] || false}
                onChange={() => handleToggleAction('act1')}
                style={{ width: 18, height: 18, accentColor: 'var(--success)', marginTop: 2, cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>
                  Action 1: Send 1 Follow-Up Nudge to a Stalled Application
                </div>
                <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4, lineHeight: 1.45 }}>
                  {metrics.needsNudge.length > 0 ? (
                    <>
                      Target: <strong>{metrics.needsNudge[0].company}</strong> ({metrics.needsNudge[0].role}) — Applied {differenceInDays(new Date(), new Date(metrics.needsNudge[0].createdAt))} days ago. Send the 3-sentence polite follow-up.
                    </>
                  ) : (
                    'Review your pipeline and send a polite Day-7 follow-up message on LinkedIn.'
                  )}
                </div>
              </div>
            </div>

            {/* Action 2 */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 14,
                background: completedActions['act2'] ? 'var(--success-bg)' : 'var(--page)',
                border: completedActions['act2'] ? '1px solid var(--success)' : '1px solid var(--border)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="checkbox"
                checked={completedActions['act2'] || false}
                onChange={() => handleToggleAction('act2')}
                style={{ width: 18, height: 18, accentColor: 'var(--success)', marginTop: 2, cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>
                  Action 2: Secure 1 Warm LinkedIn Connection or Referral
                </div>
                <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4, lineHeight: 1.45 }}>
                  Pick 1 dream company from your Wishlist. Find a Software Engineer or University Alumni who works there. Send a warm 2-sentence note asking for advice on their tech stack.
                </div>
              </div>
            </div>

            {/* Action 3 */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 14,
                background: completedActions['act3'] ? 'var(--success-bg)' : 'var(--page)',
                border: completedActions['act3'] ? '1px solid var(--success)' : '1px solid var(--border)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="checkbox"
                checked={completedActions['act3'] || false}
                onChange={() => handleToggleAction('act3')}
                style={{ width: 18, height: 18, accentColor: 'var(--success)', marginTop: 2, cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>
                  Action 3: Quantify 2 Bullet Points on Your Resume with Metrics
                </div>
                <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4, lineHeight: 1.45 }}>
                  Replace passive words with real impact: Mention latency cuts (%), data scale (QPS/GB), or business revenue impact ($). Use our Live JD ATS Scanner before submitting.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: Application Post-Mortem & Fixer Tool ── */}
      {activeSubTab === 'postmortem' && (
        <div
          className="card"
          style={{
            padding: 24,
            borderRadius: 18,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                Interactive Application Post-Mortem & Fixer
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--t3)', margin: '3px 0 0 0' }}>
                Select any application to diagnose why it stalled and get an immediate tactical cure and copyable follow-up script.
              </p>
            </div>

            {/* Target Application Dropdown */}
            <select
              className="inp"
              style={{ fontSize: 12.5, fontWeight: 700, padding: '7px 14px', maxWidth: 300 }}
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
            >
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.company} — {a.role} ({a.status})
                </option>
              ))}
            </select>
          </div>

          {/* Stage Selector Pills */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t3)', marginBottom: 8, textTransform: 'uppercase' }}>
              Where did this opportunity stall?
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'ghosted', label: '1. Ghosted / Silence (>7 Days)' },
                { id: 'resume', label: '2. Resume Screen Automated Rejection' },
                { id: 'oa', label: '3. Coding Assessment (OA) Drop-off' },
                { id: 'tech', label: '4. Technical / System Design Interview' },
                { id: 'final', label: '5. Final Round / Cultural Fit' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStallStage(st.id as any)}
                  className="btn btn-sm"
                  style={{
                    background: stallStage === st.id ? 'var(--accent)' : 'var(--page)',
                    color: stallStage === st.id ? '#ffffff' : 'var(--t2)',
                    border: '1px solid var(--border)',
                    fontWeight: 700,
                    fontSize: 12,
                    padding: '7px 14px',
                    borderRadius: 10,
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Diagnostic Prescription Box */}
          <div
            style={{
              padding: 20,
              borderRadius: 14,
              background: 'var(--page)',
              border: '1px solid var(--accent)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={18} color="var(--accent)" />
                <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  Diagnosis for {selectedApp?.company || 'Opportunity'}: {stagePrescription.rootCause}
                </h4>
              </div>
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.55, margin: 0 }}>
              {stagePrescription.explanation}
            </p>

            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--card)', border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--t1)' }}>
              <strong style={{ color: 'var(--accent)' }}>Tactical Action:</strong> {stagePrescription.cure}
            </div>

            {/* Copyable Script */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t3)' }}>
                  Copyable Recovery Script:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(stagePrescription.script, 1)}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}
                >
                  {copiedScriptIndex === 1 ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copiedScriptIndex === 1 ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>

              <pre
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: 'var(--t1)',
                  background: 'var(--card)',
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                }}
              >
                {stagePrescription.script}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: Offer Probability Simulator ── */}
      {activeSubTab === 'simulator' && (
        <div
          className="card"
          style={{
            padding: 24,
            borderRadius: 18,
            border: '1px solid var(--border)',
            background: 'var(--card)',
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              "Path to Offer" Math & Conversion Simulator
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--t3)', margin: '3px 0 0 0' }}>
              Job search is an empirical numbers game. Adjust the sliders to see how adopting warm referrals and follow-ups dramatically accelerates your job offer timeline.
            </p>
          </div>

          {/* Sliders Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16, marginBottom: 20 }}>
            {/* Weekly Apps */}
            <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
                <span>Weekly Applications</span>
                <strong style={{ color: 'var(--accent)' }}>{simWeeklyApps} / week</strong>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={simWeeklyApps}
                onChange={(e) => setSimWeeklyApps(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>

            {/* Follow-up / Warm Ratio */}
            <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
                <span>Warm Outreach / Follow-up Rate</span>
                <strong style={{ color: '#10b981' }}>{simFollowUpPct}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={simFollowUpPct}
                onChange={(e) => setSimFollowUpPct(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
              />
            </div>

            {/* Interview Pass Rate */}
            <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
                <span>Interview Loop Pass Rate</span>
                <strong style={{ color: '#f59e0b' }}>{simInterviewPassRate}%</strong>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={simInterviewPassRate}
                onChange={(e) => setSimInterviewPassRate(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Projected Outcome Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
            <div style={{ padding: '16px 18px', background: 'var(--page)', borderRadius: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 700 }}>Effective Callback Rate</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981', marginTop: 4 }}>
                {simResults.effectiveCallbackRate}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>Vs 1.5% pure cold apply</div>
            </div>

            <div style={{ padding: '16px 18px', background: 'var(--page)', borderRadius: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 700 }}>Expected Monthly Interviews</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent)', marginTop: 4 }}>
                {simResults.monthlyInterviews}
              </div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>Live technical loops</div>
            </div>

            <div style={{ padding: '16px 18px', background: 'var(--page)', borderRadius: 14, border: '1.5px solid var(--accent)', textAlign: 'center' }}>
              <div style={{ fontSize: 11.5, color: 'var(--accent)', fontWeight: 800 }}>Estimated Days to Next Offer</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--t1)', marginTop: 4 }}>
                ~{simResults.expectedDays} days
              </div>
              <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, marginTop: 2 }}>
                High-probability timeline
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
