import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  List,
  Grid,
  Plus,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  differenceInDays,
} from 'date-fns';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';

export interface ScheduledEvent {
  id: string;
  company: string;
  role: string;
  type: 'Interview' | 'OA / Assessment' | 'Deadline';
  date: Date;
  isFromApp?: boolean;
}

const STORAGE_KEY = 'job_orbit_calendar_custom_events_v2';

export const InterviewCalendarPage: React.FC = () => {
  const { applications } = useApplications();
  const { addToast } = useToast();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'agenda'>('week');

  // Load custom events from localStorage so user events are never lost on refresh
  const [customEvents, setCustomEvents] = useState<ScheduledEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          date: new Date(item.date),
        }));
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Persist custom events to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          customEvents.map((e) => ({
            id: e.id,
            company: e.company,
            role: e.role,
            type: e.type,
            date: e.date.toISOString(),
          }))
        )
      );
    } catch {
      // ignore
    }
  }, [customEvents]);

  // Combine application-driven events with custom events deterministically
  const allEvents = useMemo(() => {
    const appEvents: ScheduledEvent[] = applications
      .filter((a) => a.deadline || a.status === 'Interview' || a.status === 'OA/Assessment')
      .map((app) => {
        // Deterministic date: deadline > appliedDate > createdAt
        const rawDate = app.deadline || app.appliedDate || app.createdAt;
        const parsedDate = new Date(rawDate);
        const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

        return {
          id: `app-${app.id}`,
          company: app.company,
          role: app.role,
          type: (app.status === 'Interview'
            ? 'Interview'
            : app.status === 'OA/Assessment'
            ? 'OA / Assessment'
            : 'Deadline') as ScheduledEvent['type'],
          date: validDate,
          isFromApp: true,
        };
      });

    // Merge custom events and application events
    return [...appEvents, ...customEvents];
  }, [applications, customEvents]);

  // Modal State
  const [eventModal, setEventModal] = useState<{ open: boolean; editEvent?: ScheduledEvent }>({
    open: false,
  });
  const [companyInput, setCompanyInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [typeInput, setTypeInput] = useState<ScheduledEvent['type']>('Interview');
  const [dateInput, setDateInput] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate((d) => subMonths(d, 1));
    } else {
      setCurrentDate((d) => subWeeks(d, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate((d) => addMonths(d, 1));
    } else {
      setCurrentDate((d) => addWeeks(d, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const openAddModal = (initialDate?: Date) => {
    setCompanyInput('');
    setRoleInput('Software Engineer');
    setTypeInput('Interview');
    setDateInput(format(initialDate || currentDate, 'yyyy-MM-dd'));
    setEventModal({ open: true });
  };

  const openEditModal = (ev: ScheduledEvent) => {
    setCompanyInput(ev.company);
    setRoleInput(ev.role);
    setTypeInput(ev.type);
    setDateInput(format(ev.date, 'yyyy-MM-dd'));
    setEventModal({ open: true, editEvent: ev });
  };

  const handleDeleteEvent = (id: string, company: string, isFromApp?: boolean) => {
    if (isFromApp) {
      addToast('Application Event', 'Edit status in Applications table or drawer', 'info');
      return;
    }
    if (!window.confirm(`Delete calendar event for ${company}?`)) return;
    setCustomEvents((prev) => prev.filter((e) => e.id !== id));
    addToast('Event Deleted', company, 'info');
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyInput.trim()) return;

    if (eventModal.editEvent) {
      if (eventModal.editEvent.isFromApp) {
        addToast('Application Event', 'Edit status directly on the application card', 'info');
        setEventModal({ open: false });
        return;
      }
      setCustomEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventModal.editEvent?.id
            ? {
                ...ev,
                company: companyInput.trim(),
                role: roleInput.trim() || 'Software Engineer',
                type: typeInput,
                date: new Date(`${dateInput}T12:00:00`),
              }
            : ev
        )
      );
      addToast('Calendar Event Updated', companyInput, 'success');
    } else {
      const newEv: ScheduledEvent = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        company: companyInput.trim(),
        role: roleInput.trim() || 'Software Engineer',
        type: typeInput,
        date: new Date(`${dateInput}T12:00:00`),
      };
      setCustomEvents((prev) => [...prev, newEv]);
      addToast('Event Scheduled', companyInput, 'success');
    }

    setEventModal({ open: false });
  };

  const exportIcsFile = (event: ScheduledEvent) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Job Orbit//Career Calendar//EN
BEGIN:VEVENT
SUMMARY:${event.type}: ${event.company} (${event.role})
DESCRIPTION:Scheduled ${event.type} for ${event.role} position at ${event.company}.
DTSTART:${format(event.date, "yyyyMMdd'T'100000'Z'")}
DTEND:${format(event.date, "yyyyMMdd'T'110000'Z'")}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.company.replace(/[^a-zA-Z0-9]/g, '_')}_${event.type}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Calendar Exported', `Saved .ics file for ${event.company}`, 'success');
  };

  // Week Days calculation
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });

  // Month Days calculation (grid aligned by week)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthGridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: monthGridStart, end: monthGridEnd });

  // Sorted upcoming events for Agenda view
  const upcomingEvents = useMemo(() => {
    return [...allEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [allEvents]);

  return (
    <AppShell>
      {/* ── Top Header Bar ── */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Calendar style={{ width: 22, height: 22, color: 'var(--accent)' }} />
              <span>Interview Calendar & Deadlines</span>
            </h1>
            <p className="page-sub">
              Deterministic schedule of interviews, assessments, and application deadlines with 1-click .ics export.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* View Mode Switcher */}
            <div style={{ display: 'flex', background: 'var(--page)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
              <button
                onClick={() => setViewMode('week')}
                style={{
                  border: 'none',
                  background: viewMode === 'week' ? 'var(--card)' : 'transparent',
                  color: viewMode === 'week' ? 'var(--accent)' : 'var(--t3)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Grid style={{ width: 13, height: 13 }} />
                <span>Week</span>
              </button>
              <button
                onClick={() => setViewMode('month')}
                style={{
                  border: 'none',
                  background: viewMode === 'month' ? 'var(--card)' : 'transparent',
                  color: viewMode === 'month' ? 'var(--accent)' : 'var(--t3)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Calendar style={{ width: 13, height: 13 }} />
                <span>Month</span>
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                style={{
                  border: 'none',
                  background: viewMode === 'agenda' ? 'var(--card)' : 'transparent',
                  color: viewMode === 'agenda' ? 'var(--accent)' : 'var(--t3)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <List style={{ width: 13, height: 13 }} />
                <span>Agenda</span>
              </button>
            </div>

            <button onClick={() => openAddModal()} className="btn btn-primary" style={{ borderRadius: 12, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus style={{ width: 16, height: 16 }} />
              <span>Schedule Event</span>
            </button>
          </div>
        </div>

        {/* ── Sub-header: Navigation Bar ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 18,
            padding: '12px 18px',
            borderRadius: 14,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handlePrev}
              className="btn btn-ghost btn-sm"
              style={{ width: 34, height: 34, padding: 0, borderRadius: 10 }}
              title="Previous period"
            >
              <ChevronLeft style={{ width: 18, height: 18 }} />
            </button>
            <button
              onClick={handleToday}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12, fontWeight: 700, borderRadius: 8, padding: '4px 12px' }}
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="btn btn-ghost btn-sm"
              style={{ width: 34, height: 34, padding: 0, borderRadius: 10 }}
              title="Next period"
            >
              <ChevronRight style={{ width: 18, height: 18 }} />
            </button>

            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0, marginLeft: 6 }}>
              {viewMode === 'month'
                ? format(currentDate, 'MMMM yyyy')
                : `${format(weekDays[0], 'MMM d')} – ${format(weekDays[6], 'MMM d, yyyy')}`}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: '#6366f1' }} />
              <span style={{ color: 'var(--t2)', fontWeight: 600 }}>Interview</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: '#f59e0b' }} />
              <span style={{ color: 'var(--t2)', fontWeight: 600 }}>OA / Assessment</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: '#ef4444' }} />
              <span style={{ color: 'var(--t2)', fontWeight: 600 }}>Deadline</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* ═══════════════════════════════════════════════════════════
            1. WEEK VIEW
        ═══════════════════════════════════════════════════════════ */}
        {viewMode === 'week' && (
          <div className="card" style={{ padding: 20, borderRadius: 18, border: '1px solid var(--border)' }}>
            <div style={{ overflowX: 'auto', paddingBottom: 6 }}>
              <div className="calendar-week-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(140px, 1fr))', gap: 12, minWidth: 800 }}>
                {weekDays.map((day) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const dayEvents = allEvents.filter(
                    (e) => format(e.date, 'yyyy-MM-dd') === dayKey
                  );
                  const isCurrentDay = isToday(day);

                  return (
                    <div
                      key={day.toISOString()}
                      style={{
                        background: isCurrentDay ? 'rgba(99, 102, 241, 0.05)' : 'var(--page)',
                        border: isCurrentDay ? '2px solid var(--accent)' : '1px solid var(--border)',
                        borderRadius: 14,
                        padding: 12,
                        minHeight: 220,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: isCurrentDay ? 'var(--accent)' : 'var(--t3)', textTransform: 'uppercase' }}>
                          {format(day, 'EEE')}
                        </span>
                        {isCurrentDay && (
                          <span style={{ fontSize: 9.5, fontWeight: 800, padding: '1px 6px', borderRadius: 6, background: 'var(--accent)', color: '#fff' }}>
                            TODAY
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: 19, fontWeight: 900, color: isCurrentDay ? 'var(--accent)' : 'var(--t1)', marginBottom: 12 }}>
                        {format(day, 'd')}
                      </div>

                      {/* Event Cards */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                        {dayEvents.map((ev) => {
                          const isInterview = ev.type === 'Interview';
                          const isOA = ev.type === 'OA / Assessment';
                          const themeColor = isInterview ? '#6366f1' : isOA ? '#f59e0b' : '#ef4444';

                          return (
                            <div
                              key={ev.id}
                              style={{
                                background: 'var(--card)',
                                border: `1px solid var(--border)`,
                                borderLeft: `3.5px solid ${themeColor}`,
                                borderRadius: 10,
                                padding: '8px 10px',
                                fontSize: 11.5,
                                position: 'relative',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span
                                  onClick={() => exportIcsFile(ev)}
                                  style={{ fontWeight: 800, color: 'var(--t1)', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                  title="Click to export .ics event to Google Calendar"
                                >
                                  {ev.company}
                                </span>

                                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                  <button
                                    onClick={() => exportIcsFile(ev)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--t3)' }}
                                    title="Export .ics"
                                  >
                                    <Download style={{ width: 12, height: 12 }} />
                                  </button>
                                  {!ev.isFromApp && (
                                    <>
                                      <button
                                        onClick={() => openEditModal(ev)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--t3)' }}
                                        title="Edit Event"
                                      >
                                        <Pencil style={{ width: 12, height: 12 }} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteEvent(ev.id, ev.company, ev.isFromApp)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--t3)' }}
                                        title="Delete Event"
                                      >
                                        <Trash2 style={{ width: 12, height: 12 }} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div style={{ fontSize: 10.5, color: 'var(--t2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {ev.role}
                              </div>

                              <div style={{ display: 'inline-block', fontSize: 9.5, fontWeight: 700, color: themeColor, marginTop: 4 }}>
                                {ev.type}
                              </div>
                            </div>
                          );
                        })}

                        {dayEvents.length === 0 && (
                          <div
                            onClick={() => openAddModal(day)}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 8,
                              border: '1px dashed transparent',
                              color: 'var(--t3)',
                              fontSize: 11,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              opacity: 0.6,
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.border = '1px dashed var(--accent)';
                              (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
                              (e.currentTarget as HTMLElement).style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.border = '1px dashed transparent';
                              (e.currentTarget as HTMLElement).style.color = 'var(--t3)';
                              (e.currentTarget as HTMLElement).style.opacity = '0.6';
                            }}
                          >
                            + Add
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            2. MONTH VIEW
        ═══════════════════════════════════════════════════════════ */}
        {viewMode === 'month' && (
          <div className="card" style={{ padding: 20, borderRadius: 18, border: '1px solid var(--border)' }}>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(100px, 1fr))', gap: 8, minWidth: 700 }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
                  <div key={dayName} style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: 'var(--t3)', padding: 6, textTransform: 'uppercase' }}>
                    {dayName}
                  </div>
                ))}

                {monthDays.map((day) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const dayEvents = allEvents.filter((e) => format(e.date, 'yyyy-MM-dd') === dayKey);
                  const inCurrentMonth = isSameMonth(day, currentDate);
                  const isCurrentDay = isToday(day);

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => openAddModal(day)}
                      style={{
                        background: isCurrentDay ? 'rgba(99, 102, 241, 0.08)' : inCurrentMonth ? 'var(--page)' : 'rgba(0,0,0,0.02)',
                        border: isCurrentDay ? '2px solid var(--accent)' : '1px solid var(--border)',
                        opacity: inCurrentMonth ? 1 : 0.45,
                        borderRadius: 12,
                        padding: 8,
                        minHeight: 90,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: isCurrentDay ? 900 : 700, color: isCurrentDay ? 'var(--accent)' : 'var(--t1)' }}>
                          {format(day, 'd')}
                        </span>
                        {dayEvents.length > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 10, background: 'var(--accent)', color: '#fff' }}>
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}>
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 5px',
                              borderRadius: 4,
                              background: ev.type === 'Interview' ? '#e0e7ff' : '#fef3c7',
                              color: ev.type === 'Interview' ? '#3730a3' : '#92400e',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {ev.company}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div style={{ fontSize: 9.5, color: 'var(--t3)', fontWeight: 700, paddingLeft: 2 }}>
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            3. AGENDA LIST VIEW
        ═══════════════════════════════════════════════════════════ */}
        {viewMode === 'agenda' && (
          <div className="card" style={{ padding: 24, borderRadius: 18, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock style={{ width: 18, height: 18, color: 'var(--accent)' }} />
              <span>Chronological Event Schedule ({upcomingEvents.length})</span>
            </h3>

            {upcomingEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)' }}>
                <Calendar style={{ width: 36, height: 36, margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No scheduled events found</p>
                <button onClick={() => openAddModal()} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                  + Schedule Your First Event
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingEvents.map((ev) => {
                  const daysDiff = differenceInDays(ev.date, new Date());
                  const isInterview = ev.type === 'Interview';
                  const themeColor = isInterview ? '#6366f1' : ev.type === 'OA / Assessment' ? '#f59e0b' : '#ef4444';

                  return (
                    <div
                      key={ev.id}
                      style={{
                        background: 'var(--page)',
                        padding: '14px 18px',
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        borderLeft: `4px solid ${themeColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div
                          style={{
                            minWidth: 50,
                            textAlign: 'center',
                            background: 'var(--card)',
                            padding: '6px 8px',
                            borderRadius: 10,
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase' }}>
                            {format(ev.date, 'MMM')}
                          </div>
                          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--t1)', lineHeight: 1 }}>
                            {format(ev.date, 'd')}
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong style={{ fontSize: 14, color: 'var(--t1)' }}>{ev.company}</strong>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 10,
                                background: isInterview ? '#e0e7ff' : '#fef3c7',
                                color: isInterview ? '#3730a3' : '#92400e',
                              }}
                            >
                              {ev.type}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>
                            {ev.role} • {format(ev.date, 'EEEE, MMMM d, yyyy')}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: daysDiff < 0 ? '#ef4444' : daysDiff === 0 ? '#10b981' : 'var(--accent)',
                          }}
                        >
                          {daysDiff < 0 ? 'Passed' : daysDiff === 0 ? 'Scheduled Today!' : `In ${daysDiff} days`}
                        </span>

                        <button
                          onClick={() => exportIcsFile(ev)}
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 11.5, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          title="Export to Google / Apple Calendar"
                        >
                          <Download style={{ width: 12, height: 12 }} />
                          <span>.ics</span>
                        </button>

                        {!ev.isFromApp && (
                          <>
                            <button
                              onClick={() => openEditModal(ev)}
                              className="btn btn-ghost btn-sm"
                              style={{ width: 28, height: 28, padding: 0 }}
                              title="Edit Event"
                            >
                              <Pencil style={{ width: 13, height: 13 }} />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(ev.id, ev.company, ev.isFromApp)}
                              className="btn btn-ghost btn-sm"
                              style={{ width: 28, height: 28, padding: 0, color: '#ef4444' }}
                              title="Delete Event"
                            >
                              <Trash2 style={{ width: 13, height: 13 }} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add / Edit Event Modal ── */}
      <AnimatePresence>
        {eventModal.open && (
          <div className="modal-backdrop" onClick={() => setEventModal({ open: false })}>
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 480, padding: 24, borderRadius: 18 }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                {eventModal.editEvent ? (
                  <>
                    <Pencil style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                    <span>Edit Scheduled Event</span>
                  </>
                ) : (
                  <>
                    <Calendar style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                    <span>Schedule Calendar Event</span>
                  </>
                )}
              </h2>

              <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="lbl">Company Name *</label>
                  <input
                    className="inp"
                    placeholder="e.g. Netflix, Stripe, Google"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="lbl">Role Title</label>
                  <input
                    className="inp"
                    placeholder="e.g. Senior Software Engineer"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                  />
                </div>

                <div>
                  <label className="lbl">Event Type</label>
                  <select
                    className="inp"
                    value={typeInput}
                    onChange={(e) => setTypeInput(e.target.value as ScheduledEvent['type'])}
                  >
                    <option value="Interview">Technical / Behavioral Interview</option>
                    <option value="OA / Assessment">Online Assessment / Take-Home</option>
                    <option value="Deadline">Application Deadline</option>
                  </select>
                </div>

                <div>
                  <label className="lbl">Date</label>
                  <input
                    type="date"
                    className="inp"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" onClick={() => setEventModal({ open: false })} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles style={{ width: 14, height: 14 }} />
                    <span>{eventModal.editEvent ? 'Save Changes' : 'Schedule Event'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
};
