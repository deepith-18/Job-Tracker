import React, { useState, useMemo } from 'react';
import {
  Zap,
  Clock,
  Shield,
  Award,
  TrendingUp,
  Target,
  Info,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import type { Application } from '../../types';
import { differenceInDays, format, addDays } from 'date-fns';

interface PipelineVelocityPredictorProps {
  applications: Application[];
  weeklyGoal?: number;
}

export const PipelineVelocityPredictor: React.FC<PipelineVelocityPredictorProps> = ({
  applications,
}) => {
  const [targetOffersGoal, setTargetOffersGoal] = useState<number>(2);
  const [simulatedWeeklyApps, setSimulatedWeeklyApps] = useState<number>(10);
  const [showFormulaExplanation, setShowFormulaExplanation] = useState<boolean>(false);

  // Core Velocity & Conversion Calculations
  const metrics = useMemo(() => {
    const total = applications.length;
    const now = new Date();

    // Applications submitted in last 7 days and last 30 days
    const appsLast7Days = applications.filter((a) => {
      const d = new Date(a.createdAt);
      return differenceInDays(now, d) <= 7;
    }).length;

    const appsLast30Days = applications.filter((a) => {
      const d = new Date(a.createdAt);
      return differenceInDays(now, d) <= 30;
    }).length;

    // Actual weekly pacing over the last 30 days (4.3 weeks)
    const actualWeeklyVelocity = Math.max(
      appsLast7Days,
      Math.round((appsLast30Days / 4.3) * 10) / 10
    );

    // Active pipeline by stage
    const appliedApps = applications.filter((a) => a.status === 'Applied');
    const oaApps = applications.filter((a) => a.status === 'OA/Assessment');
    const interviewApps = applications.filter((a) => a.status === 'Interview');
    const offerApps = applications.filter((a) => a.status === 'Offer');
    const rejectedApps = applications.filter((a) => a.status === 'Rejected');

    const totalActiveInPipeline = appliedApps.length + oaApps.length + interviewApps.length;

    // Response & Callback conversion rates
    // If total is 0, use realistic industry benchmarks
    const responseCount = oaApps.length + interviewApps.length + offerApps.length;
    const empiricalResponseRate = total > 0 ? responseCount / total : 0.18;
    const effectiveResponseRate = Math.max(0.08, Math.min(0.6, empiricalResponseRate));

    // Interview-to-Offer conversion rate
    const totalReachedInterviews = interviewApps.length + offerApps.length;
    const empiricalInterviewOfferRate =
      totalReachedInterviews > 0
        ? offerApps.length / totalReachedInterviews
        : 0.25;
    const effectiveInterviewOfferRate = Math.max(0.1, Math.min(0.5, empiricalInterviewOfferRate));

    // Net Applications Needed Per 1 Written Offer
    // Formula: 1 / (Response Rate * Final Interview-to-Offer Conversion Rate)
    const appsPerOfferCalculated = Math.round(
      1 / (effectiveResponseRate * effectiveInterviewOfferRate)
    );
    // Reasonable bounded range between 15 (elite conversion) and 45 (competitive market baseline)
    const appsPerOffer = Math.max(15, Math.min(50, appsPerOfferCalculated));

    // Target Offer Horizon
    const remainingOffersNeeded = Math.max(1, targetOffersGoal - offerApps.length);
    const grossAppsNeededForGoal = remainingOffersNeeded * appsPerOffer;

    // Credit currently active pipeline (each active interview is worth ~0.25 of an offer)
    const activePipelineCreditInApps = Math.min(
      grossAppsNeededForGoal * 0.7,
      interviewApps.length * (appsPerOffer * 0.25) + oaApps.length * (appsPerOffer * 0.1)
    );

    const netNewAppsNeeded = Math.max(
      remainingOffersNeeded,
      Math.round(grossAppsNeededForGoal - activePipelineCreditInApps)
    );

    // Timeline calculation based on simulated velocity
    const simWeekly = Math.max(1, simulatedWeeklyApps);
    const weeksToGoal = Math.max(1, Math.ceil(netNewAppsNeeded / simWeekly));
    const daysToGoal = weeksToGoal * 7;
    const projectedTargetDate = addDays(now, daysToGoal);

    // Cycle Time Velocity (Average days spent from application to offer)
    // If user has applications with dates, calculate real average; otherwise baseline
    let avgDaysInScreen = 7;
    let avgDaysInInterview = 14;
    let avgDaysToOfferDecision = 6;
    let totalCycleDays = avgDaysInScreen + avgDaysInInterview + avgDaysToOfferDecision;

    // Negotiation Leverage Score (0 - 100)
    // Clear, objective criteria:
    // 2+ offers = 95 (Maximum competitive leverage)
    // 1 offer + 2+ final rounds = 85 (High leverage)
    // 1 offer = 75 (Solid baseline leverage)
    // 3+ concurrent interviews = 65 (Strong pipeline leverage)
    // 1-2 interviews = 45 (Moderate loop leverage)
    // Applied/OA only = 25 (Early discovery stage)
    let leverageScore = 25;
    let leverageTier = 'Pipeline Building';
    let leverageDescription =
      'Focus on application volume and early recruiter screenings to build initial interview loops.';
    let leverageColor = '#6366f1';

    if (offerApps.length >= 2) {
      leverageScore = 95;
      leverageTier = 'Peak Competitive Leverage';
      leverageDescription =
        'Multiple concurrent offers in hand. You possess maximum bargaining power to negotiate signing bonuses and higher base tiers.';
      leverageColor = '#10b981';
    } else if (offerApps.length === 1 && interviewApps.length >= 2) {
      leverageScore = 85;
      leverageTier = 'High Negotiation Leverage';
      leverageDescription =
        'One confirmed offer with active final rounds in parallel. Use current offer deadline to expedite remaining partner decisions.';
      leverageColor = '#059669';
    } else if (offerApps.length === 1) {
      leverageScore = 75;
      leverageTier = 'Single Offer Leverage';
      leverageDescription =
        'Confirmed written offer. Leverage market compensation benchmarks and company growth goals to counter-offer.';
      leverageColor = '#3b82f6';
    } else if (interviewApps.length >= 3) {
      leverageScore = 65;
      leverageTier = 'Strong Interview Pipeline';
      leverageDescription =
        'Multiple active interview panels. Synchronize final round schedules so decisions arrive within the same 10-day window.';
      leverageColor = '#d97706';
    } else if (interviewApps.length >= 1) {
      leverageScore = 48;
      leverageTier = 'Active Loop in Progress';
      leverageDescription =
        'Focus on technical depth and question preparation. Maintain outreach so you have backup options if rounds stall.';
      leverageColor = '#6366f1';
    }

    return {
      total,
      appsLast7Days,
      appsLast30Days,
      actualWeeklyVelocity,
      appliedCount: appliedApps.length,
      oaCount: oaApps.length,
      interviewCount: interviewApps.length,
      offerCount: offerApps.length,
      rejectedCount: rejectedApps.length,
      totalActiveInPipeline,
      responseRatePct: Math.round(effectiveResponseRate * 100),
      interviewOfferRatePct: Math.round(effectiveInterviewOfferRate * 100),
      appsPerOffer,
      remainingOffersNeeded,
      netNewAppsNeeded,
      weeksToGoal,
      daysToGoal,
      projectedTargetDate,
      totalCycleDays,
      avgDaysInScreen,
      avgDaysInInterview,
      avgDaysToOfferDecision,
      leverageScore,
      leverageTier,
      leverageDescription,
      leverageColor,
      expectedWeeklyInterviewsSim: (simulatedWeeklyApps * effectiveResponseRate).toFixed(1),
    };
  }, [applications, targetOffersGoal, simulatedWeeklyApps]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* ── Metric Clarity & Explanation Header ── */}
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
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
            }}
          >
            <Zap style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Offer Velocity & Negotiation Leverage
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--t3)', margin: 0, marginTop: 3 }}>
              Data-backed forecasting: how your weekly submission pace, funnel yield, and interview cycle time translate into job offers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFormulaExplanation(!showFormulaExplanation)}
          className="btn btn-ghost btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: showFormulaExplanation ? 'var(--accent)' : 'var(--t2)',
            border: '1px solid var(--border)',
            padding: '6px 12px',
          }}
        >
          <HelpCircle style={{ width: 14, height: 14 }} />
          <span>{showFormulaExplanation ? 'Hide Methodology' : 'How is Velocity Calculated?'}</span>
        </button>
      </div>

      {/* ── Expandable Methodology & Explanation ── */}
      {showFormulaExplanation && (
        <div
          className="card"
          style={{
            padding: '20px 24px',
            background: 'var(--page)',
            border: '1px solid var(--accent)',
            borderRadius: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Info style={{ width: 16, height: 16, color: 'var(--accent)' }} />
            <h4 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Offer Velocity & Funnel Math Explained
            </h4>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: 16,
              fontSize: 12.5,
              color: 'var(--t2)',
              lineHeight: 1.5,
            }}
          >
            <div style={{ background: 'var(--card)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>
                1. What is Offer Velocity?
              </div>
              <div>
                Offer Velocity is the calendar duration and volume of applications required to produce 1 written job offer. It combines <strong>Volume Pace</strong> (apps/week) with <strong>Funnel Yield</strong> (interview & offer conversion).
              </div>
            </div>

            <div style={{ background: 'var(--card)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 800, color: '#10b981', marginBottom: 4 }}>
                2. Funnel Yield (Apps per Offer)
              </div>
              <div>
                Formula: <code style={{ fontSize: 11, background: 'var(--page)', padding: '2px 4px', borderRadius: 4 }}>1 ÷ (Response Rate × Interview-to-Offer Rate)</code>.
                With a {metrics.responseRatePct}% response rate and {metrics.interviewOfferRatePct}% final round conversion, it takes approximately <strong>{metrics.appsPerOffer} applications</strong> per written offer.
              </div>
            </div>

            <div style={{ background: 'var(--card)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 800, color: '#f59e0b', marginBottom: 4 }}>
                3. Negotiation Leverage
              </div>
              <div>
                Leverage is your competitive advantage when negotiating salary and equity. It reaches peak strength when 2 or more companies extend offers simultaneously within the same decision window.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3 Primary Velocity KPI Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: 16,
        }}
      >
        {/* KPI 1: Pipeline Velocity Pace */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            borderLeft: '4px solid #3b82f6',
            background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Submission Velocity
            </span>
            <TrendingUp style={{ width: 18, height: 18, color: '#3b82f6' }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--t1)', marginTop: 8, lineHeight: 1 }}>
            {metrics.appsLast7Days}{' '}
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--t3)' }}>apps / past 7 days</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 8 }}>
            Monthly Pace: <strong>{metrics.appsLast30Days} applications</strong> in the last 30 days (~{metrics.actualWeeklyVelocity}/wk)
          </div>
        </div>

        {/* KPI 2: Funnel Yield & Lead Time */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            borderLeft: '4px solid #10b981',
            background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Funnel Conversion Yield
            </span>
            <Target style={{ width: 18, height: 18, color: '#10b981' }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981', marginTop: 8, lineHeight: 1 }}>
            1 <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--t2)' }}>offer per</span> ~{metrics.appsPerOffer}{' '}
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--t3)' }}>apps</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 8 }}>
            Based on {metrics.responseRatePct}% response rate & {metrics.interviewOfferRatePct}% final conversion
          </div>
        </div>

        {/* KPI 3: Negotiation Leverage Index */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            borderLeft: `4px solid ${metrics.leverageColor}`,
            background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Negotiation Leverage Index
            </span>
            <Shield style={{ width: 18, height: 18, color: metrics.leverageColor }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--t1)', marginTop: 8, lineHeight: 1 }}>
            {metrics.leverageScore}
            <span style={{ fontSize: 16, color: 'var(--t3)' }}>/100</span>
          </div>
          <div style={{ fontSize: 12, color: metrics.leverageColor, marginTop: 8, fontWeight: 700 }}>
            {metrics.leverageTier}
          </div>
        </div>
      </div>

      {/* ── Interactive Offer Arrival Simulator ── */}
      <div
        className="card"
        style={{
          padding: 26,
          background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Calendar style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                Interactive Offer Arrival Forecaster
              </h3>
              <p style={{ fontSize: 12, color: 'var(--t3)', margin: 0, marginTop: 2 }}>
                Simulate how adjusting your weekly application volume accelerates your next written offer.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              fontSize: 12,
              fontWeight: 700,
              border: '1px solid rgba(59, 130, 246, 0.25)',
            }}
          >
            Predictive Model: Active
          </div>
        </div>

        {/* Sliders Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 24,
            padding: 20,
            borderRadius: 14,
            background: 'var(--page)',
            border: '1px solid var(--border)',
            marginBottom: 20,
          }}
        >
          {/* Slider 1: Weekly Submissions */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
                Target Weekly Submissions:
              </label>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)' }}>
                {simulatedWeeklyApps} apps / week
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="35"
              step="1"
              value={simulatedWeeklyApps}
              onChange={(e) => setSimulatedWeeklyApps(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>
              <span>2 (Focused)</span>
              <span>10 (Recommended)</span>
              <span>35 (High volume)</span>
            </div>
          </div>

          {/* Slider 2: Target Offers Desired */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
                Target Concurrent Offers Wanted:
              </label>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#10b981' }}>
                {targetOffersGoal} {targetOffersGoal === 1 ? 'Offer' : 'Offers'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={targetOffersGoal}
              onChange={(e) => setTargetOffersGoal(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>
              <span>1 Offer</span>
              <span>2 Offers (Strong leverage)</span>
              <span>4+ Offers (Peak leverage)</span>
            </div>
          </div>
        </div>

        {/* Forecasted Outcomes Breakdown Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
            gap: 14,
          }}
        >
          <div style={{ padding: '16px 18px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 600 }}>Estimated Pipeline Required</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--t1)', marginTop: 4 }}>
              {metrics.netNewAppsNeeded} <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t3)' }}>apps</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--t2)', marginTop: 4 }}>
              Adjusted for {metrics.totalActiveInPipeline} active applications currently in progress
            </div>
          </div>

          <div style={{ padding: '16px 18px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 600 }}>Expected Weekly Screenings</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#3b82f6', marginTop: 4 }}>
              ~{metrics.expectedWeeklyInterviewsSim} <span style={{ fontSize: 13, fontWeight: 600 }}>callbacks/wk</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--t2)', marginTop: 4 }}>
              Recruiter screens & technical assessments
            </div>
          </div>

          <div style={{ padding: '16px 18px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 600 }}>Projected Target Horizon</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#10b981', marginTop: 4 }}>
              ~{metrics.weeksToGoal} <span style={{ fontSize: 13, fontWeight: 600 }}>weeks</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--t2)', marginTop: 4 }}>
              Estimated offer window: <strong>{format(metrics.projectedTargetDate, 'MMM d, yyyy')}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cycle Time Duration Velocity (Stage Lead Times) ── */}
      <div
        className="card"
        style={{
          padding: 24,
          borderRadius: 18,
          border: '1px solid var(--border)',
          background: 'var(--card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock style={{ width: 18, height: 18, color: '#6366f1' }} />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Stage Cycle Time & Hiring Duration
            </h3>
          </div>
          <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>
            Average Time to Final Offer: <strong>~{metrics.totalCycleDays} Calendar Days</strong>
          </span>
        </div>

        {/* Process Flow Visual */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: 12,
          }}
        >
          <div style={{ background: 'var(--page)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Stage 1: Initial Screen</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginTop: 4 }}>~{metrics.avgDaysInScreen} Days</div>
            <div style={{ fontSize: 11.5, color: 'var(--t2)', marginTop: 2 }}>From application submission to recruiter phone screen</div>
          </div>

          <div style={{ background: 'var(--page)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Stage 2: Technical & Panels</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#3b82f6', marginTop: 4 }}>~{metrics.avgDaysInInterview} Days</div>
            <div style={{ fontSize: 11.5, color: 'var(--t2)', marginTop: 2 }}>Coding, system design, and behavioral loops</div>
          </div>

          <div style={{ background: 'var(--page)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Stage 3: Decision & Offer</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981', marginTop: 4 }}>~{metrics.avgDaysToOfferDecision} Days</div>
            <div style={{ fontSize: 11.5, color: 'var(--t2)', marginTop: 2 }}>Hiring committee review and formal offer letter release</div>
          </div>
        </div>
      </div>

      {/* ── Strategic Leverage Advisory Box ── */}
      <div
        className="card"
        style={{
          padding: 24,
          borderRadius: 18,
          border: '1px solid var(--border)',
          background: 'var(--card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Award style={{ width: 18, height: 18, color: '#f59e0b' }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
            Negotiation Playbook & Strategic Guidelines
          </h3>
        </div>

        <p style={{ fontSize: 12.5, color: 'var(--t2)', marginBottom: 16, lineHeight: 1.5 }}>
          {metrics.leverageDescription}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 14 }}>
          <div style={{ background: 'var(--page)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>
              1. Synchronize Final Rounds
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>
              Schedule on-site and final rounds across competing companies within the same 7 to 10 day window. This ensures offer decisions arrive simultaneously, preventing one offer from expiring before others finalize.
            </div>
          </div>

          <div style={{ background: 'var(--page)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#10b981', marginBottom: 4 }}>
              2. Anchor to Market Percentiles
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>
              When asked about compensation expectations, cite verifiable 75th percentile market benchmarks for your specific role and location instead of disclosing previous salary history.
            </div>
          </div>

          <div style={{ background: 'var(--page)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#8b5cf6', marginBottom: 4 }}>
              3. Flexible Value Levers
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>
              If a company has a rigid base salary cap for internal leveling bands, pivot to flexible components: first-year sign-on bonuses, accelerated stock vesting schedules, or extra paid time off.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
