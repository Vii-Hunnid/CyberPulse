import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Shield, Brain, BarChart2, Bell, Download, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Full Security Report — CyberPulse',
  description: 'Get a comprehensive AI-powered security report with risk narrative, insurance readiness score, and a signed PDF attestation for your broker.',
};

const bg     = '#f0f4f8';
const bgCard = '#ffffff';
const text   = '#0f172a';
const textMid  = '#334155';
const textMuted = '#64748b';
const textFaint = '#94a3b8';
const border   = '#dde3ec';
const cyan   = '#0ea5e9';
const green  = '#10b981';

const FEATURES = [
  {
    Icon: Brain,
    title: 'AI-Powered Risk Narrative',
    desc: 'Our engine, powered by Claude, synthesises all scan findings into a plain-English executive summary — written for business owners and board members, not just IT staff.',
  },
  {
    Icon: BarChart2,
    title: 'Insurance Readiness Score',
    desc: 'Every report includes an underwriting-ready score (0–100) and an insurability grade (A–F) so you know exactly where you stand before approaching a cyber insurer.',
  },
  {
    Icon: FileText,
    title: 'Signed PDF Attestation',
    desc: 'Download a professionally formatted PDF report with an integrity seal — ready to share with your broker, board, or compliance auditor.',
  },
  {
    Icon: Bell,
    title: 'Continuous Monitoring Alerts',
    desc: 'After your first scan, CyberPulse monitors your domain for new exposures and sends you an alert the moment your risk profile changes.',
  },
  {
    Icon: Shield,
    title: 'Remediation Guidance',
    desc: 'Each finding comes with step-by-step fix instructions ranked by priority so your IT team or managed service provider knows exactly what to tackle first.',
  },
  {
    Icon: Download,
    title: 'Re-scan & Track Progress',
    desc: 'Run as many scans as you need and track your security posture score over time as you remediate issues and improve your defences.',
  },
];

const INCLUDED = [
  'Full 6-category scan results with severity ratings',
  'AI executive summary (Claude-powered narrative)',
  'Insurance readiness score and grade',
  'Recommended coverage level and premium indicator',
  'Key risk factors and positive factors',
  'Signed PDF attestation for your broker',
  'Step-by-step remediation guidance per finding',
  'Continuous dark web monitoring alerts',
  'Re-scan capability to track improvement',
];

export default function FullReportPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`.mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }`}</style>

      {/* Hero */}
      <section style={{ background: bgCard, borderBottom: `1px solid ${border}`, padding: '64px 24px 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,.06)', border: '1px solid rgba(14,165,233,.18)', borderRadius: 4, padding: '4px 14px', marginBottom: 20 }}>
            <span style={{ color: cyan, fontSize: 10, letterSpacing: 1.5 }}>[ FULL POSTURE REPORT ]</span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: text, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Your complete security report
          </h1>
          <p style={{ fontSize: 17, color: textMuted, marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }}>
            Beyond the free scan — a comprehensive AI-narrated report, insurance readiness score, and a signed PDF for your broker. All in one dashboard.
          </p>
          <Link href="/register" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: cyan, color: '#fff', fontWeight: 700, fontSize: 13, padding: '14px 32px', borderRadius: 8, letterSpacing: '.5px', textDecoration: 'none' }}>
            GET YOUR FULL REPORT <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: bg, padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 1.5, marginBottom: 8 }}>[ WHAT YOU GET ]</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: text }}>Everything your business needs</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} style={{ background: bgCard, borderRadius: 12, padding: '24px 24px', border: `1px solid ${border}`, boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 9, background: 'rgba(14,165,233,.07)', border: '1px solid rgba(14,165,233,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={17} color={cyan} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Included list */}
      <section style={{ background: bgCard, padding: '72px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 1.5, marginBottom: 8 }}>[ FULL REPORT INCLUDES ]</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: text }}>Everything in one place</h2>
          </div>
          <div style={{ background: bg, borderRadius: 12, padding: '28px 32px', border: `1px solid ${border}` }}>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {INCLUDED.map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckCircle2 size={15} color={green} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 14, color: textMid }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: bg, padding: '64px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: text, marginBottom: 12 }}>Start with a free scan — upgrade to the full report</h2>
          <p style={{ fontSize: 15, color: textMuted, marginBottom: 28 }}>Create a free account to unlock your complete security report, insurance score, and signed PDF.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: cyan, color: '#fff', fontWeight: 700, fontSize: 12, padding: '13px 28px', borderRadius: 7, letterSpacing: '.5px', textDecoration: 'none' }}>
              CREATE FREE ACCOUNT <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
            <Link href="/scan" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: bgCard, color: cyan, fontWeight: 700, fontSize: 12, padding: '13px 28px', borderRadius: 7, border: '1.5px solid rgba(14,165,233,.3)', letterSpacing: '.5px', textDecoration: 'none' }}>
              FREE SCAN FIRST /&gt;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
