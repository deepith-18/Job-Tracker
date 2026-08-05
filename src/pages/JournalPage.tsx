import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';
import { updateApplication } from '../firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'notes', label: '📝 Interview Notes' },
  { id: 'documents', label: '📁 Documents' },
  { id: 'flashcards', label: '🃏 Flashcard Prep' },
  { id: 'mock', label: '🎤 Mock Interview' },
  { id: 'mindset', label: '🧘 Mindset Studio' },
  { id: 'email', label: '✉️ Email Copilot' },
  { id: 'battlecards', label: '⚔️ Battle Cards' },
];

export const JournalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('notes');

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 0 }}>
        <h1 className="page-title">📚 Journal</h1>
        <p className="page-sub" style={{ marginBottom: 16 }}>Interview notes, documents, prep tools, and mindset resources</p>

        {/* Tab Bar */}
        <div className="page-tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`page-tab-btn${activeTab === tab.id ? ' active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content — render each inside a hidden div to preserve state */}
      <div style={{ display: activeTab === 'notes' ? 'block' : 'none' }}>
        <JournalNotesContent />
      </div>
      <div style={{ display: activeTab === 'documents' ? 'block' : 'none' }}>
        <JournalDocumentsContent />
      </div>
      <div style={{ display: activeTab === 'flashcards' ? 'block' : 'none' }}>
        <JournalFlashcardsContent />
      </div>
      <div style={{ display: activeTab === 'mock' ? 'block' : 'none' }}>
        <JournalMockContent />
      </div>
      <div style={{ display: activeTab === 'mindset' ? 'block' : 'none' }}>
        <JournalMindsetContent />
      </div>
      <div style={{ display: activeTab === 'email' ? 'block' : 'none' }}>
        <JournalEmailContent />
      </div>
      <div style={{ display: activeTab === 'battlecards' ? 'block' : 'none' }}>
        <JournalBattlecardsContent />
      </div>
    </AppShell>
  );
};

// ── NOTES TAB (Interview Journal content)
const JournalNotesContent: React.FC = () => {
  const { applications } = useApplications();
  const { addToast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [roundFilter, setRoundFilter] = useState('All');
  const [logModal, setLogModal] = useState(false);
  const [targetAppId, setTargetAppId] = useState('');
  const [roundType, setRoundType] = useState('Technical');
  const [notesInput, setNotesInput] = useState('');
  const [ratingInput, setRatingInput] = useState(4);

  const appsWithInterview = applications.filter(
    (a) => a.status === 'Interview' || a.status === 'Offer' || a.interviewNotes
  );

  const filtered = selectedCompany === 'All' ? appsWithInterview : appsWithInterview.filter((a) => a.company === selectedCompany);

  const handleSaveLog = async () => {
    if (!targetAppId || !notesInput.trim()) {
      addToast('Missing info', 'Select a company and add notes', 'error');
      return;
    }
    const app = applications.find((a) => a.id === targetAppId);
    if (!app) return;
    const newNote = `[${roundType}] ${notesInput}`;
    await updateApplication(app.id, { interviewNotes: app.interviewNotes ? `${app.interviewNotes}\n${newNote}` : newNote });
    addToast('Notes saved!', `Interview log added for ${app.company}`, 'success');
    setLogModal(false);
    setNotesInput('');
  };

  return (
    <div className="pb">
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="inp" style={{ width: 'auto', minWidth: 160 }} value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
          <option value="All">All Companies</option>
          {appsWithInterview.map((a) => <option key={a.id} value={a.company}>{a.company}</option>)}
        </select>
        <select className="inp" style={{ width: 'auto', minWidth: 140 }} value={roundFilter} onChange={(e) => setRoundFilter(e.target.value)}>
          <option value="All">All Rounds</option>
          {['Screening', 'Technical', 'System Design', 'Behavioral', 'Manager / HR'].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setLogModal(true)}>
          + Add Interview Log
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
          <div style={{ fontWeight: 700 }}>No interview logs yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Add your first interview log to track questions and takeaways</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((app) => (
            <div key={app.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  🏢
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{app.company}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 2 }}>{app.role}</div>
                  {app.interviewNotes && (
                    <div style={{ marginTop: 10, fontSize: 13, color: 'var(--t1)', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: 'var(--page)', borderRadius: 8, padding: '10px 14px' }}>
                      {app.interviewNotes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Log Modal */}
      <AnimatePresence>
        {logModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setLogModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h3 style={{ fontWeight: 800, marginBottom: 20 }}>📝 Add Interview Log</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="lbl">Company</label>
                  <select className="inp" value={targetAppId} onChange={(e) => setTargetAppId(e.target.value)}>
                    <option value="">Select company...</option>
                    {applications.map((a) => <option key={a.id} value={a.id}>{a.company} — {a.role}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Round Type</label>
                  <select className="inp" value={roundType} onChange={(e) => setRoundType(e.target.value)}>
                    {['Screening', 'Technical', 'System Design', 'Behavioral', 'Manager / HR'].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lbl">Notes & Questions</label>
                  <textarea className="inp" rows={5} value={notesInput} onChange={(e) => setNotesInput(e.target.value)} placeholder="What was asked? What went well? What to improve?" />
                </div>
                <div>
                  <label className="lbl">Self Rating: {ratingInput}/5</label>
                  <input type="range" min={1} max={5} value={ratingInput} onChange={(e) => setRatingInput(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setLogModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveLog}>Save Log</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── DOCUMENTS TAB
interface UserDocument {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  url?: string;
}

const DEFAULT_DOCS: UserDocument[] = [
  {
    id: '1',
    name: 'Software Engineer Resume v3.pdf',
    type: 'Resume',
    date: '2025-01-15',
    size: '124 KB',
    url: 'data:text/plain;charset=utf-8,' + encodeURIComponent('Sample Software Engineer Resume Content'),
  },
  {
    id: '2',
    name: 'Google Cover Letter.docx',
    type: 'Cover Letter',
    date: '2025-01-18',
    size: '48 KB',
    url: 'data:text/plain;charset=utf-8,' + encodeURIComponent('Sample Google Cover Letter Content'),
  },
  {
    id: '3',
    name: 'Portfolio Link.txt',
    type: 'Portfolio',
    date: '2025-01-10',
    size: '1 KB',
    url: 'data:text/plain;charset=utf-8,' + encodeURIComponent('https://github.com/my-portfolio'),
  },
];

const JournalDocumentsContent: React.FC = () => {
  const { addToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [docs, setDocs] = useState<UserDocument[]>(() => {
    try {
      const saved = localStorage.getItem('cos_user_documents');
      return saved ? JSON.parse(saved) : DEFAULT_DOCS;
    } catch {
      return DEFAULT_DOCS;
    }
  });

  const saveDocs = (newDocs: UserDocument[]) => {
    setDocs(newDocs);
    try {
      localStorage.setItem('cos_user_documents', JSON.stringify(newDocs));
    } catch {
      // Ignore quota error if file too large
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const sizeKb = Math.round(file.size / 1024);
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      let docType = 'Document';
      const lname = file.name.toLowerCase();
      if (lname.includes('resume') || lname.includes('cv')) docType = 'Resume';
      else if (lname.includes('cover')) docType = 'Cover Letter';
      else if (lname.includes('portfolio')) docType = 'Portfolio';

      const newDoc: UserDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: docType,
        date: new Date().toISOString().split('T')[0],
        size: sizeStr,
        url: dataUrl,
      };

      const updated = [newDoc, ...docs];
      saveDocs(updated);
      addToast(`Document Uploaded 📄`, `Saved "${file.name}" to your journal`, 'success');
      if (e.target) e.target.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleDownload = (doc: UserDocument) => {
    if (!doc.url) {
      addToast('Download Failed', 'File URL not available', 'error');
      return;
    }
    const a = document.createElement('a');
    a.href = doc.url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast('Downloading File 💾', `Downloading "${doc.name}"`, 'success');
  };

  const handleDelete = (id: string, name: string) => {
    const filtered = docs.filter((d) => d.id !== id);
    saveDocs(filtered);
    addToast('Document Deleted 🗑️', `Removed "${name}"`, 'info');
  };

  return (
    <div className="pb">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--t2)' }}>
          Manage your resumes, cover letters, and portfolio files ({docs.length} files)
        </div>
        <button onClick={handleUploadClick} className="btn btn-primary">
          + Upload Document
        </button>
      </div>

      {docs.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📁</div>
          <div style={{ fontWeight: 700 }}>No documents uploaded yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Click "+ Upload Document" to add your resume or cover letter</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {docs.map((doc) => (
            <div key={doc.id} className="card card-hover" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--accent-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {doc.type === 'Resume' ? '📄' : doc.type === 'Cover Letter' ? '✉️' : doc.type === 'Portfolio' ? '🔗' : '📁'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{doc.name}</div>
                <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>
                  {doc.type} • {doc.size} • {doc.date}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleDownload(doc)} className="btn btn-ghost btn-sm">
                  ⬇ Download
                </button>
                <button
                  onClick={() => handleDelete(doc.id, doc.name)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#ef4444' }}
                  title="Delete document"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── FLASHCARDS TAB
const JournalFlashcardsContent: React.FC = () => {
  const CARDS = [
    { q: 'What is the time complexity of QuickSort?', a: 'Average: O(n log n), Worst: O(n²) when pivot is always min/max.' },
    { q: 'Explain the difference between REST and GraphQL.', a: 'REST uses fixed endpoints per resource. GraphQL uses a single endpoint with flexible queries, reducing over-fetching.' },
    { q: 'What is a closure in JavaScript?', a: 'A closure is a function that retains access to its lexical scope even after its outer function has returned.' },
  ];
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="pb" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div
        onClick={() => setFlipped(!flipped)}
        style={{ width: '100%', maxWidth: 520, minHeight: 200, background: flipped ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#ffffff', border: '1px solid var(--border)', borderRadius: 20, padding: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: 'var(--shadow-md)', transition: 'background 0.3s ease', color: flipped ? '#fff' : 'var(--t1)' }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: 14 }}>
            {flipped ? '✅ Answer' : '❓ Question'} — {idx + 1}/{CARDS.length}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5 }}>
            {flipped ? CARDS[idx].a : CARDS[idx].q}
          </div>
          <div style={{ marginTop: 14, fontSize: 11.5, opacity: 0.5 }}>Click to flip</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => { setIdx(Math.max(0, idx - 1)); setFlipped(false); }} disabled={idx === 0}>← Prev</button>
        <button className="btn btn-primary" onClick={() => { setIdx((idx + 1) % CARDS.length); setFlipped(false); }}>Next →</button>
      </div>
    </div>
  );
};

// ── MOCK INTERVIEW TAB
const JournalMockContent: React.FC = () => {
  const [question] = useState('Tell me about a time you had to debug a difficult production issue. What was your approach and what was the outcome?');
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="pb" style={{ maxWidth: 680 }}>
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10 }}>🎤 Behavioral Question</div>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5, color: 'var(--t1)' }}>{question}</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 8 }}>Use the STAR method: Situation → Task → Action → Result</div>
      </div>
      <textarea
        className="inp"
        rows={8}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer using the STAR method..."
        style={{ marginBottom: 12 }}
      />
      <button className="btn btn-primary" onClick={() => setSubmitted(true)}>Submit Answer</button>
      {submitted && (
        <div className="card" style={{ padding: 20, marginTop: 14, background: 'var(--success-bg)', border: '1px solid #a7f3d0' }}>
          <div style={{ fontWeight: 700, color: '#065f46' }}>✅ Good effort! Tips: Lead with impact first, quantify results where possible, keep under 2 minutes when speaking aloud.</div>
        </div>
      )}
    </div>
  );
};

// ── MINDSET TAB
const JournalMindsetContent: React.FC = () => {
  const [breathingState, setBreathingState] = useState<'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Inhale (4s)');
  const [seconds, setSeconds] = useState(4);
  const [timerActive, setTimerActive] = useState(false);

  React.useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev > 1) return prev - 1;
          if (breathingState === 'Inhale (4s)') { setBreathingState('Hold (7s)'); return 7; }
          if (breathingState === 'Hold (7s)') { setBreathingState('Exhale (8s)'); return 8; }
          setBreathingState('Inhale (4s)'); return 4;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerActive, breathingState]);

  return (
    <div className="pb" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>🫁 4-7-8 Breathing Timer</div>
        <div style={{ width: 130, height: 130, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 12px 36px rgba(99,102,241,0.4)', margin: '20px 0', transition: 'transform 0.5s ease', transform: breathingState.startsWith('Inhale') ? 'scale(1.15)' : 'scale(1)' }}>
          <div style={{ fontSize: 30, fontWeight: 800 }}>{seconds}s</div>
          <div style={{ fontSize: 11, fontWeight: 700 }}>{breathingState.split(' ')[0]}</div>
        </div>
        <button onClick={() => setTimerActive(!timerActive)} className="btn btn-primary">{timerActive ? '⏸ Pause' : '▶ Start'}</button>
      </div>
      <div className="card" style={{ padding: 22 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>✅ Pre-Interview Checklist</div>
        {['Test camera & mic', 'Review 3 STAR stories', 'Prepare 2 questions to ask', 'Open IDE / scratch pad', 'Take 3 deep breaths — you belong here!'].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t1)', marginBottom: 12 }}>
            <input type="checkbox" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── EMAIL COPILOT TAB
const JournalEmailContent: React.FC = () => {
  const TEMPLATES = [
    { label: 'Follow-up After Interview', body: 'Hi [Name],\n\nThank you for the interview yesterday. I thoroughly enjoyed our conversation about [topic]. I remain very excited about this opportunity at [Company].\n\nPlease let me know if you need anything else from my side.\n\nBest regards,\n[Your Name]' },
    { label: 'Thank You Note', body: 'Hi [Name],\n\nI wanted to take a moment to thank you for your time and for the warm conversation. I am enthusiastic about the possibility of joining [Company].\n\nLooking forward to hearing from you!\n\nBest,\n[Your Name]' },
    { label: 'Status Check-in', body: 'Hi [Name],\n\nI wanted to follow up on my application for the [Role] position. I remain very interested and am curious about the next steps.\n\nThank you for your time!\n\n[Your Name]' },
  ];
  const [selected, setSelected] = useState(TEMPLATES[0]);
  const [body, setBody] = useState(TEMPLATES[0].body);

  return (
    <div className="pb" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 4 }}>Templates</div>
        {TEMPLATES.map((t) => (
          <button key={t.label} onClick={() => { setSelected(t); setBody(t.body); }} className="btn" style={{ textAlign: 'left', padding: '10px 14px', fontSize: 13, fontWeight: 600, background: selected.label === t.label ? 'var(--accent-bg)' : '#fff', color: selected.label === t.label ? 'var(--accent)' : 'var(--t2)', border: selected.label === t.label ? '1.5px solid var(--accent)' : '1px solid var(--border)', borderRadius: 10 }}>
            {t.label}
          </button>
        ))}
      </div>
      <div>
        <textarea className="inp" rows={14} value={body} onChange={(e) => setBody(e.target.value)} />
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(body)}>📋 Copy to Clipboard</button>
          <button className="btn btn-ghost" onClick={() => setBody(selected.body)}>↺ Reset</button>
        </div>
      </div>
    </div>
  );
};

// ── BATTLE CARDS TAB
const JournalBattlecardsContent: React.FC = () => {
  const CARDS = [
    { title: 'System Design: URL Shortener', tags: ['System Design', 'Backend'], points: ['Hash function (MD5/SHA256)', 'Key-value store (Redis)', 'Database sharding', 'CDN for read-heavy'], color: '#6366f1' },
    { title: 'Array: Two Sum (O(n))', tags: ['Algorithms', 'Hash Map'], points: ['Iterate array once', 'Store complement in HashMap', 'Return indices on match', 'Edge: empty array, duplicates'], color: '#8b5cf6' },
    { title: 'Tell Me About Yourself', tags: ['Behavioral', 'Opening'], points: ['Current role + impact', 'Key technical strengths', 'Why this company/role', 'End with excitement for opportunity'], color: '#f59e0b' },
  ];

  return (
    <div className="pb" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {CARDS.map((card, i) => (
        <div key={i} className="card card-hover" style={{ padding: 20, borderTop: `3px solid ${card.color}` }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--t1)', marginBottom: 10 }}>{card.title}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {card.tags.map((t) => <span key={t} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--accent-bg)', color: 'var(--accent)', fontWeight: 700 }}>{t}</span>)}
          </div>
          <ul style={{ paddingLeft: 16, fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.7 }}>
            {card.points.map((p, j) => <li key={j}>{p}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
};
