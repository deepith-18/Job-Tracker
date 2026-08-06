import { useEffect } from 'react';
import { subscribeToApplications } from '../firebase/firestore';
import { useApplicationStore } from '../store/applicationStore';
import { useAuthStore } from '../store/authStore';

export const useApplications = () => {
  const user = useAuthStore((s) => s.user);
  const { applications, loading, error, setApplications, setError, setLoading } =
    useApplicationStore();

  useEffect(() => {
    if (!user) {
      setApplications([]);
      return;
    }

    // Only set loading if we don't already have applications in store
    if (applications.length === 0) {
      setLoading(true);
    }

    const unsubscribe = subscribeToApplications(
      user.uid,
      (apps) => {
        setApplications(apps);
      },
      (err) => {
        console.error('Applications subscription error:', err);
        setError(err.message || 'Failed to sync applications with Firestore');
      }
    );

    return unsubscribe;
  }, [user, setApplications, setError, setLoading]);

  return { applications, loading, error };
};

