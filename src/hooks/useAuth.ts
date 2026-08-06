import { useEffect } from 'react';
import { onAuthStateChange, checkRedirectResult } from '../firebase/auth';
import { initializeUserCollections } from '../firebase/firestore';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Process mobile OAuth redirect result if returning from Google login
    checkRedirectResult().then((result) => {
      if (result?.user) {
        setUser(result.user);
        initializeUserCollections(result.user.uid, result.user.email);
      }
    }).catch(() => {
      // Ignore redirect check error if not coming from redirect
    });

    const unsubscribe = onAuthStateChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        initializeUserCollections(firebaseUser.uid, firebaseUser.email);
      }
    });
    return unsubscribe;
  }, [setUser, setLoading]);

  return { user, loading };
};
