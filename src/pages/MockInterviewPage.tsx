import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useToast } from '../components/ui/ToastContext';

export const MockInterviewPage: React.FC = () => {
  const { addToast } = useToast();

  const [companyTier, setCompanyTier] = useState('Google');
  const [topicFocus, setTopicFocus] = useState('Behavioral (STAR)');
  const [activeQuestion, setActiveQuestion] = useState(
    'Tell me about a time you had to optimize a slow system or resolve a technical bottleneck under high deadline pressure.'
  );

  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    starAnalysis: { situation: boolean; task: boolean; action: boolean; result: boolean };
    feedback: string[];
    grade: string;
  } | null>(null);

  const handleGenerateQuestion = () => {
    const questions = [
      'Describe a situation where you had a strong technical disagreement with a teammate. How did you resolve it?',
      'How would you design a distributed rate limiter that handles 100,000 requests per second with low latency?',
      'Tell me about a complex bug you encountered in production. How did you diagnose and fix it?',
      'How do you prioritize technical debt versus shipping new product features?',
    ];

    const nextQ = questions[Math.floor(Math.random() * questions.length)];
    setActiveQuestion(nextQ);
    setUserAnswer('');
    setEvaluation(null);
    addToast('New Question Generated 🎙️', topicFocus, 'info');
  };

  const handleEvaluateAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      addToast('Validation Error', 'Please type your response first', 'error');
      return;
    }

    setEvaluating(true);
    setTimeout(() => {
      const lower = userAnswer.toLowerCase();
      const hasSituation = lower.includes('when') || lower.includes('project') || lower.includes('company');
      const hasTask = lower.includes('need') || lower.includes('goal') || lower.includes('responsible');
      const hasAction = lower.includes('built') || lower.includes('implemented') || lower.includes('refactored') || lower.includes('designed');
      const hasResult = lower.includes('%') || lower.includes('increased') || lower.includes('reduced') || lower.includes('result');

      const matches = [hasSituation, hasTask, hasAction, hasResult].filter(Boolean).length;
      const score = Math.round((matches / 4) * 100);

      setEvaluation({
        score: Math.max(50, score),
        grade: score >= 75 ? 'A (Excellent STAR Format)' : 'B (Good, Add Metrics)',
        starAnalysis: {
          situation: hasSituation,
          task: hasTask,
          action: hasAction,
          result: hasResult,
        },
        feedback: [
          hasResult ? 'Great inclusion of quantitative results!' : 'Add specific metrics or percentage improvements to demonstrate impact.',
          hasAction ? 'Clear explanation of technical actions taken.' : 'Detail the specific tools, languages, or algorithms you used.',
          'Maintain a confident, concise tone during live delivery.',
        ],
      });

      setEvaluating(false);
      addToast('Answer Evaluated 🎯', `Grade: ${score >= 75 ? 'A' : 'B'}`, 'success');
    }, 600);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">🤖 AI Mock Interview Practice Simulator</h1>
        <p className="page-sub">
          Practice live interview responses, receive instant feedback, and refine your STAR framework delivery
        </p>
      </div>

      <div className="pb" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left Column: Question & Response Form */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <select className="inp" style={{ width: 'auto' }} value={companyTier} onChange={(e) => setCompanyTier(e.target.value)}>
              <option value="Google">Google (Big Tech)</option>
              <option value="Stripe">Stripe (Fintech)</option>
              <option value="Meta">Meta (Fast-paced)</option>
              <option value="Startup">Early-Stage Startup</option>
            </select>

            <select className="inp" style={{ width: 'auto' }} value={topicFocus} onChange={(e) => setTopicFocus(e.target.value)}>
              <option value="Behavioral (STAR)">Behavioral (STAR)</option>
              <option value="System Design">System Architecture</option>
              <option value="DSA & Coding">DSA / Live Coding</option>
            </select>

            <button onClick={handleGenerateQuestion} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
              🔄 Next Question
            </button>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 18 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 6 }}>
              Prompt Question:
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.5, margin: 0 }}>
              "{activeQuestion}"
            </h3>
          </div>

          <form onSubmit={handleEvaluateAnswer} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label className="lbl">Your Response (Practice STAR Method)</label>
            <textarea
              className="inp"
              rows={9}
              placeholder="Structure answer: Situation -> Task -> Action -> Result..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              style={{ lineHeight: 1.6 }}
            />

            <button type="submit" disabled={evaluating} className="btn btn-primary" style={{ borderRadius: 12 }}>
              {evaluating ? 'Evaluating Response…' : '✨ Submit & Evaluate Answer'}
            </button>
          </form>
        </div>

        {/* Right Column: AI Feedback & STAR Analysis */}
        <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
            📊 Response Evaluation Report
          </h3>

          {!evaluation ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t3)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎙️</div>
              <p style={{ fontSize: 13 }}>Type your response on the left and click Evaluate to see feedback.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: 16, borderRadius: 14 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase' }}>
                    Evaluation Score:
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', marginTop: 2 }}>
                    {evaluation.score}% ({evaluation.grade})
                  </div>
                </div>
              </div>

              {/* STAR Framework Checklist */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase', marginBottom: 10 }}>
                  STAR Method Checklist:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ fontSize: 12.5, padding: '8px 12px', borderRadius: 8, background: evaluation.starAnalysis.situation ? '#ecfdf5' : '#f1f5f9', color: evaluation.starAnalysis.situation ? '#047857' : '#64748b', fontWeight: 700 }}>
                    {evaluation.starAnalysis.situation ? '✓ Situation' : '✗ Situation'}
                  </div>
                  <div style={{ fontSize: 12.5, padding: '8px 12px', borderRadius: 8, background: evaluation.starAnalysis.task ? '#ecfdf5' : '#f1f5f9', color: evaluation.starAnalysis.task ? '#047857' : '#64748b', fontWeight: 700 }}>
                    {evaluation.starAnalysis.task ? '✓ Task' : '✗ Task'}
                  </div>
                  <div style={{ fontSize: 12.5, padding: '8px 12px', borderRadius: 8, background: evaluation.starAnalysis.action ? '#ecfdf5' : '#f1f5f9', color: evaluation.starAnalysis.action ? '#047857' : '#64748b', fontWeight: 700 }}>
                    {evaluation.starAnalysis.action ? '✓ Action' : '✗ Action'}
                  </div>
                  <div style={{ fontSize: 12.5, padding: '8px 12px', borderRadius: 8, background: evaluation.starAnalysis.result ? '#ecfdf5' : '#f1f5f9', color: evaluation.starAnalysis.result ? '#047857' : '#64748b', fontWeight: 700 }}>
                    {evaluation.starAnalysis.result ? '✓ Result' : '✗ Result'}
                  </div>
                </div>
              </div>

              {/* Feedback Points */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase', marginBottom: 8 }}>
                  💡 Coaching Feedback:
                </div>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--t1)', lineHeight: 1.6 }}>
                  {evaluation.feedback.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
