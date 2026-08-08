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
    // start the auth state listener.
    checkRedirectResult()
      .then(async (result) => {
        if (result?.user) {
          setUser(result.user);
          // Wrap in try/catch — a Firestore permission error here must NOT
          // prevent the auth flow from completing
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
      })
      .finally(() => {
        redirectChecked.current = true;

        // Step 2: NOW register the auth state listener.
        authUnsubscribe = onAuthStateChange(async (firebaseUser) => {
          setUser(firebaseUser);
          // Always set loading=false regardless of what happens next
          setLoading(false);

          if (firebaseUser) {
            // Wrap in try/catch — Firestore errors must NOT prevent login
            try {
              await initializeUserCollections(firebaseUser.uid, firebaseUser.email);
            } catch (err) {
              console.error('initializeUserCollections failed:', err);
              // Don't block login — user can still use the app
            }
          }
        });
      });

    return () => {
      if (authUnsubscribe) authUnsubscribe();
    };
  }, [setUser, setLoading]);

  return { user, loading };
};
