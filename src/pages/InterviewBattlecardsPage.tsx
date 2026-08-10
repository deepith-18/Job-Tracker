import { Lightbulb } from 'lucide-react';
import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';

interface Battlecard {
  id: string;
  company: string;
  topTopics: string[];
  keyMantra: string;
  systemDesignTip: string;
  dsaTip: string;
}

const CARDS: Battlecard[] = [
  {
    id: '1',
    company: 'Google',
    topTopics: ['Graph Algorithms', 'Dynamic Programming', 'Tries', 'Distributed Caching'],
    keyMantra: 'Communicate trade-offs constantly. Never start coding without proving time/space complexity.',
    systemDesignTip: 'Focus on scaling bottlenecks, database sharding, and latency SLAs.',
    dsaTip: 'Expect 2 medium questions in 45m or 1 complex hard question with follow-ups.',
  },
  {
    id: '2',
    company: 'Stripe',
    topTopics: ['Practical API Design', 'Integration Testing', 'Rate Limiting', 'Idempotency'],
    keyMantra: 'Write production-ready code with clean error handling and unit tests.',
    systemDesignTip: 'Emphasize exact-once delivery, payment state machines, and ACID guarantees.',
    dsaTip: 'Focus on parsing, data transformations, and building functional class interfaces in your IDE.',
  },
  {
    id: '3',
    company: 'Meta',
    topTopics: ['Binary Trees', 'Sliding Window', 'Two Pointers', 'Graph BFS/DFS'],
    keyMantra: 'Speed and bug-free execution are critical.',
    systemDesignTip: 'Design News Feed, Messaging (WebSocket), or Photo Storage with high availability.',
    dsaTip: 'Must solve 2 LeetCode medium/hard questions in 45 minutes clean.',
  },
];

export const InterviewBattlecardsPage: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<Battlecard>(CARDS[0]);

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title"><Lightbulb className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Technical Interview Battle Cards & Cheat Sheets</h1>
        <p className="page-sub">
          High-yield company interview tactics, system design mantras, and core DSA patterns
        </p>
      </div>

      <div className="pb" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        {/* Left Column: Company Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CARDS.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="card"
              style={{
                padding: 18,
                cursor: 'pointer',
                border: selectedCard.id === card.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: selectedCard.id === card.id ? '#f8fafc' : '#ffffff',
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)' }}>{card.company}</div>
              <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
                Key Mantra: "{card.keyMantra.substring(0, 50)}..."
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Battlecard Detail */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
            📌 {selectedCard.company} Interview Battle Card
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#e0e7ff', padding: 14, borderRadius: 12, border: '1px solid #c7d2fe' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#3730a3', textTransform: 'uppercase', marginBottom: 4 }}>
                Key Company Mantra:
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b', lineHeight: 1.5 }}>
                "{selectedCard.keyMantra}"
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase', marginBottom: 8 }}>
                Top Core Topics Tested:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedCard.topTopics.map((top) => (
                  <span key={top} style={{ fontSize: 11.5, background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>
                    #{top}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>
                🏗️ System Design Tactic:
              </div>
              <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.6, margin: 0 }}>
                {selectedCard.systemDesignTip}
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: 4 }}>
                ⚡ Coding & DSA Tactic:
              </div>
              <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.6, margin: 0 }}>
                {selectedCard.dsaTip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
