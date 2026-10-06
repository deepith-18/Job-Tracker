import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clipboard,
  Check,
  Search,
  BookOpen,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from '../ui/ToastContext';

export interface StarStory {
  id: string;
  title: string;
  companyContext: string;
  competency: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  metricsPresent: boolean;
  targetQuestions: string[];
  updatedAt: string;
}

const COMPETENCIES = [
  'All Competencies',
  'Architecture & Scaling',
  'Conflict & Disagreement',
  'Tight Deadlines & Execution',
  'Production Outage & Recovery',
  'Leading Through Ambiguity',
  'Mentorship & Team Impact',
];

const COMMON_BEHAVIORAL_QUESTIONS = [
  {
    id: 'q1',
    question: 'Tell me about a time you handled a difficult technical disagreement with a team member.',
    competency: 'Conflict & Disagreement',
  },
  {
    id: 'q2',
    question: 'Describe a project where you had to balance aggressive delivery deadlines against technical debt.',
    competency: 'Tight Deadlines & Execution',
  },
  {
    id: 'q3',
    question: 'Walk me through a high-severity production outage or bug that you helped diagnose and resolve.',
    competency: 'Production Outage & Recovery',
  },
  {
    id: 'q4',
    question: 'Tell me about an ambiguous architectural problem where requirements were unclear and how you drove clarity.',
    competency: 'Leading Through Ambiguity',
  },
  {
    id: 'q5',
    question: 'Describe an architectural change you spearheaded that dramatically improved latency, reliability, or infrastructure costs.',
    competency: 'Architecture & Scaling',
  },
  {
    id: 'q6',
    question: 'Give an example of how you mentored a junior engineer or improved team engineering standards.',
    competency: 'Mentorship & Team Impact',
  },
];

const INITIAL_STORIES: StarStory[] = [
  {
    id: 'star-1',
    title: 'Migrating Monolith Database to Partitioned Read-Replicas',
    companyContext: 'Acme Cloud Platform',
    competency: 'Architecture & Scaling',
    situation:
      'During Black Friday traffic surge, our primary relational database sustained 95% CPU utilization, causing 4.2s checkout latencies.',
    task:
      'I was tasked with eliminating database write bottlenecks and scaling query throughput by 5x before the upcoming Q4 campaign with zero downtime.',
    action:
      'Conducted query query profiling to isolate top 5 slowest queries. Implemented read-replicas with connection pooling via PgBouncer and partitioned high-growth audit tables by timestamp month. Authored automated database rollback scripts.',
    result:
      'Reduced p99 checkout latency by 68% (from 4.2s to 1.3s), handled 12,000 requests/sec with CPU under 45%, and saved $45,000/yr in over-provisioned instance fees.',
    metricsPresent: true,
    targetQuestions: ['q5'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'star-2',
    title: 'Resolving Critical Authentication Service Degradation',
    companyContext: 'FinTech Core Team',
    competency: 'Production Outage & Recovery',
    situation:
      'A third-party OAuth provider introduced an unannounced token rate-limit, causing 15% of mobile logins to fail with 504 Gateway Timeouts.',
    task:
      'As the primary on-call engineer, I had to stop user session drops, restore 99.9% login reliability, and implement resilient client fallback.',
    action:
      'Declared a P1 incident and engaged secondary auth fallback provider within 8 minutes. Implemented token-bucket caching with Redis with 10-minute TTLs and exponential backoff retry jitter to relieve external API pressure.',
    result:
      'Restored login success rate to 99.95% within 22 minutes. Wrote a postmortem document establishing circuit breakers that prevented two subsequent provider outages.',
    metricsPresent: true,
    targetQuestions: ['q3'],
    updatedAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = 'job_orbit_star_stories_v1';

export const StarStoryVault: React.FC = () => {
  const { addToast } = useToast();
  const [stories, setStories] = useState<StarStory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_STORIES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState('All Competencies');
  const [editingStory, setEditingStory] = useState<StarStory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(stories[0]?.id || null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
    } catch (e) {
      console.error('Failed to save STAR stories', e);
    }
  }, [stories]);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formCompetency, setFormCompetency] = useState('Architecture & Scaling');
  const [formSituation, setFormSituation] = useState('');
  const [formTask, setFormTask] = useState('');
  const [formAction, setFormAction] = useState('');
  const [formResult, setFormResult] = useState('');
  const [formQuestions, setFormQuestions] = useState<string[]>([]);

  // Real-time metrics detector in result
  const hasQuantifiableMetrics = useMemo(() => {
    const metricRegex = /(\d+|%|\$|k|M|ms|s|hours|days|latency|throughput|reduced|increased|saved)/i;
    return metricRegex.test(formResult);
  }, [formResult]);

  const handleOpenAdd = () => {
    setEditingStory(null);
    setFormTitle('');
    setFormCompany('');
    setFormCompetency('Architecture & Scaling');
    setFormSituation('');
    setFormTask('');
    setFormAction('');
    setFormResult('');
    setFormQuestions([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (story: StarStory) => {
    setEditingStory(story);
    setFormTitle(story.title);
    setFormCompany(story.companyContext);
    setFormCompetency(story.competency);
    setFormSituation(story.situation);
    setFormTask(story.task);
    setFormAction(story.action);
    setFormResult(story.result);
    setFormQuestions(story.targetQuestions || []);
    setIsModalOpen(true);
  };

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSituation.trim() || !formAction.trim()) {
      addToast('Missing Required Fields', 'Please fill in Title, Situation, and Action', 'warning');
      return;
    }

    const metricRegex = /(\d+|%|\$|k|M|ms|s|hours|days|latency|throughput)/i;
    const metricsPresent = metricRegex.test(formResult);

    if (editingStory) {
      const updated = stories.map((s) =>
        s.id === editingStory.id
          ? {
              ...s,
              title: formTitle.trim(),
              companyContext: formCompany.trim(),
              competency: formCompetency,
              situation: formSituation.trim(),
              task: formTask.trim(),
              action: formAction.trim(),
              result: formResult.trim(),
              metricsPresent,
              targetQuestions: formQuestions,
              updatedAt: new Date().toISOString(),
            }
          : s
      );
      setStories(updated);
      addToast('STAR Story Updated', 'Your interview scenario has been saved', 'success');
    } else {
      const newStory: StarStory = {
        id: `star-${Date.now()}`,
        title: formTitle.trim(),
        companyContext: formCompany.trim(),
        competency: formCompetency,
        situation: formSituation.trim(),
        task: formTask.trim(),
        action: formAction.trim(),
        result: formResult.trim(),
        metricsPresent,
        targetQuestions: formQuestions,
        updatedAt: new Date().toISOString(),
      };
      setStories([newStory, ...stories]);
      addToast('STAR Story Created', 'Scenario added to your interview bank', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this STAR interview story?')) {
      setStories(stories.filter((s) => s.id !== id));
      addToast('Story Removed', 'Story deleted from bank', 'info');
    }
  };

  const handleCopyFormatted = (story: StarStory, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `
STAR STORY: ${story.title} (${story.competency} — ${story.companyContext || 'Personal Project'})

SITUATION:
${story.situation}

TASK:
${story.task}

ACTION:
${story.action}

RESULT:
${story.result}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(story.id);
    addToast('STAR Story Copied', 'Formatted for behavioral interview review', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      const matchComp =
        selectedCompetency === 'All Competencies' || s.competency === selectedCompetency;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.companyContext.toLowerCase().includes(q) ||
        s.action.toLowerCase().includes(q) ||
        s.result.toLowerCase().includes(q);
      return matchComp && matchQuery;
    });
  }, [stories, selectedCompetency, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* ── Top Header ── */}
      <div
        className="card"
        style={{
          padding: '22px 24px',
          borderRadius: 18,
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
            }}
          >
            <BookOpen style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              STAR Behavioral Interview Story Vault
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--t3)', margin: 0, marginTop: 3 }}>
              Structure your career highlights into Situation, Task, Action, and quantifiable Result for FAANG & Big Tech behavioral rounds.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, fontWeight: 700 }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          <span>New STAR Story</span>
        </button>
      </div>

      {/* ── Search & Competency Filters Bar ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 420 }}>
          <Search
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 15,
              height: 15,
              color: 'var(--t3)',
            }}
          />
          <input
            className="inp"
            placeholder="Search stories by keyword, tool, or metric..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 34, fontSize: 12.5 }}
          />
        </div>

        <div className="horizontal-scroll" style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
          {COMPETENCIES.map((comp) => (
            <button
              key={comp}
              onClick={() => setSelectedCompetency(comp)}
              className="btn btn-sm"
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: 10,
                background: selectedCompetency === comp ? 'var(--accent)' : 'var(--card)',
                color: selectedCompetency === comp ? '#ffffff' : 'var(--t2)',
                border: '1px solid var(--border)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {comp}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stories Accordion / List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredStories.length === 0 ? (
          <div
            className="card"
            style={{
              padding: 36,
              textAlign: 'center',
              color: 'var(--t3)',
              borderRadius: 16,
              border: '1px dashed var(--border)',
            }}
          >
            <BookOpen style={{ width: 36, height: 36, margin: '0 auto 12px', opacity: 0.5 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>No STAR Stories Found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              Click "New STAR Story" to craft your first structured behavioral interview answer.
            </div>
          </div>
        ) : (
          filteredStories.map((story) => {
            const isExpanded = expandedId === story.id;
            return (
              <div
                key={story.id}
                className="card"
                style={{
                  borderRadius: 16,
                  border: isExpanded ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  overflow: 'hidden',
                  background: 'var(--card)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : story.id)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--card-hover)' : 'transparent',
                    userSelect: 'none',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>
                          {story.title}
                        </span>
                        {story.companyContext && (
                          <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>
                            • {story.companyContext}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 8,
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: 'var(--accent)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                          }}
                        >
                          {story.competency}
                        </span>

                        {story.metricsPresent ? (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 8,
                              background: '#dcfce7',
                              color: '#15803d',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <CheckCircle2 style={{ width: 12, height: 12 }} />
                            <span>Quantified Metrics Included</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 8,
                              background: '#fef3c7',
                              color: '#b45309',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <AlertCircle style={{ width: 12, height: 12 }} />
                            <span>Needs Measurable Metrics</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      onClick={(e) => handleCopyFormatted(story, e)}
                      className="btn btn-ghost btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '4px 10px' }}
                      title="Copy full STAR answer"
                    >
                      {copiedId === story.id ? (
                        <Check style={{ width: 13, height: 13, color: '#10b981' }} />
                      ) : (
                        <Clipboard style={{ width: 13, height: 13 }} />
                      )}
                      <span>{copiedId === story.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(story);
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, padding: '4px 8px' }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(story.id, e)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, padding: '4px 8px', color: 'var(--danger)' }}
                      title="Delete story"
                    >
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>

                    {isExpanded ? (
                      <ChevronUp style={{ width: 18, height: 18, color: 'var(--t3)' }} />
                    ) : (
                      <ChevronDown style={{ width: 18, height: 18, color: 'var(--t3)' }} />
                    )}
                  </div>
                </div>

                {/* Expanded STAR Framework Details */}
                {isExpanded && (
                  <div style={{ padding: '20px 22px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* S & T Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 14 }}>
                      <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>
                          S — Situation
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.5 }}>
                          {story.situation}
                        </div>
                      </div>

                      <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: 4 }}>
                          T — Task
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.5 }}>
                          {story.task || 'Core responsibility assigned during this initiative.'}
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11.5, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', marginBottom: 4 }}>
                        A — Action (Your Specific Engineering Decisions)
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.55 }}>
                        {story.action}
                      </div>
                    </div>

                    {/* Result */}
                    <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1.5px solid #10b981' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                          R — Result (Quantified Business & Technical Impact)
                        </div>
                        {story.metricsPresent && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#047857' }}>Verified Metric</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.55, fontWeight: 500 }}>
                        {story.result}
                      </div>
                    </div>

                    {/* Mapped Behavioral Questions */}
                    <div style={{ paddingTop: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>
                        Recommended Behavioral Questions for This Scenario:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {COMMON_BEHAVIORAL_QUESTIONS.filter(
                          (q) => q.competency === story.competency || story.targetQuestions?.includes(q.id)
                        ).map((q) => (
                          <div
                            key={q.id}
                            style={{
                              fontSize: 12,
                              color: 'var(--t2)',
                              background: 'var(--page)',
                              padding: '8px 12px',
                              borderRadius: 8,
                              border: '1px solid var(--border)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <Tag style={{ width: 13, height: 13, color: 'var(--accent)', flexShrink: 0 }} />
                            <span>{q.question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal for Adding / Editing STAR Story ── */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 680,
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 20,
              padding: 26,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                {editingStory ? 'Edit STAR Story' : 'Create Structured STAR Story'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 14 }}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveStory} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label className="lbl">Scenario Title *</label>
                  <input
                    className="inp"
                    placeholder="e.g. Migrating to Redis Caching Cluster"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="lbl">Company / Team Context</label>
                  <input
                    className="inp"
                    placeholder="e.g. Stripe Infrastructure / Personal Side Project"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="lbl">Primary Leadership & Technical Competency</label>
                <select
                  className="inp"
                  value={formCompetency}
                  onChange={(e) => setFormCompetency(e.target.value)}
                >
                  {COMPETENCIES.filter((c) => c !== 'All Competencies').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="lbl">
                  Situation (Context, constraints, timeline, team scale) *
                </label>
                <textarea
                  className="inp"
                  rows={3}
                  placeholder="Set the stage: What company were you at? What was the production state? What scale or constraint existed?"
                  value={formSituation}
                  onChange={(e) => setFormSituation(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="lbl">Task (Your specific assignment or goal)</label>
                <textarea
                  className="inp"
                  rows={2}
                  placeholder="What was your direct responsibility or objective in this situation?"
                  value={formTask}
                  onChange={(e) => setFormTask(e.target.value)}
                />
              </div>

              <div>
                <label className="lbl">
                  Action (What YOU specifically designed, implemented, and decided) *
                </label>
                <textarea
                  className="inp"
                  rows={4}
                  placeholder="Focus on your direct contributions: architectures chosen, trade-offs evaluated, tools implemented, and how you led."
                  value={formAction}
                  onChange={(e) => setFormAction(e.target.value)}
                  required
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="lbl" style={{ margin: 0 }}>
                    Result (Measurable business & technical outcome) *
                  </label>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: hasQuantifiableMetrics ? '#10b981' : '#f59e0b',
                    }}
                  >
                    {hasQuantifiableMetrics
                      ? 'Metrics Detected (%, numbers, latency)'
                      : 'Tip: Add numbers, %, or latency'}
                  </span>
                </div>
                <textarea
                  className="inp"
                  rows={3}
                  placeholder="Include concrete metrics: e.g. Reduced p99 latency by 45%, eliminated 99% of timeouts, delivered 2 weeks ahead of schedule."
                  value={formResult}
                  onChange={(e) => setFormResult(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 700 }}>
                  {editingStory ? 'Save Changes' : 'Add Story to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
