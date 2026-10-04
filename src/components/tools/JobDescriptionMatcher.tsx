import React, { useState, useMemo } from 'react';
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Clipboard,
  Check,
} from 'lucide-react';
import { useToast } from '../ui/ToastContext';
import { useSkills } from '../../hooks/useSkills';

// Standard Tech Knowledge Base for Matching
const KNOWN_TECH_KEYWORDS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Go', 'Golang',
  'Java', 'C++', 'Rust', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
  'GraphQL', 'REST', 'RESTful', 'Tailwind', 'Next.js', 'Kafka', 'RabbitMQ',
  'Elasticsearch', 'Microservices', 'System Design', 'Distributed Systems',
  'Terraform', 'Linux', 'Agile', 'Unit Testing', 'Jest', 'Cypress',
  'PyTorch', 'TensorFlow', 'LLM', 'Machine Learning', 'Datadog',
];

interface JobDescriptionMatcherProps {
  initialJobDescription?: string;
}

export const JobDescriptionMatcher: React.FC<JobDescriptionMatcherProps> = ({
  initialJobDescription = '',
}) => {
  const { addToast } = useToast();
  const { skills } = useSkills();

  const [jobText, setJobText] = useState(initialJobDescription);
  const [copiedBulletIndex, setCopiedBulletIndex] = useState<number | null>(null);

  // Parse JD keywords
  const analysis = useMemo(() => {
    if (!jobText.trim()) return null;

    const lower = jobText.toLowerCase();

    // Detected skills in JD
    const detectedKeywords = KNOWN_TECH_KEYWORDS.filter((tech) => {
      const regex = new RegExp(`\\b${tech.replace('+', '\\+')}\\b`, 'i');
      return regex.test(jobText);
    });

    // Detect Seniority / Experience signals
    let detectedLevel = 'Mid-Level';
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('5+ years') || lower.includes('7+ years')) {
      detectedLevel = 'Senior / Staff';
    } else if (lower.includes('junior') || lower.includes('entry') || lower.includes('new grad') || lower.includes('0-2 years')) {
      detectedLevel = 'Junior / Associate';
    }

    // Compare with user's skills
    const userSkillNames = new Set(skills.map((s) => s.skill.toLowerCase()));

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    detectedKeywords.forEach((tech) => {
      if (userSkillNames.has(tech.toLowerCase())) {
        matchedKeywords.push(tech);
      } else {
        missingKeywords.push(tech);
      }
    });

    const totalKeywords = detectedKeywords.length;
    const matchScore =
      totalKeywords > 0
        ? Math.min(100, Math.round((matchedKeywords.length / totalKeywords) * 100))
        : 65;

    // Generated tailored resume bullet suggestions
    const tailoredBullets = [
      `Architected high-throughput microservices using ${matchedKeywords.slice(0, 2).join(' and ') || 'TypeScript and Node.js'}, improving query latency by 35% across distributed services.`,
      `Integrated ${missingKeywords[0] || 'Docker'} containerization and automated CI/CD pipelines, cutting deployment cycle times from 45 minutes to 8 minutes.`,
      `Designed scalable database schema with ${matchedKeywords.find((k) => ['PostgreSQL', 'MongoDB', 'Redis'].includes(k)) || 'relational caching'}, handling 10,000+ daily concurrent user sessions with 99.98% uptime.`,
      `Collaborated cross-functionally with product managers and QA to deliver enterprise features 2 weeks ahead of scheduled deadline using agile sprints.`,
    ];

    return {
      detectedKeywords,
      matchedKeywords,
      missingKeywords,
      matchScore,
      detectedLevel,
      tailoredBullets,
    };
  }, [jobText, skills]);

  const handleCopyBullet = (bullet: string, index: number) => {
    navigator.clipboard.writeText(bullet);
    setCopiedBulletIndex(index);
    addToast('Resume Bullet Copied', 'Paste into your tailored resume draft', 'success');
    setTimeout(() => setCopiedBulletIndex(null), 2000);
  };

  const handleLoadSample = () => {
    setJobText(`We are looking for a Senior Software Engineer to build scalable distributed cloud services.
Requirements:
- 4+ years experience with React, TypeScript, and modern frontend architecture.
- Strong backend experience with Node.js, Python, or Go.
- Working knowledge of PostgreSQL, Redis caching, and RESTful APIs.
- Experience with Docker, Kubernetes, and AWS cloud infrastructure.
- Familiarity with CI/CD automation, unit testing, and agile methodologies.
- Passion for system design, code quality, and engineering velocity.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Input Box */}
      <div
        className="card"
        style={{
          padding: 22,
          borderRadius: 18,
          border: '1px solid var(--border)',
          background: 'var(--card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileSearch size={18} color="var(--accent)" />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Live Job Description (JD) ATS Scanner & Resume Tailor
            </h3>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleLoadSample}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12 }}
            >
              Load Sample JD
            </button>
            {jobText && (
              <button
                onClick={() => setJobText('')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12, color: 'var(--t3)' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <textarea
          className="inp"
          rows={6}
          placeholder="Paste job posting description, requirements, or responsibilities here from LinkedIn, Indeed, or Greenhouse..."
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          style={{ width: '100%', fontSize: 13, lineHeight: 1.55 }}
        />
      </div>

      {/* Analysis Outcome */}
      {analysis ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top Score Banner */}
          <div
            className="card"
            style={{
              padding: 22,
              borderRadius: 18,
              border: '1px solid var(--border)',
              background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>
                ATS Keyword Match Score
              </span>
              <div style={{ fontSize: 34, fontWeight: 900, color: analysis.matchScore >= 70 ? '#10b981' : '#f59e0b', marginTop: 4 }}>
                {analysis.matchScore}%
              </div>
              <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>
                {analysis.matchScore >= 70 ? 'High ATS Resonance' : 'Keyword optimization recommended'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>
                Target Seniority Level
              </span>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', marginTop: 4 }}>
                {analysis.detectedLevel}
              </div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                Detected from experience & requirements
              </div>
            </div>

            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>
                Keywords Extracted
              </span>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)', marginTop: 4 }}>
                {analysis.detectedKeywords.length} Technologies
              </div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                {analysis.matchedKeywords.length} matched • {analysis.missingKeywords.length} missing
              </div>
            </div>
          </div>

          {/* Matched vs Missing Keyword Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
            {/* Matched Skills */}
            <div className="card" style={{ padding: 20, borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CheckCircle2 size={16} color="#10b981" />
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  Matched Skills in Your Profile ({analysis.matchedKeywords.length})
                </h4>
              </div>

              {analysis.matchedKeywords.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {analysis.matchedKeywords.map((k) => (
                    <span
                      key={k}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: '#dcfce7',
                        color: '#15803d',
                        fontSize: 12,
                        fontWeight: 700,
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12.5, color: 'var(--t3)' }}>
                  Add your skills in the Skills Radar tab to see instant profile matches.
                </div>
              )}
            </div>

            {/* Missing Keywords to Add */}
            <div className="card" style={{ padding: 20, borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={16} color="#f59e0b" />
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  Keywords Mentioned in JD to Emphasize ({analysis.missingKeywords.length})
                </h4>
              </div>

              {analysis.missingKeywords.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {analysis.missingKeywords.map((k) => (
                    <span
                      key={k}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: '#fef3c7',
                        color: '#b45309',
                        fontSize: 12,
                        fontWeight: 700,
                        border: '1px solid #fde68a',
                      }}
                    >
                      + {k}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12.5, color: '#15803d', fontWeight: 600 }}>
                  Awesome! You match all major extracted keywords for this position.
                </div>
              )}
            </div>
          </div>

          {/* Synthesized Resume Bullet Suggestions */}
          <div className="card" style={{ padding: 22, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Sparkles size={17} color="var(--accent)" />
              <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                Tailored Resume Bullet Suggestions for this Role
              </h4>
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--t3)', margin: 0, marginBottom: 14 }}>
              These metric-backed bullet templates are customized to incorporate the JD keywords directly into your experience section:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analysis.tailoredBullets.map((bullet, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--page)',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.5 }}>
                    • {bullet}
                  </span>
                  <button
                    onClick={() => handleCopyBullet(bullet, idx)}
                    className="btn btn-ghost btn-sm"
                    style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5 }}
                  >
                    {copiedBulletIndex === idx ? <Check size={13} color="#10b981" /> : <Clipboard size={13} />}
                    <span>{copiedBulletIndex === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: 32,
            textAlign: 'center',
            borderRadius: 16,
            border: '1px dashed var(--border)',
            color: 'var(--t3)',
          }}
        >
          <FileSearch size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>No Job Description Loaded</div>
          <div style={{ fontSize: 12.5, marginTop: 4 }}>
            Paste any job description above or click "Load Sample JD" to test live ATS matching and resume bullet suggestions.
          </div>
        </div>
      )}
    </div>
  );
};
