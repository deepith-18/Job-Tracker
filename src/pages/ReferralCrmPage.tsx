import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../components/layout/AppShell';
import { useToast } from '../components/ui/ToastContext';
import { useContacts } from '../hooks/useContacts';

interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  linkedIn: string;
  status: 'Contacted' | 'Coffee Chat' | 'Referral Submitted' | 'Follow Up Needed';
  notes: string;
}

const INITIAL_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    company: 'Stripe',
    role: 'Staff Software Engineer',
    email: 'sarah.c@stripe.com',
    linkedIn: 'https://linkedin.com/in/sarahchen',
    status: 'Referral Submitted',
    notes: 'Connected via Stanford Alumni network. Submitted internal referral for Senior Fullstack Role.',
  },
  {
    id: '2',
    name: 'Alex Rivera',
    company: 'Google',
    role: 'Engineering Manager',
    email: 'arivera@google.com',
    linkedIn: 'https://linkedin.com/in/alexrivera',
    status: 'Coffee Chat',
    notes: 'Had 30-min virtual coffee chat discussing Cloud infrastructure team culture.',
  },
];

export const ReferralCrmPage: React.FC = () => {
  const { addToast } = useToast();
  const { contacts: firestoreContacts, loading, addContact, updateContact, deleteContact } = useContacts();

  const contacts = firestoreContacts.length === 0 && !loading ? INITIAL_CONTACTS : firestoreContacts;
  const [modal, setModal] = useState<{ open: boolean; editContact?: Contact }>({ open: false });

  // Form inputs
  const [nameInput, setNameInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [linkedInInput, setLinkedInInput] = useState('');
  const [statusInput, setStatusInput] = useState<Contact['status']>('Contacted');
  const [notesInput, setNotesInput] = useState('');

  const openAddModal = () => {
    setNameInput('');
    setCompanyInput('');
    setRoleInput('Software Engineer');
    setEmailInput('');
    setLinkedInInput('');
    setStatusInput('Contacted');
    setNotesInput('');
    setModal({ open: true });
  };

  const openEditModal = (c: Contact) => {
    setNameInput(c.name);
    setCompanyInput(c.company);
    setRoleInput(c.role);
    setEmailInput(c.email);
    setLinkedInInput(c.linkedIn);
    setStatusInput(c.status);
    setNotesInput(c.notes);
    setModal({ open: true, editContact: c });
  };

  const handleDeleteContact = async (id: string, name: string) => {
    if (!window.confirm(`Delete contact "${name}"?`)) return;
    try {
      await deleteContact(id);
      addToast('Contact Deleted 🗑️', name, 'info');
    } catch {
      addToast('Error', 'Failed to delete contact', 'error');
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      if (modal.editContact) {
        await updateContact(modal.editContact.id, {
          name: nameInput.trim(),
          company: companyInput.trim() || 'Tech Company',
          role: roleInput.trim() || 'Engineer',
          email: emailInput.trim(),
          linkedIn: linkedInInput.trim(),
          status: statusInput,
          notes: notesInput.trim(),
        });
        addToast('Contact Updated ✏️', nameInput, 'success');
      } else {
        await addContact({
          name: nameInput.trim(),
          company: companyInput.trim() || 'Tech Company',
          role: roleInput.trim() || 'Engineer',
          email: emailInput.trim(),
          linkedIn: linkedInInput.trim(),
          status: statusInput,
          notes: notesInput.trim(),
        });
        addToast('Contact Added 🤝', nameInput, 'success');
      }
      setModal({ open: false });
    } catch {
      addToast('Save Error', 'Failed to save contact to Firestore', 'error');
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">🤝 Networking & Referral CRM</h1>
            <p className="page-sub">
              Manage internal referrals, alumni contacts, coffee chats, and recruiter outreach
            </p>
          </div>

          <button onClick={openAddModal} className="btn btn-primary" style={{ borderRadius: 12, fontSize: 13 }}>
            + Add Contact
          </button>
        </div>
      </div>

      <div className="pb">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {contacts.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ padding: 20 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>{c.name}</h3>
                  <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 2 }}>
                    {c.role} @ <strong>{c.company}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEditModal(c)} className="btn btn-ghost btn-sm" style={{ fontSize: 12, padding: '4px 6px' }}>
                    ✏️
                  </button>
                  <button onClick={() => handleDeleteContact(c.id, c.name)} className="btn btn-ghost btn-sm" style={{ fontSize: 12, padding: '4px 6px' }}>
                    🗑️
                  </button>
                </div>
              </div>

              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: c.status === 'Referral Submitted' ? '#047857' : '#4338ca',
                  background: c.status === 'Referral Submitted' ? '#ecfdf5' : '#e0e7ff',
                  padding: '3px 8px',
                  borderRadius: 10,
                  display: 'inline-block',
                  marginBottom: 12,
                }}
              >
                ● {c.status}
              </span>

              {c.notes && (
                <div style={{ fontSize: 12, color: 'var(--t2)', background: '#f8fafc', padding: 10, borderRadius: 10, marginBottom: 12 }}>
                  {c.notes}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                {c.email && (
                  <a href={`mailto:${c.email}`} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
                    📧 Email
                  </a>
                )}
                {c.linkedIn && (
                  <a href={c.linkedIn} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
                    🔗 LinkedIn
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add / Edit Contact Modal */}
      <AnimatePresence>
        {modal.open && (
          <div className="modal-backdrop" onClick={() => setModal({ open: false })}>
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 480, padding: 24 }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
                {modal.editContact ? '✏️ Edit Contact' : '🤝 Add Referral Contact'}
              </h2>

              <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="lbl">Contact Name *</label>
                  <input
                    className="inp"
                    placeholder="e.g. Sarah Chen"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="lbl">Company</label>
                    <input
                      className="inp"
                      placeholder="e.g. Stripe"
                      value={companyInput}
                      onChange={(e) => setCompanyInput(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="lbl">Role</label>
                    <input
                      className="inp"
                      placeholder="e.g. Staff Engineer"
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="lbl">Outreach Status</label>
                  <select
                    className="inp"
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value as Contact['status'])}
                  >
                    <option value="Contacted">Contacted</option>
                    <option value="Coffee Chat">Coffee Chat Scheduled</option>
                    <option value="Referral Submitted">Referral Submitted</option>
                    <option value="Follow Up Needed">Follow Up Needed</option>
                  </select>
                </div>

                <div>
                  <label className="lbl">LinkedIn / Email</label>
                  <input
                    className="inp"
                    placeholder="sarah@stripe.com or https://linkedin.com/..."
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                </div>

                <div>
                  <label className="lbl">Notes / Conversation Summary</label>
                  <textarea
                    className="inp"
                    rows={3}
                    placeholder="Connected via alumni network..."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" onClick={() => setModal({ open: false })} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modal.editContact ? 'Save Changes' : 'Save Contact'}
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
