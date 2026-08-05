import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';

interface SkillProficiency {
  skill: string;
  level: number; // 0 - 100
  rejectionImpact: number; // calculated from post-mortems
}

const DEFAULT_SKILLS: SkillProficiency[] = [
  { skill: 'Data Structures & Algorithms', level: 75, rejectionImpact: 0 },
  { skill: 'System Design', level: 65, rejectionImpact: 0 },
  { skill: 'Frontend & UI Frameworks', level: 85, rejectionImpact: 0 },
  { skill: 'Backend & SQL Databases', level: 70, rejectionImpact: 0 },
  { skill: 'Communication & Behavioral', level: 80, rejectionImpact: 0 },
  { skill: 'OOP & Low-Level Design', level: 60, rejectionImpact: 0 },
];

export const SkillsRadarPage: React.FC = () => {
  const { applications } = useApplications();
  const [userSkills, setUserSkills] = useState<SkillProficiency[]>(DEFAULT_SKILLS);

  // Compute skill gap impact from rejection reasons logged across applications
  const skillGaps = useMemo(() => {
    const counts: Record<string, number> = {
      'Weak DSA': 0,
      'SQL gaps': 0,
      'System Design': 0,
      Communication: 0,
      'OOP / Design Patterns': 0,
      'Networking / OS': 0,
      Resume: 0,
    };

    applications.forEach((a) => {
      (a.rejectionReasons || []).forEach((reason) => {
        if (counts[reason] !== undefined) counts[reason]++;
      });
    });

    return counts;
  }, [applications]);

  const radarData = useMemo(() => {
    return userSkills.map((item) => {
      let gapPenalty = 0;
      if (item.skill.includes('Algorithms')) gapPenalty = (skillGaps['Weak DSA'] || 0) * 15;
      if (item.skill.includes('System Design')) gapPenalty = (skillGaps['System Design'] || 0) * 15;
      if (item.skill.includes('SQL')) gapPenalty = (skillGaps['SQL gaps'] || 0) * 15;
      if (item.skill.includes('Communication')) gapPenalty = (skillGaps['Communication'] || 0) * 15;
      if (item.skill.includes('OOP')) gapPenalty = (skillGaps['OOP / Design Patterns'] || 0) * 15;

      const adjustedLevel = Math.max(20, item.level - gapPenalty);
      return {
        subject: item.skill,
        Proficiency: item.level,
        MarketReadiness: adjustedLevel,
      };
    });
  }, [userSkills, skillGaps]);

  const handleLevelChange = (index: number, newLevel: number) => {
    const updated = [...userSkills];
    updated[index].level = newLevel;
    setUserSkills(updated);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">⭐ Skills Radar & Competency Matrix</h1>
        <p className="page-sub">
          Evaluate technical readiness, analyze interview gaps, and optimize study focus
        </p>
      </div>

      <div className="pb" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Radar Chart Card */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>
              🕸️ Competency Radar
            </h3>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, fontWeight: 700 }}>
              <span style={{ color: '#6366f1' }}>■ Self Rating</span>
              <span style={{ color: '#ec4899' }}>■ Adjusted for Interview Gaps</span>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={10} />
                <Radar name="Self Rating" dataKey="Proficiency" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                <Radar name="Market Readiness" dataKey="MarketReadiness" stroke="#ec4899" fill="#ec4899" fillOpacity={0.25} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Sliders & Rejection Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Rejection Post-Mortem Insights */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', marginBottom: 12 }}>
              🧠 Interview Gap Insights (From Rejection Logs)
            </h3>
            {Object.values(skillGaps).every((v) => v === 0) ? (
              <p style={{ fontSize: 13, color: 'var(--t3)', margin: 0 }}>
                No interview rejection tags logged yet. Log feedback tags in Application Details to see target gap analysis!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(skillGaps)
                  .filter(([, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([reason, count]) => (
                    <div key={reason} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: '#be123c' }}>⚠️ {reason}</span>
                      <span style={{ fontWeight: 800, background: '#fff1f2', color: '#be123c', padding: '2px 8px', borderRadius: 10 }}>
                        {count}× flagged
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Self-Assessment Sliders */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
              🎛️ Adjust Skill Self-Assessments
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {userSkills.map((item, idx) => (
                <div key={item.skill}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: 'var(--t1)', marginBottom: 4 }}>
                    <span>{item.skill}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{item.level}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={item.level}
                    onChange={(e) => handleLevelChange(idx, parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
