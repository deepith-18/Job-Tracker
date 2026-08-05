import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';
import { updateApplication } from '../firebase/firestore';

interface InterviewLog {
  id: string;
  company: string;
  role: string;
  round: 'Screening' | 'Technical' | 'System Design' | 'Behavioral' | 'Manager / HR';
  date: string;
  questions: string[];
  notes: string;
  rating: number;
  appId: string;
}

export const InterviewJournalPage: React.FC = () => {
  const { applications, loading } = useApplications();
  const { addToast } = useToast();

  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [roundFilter, setRoundFilter] = useState<string>('All');

  // Modal states
  const [logModal, setLogModal] = useState<{ open: boolean; editLog?: InterviewLog }>({ open: false });

  // Form states
  const [targetAppId, setTargetAppId] = useState<string>('');
  const [roundType, setRoundType] = useState<InterviewLog['round']>('Technical');
  const [questionInput, setQuestionInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [ratingInput, setRatingInput] = useState(4);

  // Collect existing interview logs from applications with interview notes
  const logs: InterviewLog[] = applications
    .filter((a) => a.interviewNotes || a.status === 'Interview' || a.status === 'Offer')
    .map((app) => ({
      id: app.id,
      company: app.company,
      role: app.role,
      round: 'Technical',
      date: format(app.updatedAt || new Date(), 'yyyy-MM-dd'),
      questions: app.interviewNotes ? app.interviewNotes.split('\n').filter(Boolean) : [],
      notes: app.notes || '',
      rating: app.rating || 4,
      appId: app.id,
    }));

  const filteredLogs = logs.filter((l) => {
    if (selectedCompany !== 'All' && l.company !== selectedCompany) return false;
    if (roundFilter !== 'All' && l.round !== roundFilter) return false;
    return true;
  });

  const openAddModal = () => {
    setTargetAppId('');
    setRoundType('Technical');
    setQuestionInput('');
    setNotesInput('');
    setRatingInput(4);
    setLogModal({ open: true });
  };

  const openEditModal = (log: InterviewLog) => {
    setTargetAppId(log.appId);
    setRoundType(log.round);
    setQuestionInput(log.questions.join('\n'));
    setNotesInput(log.notes);
    setRatingInput(log.rating);
    setLogModal({ open: true, editLog: log });
  };

  const handleDeleteLog = async (log: InterviewLog) => {
    if (!window.confirm(`Are you sure you want to delete interview logs for ${log.company}?`)) return;

    try {
      await updateApplication(log.appId, { interviewNotes: '' });
      addToast('Log Deleted 🗑️', `Removed interview log for ${log.company}`, 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting log';
      addToast('Error', msg, 'error');
    }
  };

  const handleSaveInterviewLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAppId) {
      addToast('Validation Error', 'Please select an application', 'error');
      return;
    }

    const app = applications.find((a) => a.id === targetAppId);
    if (!app) return;

    const isEdit = Boolean(logModal.editLog);
    const updatedNotes = isEdit
      ? questionInput
      : app.interviewNotes
      ? `${app.interviewNotes}\n[${roundType}] ${questionInput}`
      : `[${roundType}] ${questionInput}`;

    try {
      await updateApplication(targetAppId, {
        interviewNotes: updatedNotes,
        notes: notesInput ? notesInput : app.notes,
        rating: ratingInput,
      });

      addToast(
        isEdit ? 'Interview Log Updated ✏️' : 'Interview Logged 🎙️',
        `Saved entry for ${app.company}`,
        'success'
      );
      setLogModal({ open: false });
      setQuestionInput('');
      setNotesInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving log';
      addToast('Error', msg, 'error');
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <svg width={36} height={36} viewBox="0 0 24 24" fill="none" className="animate-spin-os">
            <circle cx="12" cy="12" r="10" stroke="#e0e7ff" strokeWidth={2.5} />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />
          </svg>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Page Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">🎙️ Interview Journal</h1>
            <p className="page-sub">
              Log, edit, and manage technical interview questions and prep notes across your pipeline
            </p>
          </div>

          <button onClick={openAddModal} className="btn btn-primary" style={{ borderRadius: 12, fontSize: 13 }}>
            + Log Interview Round
          </button>
        </div>
      </div>

      <div className="pb">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <label className="lbl">Company</label>
            <select
              className="inp"
              style={{ width: 'auto', padding: '6px 12px', fontSize: 12.5 }}
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="All">All Companies</option>
              {Array.from(new Set(applications.map((a) => a.company))).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="lbl">Round Type</label>
            <select
              className="inp"
              style={{ width: 'auto', padding: '6px 12px', fontSize: 12.5 }}
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
            >
              <option value="All">All Rounds</option>
              <option value="Screening">Screening</option>
              <option value="Technical">Technical DSA</option>
              <option value="System Design">System Design</option>
              <option value="Behavioral">Behavioral</option>
              <option value="Manager / HR">Manager / HR</option>
            </select>
          </div>
        </div>

        {/* Logs Feed */}
        {filteredLogs.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px dashed var(--border)',
              borderRadius: 20,
              padding: '64px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)' }}>No interview logs yet</h3>
            <p style={{ fontSize: 13.5, color: 'var(--t2)', maxWidth: 360, margin: '6px auto 20px' }}>
              Log interview questions and feedback as you progress through technical screenings.
            </p>
            <button onClick={openAddModal} className="btn btn-primary btn-sm">
              Log First Interview
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'linear-gradient(145deg, #ffffff, #fafbff)',
                  border: '1px solid var(--border)',
                  borderRadius: 18,
                  padding: 20,
                  boxShadow: 'var(--shadow)',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>{log.company}</h3>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>{log.role}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--accent)',
                        background: 'var(--accent-bg)',
                        padding: '3px 8px',
                        borderRadius: 12,
                      }}
                    >
                      {log.round}
                    </span>

                    {/* Edit & Delete Actions */}
                    <button
                      onClick={() => openEditModal(log)}
                      title="Edit Log"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        padding: '2px 4px',
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log)}
                      title="Delete Log"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        padding: '2px 4px',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {log.questions.length > 0 && (
                  <div style={{ marginTop: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 6 }}>
                      Questions & Topics Logged:
                    </div>
                    <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--t1)', lineHeight: 1.5 }}>
                      {log.questions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {log.notes && (
                  <div style={{ fontSize: 12.5, color: 'var(--t2)', background: '#f8fafc', padding: 10, borderRadius: 10, marginTop: 8 }}>
                    <strong>Prep Notes:</strong> {log.notes}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 11.5, color: 'var(--t3)' }}>
                  <span>Logged {log.date}</span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>★ {log.rating}/5 Confidence</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for adding/editing log */}
      <AnimatePresence>
        {logModal.open && (
          <div className="modal-backdrop" onClick={() => setLogModal({ open: false })}>
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 520, padding: 26 }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
                {logModal.editLog ? '✏️ Edit Interview Log' : '🎙️ Log Interview Round'}
              </h2>

              <form onSubmit={handleSaveInterviewLog} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="lbl">Target Application</label>
                  <select
                    className="inp"
                    value={targetAppId}
                    onChange={(e) => setTargetAppId(e.target.value)}
                    disabled={Boolean(logModal.editLog)}
                    required
                  >
                    <option value="">Select Application...</option>
                    {applications.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.company} — {a.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="lbl">Round Type</label>
                  <select
                    className="inp"
                    value={roundType}
                    onChange={(e) => setRoundType(e.target.value as InterviewLog['round'])}
                  >
                    <option value="Screening">Recruiter Screening</option>
                    <option value="Technical">Technical DSA / Live Coding</option>
                    <option value="System Design">System Design & Architecture</option>
                    <option value="Behavioral">Behavioral & Past Projects</option>
                    <option value="Manager / HR">Hiring Manager / HR</option>
                  </select>
                </div>

                <div>
                  <label className="lbl">Questions / Problem Statements Asked</label>
                  <textarea
                    className="inp"
                    rows={3}
                    placeholder="e.g. Reverse Linked List, Design Rate Limiter..."
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="lbl">Confidence Rating (1-5)</label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={ratingInput}
                    onChange={(e) => setRatingInput(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <div style={{ textAlign: 'right', fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>
                    {ratingInput} / 5 Stars
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button type="button" onClick={() => setLogModal({ open: false })} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {logModal.editLog ? 'Save Changes' : 'Save Interview Log'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
};
