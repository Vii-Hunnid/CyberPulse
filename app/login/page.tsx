'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, CheckCircle2, ArrowRight } from 'lucide-react';

const BRAND_FEATURES = [
  'Instant 6-category security scan',
  'Dark web breach monitoring',
  'AI-powered risk narrative',
  'Insurance readiness score',
  'Continuous alerts and monitoring',
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        .auth-input:focus { border-color: rgba(0,212,255,0.4) !important; outline: none; box-shadow: 0 0 0 3px rgba(0,212,255,0.06); }
        .auth-input { transition: all 0.2s; }
      `}</style>

      {/* ─── Left brand panel ─────────────────────────────────────────────── */}
      <div style={{
        flex: '0 0 44%', display: 'none',
        background: 'linear-gradient(160deg, #0a0f1e 0%, #0a1628 100%)',
        borderRight: '1px solid #1a2540',
        padding: '48px 48px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="auth-left-panel"
      >
        {/* Grid bg */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.6,
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          animation: 'gridMove 10s linear infinite',
        }} />
        {/* Ambient */}
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(0,212,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 56 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,212,255,0.08)', border: '1.5px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="#00d4ff" strokeWidth={1.5} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#00d4ff' }}>CyberPulse</span>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', marginBottom: 14, lineHeight: 1.2, letterSpacing: '-0.3px' }}>
              Complete cyber visibility for your business
            </h2>
            <p style={{ color: '#8892a4', fontSize: 15, lineHeight: 1.65 }}>
              Scan, monitor, and improve your security posture. Know your insurance readiness. All in one place.
            </p>
          </div>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {BRAND_FEATURES.map((f) => (
              <li key={f} style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
                <CheckCircle2 size={16} color="#00ff88" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: '#c8d0dd', fontSize: 14 }}>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ background: 'rgba(15,23,41,0.7)', border: '1px solid #1a2540', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 13, color: '#c8d0dd', marginBottom: 4, fontStyle: 'italic' }}>
              &ldquo;CyberPulse found critical gaps we didn&apos;t even know existed. The insurance score was exactly what our broker needed.&rdquo;
            </div>
            <div style={{ fontSize: 11, color: '#8892a4' }}>— IT Manager, Cape Town logistics company</div>
          </div>
        </div>
      </div>

      {/* ─── Right form panel ─────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0f1e',
        padding: '48px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile brand */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Shield size={18} color="#00d4ff" strokeWidth={1.5} />
              <span style={{ fontSize: 18, fontWeight: 700, color: '#00d4ff' }}>CyberPulse</span>
            </div>
            <p style={{ color: '#8892a4', fontSize: 15 }}>Sign in to your account</p>
          </div>

          <div style={{ background: '#0f1729', border: '1px solid #1a2540', borderRadius: 14, padding: 32 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {error && (
                <div style={{ background: '#2d0f1a', border: '1px solid rgba(255,51,102,0.2)', color: '#ff3366', padding: '11px 14px', borderRadius: 8, fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 7, color: '#8892a4' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                  style={{ width: '100%', padding: '12px 14px', background: '#141d30', border: '1px solid #1a2540', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                  placeholder="you@company.co.za"
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#8892a4' }}>Password</label>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input"
                  style={{ width: '100%', padding: '12px 14px', background: '#141d30', border: '1px solid #1a2540', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px', background: '#00d4ff', color: '#0a0f1e',
                  fontWeight: 700, fontSize: 15, borderRadius: 8, border: 'none',
                  cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity 0.15s',
                }}
              >
                {loading ? 'Signing in...' : (<>Sign In <ArrowRight size={15} strokeWidth={2.5} /></>)}
              </button>
            </form>

            <p style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: '#8892a4' }}>
              No account yet?{' '}
              <Link href="/register" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 600 }}>
                Create one free
              </Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/" style={{ color: '#3d4f6b', fontSize: 13, textDecoration: 'none' }}>← Back to home</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .auth-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
