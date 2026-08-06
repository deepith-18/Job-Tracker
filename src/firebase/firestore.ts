import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, serverTimestamp, Timestamp, type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { Application, ApplicationFormData } from '../types';

const COL = 'applications';

const docToApp = (id: string, data: Record<string, unknown>): Application => ({
  id,
  uid: data.uid as string,
  company: data.company as string,
  role: data.role as string,
  status: data.status as Application['status'],
  appliedDate: data.appliedDate instanceof Timestamp ? data.appliedDate.toDate() : null,
  deadline: data.deadline instanceof Timestamp ? data.deadline.toDate() : null,
  firstResponseDate: data.firstResponseDate instanceof Timestamp ? data.firstResponseDate.toDate() : null,
  interviewDates: Array.isArray(data.interviewDates) ? data.interviewDates : [],
  jobLink: (data.jobLink as string) || '',
  notes: (data.notes as string) || '',
  interviewNotes: (data.interviewNotes as string) || '',
  source: (data.source as string) || '',
  rating: (data.rating as number) || 0,
  rejectionReasons: (data.rejectionReasons as string[]) || [],
  createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
  updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
});

export const subscribeToApplications = (
  uid: string,
  callback: (apps: Application[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const q = query(collection(db, COL), where('uid', '==', uid));
  return onSnapshot(q,
    (snap) => callback(snap.docs.map(d => docToApp(d.id, d.data() as Record<string, unknown>))),
    onError
  );
};

export const addApplication = async (uid: string, data: ApplicationFormData) => {
  const ref = await addDoc(collection(db, COL), {
    uid,
    company: data.company,
    role: data.role,
    status: data.status,
    appliedDate: data.appliedDate ? Timestamp.fromDate(data.appliedDate) : (data.status === 'Applied' ? Timestamp.fromDate(new Date()) : null),
    deadline: data.deadline ? Timestamp.fromDate(data.deadline) : null,
    firstResponseDate: data.firstResponseDate ? Timestamp.fromDate(data.firstResponseDate) : null,
    interviewDates: data.interviewDates || [],
    jobLink: data.jobLink || '',
    notes: data.notes || '',
    interviewNotes: data.interviewNotes || '',
    source: data.source || '',
    rating: data.rating || 0,
    rejectionReasons: data.rejectionReasons || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateApplication = async (appId: string, data: Partial<ApplicationFormData>) => {
  const ref = doc(db, COL, appId);
  const u: Record<string, unknown> = { updatedAt: serverTimestamp() };
  const fields = ['company','role','status','jobLink','notes','interviewNotes','source','rating','rejectionReasons','interviewDates'] as const;
  fields.forEach(k => { if (data[k] !== undefined) u[k] = data[k]; });
  if (data.appliedDate !== undefined) u.appliedDate = data.appliedDate ? Timestamp.fromDate(data.appliedDate) : null;
  if (data.deadline !== undefined) u.deadline = data.deadline ? Timestamp.fromDate(data.deadline) : null;
  if (data.firstResponseDate !== undefined) u.firstResponseDate = data.firstResponseDate ? Timestamp.fromDate(data.firstResponseDate) : null;
  
  // Auto-set first response date when status transitions away from Wishlist / Applied to an active outcome
  if (data.status && ['OA/Assessment', 'Interview', 'Offer', 'Rejected'].includes(data.status)) {
    u.firstResponseDate = data.firstResponseDate ? Timestamp.fromDate(data.firstResponseDate) : serverTimestamp();
  }

  await updateDoc(ref, u);
};

export const deleteApplication = async (appId: string) => deleteDoc(doc(db, COL, appId));

// ── DOCUMENTS ──
const DOC_COL = 'documents';

export interface UserDocumentItem {
  id: string;
  uid: string;
  name: string;
  type: string;
  date: string;
  size: string;
  url?: string;
  createdAt?: Date;
}

export const subscribeToDocuments = (
  uid: string,
  callback: (docs: UserDocumentItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(collection(db, DOC_COL), where('uid', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          uid: (data.uid as string) || uid,
          name: (data.name as string) || 'Document',
          type: (data.type as string) || 'Document',
          date: (data.date as string) || new Date().toISOString().split('T')[0],
          size: (data.size as string) || '0 KB',
          url: (data.url as string) || '',
        };
      });
      callback(items);
    },
    onError
  );
};

export const addDocumentItem = async (uid: string, item: Omit<UserDocumentItem, 'id' | 'uid'>) => {
  const ref = await addDoc(collection(db, DOC_COL), {
    uid,
    name: item.name,
    type: item.type,
    date: item.date,
    size: item.size,
    url: item.url || '',
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const deleteDocumentItem = async (docId: string) => deleteDoc(doc(db, DOC_COL, docId));

// ── REFERRAL CONTACTS ──
const CONTACT_COL = 'referral_contacts';

export interface ReferralContactItem {
  id: string;
  uid: string;
  name: string;
  company: string;
  role: string;
  email: string;
  linkedIn: string;
  status: 'Contacted' | 'Coffee Chat' | 'Referral Submitted' | 'Follow Up Needed';
  notes: string;
}

export const subscribeToContacts = (
  uid: string,
  callback: (contacts: ReferralContactItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(collection(db, CONTACT_COL), where('uid', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          uid: (data.uid as string) || uid,
          name: (data.name as string) || '',
          company: (data.company as string) || '',
          role: (data.role as string) || '',
          email: (data.email as string) || '',
          linkedIn: (data.linkedIn as string) || '',
          status: (data.status as ReferralContactItem['status']) || 'Contacted',
          notes: (data.notes as string) || '',
        };
      });
      callback(items);
    },
    onError
  );
};

export const addContactItem = async (uid: string, item: Omit<ReferralContactItem, 'id' | 'uid'>) => {
  const ref = await addDoc(collection(db, CONTACT_COL), {
    uid,
    name: item.name,
    company: item.company,
    role: item.role,
    email: item.email,
    linkedIn: item.linkedIn,
    status: item.status,
    notes: item.notes,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateContactItem = async (contactId: string, item: Partial<Omit<ReferralContactItem, 'id' | 'uid'>>) => {
  const ref = doc(db, CONTACT_COL, contactId);
  await updateDoc(ref, { ...item, updatedAt: serverTimestamp() });
};

export const deleteContactItem = async (contactId: string) => deleteDoc(doc(db, CONTACT_COL, contactId));

// ── USER SETTINGS (Goal & Streak) ──
const SETTINGS_COL = 'user_settings';

export interface UserSettingsData {
  goal: number;
  streak: number;
  lastActive: string;
}

export const subscribeToUserSettings = (
  uid: string,
  callback: (settings: UserSettingsData) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const ref = doc(db, SETTINGS_COL, uid);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callback({
          goal: typeof data.goal === 'number' ? data.goal : 100,
          streak: typeof data.streak === 'number' ? data.streak : 1,
          lastActive: typeof data.lastActive === 'string' ? data.lastActive : '',
        });
      } else {
        callback({ goal: 100, streak: 1, lastActive: '' });
      }
    },
    onError
  );
};

export const saveUserSettings = async (uid: string, settings: Partial<UserSettingsData>) => {
  const ref = doc(db, SETTINGS_COL, uid);
  await updateDoc(ref, { ...settings, uid, updatedAt: serverTimestamp() }).catch(async () => {
    const { setDoc } = await import('firebase/firestore');
    await setDoc(ref, {
      uid,
      goal: settings.goal ?? 100,
      streak: settings.streak ?? 1,
      lastActive: settings.lastActive ?? new Date().toDateString(),
      updatedAt: serverTimestamp(),
    });
  });
};

export const initializeUserCollections = async (uid: string, email?: string | null) => {
  try {
    const { setDoc } = await import('firebase/firestore');
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      uid,
      email: email || '',
      lastLogin: serverTimestamp(),
    }, { merge: true });

    const settingsRef = doc(db, SETTINGS_COL, uid);
    await setDoc(settingsRef, {
      uid,
      goal: 100,
      streak: 1,
      lastActive: new Date().toDateString(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.error('Failed to initialize user collections in Firestore:', err);
  }
};


