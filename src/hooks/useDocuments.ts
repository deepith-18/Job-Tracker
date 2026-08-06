import { useState, useEffect } from 'react';
import { subscribeToDocuments, addDocumentItem, deleteDocumentItem, type UserDocumentItem } from '../firebase/firestore';
import { useAuthStore } from '../store/authStore';

export const useDocuments = () => {
  const user = useAuthStore((s) => s.user);
  const [documents, setDocuments] = useState<UserDocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToDocuments(
      user.uid,
      (items) => {
        setDocuments(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const addDocument = async (item: Omit<UserDocumentItem, 'id' | 'uid'>) => {
    if (!user) throw new Error('User not authenticated');
    return addDocumentItem(user.uid, item);
  };

  const removeDocument = async (docId: string) => {
    if (!user) throw new Error('User not authenticated');
    return deleteDocumentItem(docId);
  };

  return { documents, loading, error, addDocument, removeDocument };
};
