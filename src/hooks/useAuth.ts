import { useEffect } from 'react';
import { onAuthStateChange, checkRedirectResult } from '../firebase/auth';
import { initializeUserCollections } from '../firebase/firestore';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Check if guest user session exists in local storage
    const getGuestUser = () => {
      try {
        const saved = localStorage.getItem('applyflow_guest_user');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse guest user:', e);
      }
      return null;
    };

    // 1. Register auth state listener.
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoading(false);
        try {
          await initializeUserCollections(firebaseUser.uid, firebaseUser.email);
        } catch (err) {
          console.error('initializeUserCollections failed:', err);
        }
      } else {
        const guest = getGuestUser();
        if (guest) {
          setUser(guest);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    // 2. Process OAuth redirect result in parallel
    checkRedirectResult()
      .then(async (result) => {
        if (result?.user) {
          localStorage.removeItem('applyflow_guest_user');
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
