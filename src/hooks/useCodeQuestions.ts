import { useEffect } from 'react';
import { subscribeToCodeQuestions } from '../firebase/firestore';
import { useCodeVaultStore } from '../store/codeVaultStore';
import { useAuthStore } from '../store/authStore';

export const useCodeQuestions = () => {
  const user = useAuthStore((s) => s.user);
  const {
    questions,
    loading,
    setQuestions,
    setLoading,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    toggleStar,
    resetToDefaults,
  } = useCodeVaultStore();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToCodeQuestions(
      user.uid,
      (remoteQuestions) => {
        setQuestions(remoteQuestions);
        setLoading(false);
      },
      (err) => {
        console.error('Code questions Firestore subscription error:', err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, setQuestions, setLoading]);

  return {
    questions,
    loading,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    toggleStar,
    resetToDefaults,
  };
};
