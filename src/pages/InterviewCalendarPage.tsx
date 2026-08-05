import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';

interface ScheduledEvent {
  id: string;
  company: string;
  role: string;
  type: 'Interview' | 'OA / Assessment' | 'Deadline';
  date: Date;
}

export const InterviewCalendarPage: React.FC = () => {
  const { applications } = useApplications();
  const { addToast } = useToast();

  const [currentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Dynamic scheduled events state
  const initialEvents: ScheduledEvent[] = applications
    .filter((a) => a.appliedDate || a.deadline || a.status === 'Interview')
    .map((app) => ({
      id: app.id,
      company: app.company,
      role: app.role,
      type: app.status === 'Interview' ? 'Interview' : app.deadline ? 'Deadline' : 'OA / Assessment',
      date: app.deadline ? new Date(app.deadline) : new Date(app.appliedDate || Date.now()),
    }));

  const [customEvents, setCustomEvents] = useState<ScheduledEvent[]>(initialEvents);
  const [eventModal, setEventModal] = useState<{ open: boolean; editEvent?: ScheduledEvent }>({ open: false });

  // Form inputs
  const [companyInput, setCompanyInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [typeInput, setTypeInput] = useState<ScheduledEvent['type']>('Interview');
  const [dateInput, setDateInput] = useState(format(new Date(), 'yyyy-MM-dd'));

  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: addDays(currentWeekStart, 6),
  });

  const openAddModal = () => {
    setCompanyInput('');
    setRoleInput('Software Engineer');
    setTypeInput('Interview');
    setDateInput(format(new Date(), 'yyyy-MM-dd'));
    setEventModal({ open: true });
  };

  const openEditModal = (ev: ScheduledEvent) => {
    setCompanyInput(ev.company);
    setRoleInput(ev.role);
    setTypeInput(ev.type);
    setDateInput(format(ev.date, 'yyyy-MM-dd'));
    setEventModal({ open: true, editEvent: ev });
  };

  const handleDeleteEvent = (id: string, company: string) => {
    if (!window.confirm(`Delete calendar event for ${company}?`)) return;
    setCustomEvents((prev) => prev.filter((e) => e.id !== id));
    addToast('Event Deleted 🗑️', company, 'info');
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyInput.trim()) return;

    if (eventModal.editEvent) {
      setCustomEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventModal.editEvent?.id
            ? {
                ...ev,
                company: companyInput.trim(),
                role: roleInput.trim() || 'Software Engineer',
                type: typeInput,
                date: new Date(dateInput),
              }
            : ev
        )
      );
      addToast('Calendar Event Updated ✏️', companyInput, 'success');
    } else {
      const newEv: ScheduledEvent = {
        id: Math.random().toString(36).substring(2, 9),
        company: companyInput.trim(),
        role: roleInput.trim() || 'Software Engineer',
        type: typeInput,
        date: new Date(dateInput),
      };
      setCustomEvents((prev) => [...prev, newEv]);
      addToast('Event Scheduled 📅', companyInput, 'success');
    }

    setEventModal({ open: false });
  };

  const exportIcsFile = (event: ScheduledEvent) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ApplyFlow//Job Search Calendar//EN
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
    link.setAttribute('download', `${event.company}_${event.type}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Calendar Exported 📅', `Saved .ics file for ${event.company}`, 'success');
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">📅 Interview Calendar & Reminders</h1>
            <p className="page-sub">
              Schedule, edit, delete, and export interview rounds and assessment deadlines to Google Calendar
            </p>
          </div>

          <button onClick={openAddModal} className="btn btn-primary" style={{ borderRadius: 12, fontSize: 13 }}>
            + Schedule Event
          </button>
        </div>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Weekly Calendar Grid */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>
              📆 Week of {format(currentWeekStart, 'MMMM d, yyyy')}
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
            {weekDays.map((day) => {
              const dayEvents = customEvents.filter(
                (e) => format(e.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
              );

              return (
                <div
                  key={day.toISOString()}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: 12,
                    minHeight: 180,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase' }}>
                    {format(day, 'EEE')}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginTop: 2, marginBottom: 10 }}>
                    {format(day, 'd')}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        style={{
                          background: ev.type === 'Interview' ? '#e0e7ff' : '#fef3c7',
                          border: '1px solid ' + (ev.type === 'Interview' ? '#c7d2fe' : '#fde68a'),
                          borderRadius: 8,
                          padding: '6px 8px',
                          fontSize: 11.5,
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div
                            onClick={() => exportIcsFile(ev)}
                            style={{ fontWeight: 800, color: ev.type === 'Interview' ? '#3730a3' : '#92400e', cursor: 'pointer' }}
                            title="Click to export .ics calendar event"
                          >
                            {ev.company}
                          </div>

                          <div style={{ display: 'flex', gap: 2 }}>
                            <button
                              onClick={() => openEditModal(ev)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10 }}
                              title="Edit Event"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(ev.id, ev.company)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10 }}
                              title="Delete Event"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: 10.5, color: 'var(--t2)' }}>{ev.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      <AnimatePresence>
        {eventModal.open && (
          <div className="modal-backdrop" onClick={() => setEventModal({ open: false })}>
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 480, padding: 24 }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
                {eventModal.editEvent ? '✏️ Edit Scheduled Event' : '📅 Schedule Calendar Event'}
              </h2>

              <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="lbl">Company Name *</label>
                  <input
                    className="inp"
                    placeholder="e.g. Netflix, Stripe"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="lbl">Role Title</label>
                  <input
                    className="inp"
                    placeholder="e.g. Senior Backend Engineer"
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
                  <button type="submit" className="btn btn-primary">
                    {eventModal.editEvent ? 'Save Changes' : 'Schedule Event'}
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
