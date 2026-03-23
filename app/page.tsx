import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CyberPulse — Free Cyber Security Scanner for SA Businesses',
  description:
    'Instantly scan your business domain for security vulnerabilities, dark web breaches, and insurance readiness. Free. No account required.',
  openGraph: {
    title: 'CyberPulse — Free Cyber Security Scanner',
    description: 'Instantly scan your business domain. Free. No account required.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

const CHECK_CARDS = [
  { icon: '✉', title: 'Email Security', desc: 'SPF, DKIM, and DMARC protection against spoofing' },
  { icon: '🔒', title: 'SSL Certificate Health', desc: 'Certificate validity, expiry, and TLS version checks' },
  { icon: '🛡', title: 'Website Security Headers', desc: 'CSP, HSTS, X-Frame-Options, and more' },
  { icon: '🌑', title: 'Dark Web Exposure', desc: 'Known breach data linked to your domain' },
  { icon: '⚡', title: 'Open Port Risks', desc: 'Dangerously exposed services like RDP, Telnet, databases' },
  { icon: '🔍', title: 'Known Vulnerabilities', desc: 'CVE database lookup for detected software versions' },
];

const STATS = [
  {
    stat: '72%',
    label: "of SA SMEs have never had a cyber health check",
    source: 'Source: CSIR Cybersecurity Report 2023',
  },
  {
    stat: '10%',
    label: "of Africa's GDP is lost annually to cyber attacks",
    source: 'Source: Interpol African Cyberthreat Assessment',
  },
  {
    stat: 'R50,000+',
    label: 'average cost of a single SME cyber incident in SA',
    source: 'Source: Allianz Risk Barometer 2024',
  },
];

export default function HomePage() {
  return (
    <div style={{ background: '#0a0f1e', color: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        .animated-grid {
          background-image:
            linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: gridMove 8s linear infinite;
        }
        .check-card:hover { box-shadow: 0 0 24px rgba(0,212,255,0.15); transform: translateY(-2px); transition: all 0.2s; }
      `}</style>

      {/* Hero */}
      <section className="animated-grid relative" style={{ padding: '80px 24px 100px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ color: '#00d4ff', fontSize: 14, fontWeight: 600, letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>
            Free Cyber Security Scanner
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            Know Your Cyber Risk{' '}
            <span style={{ color: '#00d4ff' }}>Before Attackers Do</span>
          </h1>
          <p style={{ fontSize: 18, color: '#8892a4', marginBottom: 40, lineHeight: 1.6 }}>
            Free instant security scan for your business. No account required. Results in under 60 seconds.
          </p>

          <form action="/scan" method="GET" style={{ display: 'flex', gap: 12, maxWidth: 560, margin: '0 auto 16px' }}>
            <input
              name="domain"
              type="text"
              placeholder="Enter your business domain e.g. yourbusiness.co.za"
              style={{
                flex: 1, padding: '16px 20px', background: '#0f1729',
                border: '1px solid #1a2540', borderRadius: 8, color: '#fff', fontSize: 15, outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '16px 24px', background: '#00d4ff', color: '#0a0f1e',
                fontWeight: 700, fontSize: 15, borderRadius: 8, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Scan My Business — Free
            </button>
          </form>

          <p style={{ fontSize: 12, color: '#3d4f6b' }}>
            No installation required &nbsp;·&nbsp; POPIA compliant &nbsp;·&nbsp;
            Encrypted with SCCA Protocol &nbsp;·&nbsp; Results stay private
          </p>
        </div>
      </section>

      {/* What We Check */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>What We Check</h2>
        <p style={{ textAlign: 'center', color: '#8892a4', marginBottom: 48, fontSize: 16 }}>
          Six critical security categories scanned instantly
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {CHECK_CARDS.map((card) => (
            <div key={card.title} className="check-card"
              style={{ background: '#0f1729', border: '1px solid #1a2540', borderRadius: 12, padding: 28, cursor: 'default' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{card.title}</h3>
              <p style={{ color: '#8892a4', fontSize: 14, lineHeight: 1.6 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Report Preview */}
      <section style={{ padding: '80px 24px', background: '#0a0f2a' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
            See What Your Report Looks Like
          </h2>
          <p style={{ textAlign: 'center', color: '#8892a4', marginBottom: 48 }}>
            Real findings, real scores — for your actual domain
          </p>
          <div style={{ background: '#0f1729', borderRadius: 16, padding: 32, border: '1px solid #1a2540' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
              <div style={{ width: 96, height: 96, borderRadius: '50%', border: '4px solid #ff3366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#ff3366' }}>42</div>
                  <div style={{ fontSize: 11, color: '#8892a4' }}>/ 100</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>example-business.co.za</div>
                <div style={{ display: 'inline-block', background: '#ff3366', color: '#fff', fontWeight: 700, fontSize: 20, padding: '4px 16px', borderRadius: 4, marginTop: 8 }}>Grade D</div>
              </div>
            </div>
            {[
              { sev: 'CRITICAL', color: '#ff3366', title: 'No DMARC policy detected' },
              { sev: 'HIGH', color: '#ff6b35', title: 'TLS 1.0 enabled on web server' },
              { sev: 'MEDIUM', color: '#f5c518', title: 'Missing Content-Security-Policy header' },
            ].map((f) => (
              <div key={f.title} style={{ background: '#141d30', borderRadius: 8, padding: '14px 16px', marginBottom: 10, borderLeft: `4px solid ${f.color}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, background: f.color, color: '#fff', padding: '2px 8px', borderRadius: 3 }}>{f.sev}</span>
                <span style={{ marginLeft: 12, fontSize: 14, fontWeight: 500 }}>{f.title}</span>
              </div>
            ))}
            <div style={{ position: 'relative', marginTop: 16, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ filter: 'blur(4px)', opacity: 0.4, padding: 16, background: '#141d30', borderRadius: 8 }}>
                <div style={{ height: 48, background: '#1a2540', borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 48, background: '#1a2540', borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 48, background: '#1a2540', borderRadius: 4 }} />
              </div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,15,30,0.85)', borderRadius: 8 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
                <p style={{ fontSize: 14, color: '#fff', marginBottom: 16, textAlign: 'center' }}>
                  Create a free account to unlock full report,<br />dark web analysis, and insurance readiness score
                </p>
                <Link href="/register" style={{ background: '#00d4ff', color: '#0a0f1e', fontWeight: 700, padding: '10px 24px', borderRadius: 6, textDecoration: 'none' }}>
                  Get Full Report Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 48 }}>
          Why SA Businesses Use CyberPulse
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {STATS.map((s) => (
            <div key={s.stat} style={{ background: '#0f1729', border: '1px solid #1a2540', borderRadius: 12, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#00d4ff', marginBottom: 12 }}>{s.stat}</div>
              <p style={{ fontSize: 15, marginBottom: 12, lineHeight: 1.5 }}>{s.label}</p>
              <p style={{ fontSize: 11, color: '#3d4f6b' }}>{s.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 24px', background: '#0a0f2a' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 48 }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'center' }}>
            {[
              { num: '1', title: 'Enter your domain', desc: 'No sign-up required. Just type your business website.' },
              { num: '2', title: 'We scan 6 categories', desc: 'Email security, SSL, headers, dark web, ports, and CVEs.' },
              { num: '3', title: 'Get your free report', desc: 'Score, grade, top findings, and insurance readiness — instantly.' },
            ].map((step, i) => (
              <div key={step.num} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#0f1729', border: '2px solid #00d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22, fontWeight: 700, color: '#00d4ff' }}>
                  {step.num}
                </div>
                {i < 2 && (
                  <div style={{ position: 'absolute', top: 28, left: '60%', width: '40%', height: 2, background: 'linear-gradient(90deg, #00d4ff, transparent)' }} />
                )}
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: '#8892a4', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '48px 24px', borderTop: '1px solid #1a2540', textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#00d4ff', marginBottom: 6 }}>CyberPulse</div>
        <p style={{ color: '#8892a4', fontSize: 13, marginBottom: 16 }}>Securing African Business, One Domain at a Time</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 16 }}>
          {['Privacy Policy', 'Terms of Service', 'Contact'].map((l) => (
            <a key={l} href="#" style={{ color: '#8892a4', fontSize: 13, textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: '#3d4f6b', border: '1px solid #1a2540', padding: '4px 12px', borderRadius: 20 }}>Secured by SCCA Protocol</span>
          <span style={{ fontSize: 11, color: '#3d4f6b', border: '1px solid #1a2540', padding: '4px 12px', borderRadius: 20 }}>POPIA Compliant</span>
        </div>
      </footer>
    </div>
  );
}
