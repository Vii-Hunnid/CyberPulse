import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Providers } from '@/app/providers';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0f1e' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: '#0f1729', borderRight: '1px solid #1a2540' }}>
        <div className="p-6">
          <h1 className="text-xl font-bold" style={{ color: '#00d4ff' }}>CyberPulse</h1>
          <p className="text-xs mt-1" style={{ color: '#8892a4' }}>Posture Intelligence</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { href: '/dashboard', label: 'Overview', icon: '◈' },
            { href: '/dashboard/underwriting', label: 'Insurance', icon: '⬡' },
            { href: '/dashboard/darkweb', label: 'Dark Web', icon: '◎' },
          ].map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors hover:text-white"
              style={{ color: '#8892a4' }}
            >
              <span style={{ color: '#00d4ff' }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid #1a2540' }}>
          <p className="text-xs" style={{ color: '#8892a4' }}>
            {session.user.email}
          </p>
          <Link href="/api/auth/signout" className="text-xs mt-1 block hover:underline" style={{ color: '#ff6b35' }}>
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Providers>{children}</Providers>
      </main>
    </div>
  );
}
