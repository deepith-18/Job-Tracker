import { CheckCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';

export const MindsetPage: React.FC = () => {
  const [breathingState, setBreathingState] = useState<'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Inhale (4s)');
  const [seconds, setSeconds] = useState(4);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev > 1) return prev - 1;
          if (breathingState === 'Inhale (4s)') {
            setBreathingState('Hold (7s)');
            return 7;
          } else if (breathingState === 'Hold (7s)') {
            setBreathingState('Exhale (8s)');
            return 8;
          } else {
            setBreathingState('Inhale (4s)');
            return 4;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, breathingState]);

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">🧘 Pre-Interview Mindset & Stress Reduction Studio</h1>
        <p className="page-sub">
          Calm pre-interview jitters with 4-7-8 breathing exercises and technical confidence checklists
        </p>
      </div>

      <div className="pb" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* 4-7-8 Breathing Exercise */}
        <div className="card" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>
            🫁 4-7-8 Tactical Breathing Timer
          </div>

          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 12px 36px rgba(99, 102, 241, 0.4)',
              margin: '20px 0',
              transition: 'transform 0.5s ease',
              transform: breathingState.startsWith('Inhale') ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 800 }}>{seconds}s</div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>{breathingState.split(' ')[0]}</div>
          </div>

          <button
            onClick={() => setTimerActive(!timerActive)}
            className="btn btn-primary"
            style={{ padding: '10px 24px', borderRadius: 12, marginTop: 10 }}
          >
            {timerActive ? '⏸️ Pause Timer' : '▶️ Start Breathing Exercise'}
          </button>
        </div>

        {/* Readiness Checklist */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 14 }}>
            <CheckCircle className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Pre-Interview 10-Minute Readiness Checklist
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'Test camera, microphone, and internet connection',
              'Review 3 key STAR stories (Situation, Task, Action, Result)',
              'Prepare 2 thoughtful questions to ask the interviewer',
              'Open IDE / Scratchpad for code scratch work',
              'Take 3 deep breaths and remember: You belong here!',
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t1)' }}>
                <input type="checkbox" style={{ width: 16, height: 16, cursor: 'pointer' }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
};
