import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, BarChart2, FileText, CheckCircle2, ArrowRight, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Insurance Readiness — CyberPulse',
  description: 'Know your cyber insurance readiness score before approaching a broker. CyberPulse gives you an underwriting-ready grade and signed PDF attestation.',
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

const GRADES = [
  { grade: 'A', score: '85–100', label: 'Excellent', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', desc: 'Strong security posture. Likely to qualify for comprehensive cover at favourable rates.' },
  { grade: 'B', score: '70–84',  label: 'Good',      color: '#0ea5e9', bg: '#eff6ff', border: '#bfdbfe', desc: 'Good baseline controls. Minor improvements recommended before approaching insurers.' },
  { grade: 'C', score: '50–69',  label: 'Fair',      color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', desc: 'Moderate risk profile. Address critical findings to improve coverage options.' },
  { grade: 'D', score: '30–49',  label: 'Poor',      color: '#f97316', bg: '#fff7ed', border: '#fed7aa', desc: 'Significant gaps. Insurers may impose exclusions or elevated premiums.' },
  { grade: 'F', score: '0–29',   label: 'Critical',  color: '#ef4444', bg: '#fef2f2', border: '#fecaca', desc: 'High-risk profile. Remediation required before most policies will be issued.' },
];

const BROKERS = [
  'Howden South Africa',
  'Marsh Africa',
  'Aon South Africa',
  'Santam Commercial',
  'Hollard Business Insurance',
];

export default function InsuranceReadinessPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`.mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }`}</style>

      {/* Hero */}
      <section style={{ background: bgCard, borderBottom: `1px solid ${border}`, padding: '64px 24px 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 4, padding: '4px 14px', marginBottom: 20 }}>
            <span style={{ color: green, fontSize: 10, letterSpacing: 1.5 }}>[ INSURANCE READINESS ]</span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: text, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Know your insurance score before your broker does
          </h1>
          <p style={{ fontSize: 17, color: textMuted, marginBottom: 32, maxWidth: 580, margin: '0 auto 32px' }}>
            CyberPulse produces an underwriting-ready score and grade based on your actual security posture — the same factors cyber insurers evaluate when pricing your policy.
          </p>
          <Link href="/register" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: green, color: '#fff', fontWeight: 700, fontSize: 13, padding: '14px 32px', borderRadius: 8, letterSpacing: '.5px', textDecoration: 'none' }}>
            GET MY SCORE <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* Grade table */}
      <section style={{ background: bg, padding: '72px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 1.5, marginBottom: 8 }}>[ INSURABILITY GRADES ]</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: text }}>What each grade means</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {GRADES.map(({ grade, score, label, color, bg: gBg, border: gBorder, desc }) => (
              <div key={grade} style={{ background: bgCard, borderRadius: 10, padding: '18px 22px', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: gBg, border: `2.5px solid ${gBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="mono" style={{ fontSize: 20, fontWeight: 800, color }}>{grade}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, color }}>{label}</span>
                    <span className="mono" style={{ fontSize: 11, color: textFaint, letterSpacing: '.5px' }}>Score {score}</span>
                  </div>
                  <p style={{ fontSize: 13, color: textMuted }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What the PDF includes */}
      <section style={{ background: bgCard, padding: '72px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <div className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 1.5, marginBottom: 16 }}>[ SIGNED PDF ATTESTATION ]</div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: text, marginBottom: 16 }}>Give your broker exactly what they need</h2>
              <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.7, marginBottom: 20 }}>
                The CyberPulse attestation PDF is a professionally formatted, digitally signed document that summarises your security posture, score, and recommendations. It is designed to satisfy the cyber security questionnaires used by most South African brokers and underwriters.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Insurability grade and underwriting score',
                  'Recommended coverage level',
                  'Premium risk indicator (Standard / Elevated / High)',
                  'Summary of key risk factors',
                  'Summary of positive controls in place',
                  'Integrity seal verifiable by the insurer',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <CheckCircle2 size={14} color={green} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: textMid }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 1.5, marginBottom: 16 }}>[ COMPATIBLE BROKERS ]</div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: text, marginBottom: 16 }}>Works with your existing broker</h2>
              <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.7, marginBottom: 20 }}>
                Our attestation format has been accepted by brokers and underwriters across South Africa. Simply download your PDF and attach it to your broker&apos;s cyber insurance application.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {BROKERS.map((broker) => (
                  <div key={broker} style={{ display: 'flex', alignItems: 'center', gap: 10, background: bg, borderRadius: 7, padding: '10px 14px', border: `1px solid ${border}` }}>
                    <Shield size={12} color={cyan} strokeWidth={2} />
                    <span style={{ fontSize: 13, color: textMid }}>{broker}</span>
                  </div>
                ))}
                <p className="mono" style={{ fontSize: 10, color: textFaint, marginTop: 4, letterSpacing: '.3px' }}>// and many more — ask your broker to accept the CyberPulse attestation format</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: bg, padding: '64px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: text, marginBottom: 12 }}>Find out your insurability grade today</h2>
          <p style={{ fontSize: 15, color: textMuted, marginBottom: 28 }}>Create a free account, run a full scan, and download your signed PDF attestation in minutes.</p>
          <Link href="/register" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: green, color: '#fff', fontWeight: 700, fontSize: 12, padding: '13px 32px', borderRadius: 7, letterSpacing: '.5px', textDecoration: 'none' }}>
            GET MY INSURANCE SCORE <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </div>
  );
}
