import { Pencil, Trash2, Flame, DollarSign } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';

interface CompanyProfile {
  id: string;
  name: string;
  industry: string;
  tier: 'FAANG / Big Tech' | 'Unicorn' | 'Growth Startup' | 'Enterprise';
  cultureScore: number;
  interviewDifficulty: number;
  workPolicy: 'Remote' | 'Hybrid' | 'Onsite';
  medianComp: string;
  techStack: string[];
  interviewProcess: string;
  notes: string;
}

const PRESET_COMPANIES: CompanyProfile[] = [
  {
    id: '1',
    name: 'Google',
    industry: 'Technology / Cloud / Search',
    tier: 'FAANG / Big Tech',
    cultureScore: 4.4,
    interviewDifficulty: 4.6,
    workPolicy: 'Hybrid',
    medianComp: '$195,000 - $320,000 Total Comp (L4/L5)',
    techStack: ['C++', 'Python', 'Go', 'Java', 'Angular/React', 'Kubernetes'],
    interviewProcess: '1 Recruiter Screen -> 1 Technical Phone Screen (DSA) -> 4 Onsite Rounds (2 DSA, 1 System Design, 1 Googliness)',
    notes: 'Focus heavily on optimal time/space complexity and edge case handling during DSA rounds.',
  },
  {
    id: '2',
    name: 'Stripe',
    industry: 'Fintech / Payments',
    tier: 'Unicorn',
    cultureScore: 4.6,
    interviewDifficulty: 4.8,
    workPolicy: 'Remote',
    medianComp: '$210,000 - $350,000 Total Comp (L4/L5)',
    techStack: ['Ruby', 'Java', 'Go', 'TypeScript', 'React', 'PostgreSQL'],
    interviewProcess: '1 Technical Screen (Practical Bug Fix / Feature) -> 4 Onsite Rounds (Integration Coding, System Design, Tech Talk)',
    notes: 'Stripe emphasizes practical coding with real IDE and unit tests rather than pure LeetCode trivia.',
  },
  {
    id: '3',
    name: 'Meta',
    industry: 'Social / AI / AR',
    tier: 'FAANG / Big Tech',
    cultureScore: 4.1,
    interviewDifficulty: 4.7,
    workPolicy: 'Hybrid',
    medianComp: '$200,000 - $340,000 Total Comp (E4/E5)',
    techStack: ['Python', 'C++', 'Hack/PHP', 'React', 'PyTorch'],
    interviewProcess: '1 Screen (2 DSA questions in 45m) -> 4 Onsite Rounds (2 Coding, 1 System Architecture, 1 Behavioral)',
    notes: 'Speed is critical: expected to solve 2 medium/hard DSA questions per 45-minute coding session.',
  },
];

export const CompanyIntelPage: React.FC = () => {
  const { applications } = useApplications();
  const { addToast } = useToast();

  const [profiles, setProfiles] = useState<CompanyProfile[]>(PRESET_COMPANIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);

  // Add / Edit Modal
  const [intelModal, setIntelModal] = useState<{ open: boolean; editProf?: CompanyProfile }>({ open: false });
  const [nameInput, setNameInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [compInput, setCompInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  const filteredProfiles = profiles.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setNameInput('');
    setIndustryInput('');
    setCompInput('');
    setTechInput('');
    setNotesInput('');
    setIntelModal({ open: true });
  };

  const openEditModal = (prof: CompanyProfile) => {
    setNameInput(prof.name);
    setIndustryInput(prof.industry);
    setCompInput(prof.medianComp);
    setTechInput(prof.techStack.join(', '));
    setNotesInput(prof.notes);
    setIntelModal({ open: true, editProf: prof });
  };

  const handleDeleteProfile = (id: string, name: string) => {
    if (!window.confirm(`Delete company profile for ${name}?`)) return;
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (selectedProfile?.id === id) setSelectedProfile(null);
    addToast('Intel Profile Deleted', name, 'info');
  };

  const handleSaveIntel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    if (intelModal.editProf) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === intelModal.editProf?.id
            ? {
                ...p,
                name: nameInput.trim(),
                industry: industryInput.trim() || 'Software & Internet',
                medianComp: compInput.trim() || '$150,000 - $250,000',
                techStack: techInput ? techInput.split(',').map((s) => s.trim()) : p.techStack,
                notes: notesInput.trim(),
              }
            : p
        )
      );
      addToast('Company Intel Updated', nameInput, 'success');
    } else {
      const newProf: CompanyProfile = {
        id: Math.random().toString(36).substring(2, 9),
        name: nameInput.trim(),
        industry: industryInput.trim() || 'Software & Internet',
        tier: 'Growth Startup',
        cultureScore: 4.2,
        interviewDifficulty: 4.0,
        workPolicy: 'Hybrid',
        medianComp: compInput.trim() || '$140,000 - $220,000',
        techStack: techInput ? techInput.split(',').map((s) => s.trim()) : ['React', 'Node.js'],
        interviewProcess: 'Recruiter Screen -> Technical Assessment -> Final Onsite Interview',
        notes: notesInput.trim(),
      };

      setProfiles((prev) => [newProf, ...prev]);
      addToast('Company Profile Created 🏢', nameInput, 'success');
    }

    setIntelModal({ open: false });
    setNameInput('');
    setIndustryInput('');
    setCompInput('');
    setTechInput('');
    setNotesInput('');
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">🏢 Company Intelligence & Salary Benchmarks</h1>
            <p className="page-sub">
              Research, edit, and manage tech stacks, interview requirements, and compensation tiers
            </p>
          </div>

          <button onClick={openAddModal} className="btn btn-primary" style={{ borderRadius: 12, fontSize: 13 }}>
            + Log Company Intel
          </button>
        </div>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <input
            className="inp"
            placeholder="Search company or tech stack..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="var(--t3)"
            strokeWidth={2}
            style={{ position: 'absolute', left: 12, top: 12 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Company Profiles Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
          {filteredProfiles.map((company) => {
            const hasApp = applications.some((a) => a.company.toLowerCase() === company.name.toLowerCase());

            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                onClick={() => setSelectedProfile(company)}
                style={{
                  padding: 22,
                  cursor: 'pointer',
                  border: hasApp ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>{company.name}</h3>
                    <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2, marginBottom: 12 }}>{company.industry}</div>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEditModal(company)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, padding: '4px 6px' }}
                      title="Edit Intel"
                    >
                      <Pencil className="inline-block w-4 h-4 mr-1.5 align-text-bottom" />
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(company.id, company.name)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, padding: '4px 6px' }}
                      title="Delete Intel"
                    >
                      <Trash2 className="inline-block w-4 h-4 mr-1.5 align-text-bottom" />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
                  <span style={{ color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: 8 }}>
                    ★ {company.cultureScore} Culture
                  </span>
                  <span style={{ color: '#d97706', background: '#fffbeb', padding: '3px 8px', borderRadius: 8 }}>
                    <Flame className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> {company.interviewDifficulty}/5 Difficulty
                  </span>
                  <span style={{ color: '#6366f1', background: '#e0e7ff', padding: '3px 8px', borderRadius: 8 }}>
                    {company.workPolicy}
                  </span>
                </div>

                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>
                  <DollarSign className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> {company.medianComp}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {company.techStack.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontSize: 11,
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontWeight: 600,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Company Details Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="modal-backdrop" onClick={() => setSelectedProfile(null)}>
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 600, padding: 28 }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                    🏢 {selectedProfile.name}
                  </h2>
                  <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 2 }}>{selectedProfile.industry}</div>
                </div>
                <button onClick={() => setSelectedProfile(null)} className="btn btn-ghost btn-sm">
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Compensation Tier:
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{selectedProfile.medianComp}</div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Interview Process:
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.6, margin: 0 }}>
                    {selectedProfile.interviewProcess}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Insider Research Notes:
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--t1)', background: '#fffbeb', padding: 12, borderRadius: 10, border: '1px solid #fef08a' }}>
                    {selectedProfile.notes}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Intel Modal */}
      <AnimatePresence>
        {intelModal.open && (
          <div className="modal-backdrop" onClick={() => setIntelModal({ open: false })}>
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 500, padding: 24 }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
                {intelModal.editProf ? <><Pencil className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Edit Company Intel</> : '🏢 Log Company Intelligence'}
              </h2>

              <form onSubmit={handleSaveIntel} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="lbl">Company Name *</label>
                  <input
                    className="inp"
                    placeholder="e.g. OpenAI, Palantir"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="lbl">Industry / Domain</label>
                  <input
                    className="inp"
                    placeholder="e.g. AI / Infrastructure"
                    value={industryInput}
                    onChange={(e) => setIndustryInput(e.target.value)}
                  />
                </div>

                <div>
                  <label className="lbl">Estimated Compensation Range</label>
                  <input
                    className="inp"
                    placeholder="e.g. $180,000 - $260,000"
                    value={compInput}
                    onChange={(e) => setCompInput(e.target.value)}
                  />
                </div>

                <div>
                  <label className="lbl">Tech Stack (comma separated)</label>
                  <input
                    className="inp"
                    placeholder="Python, React, PyTorch, Docker"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                  />
                </div>

                <div>
                  <label className="lbl">Research Notes & Interview Bar</label>
                  <textarea
                    className="inp"
                    rows={3}
                    placeholder="Notes on tech stack, interview format..."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" onClick={() => setIntelModal({ open: false })} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {intelModal.editProf ? 'Save Changes' : 'Save Company Intel'}
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
