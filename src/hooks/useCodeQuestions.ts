import { useEffect, useRef } from 'react';
import { subscribeToCodeQuestions, addCodeQuestionItem } from '../firebase/firestore';
import { useCodeVaultStore, INITIAL_CODE_QUESTIONS } from '../store/codeVaultStore';
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

  const isSeedingRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToCodeQuestions(
      user.uid,
      async (remoteQuestions) => {
        // If user has zero questions in Firestore, check if we should auto-seed or migrate local questions
        if (remoteQuestions.length === 0 && !isSeedingRef.current) {
          isSeedingRef.current = true;
          try {
            // Check if user has non-seed custom questions in localStorage
            const localCustom = questions.filter((q) => !q.id.startsWith('seed-'));
            const questionsToUpload = localCustom.length > 0 ? localCustom : INITIAL_CODE_QUESTIONS;

            for (const q of questionsToUpload) {
              await addCodeQuestionItem(user.uid, {
                title: q.title,
                company: q.company,
                round: q.round,
                difficulty: q.difficulty,
                topic: q.topic,
                language: q.language,
                code: q.code,
                timeComplexity: q.timeComplexity || '',
                spaceComplexity: q.spaceComplexity || '',
                approach: q.approach,
                followUps: q.followUps || '',
                isStarred: Boolean(q.isStarred),
                dateAdded: q.dateAdded || new Date().toISOString().split('T')[0],
                applicationId: q.applicationId || '',
              });
            }
          } catch (err) {
            console.warn('Auto-seed / migration of code questions encountered an error:', err);
          } finally {
            isSeedingRef.current = false;
            setLoading(false);
          }
        } else {
          setQuestions(remoteQuestions);
          setLoading(false);
        }
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
