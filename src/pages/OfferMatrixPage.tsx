import React, { useState, useMemo } from 'react';
import {
  Scale,
  Award,
  Building2,
  Plus,
  Trash2,
  Clipboard,
  Check,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../components/ui/ToastContext';

interface OfferProfile {
  id: string;
  company: string;
  role: string;
  baseSalary: number;
  bonusPct: number;
  annualEquity: number;
  signingBonus: number;
  ptoDays: number;
  match401kPct: number;
  remoteMode: 'Remote' | 'Hybrid' | 'On-site';
  wlbRating: number; // 1-10
  growthRating: number; // 1-10
}

const DEFAULT_OFFERS: OfferProfile[] = [
  {
    id: 'offer-1',
    company: 'Stripe',
    role: 'Senior Software Engineer',
    baseSalary: 185000,
    bonusPct: 15,
    annualEquity: 65000,
    signingBonus: 25000,
    ptoDays: 25,
    match401kPct: 4,
    remoteMode: 'Remote',
    wlbRating: 7,
    growthRating: 9,
  },
  {
    id: 'offer-2',
    company: 'Datadog',
    role: 'Staff Infrastructure Engineer',
    baseSalary: 195000,
    bonusPct: 10,
    annualEquity: 55000,
    signingBonus: 20000,
    ptoDays: 20,
    match401kPct: 6,
    remoteMode: 'Hybrid',
    wlbRating: 8,
    growthRating: 8,
  },
];

export const OfferMatrixPage: React.FC = () => {
  const { applications } = useApplications();
  const { addToast } = useToast();

  const [offers, setOffers] = useState<OfferProfile[]>(DEFAULT_OFFERS);
  const [copiedScript, setCopiedScript] = useState(false);

  // Decision Criteria Weights (must sum to 100)
  const [weightComp, setWeightComp] = useState<number>(40);
  const [weightGrowth, setWeightGrowth] = useState<number>(25);
  const [weightWlb, setWeightWlb] = useState<number>(20);
  const [weightRemote, setWeightRemote] = useState<number>(15);

  // Available applications that can be imported
  const importableApps = useMemo(() => {
    return applications.filter((a) =>
      ['Offer', 'Interview'].includes(a.status) &&
      !offers.some((o) => o.company.toLowerCase() === a.company.toLowerCase())
    );
  }, [applications, offers]);

  const handleImportApp = (appId: string) => {
    const target = applications.find((a) => a.id === appId);
    if (!target) return;

    let parsedSalary = 160000;
    if (target.salary) {
      const match = target.salary.match(/(\d+[\d,]*)/);
      if (match) {
        let num = parseInt(match[1].replace(/,/g, ''), 10);
        if (num < 1000) num *= 1000;
        if (num > 30000) parsedSalary = num;
      }
    }

    const newOffer: OfferProfile = {
      id: `offer-${Date.now()}`,
      company: target.company,
      role: target.role || 'Senior Software Engineer',
      baseSalary: parsedSalary,
      bonusPct: 10,
      annualEquity: Math.round(parsedSalary * 0.25),
      signingBonus: 10000,
      ptoDays: 20,
      match401kPct: 4,
      remoteMode: 'Remote',
      wlbRating: 7,
      growthRating: 8,
    };

    setOffers([...offers, newOffer]);
    addToast('Offer Imported', `Loaded ${target.company} into decision matrix`, 'success');
  };

  const handleAddCustomOffer = () => {
    if (offers.length >= 4) {
      addToast('Limit Reached', 'You can compare up to 4 concurrent offers side-by-side', 'warning');
      return;
    }

    const newOffer: OfferProfile = {
      id: `offer-${Date.now()}`,
      company: `Company ${String.fromCharCode(65 + offers.length)}`,
      role: 'Software Engineer',
      baseSalary: 150000,
      bonusPct: 10,
      annualEquity: 35000,
      signingBonus: 10000,
      ptoDays: 20,
      match401kPct: 4,
      remoteMode: 'Remote',
      wlbRating: 8,
      growthRating: 8,
    };
    setOffers([...offers, newOffer]);
  };

  const handleRemoveOffer = (id: string) => {
    if (offers.length <= 1) {
      addToast('Cannot Remove', 'Keep at least 1 offer in the evaluation matrix', 'info');
      return;
    }
    setOffers(offers.filter((o) => o.id !== id));
  };

  const handleUpdateOffer = (id: string, updates: Partial<OfferProfile>) => {
    setOffers(offers.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  // Evaluation Metrics & Score Calculation
  const evaluatedOffers = useMemo(() => {
    if (offers.length === 0) return [];

    // Find min and max for normalization
    const annualTCs = offers.map((o) => o.baseSalary * (1 + o.bonusPct / 100) + o.annualEquity);
    const maxTC = Math.max(...annualTCs, 1);
    const minTC = Math.min(...annualTCs, 0);

    return offers.map((offer) => {
      const annualBonus = Math.round(offer.baseSalary * (offer.bonusPct / 100));
      const annualTC = offer.baseSalary + annualBonus + offer.annualEquity;
      const firstYearTC = annualTC + offer.signingBonus;
      const fourYearValue = offer.baseSalary * 4 + annualBonus * 4 + offer.annualEquity * 4 + offer.signingBonus;

      // Remote score: Remote = 10, Hybrid = 7, On-site = 4
      const remoteScore = offer.remoteMode === 'Remote' ? 10 : offer.remoteMode === 'Hybrid' ? 7 : 4;

      // Normalized Comp Score (1-10)
      const compScore = maxTC === minTC ? 8 : 4 + ((annualTC - minTC) / (maxTC - minTC)) * 6;

      // Weighted Multi-Criteria Total Score (0-100)
      const totalScore = Math.round(
        (compScore * (weightComp / 100) +
          offer.growthRating * (weightGrowth / 100) +
          offer.wlbRating * (weightWlb / 100) +
          remoteScore * (weightRemote / 100)) *
          10
      );

      return {
        ...offer,
        annualBonus,
        annualTC,
        firstYearTC,
        fourYearValue,
        remoteScore,
        compScore,
        totalScore,
      };
    });
  }, [offers, weightComp, weightGrowth, weightWlb, weightRemote]);

  // Find winner
  const winningOffer = useMemo(() => {
    if (evaluatedOffers.length === 0) return null;
    return [...evaluatedOffers].sort((a, b) => b.totalScore - a.totalScore)[0];
  }, [evaluatedOffers]);

  const runnerUpOffer = useMemo(() => {
    if (evaluatedOffers.length < 2) return null;
    return [...evaluatedOffers].sort((a, b) => b.totalScore - a.totalScore)[1];
  }, [evaluatedOffers]);

  // Dynamic counter-offer letter for the winning offer vs runner-up
  const generatedCounterScript = useMemo(() => {
    if (!winningOffer) return '';
    const other = runnerUpOffer || winningOffer;

    return `Dear [Recruiter / Hiring Manager Name],

Thank you very much for extending the formal offer to join ${winningOffer.company} as ${winningOffer.role}. I thoroughly enjoyed connecting with the team and remain excited about your product roadmap.

Before formally committing, I would like to review the overall compensation structure. I am currently evaluating a parallel competitive opportunity that offers an annualized total package of $${(other.annualTC + 15000).toLocaleString()}. Because ${winningOffer.company} is my preferred choice culturally and technically, if we can adjust the base salary to $${(winningOffer.baseSalary + 15000).toLocaleString()} (or increase the first-year signing bonus to bridge the gap), I would be thrilled to sign immediately.

Thank you again for your championship and support throughout this process.

Best regards,
[Your Name]`;
  }, [winningOffer, runnerUpOffer]);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatedCounterScript);
    setCopiedScript(true);
    addToast('Counter-Offer Copied', 'Paste into your email correspondence', 'success');
    setTimeout(() => setCopiedScript(false), 2200);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Scale size={24} color="var(--accent)" />
              <span>Multi-Offer Comparative Decision Matrix</span>
            </h1>
            <p className="page-sub">
              Evaluate competing job offers using multi-criteria decision analysis (MCDA) across total compensation, equity, career velocity, and flexibility.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {importableApps.length > 0 && (
              <select
                className="inp"
                style={{ fontSize: 12, padding: '6px 12px', width: 'auto' }}
                onChange={(e) => {
                  if (e.target.value) handleImportApp(e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
              >
                <option value="" disabled>Import Tracked Job...</option>
                {importableApps.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.company} ({a.role})
                  </option>
                ))}
              </select>
            )}

            {offers.length < 4 && (
              <button
                onClick={handleAddCustomOffer}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px' }}
              >
                <Plus size={14} />
                <span>Add Offer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ── Top Decision Banner: Comparison Podium ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 250px), 1fr))`,
            gap: 16,
          }}
        >
          {evaluatedOffers.map((item) => {
            const isWinner = winningOffer && winningOffer.id === item.id;
            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: '22px 24px',
                  borderRadius: 18,
                  border: isWinner ? '2px solid #10b981' : '1px solid var(--border)',
                  background: isWinner
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, var(--card) 100%)'
                    : 'var(--card)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {isWinner && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#059669',
                      background: '#dcfce7',
                      padding: '3px 8px',
                      borderRadius: 12,
                    }}
                  >
                    <Award size={13} />
                    <span>Recommended Pick</span>
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Building2 size={16} color="var(--t3)" />
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--t1)', margin: 0 }}>
                      {item.company}
                    </h3>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>{item.role}</div>

                  <div style={{ marginTop: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: isWinner ? '#10b981' : 'var(--t1)' }}>
                      {item.totalScore}
                      <span style={{ fontSize: 16, color: 'var(--t3)', fontWeight: 600 }}>/100</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--t2)', fontWeight: 600 }}>
                      MCDA Weighted Decision Score
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--t3)' }}>Year 1 Total Comp:</span>
                    <strong style={{ color: 'var(--t1)' }}>${item.firstYearTC.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--t3)' }}>Ongoing Annual TC:</span>
                    <strong style={{ color: '#10b981' }}>${item.annualTC.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--t3)' }}>Flexibility:</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{item.remoteMode}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Criteria Weight Sliders Control Panel ── */}
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
            <Sliders size={18} color="var(--accent)" />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Customize Decision Priorities (Weighted Importance)
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: 18,
            }}
          >
            {/* Compensation */}
            <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>
                <span>Compensation & Equity</span>
                <span style={{ color: 'var(--accent)' }}>{weightComp}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={weightComp}
                onChange={(e) => setWeightComp(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>

            {/* Career Growth */}
            <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>
                <span>Career Growth & Brand</span>
                <span style={{ color: '#3b82f6' }}>{weightGrowth}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={weightGrowth}
                onChange={(e) => setWeightGrowth(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
              />
            </div>

            {/* Work Life Balance */}
            <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>
                <span>Work-Life Balance</span>
                <span style={{ color: '#10b981' }}>{weightWlb}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={weightWlb}
                onChange={(e) => setWeightWlb(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
              />
            </div>

            {/* Remote Flexibility */}
            <div style={{ background: 'var(--page)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>
                <span>Remote / Commute</span>
                <span style={{ color: '#8b5cf6' }}>{weightRemote}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={weightRemote}
                onChange={(e) => setWeightRemote(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* ── Comprehensive Offers Side-by-Side Comparison Editor ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 320px), 1fr))`,
            gap: 20,
          }}
        >
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              className="card"
              style={{
                padding: 24,
                borderRadius: 18,
                border: '1px solid var(--border)',
                background: 'var(--card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase' }}>
                  Offer Candidate #{index + 1}
                </span>
                {offers.length > 1 && (
                  <button
                    onClick={() => handleRemoveOffer(offer.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)', padding: '4px 8px' }}
                    title="Remove offer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="lbl">Company Name</label>
                  <input
                    className="inp"
                    value={offer.company}
                    onChange={(e) => handleUpdateOffer(offer.id, { company: e.target.value })}
                    style={{ fontWeight: 800 }}
                  />
                </div>

                <div>
                  <label className="lbl">Role Title</label>
                  <input
                    className="inp"
                    value={offer.role}
                    onChange={(e) => handleUpdateOffer(offer.id, { role: e.target.value })}
                  />
                </div>

                {/* Base Salary */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    <span className="lbl" style={{ margin: 0 }}>Base Salary</span>
                    <strong style={{ color: 'var(--accent)' }}>${offer.baseSalary.toLocaleString()}</strong>
                  </div>
                  <input
                    type="range"
                    min="80000"
                    max="350000"
                    step="5000"
                    value={offer.baseSalary}
                    onChange={(e) => handleUpdateOffer(offer.id, { baseSalary: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>

                {/* Annual Equity */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    <span className="lbl" style={{ margin: 0 }}>Annual Equity / RSUs</span>
                    <strong style={{ color: '#10b981' }}>${offer.annualEquity.toLocaleString()}</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={offer.annualEquity}
                    onChange={(e) => handleUpdateOffer(offer.id, { annualEquity: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: '#10b981' }}
                  />
                </div>

                {/* Signing Bonus */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    <span className="lbl" style={{ margin: 0 }}>Signing Bonus (Year 1)</span>
                    <strong style={{ color: '#8b5cf6' }}>${offer.signingBonus.toLocaleString()}</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="2500"
                    value={offer.signingBonus}
                    onChange={(e) => handleUpdateOffer(offer.id, { signingBonus: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: '#8b5cf6' }}
                  />
                </div>

                {/* Remote Mode */}
                <div>
                  <label className="lbl">Workplace Flexibility</label>
                  <select
                    className="inp"
                    value={offer.remoteMode}
                    onChange={(e) => handleUpdateOffer(offer.id, { remoteMode: e.target.value as any })}
                  >
                    <option value="Remote">Fully Remote</option>
                    <option value="Hybrid">Hybrid (1-3 Days Office)</option>
                    <option value="On-site">Full-time On-site</option>
                  </select>
                </div>

                {/* WLB Rating */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    <span className="lbl" style={{ margin: 0 }}>Work-Life Balance Score:</span>
                    <span>{offer.wlbRating} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={offer.wlbRating}
                    onChange={(e) => handleUpdateOffer(offer.id, { wlbRating: parseInt(e.target.value, 10) })}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Growth Rating */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    <span className="lbl" style={{ margin: 0 }}>Career Growth / Prestige:</span>
                    <span>{offer.growthRating} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={offer.growthRating}
                    onChange={(e) => handleUpdateOffer(offer.id, { growthRating: parseInt(e.target.value, 10) })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── 1-Click Diplomatic Counter-Offer Generator ── */}
        <div
          className="card"
          style={{
            padding: 24,
            borderRadius: 18,
            border: '1px solid var(--border)',
            background: 'var(--card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={18} color="var(--accent)" />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                High-Leverage Counter-Offer Proposal
              </h3>
            </div>

            <button
              onClick={handleCopyScript}
              className="btn btn-ghost btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '5px 12px' }}
            >
              {copiedScript ? <Check size={13} color="#10b981" /> : <Clipboard size={13} />}
              <span>{copiedScript ? 'Copied Letter' : 'Copy Counter-Offer'}</span>
            </button>
          </div>

          <p style={{ fontSize: 12.5, color: 'var(--t3)', margin: 0, marginBottom: 12 }}>
            Diplomatic negotiation template customized to leverage competing market offers to maximize your base salary at your top preference company.
          </p>

          <pre
            style={{
              margin: 0,
              fontSize: 12.5,
              color: 'var(--t2)',
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              lineHeight: 1.55,
              background: 'var(--page)',
              padding: 16,
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}
          >
            {generatedCounterScript}
          </pre>
        </div>
      </div>
    </AppShell>
  );
};
