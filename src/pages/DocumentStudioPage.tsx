import { File, Folder, Pencil, Trash2, Sparkles, Clipboard } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';

interface ResumeDoc {
  id: string;
  title: string;
  targetRole: string;
  updatedAt: string;
  link: string;
}

const INITIAL_DOCS: ResumeDoc[] = [
  { id: '1', title: 'Senior Frontend & React Specialist Resume', targetRole: 'Frontend / FullStack', updatedAt: 'Aug 2026', link: 'https://drive.google.com/...' },
  { id: '2', title: 'Full-Stack Software Engineer Core Resume', targetRole: 'General Software Engineering', updatedAt: 'Jul 2026', link: 'https://drive.google.com/...' },
  { id: '3', title: 'System Architecture & Backend Lead Resume', targetRole: 'Backend / Systems', updatedAt: 'Jul 2026', link: 'https://drive.google.com/...' },
];

export const DocumentStudioPage: React.FC = () => {
  const { applications } = useApplications();
  const { addToast } = useToast();

  const [docs, setDocs] = useState<ResumeDoc[]>(INITIAL_DOCS);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [keySkillsInput, setKeySkillsInput] = useState('React, TypeScript, Node.js, System Design, GraphQL');
  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Document Modal (Add / Edit)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [docModal, setDocModal] = useState<{ open: boolean; editDoc?: ResumeDoc }>({ open: false });
  const [docTitleInput, setDocTitleInput] = useState('');
  const [docRoleInput, setDocRoleInput] = useState('');
  const [docLinkInput, setDocLinkInput] = useState('');

  const openAddDocModal = () => {
    setDocTitleInput('');
    setDocRoleInput('');
    setDocLinkInput('');
    setDocModal({ open: true });
  };

  const openEditDocModal = (doc: ResumeDoc) => {
    setDocTitleInput(doc.title);
    setDocRoleInput(doc.targetRole);
    setDocLinkInput(doc.link);
    setDocModal({ open: true, editDoc: doc });
  };

  const handleDeleteDoc = (id: string, title: string) => {
    if (!window.confirm(`Delete resume version "${title}"?`)) return;
    setDocs((prev) => prev.filter((d) => d.id !== id));
    addToast('Resume Version Deleted', title, 'info');
  };

  const handleGenerateCoverLetter = (e: React.FormEvent) => {
    e.preventDefault();
    const app = applications.find((a) => a.id === selectedAppId);
    const company = app ? app.company : 'Target Company';
    const role = app ? app.role : 'Software Engineer';

    setGenerating(true);
    setTimeout(() => {
      const letter = `Dear Hiring Team at ${company},

I am writing to express my strong enthusiasm for the ${role} position. With a solid foundation in building scalable web applications and technical expertise in ${keySkillsInput}, I am confident in my ability to make an immediate, meaningful impact at ${company}.

Throughout my engineering experience, I have specialized in architecting responsive user interfaces, designing robust API endpoints, and delivering high-availability features under demanding deadlines. My approach combines clean code practices, proactive cross-functional collaboration, and a relentless focus on performance optimization.

I am particularly drawn to ${company}'s mission and engineering standards. I would welcome the opportunity to discuss how my technical skills and problem-solving mindset align with your team's goals.

Thank you for your time and consideration.

Best regards,
Candidate`;

      setGeneratedLetter(letter);
      setGenerating(false);
      addToast('Cover Letter Draft Generated', `Tailored for ${company} (${role})`, 'success');
    }, 600);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitleInput.trim()) return;

    if (docModal.editDoc) {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === docModal.editDoc?.id
            ? {
                ...d,
                title: docTitleInput.trim(),
                targetRole: docRoleInput.trim() || 'Software Engineering',
                link: docLinkInput.trim() || '#',
                updatedAt: 'Just now',
              }
            : d
        )
      );
      addToast('Resume Version Updated', docTitleInput, 'success');
    } else {
      const newDoc: ResumeDoc = {
        id: Math.random().toString(36).substring(2, 9),
        title: docTitleInput.trim(),
        targetRole: docRoleInput.trim() || 'Software Engineering',
        updatedAt: 'Just now',
        link: docLinkInput.trim() || '#',
      };
      setDocs((prev) => [newDoc, ...prev]);
      addToast('Resume Version Added', docTitleInput, 'success');
    }

    setDocModal({ open: false });
    setDocTitleInput('');
    setDocRoleInput('');
    setDocLinkInput('');
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    addToast('Copied to Clipboard', 'Cover letter ready to paste', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title"><File className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Resume & Cover Letter Studio</h1>
        <p className="page-sub">
          Manage, edit, and delete tailored resume versions and generate custom cover letters
        </p>
      </div>

      <div className="pb" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
        {/* Left Column: Managed Resume Versions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                <Folder className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Tailored Resumes & Portfolios
              </h3>
              <button onClick={openAddDocModal} className="btn btn-primary btn-sm" style={{ fontSize: 12 }}>
                + Add Resume Version
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}><File className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /></span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)' }}>{doc.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--t2)', marginTop: 2 }}>
                        Target: {doc.targetRole} · Updated {doc.updatedAt}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={(e) => { e.preventDefault(); setPreviewUrl(doc.link); }}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11.5, padding: '4px 8px' }}
                    >
                      View 🔗
                    </button>
                    <button
                      onClick={() => openEditDocModal(doc)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, padding: '4px 6px' }}
                      title="Edit Resume"
                    >
                      <Pencil className="inline-block w-4 h-4 mr-1.5 align-text-bottom" />
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(doc.id, doc.title)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, padding: '4px 6px' }}
                      title="Delete Resume"
                    >
                      <Trash2 className="inline-block w-4 h-4 mr-1.5 align-text-bottom" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Cover Letter Generator */}
        <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
            <Sparkles className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Smart Cover Letter Generator
          </h3>

          <form onSubmit={handleGenerateCoverLetter} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="lbl">Target Application</label>
              <select
                className="inp"
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
              >
                <option value="">Select target company from pipeline...</option>
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.company} — {a.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="lbl">Key Highlighted Skills & Achievements</label>
              <input
                className="inp"
                value={keySkillsInput}
                onChange={(e) => setKeySkillsInput(e.target.value)}
                placeholder="e.g. React, Node.js, Microservices, AWS"
              />
            </div>

            <button type="submit" disabled={generating} className="btn btn-primary" style={{ borderRadius: 12 }}>
              {generating ? 'Generating Draft…' : <><Sparkles className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Generate Tailored Cover Letter</>}
            </button>
          </form>

          {/* Generated Letter Display */}
          {generatedLetter && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase' }}>
                  Generated Draft:
                </span>
                <button onClick={handleCopyLetter} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
                  {copied ? '✓ Copied' : <><Clipboard className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Copy Draft</>}
                </button>
              </div>

              <textarea
                className="inp"
                rows={12}
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.6 }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Document Modal */}
      <AnimatePresence>
        {docModal.open && (
          <div className="modal-backdrop" onClick={() => setDocModal({ open: false })}>
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 480, padding: 24 }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
                {docModal.editDoc ? <><Pencil className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Edit Resume Version</> : <><File className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Add Resume Version</>}
              </h2>

              <form onSubmit={handleSaveDocument} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="lbl">Document Title *</label>
                  <input
                    className="inp"
                    placeholder="e.g. Staff Full-Stack Resume 2026"
                    value={docTitleInput}
                    onChange={(e) => setDocTitleInput(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="lbl">Target Focus / Role</label>
                  <input
                    className="inp"
                    placeholder="e.g. Frontend Engineering, Systems"
                    value={docRoleInput}
                    onChange={(e) => setDocRoleInput(e.target.value)}
                  />
                </div>

                <div>
                  <label className="lbl">Document Drive / PDF Link</label>
                  <input
                    type="url"
                    className="inp"
                    placeholder="https://drive.google.com/..."
                    value={docLinkInput}
                    onChange={(e) => setDocLinkInput(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" onClick={() => setDocModal({ open: false })} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {docModal.editDoc ? 'Save Changes' : 'Save Document'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* PDF / Document Preview Modal */}
        {previewUrl && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'var(--card)', width: '100%', maxWidth: 1000, height: '85vh', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--t1)' }}>Document Preview</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }}>Open in New Tab ↗</a>
                  <button onClick={() => setPreviewUrl(null)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', background: '#fee2e2', color: '#b91c1c' }}>✕ Close</button>
                </div>
              </div>
              <div style={{ flex: 1, background: '#d1d5db' }}>
                <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
};
