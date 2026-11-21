import { useEffect } from 'react';
import { onAuthStateChange, checkRedirectResult } from '../firebase/auth';
import { initializeUserCollections } from '../firebase/firestore';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, loading, setUser, setLoading, setAuthError } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    // 1. Process OAuth redirect result in parallel (if returning from redirect login)
    checkRedirectResult()
      .then(async (result) => {
        if (!isMounted) return;
        if (result?.user) {
          setUser(result.user);
          setLoading(false);
          try {
            await initializeUserCollections(result.user.uid, result.user.email);
          } catch (err) {
            console.error('initializeUserCollections failed after redirect:', err);
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        const code = (err as { code?: string })?.code ?? '';
        if (code === 'auth/unauthorized-domain') {
          const host = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
          setAuthError(`This domain (${host}) is not authorized in Firebase Console. Go to Firebase Console → Authentication → Settings → Authorized domains and add "${host}".`);
        } else if (code && code !== 'auth/popup-closed-by-user') {
          console.warn('Redirect result check:', err?.message || err);
        }
      });

    // 2. Register auth state listener
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (!isMounted) return;
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        try {
          await initializeUserCollections(firebaseUser.uid, firebaseUser.email);
        } catch (err) {
          console.error('initializeUserCollections failed:', err);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setUser, setLoading, setAuthError]);

  return { user, loading };
};
