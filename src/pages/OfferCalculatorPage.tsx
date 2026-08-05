import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../components/layout/AppShell';
import { useToast } from '../components/ui/ToastContext';

interface OfferPackage {
  id: string;
  company: string;
  role: string;
  baseSalary: number;
  bonusPercent: number;
  stockGrant4Yr: number;
  signOnBonus: number;
  location: string;
}

const INITIAL_OFFERS: OfferPackage[] = [
  {
    id: '1',
    company: 'Stripe',
    role: 'Senior Staff Engineer',
    baseSalary: 195000,
    bonusPercent: 15,
    stockGrant4Yr: 320000,
    signOnBonus: 25000,
    location: 'San Francisco, CA',
  },
  {
    id: '2',
    company: 'Google',
    role: 'L5 Software Engineer',
    baseSalary: 185000,
    bonusPercent: 15,
    stockGrant4Yr: 360000,
    signOnBonus: 30000,
    location: 'Remote',
  },
];

export const OfferCalculatorPage: React.FC = () => {
  const { addToast } = useToast();

  const [offers, setOffers] = useState<OfferPackage[]>(INITIAL_OFFERS);
  const [offerModal, setOfferModal] = useState<{ open: boolean; editOffer?: OfferPackage }>({ open: false });

  // Form states
  const [companyInput, setCompanyInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [baseInput, setBaseInput] = useState(180000);
  const [bonusInput, setBonusInput] = useState(15);
  const [stockInput, setStockInput] = useState(200000);
  const [signOnInput, setSignOnInput] = useState(20000);
  const [generatedScript, setGeneratedScript] = useState('');

  const calcAnnualComp = (off: OfferPackage) => {
    const annualBonus = (off.baseSalary * off.bonusPercent) / 100;
    const annualStock = off.stockGrant4Yr / 4;
    const year1SignOn = off.signOnBonus;
    const year1TC = off.baseSalary + annualBonus + annualStock + year1SignOn;
    return { year1TC, annualStock, annualBonus };
  };

  const openAddModal = () => {
    setCompanyInput('');
    setRoleInput('Software Engineer');
    setBaseInput(180000);
    setBonusInput(15);
    setStockInput(200000);
    setSignOnInput(20000);
    setOfferModal({ open: true });
  };

  const openEditModal = (off: OfferPackage) => {
    setCompanyInput(off.company);
    setRoleInput(off.role);
    setBaseInput(off.baseSalary);
    setBonusInput(off.bonusPercent);
    setStockInput(off.stockGrant4Yr);
    setSignOnInput(off.signOnBonus);
    setOfferModal({ open: true, editOffer: off });
  };

  const handleDeleteOffer = (id: string, company: string) => {
    if (!window.confirm(`Delete offer package for ${company}?`)) return;
    setOffers((prev) => prev.filter((o) => o.id !== id));
    addToast('Offer Package Deleted 🗑️', company, 'info');
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyInput.trim()) return;

    if (offerModal.editOffer) {
      setOffers((prev) =>
        prev.map((o) =>
          o.id === offerModal.editOffer?.id
            ? {
                ...o,
                company: companyInput.trim(),
                role: roleInput.trim() || 'Software Engineer',
                baseSalary: baseInput,
                bonusPercent: bonusInput,
                stockGrant4Yr: stockInput,
                signOnBonus: signOnInput,
              }
            : o
        )
      );
      addToast('Offer Package Updated ✏️', companyInput, 'success');
    } else {
      const newOff: OfferPackage = {
        id: Math.random().toString(36).substring(2, 9),
        company: companyInput.trim(),
        role: roleInput.trim() || 'Software Engineer',
        baseSalary: baseInput,
        bonusPercent: bonusInput,
        stockGrant4Yr: stockInput,
        signOnBonus: signOnInput,
        location: 'Hybrid',
      };
      setOffers((prev) => [...prev, newOff]);
      addToast('Offer Package Added 💰', companyInput, 'success');
    }

    setOfferModal({ open: false });
  };

  const handleGenerateScript = () => {
    if (offers.length < 2) {
      addToast('Draft Script', 'Add at least 2 offer packages to compare', 'info');
      return;
    }

    const offerA = offers[0];
    const offerB = offers[1];
    const bComp = calcAnnualComp(offerB);

    const script = `Hi [Recruiter Name],

Thank you so much for extending the offer for the ${offerA.role} position at ${offerA.company}. I am genuinely excited about the team's roadmap and the opportunity to make an impact.

As I evaluate my final decision, I am currently considering another competing offer from ${offerB.company} with a Year 1 Total Compensation of $${bComp.year1TC.toLocaleString()}. 

${offerA.company} remains my top choice due to the team culture and product vision. If we could adjust the base salary to $${(offerA.baseSalary * 1.1).toLocaleString()} or increase the initial equity grant, I would be prepared to sign immediately.

Thank you again for your support throughout this process!

Best regards,
Candidate`;

    setGeneratedScript(script);
    addToast('Negotiation Script Drafted 💰', 'Tailored counter-offer script ready', 'success');
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">💰 Salary & Total Comp (TC) Offer Calculator</h1>
            <p className="page-sub">
              Create, edit, delete, and compare multi-year total compensation packages
            </p>
          </div>

          <button onClick={openAddModal} className="btn btn-primary" style={{ borderRadius: 12, fontSize: 13 }}>
            + Add Offer Package
          </button>
        </div>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Side-by-Side Offer Comparison Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {offers.map((off, idx) => {
            const comp = calcAnnualComp(off);
            const borderColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];
            const borderColor = borderColors[idx % borderColors.length];

            return (
              <motion.div
                key={off.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ padding: 22, borderTop: `4px solid ${borderColor}`, position: 'relative' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>{off.company}</h3>
                    <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 2 }}>{off.role}</div>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => openEditModal(off)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, padding: '4px 6px' }}
                      title="Edit Offer"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteOffer(off.id, off.company)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, padding: '4px 6px' }}
                      title="Delete Offer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--t2)' }}>Base Salary:</span>
                    <span style={{ fontWeight: 700, color: 'var(--t1)' }}>${off.baseSalary.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--t2)' }}>Annual Bonus:</span>
                    <span style={{ fontWeight: 700, color: 'var(--t1)' }}>
                      {off.bonusPercent}% (${comp.annualBonus.toLocaleString()})
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--t2)' }}>Equity (Annual):</span>
                    <span style={{ fontWeight: 700, color: 'var(--t1)' }}>${comp.annualStock.toLocaleString()}/yr</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--t2)' }}>Sign-On Bonus:</span>
                    <span style={{ fontWeight: 700, color: 'var(--t1)' }}>${off.signOnBonus.toLocaleString()}</span>
                  </div>
                </div>

                {/* Calculated TC Summary */}
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase' }}>
                    Year 1 Total Compensation:
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: borderColor, marginTop: 2 }}>
                    ${comp.year1TC.toLocaleString()} / yr
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Negotiation Script Generator Card */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>
              🤝 Counter-Offer Negotiation Script Generator
            </h3>
            <button onClick={handleGenerateScript} className="btn btn-primary" style={{ borderRadius: 12 }}>
              ✨ Draft Counter-Offer Email
            </button>
          </div>

          {generatedScript && (
            <textarea
              className="inp"
              rows={10}
              value={generatedScript}
              onChange={(e) => setGeneratedScript(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 }}
            />
          )}
        </div>
      </div>

      {/* Add / Edit Offer Modal */}
      <AnimatePresence>
        {offerModal.open && (
          <div className="modal-backdrop" onClick={() => setOfferModal({ open: false })}>
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 500, padding: 24 }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 16 }}>
                {offerModal.editOffer ? '✏️ Edit Offer Package' : '💰 Add Offer Package'}
              </h2>

              <form onSubmit={handleSaveOffer} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="lbl">Company Name *</label>
                  <input
                    className="inp"
                    placeholder="e.g. Apple, Netflix"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="lbl">Role Title</label>
                  <input
                    className="inp"
                    placeholder="e.g. Senior Software Engineer"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="lbl">Base Salary ($)</label>
                    <input
                      type="number"
                      className="inp"
                      value={baseInput}
                      onChange={(e) => setBaseInput(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="lbl">Bonus (%)</label>
                    <input
                      type="number"
                      className="inp"
                      value={bonusInput}
                      onChange={(e) => setBonusInput(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="lbl">4-Year Stock Grant ($)</label>
                    <input
                      type="number"
                      className="inp"
                      value={stockInput}
                      onChange={(e) => setStockInput(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="lbl">Sign-On Bonus ($)</label>
                    <input
                      type="number"
                      className="inp"
                      value={signOnInput}
                      onChange={(e) => setSignOnInput(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" onClick={() => setOfferModal({ open: false })} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {offerModal.editOffer ? 'Save Changes' : 'Save Offer Package'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
};
