import React, { useState } from 'react';
import {
  DollarSign,
  Award,
  Clipboard,
  Check,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { useToast } from '../ui/ToastContext';

interface CompTier {
  role: string;
  junior: { base: number; total: number };
  mid: { base: number; total: number };
  senior: { base: number; total: number };
  staff: { base: number; total: number };
}

const MARKET_BENCHMARKS: CompTier[] = [
  {
    role: 'Software Engineer (General / Full Stack)',
    junior: { base: 95000, total: 115000 },
    mid: { base: 135000, total: 165000 },
    senior: { base: 175000, total: 235000 },
    staff: { base: 230000, total: 340000 },
  },
  {
    role: 'Frontend / React Specialist',
    junior: { base: 90000, total: 105000 },
    mid: { base: 130000, total: 155000 },
    senior: { base: 170000, total: 220000 },
    staff: { base: 215000, total: 310000 },
  },
  {
    role: 'Backend & Cloud / Distributed Systems',
    junior: { base: 100000, total: 120000 },
    mid: { base: 140000, total: 175000 },
    senior: { base: 185000, total: 250000 },
    staff: { base: 240000, total: 360000 },
  },
  {
    role: 'AI / Machine Learning Engineer',
    junior: { base: 110000, total: 140000 },
    mid: { base: 160000, total: 210000 },
    senior: { base: 210000, total: 310000 },
    staff: { base: 280000, total: 450000 },
  },
];

export const CompensationIntelligence: React.FC = () => {
  const { addToast } = useToast();
  const [currency, setCurrency] = useState<'USD' | 'INR' | 'EUR' | 'GBP'>('USD');
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [customBase, setCustomBase] = useState(140000);
  const [customBonus, setCustomBonus] = useState(15000);
  const [customEquity, setCustomEquity] = useState(35000);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const rates: Record<'USD' | 'INR' | 'EUR' | 'GBP', { symbol: string; multiplier: number }> = {
    USD: { symbol: '$', multiplier: 1 },
    INR: { symbol: '₹', multiplier: 86 },
    EUR: { symbol: '€', multiplier: 0.92 },
    GBP: { symbol: '£', multiplier: 0.78 },
  };

  const currentRate = rates[currency];

  const formatMoney = (amountUSD: number) => {
    const val = amountUSD * currentRate.multiplier;
    if (currency === 'INR') {
      const inLakhs = val / 100000;
      return `${currentRate.symbol}${inLakhs.toFixed(1)}L`;
    }
    return `${currentRate.symbol}${Math.round(val).toLocaleString()}`;
  };

  const totalTC = customBase + customBonus + customEquity;
  const basePct = Math.round((customBase / Math.max(1, totalTC)) * 100);
  const bonusPct = Math.round((customBonus / Math.max(1, totalTC)) * 100);
  const equityPct = Math.round((customEquity / Math.max(1, totalTC)) * 100);

  const negotiationScripts = [
    {
      title: 'Leveraging Competing Offers without Burning Bridges',
      script: `Hi [Recruiter Name],

Thank you again for the offer to join [Company] as [Role]. I really enjoyed connecting with the team and remain excited about what we can accomplish together.

Before making my final decision, I wanted to share that I have received another offer at [Other Company / Top Tier Firm] that includes a total package of [Target Amount, e.g. $185,000 / ₹35L]. Because [Company] is my top preference culturally and technically, if you are able to bring the base salary to [Target Base] and adjust the equity grant, I would be delighted to sign immediately.

Thank you for your advocacy and support!`,
    },
    {
      title: 'Countering an Initial Lowball Offer Professionally',
      script: `Hi [Recruiter Name],

Thank you for extending this offer! I am genuinely thrilled about the opportunity to contribute to [Specific Project or Team].

Based on my recent engineering experience in [Key Skill 1] and [Key Skill 2], along with market rates for this seniority level in our market, my target for base salary is [Desired Base]. Is there flexibility in the budget or sign-on bonus to bridge this gap?

I am eager to find a structure that works for both sides so we can finalize this.`,
    },
    {
      title: 'Trading Stock / Equity for Higher Liquid Base Salary',
      script: `Hi [Recruiter Name],

I appreciate the thorough breakdown of the compensation structure!

While I believe strongly in [Company]'s long-term trajectory, my immediate financial priorities favor liquid cash flow. Is it possible to rebalance a portion of the equity grant into base salary or a first-year signing bonus?

Even an adjustment of [Amount, e.g. $10,000 / ₹3L] toward base would make this an instant yes for me.`,
    },
  ];

  const handleCopyScript = (script: string, index: number) => {
    navigator.clipboard.writeText(script);
    setCopiedIndex(index);
    addToast('Negotiation Script Copied', 'Paste into your email to recruiter', 'success');
    setTimeout(() => setCopiedIndex(null), 2200);
  };

  const activeBenchmark = MARKET_BENCHMARKS[selectedRoleIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* ── Top Header & Currency Switcher ── */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            <p style={{ fontSize: 12.5, color: 'var(--t3)', margin: 0, marginTop: 2 }}>
              Industry percentiles, Total Comp (TC) calculator, and verified counter-offer scripts
            </p>
          </div>
        </div>

        {/* Currency Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--page)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
          {(['USD', 'INR', 'EUR', 'GBP'] as const).map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              style={{
                border: 'none',
                background: currency === curr ? 'var(--card)' : 'transparent',
                color: currency === curr ? 'var(--accent)' : 'var(--t3)',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: currency === curr ? 'var(--shadow)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {curr} ({rates[curr].symbol})
            </button>
          ))}
        </div>
      </div>

      {/* ── Interactive TC Calculator ── */}
      <div
        className="card"
        style={{
          padding: 24,
          borderRadius: 18,
          border: '1px solid var(--border)',
          background: 'var(--card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <Calculator style={{ width: 18, height: 18, color: 'var(--accent)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
            Total Compensation (TC) Builder & Breakdown
          </h3>
        </div>

        {/* Input sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 18, marginBottom: 20 }}>
          <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
              <span>Base Salary</span>
              <strong style={{ color: 'var(--accent)' }}>{formatMoney(customBase)}</strong>
            </div>
            <input
              type="range"
              min="40000"
              max="350000"
              step="5000"
              value={customBase}
              onChange={(e) => setCustomBase(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
              <span>Annual Bonus</span>
              <strong style={{ color: '#d97706' }}>{formatMoney(customBonus)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="2500"
              value={customBonus}
              onChange={(e) => setCustomBonus(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#d97706', cursor: 'pointer' }}
            />
          </div>

          <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>
              <span>Equity / RSUs (Annual)</span>
              <strong style={{ color: '#10b981' }}>{formatMoney(customEquity)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="5000"
              value={customEquity}
              onChange={(e) => setCustomEquity(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Visual Bar Distribution */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ height: 14, borderRadius: 8, display: 'flex', overflow: 'hidden', background: 'var(--border-light)' }}>
            <div style={{ width: `${basePct}%`, background: 'var(--accent)', transition: 'width 0.2s ease' }} title={`Base: ${basePct}%`} />
            <div style={{ width: `${bonusPct}%`, background: '#f59e0b', transition: 'width 0.2s ease' }} title={`Bonus: ${bonusPct}%`} />
            <div style={{ width: `${equityPct}%`, background: '#10b981', transition: 'width 0.2s ease' }} title={`Equity: ${equityPct}%`} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--t2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--accent)' }} />
                <span>Base: <strong>{basePct}%</strong></span>
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

            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--t1)' }}>
              Total Annual TC: <span style={{ color: '#10b981' }}>{formatMoney(totalTC)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Seniority Tier Benchmarks Table ── */}
      <div
        className="card"
        style={{
          padding: 24,
          borderRadius: 18,
          border: '1px solid var(--border)',
          background: 'var(--card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Award style={{ width: 18, height: 18, color: '#f59e0b' }} />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Seniority Tier Compensation Bands
            </h3>
          </div>

          <select
            className="inp"
            style={{ padding: '6px 12px', fontSize: 12.5, fontWeight: 600 }}
            value={selectedRoleIndex}
            onChange={(e) => setSelectedRoleIndex(parseInt(e.target.value, 10))}
          >
            {MARKET_BENCHMARKS.map((b, i) => (
              <option key={b.role} value={i}>{b.role}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="tbl" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Seniority Tier</th>
                <th>Experience Level</th>
                <th>Typical Base Salary</th>
                <th>Typical Total Comp (TC)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong style={{ color: '#6366f1' }}>Junior / Associate</strong></td>
                <td>0 – 2 Years</td>
                <td>{formatMoney(activeBenchmark.junior.base)}</td>
                <td><strong style={{ color: '#10b981' }}>{formatMoney(activeBenchmark.junior.total)}</strong></td>
              </tr>
              <tr>
                <td><strong style={{ color: 'var(--accent)' }}>Mid-Level Engineer</strong></td>
                <td>2 – 5 Years</td>
                <td>{formatMoney(activeBenchmark.mid.base)}</td>
                <td><strong style={{ color: '#10b981' }}>{formatMoney(activeBenchmark.mid.total)}</strong></td>
              </tr>
              <tr>
                <td><strong style={{ color: '#d97706' }}>Senior Engineer (L5 / IC4)</strong></td>
                <td>5 – 8 Years</td>
                <td>{formatMoney(activeBenchmark.senior.base)}</td>
                <td><strong style={{ color: '#10b981' }}>{formatMoney(activeBenchmark.senior.total)}</strong></td>
              </tr>
              <tr>
                <td><strong style={{ color: '#a855f7' }}>Staff / Principal / Tech Lead</strong></td>
                <td>8+ Years</td>
                <td>{formatMoney(activeBenchmark.staff.base)}</td>
                <td><strong style={{ color: '#10b981' }}>{formatMoney(activeBenchmark.staff.total)}</strong></td>
              </tr>
            </tbody>
          </table>
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
          <Sparkles style={{ width: 18, height: 18, color: '#6366f1' }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
            Proven Salary Counter-Offer Email Scripts
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
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  {item.title}
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopyScript(item.script, index)}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '4px 10px' }}
                >
                  {copiedIndex === index ? <Check style={{ width: 13, height: 13, color: '#10b981' }} /> : <Clipboard style={{ width: 13, height: 13 }} />}
                  <span>{copiedIndex === index ? 'Copied!' : 'Copy Script'}</span>
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
