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
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    return signInWithRedirect(auth, provider);
  }

  try {
    return await signInWithPopup(auth, provider);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? '';
    if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request' || code === 'auth/popup-closed-by-user') {
      return signInWithRedirect(auth, provider);
    }
    throw err;
  }
};

export const checkRedirectResult = () => getRedirectResult(auth);

export const signOutUser = () => signOut(auth);

export const onAuthStateChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

