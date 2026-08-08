import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  type User,
} from 'firebase/auth';
import { auth } from './config';

export const signUpWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

/**
 * Detect if running on a mobile/tablet device.
 * Covers: phones, tablets, iPads (which report as Mac in newer Safari),
 * and PWA standalone mode on mobile.
 */
const isMobileDevice = (): boolean => {
  const ua = navigator.userAgent || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  // Direct UA match
  if (mobileRegex.test(ua)) return true;

  // iPad on iOS 13+ reports as Mac — detect via touch support
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;

  // Small viewport width (fallback for rare edge cases)
  if (typeof window !== 'undefined' && window.innerWidth <= 768) return true;

  return false;
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  // On mobile, always use redirect (popups are unreliable/blocked)
  if (isMobileDevice()) {
    return signInWithRedirect(auth, provider);
  }

  // On desktop, try popup first, fall back to redirect on any failure
  try {
    return await signInWithPopup(auth, provider);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? '';
    // For user-initiated closures, just re-throw (don't redirect)
    if (code === 'auth/popup-closed-by-user') {
      throw err;
    }
    // For all other popup failures (blocked, cancelled, CORS), use redirect
    console.warn('Popup login failed, falling back to redirect:', code);
    return signInWithRedirect(auth, provider);
  }
};

export const checkRedirectResult = () => getRedirectResult(auth);

export const signOutUser = () => signOut(auth);

export const onAuthStateChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);


