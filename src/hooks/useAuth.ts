import { useEffect } from 'react';
import { onAuthStateChange, checkRedirectResult } from '../firebase/auth';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Process mobile OAuth redirect result if returning from Google login
    checkRedirectResult().then((result) => {
      if (result?.user) {
        setUser(result.user);
      }
    }).catch(() => {
      // Ignore redirect check error if not coming from redirect
    });

    const unsubscribe = onAuthStateChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [setUser, setLoading]);

  return { user, loading };
};
