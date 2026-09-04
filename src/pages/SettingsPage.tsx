import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Briefcase,
  Sliders,
  Database,
  Clipboard,
  Save,
  Check,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  ExternalLink,
  Globe,
  GitBranch,
  Link2,
  LogOut,
  Mail,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { BrandLogo } from '../components/common/BrandLogo';
import { useAuthStore } from '../store/authStore';
import { useUserSettings } from '../hooks/useUserSettings';
import { useApplications } from '../hooks/useApplications';
import { useSkills } from '../hooks/useSkills';
import { useToast } from '../components/ui/ToastContext';
import { signOutUser } from '../firebase/auth';
import { format } from 'date-fns';

export const SettingsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings();
  const { applications } = useApplications();
  const { skills } = useSkills();
  const { addToast } = useToast();

  // Profile Information
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Career & Target Preferences
  const [targetTitle, setTargetTitle] = useState('Senior Full-Stack Engineer');
  const [minSalary, setMinSalary] = useState(160000);
  const [currency, setCurrency] = useState('USD ($)');
  const [remotePref, setRemotePref] = useState('Remote / Hybrid');
  const [preferredLocations, setPreferredLocations] = useState('Remote, San Francisco, New York');
  const [targetCompanies, setTargetCompanies] = useState('Google, Stripe, Linear, Vercel');

  // Workflow & Pipeline Preferences
  const [defaultView, setDefaultView] = useState<'kanban' | 'table' | 'cards'>('kanban');
  const [staleThresholdDays, setStaleThresholdDays] = useState(14);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const [saving, setSaving] = useState(false);
  const [uidCopied, setUidCopied] = useState(false);

  // Sync settings when loaded
  useEffect(() => {
    if (!settingsLoading && settings) {
      setDisplayName(settings.displayName || user?.displayName || (user?.email ? user.email.split('@')[0] : ''));
      setBio(settings.bio || '');
      setGithubUrl(settings.githubUrl || '');
      setLinkedinUrl(settings.linkedinUrl || '');
      setPortfolioUrl(settings.portfolioUrl || '');
      setTargetTitle(settings.targetTitle || 'Senior Full-Stack Engineer');
      setMinSalary(settings.minSalary ?? 160000);
      setCurrency(settings.currency || 'USD ($)');
      setRemotePref(settings.remotePref || 'Remote / Hybrid');
      setPreferredLocations(settings.preferredLocations || 'Remote, San Francisco, New York');
      setTargetCompanies(settings.targetCompanies || 'Google, Stripe, Linear, Vercel');
      setDefaultView(settings.defaultView || 'kanban');
      setStaleThresholdDays(settings.staleThresholdDays ?? 14);
      setWeeklyGoal(settings.weeklyGoal ?? 5);
      setEmailAlerts(settings.emailAlerts ?? true);
    }
  }, [settingsLoading, settings, user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        displayName,
        bio,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        targetTitle,
        minSalary,
        currency,
        remotePref,
        preferredLocations,
        targetCompanies,
        defaultView,
        staleThresholdDays,
        weeklyGoal,
        emailAlerts,
      });
      addToast('Profile & Settings Saved', 'Your profile and workspace settings have been synced to the cloud', 'success');
    } catch {
      addToast('Save Failed', 'Could not save settings to cloud. Check your network connection.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setUidCopied(true);
      addToast('UID Copied', 'Copied account UID to clipboard', 'success');
      setTimeout(() => setUidCopied(false), 2000);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      addToast('Signed Out', 'You have been safely signed out', 'info');
      navigate('/login');
    } catch {
      addToast('Sign Out Error', 'Failed to sign out', 'error');
    }
  };

  // Export full JSON backup
  const handleExportJSON = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      userEmail: user?.email,
      profile: {
        displayName,
        bio,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
      },
      settings,
      totalApplications: applications.length,
      applications,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-profile-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Backup Exported', 'Full JSON data backup downloaded successfully', 'success');
  };

  // Export clean CSV
  const handleExportCSV = () => {
    const headers = ['Company', 'Role', 'Status', 'Applied Date', 'Deadline', 'Rating', 'Source', 'Job Link', 'Notes'];
    const rows = applications.map((a) => [
      `"${(a.company || '').replace(/"/g, '""')}"`,
      `"${(a.role || '').replace(/"/g, '""')}"`,
      `"${(a.status || '').replace(/"/g, '""')}"`,
      `"${a.appliedDate ? format(new Date(a.appliedDate), 'yyyy-MM-dd') : ''}"`,
      `"${a.deadline ? format(new Date(a.deadline), 'yyyy-MM-dd') : ''}"`,
      `"${a.rating || 0}"`,
      `"${(a.source || '').replace(/"/g, '""')}"`,
      `"${(a.jobLink || '').replace(/"/g, '""')}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-applications-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Spreadsheet Exported', 'CSV file downloaded successfully', 'success');
  };

  // Profile Metrics
  const totalApps = applications.length;
  const activeInterviews = applications.filter((a) => a.status === 'Interview' || a.status === 'Offer').length;
  const offersSecured = applications.filter((a) => a.status === 'Offer').length;
  const avgSkillProficiency = skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + s.level, 0) / skills.length)
    : 0;

  const initialLetter = (displayName || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <AppShell>
      {/* Page Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">Profile & Account Settings</h1>
        <p className="page-sub">
          Manage your personal identity, career benchmarks, workspace automation, and cloud synchronization.
        </p>
      </div>

      <div className="pb" style={{ maxWidth: 860 }}>
        {/* ── 1. HERO PROFILE CARD ── */}
        <div className="card" style={{ padding: 28, marginBottom: 24, borderTop: '4px solid var(--accent)' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  objectFit: 'cover',
                  border: '2px solid var(--border)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                }}
              />
            ) : (
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
                  color: '#fff',
                  fontSize: 28,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
                  flexShrink: 0,
                }}
              >
                {initialLetter}
              </div>
            )}

            {/* Profile Identity Details */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', margin: 0, lineHeight: 1.2 }}>
                    {displayName || 'Job Candidate'}
                  </h2>
                  <div style={{ fontSize: 13.5, color: 'var(--accent)', fontWeight: 600, marginTop: 4 }}>
                    {targetTitle}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--t3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail style={{ width: 13, height: 13 }} />
                    <span>{user?.email || 'Guest User'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 20,
                      background: 'var(--accent-bg)',
                      color: 'var(--accent)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <ShieldCheck style={{ width: 12, height: 12 }} />
                    <span>Active Member</span>
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 20,
                      background: user?.providerData?.[0]?.providerId === 'google.com' ? '#e0f2fe' : '#f1f5f9',
                      color: user?.providerData?.[0]?.providerId === 'google.com' ? '#0369a1' : '#475569',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {user?.providerData?.[0]?.providerId === 'google.com' ? 'Google OAuth' : 'Email/Password'}
                  </span>
                </div>
              </div>

              {bio && (
                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--t2)', lineHeight: 1.5 }}>
                  {bio}
                </div>
              )}

              {/* Social / Portfolio Links Row */}
              <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
                {githubUrl && (
                  <a
                    href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--t2)',
                      background: 'var(--page)',
                      padding: '4px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      textDecoration: 'none',
                    }}
                  >
                    <GitBranch style={{ width: 13, height: 13 }} />
                    <span>GitHub</span>
                  </a>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#0a66c2',
                      background: '#eff6ff',
                      padding: '4px 10px',
                      borderRadius: 8,
                      border: '1px solid #bfdbfe',
                      textDecoration: 'none',
                    }}
                  >
                    <Link2 style={{ width: 13, height: 13 }} />
                    <span>LinkedIn</span>
                  </a>
                )}
                {portfolioUrl && (
                  <a
                    href={portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--accent)',
                      background: 'var(--accent-bg)',
                      padding: '4px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      textDecoration: 'none',
                    }}
                  >
                    <Globe style={{ width: 13, height: 13 }} />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Key Pipeline Stats Snapshot */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 18,
              borderTop: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
            }}
          >
            <div style={{ background: 'var(--page)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase' }}>Applications</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginTop: 2 }}>{totalApps}</div>
            </div>
            <div style={{ background: 'var(--page)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase' }}>Interviews</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>{activeInterviews}</div>
            </div>
            <div style={{ background: 'var(--page)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase' }}>Offers</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981', marginTop: 2 }}>{offersSecured}</div>
            </div>
            <div style={{ background: 'var(--page)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase' }}>Skill Radar Avg</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', marginTop: 2 }}>{avgSkillProficiency}%</div>
            </div>
          </div>
        </div>

        {/* ── SETTINGS CONFIGURATION FORM ── */}
        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Section 1: Profile & Professional Identity */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <User style={{ width: 18, height: 18, color: 'var(--accent)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                Personal & Professional Identity
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="lbl">Full Display Name</label>
                <input
                  className="inp"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                />
              </div>

              <div>
                <label className="lbl">Professional Headline / Bio</label>
                <textarea
                  className="inp"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Full-Stack Engineer specializing in React, Node.js, and distributed microservices architectures."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div>
                  <label className="lbl">GitHub URL</label>
                  <input
                    className="inp"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label className="lbl">LinkedIn Profile URL</label>
                  <input
                    className="inp"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="lbl">Portfolio / Website URL</label>
                  <input
                    className="inp"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://portfolio.dev"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Career & Compensation Targets */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Briefcase style={{ width: 18, height: 18, color: 'var(--accent)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                Career & Compensation Targets
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="lbl">Target Career Role</label>
                <input
                  className="inp"
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="lbl">Minimum Base Salary</label>
                  <input
                    type="number"
                    className="inp"
                    value={minSalary}
                    onChange={(e) => setMinSalary(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="lbl">Preferred Currency</label>
                  <select className="inp" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="CAD ($)">CAD ($)</option>
                    <option value="AUD ($)">AUD ($)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="lbl">Workplace Preference</label>
                  <select className="inp" value={remotePref} onChange={(e) => setRemotePref(e.target.value)}>
                    <option value="Remote / Hybrid">Remote / Hybrid</option>
                    <option value="Remote Only">Remote Only</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>

                <div>
                  <label className="lbl">Target Geographic Metros</label>
                  <input
                    className="inp"
                    value={preferredLocations}
                    onChange={(e) => setPreferredLocations(e.target.value)}
                    placeholder="e.g. Remote US, San Francisco, London"
                  />
                </div>
              </div>

              <div>
                <label className="lbl">Target / Dream Companies</label>
                <input
                  className="inp"
                  value={targetCompanies}
                  onChange={(e) => setTargetCompanies(e.target.value)}
                  placeholder="e.g. Google, Stripe, Linear, Vercel"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pipeline & Workflow Automation */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Sliders style={{ width: 18, height: 18, color: 'var(--accent)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                Pipeline & Workflow Automation
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="lbl">Default Applications View</label>
                  <select
                    className="inp"
                    value={defaultView}
                    onChange={(e) => setDefaultView(e.target.value as 'kanban' | 'table' | 'cards')}
                  >
                    <option value="kanban">Kanban Board</option>
                    <option value="table">Table View</option>
                    <option value="cards">Cards Grid</option>
                  </select>
                </div>

                <div>
                  <label className="lbl">Stale Application Alert Threshold</label>
                  <select
                    className="inp"
                    value={staleThresholdDays}
                    onChange={(e) => setStaleThresholdDays(Number(e.target.value))}
                  >
                    <option value={14}>14 Days (Active follow-up)</option>
                    <option value={21}>21 Days (Standard)</option>
                    <option value={30}>30 Days (Relaxed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="lbl">Weekly Application Target</label>
                <input
                  type="number"
                  min={1}
                  className="inp"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 1)}
                  style={{ maxWidth: 220 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="emailAlerts"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent)' }}
                />
                <label htmlFor="emailAlerts" style={{ fontSize: 13, color: 'var(--t1)', cursor: 'pointer', margin: 0 }}>
                  Enable proactive follow-up notices and aging card indicators
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Data Management & Offline Portability */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Database style={{ width: 18, height: 18, color: 'var(--accent)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                Data Portability & Offline Backup
              </h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 18 }}>
              Export an independent, offline backup of your {applications.length} applications, interview logs, and milestones.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleExportJSON}
                className="btn btn-ghost"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <FileCode style={{ width: 15, height: 15, color: 'var(--accent)' }} />
                <span>Export Complete Backup (JSON)</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="btn btn-ghost"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <FileSpreadsheet style={{ width: 15, height: 15, color: '#10b981' }} />
                <span>Export Applications (CSV)</span>
              </button>
            </div>
          </div>

          {/* Section 5: Account Security & Diagnostics */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  Account Security & Session Management
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link
                  to="/diagnostics"
                  className="btn btn-ghost btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    textDecoration: 'none',
                  }}
                >
                  <span>Database Diagnostics</span>
                  <ExternalLink style={{ width: 12, height: 12 }} />
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn btn-ghost btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: '#ef4444',
                  }}
                >
                  <LogOut style={{ width: 13, height: 13 }} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            <div
              style={{
                background: 'var(--page)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '16px 18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Authenticated Account Email
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginTop: 2 }}>
                    {user?.email || 'Not signed in'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--t2)', fontFamily: 'monospace' }}>
                    UID: <strong>{user?.uid?.substring(0, 12)}...</strong>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    onClick={handleCopyUid}
                  >
                    {uidCopied ? <Check style={{ width: 12, height: 12 }} /> : <Clipboard style={{ width: 12, height: 12 }} />}
                    <span>{uidCopied ? 'Copied' : 'Copy UID'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: About Platform & Creator Credits */}
          <div
            className="card"
            style={{
              padding: 24,
              border: '1.5px solid rgba(99, 102, 241, 0.25)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 243, 255, 0.8))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <BrandLogo size={42} showGlow />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                      Job Orbit Career OS
                    </h3>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                      v2.5.0
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--t2)', margin: '3px 0 0 0' }}>
                    Engineered & crafted with passion by <strong>Deepith</strong> — Lead System Architect & Developer.
                  </p>
                </div>
              </div>

              <Link
                to="/about"
                className="btn btn-ghost"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--accent)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  background: 'var(--card)',
                }}
              >
                <Sparkles style={{ width: 14, height: 14 }} />
                <span>View Full Credits & Story</span>
                <ExternalLink style={{ width: 12, height: 12 }} />
              </Link>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{
                padding: '12px 32px',
                borderRadius: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <Save style={{ width: 16, height: 16 }} />
              <span>{saving ? 'Saving Profile & Settings…' : 'Save All Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
};
