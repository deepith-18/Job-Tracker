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

    setLoading(true);

    const unsubscribe = subscribeToApplications(
      user.uid,
      (apps) => setApplications(apps),
      (err) => setError(err.message)
    );

    return unsubscribe;
  }, [user, setApplications, setError, setLoading]);

  return { applications, loading, error };
};
