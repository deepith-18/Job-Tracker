import React, { useState, useMemo } from 'react';
import {
  Zap,
  Clock,
  Shield,
  Award,
  Sparkles,
} from 'lucide-react';
import type { Application } from '../../types';

interface PipelineVelocityPredictorProps {
  applications: Application[];
  weeklyGoal?: number;
}

export const PipelineVelocityPredictor: React.FC<PipelineVelocityPredictorProps> = ({
  applications,
}) => {
  const [targetOffersGoal, setTargetOffersGoal] = useState(2);
  const [simulatedWeeklyApps, setSimulatedWeeklyApps] = useState(10);

  const stats = useMemo(() => {
    const total = applications.length;
    const active = applications.filter((a) =>
      ['Applied', 'OA/Assessment', 'Interview'].includes(a.status)
    );
    const interviews = applications.filter((a) => a.status === 'Interview');
    const offers = applications.filter((a) => a.status === 'Offer');
    const oas = applications.filter((a) => a.status === 'OA/Assessment');

    // Callback rate: (interviews + offers) / total
    const callbackRate = total > 0 ? (interviews.length + offers.length) / total : 0.15;
    const finalConversionRate = total > 0 && interviews.length > 0
      ? (offers.length / Math.max(1, interviews.length))
      : 0.25;
    
    // Leverage score: 0 to 100
    let leverageScore = 20;
    if (offers.length >= 2) leverageScore = 95;
    else if (offers.length === 1 && interviews.length >= 2) leverageScore = 88;
    else if (offers.length === 1) leverageScore = 75;
    else if (interviews.length >= 3) leverageScore = 70;
    else if (interviews.length >= 1) leverageScore = 50;
    else if (oas.length >= 2) leverageScore = 38;

    // Velocity Grade
    let grade = 'B';
    let gradeColor = '#f59e0b';
    if (leverageScore >= 80) { grade = 'A+'; gradeColor = '#10b981'; }
    else if (leverageScore >= 65) { grade = 'A'; gradeColor = '#059669'; }
    else if (leverageScore >= 45) { grade = 'B'; gradeColor = '#3b82f6'; }
    else if (total > 0) { grade = 'C'; gradeColor = '#f59e0b'; }
    else { grade = 'N/A'; gradeColor = '#94a3b8'; }

    // Forecasted apps needed for target offers
    const appsPerOffer = Math.max(15, Math.round(1 / (Math.max(0.04, callbackRate * Math.max(0.2, finalConversionRate)))));
    const remainingOffersNeeded = Math.max(0, targetOffersGoal - offers.length);
    const estimatedAppsNeeded = remainingOffersNeeded * appsPerOffer;

    // Simulation calculation
    const simWeeklyVelocity = Math.max(1, simulatedWeeklyApps);
    const weeksToGoal = Math.ceil(estimatedAppsNeeded / simWeeklyVelocity);
    const daysToGoal = weeksToGoal * 7;

    return {
      total,
      activeCount: active.length,
      interviewCount: interviews.length,
      offerCount: offers.length,
      oaCount: oas.length,
      callbackRate: Math.round(callbackRate * 100),
      leverageScore,
      grade,
      gradeColor,
      appsPerOffer,
      remainingOffersNeeded,
      estimatedAppsNeeded,
      weeksToGoal,
      daysToGoal,
      expectedCallbacksSim: Math.round((simulatedWeeklyApps * callbackRate)),
    };
  }, [applications, targetOffersGoal, simulatedWeeklyApps]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* ── Top Executive KPI Ribbon ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: 16,
        }}
      >
        {/* Leverage Score */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            borderLeft: `4px solid ${stats.gradeColor}`,
            background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>
              Negotiation Leverage Score
            </span>
            <Shield style={{ width: 18, height: 18, color: stats.gradeColor }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--t1)', marginTop: 8, lineHeight: 1 }}>
            {stats.leverageScore}<span style={{ fontSize: 16, color: 'var(--t3)' }}>/100</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 8, fontWeight: 600 }}>
            {stats.leverageScore >= 80 ? '🔥 Strong Leverage (Multi-offer advantage)' : stats.leverageScore >= 50 ? '⚡ Moderate Leverage (Active loops in play)' : '🌱 Building Pipeline (Focus on outreach)'}
          </div>
        </div>

        {/* Pipeline Velocity Grade */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            borderLeft: '4px solid #6366f1',
            background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>
              Pipeline Health Grade
            </span>
            <Award style={{ width: 18, height: 18, color: '#6366f1' }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#6366f1', marginTop: 8, lineHeight: 1 }}>
            {stats.grade}
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 8, fontWeight: 600 }}>
            {stats.callbackRate}% Callback Conversion Rate
          </div>
        </div>

        {/* Projected Days to Next Offer */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            borderLeft: '4px solid #10b981',
            background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>
              Estimated Days to Offer
            </span>
            <Clock style={{ width: 18, height: 18, color: '#10b981' }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981', marginTop: 8, lineHeight: 1 }}>
            ~{stats.daysToGoal} <span style={{ fontSize: 16, fontWeight: 700 }}>days</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 8, fontWeight: 600 }}>
            At current velocity ({simulatedWeeklyApps} applications / week)
          </div>
        </div>
      </div>

      {/* ── Interactive What-If Pipeline Simulator ── */}
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
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              }}
            >
              <Zap style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                Interactive Pipeline Velocity Simulator
              </h2>
              <p style={{ fontSize: 12.5, color: 'var(--t3)', margin: 0, marginTop: 2 }}>
                Simulate your output to predict callbacks and accelerate your next offer arrival
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              background: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--accent)',
              fontSize: 12.5,
              fontWeight: 700,
              border: '1px solid rgba(99, 102, 241, 0.25)',
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
              <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--accent)' }}>
                {simulatedWeeklyApps} apps/wk
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="40"
              step="1"
              value={simulatedWeeklyApps}
              onChange={(e) => setSimulatedWeeklyApps(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>
              <span>2 (Steady pace)</span>
              <span>15 (Sprint)</span>
              <span>40 (Blitz)</span>
            </div>
          </div>

          {/* Slider 2: Target Offers Desired */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
                Offers Desired for Maximum Leverage:
              </label>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#10b981' }}>
                {targetOffersGoal} Offers
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
              <span>3 Offers (Ideal)</span>
              <span>5 Offers (Bidding war)</span>
            </div>
          </div>
        </div>

        {/* Projected Simulation Outcome Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: 14,
          }}
        >
          <div style={{ padding: '14px 16px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 600 }}>Estimated Total Apps Needed</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--t1)', marginTop: 4 }}>
              {stats.estimatedAppsNeeded}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--t2)', marginTop: 2 }}>
              Based on ~{stats.appsPerOffer} apps per final offer
            </div>
          </div>

          <div style={{ padding: '14px 16px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 600 }}>Expected Weekly Callbacks</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#6366f1', marginTop: 4 }}>
              ~{stats.expectedCallbacksSim} / wk
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--t2)', marginTop: 2 }}>
              Screenings & technical rounds
            </div>
          </div>

          <div style={{ padding: '14px 16px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 600 }}>Estimated Weeks to Destination</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981', marginTop: 4 }}>
              ~{stats.weeksToGoal} <span style={{ fontSize: 14 }}>weeks</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--t2)', marginTop: 2 }}>
              Target goal met around {new Date(Date.now() + stats.daysToGoal * 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Strategic Leverage Advisory Box ── */}
      <div
        className="card"
        style={{
          padding: 24,
          borderRadius: 16,
          border: '1px solid var(--border)',
          background: 'var(--card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Sparkles style={{ width: 18, height: 18, color: '#f59e0b' }} />
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
            Strategic Playbook: How to Maximize Offer Value
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 14 }}>
          <div style={{ background: 'var(--page)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>
              1. Synchronize Interview Stages
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.5 }}>
              Try scheduling on-site and final rounds across multiple companies in the same 10-day window so offer decisions land simultaneously.
            </div>
          </div>

          <div style={{ background: 'var(--page)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#10b981', marginBottom: 4 }}>
              2. Never Negotiate Against Yourself
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.5 }}>
              When a recruiter asks for your current compensation, state your market target rather than your historical earnings to protect your ceiling.
            </div>
          </div>

          <div style={{ background: 'var(--page)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#a855f7', marginBottom: 4 }}>
              3. Trade Variable for Base
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.5 }}>
              If a company hits a hard ceiling on base salary, request signing bonuses, increased RSUs, or an accelerated 6-month performance review.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
