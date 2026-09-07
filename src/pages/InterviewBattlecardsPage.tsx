import { Lightbulb, Layers, Code2, BookOpen } from 'lucide-react';
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
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Lightbulb size={24} color="var(--accent)" />
          <span>Technical Interview Battle Cards</span>
        </h1>
        <p className="page-sub">
          Targeted company interview tactics, system design mantras, and core DSA patterns
        </p>
      </div>

      <div className="pb" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 20 }}>
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
                background: selectedCard.id === card.id ? 'var(--page)' : 'var(--card)',
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
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={22} color="var(--accent)" />
            <span>{selectedCard.company} Interview Battle Card</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--accent-bg)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>
                Key Company Mantra:
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.5 }}>
                "{selectedCard.keyMantra}"
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase', marginBottom: 8 }}>
                Top Core Topics Tested:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedCard.topTopics.map((top) => (
                  <span key={top} style={{ fontSize: 11.5, background: 'var(--page)', border: '1px solid var(--border)', color: 'var(--t1)', padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}>
                    #{top}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={14} />
                <span>System Design Tactic</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.6, margin: 0 }}>
                {selectedCard.systemDesignTip}
              </p>
            </div>

            <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Code2 size={14} />
                <span>Coding & DSA Tactic</span>
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
