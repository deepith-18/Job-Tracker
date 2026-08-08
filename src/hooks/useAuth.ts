import { useEffect, useRef } from 'react';
import { onAuthStateChange, checkRedirectResult } from '../firebase/auth';
import { initializeUserCollections } from '../firebase/firestore';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, loading, setUser, setLoading } = useAuthStore();
  const redirectChecked = useRef(false);

  useEffect(() => {
    let authUnsubscribe: (() => void) | null = null;

    // Step 1: Process mobile OAuth redirect result FIRST.
    // On mobile, signInWithRedirect causes a full page redirect to Google.
    // When the user returns, getRedirectResult() must resolve BEFORE we
    // start the auth state listener. Otherwise onAuthStateChanged fires
    // with user=null, ProtectedRoute sees loading=false + no user,
    // and kicks the user back to /login.
    checkRedirectResult()
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          initializeUserCollections(result.user.uid, result.user.email);
        }
      })
      .catch((err) => {
        // Only log non-trivial errors (ignore "no redirect" scenarios)
        if (err?.code !== 'auth/popup-closed-by-user') {
          console.warn('Redirect result check:', err?.message || err);
        }
      })
      .finally(() => {
        redirectChecked.current = true;

        // Step 2: NOW register the auth state listener.
        // This fires immediately with current auth state (cached or null).
        authUnsubscribe = onAuthStateChange((firebaseUser) => {
          setUser(firebaseUser);
          setLoading(false);
          if (firebaseUser) {
            initializeUserCollections(firebaseUser.uid, firebaseUser.email);
          }
        });
      });

    return () => {
      if (authUnsubscribe) authUnsubscribe();
    };
  }, [setUser, setLoading]);

  return { user, loading };
};

