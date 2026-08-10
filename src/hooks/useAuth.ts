import { useEffect } from 'react';
import { onAuthStateChange, checkRedirectResult } from '../firebase/auth';
import { initializeUserCollections } from '../firebase/firestore';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // 1. Immediately register auth state listener.
    // This resolves authenticated user instantly from IndexedDB cache / Firebase Auth state.
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
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

    // 2. Process OAuth redirect result in parallel (if returning from redirect login)
    checkRedirectResult()
      .then(async (result) => {
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
        if (err?.code !== 'auth/popup-closed-by-user') {
          console.warn('Redirect result check:', err?.message || err);
        }
      });

    return unsubscribe;
  }, [setUser, setLoading]);

  return { user, loading };
};
