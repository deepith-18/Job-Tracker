import { useState, useEffect } from 'react';
import { subscribeToUserSettings, saveUserSettings, type UserSettingsData } from '../firebase/firestore';
import { useAuthStore } from '../store/authStore';

export const useUserSettings = () => {
  const user = useAuthStore((s) => s.user);
  const [settings, setSettings] = useState<UserSettingsData>({
    goal: 100,
    streak: 1,
    lastActive: '',
    targetTitle: 'Senior Full-Stack Engineer',
    minSalary: 160000,
    remotePref: 'Remote / Hybrid',
    emailAlerts: true,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserSettings(
      user.uid,
      (data) => {
        setSettings(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const updateSettings = async (newSettings: Partial<UserSettingsData>) => {
    if (!user) return;
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    await saveUserSettings(user.uid, newSettings);
  };

  return { settings, loading, updateSettings };
};
