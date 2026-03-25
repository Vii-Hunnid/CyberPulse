'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Shield, CheckCircle2, ArrowRight } from 'lucide-react';

const BRAND_FEATURES = [
  'Full scan history and trend tracking',
  'Dark web monitoring for your domain',
  'Insurance readiness attestation PDF',
  'Step-by-step remediation guides',
  'Instant alerts when new threats appear',
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', domain: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId = searchParams.get('scan') ?? searchParams.get('scanId') ?? '';
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

    if (!res.ok) {
      setError(data.error ?? 'Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/dashboard');
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
      <div
        className="auth-left-panel"
        style={{
          flex: '0 0 44%', display: 'none',
          background: 'linear-gradient(160deg, #0a0f1e 0%, #0a1628 100%)',
          borderRight: '1px solid #1a2540',
          padding: '48px 48px',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, opacity: 0.6, backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', animation: 'gridMove 10s linear infinite' }} />
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(0,212,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 56 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,212,255,0.08)', border: '1.5px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="#00d4ff" strokeWidth={1.5} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#00d4ff' }}>CyberPulse</span>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', marginBottom: 14, lineHeight: 1.2 }}>
              {scanId ? 'Unlock your full scan results' : 'Start protecting your business today'}
            </h2>
            <p style={{ color: '#8892a4', fontSize: 15, lineHeight: 1.65 }}>
              {scanId
                ? 'Your free scan is ready. Create an account to see the full report, dark web data, and remediation steps.'
                : 'Everything you need to understand and improve your cyber security posture.'}
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
          <div style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={16} color="#00ff88" strokeWidth={2} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#00ff88', fontWeight: 500 }}>Free forever — no credit card required</span>
          </div>
        </div>
      </div>

      {/* ─── Right form panel ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1e', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Shield size={18} color="#00d4ff" strokeWidth={1.5} />
              <span style={{ fontSize: 18, fontWeight: 700, color: '#00d4ff' }}>CyberPulse</span>
            </div>
            <p style={{ color: '#8892a4', fontSize: 15 }}>Create your free account</p>

            {scanId && (
              <div style={{ marginTop: 10, background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', color: '#00ff88', padding: '8px 14px', borderRadius: 8, fontSize: 13 }}>
                Your scan results will be linked to this account
              </div>
            )}
          </div>

          <div style={{ background: '#0f1729', border: '1px solid #1a2540', borderRadius: 14, padding: 28 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && (
                <div style={{ background: '#2d0f1a', border: '1px solid rgba(255,51,102,0.2)', color: '#ff3366', padding: '11px 14px', borderRadius: 8, fontSize: 13 }}>
                  {error}
                </div>
              )}

              {[
                { key: 'name',     label: 'Full Name',       type: 'text',     placeholder: 'Jane Smith',              required: true },
                { key: 'email',    label: 'Work Email',      type: 'email',    placeholder: 'jane@company.co.za',       required: true },
                { key: 'password', label: 'Password',        type: 'password', placeholder: 'Minimum 8 characters',     required: true },
                { key: 'company',  label: 'Company Name',    type: 'text',     placeholder: 'Acme Pty Ltd',             required: false },
                { key: 'domain',   label: 'Business Domain', type: 'text',     placeholder: prefillDomain || 'yourbusiness.co.za', required: false },
              ].map(({ key, label, type, placeholder, required }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: '#8892a4' }}>
                    {label}{required && <span style={{ color: '#ff3366', marginLeft: 2 }}>*</span>}
                  </label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => update(key, e.target.value)}
                    required={required}
                    className="auth-input"
                    style={{ width: '100%', padding: '11px 14px', background: '#141d30', border: '1px solid #1a2540', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px', background: '#00d4ff', color: '#0a0f1e',
                  fontWeight: 700, fontSize: 15, borderRadius: 8, border: 'none',
                  cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginTop: 4,
                }}
              >
                {loading ? 'Creating account...' : (<>Create Free Account <ArrowRight size={15} strokeWidth={2.5} /></>)}
              </button>

              <p style={{ fontSize: 11, color: '#3d4f6b', textAlign: 'center', marginTop: 4 }}>
                By creating an account you agree to our{' '}
                <a href="#" style={{ color: '#8892a4', textDecoration: 'none' }}>Terms</a>
                {' '}and{' '}
                <a href="#" style={{ color: '#8892a4', textDecoration: 'none' }}>Privacy Policy</a>
              </p>
            </form>

            <p style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: '#8892a4' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
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
