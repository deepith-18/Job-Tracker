import { BarChart, Flame } from 'lucide-react';
import React from 'react';
import { AppShell } from '../components/layout/AppShell';

interface TechSkill {
  name: string;
  category: 'Frontend' | 'Backend' | 'Cloud & DevOps' | 'AI & ML';
  demandScore: number; // 0-100
  salaryPremium: string;
  growthRate: string;
}

const SKILLS: TechSkill[] = [
  { name: 'TypeScript & React', category: 'Frontend', demandScore: 96, salaryPremium: '+$18,000', growthRate: '+24% YoY' },
  { name: 'Next.js & SSR Architecture', category: 'Frontend', demandScore: 92, salaryPremium: '+$15,000', growthRate: '+31% YoY' },
  { name: 'Go (Golang) Microservices', category: 'Backend', demandScore: 94, salaryPremium: '+$25,000', growthRate: '+28% YoY' },
  { name: 'Python & FastAPI', category: 'Backend', demandScore: 90, salaryPremium: '+$16,000', growthRate: '+22% YoY' },
  { name: 'Kubernetes & Docker', category: 'Cloud & DevOps', demandScore: 95, salaryPremium: '+$22,000', growthRate: '+19% YoY' },
  { name: 'AWS & Terraform (IaC)', category: 'Cloud & DevOps', demandScore: 93, salaryPremium: '+$20,000', growthRate: '+18% YoY' },
  { name: 'LLM Fine-Tuning & RAG Architecture', category: 'AI & ML', demandScore: 98, salaryPremium: '+$35,000', growthRate: '+140% YoY' },
];

export const TechTrendsPage: React.FC = () => {
  return (
    <AppShell>
      {/* Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title"><BarChart className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Job Market Demand Radar & Tech Stack Trends</h1>
        <p className="page-sub">
          Track hiring demand, salary premiums, and emerging technical skills across top engineering teams
        </p>
      </div>

      <div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Market Summary Banner */}
        <div className="card" style={{ padding: 22, background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                <Flame className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /> Highest Growth Domain
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>
                AI Infrastructure, RAG & Vector Databases (+140% YoY Demand)
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Avg Senior Engineering TC</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>$245,000 / yr</div>
            </div>
          </div>
        </div>

        {/* Tech Stack Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {SKILLS.map((skill) => (
            <div key={skill.name} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: 'var(--accent)',
                    background: 'var(--accent-bg)',
                    padding: '3px 8px',
                    borderRadius: 6,
                  }}
                >
                  {skill.category}
                </span>

                <span style={{ fontSize: 12, fontWeight: 800, color: '#10b981' }}>
                  {skill.growthRate}
                </span>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: '0 0 10px' }}>
                {skill.name}
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--t2)', marginBottom: 12 }}>
                <span>Salary Premium:</span>
                <strong style={{ color: 'var(--t1)' }}>{skill.salaryPremium}</strong>
              </div>

              {/* Demand Progress Bar */}
              <div style={{ width: '100%', height: 6, borderRadius: 6, background: '#e2e8f0', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${skill.demandScore}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #10b981)',
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};
