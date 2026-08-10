import { Brain, AlertTriangle, Plus, Trash2, CheckCircle2, RotateCcw, Target } from 'lucide-react';
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
import { useSkills } from '../hooks/useSkills';
import { useToast } from '../components/ui/ToastContext';

export const SkillsRadarPage: React.FC = () => {
  const { applications } = useApplications();
  const { skills, updateSkillLevel, addCustomSkill, removeSkill, resetSkills } = useSkills();
  const { addToast } = useToast();

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(70);
  const [showAddForm, setShowAddForm] = useState(false);

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
    return skills.map((item) => {
      let gapPenalty = 0;
      if (item.skill.includes('Algorithms') || item.skill.includes('DSA')) gapPenalty = (skillGaps['Weak DSA'] || 0) * 15;
      if (item.skill.includes('System Design')) gapPenalty = (skillGaps['System Design'] || 0) * 15;
      if (item.skill.includes('SQL') || item.skill.includes('Database')) gapPenalty = (skillGaps['SQL gaps'] || 0) * 15;
      if (item.skill.includes('Communication') || item.skill.includes('Behavioral')) gapPenalty = (skillGaps['Communication'] || 0) * 15;
      if (item.skill.includes('OOP')) gapPenalty = (skillGaps['OOP / Design Patterns'] || 0) * 15;

      const adjustedLevel = Math.max(15, item.level - gapPenalty);
      return {
        subject: item.skill,
        Proficiency: item.level,
        MarketReadiness: adjustedLevel,
      };
    });
  }, [skills, skillGaps]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    addCustomSkill(newSkillName.trim(), newSkillLevel);
    addToast('Skill Added', `Saved "${newSkillName.trim()}" at ${newSkillLevel}% to your profile`, 'success');
    setNewSkillName('');
    setNewSkillLevel(70);
    setShowAddForm(false);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title"><Target className="inline-block w-5 h-5 mr-2 align-text-bottom" /> Skills Radar & Competency Matrix</h1>
        <p className="page-sub">
          Evaluate technical readiness, track learning progress, and persist your skill improvements per user
        </p>
      </div>

      <div className="pb" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Radar Chart Card */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Competency Radar
            </h3>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, fontWeight: 700 }}>
              <span style={{ color: '#6366f1' }}>■ Self Rating</span>
              <span style={{ color: '#ec4899' }}>■ Adjusted for Interview Gaps</span>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={11} fontWeight={600} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={10} />
                <Radar name="Self Rating" dataKey="Proficiency" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                <Radar name="Market Readiness" dataKey="MarketReadiness" stroke="#ec4899" fill="#ec4899" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Sliders & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Rejection Post-Mortem Insights */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', marginBottom: 12 }}>
              <Brain className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Interview Gap Insights (From Rejection Logs)
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
                      <span style={{ fontWeight: 600, color: '#be123c' }}><AlertTriangle className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> {reason}</span>
                      <span style={{ fontWeight: 800, background: '#fff1f2', color: '#be123c', padding: '2px 8px', borderRadius: 10 }}>
                        {count}× flagged
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Self-Assessment Sliders & Management */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                Adjust Skill Self-Assessments
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: 12 }}
                >
                  <Plus className="inline-block w-3.5 h-3.5 mr-1" /> Add Skill
                </button>
                <button
                  onClick={resetSkills}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 12 }}
                  title="Reset to default skills"
                >
                  <RotateCcw className="inline-block w-3.5 h-3.5 mr-1" /> Reset
                </button>
              </div>
            </div>

            {/* Add Custom Skill Form */}
            {showAddForm && (
              <form onSubmit={handleAddSkill} style={{ background: 'var(--accent-bg)', padding: 14, borderRadius: 12, marginBottom: 16, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8, color: 'var(--accent)' }}>
                  Add Custom Skill
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input
                    type="text"
                    className="inp"
                    placeholder="e.g. Docker, GraphQL, System Architecture"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="inp"
                    style={{ width: 70 }}
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-ghost btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Save Skill</button>
                </div>
              </form>
            )}

            {/* Sliders list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {skills.map((item) => (
                <div key={item.id || item.skill}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, fontWeight: 600, color: 'var(--t1)', marginBottom: 4 }}>
                    <span>{item.skill}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{item.level}%</span>
                      {skills.length > 3 && (
                        <button
                          onClick={() => removeSkill(item.id)}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                          title="Remove skill"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={item.level}
                    onChange={(e) => {
                      updateSkillLevel(item.id, parseInt(e.target.value));
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, fontSize: 11.5, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={13} color="#10b981" />
              <span>Skill levels stay saved to your profile as you learn and improve.</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
