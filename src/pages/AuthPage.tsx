import { AlertTriangle, Rocket, Sparkles, CheckCircle2, Calendar, FileText, Target, TrendingUp, Compass, Eye, EyeOff, Activity, Layers } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../firebase/auth';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/ToastContext';
import { useAuthStore } from '../store/authStore';

const LOGIN_ERRORS: Record<string, string> = {
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-email': 'Please enter a valid email.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait.',
};

const SIGNUP_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email.',
  'auth/weak-password': 'Password must be at least 6 characters.',
};

export const AuthPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const [mode, setMode] = useState<'login' | 'signup'>(
    location.pathname === '/signup' ? 'signup' : 'login'
  );

  useEffect(() => {
    setMode(location.pathname === '/signup' ? 'signup' : 'login');
  }, [location.pathname]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', '#f87172', '#fbbf24', '#34d399'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (password !== confirm) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        addToast('Welcome back! 👋', 'Signed in successfully', 'success');
      } else {
        await signUpWithEmail(email, password);
        addToast('Account created!', 'Welcome to ApplyFlow', 'success');
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      const map = mode === 'login' ? LOGIN_ERRORS : SIGNUP_ERRORS;
      setError(map[code] ?? 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      addToast('Welcome back! 👋', 'Signed in with Google successfully', 'success');
      navigate('/dashboard');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      const message = (err as { message?: string }).message ?? '';
      if (code !== 'auth/popup-closed-by-user') {
        if (code === 'auth/operation-not-allowed') {
          setError('Google Sign-In is not enabled in Firebase Console. Go to Authentication > Sign-in method to enable it.');
        } else if (code === 'auth/unauthorized-domain') {
          setError('This domain is not authorized in Firebase Console (Authentication > Settings > Authorized domains).');
        } else {
          setError(`Google authentication failed: ${message || code || 'Unknown error'}`);
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError('');
    navigate(newMode === 'signup' ? '/signup' : '/login', { replace: true });
  };

  return (
    <div className="aurora-auth-root">
      {/* Background Subtle Tech Grid */}
      <div className="auth-grid-bg" />

      {/* Ambient Lighting Glow Blobs */}
      <div className="aurora-blob blob-1" />
      <div className="aurora-blob blob-2" />
      <div className="aurora-blob blob-3" />

      {/* SVG Network Connection Lines with Tiny Traveling Cyan Particles */}
      <svg className="auth-network-svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
        {/* Curved connection paths between floating card positions */}
        <path d="M 120 180 Q 300 240 460 320" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" fill="none" strokeDasharray="4 6" />
        <path d="M 1250 180 Q 1050 260 880 340" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" fill="none" strokeDasharray="4 6" />
        <path d="M 160 720 Q 360 620 460 520" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" fill="none" strokeDasharray="4 6" />
        <path d="M 1200 700 Q 1000 600 880 500" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" fill="none" strokeDasharray="4 6" />

        {/* Traveling Cyan Particles */}
        <circle r="3" fill="#22D3EE">
          <animateMotion path="M 120 180 Q 300 240 460 320" dur="12s" repeatCount="indefinite" />
        </circle>
        <circle r="2.5" fill="#6366F1">
          <animateMotion path="M 1250 180 Q 1050 260 880 340" dur="14s" repeatCount="indefinite" />
        </circle>
        <circle r="3" fill="#22D3EE">
          <animateMotion path="M 160 720 Q 360 620 460 520" dur="10s" repeatCount="indefinite" />
        </circle>
        <circle r="2.5" fill="#8B5CF6">
          <animateMotion path="M 1200 700 Q 1000 600 880 500" dur="15s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Floating AI Career Network Cards */}
      <AnimatePresence mode="wait">
        {mode === 'login' ? (
          <motion.div
            key="login-network"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            {/* Card 1: AI Match (Top Left) */}
            <motion.div
              className="floating-card-item"
              style={{ top: '16%', left: '8%' }}
              animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34, 211, 238, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22D3EE', flexShrink: 0 }}>
                <Sparkles size={18} />
              </div>
              <div>
                <div className="floating-card-tag"><Sparkles size={10} /> AI MATCH</div>
                <div className="floating-card-title">94% Strong Match</div>
                <div className="floating-card-sub">Senior Frontend Engineer • Google</div>
              </div>
            </motion.div>

            {/* Card 2: Application (Top Right) */}
            <motion.div
              className="floating-card-item"
              style={{ top: '18%', right: '9%' }}
              animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8', flexShrink: 0 }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="floating-card-tag" style={{ color: '#818CF8' }}>APPLICATION</div>
                <div className="floating-card-title">Software Engineer</div>
                <div className="floating-card-sub">Applied 2h ago • Stripe</div>
              </div>
            </motion.div>

            {/* Card 3: Interview (Bottom Left) */}
            <motion.div
              className="floating-card-item floating-card-desktop-only"
              style={{ bottom: '20%', left: '10%' }}
              animate={{ y: [0, 8, 0], x: [0, -6, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', flexShrink: 0 }}>
                <Calendar size={18} />
              </div>
              <div>
                <div className="floating-card-tag" style={{ color: '#F59E0B' }}>INTERVIEW</div>
                <div className="floating-card-title">Technical Round</div>
                <div className="floating-card-sub">Tomorrow 10:30 AM</div>
              </div>
            </motion.div>

            {/* Card 4: Career Pipeline (Bottom Right) */}
            <motion.div
              className="floating-card-item floating-card-desktop-only"
              style={{ bottom: '22%', right: '11%' }}
              animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
              transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA', flexShrink: 0 }}>
                <Activity size={18} />
              </div>
              <div>
                <div className="floating-card-tag" style={{ color: '#A78BFA' }}>CAREER PIPELINE</div>
                <div className="floating-card-title">Applied → Screening → Interview → Offer</div>
                <div className="floating-card-sub">12 Active Opportunities</div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="signup-network"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            {/* Card 1: Resume OS (Top Left) */}
            <motion.div
              className="floating-card-item"
              style={{ top: '16%', left: '8%' }}
              animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34, 211, 238, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22D3EE', flexShrink: 0 }}>
                <FileText size={18} />
              </div>
              <div>
                <div className="floating-card-tag"><Sparkles size={10} /> RESUME OS</div>
                <div className="floating-card-title">+ Resume Version</div>
                <div className="floating-card-sub">ATS Tailored & Ready</div>
              </div>
            </motion.div>

            {/* Card 2: Skills Matrix (Top Right) */}
            <motion.div
              className="floating-card-item"
              style={{ top: '18%', right: '9%' }}
              animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8', flexShrink: 0 }}>
                <Target size={18} />
              </div>
              <div>
                <div className="floating-card-tag" style={{ color: '#818CF8' }}>SKILLS MATRIX</div>
                <div className="floating-card-title">+ Skills Analyzed</div>
                <div className="floating-card-sub">React • Node • Systems</div>
              </div>
            </motion.div>

            {/* Card 3: Pipeline Tracking (Bottom Left) */}
            <motion.div
              className="floating-card-item floating-card-desktop-only"
              style={{ bottom: '20%', left: '10%' }}
              animate={{ y: [0, 8, 0], x: [0, -6, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                <TrendingUp size={18} />
              </div>
              <div>
                <div className="floating-card-tag" style={{ color: '#10B981' }}>PIPELINE TRACKING</div>
                <div className="floating-card-title">+ Applications Active</div>
                <div className="floating-card-sub">Auto Status Tracking</div>
              </div>
            </motion.div>

            {/* Card 4: Career Goals (Bottom Right) */}
            <motion.div
              className="floating-card-item floating-card-desktop-only"
              style={{ bottom: '22%', right: '11%' }}
              animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
              transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA', flexShrink: 0 }}>
                <Compass size={18} />
              </div>
              <div>
                <div className="floating-card-tag" style={{ color: '#A78BFA' }}>CAREER GOALS</div>
                <div className="floating-card-title">+ Career Goals Active</div>
                <div className="floating-card-sub">Targeting Staff / Lead</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glassmorphism Authentication Card */}
      <motion.div
        className="auth-glass-card"
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo & Product Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            className="auth-logo-pulse"
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#ffffff" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>

          <h1 style={{ fontSize: 25, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
            ApplyFlow
          </h1>
          <p style={{ fontSize: 13, color: '#a5b4fc', marginTop: 3, margin: 0, fontWeight: 500 }}>
            Smart Job Tracker & Career Pipeline OS
          </p>

          {/* Headline Message Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 11.5,
              fontWeight: 600,
              color: '#22d3ee',
              marginTop: 12,
            }}
          >
            <Layers size={12} />
            {mode === 'login' ? 'Welcome back to your career pipeline.' : 'Build your personal career operating system.'}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign In
            {mode === 'login' && <motion.div className="tab-indicator" layoutId="authTab" />}
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Create Account
            {mode === 'signup' && <motion.div className="tab-indicator" layoutId="authTab" />}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              className="auth-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="auth-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                className="auth-input"
                style={{ paddingRight: 42 }}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
                aria-label={showPw ? "Hide password" : "Show password"}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength meter on signup */}
            {mode === 'signup' && password && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 4,
                      flex: 1,
                      borderRadius: 2,
                      background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.3s ease',
                    }}
                  />
                ))}
                <span style={{ fontSize: 11, fontWeight: 700, color: strengthColors[strength], minWidth: 40 }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="auth-label">Confirm Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                className="auth-input"
                style={{
                  borderColor: confirm && confirm !== password ? '#f87171' : undefined,
                }}
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              {confirm && confirm !== password && (
                <p style={{ fontSize: 11.5, color: '#f87171', marginTop: 4 }}>Passwords do not match</p>
              )}
            </motion.div>
          )}

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: 12.5,
                  color: '#fca5a5',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span><AlertTriangle className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /></span>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Primary Action Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{
              marginTop: 4,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #8b5cf6 100%)',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 800,
              padding: '12px 20px',
            }}
          >
            {mode === 'login' ? <>Sign In to Dashboard <Rocket className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /></> : <>Create Free Account <Rocket className="inline-block w-4 h-4 mr-1.5 align-text-bottom" /></>}
          </Button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 16px', gap: 10 }}>
          <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ fontSize: 10.5, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>or continue with</span>
          <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Google Authentication Button */}
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          variant="secondary"
          size="lg"
          loading={googleLoading}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            color: '#ffffff',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Google
        </Button>



        {/* Footer Toggle */}
        <div style={{ marginTop: 22, textAlign: 'center', fontSize: 12.5, color: '#a5b4fc' }}>
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Sign in here
              </button>
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};
