'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Shield, CheckCircle2, ArrowRight } from 'lucide-react';

const FEATURES = [
  'Full scan history and trend tracking',
  'Dark web monitoring for your domain',
  'Insurance readiness attestation PDF',
  'Step-by-step remediation guides',
  'Instant alerts when new threats emerge',
  'Free forever — no credit card required',
];

function RegisterContent() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', domain: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId      = searchParams.get('scan') ?? searchParams.get('scanId') ?? '';
  const prefillDomain = searchParams.get('domain') ?? '';

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, domain: form.domain || prefillDomain, scanId: scanId || undefined }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Registration failed.'); setLoading(false); return; }
    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/dashboard');
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
        <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 400, height: 400, background: 'radial-gradient(ellipse,rgba(16,185,129,.05) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(14,165,233,.1)', border: '1.5px solid rgba(14,165,233,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={15} color="#00d4ff" strokeWidth={1.5} />
            </div>
            <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>CyberPulse</span>
          </div>

          <div className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 4, padding: '4px 12px', marginBottom: 24 }}>
            <span style={{ color: '#10b981', fontSize: 10, letterSpacing: 1.5 }}>[ FREE FOREVER ]</span>
          </div>

          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc', marginBottom: 16, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
            {scanId ? 'Unlock your full scan results.' : 'Start protecting your business today.'}
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
            {scanId
              ? 'Your free scan is ready. Create your account to see the full report, dark web data, and remediation steps — all free.'
              : 'Everything you need to understand, monitor, and improve your cyber security posture.'}
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

        <div style={{ position: 'relative', background: 'rgba(16,185,129,.04)', border: '1px solid rgba(16,185,129,.15)', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={14} color="#10b981" strokeWidth={2} style={{ flexShrink: 0 }} />
          <span className="mono" style={{ fontSize: 11, color: '#10b981', letterSpacing: .5 }}>NO CREDIT CARD REQUIRED</span>
        </div>
      </div>

      {/* ─── Right form panel ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Shield size={16} color="#0ea5e9" strokeWidth={1.5} />
              <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>CyberPulse</span>
            </div>
            <p style={{ color: '#64748b', fontSize: 15 }}>Create your free account</p>

            {scanId && (
              <div style={{ marginTop: 10, background: '#f0fdf4', border: '1px solid rgba(16,185,129,.25)', color: '#059669', padding: '8px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500 }}>
                Your scan results will be linked to this account
              </div>
            )}
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #dde3ec', borderRadius: 14, padding: '28px 28px', boxShadow: '0 4px 24px rgba(0,0,0,.04)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid rgba(239,68,68,.2)', color: '#dc2626', padding: '11px 14px', borderRadius: 8, fontSize: 13 }}>
                  {error}
                </div>
              )}

              {[
                { key: 'name',     label: 'Full Name',       type: 'text',     placeholder: 'Jane Smith',                   req: true  },
                { key: 'email',    label: 'Work Email',      type: 'email',    placeholder: 'jane@company.co.za',            req: true  },
                { key: 'password', label: 'Password',        type: 'password', placeholder: 'Minimum 8 characters',          req: true  },
                { key: 'company',  label: 'Company Name',    type: 'text',     placeholder: 'Acme Pty Ltd',                  req: false },
                { key: 'domain',   label: 'Business Domain', type: 'text',     placeholder: prefillDomain || 'yourbusiness.co.za', req: false },
              ].map(({ key, label, type, placeholder, req }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                    {label}{req && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
                  </label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => update(key, e.target.value)}
                    required={req}
                    className="auth-input"
                    style={{ width: '100%', padding: '11px 14px', background: '#f8fafc', border: '1px solid #dde3ec', borderRadius: 8, color: '#0f172a', fontSize: 14 }}
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="mono"
                style={{ width: '100%', padding: '13px', background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 8, border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? .75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, letterSpacing: .5 }}
              >
                {loading ? 'CREATING ACCOUNT...' : (<>CREATE FREE ACCOUNT <ArrowRight size={14} strokeWidth={2.5} /></>)}
              </button>

              <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                By registering you agree to our{' '}
                <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Terms</a>
                {' & '}
                <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</a>
              </p>
            </form>

            <p style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
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

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
