import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  ShieldCheck,
  Heart,
  CheckCircle2,
  Award,
  MessageSquare,
  Send,
  ArrowLeft,
  Briefcase,
  Target,
  Loader2,
  AlertCircle,
  Mail,
  ExternalLink,
  Code2,
  Database,
  Calculator,
  Terminal,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { BrandLogo } from '../components/common/BrandLogo';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CATEGORY_LABELS: Record<'appreciation' | 'feature' | 'question', string> = {
  question: 'General Query',
  feature: 'Feature Request',
  appreciation: 'Feedback',
};

// Base64 decoded at runtime to protect creator's private email from plaintext web scrapers & bots
const CREATOR_INBOX = atob('ZGVlcGl0aDE3MThAZ21haWwuY29t');

export const AboutPage: React.FC = () => {
  const { user } = useAuth();
  const { applications } = useApplications();
  const { addToast } = useToast();

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<'appreciation' | 'feature' | 'question'>('question');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (!senderEmail && user.email) {
        setSenderEmail(user.email);
      }
      if (!senderName && user.displayName) {
        setSenderName(user.displayName);
      }
    }
  }, [user]);

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const categoryLabel = CATEGORY_LABELS[feedbackCategory] || 'Query';
    const cleanSenderName = senderName.trim() || (user?.displayName ?? 'Job Orbit User');
    const cleanSenderEmail = senderEmail.trim() || (user?.email ?? '');

    try {
      // 1. Dispatch real email via FormSubmit AJAX API directly to creator inbox
      const response = await fetch(`https://formsubmit.co/ajax/${CREATOR_INBOX}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `[Job Orbit] ${categoryLabel} from ${cleanSenderName}`,
          name: cleanSenderName,
          email: cleanSenderEmail || 'No email provided',
          _replyto: cleanSenderEmail || undefined,
          category: categoryLabel,
          message: feedbackText.trim(),
          _template: 'table',
          _captcha: 'false',
          clientTimestamp: new Date().toLocaleString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      // 2. Best-effort Firestore record if authenticated
      if (user) {
        try {
          await addDoc(collection(db, 'inbox_queries'), {
            senderUid: user.uid,
            senderName: cleanSenderName,
            senderEmail: cleanSenderEmail,
            category: feedbackCategory,
            message: feedbackText.trim(),
            destination: 'Creator Inbox (Private)',
            createdAt: serverTimestamp(),
            status: 'sent',
          });
        } catch (dbErr) {
          console.warn('Firestore backup note failed (non-blocking):', dbErr);
        }
      }

      setFeedbackSent(true);
      addToast('Query Dispatched', 'Your note has been privately sent to Deepith.', 'success');
    } catch (err: any) {
      console.error('Failed to send query:', err);
      setSubmitError(
        'Direct transmission encountered a network issue. You can still transmit directly via your email app.'
      );
      addToast('Send Failed', 'Could not deliver directly. Please use the email client fallback.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFeedbackOpen(false);
    setFeedbackSent(false);
    setSubmitError(null);
    setFeedbackText('');
  };

  const mailtoSubject = encodeURIComponent(`[Job Orbit] ${CATEGORY_LABELS[feedbackCategory]}: ${senderName || 'Inquiry'}`);
  const mailtoBody = encodeURIComponent(
    `From: ${senderName || 'Job Orbit User'}${senderEmail ? ` (${senderEmail})` : ''}\nCategory: ${CATEGORY_LABELS[feedbackCategory]}\n\n${feedbackText}`
  );
  const mailtoHref = `mailto:${CREATOR_INBOX}?subject=${mailtoSubject}&body=${mailtoBody}`;

  const PRODUCT_FEATURES = [
    {
      title: 'Kanban Application Pipeline',
      description:
        'Track every application through custom stages: Wishlist, Applied, Interviewing, Offer, and Rejected. Drag and drop cards with salary targets and deadlines.',
      icon: Briefcase,
    },
    {
      title: 'Interview Preparation Studio',
      description:
        'Built-in question banks, STAR method answer frameworks, and company intel dossiers to help you walk into every interview prepared.',
      icon: Target,
    },
    {
      title: 'Offer & Compensation Analysis',
      description:
        'Compare multiple offers side-by-side with clear breakdowns of base salary, performance bonuses, equity grants, and estimated net pay.',
      icon: Calculator,
    },
    {
      title: 'Local-First Storage & Cloud Sync',
      description:
        'Persistent IndexedDB local caching guarantees instant load times and offline readiness, paired with real-time Firebase sync.',
      icon: Shield,
    },
  ];

  const CHANGELOG = [
    {
      version: 'v2.5',
      tag: 'Current',
      title: 'Direct Creator Inquiries & UI Refinements',
      description:
        'Added privacy-protected direct feedback dispatch, streamlined inquiry routing, instant keyboard shortcuts, and performance optimizations.',
    },
    {
      version: 'v2.4',
      tag: 'Feature',
      title: 'Interview Studio & Offer Evaluator',
      description:
        'Integrated behavioral interview battlecard templates, question prep framework, and compensation comparison calculator.',
    },
    {
      version: 'v2.0',
      tag: 'Foundational',
      title: 'Real-Time Cloud Synchronization',
      description:
        'Migrated to multi-tab IndexedDB local caching combined with real-time Firebase Firestore multi-device synchronization.',
    },
  ];

  return (
    <AppShell>
      <div style={{ maxWidth: 960, margin: '0 auto', paddingTop: 20, paddingBottom: 64 }}>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13.5,
              fontWeight: 600,
              color: 'var(--t2)',
              textDecoration: 'none',
              padding: '7px 12px',
              borderRadius: 10,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            <span>Dashboard</span>
          </Link>
          <span style={{ color: 'var(--t3)', fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)' }}>About & Overview</span>
        </nav>

        {/* ── Hero Overview ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            borderRadius: 20,
            padding: '36px 32px',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 16px 36px -12px rgba(15, 23, 42, 0.4)',
            marginBottom: 28,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <BrandLogo size={42} showGlow />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: '#ffffff' }}>
                    Job Orbit
                  </h1>
                  <span
                    style={{
                      background: 'rgba(99, 102, 241, 0.25)',
                      border: '1px solid rgba(165, 180, 252, 0.3)',
                      color: '#c7d2fe',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}
                  >
                    v2.5
                  </span>
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500, marginTop: 4 }}>
                  An open-source job application tracker and interview prep workspace.
                </div>
              </div>
            </div>

            <p style={{ fontSize: 15, color: '#e2e8f0', lineHeight: 1.65, margin: '4px 0 0 0', maxWidth: 640 }}>
              Job searching across multiple websites, recruiter threads, and bookmark folders quickly becomes disorganized.
              Job Orbit replaces messy spreadsheets with a fast, private board to track your pipeline, practice interview questions,
              and compare offers in one distraction-free place.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
              <Link
                to="/dashboard"
                className="btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: 13.5,
                  fontWeight: 700,
                  border: 'none',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              >
                <span>Open Dashboard</span>
                <span aria-hidden="true">→</span>
              </Link>

              <a
                href="https://github.com/deepith-18/Job-Tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: 13.5,
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  textDecoration: 'none',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub Repository</span>
              </a>
            </div>

            {/* Spec & Architecture pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
                marginTop: 10,
                paddingTop: 16,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: 12.5,
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Code2 style={{ width: 14, height: 14, color: '#818cf8' }} />
                <span>React 19 & TypeScript</span>
              </div>
              <span style={{ opacity: 0.3 }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Database style={{ width: 14, height: 14, color: '#34d399' }} />
                <span>IndexedDB & Firebase Sync</span>
              </div>
              <span style={{ opacity: 0.3 }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase style={{ width: 14, height: 14, color: '#38bdf8' }} />
                <span>{applications.length} Applications Tracked Locally</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Creator & Maintainer Section ── */}
        <div
          id="creator"
          className="card"
          style={{
            padding: 28,
            marginBottom: 28,
            borderRadius: 16,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: 26,
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              D
            </div>

            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                    Deepith
                  </h2>
                  <div style={{ fontSize: 13, color: 'var(--t3)', fontWeight: 600, marginTop: 2 }}>
                    Creator & Software Developer
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--accent)',
                    background: 'var(--accent-bg)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                  }}
                >
                  <Terminal style={{ width: 13, height: 13 }} />
                  <span>Project Maintainer</span>
                </div>
              </div>

              <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.6, marginTop: 10, marginBottom: 14 }}>
                I built Job Orbit to establish a clean, practical workflow for the job search. Juggling dozens of recruiter
                threads, scheduling notes, and offer details across different tools is exhausting. Job Orbit combines
                pipeline tracking, interview battlecards, and offer comparisons into an open, responsive workspace.
              </p>

              {/* Tech Stack Tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {['React 19', 'TypeScript', 'Vite', 'Firebase Firestore', 'Tailwind CSS', 'IndexedDB'].map((tech) => (
                  <span
                    key={tech}
                    style={{
                      background: 'var(--page)',
                      color: 'var(--t2)',
                      border: '1px solid var(--border)',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackCategory('question');
                    setFeedbackOpen(true);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <MessageSquare style={{ width: 14, height: 14 }} />
                  <span>Ask a Query</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFeedbackCategory('feature');
                    setFeedbackOpen(true);
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--t1)',
                  }}
                >
                  <Sparkles style={{ width: 14, height: 14, color: 'var(--accent)' }} />
                  <span>Request a Feature</span>
                </button>

                <a
                  href="https://github.com/deepith-18/Job-Tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                    color: 'var(--t1)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
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
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                    color: 'var(--t1)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.97 0 1.76-.79 1.76-1.76s-.79-1.76-1.76-1.76a1.76 1.76 0 0 0-1.76 1.76c0 .97.79 1.76 1.76 1.76m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Feature Highlights (Real Application Features) ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.02em', margin: 0 }}>
              Core Features
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--t3)', margin: '4px 0 0 0' }}>
              Designed for practical candidate workflows without advertising or paywalls.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 14 }}>
            {PRODUCT_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="card"
                  style={{
                    padding: '20px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'var(--accent-bg)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon style={{ width: 18, height: 18 }} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', margin: '0 0 4px 0' }}>
                      {feature.title}
                    </h3>
                    <p style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.5, margin: 0 }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Project Changelog & Updates ── */}
        <div className="card" style={{ padding: 26, marginBottom: 28, borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Award style={{ width: 18, height: 18, color: 'var(--accent)' }} />
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Recent Updates & Changelog
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {CHANGELOG.map((item, idx) => (
              <div
                key={item.version}
                style={{
                  display: 'flex',
                  gap: 14,
                  paddingBottom: idx !== CHANGELOG.length - 1 ? 16 : 0,
                  borderBottom: idx !== CHANGELOG.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: idx === 0 ? 'var(--accent-bg)' : 'var(--page)',
                    color: idx === 0 ? 'var(--accent)' : 'var(--t2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 12.5,
                    flexShrink: 0,
                    border: `1px solid ${idx === 0 ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  {item.version}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>{item.title}</span>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 6,
                        background: idx === 0 ? 'var(--accent-bg)' : 'var(--page)',
                        color: idx === 0 ? 'var(--accent)' : 'var(--t3)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <p style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Open Source Footer ── */}
        <div
          style={{
            textAlign: 'center',
            padding: '24px 20px',
            borderRadius: 16,
            background: 'var(--page)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--t1)' }}>
            Job Orbit is an open-source project created and maintained by Deepith.
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--t3)' }}>
            Contributions, feedback, and issue reports are welcomed on{' '}
            <a
              href="https://github.com/deepith-18/Job-Tracker"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
            >
              GitHub
            </a>.
          </div>
        </div>

        {/* ── Interactive Modal: Send Query / Request to Deepith ── */}
        {feedbackOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.72)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: 16,
            }}
            onClick={resetForm}
          >
            <div
              style={{
                background: 'var(--card)',
                borderRadius: 16,
                padding: 24,
                maxWidth: 500,
                width: '100%',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: 'var(--accent-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                    }}
                  >
                    <Mail style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                      Send Query or Feedback
                    </h3>
                    <span style={{ fontSize: 12, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck style={{ width: 13, height: 13, color: '#10b981' }} />
                      <span>Direct & Confidential Dispatch to Deepith</span>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    border: 'none',
                    background: 'var(--page)',
                    cursor: 'pointer',
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                    color: 'var(--t2)',
                  }}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {feedbackSent ? (
                <div style={{ textAlign: 'center', padding: '20px 8px' }}>
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
                      marginBottom: 14,
                    }}
                  >
                    <CheckCircle2 style={{ width: 28, height: 28 }} />
                  </div>
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: '0 0 6px 0' }}>
                    Message Dispatched
                  </h4>
                  <p style={{ fontSize: 13.5, color: 'var(--t2)', margin: '0 0 18px 0', lineHeight: 1.55 }}>
                    Your message has been privately delivered to Deepith's inbox.
                    {senderEmail ? (
                      <span> Deepith will review your inquiry and follow up at <strong>{senderEmail}</strong>.</span>
                    ) : (
                      <span> Deepith appreciates your note and will review it directly.</span>
                    )}
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn btn-primary"
                      style={{ padding: '7px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackSent(false);
                        setFeedbackText('');
                      }}
                      className="btn btn-ghost"
                      style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: '1px solid var(--border)' }}
                    >
                      Send Another Query
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendFeedback} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {submitError && (
                    <div
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: 8,
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        fontSize: 12.5,
                        color: 'var(--t1)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontWeight: 600 }}>
                        <AlertCircle style={{ width: 15, height: 15 }} />
                        <span>Transmission Notice</span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--t2)', fontSize: 12 }}>
                        {submitError}
                      </p>
                      <a
                        href={mailtoHref}
                        className="btn btn-sm"
                        style={{
                          alignSelf: 'flex-start',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#ef4444',
                          color: '#ffffff',
                          borderRadius: 6,
                          padding: '5px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink style={{ width: 12, height: 12 }} />
                        <span>Open in Email App</span>
                      </a>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--t2)', marginBottom: 6 }}>
                      Topic
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {[
                        { id: 'question', label: 'General Query', icon: MessageSquare },
                        { id: 'feature', label: 'Feature Request', icon: Sparkles },
                        { id: 'appreciation', label: 'Feedback', icon: Heart },
                      ].map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFeedbackCategory(type.id as any)}
                            style={{
                              padding: '8px 6px',
                              borderRadius: 8,
                              border: `1px solid ${feedbackCategory === type.id ? 'var(--accent)' : 'var(--border)'}`,
                              background: feedbackCategory === type.id ? 'var(--accent-bg)' : 'var(--page)',
                              color: feedbackCategory === type.id ? 'var(--accent)' : 'var(--t2)',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Icon style={{ width: 13, height: 13 }} />
                            <span>{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--t2)', marginBottom: 5 }}>
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Name or handle"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          fontSize: 13,
                          color: 'var(--t1)',
                          background: 'var(--page)',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--t2)', marginBottom: 5 }}>
                        Your Email (for response)
                      </label>
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          fontSize: 13,
                          color: 'var(--t1)',
                          background: 'var(--page)',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--t2)', marginBottom: 5 }}>
                      {feedbackCategory === 'feature'
                        ? 'Describe the Requested Feature'
                        : feedbackCategory === 'question'
                        ? 'Your Query or Question'
                        : 'Your Feedback'}
                    </label>
                    <textarea
                      rows={4}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder={
                        feedbackCategory === 'feature'
                          ? 'Describe the feature or workflow improvement you would like added...'
                          : feedbackCategory === 'question'
                          ? 'Type your question or query here...'
                          : 'Share your thoughts, suggestions, or notes...'
                      }
                      required
                      style={{
                        width: '100%',
                        padding: '9px 11px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        fontSize: 13.5,
                        color: 'var(--t1)',
                        background: 'var(--page)',
                        resize: 'none',
                        outline: 'none',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        lineHeight: 1.5,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10,
                      paddingTop: 2,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--t3)' }}>
                      <ShieldCheck style={{ width: 14, height: 14, color: '#10b981' }} />
                      <span>Confidential Dispatch to Deepith</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <a
                        href={mailtoHref}
                        title="Directly launch your default email client"
                        style={{
                          fontSize: 12,
                          color: 'var(--t2)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 9px',
                          borderRadius: 6,
                          border: '1px solid var(--border)',
                        }}
                      >
                        <ExternalLink style={{ width: 12, height: 12 }} />
                        <span>Email app</span>
                      </a>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary"
                        style={{
                          padding: '8px 18px',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          opacity: isSubmitting ? 0.75 : 1,
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send style={{ width: 13, height: 13 }} />
                            <span>Send to Deepith</span>
                          </>
                        )}
                      </button>
                    </div>
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
