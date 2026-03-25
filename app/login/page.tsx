'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, CheckCircle2, ArrowRight } from 'lucide-react';

const FEATURES = [
  'Instant 6-category security scan',
  'Dark web breach monitoring',
  'AI-powered risk narrative',
  'Insurance readiness score + PDF',
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
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes gridPan { 0% { background-position: 0 0; } 100% { background-position: 60px 60px; } }
        .auth-input { transition: border-color .2s, box-shadow .2s; }
        .auth-input:focus { border-color: rgba(14,165,233,.5) !important; outline: none; box-shadow: 0 0 0 3px rgba(14,165,233,.08); }
        .mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }
        @media (min-width: 768px) { .auth-panel { display: flex !important; } }
      `}</style>

      {/* ─── Left brand panel ─────────────────────────────────────────────── */}
      <div className="auth-panel" style={{
        flex: '0 0 42%', display: 'none',
        background: '#0c1220',
        borderRight: '1px solid #1e2d45',
        padding: '48px 48px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(14,165,233,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,.04) 1px,transparent 1px)', backgroundSize: '60px 60px', animation: 'gridPan 14s linear infinite' }} />
        <div style={{ position: 'absolute', top: '15%', left: '40%', width: 500, height: 400, background: 'radial-gradient(ellipse,rgba(14,165,233,.06) 0%,transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(14,165,233,.1)', border: '1.5px solid rgba(14,165,233,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={15} color="#00d4ff" strokeWidth={1.5} />
            </div>
            <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>CyberPulse</span>
          </div>

          <div className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,.08)', border: '1px solid rgba(14,165,233,.2)', borderRadius: 4, padding: '4px 12px', marginBottom: 24 }}>
            <span style={{ color: '#0ea5e9', fontSize: 10, letterSpacing: 1.5 }}>[ POSTURE INTELLIGENCE ]</span>
          </div>

          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc', marginBottom: 16, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
            Complete cyber visibility<br />for your business.
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
            Scan, monitor, and improve your security posture. Know your insurance readiness. All in one place.
          </p>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {FEATURES.map((f) => (
              <li key={f} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                <CheckCircle2 size={14} color="#10b981" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: '#cbd5e1', fontSize: 13 }}>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ position: 'relative', background: 'rgba(255,255,255,.03)', border: '1px solid #1e2d45', borderRadius: 10, padding: '16px 20px' }}>
          {/* Corner brackets decoration */}
          <div style={{ position: 'absolute', top: 7, left: 7, width: 8, height: 8, borderTop: '1.5px solid #334155', borderLeft: '1.5px solid #334155' }} />
          <div style={{ position: 'absolute', bottom: 7, right: 7, width: 8, height: 8, borderBottom: '1.5px solid #334155', borderRight: '1.5px solid #334155' }} />
          <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', marginBottom: 8 }}>
            &ldquo;CyberPulse found critical gaps we didn&apos;t even know existed. The insurance score was exactly what our broker needed.&rdquo;
          </p>
          <p className="mono" style={{ fontSize: 10, color: '#475569', letterSpacing: .5 }}>{'//'} IT MANAGER, CAPE TOWN LOGISTICS</p>
        </div>
      </div>

      {/* ─── Right form panel ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Shield size={16} color="#0ea5e9" strokeWidth={1.5} />
              <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>CyberPulse</span>
            </div>
            <p style={{ color: '#64748b', fontSize: 15 }}>Sign in to your dashboard</p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #dde3ec', borderRadius: 14, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,.04)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid rgba(239,68,68,.2)', color: '#dc2626', padding: '11px 14px', borderRadius: 8, fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 7, color: '#334155' }}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                  style={{ width: '100%', padding: '12px 14px', background: '#f8fafc', border: '1px solid #dde3ec', borderRadius: 8, color: '#0f172a', fontSize: 14 }}
                  placeholder="you@company.co.za"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 7, color: '#334155' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input"
                  style={{ width: '100%', padding: '12px 14px', background: '#f8fafc', border: '1px solid #dde3ec', borderRadius: 8, color: '#0f172a', fontSize: 14 }}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '13px', background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 8, border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? .75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity .15s' }}
                className="mono"
              >
                {loading ? 'SIGNING IN...' : (<>SIGN IN <ArrowRight size={14} strokeWidth={2.5} /></>)}
              </button>
            </form>

            <p style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
              No account?{' '}
              <Link href="/register" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>Create one free →</Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/" style={{ color: '#94a3b8', fontSize: 12, textDecoration: 'none' }}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
