import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export interface SkillProficiency {
  id: string;
  skill: string;
  level: number; // 0 - 100
  rejectionImpact?: number;
}

export const DEFAULT_SKILLS: SkillProficiency[] = [
  { id: '1', skill: 'Data Structures & Algorithms', level: 75 },
  { id: '2', skill: 'System Design & Architecture', level: 65 },
  { id: '3', skill: 'Frontend & UI Frameworks', level: 85 },
  { id: '4', skill: 'Backend & Databases', level: 70 },
  { id: '5', skill: 'Communication & Behavioral', level: 80 },
  { id: '6', skill: 'OOP & Low-Level Design', level: 60 },
];

export const useSkills = () => {
  const user = useAuthStore((s) => s.user);
  const storageKey = `applyflow_skills_${user?.uid || 'guest'}`;

  const [skills, setSkills] = useState<SkillProficiency[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load user skills:', e);
    }
    return DEFAULT_SKILLS;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSkills(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load user skills:', e);
    }
    setSkills(DEFAULT_SKILLS);
  }, [storageKey]);

  const saveSkills = (newSkills: SkillProficiency[]) => {
    setSkills(newSkills);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newSkills));
    } catch (e) {
      console.error('Failed to save user skills:', e);
    }
  };

  const updateSkillLevel = (skillIdOrIndex: string | number, newLevel: number) => {
    const updated = skills.map((s, idx) => {
      if (s.id === skillIdOrIndex || idx === skillIdOrIndex || s.skill === skillIdOrIndex) {
        return { ...s, level: Math.min(100, Math.max(0, newLevel)) };
      }
      return s;
    });
    saveSkills(updated);
  };

  const addCustomSkill = (name: string, initialLevel: number = 50) => {
    if (!name.trim()) return;
    const newSkill: SkillProficiency = {
      id: Math.random().toString(36).substring(2, 9),
      skill: name.trim(),
      level: Math.min(100, Math.max(0, initialLevel)),
    };
    saveSkills([...skills, newSkill]);
  };

  const removeSkill = (idOrName: string) => {
    saveSkills(skills.filter((s) => s.id !== idOrName && s.skill !== idOrName));
  };

  const resetSkills = () => {
    saveSkills(DEFAULT_SKILLS);
  };

  return {
    skills,
    updateSkillLevel,
    addCustomSkill,
    removeSkill,
    resetSkills,
  };
};
