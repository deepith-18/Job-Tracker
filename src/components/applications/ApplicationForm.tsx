import React, { useState } from 'react';
import { APPLICATION_STATUSES, type Application, type ApplicationFormData, type ApplicationStatus } from '../../types';

interface Props {
  initial?: Application;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  onCancel: () => void;
}

const toDate = (d: Date | null) => (d ? d.toISOString().split('T')[0] : '');
const fromDate = (s: string): Date | null => (s ? new Date(s) : null);

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
          {['', 'Interesting', 'Worth trying', 'Good fit', 'Great match', '⭐ Dream Company'][value]}
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
    appliedDate: toDate(initial?.appliedDate ?? null),
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Spacious 2-Column Section Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left Column: Company & Role */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            🏢 Company & Role
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
            background: '#f8fafc',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            📊 Pipeline & Timeline
          </div>

          <div>
            <label className="lbl">Pipeline Status</label>
            <select className="inp" value={form.status} onChange={set('status')}>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="lbl">Applied Date</label>
              <input type="date" className="inp" value={form.appliedDate} onChange={set('appliedDate')} />
            </div>

            <div>
              <label className="lbl">Deadline</label>
              <input type="date" className="inp" value={form.deadline} onChange={set('deadline')} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="lbl">Job URL</label>
              <input type="url" className="inp" placeholder="https://..." value={form.jobLink} onChange={set('jobLink')} />
            </div>

            <div>
              <label className="lbl">Source</label>
              <input className="inp" placeholder="LinkedIn, Referral..." value={form.source} onChange={set('source')} />
            </div>
          </div>
        </div>
      </div>

      {/* Spacious 2-Column Notes Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 16, padding: 18 }}>
          <label className="lbl">📝 Application Notes</label>
          <textarea
            className="inp"
            rows={3}
            placeholder="Salary range, tech stack, key takeaways..."
            value={form.notes}
            onChange={set('notes')}
            style={{ resize: 'vertical', lineHeight: 1.5, marginTop: 6 }}
          />
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 16, padding: 18 }}>
          <label className="lbl">🎙️ Interview Notes</label>
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
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
        }}
      >
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
          Cancel (Esc)
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '10px 24px' }}>
          {loading ? 'Saving…' : initial ? '💾 Save Changes' : '✨ Add Application'}
        </button>
      </div>
    </form>
  );
};
