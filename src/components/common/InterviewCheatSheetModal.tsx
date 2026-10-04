import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Clipboard,
  Check,
  Printer,
  HelpCircle,
  Brain,
  MessageSquare,
  Save,
} from 'lucide-react';
import type { Application } from '../../types';
import { updateApplication } from '../../firebase/firestore';
import { useToast } from '../ui/ToastContext';

interface InterviewCheatSheetModalProps {
  app: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InterviewCheatSheetModal: React.FC<InterviewCheatSheetModalProps> = ({
  app,
  isOpen,
  onClose,
}) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (app) {
      setNotes(app.interviewNotes || app.notes || '');
    }
  }, [app]);

  if (!isOpen || !app) return null;

  const company = app.company || 'Target Company';
  const role = app.role || 'Target Position';

  const defaultQuestions = [
    `What does exceptional success look like for this ${role} position in the first 90 days?`,
    `What are the most demanding technical or product bottlenecks your team is solving this quarter?`,
    `How does the engineering team balance shipping velocity against technical debt and architectural quality?`,
    `What surprised you most about the culture and day-to-day work at ${company} after you joined?`,
    `What are the next steps in your interview process, and when can I expect to hear back?`,
  ];

  const handleCopy = () => {
    const text = `
INTERVIEW CHEAT SHEET: ${company} — ${role}
Status: ${app.status}

1. ELEVATOR PITCH BLUEPRINT:
• Present: Currently focused on building scalable, performant web systems and reliable user experiences.
• Past: Proven track record delivering robust features, reducing latency, and collaborating in agile teams.
• Future: Eager to bring my technical expertise to ${company} to help accelerate your engineering mission.

2. STAR METHOD FRAMEWORK:
• Situation: Set the context, team size, and timeline.
• Task: What was the core technical problem or goal?
• Action: Specific engineering decisions, trade-offs, and tools I chose.
• Result: Quantifiable metrics (e.g. 40% latency drop, zero downtime, shipped on time).

3. HIGH-IMPACT QUESTIONS TO ASK:
${defaultQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

4. MY NOTES:
${notes || 'No notes added yet.'}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('Cheat Sheet Copied', 'Summary copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveNotes = async () => {
    if (!app.id) return;
    setSavingNotes(true);
    try {
      await updateApplication(app.id, { interviewNotes: notes });
      addToast('Notes Saved', `Updated notes for ${company}`, 'success');
    } catch {
      addToast('Error', 'Failed to save notes to Firestore', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="modal-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="modal-card"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            maxWidth: 680,
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                }}
              >
                <Sparkles style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                    {company} — Interview Cheat Sheet
                  </h2>
                </div>
                <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600, marginTop: 2 }}>
                  {role} • Rapid Prep & Live Call Companion
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-ghost btn-sm"
                title="Copy entire cheat sheet to clipboard"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
              >
                {copied ? <Check style={{ width: 14, height: 14, color: '#10b981' }} /> : <Clipboard style={{ width: 14, height: 14 }} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-ghost btn-sm"
                title="Print or export to PDF"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
              >
                <Printer style={{ width: 14, height: 14 }} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn-ghost"
                style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}
                aria-label="Close"
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div
            style={{
              padding: '20px 24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* 1. Elevator Pitch Formula */}
            <div
              style={{
                background: 'var(--page)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Brain style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  1. "Tell Me About Yourself" (60-Sec Elevator Formula)
                </h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.6 }}>
                <li><strong>Present:</strong> "I specialize in building responsive, performant full-stack systems and intuitive user interfaces."</li>
                <li><strong>Past:</strong> "At previous projects, I architected scalable databases, automated state sync, and reduced delivery latency."</li>
                <li><strong>Future:</strong> "What drew me to <strong>{company}</strong> is your focus on engineering excellence and high-impact products."</li>
              </ul>
            </div>

            {/* 2. STAR Story Framework */}
            <div
              style={{
                background: 'var(--page)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <MessageSquare style={{ width: 16, height: 16, color: '#f59e0b' }} />
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  2. STAR Behavioral Story Checklist
                </h3>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 8,
                  fontSize: 12,
                  marginTop: 6,
                }}
              >
                <div style={{ background: 'var(--card)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <strong style={{ color: 'var(--accent)' }}>Situation:</strong> 1-2 sentences on company context & challenge.
                </div>
                <div style={{ background: 'var(--card)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <strong style={{ color: '#d97706' }}>Task:</strong> Your exact personal responsibility.
                </div>
                <div style={{ background: 'var(--card)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <strong style={{ color: '#7c3aed' }}>Action:</strong> Key engineering decisions & trade-offs you took.
                </div>
                <div style={{ background: 'var(--card)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <strong style={{ color: '#10b981' }}>Result:</strong> Quantifiable business or performance win.
                </div>
              </div>
            </div>

            {/* 3. Top 5 Intelligent Questions to Ask */}
            <div
              style={{
                background: 'var(--page)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <HelpCircle style={{ width: 16, height: 16, color: '#10b981' }} />
                <h3 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  3. Questions to Ask the Interviewer
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {defaultQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: 12.5,
                      color: 'var(--t2)',
                      background: 'var(--card)',
                      padding: '7px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>#{idx + 1}</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Live Scratchpad / Notes */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
                  Live Interview Notes & Debrief (Syncs to Firestore)
                </label>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, padding: '4px 10px' }}
                >
                  <Save style={{ width: 13, height: 13 }} />
                  <span>{savingNotes ? 'Saving…' : 'Save Notes'}</span>
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down questions asked, interviewer names, compensation notes, or feedback received during the call…"
                rows={4}
                className="inp"
                style={{ width: '100%', resize: 'vertical', fontSize: 12.5, lineHeight: 1.5 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
