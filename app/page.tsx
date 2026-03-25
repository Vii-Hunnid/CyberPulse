import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Mail, Lock, Shield, EyeOff, Radio, Bug,
  CheckCircle2, ArrowRight, BarChart2, Globe, ShieldCheck,
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
  { Icon: Mail,   n: '01', title: 'Email Security',           desc: 'SPF, DKIM, and DMARC records — protect against spoofing and phishing' },
  { Icon: Lock,   n: '02', title: 'SSL Certificate Health',   desc: 'Certificate validity, expiry date, and TLS protocol version compliance' },
  { Icon: Shield, n: '03', title: 'Website Security Headers', desc: 'CSP, HSTS, X-Frame-Options, Referrer-Policy, and Permissions-Policy' },
  { Icon: EyeOff, n: '04', title: 'Dark Web Exposure',        desc: 'Known credential dumps and breach data linked to your business domain' },
  { Icon: Radio,  n: '05', title: 'Open Port Risks',          desc: 'Dangerously exposed RDP, Telnet, MongoDB, Redis, and other services' },
  { Icon: Bug,    n: '06', title: 'Known Vulnerabilities',    desc: 'CVE database match against detected software versions on your stack' },
];

const STATS = [
  { stat: '72%',   label: 'of SA SMEs have never had a cyber health check',    source: 'CSIR Cybersecurity Report 2023',        Icon: Globe },
  { stat: '10%',   label: "of Africa's GDP lost to cyber attacks annually",    source: 'Interpol African Cyberthreat Assessment', Icon: BarChart2 },
  { stat: 'R50k+', label: 'average cost of a single SME cyber incident in SA', source: 'Allianz Risk Barometer 2024',            Icon: ShieldCheck },
];

// Shared colour tokens — all LIGHT
const bg     = '#f0f4f8';
const bgCard = '#ffffff';
const bgAlt  = '#e8edf3';
const text   = '#0f172a';
const textMid  = '#334155';
const textMuted = '#64748b';
const textFaint = '#94a3b8';
const border   = '#dde3ec';
const borderMid = '#c5cdd8';
const cyan   = '#0ea5e9';
const green  = '#10b981';
const red    = '#ef4444';

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: bg, color: text, minHeight: '100vh' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes gridPan { 0% { background-position: 0 0; } 100% { background-position: 60px 60px; } }
        @keyframes pulseGreen { 0%,100% { opacity:.7; transform:scale(1); } 50% { opacity:1; transform:scale(1.2); } }
        .hero-grid {
          background-image:
            linear-gradient(rgba(14,165,233,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,.06) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridPan 14s linear infinite;
        }
        .check-card { transition: box-shadow .2s, border-color .2s, transform .2s; }
        .check-card:hover { box-shadow: 0 6px 28px rgba(14,165,233,.12); border-color: #0ea5e9 !important; transform: translateY(-2px); }
        .nav-link:hover { color: #0ea5e9 !important; }
        .scan-input { transition: border-color .2s, box-shadow .2s; }
        .scan-input:focus { border-color: rgba(14,165,233,.5) !important; outline: none; box-shadow: 0 0 0 3px rgba(14,165,233,.1); }
        .mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }
        a { text-decoration: none; }
      `}</style>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <header style={{ background: bgCard, borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(14,165,233,.08)', border: `1.5px solid rgba(14,165,233,.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={14} color={cyan} strokeWidth={1.5} />
            </div>
            <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: text }}>CyberPulse</span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <a href="#features" className="nav-link mono" style={{ padding: '6px 14px', color: textMuted, fontSize: 11, letterSpacing: '.5px', transition: 'color .15s' }}>{'>'}_&nbsp;FEATURES</a>
            <a href="#how-it-works" className="nav-link mono" style={{ padding: '6px 14px', color: textMuted, fontSize: 11, letterSpacing: '.5px', transition: 'color .15s' }}>{'>'}_&nbsp;HOW IT WORKS</a>
            <Link href="/login" className="nav-link mono" style={{ padding: '6px 14px', color: textMuted, fontSize: 11, letterSpacing: '.5px', transition: 'color .15s' }}>{'>'}_&nbsp;SIGN IN</Link>
            <Link href="/register" className="mono" style={{ marginLeft: 6, padding: '8px 18px', background: cyan, color: '#fff', fontWeight: 700, fontSize: 11, borderRadius: 6, letterSpacing: '.5px' }}>
              GET STARTED /&gt;
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero (light slate) ────────────────────────────────────────────── */}
      <section className="hero-grid" style={{ background: bg, padding: '100px 24px 108px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(14,165,233,.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,.06)', border: `1px solid rgba(14,165,233,.18)`, borderRadius: 4, padding: '5px 14px', marginBottom: 28 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: green, animation: 'pulseGreen 2.5s ease-in-out infinite' }} />
            <span style={{ color: cyan, fontSize: 11, fontWeight: 600, letterSpacing: 1.5 }}>[ FREE INSTANT SECURITY SCAN ]</span>
          </div>

          <h1 style={{ fontSize: 'clamp(38px, 6vw, 66px)', fontWeight: 800, lineHeight: 1.06, color: text, marginBottom: 22, letterSpacing: '-2px' }}>
            Know your cyber risk<br />
            <span style={{ color: cyan }}>before attackers do.</span>
          </h1>
          <p style={{ fontSize: 18, color: textMuted, marginBottom: 48, lineHeight: 1.65, maxWidth: 540, margin: '0 auto 48px' }}>
            Instant security scan across six critical categories.
            No account, no software, no waiting. Your business grade in under 60 seconds.
          </p>

          <form action="/scan" method="GET" style={{ maxWidth: 580, margin: '0 auto 22px' }}>
            <div style={{ display: 'flex', gap: 0, background: bgCard, border: `1.5px solid ${border}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>
              <input
                name="domain"
                type="text"
                placeholder="// yourbusiness.co.za"
                className="scan-input mono"
                style={{ flex: 1, padding: '16px 20px', background: 'transparent', border: 'none', color: text, fontSize: 14 }}
              />
              <button type="submit" className="mono" style={{ padding: '16px 28px', background: cyan, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', letterSpacing: '.5px', flexShrink: 0, borderRadius: '0 8px 8px 0' }}>
                SCAN FREE /&gt;
              </button>
            </div>
          </form>

          <div className="mono" style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['// No installation', '// POPIA compliant', '// SCCA encrypted', '// Results private'].map((t) => (
              <span key={t} style={{ fontSize: 11, color: textFaint }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${borderMid} 30%, ${borderMid} 70%, transparent)` }} />

      {/* ── What We Scan ─────────────────────────────────────────────────── */}
      <section id="features" style={{ background: bgCard, padding: '96px 24px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 52 }}>
            <span className="mono" style={{ fontSize: 10, color: cyan, letterSpacing: 2, fontWeight: 700 }}>[ 001 ]</span>
            <div style={{ flex: 1, height: 1, background: border }} />
            <span className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 2 }}>WHAT WE SCAN</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
            <div style={{ paddingRight: 24 }}>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 18, color: text }}>
                Six critical categories.<br />
                <span style={{ color: cyan }}>Scanned instantly.</span>
              </h2>
              <p style={{ fontSize: 16, color: textMuted, lineHeight: 1.7, marginBottom: 32 }}>
                Every check runs automatically in parallel. No configuration, no plugins, no waiting. Just type your domain and get your results.
              </p>
              <Link href="/scan" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: text, color: '#f8fafc', fontWeight: 700, fontSize: 11, borderRadius: 7, letterSpacing: '.5px' }}>
                RUN YOUR FREE SCAN /&gt;
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {CHECK_CARDS.map(({ Icon, n, title, desc }) => (
                <div key={title} className="check-card" style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '18px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `rgba(14,165,233,.07)`, border: `1px solid rgba(14,165,233,.14)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={cyan} strokeWidth={1.5} />
                    </div>
                    <span className="mono" style={{ fontSize: 9, color: textFaint, letterSpacing: 1 }}>{n}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: text, marginBottom: 5 }}>{title}</div>
                  <div style={{ fontSize: 12, color: textMuted, lineHeight: 1.55 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The Problem / Stats ───────────────────────────────────────────── */}
      <section style={{ background: bg, padding: '96px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 52 }}>
            <span className="mono" style={{ fontSize: 10, color: red, letterSpacing: 2, fontWeight: 700 }}>[ 002 ]</span>
            <div style={{ flex: 1, height: 1, background: border }} />
            <span className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 2 }}>THE REALITY</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 18, color: text }}>
                SA businesses are the{' '}
                <span style={{ color: red }}>most targeted</span>{' '}
                in Africa.
              </h2>
              <p style={{ fontSize: 16, color: textMuted, lineHeight: 1.7 }}>
                Most small businesses don&apos;t know they&apos;re vulnerable until after the breach.
                CyberPulse gives you enterprise-grade visibility in seconds — completely free.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {STATS.map(({ stat, label, source, Icon }) => (
                <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: 18, background: bgCard, border: `1px solid ${border}`, borderRadius: 10, padding: '18px 22px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.03)' }}>
                  <div style={{ position: 'absolute', top: 7, left: 7, width: 7, height: 7, borderTop: `1.5px solid ${borderMid}`, borderLeft: `1.5px solid ${borderMid}` }} />
                  <div style={{ position: 'absolute', bottom: 7, right: 7, width: 7, height: 7, borderBottom: `1.5px solid ${borderMid}`, borderRight: `1.5px solid ${borderMid}` }} />
                  <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 9, background: 'rgba(14,165,233,.07)', border: `1px solid rgba(14,165,233,.14)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={cyan} strokeWidth={1.5} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="mono" style={{ fontSize: 26, fontWeight: 800, color: text, lineHeight: 1, marginBottom: 4 }}>{stat}</div>
                    <div style={{ fontSize: 13, color: textMid, marginBottom: 2 }}>{label}</div>
                    <div className="mono" style={{ fontSize: 10, color: textFaint }}>— {source}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sample Report Preview ─────────────────────────────────────────── */}
      <section style={{ background: bgCard, padding: '96px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 52 }}>
            <span className="mono" style={{ fontSize: 10, color: '#f59e0b', letterSpacing: 2, fontWeight: 700 }}>[ 003 ]</span>
            <div style={{ flex: 1, height: 1, background: border }} />
            <span className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 2 }}>LIVE PREVIEW</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 18, color: text }}>
                See exactly what<br />your report looks like.
              </h2>
              <p style={{ fontSize: 16, color: textMuted, lineHeight: 1.7, marginBottom: 28 }}>
                Real findings, real scores — for your actual domain. Create a free account to unlock dark web analysis, full remediation steps, and your insurance readiness PDF.
              </p>
              <Link href="/register" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: cyan, color: '#fff', fontWeight: 700, fontSize: 11, borderRadius: 7, letterSpacing: '.5px' }}>
                UNLOCK FULL REPORT /&gt;
              </Link>
            </div>

            <div style={{ background: bgCard, borderRadius: 12, border: `1px solid ${border}`, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,.08)' }}>
              {/* Report header bar */}
              <div style={{ background: '#0c1220', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', border: `3px solid ${red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,.08)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div className="mono" style={{ fontSize: 15, fontWeight: 800, color: red, lineHeight: 1 }}>42</div>
                      <div style={{ fontSize: 8, color: '#64748b' }}>/ 100</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc' }}>example-business.co.za</div>
                    <div className="mono" style={{ display: 'inline-block', background: red, color: '#fff', fontWeight: 700, fontSize: 9, padding: '2px 8px', borderRadius: 3, marginTop: 3, letterSpacing: 1 }}>GRADE D</div>
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 10, color: '#475569' }}>25 MAR 2026</span>
              </div>

              <div style={{ padding: '16px 20px', background: bgCard }}>
                {[
                  { sev: 'CRITICAL', color: red,      title: 'No DMARC policy — email spoofing is possible' },
                  { sev: 'HIGH',     color: '#f97316', title: 'TLS 1.0 still enabled on web server' },
                  { sev: 'MEDIUM',   color: '#f59e0b', title: 'Content-Security-Policy header missing' },
                ].map((f) => (
                  <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 7, marginBottom: 7, background: bg, border: `1px solid ${border}`, borderLeft: `3px solid ${f.color}` }}>
                    <span className="mono" style={{ fontSize: 9, fontWeight: 700, background: f.color, color: '#fff', padding: '2px 7px', borderRadius: 3, flexShrink: 0, letterSpacing: .5 }}>{f.sev}</span>
                    <span style={{ fontSize: 12, color: textMid }}>{f.title}</span>
                  </div>
                ))}

                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', marginTop: 8 }}>
                  <div style={{ filter: 'blur(4px)', opacity: .3 }}>
                    {[0,1,2].map(i => <div key={i} style={{ height: 36, background: bg, borderRadius: 6, marginBottom: 7 }} />)}
                  </div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(240,244,248,.92)', borderRadius: 8, gap: 8 }}>
                    <Lock size={18} color={textMuted} strokeWidth={1.5} />
                    <p style={{ fontSize: 12, color: textMuted, textAlign: 'center', margin: 0 }}>Full report with dark web + remediation steps</p>
                    <Link href="/register" className="mono" style={{ background: cyan, color: '#fff', fontWeight: 700, padding: '7px 16px', borderRadius: 5, fontSize: 10, letterSpacing: .5 }}>
                      UNLOCK FREE /&gt;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: bg, padding: '96px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 52 }}>
            <span className="mono" style={{ fontSize: 10, color: green, letterSpacing: 2, fontWeight: 700 }}>[ 004 ]</span>
            <div style={{ flex: 1, height: 1, background: border }} />
            <span className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 2 }}>HOW IT WORKS</span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', color: text }}>
              From domain to report<br /><span style={{ color: cyan }}>in three steps.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 36, left: '18%', right: '18%', height: 1, background: `linear-gradient(90deg, ${cyan}, ${border} 50%, ${cyan})`, opacity: .25 }} />
            {[
              { num: '01', title: 'Enter your domain', desc: 'No sign-up. No installation. Just type your business website address and hit scan.', col: cyan },
              { num: '02', title: 'We run 6 checks', desc: 'Email security, SSL health, security headers, dark web exposure, open ports, and CVE lookup — all in parallel.', col: '#f59e0b' },
              { num: '03', title: 'Get your report', desc: 'Security score, letter grade, top findings, AI narrative, and insurance readiness indicator — in under 60 seconds.', col: green },
            ].map((step) => (
              <div key={step.num} style={{ textAlign: 'center', padding: '0 28px' }}>
                <div className="mono" style={{ width: 56, height: 56, borderRadius: '50%', background: bgCard, border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 16, fontWeight: 800, color: step.col, position: 'relative', zIndex: 1, boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
                  {step.num}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: text, marginBottom: 10 }}>{step.title}</div>
                <div style={{ fontSize: 14, color: textMuted, lineHeight: 1.65 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Full Report CTA (slate with strong border accent) ──────────────── */}
      <section style={{ background: bgCard, padding: '96px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ background: bg, border: `1.5px solid ${borderMid}`, borderRadius: 16, padding: '56px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Corner bracket decorations */}
            <div style={{ position: 'absolute', top: 16, left: 16, width: 16, height: 16, borderTop: `2px solid ${cyan}`, borderLeft: `2px solid ${cyan}` }} />
            <div style={{ position: 'absolute', top: 16, right: 16, width: 16, height: 16, borderTop: `2px solid ${cyan}`, borderRight: `2px solid ${cyan}` }} />
            <div style={{ position: 'absolute', bottom: 16, left: 16, width: 16, height: 16, borderBottom: `2px solid ${cyan}`, borderLeft: `2px solid ${cyan}` }} />
            <div style={{ position: 'absolute', bottom: 16, right: 16, width: 16, height: 16, borderBottom: `2px solid ${cyan}`, borderRight: `2px solid ${cyan}` }} />

            <div>
              <div className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(14,165,233,.06)', border: `1px solid rgba(14,165,233,.18)`, borderRadius: 4, padding: '4px 12px', marginBottom: 20 }}>
                <span style={{ color: cyan, fontSize: 10, letterSpacing: 1.5 }}>[ FREE ACCOUNT ]</span>
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: text, marginBottom: 16, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                Your full report includes everything.
              </h2>
              <p style={{ fontSize: 16, color: textMuted, lineHeight: 1.7 }}>
                The free scan shows you the headline score. Create your free account to unlock the complete picture — at no cost.
              </p>
            </div>

            <div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28 }}>
                {[
                  'Detailed findings with step-by-step remediation guides',
                  'Dark web breach analysis — exposed emails and credentials',
                  'AI-generated insurance readiness score and grade',
                  'Downloadable PDF attestation for cyber insurance applications',
                  'Continuous monitoring with real-time threat alerts',
                  'Scan history and security trend tracking',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <CheckCircle2 size={14} color={green} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: textMid, lineHeight: 1.55 }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', background: cyan, color: '#fff', fontWeight: 700, fontSize: 12, borderRadius: 8, letterSpacing: '.5px' }}>
                CREATE FREE ACCOUNT /&gt; <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{ background: bg, borderTop: `1px solid ${border}`, padding: '52px 24px 28px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 56, justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 40 }}>
            <div style={{ flex: '0 0 220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Shield size={14} color={cyan} strokeWidth={1.5} />
                <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: text }}>CyberPulse</span>
              </div>
              <p style={{ color: textMuted, fontSize: 13, lineHeight: 1.65 }}>Securing African business,<br />one domain at a time.</p>
            </div>
            <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
              <div>
                <div className="mono" style={{ fontSize: 10, fontWeight: 600, color: textFaint, marginBottom: 16, letterSpacing: 1.5 }}>PRODUCT</div>
                {[
                  { label: 'Free Scanner',         href: '/free-scanner' },
                  { label: 'Full Report',           href: '/full-report' },
                  { label: 'Dark Web Monitor',      href: '/dark-web-monitor' },
                  { label: 'Insurance Readiness',   href: '/insurance-readiness' },
                ].map(({ label, href }) => (
                  <Link key={label} href={href} style={{ display: 'block', color: textMuted, fontSize: 13, marginBottom: 10 }}>{label}</Link>
                ))}
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10, fontWeight: 600, color: textFaint, marginBottom: 16, letterSpacing: 1.5 }}>LEGAL</div>
                {[
                  { label: 'Privacy Policy',   href: '/privacy-policy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'POPIA Compliance', href: '/popia' },
                ].map(({ label, href }) => (
                  <Link key={label} href={href} style={{ display: 'block', color: textMuted, fontSize: 13, marginBottom: 10 }}>{label}</Link>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${border}`, paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p className="mono" style={{ color: textFaint, fontSize: 11, letterSpacing: .5 }}>© 2026 CYBERPULSE. ALL RIGHTS RESERVED.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Secured by SCCA Protocol', 'POPIA Compliant'].map((t) => (
                <span key={t} className="mono" style={{ fontSize: 10, color: textFaint, border: `1px solid ${border}`, padding: '3px 10px', borderRadius: 3 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
