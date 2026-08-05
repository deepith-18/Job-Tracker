import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../components/layout/AppShell';

interface Flashcard {
  id: string;
  category: 'DSA' | 'System Design' | 'React & Frontend' | 'SQL & DB' | 'Behavioral';
  question: string;
  answer: string;
  keyConcepts: string[];
}

const SAMPLE_CARDS: Flashcard[] = [
  {
    id: '1',
    category: 'DSA',
    question: 'How do you detect a cycle in a Linked List in O(1) space complexity?',
    answer: "Use Floyd's Cycle Detection Algorithm (Fast & Slow Pointer approach). Initialize a slow pointer (moves 1 step) and a fast pointer (moves 2 steps). If they meet at the same node, a cycle exists.",
    keyConcepts: ['Two Pointers', 'O(1) Memory', 'Floyd Algorithm'],
  },
  {
    id: '2',
    category: 'System Design',
    question: 'How do you handle high read traffic in a distributed web application?',
    answer: 'Implement multi-tier caching (CDN for static assets, Redis/Memcached for API responses), read-replicas for databases with master-slave replication, and database indexing.',
    keyConcepts: ['Redis Caching', 'Read Replicas', 'CDN Edge Caching'],
  },
  {
    id: '3',
    category: 'React & Frontend',
    question: 'What is the Virtual DOM in React and why is reconciliation fast?',
    answer: 'Virtual DOM is an in-memory lightweight representation of the actual DOM. React uses a diffing algorithm (Reconciliation) to compute minimum DOM mutations required and batches updates efficiently.',
    keyConcepts: ['Virtual DOM', 'Diffing Algorithm', 'Batching Updates'],
  },
  {
    id: '4',
    category: 'Behavioral',
    question: 'How do you structure answers to behavioral questions (e.g. conflict resolution)?',
    answer: 'Use the STAR Method: Situation (set context), Task (describe your responsibility), Action (detail your specific engineering actions), Result (quantify positive impact and metrics).',
    keyConcepts: ['STAR Framework', 'Quantified Results', 'Conflict Resolution'],
  },
];

export const InterviewPrepPage: React.FC = () => {
  const [cards] = useState<Flashcard[]>(SAMPLE_CARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const filteredCards = cards.filter(
    (c) => categoryFilter === 'All' || c.category === categoryFilter
  );

  const currentCard = filteredCards[currentIndex] || cards[0];

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const toggleMastered = (id: string) => {
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">🧠 Technical Interview Flashcards & Quiz Prep</h1>
        <p className="page-sub">
          Sharpen core engineering concepts across DSA, System Design, React, SQL, and Behavioral questions
        </p>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Category Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['All', 'DSA', 'System Design', 'React & Frontend', 'SQL & DB', 'Behavioral'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat);
                setCurrentIndex(0);
                setFlipped(false);
              }}
              className="btn"
              style={{
                borderRadius: 10,
                fontSize: 12.5,
                padding: '6px 14px',
                background: categoryFilter === cat ? 'var(--accent-bg)' : '#ffffff',
                color: categoryFilter === cat ? 'var(--accent)' : 'var(--t2)',
                border: categoryFilter === cat ? '1px solid var(--accent)' : '1px solid var(--border)',
                fontWeight: 700,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Flashcard Component */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id + (flipped ? '-back' : '-front')}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setFlipped(!flipped)}
              className="card"
              style={{
                width: '100%',
                maxWidth: 580,
                minHeight: 280,
                padding: 32,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: flipped ? 'linear-gradient(135deg, #fafbff, #e0e7ff)' : '#ffffff',
                border: '1.5px solid var(--border)',
                boxShadow: 'var(--shadow)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'var(--accent)',
                    background: '#e0e7ff',
                    padding: '3px 10px',
                    borderRadius: 12,
                    textTransform: 'uppercase',
                  }}
                >
                  {currentCard.category}
                </span>

                <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>
                  Card {currentIndex + 1} of {filteredCards.length} (Click to Flip 🔄)
                </span>
              </div>

              {!flipped ? (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Question:
                  </div>
                  <h2 style={{ fontSize: 19, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.4 }}>
                    {currentCard.question}
                  </h2>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Answer & Concept:
                  </div>
                  <p style={{ fontSize: 14.5, color: 'var(--t1)', lineHeight: 1.6, marginBottom: 14 }}>
                    {currentCard.answer}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {currentCard.keyConcepts.map((kc) => (
                      <span key={kc} style={{ fontSize: 11, background: '#ffffff', color: '#4338ca', padding: '3px 8px', borderRadius: 6, fontWeight: 700, border: '1px solid #c7d2fe' }}>
                        #{kc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMastered(currentCard.id);
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 12 }}
                >
                  {masteredIds.includes(currentCard.id) ? '✓ Mastered' : '⭐ Mark as Mastered'}
                </button>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="btn btn-ghost btn-sm">
                    ← Prev
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="btn btn-primary btn-sm">
                    Next →
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
};
