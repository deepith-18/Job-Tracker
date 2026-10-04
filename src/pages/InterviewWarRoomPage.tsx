import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Building2,
  HelpCircle,
  FileText,
  Shield,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';

const REVERSE_QUESTIONS = [
  {
    category: 'Engineering Velocity & Architecture',
    questions: [
      'How does the team balance shipping customer features against paying down architectural debt?',
      'What does your CI/CD and deployment pipeline look like? How frequently do developers push to production?',
      'What is the most demanding scalability bottleneck or infrastructure challenge your team is tackling this quarter?',
    ],
  },
  {
    category: 'Team Culture & Day-to-Day Operations',
    questions: [
      'How does the team handle on-call rotations and incident postmortems? Are runbooks and automated alerts mature?',
      'How are technical disagreements typically resolved when two senior engineers disagree on a system design?',
      'What does exceptional success look like for this position in the first 90 days?',
    ],
  },
  {
    category: 'Product Roadmap & Business Health',
    questions: [
      'How closely do engineers work with product managers and designers during the early discovery phase?',
      'What surprised you most about working at the company after you first joined?',
    ],
  },
];

export const InterviewWarRoomPage: React.FC = () => {
  const { applications } = useApplications();
  const { addToast } = useToast();

  // Selected company for interview
  const activeInterviews = applications.filter((a) => a.status === 'Interview');
  const [selectedAppId, setSelectedAppId] = useState<string>(activeInterviews[0]?.id || applications[0]?.id || '');

  const activeApp = applications.find((a) => a.id === selectedAppId);

  // Live Timer State
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine call phase based on elapsed minutes
  const currentMinutes = Math.floor(seconds / 60);
  let callPhase = 'Phase 1: Small Talk & Background';
  let phaseColor = '#3b82f6';
  let phaseAdvice = 'Warm introduction. Share your 60-second elevator pitch.';

  if (currentMinutes >= 40) {
    callPhase = 'Phase 4: Your Turn to Ask Questions';
    phaseColor = '#10b981';
    phaseAdvice = 'Switch to reverse questions. Ask high-impact questions about architecture and team velocity.';
  } else if (currentMinutes >= 25) {
    callPhase = 'Phase 3: Coding / System Architecture';
    phaseColor = '#f59e0b';
    phaseAdvice = 'Think out loud. Clarify edge cases and state constraints before writing code.';
  } else if (currentMinutes >= 5) {
    callPhase = 'Phase 2: Deep Dive & Technical Questions';
    phaseColor = '#8b5cf6';
    phaseAdvice = 'Answer using the STAR method. Focus on your specific technical contributions.';
  }

  // Scratchpad
  const [notes, setNotes] = useState('');
  const [interviewerNames, setInterviewerNames] = useState('');
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestion(text);
    addToast('Copied to Clipboard', text.slice(0, 40) + '...', 'success');
    setTimeout(() => setCopiedQuestion(null), 2000);
  };

  return (
    <AppShell>
      {/* ── Top Header ── */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shield size={24} color="var(--accent)" />
              <span>Interview War Room & Live Call HUD</span>
            </h1>
            <p className="page-sub">
              Your real-time cockpit during live video interviews: phase timer, company dossier, reverse-interview questions, and live scratchpad.
            </p>
          </div>

          {/* Company Target Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)' }}>Active Session:</span>
            <select
              className="inp"
              style={{ fontSize: 13, fontWeight: 700, padding: '7px 14px', width: 'auto' }}
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
        </div>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* ── Top Live Timer & Call Phase HUD Banner ── */}
        <div
          className="card"
          style={{
            padding: '20px 24px',
            borderRadius: 18,
            border: `2px solid ${phaseColor}`,
            background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          {/* Stopwatch Display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 42,
                fontWeight: 900,
                color: 'var(--t1)',
                letterSpacing: 2,
                lineHeight: 1,
              }}
            >
              {formatTimer(seconds)}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="btn btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: isRunning ? '#f59e0b' : '#10b981',
                  color: '#ffffff',
                  fontWeight: 800,
                  padding: '7px 14px',
                  borderRadius: 10,
                }}
              >
                {isRunning ? <Pause size={14} /> : <Play size={14} />}
                <span>{isRunning ? 'Pause Call' : 'Start Call Timer'}</span>
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setSeconds(0);
                }}
                className="btn btn-ghost btn-sm"
                style={{ padding: '7px 10px' }}
                title="Reset stopwatch"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Current Phase Guidance */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: phaseColor,
                  background: `${phaseColor}15`,
                  padding: '3px 10px',
                  borderRadius: 12,
                  border: `1px solid ${phaseColor}30`,
                }}
              >
                {callPhase}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--t1)', fontWeight: 600, marginTop: 4 }}>
              {phaseAdvice}
            </div>
          </div>
        </div>

        {/* ── Main Two-Column War Room Cockpit ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 20 }}>
          {/* Column 1: Reverse-Interviewing Questions Vault */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              className="card"
              style={{
                padding: 22,
                borderRadius: 18,
                border: '1px solid var(--border)',
                background: 'var(--card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <HelpCircle size={18} color="var(--accent)" />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  Questions to Ask Your Interviewer
                </h3>
              </div>

              <p style={{ fontSize: 12, color: 'var(--t3)', margin: '0 0 14px 0' }}>
                Click any question to instantly copy to clipboard or reference when they ask "Do you have any questions for us?":
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {REVERSE_QUESTIONS.map((cat, idx) => (
                  <div key={idx}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 6 }}>
                      {cat.category}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {cat.questions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          onClick={() => handleCopy(q)}
                          style={{
                            background: 'var(--page)',
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '1px solid var(--border)',
                            fontSize: 12.5,
                            color: 'var(--t1)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 10,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ lineHeight: 1.45 }}>{q}</span>
                          <span style={{ flexShrink: 0, fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>
                            {copiedQuestion === q ? 'Copied!' : 'Copy'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Live In-Call Notepad & Dossier */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Quick Dossier */}
            <div
              className="card"
              style={{
                padding: 22,
                borderRadius: 18,
                border: '1px solid var(--border)',
                background: 'var(--card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Building2 size={18} color="var(--accent)" />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  Target Dossier: {activeApp?.company || 'Company'}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: 'var(--page)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700 }}>Target Role</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', marginTop: 2 }}>{activeApp?.role}</div>
                </div>
                <div style={{ background: 'var(--page)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700 }}>Pipeline Stage</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>{activeApp?.status}</div>
                </div>
              </div>

              <div>
                <label className="lbl">Interviewer Name(s) & Title</label>
                <input
                  className="inp"
                  placeholder="e.g. Sarah Jenkins (Engineering Director), Alex Chen (Staff SWE)"
                  value={interviewerNames}
                  onChange={(e) => setInterviewerNames(e.target.value)}
                  style={{ fontSize: 12.5 }}
                />
              </div>
            </div>

            {/* Live Scratchpad */}
            <div
              className="card"
              style={{
                padding: 22,
                borderRadius: 18,
                border: '1px solid var(--border)',
                background: 'var(--card)',
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} color="var(--accent)" />
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                    In-Call Live Scratchpad
                  </h3>
                </div>
                {notes && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(notes);
                      addToast('Notes Copied', 'Scratchpad saved to clipboard', 'success');
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11 }}
                  >
                    Copy Notes
                  </button>
                )}
              </div>

              <textarea
                className="inp"
                rows={10}
                placeholder="Take notes during the call: technical questions asked, feedback, topics to follow up on, next step timeline..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', fontSize: 13, lineHeight: 1.55 }}
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
