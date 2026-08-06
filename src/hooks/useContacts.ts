import { useState, useEffect } from 'react';
import {
  subscribeToContacts,
  addContactItem,
  updateContactItem,
  deleteContactItem,
  type ReferralContactItem,
} from '../firebase/firestore';
import { useAuthStore } from '../store/authStore';

export const useContacts = () => {
  const user = useAuthStore((s) => s.user);
  const [contacts, setContacts] = useState<ReferralContactItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }

    if (contacts.length === 0) {
      setLoading(true);
    }
    const unsubscribe = subscribeToContacts(
      user.uid,
      (items) => {
        setContacts(items);
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

  const addContact = async (item: Omit<ReferralContactItem, 'id' | 'uid'>) => {
    if (!user) throw new Error('User not authenticated');
    return addContactItem(user.uid, item);
  };

  const updateContact = async (contactId: string, item: Partial<Omit<ReferralContactItem, 'id' | 'uid'>>) => {
    if (!user) throw new Error('User not authenticated');
    return updateContactItem(contactId, item);
  };

  const deleteContact = async (contactId: string) => {
    if (!user) throw new Error('User not authenticated');
    return deleteContactItem(contactId);
  };

  return { contacts, loading, error, addContact, updateContact, deleteContact };
};
