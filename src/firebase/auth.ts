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



export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  // Try popup first on all platforms (iOS Safari & Android Chrome support popup auth smoothly on direct tap).
  // This avoids iOS Safari ITP (Intelligent Tracking Prevention) issues that break cross-domain redirect auth.
  try {
    return await signInWithPopup(auth, provider);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? '';
    if (code === 'auth/popup-closed-by-user') {
      throw err;
    }
    // If popup is blocked by browser settings, fall back to redirect
    console.warn('Popup login blocked or failed, falling back to redirect:', code);
    return signInWithRedirect(auth, provider);
  }
};

export const checkRedirectResult = () => getRedirectResult(auth);

export const signOutUser = () => signOut(auth);

export const onAuthStateChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);


