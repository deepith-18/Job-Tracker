import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Folder,
  Layers,
  Mic,
  Activity,
  Mail,
  Shield,
  Trash2,
  CheckCircle2,
  Clipboard,
  Eye,
  Download,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Search,
  Shuffle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  Send,
  Building2,
  Sparkles,
  Code2,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';
import { useDocuments } from '../hooks/useDocuments';
import { useToast } from '../components/ui/ToastContext';
import { updateApplication } from '../firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { CodeQuestionVault } from '../components/journal/CodeQuestionVault';

// ── TABS (Vector Lucide icons, no emojis) ──
const TABS = [
  { id: 'notes', label: 'Interview Notes', icon: FileText },
  { id: 'code-vault', label: 'Code & Questions', icon: Code2 },
  { id: 'documents', label: 'Document Vault', icon: Folder },
  { id: 'flashcards', label: 'Flashcard Studio', icon: Layers },
  { id: 'mock', label: 'Mock Simulator', icon: Mic },
  { id: 'battlecards', label: 'Battle Cards', icon: Shield },
  { id: 'email', label: 'Email Copilot', icon: Mail },
  { id: 'mindset', label: 'Focus & Checklist', icon: Activity },
];

export const JournalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('notes');
  const [codeVaultFilter, setCodeVaultFilter] = useState('All');

  const handleOpenCodeVault = (company?: string) => {
    if (company) setCodeVaultFilter(company);
    setActiveTab('code-vault');
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 0 }}>
        <h1 className="page-title">Interview Journal & Prep Hub</h1>
        <p className="page-sub" style={{ marginBottom: 16 }}>
          Comprehensive interview notes, code & questions vault, document repository, interactive flashcards, mock simulators, and outreach copilot.
        </p>

        {/* Tab Bar */}
        <div className="page-tab-bar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`page-tab-btn${isActive ? ' active' : ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon style={{ width: 15, height: 15 }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panels */}
      <div style={{ display: activeTab === 'notes' ? 'block' : 'none' }}>
        <JournalNotesContent onOpenCodeVault={handleOpenCodeVault} />
      </div>
      <div style={{ display: activeTab === 'code-vault' ? 'block' : 'none' }}>
        <CodeQuestionVault initialCompanyFilter={codeVaultFilter} />
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
      <div style={{ display: activeTab === 'battlecards' ? 'block' : 'none' }}>
        <JournalBattlecardsContent />
      </div>
      <div style={{ display: activeTab === 'email' ? 'block' : 'none' }}>
        <JournalEmailContent />
      </div>
      <div style={{ display: activeTab === 'mindset' ? 'block' : 'none' }}>
        <JournalMindsetContent />
      </div>
    </AppShell>
  );
};

// ═══════════════════════════════════════════════════════════════
// 1. NOTES TAB (Interview Journal Content with Firestore)
// ═══════════════════════════════════════════════════════════════
const JournalNotesContent: React.FC<{ onOpenCodeVault?: (company?: string) => void }> = ({
  onOpenCodeVault,
}) => {
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

  const filtered = selectedCompany === 'All'
    ? appsWithInterview
    : appsWithInterview.filter((a) => a.company === selectedCompany);

  const handleSaveLog = async () => {
    if (!targetAppId || !notesInput.trim()) {
      addToast('Missing Information', 'Select a company and add interview notes', 'error');
      return;
    }
    const app = applications.find((a) => a.id === targetAppId);
    if (!app) return;
    const newNote = `[${roundType} - ${ratingInput}/5] ${notesInput}`;
    await updateApplication(app.id, {
      interviewNotes: app.interviewNotes ? `${app.interviewNotes}\n\n${newNote}` : newNote,
    });
    addToast('Notes Saved', `Interview log added for ${app.company}`, 'success');
    setLogModal(false);
    setNotesInput('');
  };

  return (
    <div className="pb">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <select
          className="inp"
          style={{ width: 'auto', minWidth: 180 }}
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
        >
          <option value="All">All Companies ({appsWithInterview.length})</option>
          {appsWithInterview.map((a) => (
            <option key={a.id} value={a.company}>{a.company}</option>
          ))}
        </select>
        <select
          className="inp"
          style={{ width: 'auto', minWidth: 150 }}
          value={roundFilter}
          onChange={(e) => setRoundFilter(e.target.value)}
        >
          <option value="All">All Rounds</option>
          {['Screening', 'Technical', 'System Design', 'Behavioral', 'Manager / HR'].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button
          className="btn btn-ghost"
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid var(--border)',
          }}
          onClick={() => onOpenCodeVault?.(selectedCompany !== 'All' ? selectedCompany : undefined)}
        >
          <Code2 style={{ width: 15, height: 15, color: 'var(--accent)' }} />
          <span>Code & Questions Vault</span>
        </button>
        <button
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => setLogModal(true)}
        >
          <Plus style={{ width: 15, height: 15 }} />
          <span>Add Interview Log</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--t3)' }}>
          <FileText style={{ width: 36, height: 36, margin: '0 auto 12px', opacity: 0.5 }} />
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>No interview logs recorded</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            Document questions, key technical takeaways, and feedback from your interview rounds.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((app) => (
            <div key={app.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: 'var(--accent-bg)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {app.company.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{app.company}</div>
                    <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>{app.status}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 2 }}>{app.role}</div>
                  {app.interviewNotes ? (
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 13,
                        color: 'var(--t1)',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        background: 'var(--page)',
                        borderRadius: 10,
                        padding: '12px 16px',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {app.interviewNotes}
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--t3)', fontStyle: 'italic' }}>
                      No interview notes logged yet.
                    </div>
                  )}

                  <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => onOpenCodeVault?.(app.company)}
                      className="btn btn-ghost"
                      style={{
                        fontSize: 12,
                        padding: '5px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        border: '1px solid var(--border)',
                        background: 'var(--card-hover)',
                        borderRadius: 8,
                      }}
                    >
                      <Code2 style={{ width: 13, height: 13, color: 'var(--accent)' }} />
                      <span>View & Store Code Questions for {app.company}</span>
                    </button>
                  </div>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15,23,42,0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setLogModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 28,
                width: '100%',
                maxWidth: 520,
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                <span>Add Interview Round Log</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="lbl">Target Application</label>
                  <select
                    className="inp"
                    value={targetAppId}
                    onChange={(e) => setTargetAppId(e.target.value)}
                  >
                    <option value="">Select company and role...</option>
                    {applications.map((a) => (
                      <option key={a.id} value={a.id}>{a.company} — {a.role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lbl">Round Type</label>
                  <select className="inp" value={roundType} onChange={(e) => setRoundType(e.target.value)}>
                    {['Screening', 'Technical & Coding', 'System Design', 'Behavioral & Leadership', 'Hiring Manager'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lbl">Notes & Questions Asked</label>
                  <textarea
                    className="inp"
                    rows={5}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Specific questions asked, architecture topics, code problem constraints, interviewers' feedback..."
                  />
                </div>
                <div>
                  <label className="lbl">Confidence Rating: {ratingInput}/5</label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={ratingInput}
                    onChange={(e) => setRatingInput(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
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

// ═══════════════════════════════════════════════════════════════
// 2. DOCUMENTS VAULT (Clean Vector Icons & Management)
// ═══════════════════════════════════════════════════════════════
const JournalDocumentsContent: React.FC = () => {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { documents, loading, addDocument, removeDocument } = useDocuments();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const sizeKb = Math.round(file.size / 1024);
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      let docType = 'Document';
      const lname = file.name.toLowerCase();
      if (lname.includes('resume') || lname.includes('cv')) docType = 'Resume';
      else if (lname.includes('cover')) docType = 'Cover Letter';
      else if (lname.includes('portfolio')) docType = 'Portfolio';

      try {
        await addDocument({
          name: file.name,
          type: docType,
          date: new Date().toISOString().split('T')[0],
          size: sizeStr,
          url: dataUrl,
        });
        addToast(`Document Uploaded`, `Saved "${file.name}" to your vault`, 'success');
      } catch {
        addToast('Upload Error', 'Failed to save document to storage', 'error');
      }
      if (e.target) e.target.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleDownload = (doc: { name: string; url?: string }) => {
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
    addToast('Downloading File', `Downloading "${doc.name}"`, 'success');
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await removeDocument(id);
      addToast('Document Deleted', `Removed "${name}"`, 'info');
    } catch {
      addToast('Delete Error', 'Failed to delete document', 'error');
    }
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
          Manage resumes, cover letters, and technical portfolios ({documents.length} files)
        </div>
        <button
          onClick={handleUploadClick}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          <span>Upload Document</span>
        </button>
      </div>

      {documents.length === 0 && !loading ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--t3)' }}>
          <Folder style={{ width: 36, height: 36, margin: '0 auto 12px', opacity: 0.5 }} />
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>Vault is empty</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Upload your resumes and cover letters for easy reference during applications.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="card card-hover"
              style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--accent-bg)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText style={{ width: 22, height: 22 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{doc.name}</div>
                <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>
                  {doc.type} • {doc.size} • {doc.date}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    if (doc.url) window.open(doc.url, '_blank');
                  }}
                  className="btn btn-ghost btn-sm"
                  title="View document"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <Eye style={{ width: 14, height: 14 }} />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="btn btn-ghost btn-sm"
                  title="Download file"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <Download style={{ width: 14, height: 14 }} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleDelete(doc.id, doc.name)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#ef4444' }}
                  title="Delete document"
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 3. FLASHCARD STUDIO (Interactive, Mastery Tracking, Custom Cards)
// ═══════════════════════════════════════════════════════════════
interface Flashcard {
  id: string;
  category: 'System Design' | 'Algorithms' | 'Web & React' | 'Behavioral';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  answer: string;
  keyPoints?: string[];
}

const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    category: 'System Design',
    difficulty: 'Medium',
    question: 'What is the CAP Theorem and how does it guide distributed system design?',
    answer: 'The CAP theorem states that a distributed data store can only simultaneously guarantee at most two out of three guarantees: Consistency (every read receives the most recent write or an error), Availability (every request receives a non-error response without guarantee of latest write), and Partition Tolerance (the system continues to operate despite arbitrary network message loss). Since network partitions are inevitable in distributed systems, one must trade off Consistency (CP) vs Availability (AP).',
  },
  {
    id: 'fc-2',
    category: 'System Design',
    difficulty: 'Hard',
    question: 'How do you design an efficient Cache Invalidation strategy?',
    answer: 'Common patterns include:\n1. Cache-Aside: Application reads from cache; if miss, reads DB and populates cache. Writes invalidate or update cache.\n2. Write-Through: Cache is updated synchronously with DB write.\n3. Write-Behind (Write-Back): Data written to cache first and asynchronously flushed to DB.\n4. TTL (Time-to-Live): Expiration timestamps prevent stale data from lingering permanently.',
  },
  {
    id: 'fc-3',
    category: 'Algorithms',
    difficulty: 'Medium',
    question: 'When is QuickSort preferred over MergeSort, and vice versa?',
    answer: 'QuickSort is in-place (O(1) auxiliary space) and has excellent cache locality, making it practically faster on arrays in RAM, though worst-case is O(n²). MergeSort is guaranteed O(n log n) in all cases and is stable, but requires O(n) auxiliary memory. MergeSort is preferred for linked lists and external disk sorting.',
  },
  {
    id: 'fc-4',
    category: 'Web & React',
    difficulty: 'Medium',
    question: 'What is the difference between useMemo and useCallback in React?',
    answer: 'useMemo caches the result of a calculated function call (a computed value) between re-renders when dependencies have not changed. useCallback caches the function definition itself between renders, preventing unnecessary child re-renders when passing callbacks to memoized children (React.memo).',
  },
  {
    id: 'fc-5',
    category: 'Web & React',
    difficulty: 'Hard',
    question: 'Explain the JavaScript Event Loop: Microtasks vs Macrotasks.',
    answer: 'The call stack executes synchronous code first. When clear, the Event Loop processes the Microtask Queue (Promises, queueMicrotask, MutationObserver) until completely exhausted. Next, it picks one task from the Macrotask/Task Queue (setTimeout, setInterval, I/O, UI events), then renders the frame if needed, and repeats.',
  },
  {
    id: 'fc-6',
    category: 'Behavioral',
    difficulty: 'Easy',
    question: 'How should you structure an answer to "Tell me about a production failure you resolved"?',
    answer: 'Use the STAR method:\n- Situation: High-impact outage, context, and immediate user impact.\n- Task: Your specific ownership in identifying root cause.\n- Action: Triage, mitigation (rollback/hotfix), post-mortem communication.\n- Result: Reduced MTTR, permanent monitor/regression test added, and organizational takeaway.',
  },
  {
    id: 'fc-7',
    category: 'Algorithms',
    difficulty: 'Easy',
    question: 'What is the Two-Pointer pattern and when is it applicable?',
    answer: 'Two pointers traverse a sequence from different directions (e.g. left and right ends of a sorted array) or at different speeds (slow/fast pointers for cycle detection). It reduces quadratic O(n²) time complexity down to linear O(n) without auxiliary memory.',
  },
];

const JournalFlashcardsContent: React.FC = () => {
  const { addToast } = useToast();
  const [cards, setCards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('career_flashcards');
    return saved ? JSON.parse(saved) : DEFAULT_FLASHCARDS;
  });

  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('career_flashcards_mastered');
    return saved ? JSON.parse(saved) : [];
  });

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New card form state
  const [newCategory, setNewCategory] = useState<Flashcard['category']>('System Design');
  const [newDifficulty, setNewDifficulty] = useState<Flashcard['difficulty']>('Medium');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Persist cards & mastery
  useEffect(() => {
    localStorage.setItem('career_flashcards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('career_flashcards_mastered', JSON.stringify(masteredIds));
  }, [masteredIds]);

  const filteredCards = categoryFilter === 'All'
    ? cards
    : cards.filter((c) => c.category === categoryFilter);

  const safeIndex = Math.min(currentIndex, Math.max(0, filteredCards.length - 1));
  const activeCard = filteredCards[safeIndex];
  const isMastered = activeCard ? masteredIds.includes(activeCard.id) : false;

  const handleToggleMastery = () => {
    if (!activeCard) return;
    if (isMastered) {
      setMasteredIds((prev) => prev.filter((id) => id !== activeCard.id));
      addToast('Marked for Review', 'Card returned to active study pool', 'info');
    } else {
      setMasteredIds((prev) => [...prev, activeCard.id]);
      addToast('Card Mastered', 'Marked as mastered', 'success');
    }
  };

  const handleShuffle = () => {
    if (filteredCards.length <= 1) return;
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    addToast('Deck Shuffled', 'Randomized card order', 'info');
  };

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    setIsFlipped(false);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    setIsFlipped(false);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) {
      addToast('Validation Error', 'Question and answer cannot be blank', 'error');
      return;
    }
    const created: Flashcard = {
      id: `custom-${Date.now()}`,
      category: newCategory,
      difficulty: newDifficulty,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
    };
    setCards([created, ...cards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowAddModal(false);
    setNewQuestion('');
    setNewAnswer('');
    addToast('Flashcard Created', 'Custom card added to your deck', 'success');
  };

  const handleDeleteCurrent = () => {
    if (!activeCard) return;
    setCards((prev) => prev.filter((c) => c.id !== activeCard.id));
    setMasteredIds((prev) => prev.filter((id) => id !== activeCard.id));
    setIsFlipped(false);
    addToast('Card Deleted', 'Removed from flashcards', 'info');
  };

  const masteredCount = cards.filter((c) => masteredIds.includes(c.id)).length;
  const progressPercent = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;

  return (
    <div className="pb" style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* Top Controls & Category Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', 'System Design', 'Algorithms', 'Web & React', 'Behavioral'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: 600,
                border: categoryFilter === cat ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: categoryFilter === cat ? 'var(--accent-bg)' : 'var(--card)',
                color: categoryFilter === cat ? 'var(--accent)' : 'var(--t2)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleShuffle}
            className="btn btn-ghost btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            title="Shuffle active deck"
          >
            <Shuffle style={{ width: 14, height: 14 }} />
            <span>Shuffle</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Progress Bar & Mastery Stats */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
            <span>Mastery Progress</span>
            <span style={{ color: 'var(--accent)' }}>{masteredCount} of {cards.length} mastered ({progressPercent}%)</span>
          </div>
          <div style={{ width: '100%', height: 6, background: 'var(--border-light)', borderRadius: 10, overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent), var(--success))',
                borderRadius: 10,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Active Flashcard Display */}
      {filteredCards.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--t3)' }}>
          <Layers style={{ width: 36, height: 36, margin: '0 auto 12px', opacity: 0.5 }} />
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>No cards in this category</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Click "+ Add Card" to create your own technical question.</div>
        </div>
      ) : activeCard ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {/* 3D Flashcard */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              width: '100%',
              minHeight: 280,
              background: isFlipped ? 'var(--card-hover)' : 'var(--card)',
              border: isMastered ? '2px solid #10b981' : isFlipped ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              borderRadius: 20,
              padding: '32px 36px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: isFlipped ? '0 12px 32px rgba(99,102,241,0.08)' : 'var(--shadow-md)',
              transition: 'all 0.2s ease',
              position: 'relative',
              userSelect: 'none',
            }}
          >
            {/* Top Bar inside card */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 14,
                    background: 'var(--accent-bg)',
                    color: 'var(--accent)',
                  }}
                >
                  {activeCard.category}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 14,
                    background:
                      activeCard.difficulty === 'Easy' ? '#ecfdf5' : activeCard.difficulty === 'Medium' ? '#fffbeb' : '#fef2f2',
                    color:
                      activeCard.difficulty === 'Easy' ? '#065f46' : activeCard.difficulty === 'Medium' ? '#b45309' : '#991b1b',
                  }}
                >
                  {activeCard.difficulty}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isMastered && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#065f46',
                      background: '#ecfdf5',
                      padding: '3px 8px',
                      borderRadius: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <CheckCircle2 style={{ width: 12, height: 12 }} />
                    <span>Mastered</span>
                  </span>
                )}
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)' }}>
                  {safeIndex + 1} / {filteredCards.length}
                </span>
              </div>
            </div>

            {/* Question / Answer Core */}
            <div style={{ margin: '24px 0', textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isFlipped ? 'var(--accent)' : 'var(--t3)',
                  marginBottom: 12,
                }}
              >
                {isFlipped ? 'Answer & Explanation' : 'Question'}
              </div>
              <div
                style={{
                  fontSize: isFlipped ? 15 : 18,
                  fontWeight: isFlipped ? 500 : 700,
                  lineHeight: 1.6,
                  color: 'var(--t1)',
                  whiteSpace: 'pre-wrap',
                  textAlign: isFlipped ? 'left' : 'center',
                }}
              >
                {isFlipped ? activeCard.answer : activeCard.question}
              </div>
            </div>

            {/* Card Footer prompt */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--t3)' }}>
              <span>Click card to {isFlipped ? 'view question' : 'reveal answer'}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCurrent();
                }}
                className="btn btn-ghost btn-sm"
                style={{ color: '#ef4444', padding: '2px 6px' }}
                title="Delete this card"
              >
                <Trash2 style={{ width: 13, height: 13 }} />
              </button>
            </div>
          </div>

          {/* Card Navigation & Mastery Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
            <button
              className="btn btn-ghost"
              onClick={handlePrev}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <ChevronLeft style={{ width: 16, height: 16 }} />
              <span>Previous</span>
            </button>

            <button
              onClick={handleToggleMastery}
              className={`btn ${isMastered ? 'btn-ghost' : 'btn-primary'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                borderColor: isMastered ? '#10b981' : undefined,
                color: isMastered ? '#065f46' : undefined,
              }}
            >
              <CheckCircle2 style={{ width: 15, height: 15 }} />
              <span>{isMastered ? 'Mark for Review' : 'Mark as Mastered'}</span>
            </button>

            <button
              className="btn btn-ghost"
              onClick={handleNext}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <span>Next</span>
              <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      ) : null}

      {/* Add Custom Card Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15,23,42,0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 28,
                width: '100%',
                maxWidth: 540,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                <span>Create Custom Flashcard</span>
              </h3>
              <form onSubmit={handleCreateCard} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="lbl">Category</label>
                    <select
                      className="inp"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as Flashcard['category'])}
                    >
                      <option value="System Design">System Design</option>
                      <option value="Algorithms">Algorithms</option>
                      <option value="Web & React">Web & React</option>
                      <option value="Behavioral">Behavioral</option>
                    </select>
                  </div>
                  <div>
                    <label className="lbl">Difficulty</label>
                    <select
                      className="inp"
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value as Flashcard['difficulty'])}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="lbl">Question / Prompt *</label>
                  <input
                    className="inp"
                    placeholder="e.g. How does optimistic UI updating work in React?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="lbl">Answer & Key Technical Concepts *</label>
                  <textarea
                    className="inp"
                    rows={4}
                    placeholder="Key definitions, trade-offs, time/space complexity, or bullet points..."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Flashcard
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 4. MOCK INTERVIEW SIMULATOR (STAR Method, Stopwatch, Session Log)
// ═══════════════════════════════════════════════════════════════
interface MockQuestion {
  id: string;
  track: 'Behavioral' | 'System Design' | 'Architecture & Web' | 'Culture & Leadership';
  prompt: string;
  frameworkTip: string;
}

const MOCK_QUESTIONS: MockQuestion[] = [
  {
    id: 'mq-1',
    track: 'Behavioral',
    prompt: 'Tell me about a time you strongly disagreed with a technical decision made by a team member or manager. How did you handle it and what was the outcome?',
    frameworkTip: 'Focus on constructive reasoning with data, maintaining team rapport, and either reaching consensus or disagreeing and committing.',
  },
  {
    id: 'mq-2',
    track: 'Behavioral',
    prompt: 'Describe a high-priority production bug or outage you resolved under tight time constraints. Walk me through your diagnostics and resolution.',
    frameworkTip: 'State the business impact first. Highlight your isolation strategy, rollback decision, customer communication, and preventative measures.',
  },
  {
    id: 'mq-3',
    track: 'System Design',
    prompt: 'How would you design a real-time notification system supporting millions of concurrent active users with high deliverability?',
    frameworkTip: 'Clarify throughput & latency requirements. Address WebSocket connection management, message queue fan-out (Kafka/RabbitMQ), and fallback channels.',
  },
  {
    id: 'mq-4',
    track: 'Architecture & Web',
    prompt: 'Explain how you identify and eliminate web performance bottlenecks (Core Web Vitals, main thread blocking, and network payload reduction).',
    frameworkTip: 'Mention DevTools profiling, Lighthouse, bundle code splitting, critical rendering path optimization, and image lazy loading.',
  },
  {
    id: 'mq-5',
    track: 'Culture & Leadership',
    prompt: 'Why are you interested in this specific role and organization at this point in your career?',
    frameworkTip: 'Connect your recent technical accomplishments directly to the companys product roadmap and architectural challenges.',
  },
];

interface PracticeSession {
  id: string;
  date: string;
  question: string;
  track: string;
  durationSeconds: number;
  mode: 'star' | 'freeform';
  answerText: string;
  selfRating: number;
}

const JournalMockContent: React.FC = () => {
  const { addToast } = useToast();
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [answerMode, setAnswerMode] = useState<'star' | 'freeform'>('star');

  // STAR state
  const [starS, setStarS] = useState('');
  const [starT, setStarT] = useState('');
  const [starA, setStarA] = useState('');
  const [starR, setStarR] = useState('');

  // Freeform state
  const [freeformAnswer, setFreeformAnswer] = useState('');
  const [selfRating, setSelfRating] = useState(4);

  // Stopwatch state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Saved practice history
  const [practiceHistory, setPracticeHistory] = useState<PracticeSession[]>(() => {
    const saved = localStorage.getItem('career_mock_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('career_mock_history', JSON.stringify(practiceHistory));
  }, [practiceHistory]);

  // Stopwatch interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const filteredQuestions = selectedTrack === 'All'
    ? MOCK_QUESTIONS
    : MOCK_QUESTIONS.filter((q) => q.track === selectedTrack);

  const currentQ = filteredQuestions[activeQIndex] || filteredQuestions[0];

  const handleRandomize = () => {
    if (filteredQuestions.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * filteredQuestions.length);
    if (nextIdx === activeQIndex) nextIdx = (nextIdx + 1) % filteredQuestions.length;
    setActiveQIndex(nextIdx);
    setTimerSeconds(0);
    setTimerRunning(false);
  };

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSavePractice = () => {
    const combinedAnswer = answerMode === 'star'
      ? `Situation: ${starS}\nTask: ${starT}\nAction: ${starA}\nResult: ${starR}`
      : freeformAnswer;

    if (!combinedAnswer.trim() || combinedAnswer.replace(/Situation:|Task:|Action:|Result:/g, '').trim().length < 10) {
      addToast('Incomplete Answer', 'Please write out your response before saving', 'error');
      return;
    }

    const session: PracticeSession = {
      id: `session-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      question: currentQ.prompt,
      track: currentQ.track,
      durationSeconds: timerSeconds,
      mode: answerMode,
      answerText: combinedAnswer,
      selfRating,
    };

    setPracticeHistory([session, ...practiceHistory]);
    setTimerRunning(false);
    addToast('Practice Session Saved', 'Added to your practice history log', 'success');
  };

  const handleDeleteSession = (id: string) => {
    setPracticeHistory((prev) => prev.filter((s) => s.id !== id));
    addToast('Log Removed', 'Deleted practice session', 'info');
  };

  return (
    <div className="pb" style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* Top Controls: Track selection & Randomizer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', 'Behavioral', 'System Design', 'Architecture & Web', 'Culture & Leadership'].map((tr) => (
            <button
              key={tr}
              onClick={() => {
                setSelectedTrack(tr);
                setActiveQIndex(0);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: 600,
                border: selectedTrack === tr ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: selectedTrack === tr ? 'var(--accent-bg)' : 'var(--card)',
                color: selectedTrack === tr ? 'var(--accent)' : 'var(--t2)',
                cursor: 'pointer',
              }}
            >
              {tr}
            </button>
          ))}
        </div>

        <button
          onClick={handleRandomize}
          className="btn btn-ghost btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Shuffle style={{ width: 14, height: 14 }} />
          <span>New Random Question</span>
        </button>
      </div>

      {/* Prompt Display Card */}
      {currentQ && (
        <div className="card" style={{ padding: 24, marginBottom: 20, borderLeft: '4px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {currentQ.track} Track
            </span>
            <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>
              Question {activeQIndex + 1} of {filteredQuestions.length}
            </span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.5, color: 'var(--t1)', marginBottom: 12 }}>
            {currentQ.prompt}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: 'var(--t2)',
              background: 'var(--page)',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <Sparkles style={{ width: 15, height: 15, color: 'var(--accent)', flexShrink: 0 }} />
            <span><strong>Framework Tip:</strong> {currentQ.frameworkTip}</span>
          </div>
        </div>
      )}

      {/* Response Workspace */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        {/* Workspace Toolbar: Stopwatch + Mode Toggle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
            paddingBottom: 14,
            borderBottom: '1px solid var(--border)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* Stopwatch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 20,
                background: timerSeconds > 180 ? '#fef2f2' : timerSeconds > 120 ? '#fffbeb' : 'var(--page)',
                border: '1px solid var(--border)',
                fontWeight: 700,
                fontSize: 13,
                color: timerSeconds > 180 ? '#991b1b' : 'var(--t1)',
              }}
            >
              <Clock style={{ width: 14, height: 14 }} />
              <span>{formatTimer(timerSeconds)}</span>
              <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500 }}>(Aim &lt; 2m)</span>
            </div>

            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="btn btn-ghost btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              {timerRunning ? <Pause style={{ width: 13, height: 13 }} /> : <Play style={{ width: 13, height: 13 }} />}
              <span>{timerRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="btn btn-ghost btn-sm"
              title="Reset timer"
            >
              <RotateCcw style={{ width: 13, height: 13 }} />
            </button>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--page)', padding: 3, borderRadius: 10 }}>
            <button
              onClick={() => setAnswerMode('star')}
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                background: answerMode === 'star' ? '#fff' : 'transparent',
                color: answerMode === 'star' ? 'var(--accent)' : 'var(--t2)',
                boxShadow: answerMode === 'star' ? 'var(--shadow)' : 'none',
                cursor: 'pointer',
              }}
            >
              STAR Method Form
            </button>
            <button
              onClick={() => setAnswerMode('freeform')}
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                background: answerMode === 'freeform' ? '#fff' : 'transparent',
                color: answerMode === 'freeform' ? 'var(--accent)' : 'var(--t2)',
                boxShadow: answerMode === 'freeform' ? 'var(--shadow)' : 'none',
                cursor: 'pointer',
              }}
            >
              Freeform Notes
            </button>
          </div>
        </div>

        {/* Answer Inputs */}
        {answerMode === 'star' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="lbl">S — Situation (What was the context & challenge?)</label>
              <textarea
                className="inp"
                rows={2}
                placeholder="At my previous company, our payment service experienced unexpected latency spikes during peak checkout hours..."
                value={starS}
                onChange={(e) => setStarS(e.target.value)}
              />
            </div>
            <div>
              <label className="lbl">T — Task (What was your direct responsibility?)</label>
              <textarea
                className="inp"
                rows={2}
                placeholder="I was tasked with identifying the root bottleneck, designing a caching fallback, and coordinating with the platform team..."
                value={starT}
                onChange={(e) => setStarT(e.target.value)}
              />
            </div>
            <div>
              <label className="lbl">A — Action (What exact technical decisions and steps did you take?)</label>
              <textarea
                className="inp"
                rows={3}
                placeholder="I profiled the database queries using APM tools, identified N+1 query loops, implemented a Redis cache-aside layer, and added distributed circuit-breakers..."
                value={starA}
                onChange={(e) => setStarA(e.target.value)}
              />
            </div>
            <div>
              <label className="lbl">R — Result (Measurable outcome & retrospective learning)</label>
              <textarea
                className="inp"
                rows={2}
                placeholder="Latency dropped by 72%, zero timeouts during Black Friday, and the pattern was adopted company-wide..."
                value={starR}
                onChange={(e) => setStarR(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="lbl">Your Answer / Speaking Outline</label>
            <textarea
              className="inp"
              rows={8}
              placeholder="Outline your key talking points, technical trade-offs, and metrics..."
              value={freeformAnswer}
              onChange={(e) => setFreeformAnswer(e.target.value)}
            />
          </div>
        )}

        {/* Self Rating & Save */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--t2)' }}>Self-Assessment:</span>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSelfRating(s)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  border: selfRating === s ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: selfRating === s ? 'var(--accent)' : '#fff',
                  color: selfRating === s ? '#fff' : 'var(--t2)',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={handleSavePractice}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <CheckCircle2 style={{ width: 15, height: 15 }} />
            <span>Save Practice Session</span>
          </button>
        </div>
      </div>

      {/* Practice Session History */}
      {practiceHistory.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 14, color: 'var(--t1)' }}>
            Recorded Practice Sessions ({practiceHistory.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {practiceHistory.map((sess) => (
              <div key={sess.id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                        {sess.track}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--t3)' }}>
                        {sess.date} • {formatTimer(sess.durationSeconds)} • Rating: {sess.selfRating}/5
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{sess.question}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteSession(sess.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#ef4444' }}
                    title="Delete session"
                  >
                    <Trash2 style={{ width: 13, height: 13 }} />
                  </button>
                </div>
                <div
                  style={{
                    background: 'var(--page)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 12.5,
                    color: 'var(--t2)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {sess.answerText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 5. BATTLE CARDS (Cheatsheet & Quick Reference Studio)
// ═══════════════════════════════════════════════════════════════
interface BattleCard {
  id: string;
  title: string;
  category: string;
  tags: string[];
  points: string[];
  color: string;
}

const DEFAULT_BATTLECARDS: BattleCard[] = [
  {
    id: 'bc-1',
    title: 'System Design: 5-Step Blueprint',
    category: 'System Design',
    tags: ['Architecture', 'Scaling'],
    points: [
      '1. Clarify scope & constraints (DAU, Read/Write ratio, QPS, latency SLAs)',
      '2. High-level diagram (Clients -> CDN/DNS -> Load Balancer -> API Gateway -> App Servers)',
      '3. Data layer & storage (Relational vs NoSQL, sharding, replication, caching)',
      '4. Deep-dive on bottlenecks (message queues for async bursts, CDN for static assets)',
      '5. Reliability & failure modes (circuit-breakers, failover DB replicas, rate-limiting)',
    ],
    color: '#6366f1',
  },
  {
    id: 'bc-2',
    title: 'Core DSA: Complexity & Data Structures',
    category: 'Algorithms',
    tags: ['Big-O', 'Data Structures'],
    points: [
      'Hash Map: O(1) average lookup/insert; O(n) worst-case on collisions (rehashing)',
      'Binary Search: O(log n) on sorted arrays; check boundary conditions: mid = low + (high-low)/2',
      'Heap / Priority Queue: O(log n) push/pop; O(1) peek; perfect for top-k elements',
      'Trie (Prefix Tree): O(L) lookup where L is word length; ideal for autocomplete / dictionary',
      'Graph Traversals: BFS for shortest path in unweighted graphs; DFS for topological sort / cycle detection',
    ],
    color: '#8b5cf6',
  },
  {
    id: 'bc-3',
    title: 'React Performance & Rendering Optimizations',
    category: 'Web & APIs',
    tags: ['React', 'Frontend'],
    points: [
      'Avoid object recreation in render loops; memoize expensive computations with useMemo',
      'Wrap child callbacks with useCallback when child component is wrapped in React.memo',
      'Virtualize large lists (tanstack-virtual or react-window) to prevent DOM bloat',
      'Use dynamic import() / React.lazy() for route-level and modal-level code splitting',
      'Minimize layout shifts (CLS) by giving images and embeds explicit aspect ratios',
    ],
    color: '#06b6d4',
  },
  {
    id: 'bc-4',
    title: 'Behavioral: "Why This Company" Opening Pitch',
    category: 'Behavioral',
    tags: ['Introduction', 'Culture'],
    points: [
      '1. Technical Alignment: Reference specific architecture challenges they face that align with your background',
      '2. Product Admiration: Cite a concrete feature or engineering blog post that impressed you',
      '3. Immediate Value: State what specific impact you can deliver in the first 90 days',
      '4. Close with Energy: "And that is why this engineering team is my top choice"',
    ],
    color: '#f59e0b',
  },
];

const JournalBattlecardsContent: React.FC = () => {
  const { addToast } = useToast();
  const [cards, setCards] = useState<BattleCard[]>(() => {
    const saved = localStorage.getItem('career_battlecards');
    return saved ? JSON.parse(saved) : DEFAULT_BATTLECARDS;
  });

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add card form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('System Design');
  const [newTags, setNewTags] = useState('');
  const [newPoints, setNewPoints] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');

  useEffect(() => {
    localStorage.setItem('career_battlecards', JSON.stringify(cards));
  }, [cards]);

  const filteredCards = cards.filter((card) => {
    const matchesCategory = categoryFilter === 'All' || card.category === categoryFilter;
    const matchesSearch =
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      card.points.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopyPoints = (card: BattleCard) => {
    const text = `${card.title}\n\n${card.points.join('\n')}`;
    navigator.clipboard.writeText(text);
    addToast('Copied to Clipboard', `Copied notes for "${card.title}"`, 'success');
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPoints.trim()) {
      addToast('Validation Error', 'Title and bullet points are required', 'error');
      return;
    }

    const pointsArray = newPoints
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newCard: BattleCard = {
      id: `bc-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      tags: tagsArray.length ? tagsArray : ['Custom'],
      points: pointsArray,
      color: newColor,
    };

    setCards([newCard, ...cards]);
    setShowAddModal(false);
    setNewTitle('');
    setNewTags('');
    setNewPoints('');
    addToast('Battle Card Created', 'Added new technical cheat sheet', 'success');
  };

  const handleDelete = (id: string, title: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    addToast('Card Removed', `Deleted "${title}"`, 'info');
  };

  return (
    <div className="pb">
      {/* Controls Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
            <Search
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 15,
                height: 15,
                color: 'var(--t3)',
              }}
            />
            <input
              className="inp"
              style={{ paddingLeft: 34 }}
              placeholder="Search concepts or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'System Design', 'Algorithms', 'Web & APIs', 'Behavioral'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  border: categoryFilter === cat ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: categoryFilter === cat ? 'var(--accent-bg)' : '#fff',
                  color: categoryFilter === cat ? 'var(--accent)' : 'var(--t2)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          <span>Add Battle Card</span>
        </button>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--t3)' }}>
          <Shield style={{ width: 36, height: 36, margin: '0 auto 12px', opacity: 0.5 }} />
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>No battle cards found</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Adjust your search query or add a new technical cheatsheet.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="card card-hover"
              style={{
                padding: 20,
                borderTop: `4px solid ${card.color}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)', flex: 1, paddingRight: 8 }}>
                    {card.title}
                  </div>
                  <button
                    onClick={() => handleDelete(card.id, card.title)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#ef4444', padding: '2px 6px' }}
                    title="Delete card"
                  >
                    <Trash2 style={{ width: 13, height: 13 }} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {card.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: 'var(--accent-bg)',
                        color: 'var(--accent)',
                        fontWeight: 700,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, margin: 0 }}>
                  {card.points.map((pt, i) => (
                    <li key={i} style={{ marginBottom: 6 }}>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  marginTop: 18,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  onClick={() => handleCopyPoints(card)}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                >
                  <Clipboard style={{ width: 13, height: 13 }} />
                  <span>Copy Notes</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Battle Card Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15,23,42,0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 28,
                width: '100%',
                maxWidth: 540,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                <span>Create Technical Battle Card</span>
              </h3>
              <form onSubmit={handleAddCard} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="lbl">Card Title *</label>
                  <input
                    className="inp"
                    placeholder="e.g. Database Sharding vs Partitioning"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="lbl">Category</label>
                    <select
                      className="inp"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="System Design">System Design</option>
                      <option value="Algorithms">Algorithms</option>
                      <option value="Web & APIs">Web & APIs</option>
                      <option value="Behavioral">Behavioral</option>
                    </select>
                  </div>
                  <div>
                    <label className="lbl">Accent Color</label>
                    <select
                      className="inp"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                    >
                      <option value="#6366f1">Indigo (Primary)</option>
                      <option value="#8b5cf6">Purple</option>
                      <option value="#06b6d4">Cyan</option>
                      <option value="#10b981">Emerald Green</option>
                      <option value="#f59e0b">Amber</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="lbl">Tags (Comma-separated)</label>
                  <input
                    className="inp"
                    placeholder="e.g. Scaling, Distributed, Storage"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                  />
                </div>

                <div>
                  <label className="lbl">Bullet Points (One per line) *</label>
                  <textarea
                    className="inp"
                    rows={5}
                    placeholder="Point 1: Key definition&#10;Point 2: Architecture trade-off&#10;Point 3: Common interview gotcha"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Battle Card
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 6. EMAIL COPILOT (Dynamic Autofill from Applications, Real Templates)
// ═══════════════════════════════════════════════════════════════
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  generateBody: (vars: { company: string; role: string; recipient: string; topic: string }) => string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'follow-up',
    name: 'Post-Interview Follow-Up (24h)',
    subject: 'Thank you for our conversation — [Role] position',
    generateBody: ({ company, role, recipient, topic }) =>
      `Hi ${recipient || '[Interviewer Name]'},\n\nThank you for taking the time to speak with me yesterday regarding the ${role || '[Role Title]'} opportunity at ${company || '[Company]'}.\n\nI especially enjoyed our discussion on ${topic || 'the architecture challenges and current roadmap'}. The conversation reinforced my enthusiasm for the team's mission and how my engineering background aligns with your current priorities.\n\nPlease let me know if you need any additional code samples, references, or details from my side.\n\nBest regards,\n[Your Name]`,
  },
  {
    id: 'status-check',
    name: 'Application Status Check-In',
    subject: 'Status inquiry — [Role] application at [Company]',
    generateBody: ({ company, role, recipient }) =>
      `Hi ${recipient || '[Recruiter / Hiring Team]'},\n\nI hope you are having a productive week.\n\nI am writing to politely check in on the status of my application for the ${role || '[Role Title]'} role at ${company || '[Company]'}.\n\nI remain very enthusiastic about the work your engineering team is doing and would welcome the opportunity to connect regarding next steps.\n\nThank you for your time and consideration!\n\nBest regards,\n[Your Name]`,
  },
  {
    id: 'thank-you-panel',
    name: 'Panel Thank You Note',
    subject: 'Thank you — [Company] Interview Panel',
    generateBody: ({ company, role, recipient, topic }) =>
      `Dear ${recipient || '[Hiring Committee]'},\n\nThank you for the thoughtful interview panel today. I enjoyed meeting the team and delving into ${topic || 'the technical system design and problem scenarios'}.\n\nIt was exciting to see the high standard of engineering and collaborative culture at ${company || '[Company]'}. I am confident that my technical skills would enable me to hit the ground running in the ${role || '[Role]'} role.\n\nLooking forward to hearing from you regarding next steps.\n\nWarm regards,\n[Your Name]`,
  },
  {
    id: 'offer-negotiate',
    name: 'Offer Clarification & Negotiation',
    subject: 'Question regarding offer details — [Role] at [Company]',
    generateBody: ({ company, role, recipient }) =>
      `Hi ${recipient || '[Recruiter Name]'},\n\nThank you very much for extending the offer to join ${company || '[Company]'} as a ${role || '[Role Title]'}. I am thrilled about the opportunity to work with the team!\n\nBefore formally accepting, I would appreciate the opportunity to discuss a couple of details regarding the overall compensation package. Based on current market benchmarks and my technical experience, I was hoping to align closer to [Target Salary / Equity].\n\nWould you be open to a brief call this week to talk through these details?\n\nThank you again for your support throughout this process.\n\nBest regards,\n[Your Name]`,
  },
  {
    id: 'reschedule',
    name: 'Interview Rescheduling Request',
    subject: 'Rescheduling request — [Role] interview with [Company]',
    generateBody: ({ company, role, recipient }) =>
      `Hi ${recipient || '[Recruiter Name]'},\n\nDue to an unforeseen personal conflict, I am writing to politely request if we could reschedule our upcoming interview for the ${role || '[Role Title]'} position at ${company || '[Company]'}.\n\nI apologize for any inconvenience this may cause your team. I am fully available on [Alternative Date 1, Time Range] or [Alternative Date 2, Time Range].\n\nPlease let me know if either of those options suits the interviewers' schedule.\n\nThank you for your understanding.\n\nSincerely,\n[Your Name]`,
  },
];

const JournalEmailContent: React.FC = () => {
  const { applications } = useApplications();
  const { addToast } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(EMAIL_TEMPLATES[0]);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [recipientName, setRecipientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [topicDiscussed, setTopicDiscussed] = useState('');
  const [editableBody, setEditableBody] = useState('');
  const [copied, setCopied] = useState(false);

  // Autofill when selecting an application
  useEffect(() => {
    if (selectedAppId) {
      const app = applications.find((a) => a.id === selectedAppId);
      if (app) {
        setCompanyName(app.company);
        setRoleTitle(app.role);
      }
    }
  }, [selectedAppId, applications]);

  // Update generated body when parameters or template changes
  useEffect(() => {
    const generated = selectedTemplate.generateBody({
      company: companyName,
      role: roleTitle,
      recipient: recipientName,
      topic: topicDiscussed,
    });
    setEditableBody(generated);
    setCopied(false);
  }, [selectedTemplate, companyName, roleTitle, recipientName, topicDiscussed]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editableBody);
    setCopied(true);
    addToast('Email Copied', 'Email body copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMailto = () => {
    const sub = selectedTemplate.subject
      .replace('[Role]', roleTitle || 'Role')
      .replace('[Company]', companyName || 'Company');
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(editableBody)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="pb" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
      {/* Templates Selector Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 4 }}>
          Outreach Templates
        </div>
        {EMAIL_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => setSelectedTemplate(tmpl)}
            className="btn"
            style={{
              textAlign: 'left',
              padding: '12px 14px',
              fontSize: 13,
              fontWeight: 600,
              background: selectedTemplate.id === tmpl.id ? 'var(--accent-bg)' : 'var(--card)',
              color: selectedTemplate.id === tmpl.id ? 'var(--accent)' : 'var(--t2)',
              border: selectedTemplate.id === tmpl.id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              borderRadius: 12,
              transition: 'all 0.15s ease',
            }}
          >
            {tmpl.name}
          </button>
        ))}

        {/* Application Autofill Link */}
        <div className="card" style={{ padding: 16, marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building2 style={{ width: 14, height: 14, color: 'var(--accent)' }} />
            <span>Link Application</span>
          </div>
          <select
            className="inp"
            style={{ fontSize: 12, padding: '6px 10px' }}
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
          >
            <option value="">Manual / None</option>
            {applications.map((a) => (
              <option key={a.id} value={a.id}>
                {a.company} ({a.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor & Parameter Controls */}
      <div className="card" style={{ padding: 24 }}>
        {/* Dynamic Parameter Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div>
            <label className="lbl">Recipient Name</label>
            <input
              className="inp"
              placeholder="e.g. Sarah Connor"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>
          <div>
            <label className="lbl">Company Name</label>
            <input
              className="inp"
              placeholder="e.g. Stripe"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div>
            <label className="lbl">Role Title</label>
            <input
              className="inp"
              placeholder="e.g. Full Stack Engineer"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="lbl">Topic Discussed</label>
            <input
              className="inp"
              placeholder="e.g. distributed transactions"
              value={topicDiscussed}
              onChange={(e) => setTopicDiscussed(e.target.value)}
            />
          </div>
        </div>

        {/* Email Preview & Edit Area */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="lbl" style={{ marginBottom: 0 }}>Editable Email Draft</label>
            <span style={{ fontSize: 11, color: 'var(--t3)' }}>You can edit directly in the field</span>
          </div>
          <textarea
            className="inp"
            rows={12}
            value={editableBody}
            onChange={(e) => setEditableBody(e.target.value)}
            style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.6 }}
          />
        </div>

        {/* Actions Bar */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            onClick={handleOpenMailto}
            className="btn btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Send style={{ width: 14, height: 14 }} />
            <span>Open in Mail App</span>
          </button>
          <button
            onClick={handleCopy}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {copied ? <Check style={{ width: 15, height: 15 }} /> : <Clipboard style={{ width: 15, height: 15 }} />}
            <span>{copied ? 'Copied Clean Email!' : 'Copy to Clipboard'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 7. FOCUS & CHECKLIST (Breathing Guide, Vector Controls, Checklist)
// ═══════════════════════════════════════════════════════════════
const JournalMindsetContent: React.FC = () => {
  const { addToast } = useToast();
  const [breathingMode, setBreathingMode] = useState<'4-7-8' | 'box'>('4-7-8');
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [timerActive, setTimerActive] = useState(false);

  // Pre-interview checklist
  const DEFAULT_CHECKS = [
    'Test microphone, camera, and headphone audio output',
    'Open clean browser tabs (portfolio, GitHub, resume)',
    'Review 3 core STAR stories for technical leadership',
    'Prepare 2 thoughtful questions to ask the interviewers',
    'Close Slack, email notifications, and background apps',
    'Have a glass of water and blank scratchpad nearby',
  ];

  const [checklist, setChecklist] = useState<{ id: string; text: string; done: boolean }[]>(() => {
    const saved = localStorage.getItem('career_checklist');
    if (saved) return JSON.parse(saved);
    return DEFAULT_CHECKS.map((text, i) => ({ id: `chk-${i}`, text, done: false }));
  });

  const [newCheckInput, setNewCheckInput] = useState('');

  useEffect(() => {
    localStorage.setItem('career_checklist', JSON.stringify(checklist));
  }, [checklist]);

  // Breathing timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev > 1) return prev - 1;

          if (breathingMode === '4-7-8') {
            if (phase === 'Inhale') {
              setPhase('Hold');
              return 7;
            } else if (phase === 'Hold') {
              setPhase('Exhale');
              return 8;
            } else {
              setPhase('Inhale');
              return 4;
            }
          } else {
            // Box Breathing: 4 - 4 - 4
            if (phase === 'Inhale') {
              setPhase('Hold');
              return 4;
            } else if (phase === 'Hold') {
              setPhase('Exhale');
              return 4;
            } else {
              setPhase('Inhale');
              return 4;
            }
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, phase, breathingMode]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleAddCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckInput.trim()) return;
    const newItem = { id: `chk-${Date.now()}`, text: newCheckInput.trim(), done: false };
    setChecklist([...checklist, newItem]);
    setNewCheckInput('');
    addToast('Item Added', 'Added to pre-interview checklist', 'success');
  };

  const handleResetChecklist = () => {
    setChecklist(DEFAULT_CHECKS.map((text, i) => ({ id: `chk-${i}`, text, done: false })));
    addToast('Checklist Reset', 'Reset all checks to defaults', 'info');
  };

  const completedCount = checklist.filter((c) => c.done).length;

  return (
    <div className="pb" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: 20 }}>
      {/* Left: Breathing Focus Tool */}
      <div
        className="card"
        style={{
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Nervous System Regulation
          </div>
          <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)' }}>
            {breathingMode === '4-7-8' ? '4-7-8 Relaxation' : 'Box Breathing (4-4-4)'}
          </div>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
            <button
              onClick={() => {
                setBreathingMode('4-7-8');
                setPhase('Inhale');
                setSecondsLeft(4);
                setTimerActive(false);
              }}
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 14,
                border: breathingMode === '4-7-8' ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: breathingMode === '4-7-8' ? 'var(--accent-bg)' : '#fff',
                color: breathingMode === '4-7-8' ? 'var(--accent)' : 'var(--t2)',
                cursor: 'pointer',
              }}
            >
              4-7-8 Method
            </button>
            <button
              onClick={() => {
                setBreathingMode('box');
                setPhase('Inhale');
                setSecondsLeft(4);
                setTimerActive(false);
              }}
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 14,
                border: breathingMode === 'box' ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: breathingMode === 'box' ? 'var(--accent-bg)' : '#fff',
                color: breathingMode === 'box' ? 'var(--accent)' : 'var(--t2)',
                cursor: 'pointer',
              }}
            >
              Box Breathing
            </button>
          </div>
        </div>

        {/* Pulsing Breathing Circle */}
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 14px 40px rgba(99,102,241,0.35)',
            margin: '28px 0',
            transition: 'transform 0.8s ease',
            transform: phase === 'Inhale' ? 'scale(1.18)' : phase === 'Hold' ? 'scale(1.08)' : 'scale(0.95)',
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 800 }}>{secondsLeft}s</div>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>{phase}</div>
        </div>

        {/* Vector Controls */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setTimerActive(!timerActive)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 100, justifyContent: 'center' }}
          >
            {timerActive ? <Pause style={{ width: 15, height: 15 }} /> : <Play style={{ width: 15, height: 15 }} />}
            <span>{timerActive ? 'Pause' : 'Start'}</span>
          </button>
          <button
            onClick={() => {
              setTimerActive(false);
              setPhase('Inhale');
              setSecondsLeft(4);
            }}
            className="btn btn-ghost"
            title="Reset timer"
          >
            <RotateCcw style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>

      {/* Right: Pre-Interview Checklist */}
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: 'var(--t1)' }}>
                Pre-Interview Readiness Checklist
              </h3>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                {completedCount} of {checklist.length} items ready
              </div>
            </div>
            <button
              onClick={handleResetChecklist}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11.5 }}
            >
              Reset Checklist
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: item.done ? 'var(--success-bg)' : 'var(--page)',
                  border: item.done ? '1px solid #a7f3d0' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 6,
                    border: item.done ? 'none' : '1.5px solid var(--border)',
                    background: item.done ? 'var(--success)' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.done && <Check style={{ width: 13, height: 13, color: '#fff' }} />}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: item.done ? '#065f46' : 'var(--t1)',
                    textDecoration: item.done ? 'line-through' : 'none',
                    fontWeight: item.done ? 500 : 600,
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Item form */}
        <form onSubmit={handleAddCheck} style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <input
            className="inp"
            placeholder="Add custom pre-interview check..."
            value={newCheckInput}
            onChange={(e) => setNewCheckInput(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
          >
            <Plus style={{ width: 15, height: 15 }} />
            <span>Add</span>
          </button>
        </form>
      </div>
    </div>
  );
};
