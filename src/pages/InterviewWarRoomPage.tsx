import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Building2,
  HelpCircle,
  FileText,
  Shield,
  Sparkles,
  BookOpen,
  CheckSquare,
  Share2,
  X,
  Plus,
  Trash2,
  Info,
  ExternalLink,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';

const DEFAULT_REVERSE_QUESTIONS = [
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
      'What is the company’s biggest strategic differentiator against competitors over the next 18 months?',
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

  // Modals & Panels
  const [showGuide, setShowGuide] = useState(false);
  const [showStarModal, setShowStarModal] = useState(false);
  const [showPreflight, setShowPreflight] = useState(false);

  // Pre-flight flight check items
  const [flightChecks, setFlightChecks] = useState<Record<string, boolean>>({
    camera: false,
    mic: false,
    water: false,
    resume: false,
    dnd: false,
  });

  // Persistent In-Call Notes & Interviewer Names (keyed by selectedAppId)
  const [notes, setNotes] = useState('');
  const [interviewerNames, setInterviewerNames] = useState('');
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  // Load saved notes & interviewers when selectedAppId changes
  useEffect(() => {
    if (!selectedAppId) return;
    try {
      const savedNotes = localStorage.getItem(`joborbit_warroom_notes_${selectedAppId}`);
      const savedNames = localStorage.getItem(`joborbit_warroom_names_${selectedAppId}`);
      const savedCustomQ = localStorage.getItem(`joborbit_warroom_custom_q_${selectedAppId}`);
      if (savedNotes !== null) setNotes(savedNotes);
      else setNotes('');
      if (savedNames !== null) setInterviewerNames(savedNames);
      else setInterviewerNames('');
      if (savedCustomQ) setCustomQuestions(JSON.parse(savedCustomQ));
      else setCustomQuestions([]);
    } catch {
      // ignore storage errors
    }
  }, [selectedAppId]);

  // Auto-save notes
  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (selectedAppId) {
      try {
        localStorage.setItem(`joborbit_warroom_notes_${selectedAppId}`, val);
      } catch {}
    }
  };

  // Auto-save interviewer names
  const handleNamesChange = (val: string) => {
    setInterviewerNames(val);
    if (selectedAppId) {
      try {
        localStorage.setItem(`joborbit_warroom_names_${selectedAppId}`, val);
      } catch {}
    }
  };

  // Timer interval
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
  let phaseAdvice = 'Warm introduction. Share your 60-second elevator pitch. Set a collaborative tone.';

  if (currentMinutes >= 40) {
    callPhase = 'Phase 4: Your Turn to Ask Questions';
    phaseColor = '#10b981';
    phaseAdvice = 'Switch to reverse questions. Ask high-impact questions about architecture, roadmaps, and team velocity.';
  } else if (currentMinutes >= 25) {
    callPhase = 'Phase 3: Coding / System Architecture';
    phaseColor = '#f59e0b';
    phaseAdvice = 'Think out loud. Clarify scale (QPS, storage) and edge cases before jumping into solution code.';
  } else if (currentMinutes >= 5) {
    callPhase = 'Phase 2: Deep Dive & Technical Questions';
    phaseColor = '#8b5cf6';
    phaseAdvice = 'Answer using the STAR method. Keep situations to 30s, focus on your individual technical decisions.';
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestion(text);
    addToast('Copied to Clipboard', text.slice(0, 45) + '...', 'success');
    setTimeout(() => setCopiedQuestion(null), 2000);
  };

  const handleAddCustomQuestion = () => {
    if (!newQuestionText.trim()) return;
    const updated = [...customQuestions, newQuestionText.trim()];
    setCustomQuestions(updated);
    setNewQuestionText('');
    setShowAddQuestion(false);
    if (selectedAppId) {
      try {
        localStorage.setItem(`joborbit_warroom_custom_q_${selectedAppId}`, JSON.stringify(updated));
      } catch {}
    }
    addToast('Question Added', 'Custom interview question saved', 'success');
  };

  const handleDeleteCustomQuestion = (index: number) => {
    const updated = customQuestions.filter((_, i) => i !== index);
    setCustomQuestions(updated);
    if (selectedAppId) {
      try {
        localStorage.setItem(`joborbit_warroom_custom_q_${selectedAppId}`, JSON.stringify(updated));
      } catch {}
    }
  };

  // Export Call Debrief
  const handleExportDebrief = () => {
    const debrief = [
      `══════════════════════════════════════════`,
      `INTERVIEW CALL DEBRIEF & NOTES`,
      `══════════════════════════════════════════`,
      `Company: ${activeApp?.company || 'N/A'}`,
      `Target Role: ${activeApp?.role || 'N/A'}`,
      `Current Status: ${activeApp?.status || 'N/A'}`,
      `Date & Time: ${new Date().toLocaleString()}`,
      `Call Duration: ${formatTimer(seconds)} (${currentMinutes} min)`,
      `Interviewer(s): ${interviewerNames || 'Not specified'}`,
      `------------------------------------------`,
      `IN-CALL SCRATCHPAD & FOLLOW-UPS:`,
      notes || '(No notes recorded during this session)',
      `══════════════════════════════════════════`,
    ].join('\n');

    navigator.clipboard.writeText(debrief);
    addToast('Debrief Exported', 'Full interview summary copied to clipboard!', 'success');
  };

  const completedPreflightCount = Object.values(flightChecks).filter(Boolean).length;

  return (
    <AppShell>
      {/* ── Top Header ── */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px var(--accent-glow)',
                }}
              >
                <Shield size={20} />
              </div>
              <h1 className="page-title" style={{ margin: 0 }}>
                Interview War Room & Live Call HUD
              </h1>
            </div>
            <p className="page-sub" style={{ marginTop: 4 }}>
              Your real-time mission cockpit during live video interviews: phase pacing timer, company dossier, reverse-questions vault, and persistent live scratchpad.
            </p>
          </div>

          {/* Header Controls & Company Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="btn btn-ghost btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                border: '1px solid var(--border)',
                background: showGuide ? 'var(--accent-bg)' : 'var(--card)',
                color: showGuide ? 'var(--accent)' : 'var(--t2)',
                padding: '7px 12px',
                borderRadius: 10,
              }}
            >
              <Info size={14} />
              <span>{showGuide ? 'Hide Guide' : 'What is War Room?'}</span>
            </button>

            <button
              onClick={() => setShowStarModal(true)}
              className="btn btn-ghost btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--accent)',
                padding: '7px 12px',
                borderRadius: 10,
              }}
            >
              <BookOpen size={14} />
              <span>STAR Method Cheat Sheet</span>
            </button>

            <button
              onClick={() => setShowPreflight(true)}
              className="btn btn-ghost btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                border: '1px solid var(--border)',
                background: completedPreflightCount === 5 ? 'var(--success-bg)' : 'var(--card)',
                color: completedPreflightCount === 5 ? 'var(--success)' : 'var(--t2)',
                padding: '7px 12px',
                borderRadius: 10,
              }}
            >
              <CheckSquare size={14} />
              <span>Pre-Flight Check ({completedPreflightCount}/5)</span>
            </button>

            {/* Company Target Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: '100%' }}>
              <select
                className="inp"
                style={{ fontSize: 13, fontWeight: 700, padding: '7px 12px', minWidth: 200, maxWidth: 300 }}
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
              >
                {applications.length === 0 ? (
                  <option value="">No applications logged yet</option>
                ) : (
                  applications.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.company} — {a.role} ({a.status})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* ── Quick Explainer Banner (Toggleable) ── */}
        {showGuide && (
          <div
            className="card"
            style={{
              padding: '20px 24px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
              border: '1.5px solid var(--accent)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="var(--accent)" />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  What is the Interview War Room & How to Use It
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: 4, borderRadius: 8 }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.55, margin: 0 }}>
              The <strong>Interview War Room</strong> is your live <strong>Heads-Up Display (HUD)</strong> designed to be kept open on a second monitor, split-screen, or tablet during Zoom/Google Meet/Teams calls. It eliminates interview anxiety through 4 real-time pillars:
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: 12,
                marginTop: 4,
              }}
            >
              <div style={{ background: 'var(--page)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#3b82f6', marginBottom: 2 }}>1. Pace Tracker HUD</div>
                <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>
                  Visual live stopwatch cues your 4 interview phases so you never run out of time for reverse questions.
                </div>
              </div>
              <div style={{ background: 'var(--page)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#8b5cf6', marginBottom: 2 }}>2. Company Dossier</div>
                <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>
                  Instant target context: company name, job role, and interviewer names right in front of your eyes.
                </div>
              </div>
              <div style={{ background: 'var(--page)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981', marginBottom: 2 }}>3. Reverse Questions</div>
                <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>
                  Architectural, velocity, and culture questions ready to 1-click copy when they ask "Do you have any questions for us?".
                </div>
              </div>
              <div style={{ background: 'var(--page)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#f59e0b', marginBottom: 2 }}>4. Auto-Saved Scratchpad</div>
                <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>
                  Jot live notes, feedback, and constraints. Everything auto-saves to your local browser storage and can be exported in 1 click!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Top Live Timer & Call Phase HUD Banner ── */}
        <div
          className="card"
          style={{
            padding: '18px 22px',
            borderRadius: 18,
            border: `2px solid ${phaseColor}`,
            background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          {/* Stopwatch Display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 'clamp(32px, 5vw, 42px)',
                fontWeight: 900,
                color: 'var(--t1)',
                letterSpacing: 2,
                lineHeight: 1,
              }}
            >
              {formatTimer(seconds)}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
                  padding: '8px 16px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: isRunning ? '0 2px 10px rgba(245, 158, 11, 0.3)' : '0 2px 10px rgba(16, 185, 129, 0.3)',
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
                style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
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
                  padding: '3px 12px',
                  borderRadius: 12,
                  border: `1px solid ${phaseColor}35`,
                }}
              >
                {callPhase}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--t1)', fontWeight: 600, marginTop: 5 }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HelpCircle size={18} color="var(--accent)" />
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                    Reverse-Interviewing Questions
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddQuestion(!showAddQuestion)}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--accent)' }}
                >
                  <Plus size={14} />
                  <span>Add Question</span>
                </button>
              </div>

              <p style={{ fontSize: 12, color: 'var(--t3)', margin: '0 0 14px 0' }}>
                Click any question to instantly copy to clipboard when the interviewer asks: <em>"Do you have any questions for us?"</em>
              </p>

              {/* Add Custom Question Form */}
              {showAddQuestion && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: 'var(--page)',
                    border: '1px solid var(--accent)',
                    marginBottom: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <input
                    className="inp"
                    placeholder="Enter custom question to ask interviewer..."
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    style={{ fontSize: 12.5 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCustomQuestion();
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      onClick={() => setShowAddQuestion(false)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11.5 }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCustomQuestion}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: 11.5 }}
                    >
                      Save Question
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Questions List */}
              {customQuestions.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 6 }}>
                    ⭐ Your Custom Questions ({activeApp?.company || 'Company'})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {customQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--page)',
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: '1px solid var(--accent-glow)',
                          fontSize: 12.5,
                          color: 'var(--t1)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <span
                          onClick={() => handleCopy(q)}
                          style={{ cursor: 'pointer', flex: 1, lineHeight: 1.45 }}
                        >
                          {q}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <span
                            onClick={() => handleCopy(q)}
                            style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }}
                          >
                            {copiedQuestion === q ? 'Copied!' : 'Copy'}
                          </span>
                          <button
                            onClick={() => handleDeleteCustomQuestion(idx)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: 2, color: 'var(--danger)' }}
                            title="Remove"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard Question Categories */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {DEFAULT_REVERSE_QUESTIONS.map((cat, idx) => (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={18} color="var(--accent)" />
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                    Target Dossier: {activeApp?.company || 'Select Target Company'}
                  </h3>
                </div>

                {activeApp?.jobLink && (
                  <a
                    href={activeApp.jobLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--accent)', fontWeight: 700 }}
                  >
                    <span>View Posting</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
                <div style={{ background: 'var(--page)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700 }}>Target Role</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', marginTop: 2 }}>{activeApp?.role || 'Engineer'}</div>
                </div>
                <div style={{ background: 'var(--page)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700 }}>Pipeline Stage</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>{activeApp?.status || 'Active'}</div>
                </div>
              </div>

              <div>
                <label className="lbl">Interviewer Name(s) & Titles (Auto-saved)</label>
                <input
                  className="inp"
                  placeholder="e.g. Sarah Jenkins (Engineering Director), Alex Chen (Staff SWE)"
                  value={interviewerNames}
                  onChange={(e) => handleNamesChange(e.target.value)}
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
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} color="var(--accent)" />
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                    In-Call Live Scratchpad
                  </h3>
                  <span style={{ fontSize: 10.5, color: '#10b981', fontWeight: 700, background: '#10b98115', padding: '1px 6px', borderRadius: 6 }}>
                    ✓ Auto-saved
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {notes && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(notes);
                        addToast('Notes Copied', 'Scratchpad saved to clipboard', 'success');
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11.5 }}
                    >
                      Copy Notes
                    </button>
                  )}

                  <button
                    onClick={handleExportDebrief}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5 }}
                  >
                    <Share2 size={12} />
                    <span>Export Debrief</span>
                  </button>
                </div>
              </div>

              <textarea
                className="inp"
                rows={11}
                placeholder="Take notes during the call: technical questions asked, feedback, topics to follow up on, team size, tech stack details, next step timeline..."
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                style={{ width: '100%', fontSize: 13, lineHeight: 1.55, flex: 1, minHeight: 180 }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 11, color: 'var(--t3)' }}>
                <span>Stored securely in browser local storage for this application.</span>
                <span>{notes.trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STAR Method Cheat Sheet Modal ── */}
      {showStarModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setShowStarModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: 620,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 26,
              borderRadius: 20,
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BookOpen size={20} color="var(--accent)" />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  STAR Method & In-Call Recovery Guide
                </h3>
              </div>
              <button
                onClick={() => setShowStarModal(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: 4, borderRadius: 8 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* STAR Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                <div style={{ background: 'var(--page)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#3b82f6' }}>S — Situation (30 sec max)</div>
                  <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
                    Set context: company, team goal, and scale. Avoid lengthy backstories.
                  </div>
                </div>

                <div style={{ background: 'var(--page)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#8b5cf6' }}>T — Task (20 sec max)</div>
                  <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
                    Define the specific architectural bottleneck or critical deadline assigned to <strong>YOU</strong>.
                  </div>
                </div>

                <div style={{ background: 'var(--page)', padding: 12, borderRadius: 12, border: '1.5px solid var(--accent)' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)' }}>A — Action (60-90 sec) ★ Core</div>
                  <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
                    The meat of the answer. Use "I architected...", "I resolved trade-offs between A and B...", "I wrote tests for edge cases".
                  </div>
                </div>

                <div style={{ background: 'var(--page)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981' }}>R — Result (30 sec)</div>
                  <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
                    Quantifiable business metric: 42% latency cut, $80K cloud spend saved, or 99.99% uptime.
                  </div>
                </div>
              </div>

              {/* Emergency Recovery Tactics */}
              <div style={{ background: 'var(--page)', padding: 14, borderRadius: 14, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b', marginBottom: 6 }}>
                  🚨 Emergency Playbook: "What if I don't know the exact answer?"
                </div>
                <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>
                  Never guess or freeze. Use the <strong>Admit & Bridge</strong> formula:
                  <blockquote
                    style={{
                      margin: '8px 0',
                      padding: '8px 12px',
                      background: 'var(--card)',
                      borderRadius: 8,
                      borderLeft: '3px solid #f59e0b',
                      fontStyle: 'italic',
                    }}
                  >
                    "I haven't used [Specific Tool/Framework] in production yet, but based on my experience with [Related Tool], here is how I would reason through designing this..."
                  </blockquote>
                </div>
              </div>

              {/* Clarification Checklist before coding */}
              <div style={{ background: 'var(--page)', padding: 14, borderRadius: 14, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', marginBottom: 6 }}>
                  💡 Clarifying Questions to Ask Before Writing Code
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--t2)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li>Are we optimizing for lowest read latency, write throughput, or storage efficiency?</li>
                  <li>What is the expected scale (QPS, memory limits, size of input)?</li>
                  <li>Can we assume clean sanitized input, or should I account for null/empty edge cases?</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Pre-Flight Flight Check Modal ── */}
      {showPreflight && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setShowPreflight(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: 480,
              width: '100%',
              padding: 24,
              borderRadius: 20,
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckSquare size={20} color="var(--accent)" />
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  60-Second Pre-Flight Check
                </h3>
              </div>
              <button
                onClick={() => setShowPreflight(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: 4, borderRadius: 8 }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--t3)', margin: '0 0 16px 0' }}>
              Run through this quick 5-point checklist 2 minutes before your video call connects:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'camera', label: 'Camera position at eye level with front-facing soft lighting' },
                { key: 'mic', label: 'Microphone & headset verified (audio input test in settings)' },
                { key: 'water', label: 'Full glass of water within arm’s reach' },
                { key: 'resume', label: 'Resume, GitHub portfolio, and job description tabs open' },
                { key: 'dnd', label: 'Do Not Disturb active on phone, Slack, and computer notifications' },
              ].map((item) => (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: flightChecks[item.key] ? 'var(--success-bg)' : 'var(--page)',
                    border: flightChecks[item.key] ? '1px solid var(--success)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    fontSize: 12.5,
                    color: 'var(--t1)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={flightChecks[item.key] || false}
                    onChange={(e) =>
                      setFlightChecks({ ...flightChecks, [item.key]: e.target.checked })
                    }
                    style={{ width: 16, height: 16, accentColor: 'var(--success)' }}
                  />
                  <span style={{ fontWeight: flightChecks[item.key] ? 700 : 500 }}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowPreflight(false)}
                className="btn btn-primary"
                style={{ fontSize: 13, padding: '8px 18px', borderRadius: 10 }}
              >
                Ready for Call ({completedPreflightCount}/5)
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};
