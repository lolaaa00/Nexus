import { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logoSrc from '@/assets/rialooos.jpg';

export default function AuthScreen() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#d1ccbf',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
      }}>
        {/* Logo + brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img
            src={logoSrc}
            alt="rialai"
            style={{
              width: 52, height: 52, borderRadius: 14,
              objectFit: 'cover', display: 'inline-block',
              boxShadow: '0 4px 16px rgba(130,88,109,0.22)',
              marginBottom: 16,
            }}
          />
          <h1 style={{
            fontSize: 24, fontWeight: 700,
            fontFamily: 'Plus Jakarta Sans',
            color: '#2d1f28',
            letterSpacing: '-0.025em',
            marginBottom: 6,
          }}>rialai</h1>
          <p style={{
            fontSize: 13, color: 'rgba(45,31,40,0.48)',
            fontFamily: 'Plus Jakarta Sans',
          }}>
            {mode === 'signin' ? 'Welcome back.' : 'Create your account.'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.62)',
          borderRadius: 20,
          border: '1px solid rgba(130,88,109,0.13)',
          padding: '32px 28px',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 40px rgba(130,88,109,0.07)',
        }}>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 11,
              border: '1px solid rgba(130,88,109,0.18)',
              background: 'rgba(255,255,255,0.80)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13.5, fontWeight: 600,
              fontFamily: 'Plus Jakarta Sans',
              color: '#2d1f28',
              marginBottom: 20,
              transition: 'all 0.18s',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(130,88,109,0.34)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(130,88,109,0.18)'; }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(130,88,109,0.12)' }} />
            <span style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'rgba(130,88,109,0.45)', letterSpacing: '0.06em' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(130,88,109,0.12)' }} />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.70)',
                border: '1px solid rgba(130,88,109,0.15)',
                borderRadius: 11, padding: '10px 14px',
              }}>
                <Mail size={15} style={{ color: 'rgba(130,88,109,0.50)', flexShrink: 0 }} />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    background: 'transparent',
                    fontSize: 13.5, fontFamily: 'Plus Jakarta Sans',
                    color: '#2d1f28',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.70)',
                border: '1px solid rgba(130,88,109,0.15)',
                borderRadius: 11, padding: '10px 14px',
              }}>
                <Lock size={15} style={{ color: 'rgba(130,88,109,0.50)', flexShrink: 0 }} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    background: 'transparent',
                    fontSize: 13.5, fontFamily: 'Plus Jakarta Sans',
                    color: '#2d1f28',
                  }}
                />
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', borderRadius: 9,
                background: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.14)',
                marginBottom: 16,
              }}>
                <AlertCircle size={13} style={{ color: '#dc2626', flexShrink: 0 }} />
                <p style={{ fontSize: 12.5, color: '#dc2626', fontFamily: 'Plus Jakarta Sans' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: 11,
                border: 'none',
                background: '#82586d',
                color: '#fff',
                fontSize: 13.5, fontWeight: 600,
                fontFamily: 'Plus Jakarta Sans',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.18s',
              }}
            >
              {loading ? 'Please wait…' : (mode === 'signin' ? 'Sign in' : 'Create account')}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>
        </div>

        {/* Toggle mode */}
        <p style={{
          textAlign: 'center', marginTop: 20,
          fontSize: 13, color: 'rgba(45,31,40,0.48)',
          fontFamily: 'Plus Jakarta Sans',
        }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
            style={{
              background: 'none', border: 'none', padding: 0,
              color: '#82586d', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans', fontSize: 13,
            }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function friendlyError(msg: string): string {
  if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
    return 'Incorrect email or password.';
  }
  if (msg.includes('email-already-in-use')) {
    return 'An account with this email already exists.';
  }
  if (msg.includes('weak-password')) {
    return 'Password must be at least 6 characters.';
  }
  if (msg.includes('invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('popup-closed-by-user')) {
    return 'Sign-in popup was closed. Please try again.';
  }
  if (msg.includes('network-request-failed')) {
    return 'Network error. Check your connection and try again.';
  }
  return 'Something went wrong. Please try again.';
}
