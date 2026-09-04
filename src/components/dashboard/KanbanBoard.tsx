import React from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { KanbanCard } from './KanbanCard';
import { useToast } from '../ui/ToastContext';
import { updateApplication } from '../../firebase/firestore';
import type { Application, ApplicationStatus } from '../../types';
import { APPLICATION_STATUSES } from '../../types';

interface KanbanBoardProps {
  applications: Application[];
  selectedStatusFilter?: ApplicationStatus | 'All';
  onCardClick: (app: Application) => void;
  onStatusFilterClear?: () => void;
}

const COLUMN_THEMES: Record<ApplicationStatus, { label: string; bg: string; dot: string; countBg: string; text: string }> = {
  Wishlist:        { label: 'Wishlist', bg: 'var(--card-hover)', dot: '#94a3b8', countBg: 'rgba(148,163,184,0.18)', text: 'var(--t1)' },
  Applied:         { label: 'Applied', bg: 'var(--card-hover)', dot: '#0ea5e9', countBg: 'rgba(14,165,233,0.18)', text: '#0284c7' },
  'OA/Assessment': { label: 'OA / Assessment', bg: 'var(--card-hover)', dot: '#8b5cf6', countBg: 'rgba(139,92,246,0.18)', text: '#7c3aed' },
  Interview:       { label: 'Interview', bg: 'var(--card-hover)', dot: '#f59e0b', countBg: 'rgba(245,158,11,0.18)', text: '#d97706' },
  Offer:           { label: 'Offer', bg: 'var(--card-hover)', dot: '#10b981', countBg: 'rgba(16,185,129,0.18)', text: '#059669' },
  Ghosted:         { label: 'Ghosted / No Reply', bg: 'var(--card-hover)', dot: '#64748b', countBg: 'rgba(100,116,139,0.18)', text: 'var(--t2)' },
  Rejected:        { label: 'Rejected', bg: 'var(--card-hover)', dot: '#f43f5e', countBg: 'rgba(244,63,94,0.18)', text: '#e11d48' },
  Withdrawn:       { label: 'Withdrawn', bg: 'var(--card-hover)', dot: '#94a3b8', countBg: 'rgba(148,163,184,0.18)', text: 'var(--t2)' },
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  selectedStatusFilter = 'All',
  onCardClick,
  onStatusFilterClear,
}) => {
  const { addToast } = useToast();

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside or in same position
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as ApplicationStatus;
    const targetApp = applications.find((a) => a.id === draggableId);

    if (!targetApp) return;

    try {
      await updateApplication(draggableId, { status: newStatus });
      addToast(
        `Moved to ${newStatus}`,
        `Updated status for ${targetApp.company} (${targetApp.role})`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating status';
      addToast('Failed to update status', msg, 'error');
    }
  };

  const visibleStatuses =
    selectedStatusFilter && selectedStatusFilter !== 'All'
      ? APPLICATION_STATUSES.filter((s) => s === selectedStatusFilter)
      : APPLICATION_STATUSES;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, width: '100%' }}>
      {/* Active Filter Indicator */}
      {selectedStatusFilter && selectedStatusFilter !== 'All' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent)',
            borderRadius: 12,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--accent)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🔍 Board filtered to status: <strong>{selectedStatusFilter}</strong></span>
          </div>
          {onStatusFilterClear && (
            <button
              onClick={onStatusFilterClear}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12, padding: '4px 10px' }}
            >
              Clear Filter ✕
            </button>
          )}
        </div>
      )}

      {/* Kanban Board Columns Container */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 16,
            alignItems: 'start',
            width: '100%',
            minWidth: 0,
          }}
          className="kanban-grid"
        >
          {visibleStatuses.map((status) => {
            const theme = COLUMN_THEMES[status];
            const columnApps = applications.filter((a) => a.status === status);

            return (
              <div
                key={status}
                style={{
                  minWidth: 280,
                  width: 280,
                  flexShrink: 0,
                  background: 'var(--card-hover)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 220px)',
                  minHeight: 400,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--card)',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: theme.dot,
                        boxShadow: `0 0 0 3px ${theme.countBg}`,
                      }}
                    />
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)' }}>
                      {theme.label}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: theme.text,
                      background: theme.countBg,
                      padding: '2px 8px',
                      borderRadius: 12,
                    }}
                  >
                    {columnApps.length}
                  </span>
                </div>

                {/* Droppable Card Area */}
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        padding: 12,
                        flex: 1,
                        overflowY: 'auto',
                        background: snapshot.isDraggingOver ? 'rgba(99,102,241,0.05)' : 'transparent',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      {columnApps.length === 0 ? (
                        <div
                          style={{
                            border: '2px dashed var(--border)',
                            borderRadius: 12,
                            padding: '30px 16px',
                            textAlign: 'center',
                            color: 'var(--t3)',
                            fontSize: 12.5,
                            marginTop: 8,
                          }}
                        >
                          Drop cards here
                        </div>
                      ) : (
                        columnApps.map((app, index) => (
                          <KanbanCard
                            key={app.id}
                            application={app}
                            index={index}
                            onClick={onCardClick}
                          />
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};
