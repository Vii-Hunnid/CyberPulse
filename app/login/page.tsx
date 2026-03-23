'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#00d4ff' }}>CyberPulse</h1>
          <p className="mt-2" style={{ color: '#8892a4' }}>Sign in to your account</p>
        </div>

        <div className="rounded-lg p-8" style={{ background: '#0f1729', border: '1px solid #1a2540' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded p-3 text-sm" style={{ background: '#2d0f1a', color: '#ff3366', border: '1px solid #ff336633' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#8892a4' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded px-4 py-3 text-white outline-none focus:ring-1"
                style={{ background: '#141d30', border: '1px solid #1a2540' }}
                placeholder="you@company.co.za"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#8892a4' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded px-4 py-3 text-white outline-none"
                style={{ background: '#141d30', border: '1px solid #1a2540' }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded font-semibold transition-opacity"
              style={{ background: '#00d4ff', color: '#0a0f1e', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#8892a4' }}>
            No account?{' '}
            <Link href="/register" style={{ color: '#00d4ff' }} className="hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
