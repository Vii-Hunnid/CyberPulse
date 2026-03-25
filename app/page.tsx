import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Mail, Lock, Shield, EyeOff, Radio, Bug,
  CheckCircle2, ArrowRight, Zap, TrendingUp, Users,
} from 'lucide-react';

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
  { Icon: Mail,   title: 'Email Security',           desc: 'SPF, DKIM, and DMARC protection against email spoofing and phishing attacks' },
  { Icon: Lock,   title: 'SSL Certificate Health',   desc: 'Certificate validity, expiry warnings, and TLS version compliance' },
  { Icon: Shield, title: 'Website Security Headers', desc: 'CSP, HSTS, X-Frame-Options, and all critical HTTP security headers' },
  { Icon: EyeOff, title: 'Dark Web Exposure',        desc: 'Known breach data and credential dumps linked to your domain' },
  { Icon: Radio,  title: 'Open Port Risks',          desc: 'Dangerously exposed services including RDP, Telnet, and databases' },
  { Icon: Bug,    title: 'Known Vulnerabilities',    desc: 'CVE database lookup against detected software versions and services' },
];

const STATS = [
  {
    stat: '72%',
    label: 'of SA SMEs have never had a cyber health check',
    source: 'CSIR Cybersecurity Report 2023',
    Icon: Users,
  },
  {
    stat: '10%',
    label: "of Africa's GDP is lost annually to cyber attacks",
    source: 'Interpol African Cyberthreat Assessment',
    Icon: TrendingUp,
  },
  {
    stat: 'R50k+',
    label: 'average cost of a single SME cyber incident in SA',
    source: 'Allianz Risk Barometer 2024',
    Icon: Zap,
  },
];

const FULL_REPORT_ITEMS = [
  'Detailed findings with step-by-step remediation guides',
  'Dark web breach analysis — exposed emails and credentials',
  'AI-generated insurance readiness score and grade',
  'Downloadable PDF attestation for cyber insurance applications',
  'Continuous monitoring with real-time threat alerts',
];

export default function HomePage() {
  return (
    <div style={{ background: '#0a0f1e', color: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        .animated-grid {
          background-image:
            linear-gradient(rgba(0,212,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.035) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: gridMove 10s linear infinite;
        }
        .check-card { transition: all 0.2s ease; }
        .check-card:hover { box-shadow: 0 4px 32px rgba(0,212,255,0.12); transform: translateY(-3px); border-color: rgba(0,212,255,0.3) !important; }
        .nav-link { transition: color 0.15s; }
        .nav-link:hover { color: #00d4ff !important; }
        .cta-btn-primary:hover { background: #00b8d9 !important; }
        .cta-btn-outline:hover { background: rgba(0,212,255,0.08) !important; color: #fff !important; }
        .scan-input:focus { border-color: rgba(0,212,255,0.5) !important; outline: none; box-shadow: 0 0 0 3px rgba(0,212,255,0.08); }
      `}</style>

      {/* ─── Navigation ─────────────────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', background: 'rgba(10,15,30,0.85)', borderBottom: '1px solid rgba(26,37,64,0.8)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #0a0f1e, #00d4ff22)', border: '1.5px solid #00d4ff55', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={14} color="#00d4ff" strokeWidth={2} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#00d4ff', letterSpacing: '-0.3px' }}>CyberPulse</span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login" className="nav-link" style={{ padding: '8px 16px', color: '#8892a4', fontSize: 14, fontWeight: 500, textDecoration: 'none', borderRadius: 6 }}>
              Sign In
            </Link>
            <Link href="/register" style={{
              padding: '8px 18px', background: '#00d4ff', color: '#0a0f1e',
              fontSize: 14, fontWeight: 700, borderRadius: 6, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              Get Started Free
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="animated-grid" style={{ padding: '88px 24px 96px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', animation: 'pulse-ring 2s ease-in-out infinite' }} />
            <span style={{ color: '#00d4ff', fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>Free Instant Scan — No Account Required</span>
          </div>

          <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 60px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 22, letterSpacing: '-0.5px' }}>
            Know Your Cyber Risk{' '}
            <span style={{ background: 'linear-gradient(90deg, #00d4ff, #00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Before Attackers Do
            </span>
          </h1>
          <p style={{ fontSize: 18, color: '#8892a4', marginBottom: 44, lineHeight: 1.65, maxWidth: 560, margin: '0 auto 44px' }}>
            Instant security scan for your business domain. Six critical checks.
            Results in under 60 seconds.
          </p>

          {/* Scan form */}
          <form action="/scan" method="GET" style={{ display: 'flex', gap: 10, maxWidth: 580, margin: '0 auto 18px' }}>
            <input
              name="domain"
              type="text"
              placeholder="yourbusiness.co.za"
              className="scan-input"
              style={{
                flex: 1, padding: '15px 20px',
                background: 'rgba(15,23,41,0.9)',
                border: '1px solid #1a2540', borderRadius: 8,
                color: '#fff', fontSize: 15, transition: 'all 0.2s',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '15px 26px', background: '#00d4ff', color: '#0a0f1e',
                fontWeight: 700, fontSize: 15, borderRadius: 8, border: 'none',
                cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '-0.2px',
              }}
            >
              Scan Free →
            </button>
          </form>

          {/* Trust row */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['No installation', 'POPIA compliant', 'SCCA encrypted', 'Private results'].map((t) => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#3d4f6b', fontSize: 12 }}>
                <CheckCircle2 size={12} color="#3d4f6b" strokeWidth={2} /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Thin separator ─────────────────────────────────────────────────── */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #1a2540 30%, #1a2540 70%, transparent)' }} />

      {/* ─── What We Check ────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ color: '#00d4ff', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>What We Scan</div>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.3px' }}>Six Critical Security Categories</h2>
          <p style={{ color: '#8892a4', marginTop: 12, fontSize: 16 }}>Every check runs automatically — no configuration needed</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {CHECK_CARDS.map(({ Icon, title, desc }, i) => (
            <div key={title} className="check-card"
              style={{ background: '#0f1729', border: '1px solid #1a2540', borderRadius: 12, padding: '28px 28px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color="#00d4ff" strokeWidth={1.5} />
                </div>
                <span style={{ fontSize: 11, color: '#3d4f6b', fontWeight: 600 }}>CHECK {String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: '#8892a4', fontSize: 14, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Sample Report Preview ────────────────────────────────────────── */}
      <section style={{ padding: '88px 24px', background: 'linear-gradient(180deg, #0a0f1e 0%, #080d1a 100%)', borderTop: '1px solid #0f1729', borderBottom: '1px solid #0f1729' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ color: '#00d4ff', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Live Preview</div>
            <h2 style={{ fontSize: 36, fontWeight: 700 }}>See What Your Report Looks Like</h2>
            <p style={{ color: '#8892a4', marginTop: 12 }}>Real findings, real scores — for your actual domain</p>
          </div>

          <div style={{ background: '#0f1729', borderRadius: 16, border: '1px solid #1a2540', overflow: 'hidden' }}>
            {/* Report header */}
            <div style={{ background: '#0a0f1e', padding: '20px 28px', borderBottom: '1px solid #1a2540', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid #ff3366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#ff3366', lineHeight: 1 }}>42</div>
                    <div style={{ fontSize: 9, color: '#8892a4' }}>/ 100</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>example-business.co.za</div>
                  <div style={{ display: 'inline-block', background: '#ff3366', color: '#fff', fontWeight: 700, fontSize: 12, padding: '2px 10px', borderRadius: 4, marginTop: 4 }}>Grade D</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#3d4f6b' }}>25 Mar 2026</div>
            </div>

            {/* Findings */}
            <div style={{ padding: '20px 28px' }}>
              {[
                { sev: 'CRITICAL', color: '#ff3366', title: 'No DMARC policy — email spoofing is possible' },
                { sev: 'HIGH',     color: '#ff6b35', title: 'TLS 1.0 still enabled on web server' },
                { sev: 'MEDIUM',   color: '#f5c518', title: 'Content-Security-Policy header missing' },
              ].map((f) => (
                <div key={f.title} style={{ background: '#141d30', borderRadius: 8, padding: '13px 16px', marginBottom: 8, borderLeft: `3px solid ${f.color}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, background: f.color, color: '#fff', padding: '2px 8px', borderRadius: 3, flexShrink: 0 }}>{f.sev}</span>
                  <span style={{ fontSize: 14, color: '#e2e8f0' }}>{f.title}</span>
                </div>
              ))}

              {/* Locked overlay */}
              <div style={{ position: 'relative', marginTop: 12, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ filter: 'blur(5px)', opacity: 0.35 }}>
                  {[0,1,2].map(i => <div key={i} style={{ height: 44, background: '#141d30', borderRadius: 8, marginBottom: 8 }} />)}
                </div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,15,30,0.88)', borderRadius: 10, gap: 10 }}>
                  <Lock size={22} color="#00d4ff" strokeWidth={1.5} />
                  <p style={{ fontSize: 13, color: '#c8d0dd', textAlign: 'center', margin: 0 }}>
                    Full report with dark web analysis,<br />insurance score, and fix guides
                  </p>
                  <Link href="/register" style={{ background: '#00d4ff', color: '#0a0f1e', fontWeight: 700, padding: '9px 22px', borderRadius: 6, textDecoration: 'none', fontSize: 13 }}>
                    Unlock Free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ color: '#00d4ff', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>The Reality</div>
          <h2 style={{ fontSize: 36, fontWeight: 700 }}>Why SA Businesses Can&apos;t Wait</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {STATS.map(({ stat, label, source, Icon }) => (
            <div key={stat} style={{ background: '#0f1729', border: '1px solid #1a2540', borderRadius: 14, padding: '36px 32px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Icon size={22} color="#00d4ff" strokeWidth={1.5} />
              </div>
              <div style={{ fontSize: 52, fontWeight: 800, color: '#00d4ff', marginBottom: 14, letterSpacing: '-1px' }}>{stat}</div>
              <p style={{ fontSize: 15, marginBottom: 14, lineHeight: 1.55, color: '#c8d0dd' }}>{label}</p>
              <p style={{ fontSize: 11, color: '#3d4f6b' }}>— {source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 24px', background: 'rgba(15,23,41,0.5)', borderTop: '1px solid #0f1729', borderBottom: '1px solid #0f1729' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ color: '#00d4ff', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>How It Works</div>
            <h2 style={{ fontSize: 36, fontWeight: 700 }}>Three Steps to Security Clarity</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, position: 'relative' }}>
            {[
              { num: '01', title: 'Enter your domain', desc: 'No sign-up. No installation. Just type your business website address.' },
              { num: '02', title: 'We run 6 checks', desc: 'Email, SSL, headers, dark web, ports, and known vulnerabilities.' },
              { num: '03', title: 'Get your free report', desc: 'Score, grade, top findings, and insurance readiness — instantly.' },
            ].map((step, i) => (
              <div key={step.num} style={{ textAlign: 'center', position: 'relative', padding: '0 16px' }}>
                {i < 2 && (
                  <div style={{ position: 'absolute', top: 22, left: '62%', width: '38%', height: 1, background: 'linear-gradient(90deg, #1a2540, transparent)' }} />
                )}
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#0f1729', border: '2px solid #1a2540', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#00d4ff' }}>{step.num}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#8892a4', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Full Report CTA ──────────────────────────────────────────────── */}
      <section style={{ padding: '88px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f1729, #0a1628)', borderRadius: 20, border: '1px solid #1a2540', padding: '56px 48px', display: 'flex', gap: 56, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px' }}>
            <div style={{ color: '#00d4ff', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Free Account</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
              Your Full Report Includes Everything
            </h2>
            <p style={{ color: '#8892a4', fontSize: 16, lineHeight: 1.65 }}>
              The free scan gives you a taste. Create your free account to unlock the complete picture.
            </p>
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28 }}>
              {FULL_REPORT_ITEMS.map((item) => (
                <li key={item} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                  <CheckCircle2 size={16} color="#00ff88" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: '#c8d0dd', fontSize: 14, lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', background: '#00d4ff', color: '#0a0f1e',
              fontWeight: 700, borderRadius: 8, textDecoration: 'none', fontSize: 15,
            }}>
              Create Free Account <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #0f1729', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 48, justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 40 }}>
            <div style={{ flex: '0 0 220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Shield size={16} color="#00d4ff" strokeWidth={1.5} />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#00d4ff' }}>CyberPulse</span>
              </div>
              <p style={{ color: '#3d4f6b', fontSize: 13, lineHeight: 1.6 }}>Securing African business, one domain at a time.</p>
            </div>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#8892a4', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Product</div>
                {['Free Scanner', 'Full Report', 'Dark Web Monitor', 'Insurance Readiness'].map((l) => (
                  <a key={l} href="#" style={{ display: 'block', color: '#3d4f6b', fontSize: 13, marginBottom: 10, textDecoration: 'none' }}>{l}</a>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#8892a4', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Legal</div>
                {['Privacy Policy', 'Terms of Service', 'POPIA Compliance'].map((l) => (
                  <a key={l} href="#" style={{ display: 'block', color: '#3d4f6b', fontSize: 13, marginBottom: 10, textDecoration: 'none' }}>{l}</a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #0f1729', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: '#3d4f6b', fontSize: 12 }}>© 2026 CyberPulse. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Secured by SCCA Protocol', 'POPIA Compliant'].map((t) => (
                <span key={t} style={{ fontSize: 11, color: '#3d4f6b', border: '1px solid #0f1729', padding: '3px 10px', borderRadius: 20 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
