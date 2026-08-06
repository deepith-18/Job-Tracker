import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useToast } from '../ui/ToastContext';
import { StatusDropdown } from '../applications/StatusDropdown';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { updateApplication, deleteApplication } from '../../firebase/firestore';
import type { Application, ApplicationStatus } from '../../types';
import { COMMON_SOURCES, REJECTION_REASONS } from '../../types';

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
    }
  }, [application]);

  // Keyboard shortcut handler: Esc to close, Enter to save
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
    const compName = formData.company;
    const roleName = formData.role;
    onClose();

    try {
      await updateApplication(appId, {
        company: formData.company,
        role: formData.role,
        status: formData.status as ApplicationStatus,
        appliedDate: formData.appliedDate ? new Date(formData.appliedDate) : null,
        deadline: formData.deadline ? new Date(formData.deadline) : null,
        jobLink: formData.jobLink,
        notes: formData.notes,
        interviewNotes: formData.interviewNotes,
        source: formData.source,
        rating: formData.rating,
        rejectionReasons: formData.rejectionReasons,
      });

      addToast('Application Saved 💾', `Updated ${compName} (${roleName})`, 'success');
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
          style={{ width: 560, maxWidth: '100vw' }}
        >
          {/* Header */}
          <div className="drawer-header" style={{ background: '#0d1136', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #818cf8, #4f46e5)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                {formData.company?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>
                  {formData.company || 'Application Details'}
                </h2>
                <p style={{ fontSize: 13, color: '#a5b4fc', margin: 0, marginTop: 2 }}>
                  {formData.role}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                width: 32,
                height: 32,
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 16,
              }}
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Status Dropdown + Rating */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="lbl">Pipeline Status</label>
                <StatusDropdown
                  current={(formData.status as ApplicationStatus) || 'Wishlist'}
                  isOpen={dropdownOpen}
                  onOpen={() => setDropdownOpen(true)}
                  onClose={() => setDropdownOpen(false)}
                  onSelect={(status) => {
                    setFormData({ ...formData, status });
                    setDropdownOpen(false);
                  }}
                />
              </div>

              <div>
                <label className="lbl">Dream Rating (1–5)</label>
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: 22,
                        cursor: 'pointer',
                        color: star <= (formData.rating || 0) ? '#fbbf24' : '#cbd5e1',
                        transition: 'transform 0.1s ease',
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Company & Role */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="lbl">Company Name</label>
                <input
                  type="text"
                  className="inp"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Google"
                />
              </div>
              <div>
                <label className="lbl">Role Title</label>
                <input
                  type="text"
                  className="inp"
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
            </div>

            {/* Applied Date & Deadline */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="lbl">Applied Date</label>
                <input
                  type="date"
                  className="inp"
                  value={
                    formData.appliedDate
                      ? format(new Date(formData.appliedDate), 'yyyy-MM-dd')
                      : ''
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appliedDate: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                />
              </div>

              <div>
                <label className="lbl">Deadline</label>
                <input
                  type="date"
                  className="inp"
                  value={
                    formData.deadline
                      ? format(new Date(formData.deadline), 'yyyy-MM-dd')
                      : ''
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deadline: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            {/* Source & Job Link */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="lbl">Source</label>
                <select
                  className="inp"
                  value={formData.source || 'LinkedIn'}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  {COMMON_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="lbl">Job URL</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="url"
                    className="inp"
                    value={formData.jobLink || ''}
                    onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                    placeholder="https://..."
                  />
                  {formData.jobLink && (
                    <a
                      href={formData.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost"
                      style={{ padding: '0 10px', flexShrink: 0 }}
                      title="Open Job URL"
                    >
                      🔗
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* General Notes */}
            <div>
              <label className="lbl">Notes & Preparation</label>
              <textarea
                className="inp"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Key requirements, salary range, referrals..."
              />
            </div>

            {/* Interview Notes & Dates */}
            <div>
              <label className="lbl">Interview Logs & Question Notes</label>
              <textarea
                className="inp"
                rows={3}
                value={formData.interviewNotes || ''}
                onChange={(e) => setFormData({ ...formData, interviewNotes: e.target.value })}
                placeholder="System design questions asked, interviewer details, next steps..."
              />
            </div>

            {/* Rejection Reasons (if rejected or learning) */}
            <div>
              <label className="lbl">Rejection / Post-Mortem Tags</label>
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
                        border: `1px solid ${active ? '#be123c' : 'var(--border)'}`,
                        background: active ? '#fff1f2' : '#fff',
                        color: active ? '#be123c' : 'var(--t2)',
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
          </div>

          {/* Footer */}
          <div className="drawer-footer" style={{ justifyContent: 'space-between' }}>
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
                Cancel (Esc)
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                className="btn btn-primary"
              >
                Save Changes (Enter)
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
