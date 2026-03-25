import Link from 'next/link';
import { Shield } from 'lucide-react';

const bg     = '#f0f4f8';
const bgCard = '#ffffff';
const text   = '#0f172a';
const textMuted = '#64748b';
const textFaint = '#94a3b8';
const border   = '#dde3ec';
const cyan   = '#0ea5e9';

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }
        a { color: inherit; text-decoration: none; }
        p, li { line-height: 1.75; }
        h1, h2, h3, h4 { line-height: 1.25; }
      `}</style>

      {/* Top nav */}
      <nav style={{ background: bgCard, borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(14,165,233,.1)', border: '1.5px solid rgba(14,165,233,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={13} color={cyan} strokeWidth={1.5} />
            </div>
            <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: text }}>CyberPulse</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/scan" className="mono" style={{ fontSize: 11, fontWeight: 600, color: textMuted, letterSpacing: '.5px' }}>FREE SCAN</Link>
            <Link href="/login" className="mono" style={{ fontSize: 11, fontWeight: 600, color: textMuted, letterSpacing: '.5px' }}>SIGN IN</Link>
            <Link href="/register" className="mono" style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: cyan, padding: '7px 16px', borderRadius: 6, letterSpacing: '.5px' }}>GET STARTED /&gt;</Link>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main>{children}</main>

      {/* Footer */}
      <footer style={{ background: bgCard, borderTop: `1px solid ${border}`, padding: '40px 24px 32px', marginTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '32px 24px', marginBottom: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                <Shield size={13} color={cyan} strokeWidth={1.5} />
                <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: text }}>CyberPulse</span>
              </div>
              <p style={{ fontSize: 12, color: textFaint, lineHeight: 1.6 }}>Cyber posture intelligence for South African businesses.</p>
            </div>
            <div>
              <p className="mono" style={{ fontSize: 10, fontWeight: 700, color: textFaint, letterSpacing: 1.5, marginBottom: 12 }}>PRODUCT</p>
              {[
                { href: '/free-scanner',       label: 'Free Scanner' },
                { href: '/full-report',         label: 'Full Report' },
                { href: '/dark-web-monitor',    label: 'Dark Web Monitor' },
                { href: '/insurance-readiness', label: 'Insurance Readiness' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{ display: 'block', fontSize: 13, color: textMuted, marginBottom: 8 }}>{label}</Link>
              ))}
            </div>
            <div>
              <p className="mono" style={{ fontSize: 10, fontWeight: 700, color: textFaint, letterSpacing: 1.5, marginBottom: 12 }}>LEGAL</p>
              {[
                { href: '/privacy-policy', label: 'Privacy Policy' },
                { href: '/terms',          label: 'Terms of Service' },
                { href: '/popia',          label: 'POPIA' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{ display: 'block', fontSize: 13, color: textMuted, marginBottom: 8 }}>{label}</Link>
              ))}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${border}`, paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <p className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: '.5px' }}>
              {'//'} &copy; {new Date().getFullYear()} CYBERPULSE (PTY) LTD &mdash; CAPE TOWN, SOUTH AFRICA
            </p>
            <p className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: '.5px' }}>POPIA COMPLIANT /&gt;</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
