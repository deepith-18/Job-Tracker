import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { Application } from '../../types';
import { StatusDropdown } from './StatusDropdown';
import { updateApplication } from '../../firebase/firestore';
import type { ApplicationStatus } from '../../types';

interface ApplicationCardProps {
  application: Application;
  index: number;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  index,
  onEdit,
  onDelete,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (status: ApplicationStatus) => {
    setUpdatingStatus(true);
    try {
      await updateApplication(application.id, { status });
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const companyInitial = application.company.charAt(0).toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, scale: 0.96 }}
      transition={{
        layout: { type: 'spring', damping: 30, stiffness: 400 },
        opacity: { duration: 0.25, delay: index * 0.06 },
        y: { duration: 0.3, delay: index * 0.06 },
      }}
      className="card-glass p-5 group transition-all duration-200"
      style={{
        borderColor: dropdownOpen ? 'var(--accent)' : 'var(--border-subtle)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!dropdownOpen) {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            '0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(124,106,247,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 8px 32px rgba(0,0,0,0.24)';
      }}
    >
      <div className="flex items-start gap-4">
        {/* Company Avatar */}
        <div
          className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-lg font-bold select-none"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(107,89,232,0.3)',
          }}
        >
          {companyInitial}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className="font-semibold text-base truncate leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {application.company}
              </h3>
              <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                {application.role}
              </p>
            </div>

            {/* Action buttons — visible on hover */}
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
              <button
                onClick={() => onEdit(application)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(application)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
                  e.currentTarget.style.color = '#f87171';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <StatusDropdown
              current={application.status}
              isOpen={dropdownOpen}
              onOpen={() => setDropdownOpen(true)}
              onClose={() => setDropdownOpen(false)}
              onSelect={handleStatusChange}
            />

            {updatingStatus && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Saving…
              </span>
            )}

            {application.appliedDate && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Applied {format(application.appliedDate, 'MMM d, yyyy')}
              </span>
            )}

            {application.deadline && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-md"
                style={{
                  background: 'rgba(251,191,36,0.1)',
                  color: '#fbbf24',
                }}
              >
                Due {format(application.deadline, 'MMM d')}
              </span>
            )}

            {application.source && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                via {application.source}
              </span>
            )}

            {application.jobLink && (
              <a
                href={application.jobLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium transition-colors duration-150 flex items-center gap-1"
                style={{ color: 'var(--accent)' }}
                onClick={e => e.stopPropagation()}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Job Link
              </a>
            )}
          </div>

          {/* Notes preview */}
          {application.notes && (
            <p
              className="text-xs mt-2 line-clamp-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {application.notes}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
