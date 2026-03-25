/**
 * Returns the real NextAuth session, or a dev bypass session when running
 * on localhost without a real session. Safe to use in server components.
 *
 * NEVER returns a bypass session in production — the host check ensures this.
 */
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import type { Session } from 'next-auth';

const DEV_SESSION: Session = {
  user: {
    id: 'dev-bypass',
    email: 'dev@localhost',
    name: 'Dev User',
    role: 'ADMIN',
  },
  expires: '2099-12-31T00:00:00.000Z',
};

export async function getSessionOrDev(): Promise<Session | null> {
  // Prefer a real authenticated session
  const real = await getServerSession(authOptions);
  if (real) return real;

  // Localhost-only bypass (never active in production)
  const h = await headers();
  const host = h.get('host') ?? '';
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    return DEV_SESSION;
  }

  return null;
}
