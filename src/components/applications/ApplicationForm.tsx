import { AlertTriangle, BarChart, FileText, Mic, Save, Briefcase, Plus, Clock } from 'lucide-react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { APPLICATION_STATUSES, COMMON_SOURCES, type Application, type ApplicationFormData, type ApplicationStatus } from '../../types';

interface Props {
  initial?: Application;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  onCancel: () => void;
}

const toDate = (d: unknown): string => {
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

const fromDate = (s: string): Date | null => (s ? new Date(s + 'T00:00:00') : null);

// Star rating input
const StarInput: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          onClick={() => onChange(i === value ? 0 : i)}
          onMouseEnter={() => setHov(i)}
          onMouseLeave={() => setHov(0)}
          style={{
            fontSize: 22,
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            transform: hov >= i ? 'scale(1.25)' : 'scale(1)',
            color: (hov || value) >= i ? '#fbbf24' : '#e2e8f0',
            userSelect: 'none',
          }}
        >
          ★
        </span>
      ))}
      {value > 0 && (
        <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600, marginLeft: 6 }}>
          {['', 'Interesting', 'Worth trying', 'Good fit', 'Great match', 'Top Tier Target'][value]}
        </span>
      )}
    </div>
  );
};

export const ApplicationForm: React.FC<Props> = ({ initial, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    company: initial?.company ?? '',
    role: initial?.role ?? '',
    status: (initial?.status ?? 'Applied') as ApplicationStatus,
    appliedDate: initial
      ? toDate(initial.appliedDate ?? (initial.status === 'Applied' ? initial.createdAt : null))
      : toDate(new Date()),
    deadline: toDate(initial?.deadline ?? null),
    jobLink: initial?.jobLink ?? '',
    source: initial?.source ?? '',
    notes: initial?.notes ?? '',
    interviewNotes: initial?.interviewNotes ?? '',
    rating: initial?.rating ?? 3,
    rejectionReasons: (initial?.rejectionReasons ?? []) as string[],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.company.trim()) e.company = 'Company is required';
    if (!form.role.trim()) e.role = 'Role is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await onSubmit({
        company: form.company.trim(),
        role: form.role.trim(),
        status: form.status,
        appliedDate: fromDate(form.appliedDate),
        deadline: fromDate(form.deadline),
        jobLink: form.jobLink.trim(),
        source: form.source.trim(),
        notes: form.notes.trim(),
        interviewNotes: form.interviewNotes.trim(),
        rating: form.rating,
        rejectionReasons: form.rejectionReasons,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save application';
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {errors.form && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
          <AlertTriangle className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> {errors.form}
        </div>
      )}

      {/* When editing: show when this application was originally added */}
      {initial?.createdAt && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 12,
            background: 'var(--card-hover, rgba(0,0,0,0.02))',
            border: '1px solid var(--border)',
            fontSize: 12,
            color: 'var(--t2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock style={{ width: 14, height: 14, color: 'var(--accent)' }} />
            <span>Application Added on: <strong>{format(new Date(initial.createdAt), 'MMM d, yyyy')}</strong></span>
          </div>
          {initial.updatedAt && (
            <span style={{ fontSize: 11, color: 'var(--t3)' }}>
              Last updated {format(new Date(initial.updatedAt), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      )}

      {/* Responsive 2-Column Section Layout */}
      <div className="modal-form-grid">
        {/* Left Column: Company & Role */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Briefcase className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Company & Role
          </div>

          <div>
            <label className="lbl">Company Name *</label>
            <input
              className="inp"
              placeholder="e.g. Google, Stripe"
              value={form.company}
              onChange={set('company')}
              autoFocus
              style={{ borderColor: errors.company ? '#ef4444' : undefined }}
            />
            {errors.company && (
              <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 4, fontWeight: 600 }}>{errors.company}</p>
            )}
          </div>

          <div>
            <label className="lbl">Role Title *</label>
            <input
              className="inp"
              placeholder="e.g. Senior Frontend Engineer"
              value={form.role}
              onChange={set('role')}
              style={{ borderColor: errors.role ? '#ef4444' : undefined }}
            />
            {errors.role && (
              <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 4, fontWeight: 600 }}>{errors.role}</p>
            )}
          </div>

          <div>
            <label className="lbl">Dream Rating</label>
            <StarInput value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
          </div>
        </div>

        {/* Right Column: Status & Timeline */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <BarChart className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Pipeline & Timeline
          </div>

          <div>
            <label className="lbl">Pipeline Status</label>
            <select
              className="inp"
              value={form.status}
              onChange={(e) => {
                const newStatus = e.target.value as ApplicationStatus;
                setForm((f) => ({
                  ...f,
                  status: newStatus,
                  appliedDate: (newStatus === 'Applied' && !f.appliedDate) ? toDate(new Date()) : f.appliedDate,
                }));
              }}
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form-grid-compact">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="lbl" style={{ margin: 0 }}>Applied Date</label>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, appliedDate: toDate(new Date()) }))}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--accent)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Today
                </button>
              </div>
              <input type="date" className="inp" value={form.appliedDate} onChange={set('appliedDate')} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="lbl" style={{ margin: 0 }}>Deadline</label>
                {form.deadline && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, deadline: '' }))}
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
              <input type="date" className="inp" value={form.deadline} onChange={set('deadline')} />
            </div>
          </div>

          <div className="modal-form-grid-compact">
            <div>
              <label className="lbl">Job URL</label>
              <input type="url" className="inp" placeholder="https://..." value={form.jobLink} onChange={set('jobLink')} />
            </div>

            <div>
              <label className="lbl">Source</label>
              <input
                className="inp"
                list="modal-sources-list"
                placeholder="LinkedIn, Referral..."
                value={form.source}
                onChange={set('source')}
              />
              <datalist id="modal-sources-list">
                {COMMON_SOURCES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Notes Section */}
      <div className="modal-form-grid">
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
          <label className="lbl"><FileText className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Application Notes</label>
          <textarea
            className="inp"
            rows={3}
            placeholder="Salary range, tech stack, key takeaways..."
            value={form.notes}
            onChange={set('notes')}
            style={{ resize: 'vertical', lineHeight: 1.5, marginTop: 6 }}
          />
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
          <label className="lbl"><Mic className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Interview Notes</label>
          <textarea
            className="inp"
            rows={3}
            placeholder="Questions asked, topics to review..."
            value={form.interviewNotes}
            onChange={set('interviewNotes')}
            style={{ resize: 'vertical', lineHeight: 1.5, marginTop: 6 }}
          />
        </div>
      </div>

      {/* Footer Buttons */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingTop: 18,
          borderTop: '1px solid var(--border)',
          marginTop: 10,
        }}
      >
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={loading}
          style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {loading ? 'Saving…' : initial ? (
            <>
              <Save style={{ width: 14, height: 14 }} />
              <span>Save Changes</span>
            </>
          ) : (
            <>
              <Plus style={{ width: 15, height: 15 }} />
              <span>Add Application</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
