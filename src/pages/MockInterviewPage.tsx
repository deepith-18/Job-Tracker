import { Sparkles, BarChart, Mic, Lightbulb, RotateCw } from 'lucide-react';
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
  } | null>(null);

  const sampleQuestions = [
    'Tell me about a time you had to optimize a slow system or resolve a technical bottleneck under high deadline pressure.',
    'Describe a disagreement you had with a product manager or team member regarding engineering trade-offs.',
    'How do you handle ambiguous technical requirements when starting a major new service or feature?',
    'Tell me about a production incident you caused or helped mitigate. What went wrong and what were the key takeaways?',
  ];

  const handleGenerateQuestion = () => {
    const nextQ = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
    setActiveQuestion(nextQ);
    setEvaluation(null);
    setUserAnswer('');
    addToast('New Question Loaded', `${companyTier} • ${topicFocus}`, 'info');
  };

  const handleEvaluateAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setEvaluating(true);

    setTimeout(() => {
      const lower = userAnswer.toLowerCase();
      const hasSituation = lower.includes('when') || lower.includes('time') || lower.includes('at') || lower.includes('project');
      const hasTask = lower.includes('needed to') || lower.includes('goal') || lower.includes('responsible') || lower.includes('task');
      const hasAction = lower.includes('implemented') || lower.includes('built') || lower.includes('designed') || lower.includes('i ');
      const hasResult = lower.includes('result') || lower.includes('reduced') || lower.includes('improved') || lower.includes('%') || lower.includes('latency');

      let points = 50;
      if (hasSituation) points += 12;
      if (hasTask) points += 12;
      if (hasAction) points += 13;
      if (hasResult) points += 13;

      setEvaluation({
        score: Math.min(100, points),
        starAnalysis: {
          situation: hasSituation,
          task: hasTask,
          action: hasAction,
          result: hasResult,
        },
        feedback: [
          hasAction ? 'Strong focus on personal ownership and specific engineering actions.' : 'Clarify the exact technical steps you personally took vs team contributions.',
          hasResult ? 'Good quantification of business/system outcome metrics.' : 'Add concrete metrics to your result (e.g. latency reduction %, user impact, or downtime prevented).',
          'Keep your answer concise and composed within 2-3 minutes for optimal interviewer retention.',
        ],
      });

      setEvaluating(false);
      addToast('Evaluation Ready', `STAR Score: ${points}%`, 'success');
    }, 600);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">Mock Interview Practice Simulator</h1>
        <p className="page-sub">
          Practice live interview responses, receive instant feedback, and refine your STAR framework delivery
        </p>
      </div>

      <div className="pb" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 20 }}>
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

            <button onClick={handleGenerateQuestion} className="btn btn-ghost btn-sm" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RotateCw style={{ width: 13, height: 13 }} />
              <span>Next Question</span>
            </button>
          </div>

          <div style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 18 }}>
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
              {evaluating ? 'Evaluating Response…' : <><Sparkles className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Submit & Evaluate Answer</>}
            </button>
          </form>
        </div>

        {/* Right Column: AI Feedback & STAR Analysis */}
        <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
            <BarChart className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Response Evaluation Report
          </h3>

          {!evaluation ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t3)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}><Mic className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /></div>
              <p style={{ fontSize: 13 }}>Type your response on the left and click Evaluate to see feedback.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--page)', border: '1px solid var(--border)', padding: 16, borderRadius: 14 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase' }}>
                    Evaluation Score:
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', marginTop: 2 }}>
                    {evaluation.score}% ({evaluation.score >= 80 ? 'Strong' : evaluation.score >= 65 ? 'Proficient' : 'Needs Polish'})
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
                  <Lightbulb className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Coaching Feedback:
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
