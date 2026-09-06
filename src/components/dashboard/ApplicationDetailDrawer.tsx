import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  ExternalLink,
  X,
  FileText,
  Mail,
  Copy,
  Check,
  Award,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useToast } from '../ui/ToastContext';
import { StatusDropdown } from '../applications/StatusDropdown';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { updateApplication, deleteApplication } from '../../firebase/firestore';
import type { Application, ApplicationStatus } from '../../types';
import { COMMON_SOURCES, REJECTION_REASONS } from '../../types';

const toDateInputStr = (d: unknown): string => {
  if (!d) return '';
  if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString().split('T')[0];
  if (typeof d === 'string') {
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? '' : parsed.toISOString().split('T')[0];
  }
  if (typeof d === 'object' && d !== null && 'seconds' in d) {
    return new Date((d as { seconds: number }).seconds * 1000).toISOString().split('T')[0];
  }
  return '';
};

const parseDateInputStr = (str: string): Date | null => {
  if (!str) return null;
  const d = new Date(str + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
};

interface ApplicationDetailDrawerProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationDetailDrawer: React.FC<ApplicationDetailDrawerProps> = ({
  application,
  isOpen,
  onClose,
}) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<Partial<Application>>({});
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Drawer Tab State: 'details' vs 'copilot'
  const [activeTab, setActiveTab] = useState<'details' | 'copilot'>('details');

  // Copilot Email State
  const [emailTemplate, setEmailTemplate] = useState<'thank-you' | 'check-in' | 'updates'>('thank-you');
  const [copied, setCopied] = useState(false);

  // STAR Story Builder State
  const [starSituation, setStarSituation] = useState('');
  const [starTask, setStarTask] = useState('');
  const [starAction, setStarAction] = useState('');
  const [starResult, setStarResult] = useState('');

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company,
        role: application.role,
        status: application.status,
        appliedDate: application.appliedDate,
        deadline: application.deadline,
        jobLink: application.jobLink,
        notes: application.notes,
        interviewNotes: application.interviewNotes,
        source: application.source,
        rating: application.rating,
        rejectionReasons: application.rejectionReasons || [],
      });
      setActiveTab('details');
      setCopied(false);
    }
  }, [application]);

  // Keyboard shortcut handler: Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !application) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.company?.trim() || !formData.role?.trim()) {
      addToast('Validation error', 'Company and Role are required', 'error');
      return;
    }

    const appId = application.id;
    const compName = formData.company.trim();
    const roleName = formData.role.trim();

    try {
      await updateApplication(appId, {
        company: compName,
        role: roleName,
        status: formData.status as ApplicationStatus,
        appliedDate: formData.appliedDate,
        deadline: formData.deadline,
        jobLink: formData.jobLink || '',
        notes: formData.notes || '',
        interviewNotes: formData.interviewNotes || '',
        source: formData.source || '',
        rating: formData.rating || 0,
        rejectionReasons: formData.rejectionReasons || [],
      });

      addToast('Application Saved', `Updated ${compName} (${roleName})`, 'success');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating';
      addToast('Failed to save', msg, 'error');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteApplication(application.id);
      addToast('Application Deleted', `Removed ${application.company}`, 'info');
      setShowDeleteConfirm(false);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting';
      addToast('Failed to delete', msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const toggleRejectionReason = (reason: string) => {
    const current = formData.rejectionReasons || [];
    const updated = current.includes(reason)
      ? current.filter((r) => r !== reason)
      : [...current, reason];
    setFormData({ ...formData, rejectionReasons: updated });
  };

  // Generate dynamic email draft based on selected template
  const getGeneratedEmail = () => {
    const company = formData.company || 'the team';
    const role = formData.role || 'this role';

    if (emailTemplate === 'thank-you') {
      return `Subject: Thank you — ${role} interview with ${company}

Hi [Interviewer Name],

Thank you for taking the time to speak with me today regarding the ${role} opportunity at ${company}. I really enjoyed our conversation and learning more about the team's priorities and upcoming initiatives.

Our discussion reinforced my enthusiasm for the role, and I am confident that my technical background and problem-solving skills will allow me to deliver immediate value.

Please let me know if you need any additional work samples, references, or details from my side. Looking forward to the next steps in the process!

Best regards,
[Your Name]`;
    }

    if (emailTemplate === 'check-in') {
      return `Subject: Following up on ${role} application — ${company}

Hi [Recruiter / Hiring Team],

I hope your week is going well!

I wanted to follow up on my application for the ${role} position at ${company}. I remain very interested in the team's mission and would love to know if there are any updates regarding the hiring timeline.

Thank you for your time and consideration, and I look forward to hearing from you.

Best regards,
[Your Name]`;
    }

    return `Subject: Application Update: ${role} — ${company}

Hi [Hiring Team],

I hope you're having a productive week!

I'm reaching out with a brief update regarding my application for the ${role} position at ${company}. I recently completed [Key Project / Milestone / Certification] which directly aligns with the technical scope of your team.

I would welcome the opportunity to discuss how this hands-on experience can help accelerate ${company}'s goals.

Best regards,
[Your Name]`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(getGeneratedEmail());
    setCopied(true);
    addToast('Copied to Clipboard', 'Email template copied successfully', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAppendStarToNotes = () => {
    if (!starSituation && !starTask && !starAction && !starResult) {
      addToast('Empty Story', 'Please fill in at least one STAR field', 'error');
      return;
    }

    const starBlock = `\n\n--- STAR Story (${format(new Date(), 'MMM d, yyyy')}) ---
• Situation: ${starSituation || '—'}
• Task: ${starTask || '—'}
• Action: ${starAction || '—'}
• Result: ${starResult || '—'}`;

    setFormData((prev) => ({
      ...prev,
      interviewNotes: (prev.interviewNotes || '') + starBlock,
    }));

    setStarSituation('');
    setStarTask('');
    setStarAction('');
    setStarResult('');

    addToast('Story Appended', 'STAR story inserted into Interview Notes', 'success');
    setActiveTab('details');
  };

  return (
    <AnimatePresence>
      <div className="drawer-backdrop" onClick={onClose} style={{ zIndex: 1000 }}>
        <motion.div
          className="drawer-panel"
          onClick={(e) => e.stopPropagation()}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          style={{
            width: 580,
            maxWidth: '100vw',
            background: 'var(--card)',
            borderLeft: '1px solid var(--border)',
            boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Header */}
          <div
            className="drawer-header"
            style={{
              background: 'var(--page)',
              borderBottom: '1px solid var(--border)',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 17,
                  fontWeight: 800,
                  boxShadow: '0 4px 12px var(--accent-glow)',
                  flexShrink: 0,
                }}
              >
                {formData.company?.charAt(0).toUpperCase() || '?'}
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formData.company || 'Application Details'}
                </h2>
                <p style={{ fontSize: 12.5, color: 'var(--t2)', margin: 0, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formData.role}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--t2)',
                width: 32,
                height: 32,
                borderRadius: 9,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              title="Close (Esc)"
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Segmented Mode Switcher */}
          <div
            style={{
              display: 'flex',
              padding: '10px 22px 0',
              background: 'var(--page)',
              borderBottom: '1px solid var(--border)',
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                borderBottom: activeTab === 'details' ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                background: 'transparent',
                color: activeTab === 'details' ? 'var(--accent)' : 'var(--t2)',
                transition: 'all 0.15s ease',
              }}
            >
              <FileText style={{ width: 14, height: 14 }} />
              <span>Overview & Notes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('copilot')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                borderBottom: activeTab === 'copilot' ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                background: 'transparent',
                color: activeTab === 'copilot' ? 'var(--accent)' : 'var(--t2)',
                transition: 'all 0.15s ease',
              }}
            >
              <Mail style={{ width: 14, height: 14 }} />
              <span>Interview Copilot & Follow-Up</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="drawer-body" style={{ flex: 1, overflowY: 'auto', padding: '22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {activeTab === 'details' ? (
              <>
                {/* Timeline & Metadata Info */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--card-hover, rgba(0,0,0,0.02))',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    fontSize: 12,
                    color: 'var(--t2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock style={{ width: 14, height: 14, color: 'var(--accent)' }} />
                    <span>Added on <strong>{format(new Date(application.createdAt), 'MMM d, yyyy')}</strong></span>
                  </div>
                  {application.updatedAt && (
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>
                      Updated {format(new Date(application.updatedAt), 'MMM d')}
                    </span>
                  )}
                </div>

                {/* Status Dropdown + Source */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="lbl">Pipeline Status</label>
                    <StatusDropdown
                      current={(formData.status as ApplicationStatus) || 'Wishlist'}
                      isOpen={dropdownOpen}
                      onOpen={() => setDropdownOpen(true)}
                      onClose={() => setDropdownOpen(false)}
                      onSelect={async (status) => {
                        const newAppliedDate = (status === 'Applied' && !formData.appliedDate) ? new Date() : formData.appliedDate;
                        setFormData((prev) => ({ ...prev, status, appliedDate: newAppliedDate }));
                        setDropdownOpen(false);
                        try {
                          await updateApplication(application.id, {
                            status,
                            appliedDate: newAppliedDate,
                          });
                          addToast('Status Updated', `Moved to ${status}`, 'success');
                        } catch (err: unknown) {
                          const msg = err instanceof Error ? err.message : 'Error updating status';
                          addToast('Failed to update status', msg, 'error');
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="lbl">Source / Portal</label>
                    <select
                      className="inp"
                      value={formData.source || ''}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    >
                      <option value="">Select source…</option>
                      {/* Ensure any custom or extension-detected source is rendered so it never shows blank */}
                      {formData.source && !COMMON_SOURCES.includes(formData.source) && (
                        <option value={formData.source}>{formData.source}</option>
                      )}
                      {COMMON_SOURCES.map((src) => (
                        <option key={src} value={src}>
                          {src}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Applied Date & Deadline Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label className="lbl" style={{ margin: 0 }}>Applied Date</label>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, appliedDate: new Date() }))}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--accent)',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Set to Today
                      </button>
                    </div>
                    <input
                      type="date"
                      className="inp"
                      value={toDateInputStr(formData.appliedDate)}
                      onChange={(e) => setFormData({ ...formData, appliedDate: parseDateInputStr(e.target.value) })}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label className="lbl" style={{ margin: 0 }}>Deadline</label>
                      {formData.deadline && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, deadline: null }))}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--t3)',
                            fontSize: 11,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="date"
                      className="inp"
                      value={toDateInputStr(formData.deadline)}
                      onChange={(e) => setFormData({ ...formData, deadline: parseDateInputStr(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Company & Role Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="lbl">Company Name *</label>
                    <input
                      className="inp"
                      value={formData.company || ''}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="lbl">Role Title *</label>
                    <input
                      className="inp"
                      value={formData.role || ''}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>
                </div>

                {/* Job Link */}
                <div>
                  <label className="lbl">Job Listing URL</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="inp"
                      type="url"
                      placeholder="https://company.com/careers/…"
                      value={formData.jobLink || ''}
                      onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                    />
                    {formData.jobLink && (
                      <a
                        href={formData.jobLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost"
                        style={{ padding: '8px 12px', flexShrink: 0 }}
                        title="Open posting in new tab"
                      >
                        <ExternalLink style={{ width: 14, height: 14 }} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Notes Fields */}
                <div>
                  <label className="lbl">Application & Compensation Notes</label>
                  <textarea
                    className="inp"
                    rows={3}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Salary range, tech stack requirements, recruiter contact info…"
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label className="lbl" style={{ margin: 0 }}>Interview Prep & Notes</label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('copilot')}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--accent)',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Open STAR Builder →
                    </button>
                  </div>
                  <textarea
                    className="inp"
                    rows={3}
                    value={formData.interviewNotes || ''}
                    onChange={(e) => setFormData({ ...formData, interviewNotes: e.target.value })}
                    placeholder="Questions asked, topics to review, STAR stories…"
                  />
                </div>

                {/* Rejection / Post-Mortem Tags */}
                <div>
                  <label className="lbl">Post-Mortem / Outcome Tags</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {REJECTION_REASONS.map((reason) => {
                      const active = (formData.rejectionReasons || []).includes(reason);
                      return (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => toggleRejectionReason(reason)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 16,
                            fontSize: 12,
                            fontWeight: 600,
                            border: `1px solid ${active ? '#dc2626' : 'var(--border)'}`,
                            background: active ? '#fef2f2' : '#ffffff',
                            color: active ? '#dc2626' : 'var(--t2)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {active ? '✓ ' : '+ '}
                          {reason}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Interview Copilot & Follow-Up Tab */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Email Generator Section */}
                <div style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 16, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                      <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)' }}>
                        1-Click Follow-Up & Thank You Draft
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '5px 12px', fontSize: 12 }}
                    >
                      {copied ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
                      <span>{copied ? 'Copied!' : 'Copy Draft'}</span>
                    </button>
                  </div>

                  {/* Template Picker */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {[
                      { id: 'thank-you', label: 'Thank You Email' },
                      { id: 'check-in', label: '1-Week Check-in' },
                      { id: 'updates', label: 'Project Update' },
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setEmailTemplate(tpl.id as any)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 8,
                          fontSize: 11.5,
                          fontWeight: 700,
                          border: emailTemplate === tpl.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                          background: emailTemplate === tpl.id ? '#ffffff' : 'transparent',
                          color: emailTemplate === tpl.id ? 'var(--accent)' : 'var(--t2)',
                          cursor: 'pointer',
                        }}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    className="inp"
                    rows={8}
                    readOnly
                    value={getGeneratedEmail()}
                    style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5, background: 'var(--card)' }}
                  />
                </div>

                {/* STAR Story Builder Section */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Award style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                    <div>
                      <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)' }}>
                        STAR Story Battlecard Builder
                      </span>
                      <p style={{ fontSize: 11.5, color: 'var(--t3)', margin: '2px 0 0' }}>
                        Craft a compelling response to nail behavioral questions at {formData.company || 'this interview'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label className="lbl">Situation (Context & Setting)</label>
                      <input
                        className="inp"
                        placeholder="e.g. During peak Q4 migration, our primary database hit high latency…"
                        value={starSituation}
                        onChange={(e) => setStarSituation(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="lbl">Task (Objective & Responsibility)</label>
                      <input
                        className="inp"
                        placeholder="e.g. I was assigned to optimize queries and cut response time under 150ms…"
                        value={starTask}
                        onChange={(e) => setStarTask(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="lbl">Action (What You Specifically Did)</label>
                      <input
                        className="inp"
                        placeholder="e.g. Profiling slow traces, implementing Redis caching layer, refactoring indices…"
                        value={starAction}
                        onChange={(e) => setStarAction(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="lbl">Result (Measurable Impact & Outcome)</label>
                      <input
                        className="inp"
                        placeholder="e.g. Reduced p99 latency by 72%, prevented downtime for 200k active users…"
                        value={starResult}
                        onChange={(e) => setStarResult(e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAppendStarToNotes}
                      className="btn btn-primary"
                      style={{ marginTop: 6, padding: '9px 18px', fontSize: 13 }}
                    >
                      <CheckCircle2 style={{ width: 15, height: 15 }} />
                      <span>Save STAR Story to Interview Notes</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="drawer-footer"
            style={{
              padding: '16px 22px',
              borderTop: '1px solid var(--border)',
              background: 'var(--page)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-danger"
              style={{ fontSize: 13 }}
            >
              Delete Card
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} className="btn btn-ghost">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          title="Delete Application"
          message={`Are you sure you want to remove "${application.company} — ${application.role}"? This cannot be undone.`}
          loading={deleting}
        />
      </div>
    </AnimatePresence>
  );
};
