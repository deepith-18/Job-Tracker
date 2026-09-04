import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  Heart,
  CheckCircle2,
  Award,
  Copy,
  Check,
  MessageSquare,
  Send,
  ArrowLeft,
  Briefcase,
  Compass,
  Target,
  Clock,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { BrandLogo } from '../components/common/BrandLogo';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';

export const AboutPage: React.FC = () => {
  const { applications } = useApplications();
  const { addToast } = useToast();

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<'appreciation' | 'feature' | 'question'>('appreciation');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const creatorEmail = 'deepith.dev@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(creatorEmail);
    setCopiedEmail(true);
    addToast('Email Copied', `Copied ${creatorEmail} to clipboard`, 'success');
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    addToast('Note Sent to Deepith!', 'Thank you for your message and support for Job Orbit.', 'success');
    setTimeout(() => {
      setFeedbackOpen(false);
      setFeedbackSent(false);
      setFeedbackText('');
    }, 1800);
  };

  const PRODUCT_PILLARS = [
    {
      title: 'Clarity Over Chaos',
      description:
        'Transform scattered spreadsheets, bookmarked jobs, and buried inbox threads into one unified, distraction-free command center.',
      icon: Compass,
      color: 'var(--accent)',
      bg: 'var(--accent-bg)',
    },
    {
      title: 'Candidate-First Privacy',
      description:
        'Your career ambitions, offer negotiations, and personal interview notes belong strictly to you. Never tracked, never monetized.',
      icon: Shield,
      color: 'var(--accent)',
      bg: 'var(--accent-bg)',
    },
    {
      title: 'Interview Confidence',
      description:
        'Walk into every round fully composed with ready-to-use interview battlecards, question prep studios, and company intel.',
      icon: Target,
      color: 'var(--accent)',
      bg: 'var(--accent-bg)',
    },
    {
      title: 'Continuous Momentum',
      description:
        'Stay ahead of ghosting and aging applications with proactive follow-up alerts, velocity targets, and milestone celebrations.',
      icon: Clock,
      color: 'var(--accent)',
      bg: 'var(--accent-bg)',
    },
  ];

  const MILESTONES = [
    {
      version: 'v2.5',
      title: 'The Job Orbit Era & Creator Edition',
      tag: 'Current Release',
      description:
        'Complete brand elevation to Job Orbit with custom celestial vector design, instant keyboard shortcuts, and enhanced search telemetry.',
    },
    {
      version: 'v2.4',
      title: 'Interview Battlecards & Strategy Studio',
      tag: 'Major Feature',
      description:
        'Curated 50+ battlecards for technical and behavioral interviews, comprehensive company intel dossiers, and salary negotiation frameworks.',
    },
    {
      version: 'v2.0',
      title: 'Multi-Device Continuous Workspace',
      tag: 'Foundational',
      description:
        'Seamless real-time synchronization across laptop, tablet, and mobile devices with instant offline backup portability.',
    },
  ];

  return (
    <AppShell>
      <div style={{ maxWidth: 960, margin: '0 auto', paddingTop: 20, paddingBottom: 64 }}>
        {/* Issue 7: Back Link Breadcrumb with increased font size and generous top spacing */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--t2)',
              textDecoration: 'none',
              padding: '8px 14px',
              borderRadius: 12,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            <span>Dashboard</span>
          </Link>
          <span style={{ color: 'var(--t3)', fontSize: 14 }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>About & Story</span>
        </nav>

        {/* ── Hero Platform Statement ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #0f172a 100%)',
            borderRadius: 20,
            padding: '40px 36px',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 45px -15px rgba(30, 27, 75, 0.45)',
            marginBottom: 32,
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(6, 182, 212, 0.08) 60%, transparent 100%)',
              filter: 'blur(35px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <BrandLogo size={46} showGlow />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: '#ffffff' }}>
                    Job Orbit
                  </h1>
                  <span
                    style={{
                      background: 'rgba(99, 102, 241, 0.35)',
                      border: '1px solid rgba(165, 180, 252, 0.3)',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 8,
                      letterSpacing: '0.04em',
                    }}
                  >
                    v2.5
                  </span>
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, marginTop: 3 }}>
                  The Career Operating System built for humans, not spreadsheets.
                </div>
              </div>
            </div>

            {/* Issue 8: Constrained line length (maxWidth: 600px, 60-75 chars per line) */}
            <p style={{ fontSize: 16, color: '#ffffff', lineHeight: 1.6, margin: '8px 0 0 0', maxWidth: 600 }}>
              Job searching is emotionally demanding, noisy, and often fragmented across a dozen tabs.
              Job Orbit replaces that friction with a calm, intuitive cockpit that helps ambitious professionals
              navigate every phase of their career with clarity, confidence, and purpose.
            </p>

            {/* Issue 8: Clear focal point with Primary CTA Button and Secondary Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
              <Link
                to="/dashboard"
                className="btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 12,
                  background: '#ffffff',
                  color: '#1e1b4b',
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                }}
              >
                <span>Launch Dashboard</span>
                <span aria-hidden="true">→</span>
              </Link>

              <a
                href="#creator-spotlight"
                className="btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  textDecoration: 'none',
                }}
              >
                <span>Meet Creator Deepith</span>
              </a>
            </div>

            {/* Issue 6: Non-button telemetry status indicators (eliminates false affordance) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                flexWrap: 'wrap',
                marginTop: 14,
                paddingTop: 16,
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: 13,
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'inline-block',
                  }}
                  aria-hidden="true"
                />
                <span>100% Operational & Synced</span>
              </div>

              <span style={{ opacity: 0.35 }} aria-hidden="true">•</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Briefcase style={{ width: 14, height: 14, opacity: 0.8 }} aria-hidden="true" />
                <span>{applications.length} Active Opportunities Tracked</span>
              </div>

              <span style={{ opacity: 0.35 }} aria-hidden="true">•</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Award style={{ width: 14, height: 14, opacity: 0.8 }} aria-hidden="true" />
                <span>Crafted by Deepith</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Spotlight: Deepith (Creator & Lead Product Architect) ── */}
        <div
          id="creator-spotlight"
          className="card"
          style={{
            padding: 32,
            marginBottom: 32,
            borderRadius: 20,
            border: '1px solid var(--border)',
            background: 'linear-gradient(180deg, var(--card) 0%, var(--card-hover) 100%)',
            boxShadow: 'var(--shadow)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Light */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 320,
              height: 200,
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header Tag */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              {/* Issue 4: Increased font size to 13px for readable body tag */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--accent-bg)',
                  border: '1px solid var(--border)',
                  padding: '5px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--accent)',
                }}
              >
                <Sparkles style={{ width: 14, height: 14 }} />
                <span>Creator & Product Architect Spotlight</span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--accent)',
                  background: 'var(--accent-bg)',
                  padding: '5px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                }}
              >
                <CheckCircle2 style={{ width: 14, height: 14 }} />
                <span>Verified Sole Creator</span>
              </div>
            </div>

            {/* Profile Content */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
              {/* Creator Avatar with Radiant Ring */}
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
                  padding: 3,
                  boxShadow: '0 12px 30px -8px rgba(79, 70, 229, 0.45)',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 18,
                    background: '#0f172a',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: '#ffffff',
                    }}
                  >
                    D
                  </span>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      background: 'var(--accent)',
                      border: '2px solid #ffffff',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                    title="Verified Creator"
                  >
                    <CheckCircle2 style={{ width: 12, height: 12 }} />
                  </div>
                </div>
              </div>

              {/* Story & Philosophy */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--t1)', margin: 0, letterSpacing: '-0.02em' }}>
                    Deepith
                  </h2>
                  <span
                    style={{
                      background: 'var(--accent-bg)',
                      color: 'var(--accent)',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                    }}
                  >
                    Creator & Product Architect
                  </span>
                </div>

                <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.6, marginTop: 10, marginBottom: 16 }}>
                  "I designed and built <strong>Job Orbit</strong> out of a personal frustration with the chaotic, opaque reality of modern job hunting.
                  Managing spreadsheets, coping with silent rejections, and juggling multiple interview rounds drains energy that candidates should be
                  spending on shining in their interviews. Job Orbit was built as a clean, peaceful, and empowering home for your career search."
                </p>

                {/* Experience Focus Tags (Consistent typography & colors) */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  <span style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 8 }}>
                    Candidate Experience Design
                  </span>
                  <span style={{ background: 'var(--page)', color: 'var(--t2)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 8 }}>
                    Zero-Distraction Productivity
                  </span>
                  <span style={{ background: 'var(--page)', color: 'var(--t2)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 8 }}>
                    Interview Intelligence & Strategy
                  </span>
                  <span style={{ background: 'var(--page)', color: 'var(--t2)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 8 }}>
                    Data Privacy & Portability
                  </span>
                </div>

                {/* Connect Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setFeedbackOpen(true)}
                    className="btn btn-primary btn-sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '8px 16px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    <MessageSquare style={{ width: 15, height: 15 }} />
                    <span>Send Note to Deepith</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="btn btn-ghost btn-sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {copiedEmail ? <Check style={{ width: 14, height: 14, color: 'var(--accent)' }} /> : <Copy style={{ width: 14, height: 14 }} />}
                    <span>{copiedEmail ? 'Email Copied!' : 'Copy Email'}</span>
                  </button>

                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      textDecoration: 'none',
                      color: 'var(--t1)',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub</span>
                  </a>

                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      textDecoration: 'none',
                      color: 'var(--t1)',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.97 0 1.76-.79 1.76-1.76s-.79-1.76-1.76-1.76a1.76 1.76 0 0 0-1.76 1.76c0 .97.79 1.76 1.76 1.76m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Issue 5: The 4 Experience Pillars in a symmetrical 2x2 Grid ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--t1)', letterSpacing: '-0.02em', margin: 0 }}>
              The Four Cornerstones of Job Orbit
            </h2>
            <p style={{ fontSize: 14, color: 'var(--t3)', marginTop: 4 }}>
              Thoughtfully engineered to elevate candidates throughout their entire career journey.
            </p>
          </div>

          {/* Symmetrical 2x2 Grid on desktop, 1 col on small mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16 }}>
            {PRODUCT_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="card"
                  style={{
                    padding: '24px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    borderRadius: 20,
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: pillar.bg,
                      color: pillar.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon style={{ width: 20, height: 20 }} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: '0 0 6px 0' }}>
                      {pillar.title}
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.5, margin: 0 }}>
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Evolution & Milestones (Story-driven) ── */}
        <div className="card" style={{ padding: 30, marginBottom: 32, borderRadius: 20, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <Compass style={{ width: 20, height: 20, color: 'var(--accent)' }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Product Evolution & Milestones
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {MILESTONES.map((item, idx) => (
              <div
                key={item.version}
                style={{
                  display: 'flex',
                  gap: 16,
                  paddingBottom: idx !== MILESTONES.length - 1 ? 18 : 0,
                  borderBottom: idx !== MILESTONES.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: idx === 0 ? 'var(--accent)' : 'var(--page)',
                    color: idx === 0 ? '#ffffff' : 'var(--t2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 13,
                    flexShrink: 0,
                    border: `1px solid ${idx === 0 ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  {item.version}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>{item.title}</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 8,
                        background: idx === 0 ? 'var(--accent-bg)' : 'var(--page)',
                        color: idx === 0 ? 'var(--accent)' : 'var(--t3)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.55, margin: '6px 0 0 0' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Clean Crafted Seal ── */}
        <div
          style={{
            textAlign: 'center',
            padding: '28px 24px',
            borderRadius: 20,
            background: 'var(--page)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>
            <span>Thoughtfully engineered with</span>
            <Heart style={{ width: 15, height: 15, color: '#ef4444', fill: '#ef4444' }} />
            <span>by Deepith for job seekers worldwide</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>
            Job Orbit is an independent, candidate-first project. Feedback and ideas are always welcomed.
          </div>
        </div>

        {/* ── Interactive Modal: Send Note to Deepith ── */}
        {feedbackOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: 16,
            }}
            onClick={() => setFeedbackOpen(false)}
          >
            <div
              style={{
                background: 'var(--card)',
                borderRadius: 20,
                padding: 28,
                maxWidth: 480,
                width: '100%',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    <Send style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                      Send a Note to Deepith
                    </h3>
                    <span style={{ fontSize: 12, color: 'var(--t3)' }}>
                      Creator & Product Architect of Job Orbit
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(false)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 18,
                    color: 'var(--t3)',
                  }}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {feedbackSent ? (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: 'var(--accent-bg)',
                      color: 'var(--accent)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <CheckCircle2 style={{ width: 28, height: 28 }} />
                  </div>
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: '0 0 6px 0' }}>
                    Note Dispatched!
                  </h4>
                  <p style={{ fontSize: 14, color: 'var(--t2)', margin: 0 }}>
                    Deepith appreciates your message and feedback on Job Orbit. Keep soaring in your search!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendFeedback} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
                      Message Type
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { id: 'appreciation', label: '💜 Appreciation' },
                        { id: 'feature', label: '💡 Feature Request' },
                        { id: 'question', label: '❓ Inquiry' },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFeedbackCategory(type.id as any)}
                          style={{
                            flex: 1,
                            padding: '8px 8px',
                            borderRadius: 8,
                            border: `1px solid ${feedbackCategory === type.id ? 'var(--accent)' : 'var(--border)'}`,
                            background: feedbackCategory === type.id ? 'var(--accent-bg)' : 'var(--page)',
                            color: feedbackCategory === type.id ? 'var(--accent)' : 'var(--t2)',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
                      Your Note
                    </label>
                    <textarea
                      rows={4}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Share your thoughts, praise, ideas, or connect with Deepith..."
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        fontSize: 14,
                        color: 'var(--t1)',
                        resize: 'none',
                        outline: 'none',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--t3)' }}>
                      Directly relays to Deepith
                    </span>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{
                        padding: '8px 20px',
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Send style={{ width: 14, height: 14 }} />
                      <span>Send Message</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
