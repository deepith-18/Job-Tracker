import React from 'react';
import { differenceInDays, formatDistanceToNow } from 'date-fns';
import { Draggable } from '@hello-pangea/dnd';
import type { Application } from '../../types';

interface KanbanCardProps {
  application: Application;
  index: number;
  onClick: (app: Application) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ application, index, onClick }) => {
  // Days since applied aging calculation
  const referenceDate = application.appliedDate || application.createdAt;
  const daysDiff = differenceInDays(new Date(), new Date(referenceDate));
  
  let agingClass = 'aging-normal';
  let agingIcon = '⏱️';
  let agingLabel = formatDistanceToNow(new Date(referenceDate), { addSuffix: true });

  if (daysDiff >= 30) {
    agingClass = 'aging-red';
    agingIcon = '🚨';
    agingLabel = `${daysDiff}d ago · STALE`;
  } else if (daysDiff >= 14) {
    agingClass = 'aging-amber';
    agingIcon = '⚠️';
    agingLabel = `${daysDiff}d ago`;
  }

  const initial = application.company.charAt(0).toUpperCase();

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(application)}
          style={{
            userSelect: 'none',
            padding: '14px',
            marginBottom: '10px',
            borderRadius: '14px',
            background: snapshot.isDragging
              ? '#ffffff'
              : 'linear-gradient(145deg, #ffffff 0%, #fafbff 100%)',
            border: `1.5px solid ${snapshot.isDragging ? 'var(--accent)' : 'var(--border)'}`,
            boxShadow: snapshot.isDragging
              ? '0 16px 40px rgba(99,102,241,0.25), 0 4px 12px rgba(0,0,0,0.1)'
              : '0 2px 8px rgba(15,23,42,0.04)',
            cursor: 'grab',
            transition: 'all 0.18s ease',
            transform: snapshot.isDragging ? 'scale(1.02)' : 'none',
            ...provided.draggableProps.style,
          }}
          className="kanban-card group"
        >
          {/* Top row: Avatar + Company + Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 800,
                flexShrink: 0,
                boxShadow: '0 3px 8px rgba(99,102,241,0.3)',
              }}
            >
              {initial}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: 'var(--t1)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                }}
              >
                {application.company}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--t2)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: 2,
                }}
              >
                {application.role}
              </div>
            </div>

            {application.rating > 0 && (
              <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, flexShrink: 0 }}>
                ★ {application.rating}
              </div>
            )}
          </div>

          {/* Aging indicator pill */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 10 }}>
            <div
              className={`aging-badge ${agingClass}`}
              title={`Applied / Logged ${daysDiff} days ago`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <span>{agingIcon}</span>
              <span>{agingLabel}</span>
            </div>

            {/* Source chip or Link icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {application.source && (
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: 'var(--t3)',
                    background: '#f1f5f9',
                    padding: '2px 6px',
                    borderRadius: 6,
                  }}
                >
                  {application.source}
                </span>
              )}

              {application.jobLink && (
                <a
                  href={application.jobLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Open Job Link"
                  style={{
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: 'var(--accent-bg)',
                  }}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
