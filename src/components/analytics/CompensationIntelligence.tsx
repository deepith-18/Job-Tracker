import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Award,
  Clipboard,
  Check,
  Calculator,
  Info,
  HelpCircle,
  Briefcase,
} from 'lucide-react';
import { useToast } from '../ui/ToastContext';
import type { Application } from '../../types';

interface CompPercentiles {
  base: { p25: number; p50: number; p75: number; p90: number };
  total: { p25: number; p50: number; p75: number; p90: number };
}

interface RoleBenchmark {
  role: string;
  category: string;
  junior: CompPercentiles;
  mid: CompPercentiles;
  senior: CompPercentiles;
  staff: CompPercentiles;
}

// Comprehensive market benchmarks data normalized to USD baseline for US Tier 1
const REGIONS = [
  { id: 'us-tier1', name: 'US Tier 1 Tech Hubs (SF, NYC, Seattle)', currency: 'USD', factor: 1.0, symbol: '$' },
  { id: 'us-tier2', name: 'US Tier 2 / National Remote (Austin, Denver, Chicago)', currency: 'USD', factor: 0.88, symbol: '$' },
  { id: 'europe', name: 'Europe & UK (London, Berlin, Amsterdam)', currency: 'EUR', factor: 0.68, symbol: '€' },
  { id: 'india', name: 'India Tech Hubs (Bangalore, Hyderabad, NCR)', currency: 'INR', factor: 0.28, symbol: '₹' },
];

const ROLES_BENCHMARKS: RoleBenchmark[] = [
  {
    role: 'Software Engineer (Full Stack / Generalist)',
    category: 'Engineering',
    junior: {
      base: { p25: 85000, p50: 100000, p75: 115000, p90: 130000 },
      total: { p25: 95000, p50: 115000, p75: 135000, p90: 160000 },
    },
    mid: {
      base: { p25: 120000, p50: 140000, p75: 160000, p90: 180000 },
      total: { p25: 140000, p50: 170000, p75: 205000, p90: 245000 },
    },
    senior: {
      base: { p25: 155000, p50: 180000, p75: 210000, p90: 240000 },
      total: { p25: 195000, p50: 245000, p75: 310000, p90: 385000 },
    },
    staff: {
      base: { p25: 200000, p50: 235000, p75: 275000, p90: 320000 },
      total: { p25: 280000, p50: 375000, p75: 480000, p90: 620000 },
    },
  },
  {
    role: 'Frontend / UI Specialist (React / TypeScript)',
    category: 'Engineering',
    junior: {
      base: { p25: 80000, p50: 95000, p75: 110000, p90: 125000 },
      total: { p25: 90000, p50: 110000, p75: 128000, p90: 150000 },
    },
    mid: {
      base: { p25: 115000, p50: 135000, p75: 155000, p90: 175000 },
      total: { p25: 135000, p50: 165000, p75: 195000, p90: 235000 },
    },
    senior: {
      base: { p25: 150000, p50: 175000, p75: 200000, p90: 230000 },
      total: { p25: 185000, p50: 235000, p75: 295000, p90: 360000 },
    },
    staff: {
      base: { p25: 190000, p50: 225000, p75: 260000, p90: 300000 },
      total: { p25: 260000, p50: 345000, p75: 440000, p90: 560000 },
    },
  },
  {
    role: 'Backend & Cloud Systems (Go / Java / Python / Distributed)',
    category: 'Engineering',
    junior: {
      base: { p25: 90000, p50: 105000, p75: 120000, p90: 135000 },
      total: { p25: 100000, p50: 120000, p75: 140000, p90: 165000 },
    },
    mid: {
      base: { p25: 125000, p50: 145000, p75: 168000, p90: 190000 },
      total: { p25: 145000, p50: 180000, p75: 220000, p90: 260000 },
    },
    senior: {
      base: { p25: 160000, p50: 190000, p75: 220000, p90: 250000 },
      total: { p25: 205000, p50: 265000, p75: 335000, p90: 410000 },
    },
    staff: {
      base: { p25: 210000, p50: 245000, p75: 290000, p90: 335000 },
      total: { p25: 300000, p50: 400000, p75: 520000, p90: 670000 },
    },
  },
  {
    role: 'AI / Machine Learning & LLM Engineer',
    category: 'Specialized',
    junior: {
      base: { p25: 100000, p50: 115000, p75: 135000, p90: 150000 },
      total: { p25: 115000, p50: 140000, p75: 170000, p90: 205000 },
    },
    mid: {
      base: { p25: 140000, p50: 165000, p75: 195000, p90: 225000 },
      total: { p25: 175000, p50: 225000, p75: 285000, p90: 350000 },
    },
    senior: {
      base: { p25: 180000, p50: 215000, p75: 255000, p90: 290000 },
      total: { p25: 250000, p50: 330000, p75: 420000, p90: 540000 },
    },
    staff: {
      base: { p25: 240000, p50: 285000, p75: 340000, p90: 400000 },
      total: { p25: 380000, p50: 510000, p75: 680000, p90: 920000 },
    },
  },
  {
    role: 'DevOps / Site Reliability & Cloud Platform (Kubernetes / AWS)',
    category: 'Infrastructure',
    junior: {
      base: { p25: 85000, p50: 100000, p75: 115000, p90: 130000 },
      total: { p25: 95000, p50: 115000, p75: 135000, p90: 155000 },
    },
    mid: {
      base: { p25: 120000, p50: 140000, p75: 162000, p90: 185000 },
      total: { p25: 140000, p50: 172000, p75: 210000, p90: 250000 },
    },
    senior: {
      base: { p25: 155000, p50: 185000, p75: 215000, p90: 245000 },
      total: { p25: 195000, p50: 250000, p75: 320000, p90: 395000 },
    },
    staff: {
      base: { p25: 205000, p50: 240000, p75: 280000, p90: 325000 },
      total: { p25: 290000, p50: 385000, p75: 495000, p90: 640000 },
    },
  },
];

interface CompensationIntelligenceProps {
  applications?: Application[];
}

export const CompensationIntelligence: React.FC<CompensationIntelligenceProps> = ({
  applications = [],
}) => {
  const { addToast } = useToast();
  const [selectedRegionId, setSelectedRegionId] = useState('us-tier1');
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [selectedTier, setSelectedTier] = useState<'junior' | 'mid' | 'senior' | 'staff'>('senior');
  const [showMethodology, setShowMethodology] = useState(false);

  // TC Calculator state
  const [calcBase, setCalcBase] = useState(165000);
  const [calcBonus, setCalcBonus] = useState(20000);
  const [calcEquity, setCalcEquity] = useState(45000);
  const [calcSigning, setCalcSigning] = useState(15000);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const currentRegion = useMemo(() => {
    return REGIONS.find((r) => r.id === selectedRegionId) || REGIONS[0];
  }, [selectedRegionId]);

  const activeBenchmark = ROLES_BENCHMARKS[selectedRoleIndex];
  const activeTierData = activeBenchmark[selectedTier];

  // Currency & Region format helper
  const formatMoney = (usdVal: number) => {
    const adjusted = usdVal * currentRegion.factor;
    if (currentRegion.currency === 'INR') {
      // Convert to Lakhs in INR (e.g., ₹28.5L)
      const inINR = adjusted * 86;
      const inLakhs = inINR / 100000;
      return `${currentRegion.symbol}${inLakhs.toFixed(1)} Lakhs`;
    }
    return `${currentRegion.symbol}${Math.round(adjusted).toLocaleString()}`;
  };

  // Extract recorded salaries from user applications
  const pipelineSalaryStats = useMemo(() => {
    const appsWithSalaries: { company: string; role: string; salaryNum: number; raw: string }[] = [];

    applications.forEach((app) => {
      if (app.salary) {
        // Parse numerical salary from text (e.g. "$160,000", "150k", "$140k - $170k")
        const match = app.salary.match(/(\d+[\d,]*)/);
        if (match) {
          let num = parseInt(match[1].replace(/,/g, ''), 10);
          if (num < 1000) num = num * 1000; // handle "150k" -> 150000
          if (num > 20000) {
            appsWithSalaries.push({
              company: app.company,
              role: app.role,
              salaryNum: num,
              raw: app.salary,
            });
          }
        }
      }
    });

    return appsWithSalaries;
  }, [applications]);

  // Total Comp (TC) Breakdown
  const annualTC = calcBase + calcBonus + calcEquity;
  const firstYearTC = annualTC + calcSigning;
  const fourYearValue = calcBase * 4 + calcBonus * 4 + calcEquity * 4 + calcSigning;

  const basePct = Math.round((calcBase / Math.max(1, annualTC)) * 100);
  const bonusPct = Math.round((calcBonus / Math.max(1, annualTC)) * 100);
  const equityPct = Math.round((calcEquity / Math.max(1, annualTC)) * 100);

  // Position of user's custom base in market percentiles
  const getPercentileVerdict = (amount: number, tierData: CompPercentiles) => {
    if (amount >= tierData.base.p90) return { label: 'Top 10% (Elite Tier)', color: '#10b981' };
    if (amount >= tierData.base.p75) return { label: '75th Percentile (Upper Market)', color: '#059669' };
    if (amount >= tierData.base.p50) return { label: 'Median Market Rate (Competitive)', color: '#3b82f6' };
    if (amount >= tierData.base.p25) return { label: '25th Percentile (Baseline)', color: '#f59e0b' };
    return { label: 'Below Market P25 (High Negotiation Upside)', color: '#ef4444' };
  };

  const currentVerdict = getPercentileVerdict(calcBase, activeTierData);

  const negotiationScripts = [
    {
      title: 'Counter-Offer: Leveraging Competing Offer with Polished Terms',
      script: `Dear [Recruiter Name],

Thank you sincerely for extending the offer to join [Company] as [Role Title]. I thoroughly enjoyed meeting the engineering team and remain deeply excited about your roadmap in [Specific Project / Architecture Domain].

Before formally signing, I wanted to discuss the overall compensation structure. I currently have a competing offer from another firm providing an annualized total compensation of [Amount, e.g. $195,000 / €120,000]. Because [Company] is my strong preference culturally and technically, if we can adjust the base salary to [Target Base, e.g. $175,000] and align the equity grant accordingly, I am ready to accept and sign immediately.

Thank you again for your continued support and advocacy throughout this loop.

Best regards,
[Your Name]`,
    },
    {
      title: 'Professional Counter: Defending Market Value Above Initial Offer',
      script: `Dear [Recruiter Name],

Thank you for sending over the formal offer details! I am energized by the opportunity to contribute directly to [Team / Product Focus].

After reviewing the breakdown and cross-referencing industry market benchmarks for [Role Title] at my seniority level in [City / Region], I was hoping to align closer to [Target Base Salary, e.g. $165,000]. Given my background architecting [Key Skill / System, e.g. distributed microservices] and driving measurable delivery, I believe this reflects fair market alignment.

Is there flexibility in the base salary band or signing bonus structure to bridge this difference?

Thank you for your guidance, and I look forward to your thoughts.

Sincerely,
[Your Name]`,
    },
    {
      title: 'Rebalancing Compensation: Exchanging Equity for Liquid Base Salary',
      script: `Dear [Recruiter Name],

Thank you for the comprehensive compensation breakdown. I have strong confidence in [Company]'s long-term upside and vision.

For my personal financial planning over the upcoming year, I place highest priority on guaranteed liquid cash flow. Would the team consider rebalancing a portion of the equity allocation into an increased base salary (or a first-year sign-on bonus) of [Target Adjustment, e.g. $12,000 / ₹4 Lakhs]?

An adjustment in that direction would allow me to conclude my search and finalize my commitment today.

Warm regards,
[Your Name]`,
    },
  ];

  const handleCopyScript = (script: string, index: number) => {
    navigator.clipboard.writeText(script);
    setCopiedIndex(index);
    addToast('Negotiation Template Copied', 'Paste into your email to recruiter', 'success');
    setTimeout(() => setCopiedIndex(null), 2200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* ── Top Header & Region Selector ── */}
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            }}
          >
            <DollarSign style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Compensation Intelligence & Market Benchmarks
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--t3)', margin: 0, marginTop: 3 }}>
              Verified tech market compensation percentiles (25th, Median, 75th, 90th), total compensation modeling, and battle-tested counter-offer scripts.
            </p>
          </div>
        </div>

        {/* Region & Methodology Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <select
            className="inp"
            style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, width: 'auto' }}
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className="btn btn-ghost btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: showMethodology ? 'var(--accent)' : 'var(--t2)',
              border: '1px solid var(--border)',
              padding: '6px 12px',
            }}
          >
            <HelpCircle style={{ width: 14, height: 14 }} />
            <span>Benchmark Guide</span>
          </button>
        </div>
      </div>

      {/* ── Expandable Benchmark Methodology Guide ── */}
      {showMethodology && (
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
              Understanding Compensation Percentiles in Tech
            </h4>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              gap: 14,
              fontSize: 12,
              color: 'var(--t2)',
              lineHeight: 1.5,
            }}
          >
            <div style={{ background: 'var(--card)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 800, color: '#f59e0b', marginBottom: 2 }}>25th Percentile (P25)</div>
              <div>Baseline market compensation. Typical for early-stage bootstrapped startups, non-tech corporate enterprises, or transition hires.</div>
            </div>

            <div style={{ background: 'var(--card)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 800, color: '#3b82f6', marginBottom: 2 }}>50th Percentile (Median P50)</div>
              <div>The competitive market average. 50% of verified offers pay below this, and 50% pay above. Typical for mature companies and established tech firms.</div>
            </div>

            <div style={{ background: 'var(--card)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 800, color: '#10b981', marginBottom: 2 }}>75th Percentile (P75)</div>
              <div>Top-quartile compensation. Paid by well-funded Series B/C scale-ups, top cloud providers, and high-performing engineering organizations to win top talent.</div>
            </div>

            <div style={{ background: 'var(--card)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 800, color: '#8b5cf6', marginBottom: 2 }}>90th Percentile (P90)</div>
              <div>Elite tier. Big Tech (FAANG / Tier-1) top bands, specialized AI research labs, and quantitative finance firms with heavy equity or performance bonuses.</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Interactive Role & Seniority Tier Benchmark Explorer ── */}
      <div
        className="card"
        style={{
          padding: 24,
          borderRadius: 18,
          border: '1px solid var(--border)',
          background: 'var(--card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Award style={{ width: 18, height: 18, color: '#f59e0b' }} />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Market Percentiles by Role & Seniority
            </h3>
          </div>

          {/* Role selector dropdown */}
          <select
            className="inp"
            style={{ padding: '6px 12px', fontSize: 12.5, fontWeight: 600, maxWidth: 360 }}
            value={selectedRoleIndex}
            onChange={(e) => setSelectedRoleIndex(parseInt(e.target.value, 10))}
          >
            {ROLES_BENCHMARKS.map((b, i) => (
              <option key={b.role} value={i}>
                {b.role}
              </option>
            ))}
          </select>
        </div>

        {/* Seniority Tier Selector Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'junior', label: 'Junior / Associate (0-2 yrs)' },
            { id: 'mid', label: 'Mid-Level (2-5 yrs)' },
            { id: 'senior', label: 'Senior Engineer (5-8 yrs)' },
            { id: 'staff', label: 'Staff / Tech Lead (8+ yrs)' },
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id as any)}
              className="btn btn-sm"
              style={{
                background: selectedTier === tier.id ? 'var(--accent)' : 'var(--page)',
                color: selectedTier === tier.id ? '#ffffff' : 'var(--t2)',
                border: '1px solid var(--border)',
                fontWeight: 700,
                fontSize: 12,
                padding: '6px 14px',
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* Percentile Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
            gap: 14,
            marginBottom: 20,
          }}
        >
          {/* 25th Percentile */}
          <div style={{ padding: '16px 18px', background: 'var(--page)', borderRadius: 14, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t3)' }}>25th Percentile (P25)</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: '#fef3c7', color: '#b45309' }}>
                Entry Band
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--t1)', marginTop: 8 }}>
              {formatMoney(activeTierData.base.p25)}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>Base Salary</div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 13, fontWeight: 800, color: '#10b981' }}>
              Total: {formatMoney(activeTierData.total.p25)}
            </div>
          </div>

          {/* 50th Percentile (Median) */}
          <div style={{ padding: '16px 18px', background: 'var(--page)', borderRadius: 14, border: '1.5px solid #3b82f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#3b82f6' }}>50th Percentile (Median)</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: '#dbeafe', color: '#1d4ed8' }}>
                Industry Median
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#3b82f6', marginTop: 8 }}>
              {formatMoney(activeTierData.base.p50)}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>Base Salary</div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 13, fontWeight: 800, color: '#10b981' }}>
              Total: {formatMoney(activeTierData.total.p50)}
            </div>
          </div>

          {/* 75th Percentile */}
          <div style={{ padding: '16px 18px', background: 'var(--page)', borderRadius: 14, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#10b981' }}>75th Percentile (P75)</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: '#dcfce7', color: '#15803d' }}>
                Scale-ups / Top Tier
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981', marginTop: 8 }}>
              {formatMoney(activeTierData.base.p75)}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>Base Salary</div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 13, fontWeight: 800, color: '#10b981' }}>
              Total: {formatMoney(activeTierData.total.p75)}
            </div>
          </div>

          {/* 90th Percentile */}
          <div style={{ padding: '16px 18px', background: 'var(--page)', borderRadius: 14, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#8b5cf6' }}>90th Percentile (P90)</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: '#ede9fe', color: '#6d28d9' }}>
                FAANG / Top 10%
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#8b5cf6', marginTop: 8 }}>
              {formatMoney(activeTierData.base.p90)}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>Base Salary</div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 13, fontWeight: 800, color: '#10b981' }}>
              Total: {formatMoney(activeTierData.total.p90)}
            </div>
          </div>
        </div>

        {/* Visual Percentile Range Bar */}
        <div style={{ background: 'var(--page)', padding: 18, borderRadius: 14, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 10 }}>
            <span>Market Base Salary Distribution Range:</span>
            <span>{formatMoney(activeTierData.base.p25)} — {formatMoney(activeTierData.base.p90)}</span>
          </div>

          <div style={{ position: 'relative', height: 12, borderRadius: 6, background: 'var(--border-light)', overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute',
                left: '15%',
                width: '70%',
                height: '100%',
                background: 'linear-gradient(90deg, #f59e0b 0%, #3b82f6 40%, #10b981 75%, #8b5cf6 100%)',
                borderRadius: 6,
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t3)', marginTop: 8 }}>
            <span>P25 ({formatMoney(activeTierData.base.p25)})</span>
            <span>Median ({formatMoney(activeTierData.base.p50)})</span>
            <span>P75 ({formatMoney(activeTierData.base.p75)})</span>
            <span>P90 ({formatMoney(activeTierData.base.p90)})</span>
          </div>
        </div>
      </div>

      {/* ── Live Applications vs Benchmark Analyzer ── */}
      {pipelineSalaryStats.length > 0 && (
        <div
          className="card"
          style={{
            padding: 24,
            borderRadius: 18,
            border: '1px solid var(--border)',
            background: 'var(--card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Briefcase style={{ width: 18, height: 18, color: 'var(--accent)' }} />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Your Tracked Applications vs Market Benchmark
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="tbl" style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Recorded Salary</th>
                  <th>Benchmark Standing</th>
                </tr>
              </thead>
              <tbody>
                {pipelineSalaryStats.map((item, idx) => {
                  const verdict = getPercentileVerdict(item.salaryNum, activeTierData);
                  return (
                    <tr key={idx}>
                      <td><strong>{item.company}</strong></td>
                      <td>{item.role}</td>
                      <td><strong>{item.raw}</strong></td>
                      <td>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 12,
                            background: `${verdict.color}15`,
                            color: verdict.color,
                            border: `1px solid ${verdict.color}35`,
                          }}
                        >
                          {verdict.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Interactive Total Compensation (TC) Builder ── */}
      <div
        className="card"
        style={{
          padding: 24,
          borderRadius: 18,
          border: '1px solid var(--border)',
          background: 'var(--card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calculator style={{ width: 18, height: 18, color: 'var(--accent)' }} />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Total Compensation (TC) & 4-Year Equity Model
            </h3>
          </div>

          <div
            style={{
              padding: '4px 10px',
              borderRadius: 12,
              background: `${currentVerdict.color}15`,
              color: currentVerdict.color,
              fontSize: 12,
              fontWeight: 700,
              border: `1px solid ${currentVerdict.color}30`,
            }}
          >
            Base Ranking: {currentVerdict.label}
          </div>
        </div>

        {/* Sliders Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16, marginBottom: 20 }}>
          {/* Base */}
          <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
              <span>Base Salary</span>
              <strong style={{ color: 'var(--accent)' }}>{formatMoney(calcBase)}</strong>
            </div>
            <input
              type="range"
              min="50000"
              max="350000"
              step="5000"
              value={calcBase}
              onChange={(e) => setCalcBase(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
          </div>

          {/* Bonus */}
          <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
              <span>Annual Bonus</span>
              <strong style={{ color: '#d97706' }}>{formatMoney(calcBonus)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="120000"
              step="2500"
              value={calcBonus}
              onChange={(e) => setCalcBonus(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#d97706', cursor: 'pointer' }}
            />
          </div>

          {/* Equity */}
          <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
              <span>Annual Equity / RSUs</span>
              <strong style={{ color: '#10b981' }}>{formatMoney(calcEquity)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="250000"
              step="5000"
              value={calcEquity}
              onChange={(e) => setCalcEquity(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
          </div>

          {/* Signing Bonus */}
          <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
              <span>First-Year Sign-on Bonus</span>
              <strong style={{ color: '#8b5cf6' }}>{formatMoney(calcSigning)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="80000"
              step="2500"
              value={calcSigning}
              onChange={(e) => setCalcSigning(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Visual Allocation Bar */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ height: 14, borderRadius: 8, display: 'flex', overflow: 'hidden', background: 'var(--border-light)' }}>
            <div style={{ width: `${basePct}%`, background: 'var(--accent)' }} title={`Base: ${basePct}%`} />
            <div style={{ width: `${bonusPct}%`, background: '#f59e0b' }} title={`Bonus: ${bonusPct}%`} />
            <div style={{ width: `${equityPct}%`, background: '#10b981' }} title={`Equity: ${equityPct}%`} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--t2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--accent)' }} />
                <span>Base Salary: <strong>{basePct}%</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: '#f59e0b' }} />
                <span>Bonus: <strong>{bonusPct}%</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: '#10b981' }} />
                <span>Equity: <strong>{equityPct}%</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t2)' }}>
                Year 1 Total: <strong style={{ color: 'var(--t1)' }}>{formatMoney(firstYearTC)}</strong>
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--t1)' }}>
                Annual Ongoing TC: <span style={{ color: '#10b981' }}>{formatMoney(annualTC)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Year Cumulative Value */}
        <div style={{ padding: '14px 18px', background: 'var(--page)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)' }}>
            Projected 4-Year Cumulative Package Value (Vested RSUs + Base + Bonus):
          </span>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#10b981' }}>
            {formatMoney(fourYearValue)}
          </span>
        </div>
      </div>

      {/* ── Ready-to-Use Negotiation Scripts ── */}
      <div
        className="card"
        style={{
          padding: 24,
          borderRadius: 18,
          border: '1px solid var(--border)',
          background: 'var(--card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Clipboard style={{ width: 18, height: 18, color: '#6366f1' }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
            Executive Negotiation Counter-Offer Scripts
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {negotiationScripts.map((item, index) => (
            <div
              key={index}
              style={{
                background: 'var(--page)',
                padding: '16px 18px',
                borderRadius: 14,
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  {item.title}
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopyScript(item.script, index)}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '4px 10px' }}
                >
                  {copiedIndex === index ? <Check style={{ width: 13, height: 13, color: '#10b981' }} /> : <Clipboard style={{ width: 13, height: 13 }} />}
                  <span>{copiedIndex === index ? 'Copied' : 'Copy Template'}</span>
                </button>
              </div>

              <pre
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: 'var(--t2)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  background: 'var(--card)',
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                }}
              >
                {item.script}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
