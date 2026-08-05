import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';

export const OfferMatrixPage: React.FC = () => {
  const [companyA, setCompanyA] = useState('Stripe');
  const [scoreA, setScoreA] = useState({ salary: 9, equity: 8, balance: 7, growth: 9 });

  const [companyB, setCompanyB] = useState('Google');
  const [scoreB, setScoreB] = useState({ salary: 8, equity: 9, balance: 9, growth: 8 });

  const totalA = Math.round(((scoreA.salary * 0.35 + scoreA.equity * 0.25 + scoreA.balance * 0.2 + scoreA.growth * 0.2) / 10) * 100);
  const totalB = Math.round(((scoreB.salary * 0.35 + scoreB.equity * 0.25 + scoreB.balance * 0.2 + scoreB.growth * 0.2) / 10) * 100);

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">⚖️ Weighted Job Offer Decision Matrix</h1>
        <p className="page-sub">
          Evaluate competing job offers using weighted criteria for compensation, equity, work-life balance, and growth
        </p>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Comparison Banner */}
        <div className="card" style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, textAlign: 'center' }}>
          <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, border: totalA >= totalB ? '2px solid #10b981' : '1px solid var(--border)' }}>
            <input
              className="inp"
              value={companyA}
              onChange={(e) => setCompanyA(e.target.value)}
              style={{ fontWeight: 800, textAlign: 'center', fontSize: 18, marginBottom: 8 }}
            />
            <div style={{ fontSize: 32, fontWeight: 800, color: totalA >= totalB ? '#10b981' : 'var(--t2)' }}>{totalA}% Score</div>
            {totalA >= totalB && <div style={{ fontSize: 11.5, fontWeight: 800, color: '#047857', marginTop: 4 }}>🏆 Recommended Offer</div>}
          </div>

          <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, border: totalB > totalA ? '2px solid #10b981' : '1px solid var(--border)' }}>
            <input
              className="inp"
              value={companyB}
              onChange={(e) => setCompanyB(e.target.value)}
              style={{ fontWeight: 800, textAlign: 'center', fontSize: 18, marginBottom: 8 }}
            />
            <div style={{ fontSize: 32, fontWeight: 800, color: totalB > totalA ? '#10b981' : 'var(--t2)' }}>{totalB}% Score</div>
            {totalB > totalA && <div style={{ fontSize: 11.5, fontWeight: 800, color: '#047857', marginTop: 4 }}>🏆 Recommended Offer</div>}
          </div>
        </div>

        {/* Rating Sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Company A Rating */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
              🏢 {companyA} Criteria Rating (1-10)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="lbl">Base Salary & Bonus (35% Weight): {scoreA.salary}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scoreA.salary}
                  onChange={(e) => setScoreA({ ...scoreA, salary: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="lbl">Equity & RSUs (25% Weight): {scoreA.equity}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scoreA.equity}
                  onChange={(e) => setScoreA({ ...scoreA, equity: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="lbl">Work-Life Balance (20% Weight): {scoreA.balance}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scoreA.balance}
                  onChange={(e) => setScoreA({ ...scoreA, balance: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="lbl">Career Growth (20% Weight): {scoreA.growth}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scoreA.growth}
                  onChange={(e) => setScoreA({ ...scoreA, growth: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Company B Rating */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
              🏢 {companyB} Criteria Rating (1-10)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="lbl">Base Salary & Bonus (35% Weight): {scoreB.salary}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scoreB.salary}
                  onChange={(e) => setScoreB({ ...scoreB, salary: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="lbl">Equity & RSUs (25% Weight): {scoreB.equity}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scoreB.equity}
                  onChange={(e) => setScoreB({ ...scoreB, equity: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="lbl">Work-Life Balance (20% Weight): {scoreB.balance}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scoreB.balance}
                  onChange={(e) => setScoreB({ ...scoreB, balance: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="lbl">Career Growth (20% Weight): {scoreB.growth}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scoreB.growth}
                  onChange={(e) => setScoreB({ ...scoreB, growth: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
