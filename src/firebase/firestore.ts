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
