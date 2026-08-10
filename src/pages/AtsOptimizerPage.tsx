import { File, Target, BarChart, AlertTriangle, Lightbulb } from 'lucide-react';
import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useToast } from '../components/ui/ToastContext';

export const AtsOptimizerPage: React.FC = () => {
  const { addToast } = useToast();

  const [resumeText, setResumeText] = useState(
    `Senior Software Engineer with 5+ years of experience building scalable web apps using React, TypeScript, Node.js, PostgreSQL, and GraphQL. Experienced with Docker, Git, and RESTful APIs.`
  );

  const [jobDescription, setJobDescription] = useState(
    `We are seeking a Senior Full-Stack Engineer skilled in React, TypeScript, Node.js, Kubernetes, AWS, Redis, PostgreSQL, and CI/CD pipelines. Experience with microservices architecture and automated testing (Jest, Cypress) is required.`
  );

  const [analysis, setAnalysis] = useState<{
    score: number;
    foundKeywords: string[];
    missingKeywords: string[];
    suggestions: string[];
  } | null>(null);

  const [scanning, setScanning] = useState(false);

  const handleScanAts = (e: React.FormEvent) => {
    e.preventDefault();
    setScanning(true);

    setTimeout(() => {
      const keywords = ['React', 'TypeScript', 'Node.js', 'Kubernetes', 'AWS', 'Redis', 'PostgreSQL', 'GraphQL', 'Docker', 'Jest', 'Cypress', 'Microservices', 'CI/CD'];
      
      const found = keywords.filter((kw) => resumeText.toLowerCase().includes(kw.toLowerCase()));
      const missing = keywords.filter((kw) => jobDescription.toLowerCase().includes(kw.toLowerCase()) && !found.includes(kw));

      const score = Math.round((found.length / (found.length + missing.length)) * 100);

      setAnalysis({
        score: Math.min(100, Math.max(40, score)),
        foundKeywords: found,
        missingKeywords: missing,
        suggestions: [
          `Incorporate missing technical terms: ${missing.slice(0, 3).join(', ')}.`,
          'Add quantitative metrics to impact bullets (e.g. "Improved query performance by 40%").',
          'Ensure standard section headers (Experience, Skills, Education) for parser compatibility.',
        ],
      });

      setScanning(false);
      addToast('ATS Scan Complete', `Match Score: ${score}%`, 'success');
    }, 600);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">🤖 AI Resume & ATS Keyword Optimizer</h1>
        <p className="page-sub">
          Compare your resume against job descriptions to score keyword density and pass applicant tracking systems
        </p>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Scanner Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', marginBottom: 12 }}>
              <File className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Your Resume Text
            </h3>
            <textarea
              className="inp"
              rows={10}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume bullet points here..."
              style={{ fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.6 }}
            />
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', marginBottom: 12 }}>
              <Target className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Target Job Description (JD)
            </h3>
            <textarea
              className="inp"
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job listing requirements here..."
              style={{ fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.6 }}
            />
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={handleScanAts} disabled={scanning} className="btn btn-primary" style={{ padding: '12px 36px', borderRadius: 14, fontSize: 14 }}>
            {scanning ? 'Analyzing Keyword Match…' : '⚡ Run ATS Match Scan'}
          </button>
        </div>

        {/* Results Display */}
        {analysis && (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  <BarChart className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> ATS Compatibility Report
                </h3>
                <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 2 }}>Keyword & Skills Alignment</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: analysis.score >= 75 ? '#10b981' : '#f59e0b' }}>
                  {analysis.score}%
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>
                  ATS Match Score
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Found Keywords */}
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: 16, borderRadius: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#047857', textTransform: 'uppercase', marginBottom: 10 }}>
                  ✓ Matched Keywords ({analysis.foundKeywords.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {analysis.foundKeywords.map((kw) => (
                    <span key={kw} style={{ background: '#ffffff', color: '#047857', fontSize: 11.5, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: '1px solid #6ee7b7' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Keywords */}
              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: 16, borderRadius: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#be123c', textTransform: 'uppercase', marginBottom: 10 }}>
                  <AlertTriangle className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Missing Recommended Keywords ({analysis.missingKeywords.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {analysis.missingKeywords.map((kw) => (
                    <span key={kw} style={{ background: '#ffffff', color: '#be123c', fontSize: 11.5, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: '1px solid #fda4af' }}>
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase', marginBottom: 8 }}>
                <Lightbulb className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Actionable Recommendations:
              </div>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--t1)', lineHeight: 1.6 }}>
                {analysis.suggestions.map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
