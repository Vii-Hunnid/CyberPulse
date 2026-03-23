'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

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
      setError(data.error ?? 'Registration failed');
      setLoading(false);
      return;
    }

    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: '#0a0f1e' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#00d4ff' }}>CyberPulse</h1>
          <p className="mt-2" style={{ color: '#8892a4' }}>Create your free account</p>
          {scanId && (
            <div className="mt-3 rounded px-4 py-2 text-sm" style={{ background: '#0d2e1a', color: '#00ff88', border: '1px solid #00ff8833' }}>
              Your free scan results will be linked to this account
            </div>
          )}
        </div>

        <div className="rounded-lg p-8" style={{ background: '#0f1729', border: '1px solid #1a2540' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded p-3 text-sm" style={{ background: '#2d0f1a', color: '#ff3366', border: '1px solid #ff336633' }}>
                {error}
              </div>
            )}

            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Smith' },
              { key: 'email', label: 'Work Email', type: 'email', placeholder: 'john@company.co.za' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '8+ characters' },
              { key: 'company', label: 'Company Name', type: 'text', placeholder: 'Acme Pty Ltd' },
              { key: 'domain', label: 'Business Domain', type: 'text', placeholder: prefillDomain || 'yourbusiness.co.za' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1" style={{ color: '#8892a4' }}>{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => update(key, e.target.value)}
                  required={key !== 'company' && key !== 'domain'}
                  className="w-full rounded px-4 py-3 text-white outline-none"
                  style={{ background: '#141d30', border: '1px solid #1a2540' }}
                  placeholder={placeholder}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded font-semibold mt-2 transition-opacity"
              style={{ background: '#00d4ff', color: '#0a0f1e', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#8892a4' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#00d4ff' }} className="hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
