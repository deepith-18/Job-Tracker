import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  type User,
} from 'firebase/auth';
import { auth } from './config';

export const signUpWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);



export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  // Use signInWithPopup - it communicates via direct window messaging and does NOT rely on
  // cross-origin cookies or redirect handlers, which are blocked by Safari ITP and Chrome storage isolation.
  try {
    return await signInWithPopup(auth, provider);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? '';
    const msg = (err as { message?: string }).message ?? '';

    // If Chrome's IndexedDB connection is closing/locked, switch auth persistence to localStorage and retry immediately
    if (msg.includes('Database is closing') || msg.includes('database connection is closing') || code === 'auth/internal-error') {
      console.warn('IndexedDB closing/locked detected. Retrying with browserLocalPersistence (localStorage)...');
      try {
        await setPersistence(auth, browserLocalPersistence);
        return await signInWithPopup(auth, provider);
      } catch (retryErr) {
        throw retryErr;
      }
    }

    // If popup was explicitly blocked by the browser, try redirect fallback
    if (code === 'auth/popup-blocked') {
      console.warn('Popup login blocked by browser, attempting redirect fallback...');
      return await signInWithRedirect(auth, provider);
    }

    // Do NOT redirect for configuration or user cancellation errors:
    // auth/unauthorized-domain, auth/operation-not-allowed, auth/popup-closed-by-user, etc.
    // Must be thrown so the application can display actionable feedback.
    throw err;
  }
};

export const checkRedirectResult = () => getRedirectResult(auth);

export const signOutUser = async () => {
  try {
    localStorage.removeItem('applyflow_guest_user');
  } catch (e) {
    console.error('Failed to clear guest user:', e);
  }
  return signOut(auth);
};

export const onAuthStateChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);


