import type { Metadata } from 'next';
import Link from 'next/link';
import { Eye, AlertTriangle, Bell, Search, ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dark Web Monitor — CyberPulse',
  description: 'Continuously monitor your business email addresses and domain against dark web breach databases. Get alerted the moment your data appears.',
};

const bg     = '#f0f4f8';
const bgCard = '#ffffff';
const text   = '#0f172a';
const textMid  = '#334155';
const textMuted = '#64748b';
const textFaint = '#94a3b8';
const border   = '#dde3ec';
const cyan   = '#0ea5e9';
const red    = '#ef4444';
const green  = '#10b981';

const HOW = [
  {
    Icon: Search,
    title: 'Breach database matching',
    desc: 'We cross-reference your business email addresses and domain against Have I Been Pwned and multiple curated dark web intelligence feeds.',
  },
  {
    Icon: Bell,
    title: 'Real-time alerting',
    desc: 'The moment a new breach is published that includes any of your monitored addresses, you receive an immediate alert — not a weekly digest.',
  },
  {
    Icon: Eye,
    title: 'What data was exposed',
    desc: 'Each breach result shows you exactly what data was compromised — passwords, financial records, phone numbers, addresses — so you can act fast.',
  },
  {
    Icon: ShieldCheck,
    title: 'Remediation playbook',
    desc: 'For each critical breach, we provide a step-by-step remediation playbook: reset passwords, enable MFA, notify affected parties, update your insurer.',
  },
];

const WHY_MATTERS = [
  'Attackers often exploit breached credentials for months before you become aware.',
  'Over 80% of breaches involve weak or re-used passwords from prior leaks.',
  'Cyber insurers increasingly require evidence of dark web monitoring controls.',
  'POPIA requires you to notify affected parties within 72 hours of becoming aware of a breach.',
];

export default function DarkWebMonitorPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`.mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }`}</style>

      {/* Hero */}
      <section style={{ background: bgCard, borderBottom: `1px solid ${border}`, padding: '64px 24px 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 4, padding: '4px 14px', marginBottom: 20 }}>
            <span style={{ color: red, fontSize: 10, letterSpacing: 1.5 }}>[ DARK WEB INTELLIGENCE ]</span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: text, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Dark Web Monitor
          </h1>
          <p style={{ fontSize: 17, color: textMuted, marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }}>
            Know the moment your business credentials appear in a breach. Continuous monitoring against live dark web databases — no manual searching required.
          </p>
          <Link href="/register" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: cyan, color: '#fff', fontWeight: 700, fontSize: 13, padding: '14px 32px', borderRadius: 8, letterSpacing: '.5px', textDecoration: 'none' }}>
            START MONITORING <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: bg, padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 1.5, marginBottom: 8 }}>[ HOW IT WORKS ]</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: text }}>Always-on breach detection</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {HOW.map(({ Icon, title, desc }) => (
              <div key={title} style={{ background: bgCard, borderRadius: 12, padding: '24px 24px', border: `1px solid ${border}`, boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 9, background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={17} color={red} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section style={{ background: bgCard, padding: '72px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 1.5, marginBottom: 8 }}>[ WHY IT MATTERS ]</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: text }}>Breaches don&apos;t announce themselves</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {WHY_MATTERS.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, background: bg, borderRadius: 10, padding: '16px 20px', border: `1px solid ${border}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <AlertTriangle size={13} color={red} strokeWidth={2} />
                </div>
                <p style={{ fontSize: 14, color: textMid }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: bg, padding: '64px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: text, marginBottom: 12 }}>Is your domain already exposed?</h2>
          <p style={{ fontSize: 15, color: textMuted, marginBottom: 28 }}>Run a free scan now to check, then create an account for continuous monitoring.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/scan" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: cyan, color: '#fff', fontWeight: 700, fontSize: 12, padding: '13px 28px', borderRadius: 7, letterSpacing: '.5px', textDecoration: 'none' }}>
              FREE BREACH CHECK <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
            <Link href="/register" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: bgCard, color: cyan, fontWeight: 700, fontSize: 12, padding: '13px 28px', borderRadius: 7, border: '1.5px solid rgba(14,165,233,.3)', letterSpacing: '.5px', textDecoration: 'none' }}>
              ENABLE MONITORING /&gt;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
