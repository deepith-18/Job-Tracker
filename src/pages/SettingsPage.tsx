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
  Code2,
  Activity,
  Target,
  Plus,
  X,
  Sun,
  Moon,
  CheckCircle2,
  Zap,
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
import { useThemeStore, THEME_PALETTES, ThemePalette } from '../store/themeStore';

const SUGGESTED_SKILLS = [
  'TypeScript',
  'React',
  'Node.js',
  'Go',
  'Python',
  'PostgreSQL',
  'Docker',
  'Kubernetes',
  'AWS',
  'GraphQL',
  'Redis',
  'System Design',
  'Next.js',
  'CI/CD',
];

const SEARCH_STATUSES = [
  { id: 'Actively Interviewing', label: 'Actively Interviewing', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  { id: 'Open to Offers', label: 'Open to Offers', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' },
  { id: 'Selective Screening', label: 'Selective Screening', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  { id: 'Placed / Not Looking', label: 'Placed / Not Looking', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' },
];

const SENIORITY_LEVELS = [
  'Junior Engineer',
  'Mid-Level Engineer',
  'Senior Engineer',
  'Staff / Lead Engineer',
  'Principal Architect',
  'Engineering Manager',
];

export const SettingsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings();
  const { applications } = useApplications();
  const { skills } = useSkills();
  const { addToast } = useToast();

  const { resolvedTheme, toggleTheme, palette, setPalette } = useThemeStore();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'profile' | 'career' | 'skills' | 'workspace' | 'data'>('profile');

  // Profile Information
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [searchStatus, setSearchStatus] = useState('Actively Interviewing');
  const [seniorityLevel, setSeniorityLevel] = useState('Senior Engineer');

  // Career & Target Preferences
  const [targetTitle, setTargetTitle] = useState('Senior Full-Stack Engineer');
  const [minSalary, setMinSalary] = useState(160000);
  const [currency, setCurrency] = useState('USD ($)');
  const [remotePref, setRemotePref] = useState('Remote / Hybrid');
  const [preferredLocations, setPreferredLocations] = useState('Remote, San Francisco, New York');
  const [targetCompanies, setTargetCompanies] = useState('Google, Stripe, Linear, Vercel');

  // Skills
  const [topSkills, setTopSkills] = useState<string[]>([
    'TypeScript',
    'React',
    'Node.js',
    'Go',
    'PostgreSQL',
    'System Design',
  ]);
  const [skillInput, setSkillInput] = useState('');

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
      setLeetcodeUrl(settings.leetcodeUrl || '');
      setSearchStatus(settings.searchStatus || 'Actively Interviewing');
      setSeniorityLevel(settings.seniorityLevel || 'Senior Engineer');
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
      if (settings.topSkills && Array.isArray(settings.topSkills)) {
        setTopSkills(settings.topSkills);
      }
    }
  }, [settingsLoading, settings, user]);

  // Dynamic Profile Strength Score Calculation
  const profileScore = React.useMemo(() => {
    let score = 0;
    if (displayName.trim()) score += 10;
    if (bio.trim()) score += 15;
    if (githubUrl.trim() || linkedinUrl.trim()) score += 15;
    if (portfolioUrl.trim() || leetcodeUrl.trim()) score += 10;
    if (targetTitle.trim()) score += 15;
    if (minSalary > 0) score += 10;
    if (targetCompanies.trim()) score += 10;
    if (topSkills.length >= 3) score += 15;
    return Math.min(100, score);
  }, [displayName, bio, githubUrl, linkedinUrl, portfolioUrl, leetcodeUrl, targetTitle, minSalary, targetCompanies, topSkills]);

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || topSkills.includes(trimmed)) return;
    setTopSkills([...topSkills, trimmed]);
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setTopSkills(topSkills.filter((s) => s !== skillToRemove));
  };

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
        leetcodeUrl,
        searchStatus,
        seniorityLevel,
        targetTitle,
        minSalary,
        currency,
        remotePref,
        preferredLocations,
        targetCompanies,
        topSkills,
        defaultView,
        staleThresholdDays,
        weeklyGoal,
        emailAlerts,
      });
      addToast('Profile & Settings Saved', 'Your career profile and workspace parameters have been synced to the cloud', 'success');
    } catch {
      addToast('Save Failed', 'Could not sync settings to cloud. Please check your network connection.', 'error');
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
        leetcodeUrl,
        searchStatus,
        seniorityLevel,
        topSkills,
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

  const currentStatusObj = SEARCH_STATUSES.find((s) => s.id === searchStatus) || SEARCH_STATUSES[0];
  const initialLetter = (displayName || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <AppShell>
      {/* Page Header */}
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">Executive Profile & System Parameters</h1>
        <p className="page-sub">
          Manage your professional engineering identity, career benchmarks, workspace automation, and cloud synchronization.
        </p>
      </div>

      <div className="pb" style={{ maxWidth: 960 }}>
        {/* ── 1. HERO PROFILE & COMMAND CARD ── */}
        <div
          className="card"
          style={{
            padding: 28,
            marginBottom: 24,
            borderTop: '4px solid var(--accent)',
            background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
          }}
        >
          <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar with Status Ring */}
            <div style={{ position: 'relative' }}>
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 22,
                    objectFit: 'cover',
                    border: '2px solid var(--border)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 22,
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
                    color: '#fff',
                    fontSize: 30,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px var(--accent-glow)',
                    flexShrink: 0,
                  }}
                >
                  {initialLetter}
                </div>
              )}
              {/* Status Indicator Dot */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: currentStatusObj.color,
                  border: '2.5px solid var(--card)',
                }}
                title={currentStatusObj.label}
              />
            </div>

            {/* Profile Identity Details */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--t1)', margin: 0, lineHeight: 1.2 }}>
                      {displayName || 'Software Engineer'}
                    </h2>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: 20,
                        background: currentStatusObj.bg,
                        color: currentStatusObj.color,
                        border: `1px solid ${currentStatusObj.color}35`,
                      }}
                    >
                      {currentStatusObj.label}
                    </span>
                  </div>

                  <div style={{ fontSize: 13.5, color: 'var(--accent)', fontWeight: 700, marginTop: 4 }}>
                    {seniorityLevel} • {targetTitle}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail style={{ width: 13, height: 13 }} />
                    <span>{user?.email || 'Authenticated User'}</span>
                    <span>•</span>
                    <span>{user?.providerData?.[0]?.providerId === 'google.com' ? 'Google Authenticated' : 'Secure Email Session'}</span>
                  </div>
                </div>

                {/* Profile Readiness Meter */}
                <div
                  style={{
                    background: 'var(--page)',
                    padding: '8px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    textAlign: 'right',
                    minWidth: 150,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: 'var(--t3)' }}>
                    <span>Profile Readiness</span>
                    <span style={{ color: profileScore >= 80 ? '#10b981' : 'var(--accent)', fontWeight: 900 }}>
                      {profileScore}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 5,
                      width: '100%',
                      background: 'var(--border)',
                      borderRadius: 10,
                      marginTop: 6,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${profileScore}%`,
                        background: profileScore >= 80 ? '#10b981' : 'var(--accent)',
                        borderRadius: 10,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </div>

              {bio && (
                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--t2)', lineHeight: 1.55 }}>
                  {bio}
                </div>
              )}

              {/* External Profile Links */}
              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
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
                {leetcodeUrl && (
                  <a
                    href={leetcodeUrl.startsWith('http') ? leetcodeUrl : `https://${leetcodeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#d97706',
                      background: '#fffbeb',
                      padding: '4px 10px',
                      borderRadius: 8,
                      border: '1px solid #fde68a',
                      textDecoration: 'none',
                    }}
                  >
                    <Code2 style={{ width: 13, height: 13 }} />
                    <span>LeetCode</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick-Access Command Hub */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 18,
              borderTop: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 10,
            }}
          >
            <Link
              to="/search-doctor"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--page)',
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
                <Activity size={16} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)' }}>Pipeline Diagnostics</div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>Audit funnel drop-offs</div>
              </div>
            </Link>

            <Link
              to="/war-room"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--page)',
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fdf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea', flexShrink: 0 }}>
                <Target size={16} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)' }}>Interview War Room</div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>{activeInterviews} loops in motion</div>
              </div>
            </Link>

            <Link
              to="/insights?tab=jd-matcher"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--page)',
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)' }}>Live JD ATS Scanner</div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>Match target role specs</div>
              </div>
            </Link>

            <Link
              to="/insights?tab=compensation"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--page)',
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', flexShrink: 0 }}>
                <Zap size={16} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)' }}>Compensation Radar</div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>Target: {currency.split(' ')[0]} {minSalary.toLocaleString()}</div>
              </div>
            </Link>
          </div>

          {/* Key Pipeline Stats Snapshot */}
          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 10,
            }}
          >
            <div style={{ background: 'var(--page)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10.5, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase' }}>Tracked Applications</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', marginTop: 2 }}>{totalApps}</div>
            </div>
            <div style={{ background: 'var(--page)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10.5, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase' }}>Active Interview Loops</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>{activeInterviews}</div>
            </div>
            <div style={{ background: 'var(--page)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10.5, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase' }}>Written Offers</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#10b981', marginTop: 2 }}>{offersSecured}</div>
            </div>
            <div style={{ background: 'var(--page)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10.5, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase' }}>Verified Skill Average</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--accent)', marginTop: 2 }}>{avgSkillProficiency}%</div>
            </div>
          </div>
        </div>

        {/* ── 2. SEGMENTED NAVIGATION TABS ── */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 20 }}>
          {[
            { id: 'profile', label: '1. Identity & Links', icon: User },
            { id: 'career', label: '2. Career & Targets', icon: Briefcase },
            { id: 'skills', label: '3. Technical Stack', icon: Code2 },
            { id: 'workspace', label: '4. Workspace & Theme', icon: Sliders },
            { id: 'data', label: '5. Portability & Security', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className="btn btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 12.5,
                  fontWeight: 700,
                  padding: '8px 16px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  background: isActive ? 'var(--accent)' : 'var(--card)',
                  color: isActive ? '#ffffff' : 'var(--t2)',
                  border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── 3. FORM SECTIONS ── */}
        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* TAB 1: Profile & Identity */}
          {activeTab === 'profile' && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <User style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  Personal & Professional Identity
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
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
                    <label className="lbl">Current Search Status</label>
                    <select
                      className="inp"
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                    >
                      {SEARCH_STATUSES.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="lbl">Professional Headline / Bio</label>
                  <textarea
                    className="inp"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. Full-Stack Engineer specializing in React, TypeScript, Go, and high-throughput microservices architectures."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="lbl">GitHub Profile</label>
                    <input
                      className="inp"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div>
                    <label className="lbl">LinkedIn Profile</label>
                    <input
                      className="inp"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="lbl">Portfolio / Website</label>
                    <input
                      className="inp"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://portfolio.dev"
                    />
                  </div>
                  <div>
                    <label className="lbl">LeetCode / Codeforces Profile</label>
                    <input
                      className="inp"
                      value={leetcodeUrl}
                      onChange={(e) => setLeetcodeUrl(e.target.value)}
                      placeholder="https://leetcode.com/username"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Career Targets */}
          {activeTab === 'career' && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Briefcase style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  Career & Compensation Targets
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="lbl">Target Career Role</label>
                    <input
                      className="inp"
                      value={targetTitle}
                      onChange={(e) => setTargetTitle(e.target.value)}
                      placeholder="e.g. Senior Full-Stack Engineer"
                    />
                  </div>

                  <div>
                    <label className="lbl">Seniority Track</label>
                    <select
                      className="inp"
                      value={seniorityLevel}
                      onChange={(e) => setSeniorityLevel(e.target.value)}
                    >
                      {SENIORITY_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>
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
          )}

          {/* TAB 3: Technical Stack */}
          {activeTab === 'skills' && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Code2 style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  Primary Technical Stack & Core Competencies
                </h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 16, lineHeight: 1.5 }}>
                These primary technologies power your Live JD ATS Matcher and personalized Interview War Room question suggestions.
              </p>

              {/* Tag Editor */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input
                  className="inp"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(skillInput);
                    }
                  }}
                  placeholder="Type a skill and press Enter (e.g. Docker, Rust, Kafka)..."
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(skillInput)}
                  className="btn btn-ghost"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={15} />
                  <span>Add Skill</span>
                </button>
              </div>

              {/* Active Skill Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {topSkills.map((sk) => (
                  <span
                    key={sk}
                    style={{
                      background: 'var(--card-hover)',
                      border: '1px solid var(--border)',
                      padding: '5px 12px',
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: 'var(--t1)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--t3)',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Remove"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggested Skills */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t3)', marginBottom: 8, textTransform: 'uppercase' }}>
                  Quick-Add Recommended Engineering Competencies:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SUGGESTED_SKILLS.filter((s) => !topSkills.includes(s)).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSkill(s)}
                      className="btn btn-ghost btn-sm"
                      style={{
                        fontSize: 11.5,
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: 'var(--page)',
                      }}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Workspace & Appearance */}
          {activeTab === 'workspace' && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Sliders style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  Workspace Appearance & Pipeline Automation
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Theme Palette In-Page Customizer */}
                <div
                  style={{
                    background: 'var(--page)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: '16px 18px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)' }}>
                        Interface Accent Palette
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                        Live custom colorways engineered for high-focus software development.
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="btn btn-ghost btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        {resolvedTheme === 'dark' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#6366f1" />}
                        <span>{resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>

                      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {THEME_PALETTES.map((p) => {
                          const isCurrent = palette === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setPalette(p.id as ThemePalette)}
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: p.color,
                                border: isCurrent ? '2.5px solid var(--t1)' : '1px solid rgba(0,0,0,0.15)',
                                cursor: 'pointer',
                                transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                                boxShadow: isCurrent ? `0 0 10px ${p.color}80` : 'none',
                                transition: 'all 0.15s ease',
                                padding: 0,
                              }}
                              title={p.label}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

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
                      <option value={14}>14 Days (Active follow-up cadence)</option>
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
          )}

          {/* TAB 5: Data Portability & Security */}
          {activeTab === 'data' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Data Portability */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Database style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                    Data Portability & Offline Backup
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 18 }}>
                  Export an independent, offline backup of your {applications.length} applications, interview notes, and pipeline metrics.
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

              {/* Account Security */}
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
            </div>
          )}

          {/* Section: Platform Architecture & Creator Info */}
          <div
            className="card"
            style={{
              padding: 24,
              border: '1.5px solid var(--accent)',
              background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
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
                      v3.0.0
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--t2)', margin: '3px 0 0 0' }}>
                    Engineered with precision by <strong>Deepith</strong> — Lead System Architect & Developer.
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
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                }}
              >
                <Sparkles style={{ width: 14, height: 14 }} />
                <span>View System Credits & Changelog</span>
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
