import { getSessionOrDev } from '@/lib/dev-session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, LogOut } from 'lucide-react';
import { Providers } from '@/app/providers';
import { NavLinks } from './nav-links';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionOrDev();
  if (!session) redirect('/login');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f0f4f8', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#0c1220',
        borderRight: '1px solid #1e2d45',
      }}>

        {/* Brand */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #1e2d45' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(14,165,233,.1)', border: '1.5px solid rgba(14,165,233,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={13} color="#00d4ff" strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', lineHeight: 1.2, fontFamily: 'ui-monospace, monospace' }}>CyberPulse</div>
              <div style={{ fontSize: 9, color: '#334155', lineHeight: 1, fontFamily: 'ui-monospace, monospace', letterSpacing: .5 }}>POSTURE INTEL</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <NavLinks />

        {/* User info */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid #1e2d45' }}>
          <div style={{ fontSize: 11, color: '#475569', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'ui-monospace, monospace' }}>
            {session.user.email}
          </div>
          <Link
            href="/api/auth/signout"
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: 12, textDecoration: 'none' }}
          >
            <LogOut size={11} strokeWidth={1.5} />
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: .5 }}>SIGN OUT</span>
          </Link>
        </div>
      </aside>

      {/* ─── Main ─────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Providers>{children}</Providers>
      </main>
    </div>
  );
}
