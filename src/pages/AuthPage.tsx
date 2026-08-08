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

  // If user is already authenticated (e.g. returning from mobile Google redirect), auto-redirect to dashboard
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const [mode, setMode] = useState<'login' | 'signup'>(
    location.pathname === '/signup' ? 'signup' : 'login'
  );

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
  const strengthColors = ['', '#f87171', '#fbbf24', '#34d399'];
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
        addToast('Account created! 🚀', 'Welcome to CareerOS', 'success');
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
          setError('This domain is not authorized in Firebase Console. Go to Authentication > Settings > Authorized domains.');
        } else {
          setError(`Google authentication failed: ${message || code || 'Unknown error'}`);
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="aurora-auth-root">
      {/* Dynamic Aurora Ambient Blobs */}
      <div className="aurora-blob blob-1" />
      <div className="aurora-blob blob-2" />
      <div className="aurora-blob blob-3" />

      {/* Main Glass Center Card */}
      <motion.div
        className="auth-glass-card"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.45)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#ffffff" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            ApplyFlow
          </h1>
          <p style={{ fontSize: 13.5, color: '#a5b4fc', marginTop: 4, margin: 0 }}>
            Smart Job Tracker & Career Pipeline OS
          </p>
        </div>

        {/* Liquid Glass Mode Toggle Tabs */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            Sign In
            {mode === 'login' && <motion.div className="tab-indicator" layoutId="authTab" />}
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setMode('signup');
              setError('');
            }}
          >
            Create Account
            {mode === 'signup' && <motion.div className="tab-indicator" layoutId="authTab" />}
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                }}
              >
                {showPw ? '🙈' : '👁️'}
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

          {/* Error alert */}
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
                <span>⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{
              marginTop: 6,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #8b5cf6 100%)',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
              borderRadius: 14,
              fontSize: 14.5,
              fontWeight: 800,
            }}
          >
            {mode === 'login' ? 'Sign In to Dashboard 🚀' : 'Create Free Account 🚀'}
          </Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 16px', gap: 10 }}>
          <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
          <span style={{ fontSize: 11, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>or continue with</span>
          <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignIn}
          variant="secondary"
          size="lg"
          loading={googleLoading}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            borderRadius: 14,
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

        {/* Footer info */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12.5, color: '#a5b4fc' }}>
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
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
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
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
