import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { JournalPage } from './pages/JournalPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';

// Legacy pages still accessible via direct URL
import { MissionControlPage } from './pages/MissionControlPage';
import { CompanyIntelPage } from './pages/CompanyIntelPage';
import { OfferCalculatorPage } from './pages/OfferCalculatorPage';
import { InterviewCalendarPage } from './pages/InterviewCalendarPage';
import { AtsOptimizerPage } from './pages/AtsOptimizerPage';
import { ReferralCrmPage } from './pages/ReferralCrmPage';
import { AutoApplyCopilotPage } from './pages/AutoApplyCopilotPage';
import { CareerRoadmapPage } from './pages/CareerRoadmapPage';
import { SalaryNegotiationPage } from './pages/SalaryNegotiationPage';
import { AlumniNetworkPage } from './pages/AlumniNetworkPage';
import { PortfolioGeneratorPage } from './pages/PortfolioGeneratorPage';
import { OfferMatrixPage } from './pages/OfferMatrixPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { DeploymentGuidePage } from './pages/DeploymentGuidePage';

import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

function App() {
  useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* ── 5 Primary Sections ── */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* ── Legacy Routes (direct URL access preserved) ── */}
        <Route path="/mission" element={<ProtectedRoute><MissionControlPage /></ProtectedRoute>} />
        <Route path="/interviews" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
        <Route path="/skills" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
        <Route path="/heatmap" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
        <Route path="/company-intel" element={<ProtectedRoute><CompanyIntelPage /></ProtectedRoute>} />
        <Route path="/offer-calculator" element={<ProtectedRoute><OfferCalculatorPage /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><InterviewCalendarPage /></ProtectedRoute>} />
        <Route path="/ats-optimizer" element={<ProtectedRoute><AtsOptimizerPage /></ProtectedRoute>} />
        <Route path="/referrals" element={<ProtectedRoute><ReferralCrmPage /></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
        <Route path="/ai-email-assistant" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
        <Route path="/interview-prep" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
        <Route path="/mock-interview" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
        <Route path="/auto-apply-copilot" element={<ProtectedRoute><AutoApplyCopilotPage /></ProtectedRoute>} />
        <Route path="/interview-battlecards" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
        <Route path="/career-roadmap" element={<ProtectedRoute><CareerRoadmapPage /></ProtectedRoute>} />
        <Route path="/salary-negotiation" element={<ProtectedRoute><SalaryNegotiationPage /></ProtectedRoute>} />
        <Route path="/alumni-network" element={<ProtectedRoute><AlumniNetworkPage /></ProtectedRoute>} />
        <Route path="/tech-trends" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
        <Route path="/portfolio-generator" element={<ProtectedRoute><PortfolioGeneratorPage /></ProtectedRoute>} />
        <Route path="/offer-matrix" element={<ProtectedRoute><OfferMatrixPage /></ProtectedRoute>} />
        <Route path="/mindset" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
        <Route path="/diagnostics" element={<ProtectedRoute><DiagnosticsPage /></ProtectedRoute>} />
        <Route path="/deployment-guide" element={<ProtectedRoute><DeploymentGuidePage /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
