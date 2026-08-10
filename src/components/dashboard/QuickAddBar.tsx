import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ui/ToastContext';
import { addApplication } from '../../firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import type { Application } from '../../types';

interface QuickAddBarProps {
  applications: Application[];
  onAdded?: () => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ applications, onAdded }) => {
  const user = useAuthStore((s) => s.user);
  const { addToast } = useToast();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [duplicateWarn, setDuplicateWarn] = useState<{ company: string; role: string; rawLink: string } | null>(null);

  const parseInput = (raw: string) => {
    const trimmed = raw.trim();
    let company = '';
    let role = 'Software Engineer';
    let jobLink = '';

    // Check if it's a URL
    if (/^(http:\/\/|https:\/\/|www\.)/i.test(trimmed)) {
      jobLink = trimmed.startsWith('www.') ? `https://${trimmed}` : trimmed;
      try {
        const urlObj = new URL(jobLink);
        const host = urlObj.hostname.replace(/^www\./, '');
        const parts = host.split('.');
        const domainName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Company';
        company = domainName;
        // Try parsing path segments for role
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
      // Split by —, -, :, or /
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

  const executeAdd = async (company: string, role: string, jobLink: string) => {
    if (!user) {
      addToast('Please sign in to add applications', undefined, 'error');
      return;
    }

    setLoading(true);
    try {
      await addApplication(user.uid, {
        company,
        role,
        status: 'Wishlist',
        appliedDate: null,
        deadline: null,
        jobLink,
        notes: '',
        interviewNotes: '',
        source: jobLink ? 'Web' : 'Quick-Add',
        rating: 3,
        rejectionReasons: [],
      });

      addToast(`Added "${company} — ${role}" to Wishlist 🚀`, 'You can view and update details anytime', 'success');
      setInput('');
      setDuplicateWarn(null);
      if (onAdded) onAdded();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      addToast('Failed to add application', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const { company, role, jobLink } = parseInput(input);
    if (!company) return;

    // Duplicate detection check
    const existing = applications.find(
      (a) =>
        a.company.toLowerCase().trim() === company.toLowerCase().trim() &&
        a.role.toLowerCase().trim() === role.toLowerCase().trim()
    );

    if (existing) {
      setDuplicateWarn({ company, role, rawLink: jobLink });
      addToast(
        `Duplicate Warning: ${company} — ${role}`,
        'An application for this company and role already exists',
        'warning'
      );
      return;
    }

    executeAdd(company, role, jobLink);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setInput('');
      setDuplicateWarn(null);
    }
  };

  return (
    <div style={{ marginBottom: 24, position: 'relative' }}>
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
            border: '1.5px solid var(--border)',
            borderRadius: 16,
            padding: '6px 8px 6px 18px',
            boxShadow: '0 8px 30px rgba(99,102,241,0.08), 0 2px 8px rgba(15,23,42,0.04)',
            transition: 'all 0.2s ease',
          }}
          className="quick-add-container"
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginRight: 12,
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>

          <input
            type="text"
            className="quick-add-input"
            placeholder='Type "Google — Software Engineer" or paste link…'
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (duplicateWarn) setDuplicateWarn(null);
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 13.5,
              fontWeight: 500,
              color: 'var(--t1)',
            }}
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{
              padding: '8px 14px',
              borderRadius: 12,
              fontSize: 12.5,
              fontWeight: 700,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg className="w-4 h-4 animate-spin-os" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} strokeDasharray="30 10" />
                </svg>
                Adding…
              </span>
            ) : (
              'Quick Add ↵'
            )}
          </button>
        </div>
      </form>

      {/* Duplicate Warning Dialog Banner */}
      <AnimatePresence>
        {duplicateWarn && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            style={{
              marginTop: 10,
              padding: '12px 16px',
              borderRadius: 12,
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#9a3412' }}>
                  Duplicate Entry Found
                </div>
                <div style={{ fontSize: 12, color: '#c2410c' }}>
                  An application for <strong>{duplicateWarn.company}</strong> — <em>{duplicateWarn.role}</em> already exists.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setDuplicateWarn(null)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12 }}
              >
                Cancel
              </button>
              <button
                onClick={() => executeAdd(duplicateWarn.company, duplicateWarn.role, duplicateWarn.rawLink)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: 12, background: 'linear-gradient(145deg, #ea580c, #c2410c)' }}
              >
                Add Anyway
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
