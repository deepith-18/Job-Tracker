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
  Wishlist:       { label: 'Wishlist', bg: '#f8fafc', dot: '#94a3b8', countBg: '#e2e8f0', text: '#475569' },
  Applied:        { label: 'Applied', bg: '#eff6ff', dot: '#3b82f6', countBg: '#dbeafe', text: '#1d4ed8' },
  'OA/Assessment':{ label: 'OA / Assessment', bg: '#f5f3ff', dot: '#8b5cf6', countBg: '#ede9fe', text: '#6d28d9' },
  Interview:      { label: 'Interview', bg: '#fffbeb', dot: '#f59e0b', countBg: '#fef3c7', text: '#b45309' },
  Offer:          { label: 'Offer 🎉', bg: '#f0fdf4', dot: '#10b981', countBg: '#dcfce7', text: '#15803d' },
  Rejected:       { label: 'Rejected', bg: '#fff1f2', dot: '#ef4444', countBg: '#ffe4e6', text: '#be123c' },
  Withdrawn:      { label: 'Withdrawn', bg: '#f8fafc', dot: '#64748b', countBg: '#e2e8f0', text: '#475569' },
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
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 220px)',
                  minHeight: 400,
                  boxShadow: '0 2px 8px rgba(15,23,42,0.03)',
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
                    background: '#ffffff',
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
                            border: '2px dashed #e2e8f0',
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
