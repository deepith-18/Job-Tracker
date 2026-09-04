import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays, isToday, isPast } from 'date-fns';
import {
  Columns,
  List,
  LayoutGrid,
  Pencil,
  Trash2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Plus,
  Search,
  X,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { QuickAddBar } from '../components/dashboard/QuickAddBar';
import { KanbanBoard } from '../components/dashboard/KanbanBoard';
import { ApplicationDetailDrawer } from '../components/dashboard/ApplicationDetailDrawer';
import { EmptyState } from '../components/dashboard/EmptyState';
import { StatusDropdown } from '../components/applications/StatusDropdown';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import { JourneyCard } from '../components/applications/JourneyCard';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useApplications } from '../hooks/useApplications';
import { useApplicationStore } from '../store/applicationStore';
import { useAuthStore } from '../store/authStore';
import { useUserSettings } from '../hooks/useUserSettings';
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

const STATUS_ORDER = ['Interview', 'Offer', 'OA/Assessment', 'Applied', 'Wishlist', 'Ghosted', 'Rejected', 'Withdrawn'];

const ALL_STATUSES = ['All', 'Wishlist', 'Applied', 'OA/Assessment', 'Interview', 'Offer', 'Ghosted', 'Rejected', 'Withdrawn'];

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
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10.5,
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 20,
            background: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #fecaca',
            width: 'fit-content',
          }}
        >
          <AlertTriangle style={{ width: 11, height: 11 }} />
          <span>Overdue</span>
        </span>
      )}
      {today && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10.5,
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 20,
            background: '#fff7ed',
            color: '#9a3412',
            border: '1px solid #fed7aa',
            width: 'fit-content',
          }}
        >
          <Clock style={{ width: 11, height: 11 }} />
          <span>Today</span>
        </span>
      )}
      {!past && !today && near && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10.5,
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 20,
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #fde68a',
            width: 'fit-content',
          }}
        >
          <Clock style={{ width: 11, height: 11 }} />
          <span>{daysLeft}d left</span>
        </span>
      )}
    </div>
  );
};

export const ApplicationsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { sortKey, setSortKey } = useApplicationStore();
  const { applications, loading, error } = useApplications();
  const { settings } = useUserSettings();
  const location = useLocation();
  const navigate = useNavigate();

  // Mobile Quick-Capture FAB action trigger
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      setModal({ type: 'add' });
      navigate('/applications', { replace: true });
    }
  }, [location.search, navigate]);
  const { addToast } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [modal, setModal] = useState<ModalState>({ type: 'closed' });
  const [selectedAppDrawer, setSelectedAppDrawer] = useState<Application | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Sync default view mode from user settings once loaded
  useEffect(() => {
    if (settings?.defaultView) {
      setViewMode(settings.defaultView);
    }
  }, [settings?.defaultView]);

  // Calculate dynamic status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: applications.length };
    ALL_STATUSES.forEach((s) => {
      if (s !== 'All') {
        counts[s] = applications.filter((a) => a.status === s).length;
      }
    });
    return counts;
  }, [applications]);

  // Pipeline telemetry metrics
  const activeCount = useMemo(
    () => applications.filter((a) => !['Rejected', 'Withdrawn', 'Ghosted'].includes(a.status)).length,
    [applications]
  );
  const interviewCount = useMemo(() => applications.filter((a) => a.status === 'Interview').length, [applications]);
  const ghostedCount = useMemo(() => applications.filter((a) => a.status === 'Ghosted').length, [applications]);

  const filtered = useMemo(() => {
    let list = [...applications];
    if (statusFilter !== 'All') list = list.filter((a) => a.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q) ||
          (a.notes && a.notes.toLowerCase().includes(q))
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
    if (!user) {
      addToast('Please sign in to add applications', undefined, 'error');
      throw new Error('Please sign in to add applications');
    }
    setModal({ type: 'closed' });
    try {
      await addApplication(user.uid, data);
      addToast(`Added ${data.company}`, 'Application saved successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save application';
      addToast('Error adding application', msg, 'error');
    }
  };

  const handleEdit = async (data: ApplicationFormData) => {
    if (modal.type !== 'edit') return;
    const appId = modal.app.id;
    setModal({ type: 'closed' });
    try {
      await updateApplication(appId, data);
      addToast(`Updated ${data.company}`, 'Changes saved successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update application';
      addToast('Error updating application', msg, 'error');
    }
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
      {/* ── Page Header ── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
              Applications Pipeline
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {applications.length} total applications • {activeCount} active opportunities in flight
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* 3-Way Mode Switcher */}
            <div
              style={{
                display: 'flex',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: 3,
                boxShadow: 'var(--shadow)',
                maxWidth: '100%',
                overflowX: 'auto',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                style={{
                  padding: '7px 13px',
                  borderRadius: 9,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: 'none',
                  background: viewMode === 'kanban' ? 'var(--accent-bg)' : 'transparent',
                  color: viewMode === 'kanban' ? 'var(--accent)' : 'var(--t2)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                <Columns style={{ width: 14, height: 14 }} />
                <span>Kanban</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '7px 13px',
                  borderRadius: 9,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: 'none',
                  background: viewMode === 'table' ? 'var(--accent-bg)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--accent)' : 'var(--t2)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                <List style={{ width: 14, height: 14 }} />
                <span>Table</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('cards')}
                style={{
                  padding: '7px 13px',
                  borderRadius: 9,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: 'none',
                  background: viewMode === 'cards' ? 'var(--accent-bg)' : 'transparent',
                  color: viewMode === 'cards' ? 'var(--accent)' : 'var(--t2)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                <LayoutGrid style={{ width: 14, height: 14 }} />
                <span>Cards</span>
              </button>
            </div>

            {/* Add Application Button */}
            <button
              type="button"
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
              <Plus style={{ width: 16, height: 16 }} />
              <span>Add Application</span>
            </button>
          </div>
        </div>

        {/* Compact Telemetry Counters */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--t2)' }}>
            <Briefcase style={{ width: 13, height: 13, color: 'var(--accent)' }} />
            <span>Active:</span>
            <strong style={{ color: 'var(--t1)' }}>{activeCount}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--t2)' }}>
            <Calendar style={{ width: 13, height: 13, color: '#f59e0b' }} />
            <span>Interviews:</span>
            <strong style={{ color: '#f59e0b' }}>{interviewCount}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--t2)' }}>
            <AlertTriangle style={{ width: 13, height: 13, color: '#64748b' }} />
            <span>Ghosted / Stale:</span>
            <strong style={{ color: '#64748b' }}>{ghostedCount}</strong>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Quick Add Bar */}
        <QuickAddBar applications={applications} />

        {/* ── Filters & Search Bar ── */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 300 }}>
            <Search
              style={{
                position: 'absolute',
                left: 11,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                width: 14,
                height: 14,
              }}
            />
            <input
              className="inp"
              style={{ paddingLeft: 34, paddingRight: search ? 30 : 12, paddingTop: 7, paddingBottom: 7, fontSize: 13 }}
              placeholder="Search company, role, notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--t3)',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <X style={{ width: 13, height: 13 }} />
              </button>
            )}
          </div>

          {/* Status Filter Tabs with Counts */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 4,
              scrollbarWidth: 'none',
              maxWidth: '100%',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  border: `1px solid ${statusFilter === s ? 'var(--accent)' : 'var(--border)'}`,
                  background: statusFilter === s ? 'var(--accent-bg)' : 'var(--card)',
                  color: statusFilter === s ? 'var(--accent)' : 'var(--t2)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{s}</span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 10,
                    background: statusFilter === s ? 'var(--accent)' : 'var(--border-light)',
                    color: statusFilter === s ? '#ffffff' : 'var(--t3)',
                  }}
                >
                  {statusCounts[s] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Sort Selector */}
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

        {/* ── View Content ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" className="animate-spin-os">
              <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth={2.5} />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />
            </svg>
          </div>
        ) : error ? (
          <div
            style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 12,
              padding: '20px 24px',
              color: '#be123c',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle style={{ width: 16, height: 16 }} />
            <span>Failed to load applications: {error}</span>
          </div>
        ) : applications.length === 0 ? (
          <EmptyState />
        ) : viewMode === 'kanban' ? (
          /* 1. KANBAN BOARD VIEW */
          <KanbanBoard
            applications={filtered}
            selectedStatusFilter={statusFilter as ApplicationStatus | 'All'}
            onCardClick={(app) => setSelectedAppDrawer(app)}
          />
        ) : viewMode === 'cards' ? (
          /* 2. CARDS GRID VIEW */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
              gap: 16,
            }}
          >
            {filtered.map((app, index) => (
              <div
                key={app.id}
                onClick={() => setSelectedAppDrawer(app)}
                style={{ cursor: 'pointer' }}
              >
                <JourneyCard
                  app={app}
                  index={index}
                  onEdit={(app) => setModal({ type: 'edit', app })}
                  onDelete={(app) => setModal({ type: 'delete', app })}
                />
              </div>
            ))}
          </div>
        ) : (
          /* 3. TABLE VIEW */
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
                        transition={{ delay: index * 0.02, duration: 0.2 }}
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
                              type="button"
                              onClick={() => setSelectedAppDrawer(app)}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: 6 }}
                              title="Edit Details"
                            >
                              <Pencil style={{ width: 14, height: 14 }} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setModal({ type: 'delete', app })}
                              className="btn btn-danger btn-sm"
                              style={{ padding: 6 }}
                              title="Delete"
                            >
                              <Trash2 style={{ width: 14, height: 14 }} />
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
