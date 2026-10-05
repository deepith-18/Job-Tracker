import React, { useState } from 'react';
import { X, Sparkles, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../ui/ToastContext';
import { addApplication } from '../../firebase/firestore';
import type { ApplicationStatus } from '../../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded?: () => void;
}

const STAGES: ApplicationStatus[] = ['Wishlist', 'Applied', 'OA/Assessment', 'Interview'];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onAdded }) => {
  const user = useAuthStore((s) => s.user);
  const { addToast } = useToast();

  const [input, setInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('Applied');
  const [salary, setSalary] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const parseInput = (raw: string) => {
    const trimmed = raw.trim();
    let company = '';
    let role = 'Software Engineer';
    let jobLink = '';

    if (/^(http:\/\/|https:\/\/|www\.)/i.test(trimmed)) {
      jobLink = trimmed.startsWith('www.') ? `https://${trimmed}` : trimmed;
      try {
        const urlObj = new URL(jobLink);
        const host = urlObj.hostname.replace(/^www\./, '');
        const parts = host.split('.');
        company = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Target Company';
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          const lastSeg = decodeURIComponent(pathSegments[pathSegments.length - 1]).replace(/[-_]/g, ' ');
          if (lastSeg.length > 3 && !/^\d+$/.test(lastSeg)) {
            role = lastSeg.charAt(0).toUpperCase() + lastSeg.slice(1);
          }
        }
      } catch {
        company = 'Target Company';
      }
    } else {
      const match = trimmed.split(/\s*(?:—|–|-|:|\||\/)\s*/);
      if (match.length >= 2) {
        company = match[0].trim();
        role = match.slice(1).join(' ').trim();
      } else {
        company = trimmed;
      }
    }

    return { company, role, jobLink };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!user) {
      addToast('Please sign in to add applications', undefined, 'error');
      return;
    }

    const { company, role, jobLink } = parseInput(input);
    if (!company) {
      addToast('Please enter a company name', undefined, 'error');
      return;
    }

    setLoading(true);
    try {
      await addApplication(user.uid, {
        company,
        role,
        status: selectedStatus,
        appliedDate: selectedStatus === 'Wishlist' ? null : new Date(),
        deadline: null,
        jobLink,
        notes,
        interviewNotes: '',
        salary: salary.trim() || undefined,
        source: jobLink ? 'Web' : 'Quick Action',
        rating: 3,
        rejectionReasons: [],
      });

      addToast(`Added "${company} — ${role}" to ${selectedStatus}`, 'Application logged to pipeline', 'success');
      setInput('');
      setSalary('');
      setNotes('');
      onClose();
      if (onAdded) onAdded();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      addToast('Failed to add application', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 500,
          borderRadius: 20,
          background: 'var(--card)',
          border: '1.5px solid var(--accent)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px var(--accent-glow)',
          padding: 24,
          animation: 'fadeInSlide 0.15s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px var(--accent-glow)',
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                Log New Opportunity
              </h3>
              <p style={{ fontSize: 11.5, color: 'var(--t3)', margin: 0, marginTop: 2 }}>
                Smart input: Type <em>"Company — Role"</em> or paste any job link
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: 4, borderRadius: 8 }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Main Smart Input */}
          <div>
            <label className="lbl" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Company & Role / Job URL *</span>
              <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>Auto-parsed</span>
            </label>
            <input
              autoFocus
              className="inp"
              placeholder="e.g. Stripe — Senior Backend Engineer or https://..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ fontSize: 13.5, padding: '10px 14px' }}
              required
            />
          </div>

          {/* Initial Pipeline Stage */}
          <div>
            <label className="lbl">Initial Pipeline Stage</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {STAGES.map((st) => {
                const isActive = selectedStatus === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 10,
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: isActive ? 'var(--accent)' : 'var(--page)',
                      color: isActive ? '#ffffff' : 'var(--t2)',
                      border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Details Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>{showAdvanced ? '− Hide Details' : '+ Add Compensation & Notes (Optional)'}</span>
            </button>

            {showAdvanced && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeIn 0.15s ease' }}>
                <div>
                  <label className="lbl">Target Compensation / Range</label>
                  <input
                    className="inp"
                    placeholder="e.g. $165,000 or $150k - $180k"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    style={{ fontSize: 12.5 }}
                  />
                </div>

                <div>
                  <label className="lbl">Quick Notes / Referral Info</label>
                  <textarea
                    className="inp"
                    rows={2}
                    placeholder="Referred by Alex Chen, applied via Ashby, recruiter call scheduled for Friday..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ fontSize: 12.5 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              style={{ fontSize: 13, padding: '9px 16px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary"
              style={{
                fontSize: 13,
                fontWeight: 800,
                padding: '9px 20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Sparkles size={14} />
              <span>{loading ? 'Adding...' : 'Add to Pipeline'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
