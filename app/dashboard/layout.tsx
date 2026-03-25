import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, LogOut } from 'lucide-react';
import { Providers } from '@/app/providers';
import { NavLinks } from './nav-links';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0f1e', fontFamily: 'system-ui, sans-serif' }}>

      {/* ─── Sidebar ────────────────────────────────────────────────────── */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#0c1222',
        borderRight: '1px solid #1a2540',
      }}>

        {/* Brand */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1a2540' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(0,212,255,0.08)', border: '1.5px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={14} color="#00d4ff" strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#00d4ff', lineHeight: 1.2 }}>CyberPulse</div>
              <div style={{ fontSize: 10, color: '#3d4f6b', lineHeight: 1 }}>Posture Intelligence</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <NavLinks />

        {/* User info */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1a2540' }}>
          <div style={{ fontSize: 11, color: '#3d4f6b', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session.user.email}
          </div>
          <Link
            href="/api/auth/signout"
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ff6b35', fontSize: 12, textDecoration: 'none' }}
          >
            <LogOut size={12} strokeWidth={1.5} />
            Sign out
          </Link>
        </div>
      </aside>

      {/* ─── Main content ─────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Providers>{children}</Providers>
      </main>
    </div>
  );
}
