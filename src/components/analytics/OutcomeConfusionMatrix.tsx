import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Briefcase,
  ChevronRight,
  Sliders,
  Target,
  Info,
} from 'lucide-react';
import { Application } from '../../types';

interface OutcomeConfusionMatrixProps {
  applications: Application[];
}

export const OutcomeConfusionMatrix: React.FC<OutcomeConfusionMatrixProps> = ({
  applications,
}) => {
  // Confidence threshold: rating >= 3 or 4
  const [ratingThreshold, setRatingThreshold] = useState<number>(3);
  const [selectedQuadrant, setSelectedQuadrant] = useState<
    'TP' | 'FP' | 'FN' | 'TN' | null
  >(null);
  const [infoOpen, setInfoOpen] = useState(false);

  // Categorize applications
  const { tpApps, fpApps, fnApps, tnApps, pendingCount } = useMemo(() => {
    const tp: Application[] = [];
    const fp: Application[] = [];
    const fn: Application[] = [];
    const tn: Application[] = [];
    let pending = 0;

    applications.forEach((app) => {
      const isHighConfidence = (app.rating || 3) >= ratingThreshold;
      const isPositiveOutcome = ['OA/Assessment', 'Interview', 'Offer'].includes(
        app.status
      );
      const isNegativeOutcome = ['Rejected', 'Ghosted'].includes(app.status);

      if (isPositiveOutcome) {
        if (isHighConfidence) tp.push(app);
        else fn.push(app);
      } else if (isNegativeOutcome) {
        if (isHighConfidence) fp.push(app);
        else tn.push(app);
      } else {
        // Pending / in-flight without final screening outcome
        pending++;
      }
    });

    return {
      tpApps: tp,
      fpApps: fp,
      fnApps: fn,
      tnApps: tn,
      pendingCount: pending,
    };
  }, [applications, ratingThreshold]);

  const totalEvaluated =
    tpApps.length + fpApps.length + fnApps.length + tnApps.length;

  // Fallback demo data if user has fewer than 4 evaluated applications
  const isDemo = totalEvaluated < 4;

  const displayTP = isDemo ? 5 : tpApps.length;
  const displayFP = isDemo ? 3 : fpApps.length;
  const displayFN = isDemo ? 2 : fnApps.length;
  const displayTN = isDemo ? 4 : tnApps.length;
  const displayTotal = displayTP + displayFP + displayFN + displayTN;

  // Calculations
  const precision =
    displayTP + displayFP > 0
      ? Math.round((displayTP / (displayTP + displayFP)) * 100)
      : 0;
  const sensitivity =
    displayFN + displayTN > 0
      ? Math.round((displayFN / (displayFN + displayTN)) * 100)
      : 0;
  const calibrationAccuracy =
    displayTotal > 0
      ? Math.round(((displayTP + displayTN) / displayTotal) * 100)
      : 0;
  const f1Score =
    displayTP + displayFP + displayFN > 0
      ? Math.round(
          (2 * displayTP) / (2 * displayTP + displayFP + displayFN) * 100
        )
      : 0;

  // Active quadrant apps to display in drilldown
  const activeQuadrantApps = useMemo(() => {
    if (selectedQuadrant === 'TP') return tpApps;
    if (selectedQuadrant === 'FP') return fpApps;
    if (selectedQuadrant === 'FN') return fnApps;
    if (selectedQuadrant === 'TN') return tnApps;
    return [];
  }, [selectedQuadrant, tpApps, fpApps, fnApps, tnApps]);

  const quadrantDetails = {
    TP: {
      title: 'True Positives (Target Hits)',
      tagline: 'High Confidence Roles ➔ Converted to Interview / Offer',
      color: '#10b981',
      bg: 'var(--card)',
      advice:
        'Your profile strongly aligns with expectations here. Analyze common keywords and tech stacks in these roles to replicate success.',
    },
    FP: {
      title: 'False Positives (Screening Friction)',
      tagline: 'High Confidence Roles ➔ Screened Out / Rejected',
      color: '#f59e0b',
      bg: 'var(--card)',
      advice:
        'You felt confident, but encountered resume screening drop-off. Check your ATS keyword density or leverage internal referrals.',
    },
    FN: {
      title: 'False Negatives (Surprise Breakthroughs)',
      tagline: 'Stretch / Low Confidence Roles ➔ Converted to Interview / Offer',
      color: '#06b6d4',
      bg: 'var(--card)',
      advice:
        'You underestimated your market power! You are more competitive for higher-tier or senior roles than you thought.',
    },
    TN: {
      title: 'True Negatives (Calculated Longshots)',
      tagline: 'Stretch / Low Confidence Roles ➔ Screened Out / Rejected',
      color: '#64748b',
      bg: 'var(--card)',
      advice:
        'Expected outcomes with minimal opportunity cost. Great for ambitious exploration without emotional drag.',
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Header & Concept Explanation Bar ── */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          background:
            'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
          border: '1.5px solid var(--border)',
        }}
      >
        <div
          style={{
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
                borderRadius: 14,
                background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                flexShrink: 0,
              }}
            >
              <Grid style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: 'var(--t1)',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Candidate Outcome Confusion Matrix
                </h2>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: 'var(--accent-bg)',
                    color: 'var(--accent)',
                  }}
                >
                  Decision Telemetry
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--t2)',
                  margin: '3px 0 0 0',
                }}
              >
                Maps your predicted role confidence vs actual market conversion to calibrate your search strategy • {pendingCount} in-flight.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Threshold Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--page)',
                padding: '4px 10px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--t2)',
              }}
            >
              <Sliders style={{ width: 13, height: 13, color: 'var(--accent)' }} />
              <span>Target Confidence:</span>
              <button
                type="button"
                onClick={() => setRatingThreshold(3)}
                style={{
                  border: 'none',
                  background:
                    ratingThreshold === 3 ? 'var(--accent)' : 'transparent',
                  color: ratingThreshold === 3 ? '#ffffff' : 'var(--t2)',
                  borderRadius: 6,
                  padding: '2px 7px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 11.5,
                }}
              >
                ★3+
              </button>
              <button
                type="button"
                onClick={() => setRatingThreshold(4)}
                style={{
                  border: 'none',
                  background:
                    ratingThreshold === 4 ? 'var(--accent)' : 'transparent',
                  color: ratingThreshold === 4 ? '#ffffff' : 'var(--t2)',
                  borderRadius: 6,
                  padding: '2px 7px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 11.5,
                }}
              >
                ★4+
              </button>
            </div>

            <button
              type="button"
              onClick={() => setInfoOpen(!infoOpen)}
              className="btn btn-ghost btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
              }}
            >
              <Info style={{ width: 14, height: 14 }} />
              <span>How it Works</span>
            </button>
          </div>
        </div>

        {/* Informational Explainer Box */}
        {infoOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: 16,
              padding: '14px 18px',
              borderRadius: 14,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: 12.5,
              color: 'var(--t2)',
              lineHeight: 1.6,
            }}
          >
            <strong>What is a Job Search Confusion Matrix?</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              Borrowing from predictive analytics, this 2×2 grid categorizes
              your applications into four states: whether your expected fit
              matched the recruiter's decision. It helps spot whether you are
              underestimating your market value (Surprise Breakthroughs) or
              facing hidden ATS keyword barriers in roles you thought were
              guaranteed (Screening Friction).
            </p>
          </motion.div>
        )}

        {isDemo && (
          <div
            style={{
              marginTop: 14,
              padding: '8px 12px',
              borderRadius: 10,
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              fontSize: 12,
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Sparkles style={{ width: 14, height: 14 }} />
            <span>
              Preview mode: Showing illustrative model telemetry until you
              accumulate 4+ closed applications. ({applications.length} total
              in workspace).
            </span>
          </div>
        )}
      </div>

      {/* ── Core 2x2 Outcome Confusion Matrix ── */}
      <div className="card" style={{ padding: '28px 24px', overflowX: 'auto' }}>
        <div style={{ minWidth: 620 }}>
          {/* Top Axis Label */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--t3)',
                background: 'var(--page)',
                padding: '4px 14px',
                borderRadius: 20,
                border: '1px solid var(--border)',
              }}
            >
              Actual Market Outcome (Decision Result)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 14 }}>
            {/* Empty top-left cell */}
            <div />

            {/* Column Headers */}
            <div
              style={{
                textAlign: 'center',
                padding: '10px 12px',
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              Positive Outcome
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t2)' }}>
                (Interview, OA, or Offer)
              </div>
            </div>

            <div
              style={{
                textAlign: 'center',
                padding: '10px 12px',
                borderRadius: 12,
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              Negative Outcome
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t2)' }}>
                (Rejected or Ghosted)
              </div>
            </div>

            {/* Row 1: High Confidence */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '12px 8px',
                borderRadius: 12,
                background: 'var(--page)',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)' }}>
                Target Roles
              </span>
              <span style={{ fontSize: 11, color: 'var(--t3)' }}>
                (High Conviction ★{ratingThreshold}+)
              </span>
            </div>

            {/* Cell 1: True Positive (TP) */}
            <div
              onClick={() => setSelectedQuadrant('TP')}
              style={{
                padding: 22,
                borderRadius: 16,
                background:
                  selectedQuadrant === 'TP'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.1) 100%)'
                    : 'var(--card)',
                border: `2px solid ${
                  selectedQuadrant === 'TP' ? '#10b981' : 'rgba(16, 185, 129, 0.3)'
                }`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow:
                  selectedQuadrant === 'TP'
                    ? '0 8px 24px rgba(16, 185, 129, 0.25)'
                    : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#10b981',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    True Positive (Hit)
                  </span>
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: 'var(--t1)',
                      margin: '2px 0 0 0',
                    }}
                  >
                    Precision Targets
                  </h3>
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#10b981',
                    lineHeight: 1,
                  }}
                >
                  {displayTP}
                </div>
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: 'var(--t2)',
                  marginTop: 10,
                  marginBottom: 12,
                  lineHeight: 1.4,
                }}
              >
                High confidence applications that successfully converted. Your
                sweet spot!
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#10b981',
                }}
              >
                <span>View Matching Roles ({isDemo ? 5 : tpApps.length})</span>
                <ChevronRight style={{ width: 13, height: 13 }} />
              </div>
            </div>

            {/* Cell 2: False Positive (FP) */}
            <div
              onClick={() => setSelectedQuadrant('FP')}
              style={{
                padding: 22,
                borderRadius: 16,
                background:
                  selectedQuadrant === 'FP'
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.1) 100%)'
                    : 'var(--card)',
                border: `2px solid ${
                  selectedQuadrant === 'FP' ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)'
                }`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow:
                  selectedQuadrant === 'FP'
                    ? '0 8px 24px rgba(245, 158, 11, 0.25)'
                    : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#f59e0b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    False Positive (Miss)
                  </span>
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: 'var(--t1)',
                      margin: '2px 0 0 0',
                    }}
                  >
                    Screening Friction
                  </h3>
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#f59e0b',
                    lineHeight: 1,
                  }}
                >
                  {displayFP}
                </div>
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: 'var(--t2)',
                  marginTop: 10,
                  marginBottom: 12,
                  lineHeight: 1.4,
                }}
              >
                High confidence roles that were screened out. Possible ATS or
                referral gap.
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#f59e0b',
                }}
              >
                <span>View Matching Roles ({isDemo ? 3 : fpApps.length})</span>
                <ChevronRight style={{ width: 13, height: 13 }} />
              </div>
            </div>

            {/* Row 2: Stretch / Low Confidence */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '12px 8px',
                borderRadius: 12,
                background: 'var(--page)',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)' }}>
                Reach Roles
              </span>
              <span style={{ fontSize: 11, color: 'var(--t3)' }}>
                (Stretch / Cold Apply)
              </span>
            </div>

            {/* Cell 3: False Negative (FN) */}
            <div
              onClick={() => setSelectedQuadrant('FN')}
              style={{
                padding: 22,
                borderRadius: 16,
                background:
                  selectedQuadrant === 'FN'
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(14, 165, 233, 0.1) 100%)'
                    : 'var(--card)',
                border: `2px solid ${
                  selectedQuadrant === 'FN' ? '#06b6d4' : 'rgba(6, 182, 212, 0.3)'
                }`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow:
                  selectedQuadrant === 'FN'
                    ? '0 8px 24px rgba(6, 182, 212, 0.25)'
                    : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#06b6d4',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    False Negative (Surprise)
                  </span>
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: 'var(--t1)',
                      margin: '2px 0 0 0',
                    }}
                  >
                    Surprise Wins
                  </h3>
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#06b6d4',
                    lineHeight: 1,
                  }}
                >
                  {displayFN}
                </div>
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: 'var(--t2)',
                  marginTop: 10,
                  marginBottom: 12,
                  lineHeight: 1.4,
                }}
              >
                Stretch roles that advanced! Proof you are under-pricing your
                capabilities.
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#06b6d4',
                }}
              >
                <span>View Matching Roles ({isDemo ? 2 : fnApps.length})</span>
                <ChevronRight style={{ width: 13, height: 13 }} />
              </div>
            </div>

            {/* Cell 4: True Negative (TN) */}
            <div
              onClick={() => setSelectedQuadrant('TN')}
              style={{
                padding: 22,
                borderRadius: 16,
                background:
                  selectedQuadrant === 'TN'
                    ? 'linear-gradient(135deg, rgba(100, 116, 139, 0.18) 0%, rgba(71, 85, 105, 0.1) 100%)'
                    : 'var(--card)',
                border: `2px solid ${
                  selectedQuadrant === 'TN' ? '#64748b' : 'var(--border)'
                }`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow:
                  selectedQuadrant === 'TN'
                    ? '0 8px 24px rgba(100, 116, 139, 0.25)'
                    : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: 'var(--t3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    True Negative (Expected)
                  </span>
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: 'var(--t1)',
                      margin: '2px 0 0 0',
                    }}
                  >
                    Calculated Longshots
                  </h3>
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: 'var(--t2)',
                    lineHeight: 1,
                  }}
                >
                  {displayTN}
                </div>
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: 'var(--t2)',
                  marginTop: 10,
                  marginBottom: 12,
                  lineHeight: 1.4,
                }}
              >
                Reach roles that didn't advance. Expected risk with zero regret.
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: 'var(--t2)',
                }}
              >
                <span>View Matching Roles ({isDemo ? 4 : tnApps.length})</span>
                <ChevronRight style={{ width: 13, height: 13 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Drilldown Role Drawer / Details Panel when a quadrant is clicked ── */}
      <AnimatePresence>
        {selectedQuadrant && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card"
            style={{
              padding: 24,
              border: `2px solid ${quadrantDetails[selectedQuadrant].color}`,
              background: quadrantDetails[selectedQuadrant].bg,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: quadrantDetails[selectedQuadrant].color,
                    margin: 0,
                  }}
                >
                  {quadrantDetails[selectedQuadrant].title}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>
                  {quadrantDetails[selectedQuadrant].tagline}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedQuadrant(null)}
                style={{
                  background: 'var(--card-hover)',
                  color: 'var(--t1)',
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                }}
              >
                Close Breakdown ✕
              </button>
            </div>

            <div
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: 'var(--card-hover)',
                border: '1px solid var(--border)',
                marginBottom: 14,
                fontSize: 12.5,
                color: 'var(--t2)',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: 'var(--t1)' }}>Strategic Takeaway:</strong>{' '}
              {quadrantDetails[selectedQuadrant].advice}
            </div>

            {/* List of Applications in Quadrant */}
            {activeQuadrantApps.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {activeQuadrantApps.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      background: 'var(--card-hover)',
                      border: '1px solid var(--border)',
                      padding: '8px 14px',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <Briefcase
                      style={{
                        width: 14,
                        height: 14,
                        color: quadrantDetails[selectedQuadrant].color,
                      }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
                      {app.company}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--t3)' }}>
                      — {app.role}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        padding: '2px 6px',
                        borderRadius: 8,
                        background: 'var(--page)',
                        border: '1px solid var(--border)',
                        fontWeight: 700,
                        color: 'var(--t2)',
                      }}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  background: 'var(--card-hover)',
                  borderRadius: 12,
                  border: '1px dashed var(--border)',
                  fontSize: 12.5,
                  color: 'var(--t3)',
                }}
              >
                No applications in this quadrant yet for the current threshold.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Metric Telemetry Cards derived from the Matrix ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
        }}
      >
        <div className="card" style={{ padding: '18px 20px', borderTop: '3px solid #4f46e5' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>
              Calibration Score
            </span>
            <Target style={{ width: 16, height: 16, color: '#4f46e5' }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--t1)' }}>
            {calibrationAccuracy}%
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>
            (TP + TN) / Total Outcomes
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderTop: '3px solid #10b981' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>
              Target Precision
            </span>
            <CheckCircle2 style={{ width: 16, height: 16, color: '#10b981' }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#10b981' }}>
            {precision}%
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>
            High-conviction hit rate
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderTop: '3px solid #06b6d4' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>
              Surprise Win Rate
            </span>
            <Sparkles style={{ width: 16, height: 16, color: '#06b6d4' }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#06b6d4' }}>
            {sensitivity}%
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>
            Reach role breakthrough index
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderTop: '3px solid #f59e0b' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>
              Balanced Alignment (F1)
            </span>
            <TrendingUp style={{ width: 16, height: 16, color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#f59e0b' }}>
            {f1Score}%
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>
            Harmonic precision/recall
          </div>
        </div>
      </div>
    </div>
  );
};
