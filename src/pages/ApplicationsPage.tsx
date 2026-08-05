import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays, isToday, isPast } from 'date-fns';
import { AppShell } from '../components/layout/AppShell';
import { QuickAddBar } from '../components/dashboard/QuickAddBar';
import { KanbanBoard } from '../components/dashboard/KanbanBoard';
import { ApplicationDetailDrawer } from '../components/dashboard/ApplicationDetailDrawer';
import { EmptyState } from '../components/dashboard/EmptyState';
import { StatusDropdown } from '../components/applications/StatusDropdown';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useApplications } from '../hooks/useApplications';
import { useApplicationStore } from '../store/applicationStore';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/ui/ToastContext';
import { addApplication, deleteApplication, updateApplication } from '../firebase/firestore';
import type { Application, ApplicationFormData, SortKey, ApplicationStatus, ViewMode } from '../types';

type ModalState =
  | { type: 'closed' }
  | { type: 'add' }
  | { type: 'edit'; app: Application }
  | { type: 'delete'; app: Application };

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'updatedAt', label: 'Last Updated' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'status', label: 'Status' },
  { key: 'company', label: 'Company A–Z' },
];

const STATUS_ORDER = ['Interview', 'Offer', 'OA/Assessment', 'Applied', 'Wishlist', 'Rejected', 'Withdrawn'];

const ALL_STATUSES = ['All', 'Wishlist', 'Applied', 'OA/Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

const DeadlineCell: React.FC<{ deadline: Date | null }> = ({ deadline }) => {
  if (!deadline) return <span style={{ color: 'var(--text-muted)' }}>—</span>;

  const daysLeft = differenceInDays(deadline, new Date());
  const past = isPast(deadline) && !isToday(deadline);
  const today = isToday(deadline);
  const near = daysLeft >= 0 && daysLeft <= 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{format(deadline, 'MMM d, yyyy')}</span>
      {past && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 700, padding: '1px 6px', borderRadius: 20, background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
          ⚠ Overdue
        </span>
      )}
      {today && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 700, padding: '1px 6px', borderRadius: 20, background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa' }}>
          🔥 Today!
        </span>
      )}
      {!past && !today && near && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 700, padding: '1px 6px', borderRadius: 20, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
          ⏰ {daysLeft}d left
        </span>
      )}
    </div>
  );
};

export const ApplicationsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { sortKey, setSortKey } = useApplicationStore();
  const { applications, loading, error } = useApplications();
  const { addToast } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [modal, setModal] = useState<ModalState>({ type: 'closed' });
  const [selectedAppDrawer, setSelectedAppDrawer] = useState<Application | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = [...applications];
    if (statusFilter !== 'All') list = list.filter((a) => a.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q)
      );
    }
    switch (sortKey) {
      case 'updatedAt':
        return list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      case 'deadline':
        return list.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.getTime() - b.deadline.getTime();
        });
      case 'status':
        return list.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
      case 'company':
        return list.sort((a, b) => a.company.localeCompare(b.company));
      default:
        return list;
    }
  }, [applications, sortKey, statusFilter, search]);

  const handleAdd = async (data: ApplicationFormData) => {
    if (!user) return;
    await addApplication(user.uid, data);
    addToast(`Added ${data.company}`, 'Application saved', 'success');
    setModal({ type: 'closed' });
  };

  const handleEdit = async (data: ApplicationFormData) => {
    if (modal.type !== 'edit') return;
    await updateApplication(modal.app.id, data);
    addToast(`Updated ${data.company}`, 'Changes saved', 'success');
    setModal({ type: 'closed' });
  };

  const handleDelete = async () => {
    if (modal.type !== 'delete') return;
    setDeleteLoading(true);
    try {
      await deleteApplication(modal.app.id);
      addToast('Application deleted', undefined, 'info');
      setModal({ type: 'closed' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, status: ApplicationStatus) => {
    await updateApplication(appId, { status });
    addToast('Status updated', `Moved to ${status}`, 'success');
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
              Applications Tracker
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {applications.length} application{applications.length !== 1 ? 's' : ''} total
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* Mode Switcher */}
            <div
              style={{
                display: 'flex',
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: 3,
                boxShadow: 'var(--shadow)',
              }}
            >
              <button
                onClick={() => setViewMode('kanban')}
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: 'none',
                  background: viewMode === 'kanban' ? 'var(--accent-bg)' : 'transparent',
                  color: viewMode === 'kanban' ? 'var(--accent)' : 'var(--t2)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                📋 Kanban
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: 'none',
                  background: viewMode === 'table' ? 'var(--accent-bg)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--accent)' : 'var(--t2)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                ☰ Table
              </button>
            </div>

            <button
              onClick={() => setModal({ type: 'add' })}
              className="btn btn-primary"
              style={{
                padding: '9px 18px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Add Application</span>
            </button>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Quick Add Bar */}
        <QuickAddBar applications={applications} />

        {/* Filters Bar */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{
                position: 'absolute',
                left: 11,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="inp"
              style={{ paddingLeft: 34, paddingTop: 7, paddingBottom: 7, fontSize: 13 }}
              placeholder="Search company, role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  border: `1px solid ${statusFilter === s ? 'var(--accent)' : 'var(--border)'}`,
                  background: statusFilter === s ? 'var(--accent-bg)' : '#fff',
                  color: statusFilter === s ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
            <select
              className="inp"
              style={{ padding: '6px 10px', width: 'auto', fontSize: 12 }}
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" className="animate-spin-os">
              <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth={2.5} />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />
            </svg>
          </div>
        ) : error ? (
          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, padding: '20px 24px', color: '#be123c', fontSize: 13 }}>
            ⚠ Failed to load applications: {error}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState />
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            applications={filtered}
            selectedStatusFilter={statusFilter as ApplicationStatus | 'All'}
            onCardClick={(app) => setSelectedAppDrawer(app)}
          />
        ) : (
          <div className="tbl-wrap">
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}>#</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Deadline</th>
                    <th>Source</th>
                    <th style={{ textAlign: 'right', width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filtered.map((app, index) => (
                      <motion.tr
                        key={app.id}
                        onClick={() => setSelectedAppDrawer(app)}
                        style={{ cursor: 'pointer' }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                      >
                        <td style={{ color: 'var(--t3)', fontSize: 12.5, fontWeight: 600 }}>{index + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 8,
                                background: 'linear-gradient(135deg, var(--accent-bg), #ddd6fe)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 800,
                                color: 'var(--accent)',
                              }}
                            >
                              {app.company.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 13.5 }}>{app.company}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{app.role}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <StatusDropdown
                            current={app.status}
                            isOpen={openDropdownId === app.id}
                            onOpen={() => setOpenDropdownId(app.id)}
                            onClose={() => setOpenDropdownId(null)}
                            onSelect={(status) => {
                              handleStatusChange(app.id, status);
                              setOpenDropdownId(null);
                            }}
                          />
                        </td>
                        <td style={{ fontSize: 13 }}>
                          {app.appliedDate ? format(app.appliedDate, 'MMM d, yyyy') : '—'}
                        </td>
                        <td>
                          <DeadlineCell deadline={app.deadline} />
                        </td>
                        <td>{app.source ? <span className="chip">{app.source}</span> : '—'}</td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setSelectedAppDrawer(app)}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: 6 }}
                              title="Edit Details"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setModal({ type: 'delete', app })}
                              className="btn btn-danger btn-sm"
                              style={{ padding: 6 }}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over detail drawer */}
      <ApplicationDetailDrawer
        application={selectedAppDrawer}
        isOpen={Boolean(selectedAppDrawer)}
        onClose={() => setSelectedAppDrawer(null)}
      />

      {/* Form Modals */}
      <Modal isOpen={modal.type === 'add'} onClose={() => setModal({ type: 'closed' })} title="Add Application">
        <ApplicationForm onSubmit={handleAdd} onCancel={() => setModal({ type: 'closed' })} />
      </Modal>

      <Modal isOpen={modal.type === 'edit'} onClose={() => setModal({ type: 'closed' })} title="Edit Application">
        {modal.type === 'edit' && (
          <ApplicationForm initial={modal.app} onSubmit={handleEdit} onCancel={() => setModal({ type: 'closed' })} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={modal.type === 'delete'}
        onConfirm={handleDelete}
        onCancel={() => setModal({ type: 'closed' })}
        title="Delete Application"
        message={modal.type === 'delete' ? `Remove "${modal.app.company} — ${modal.app.role}"?` : ''}
        loading={deleteLoading}
      />
    </AppShell>
  );
};
