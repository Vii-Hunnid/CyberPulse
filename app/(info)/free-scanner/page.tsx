import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Lock, Shield, EyeOff, Radio, Bug, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free Security Scanner — CyberPulse',
  description: 'Run an instant, free 6-category cyber security scan on your business domain. No sign-up required.',
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

const CHECKS = [
  { Icon: Mail,   n: '01', title: 'Email Security',            desc: 'We verify your SPF, DKIM, and DMARC DNS records to confirm your domain is protected against phishing and spoofing attacks sent in your name.' },
  { Icon: Lock,   n: '02', title: 'SSL / TLS Certificate',     desc: 'Your certificate is checked for validity, expiry, issuer trust chain, and TLS protocol version — outdated TLS 1.0/1.1 is flagged as a risk.' },
  { Icon: Shield, n: '03', title: 'HTTP Security Headers',     desc: 'We probe your web server for CSP, HSTS, X-Frame-Options, Referrer-Policy, and Permissions-Policy headers that block common browser attacks.' },
  { Icon: EyeOff, n: '04', title: 'Dark Web Exposure',         desc: 'Your domain is cross-referenced against known credential dumps and breach databases to surface any leaked employee or customer accounts.' },
  { Icon: Radio,  n: '05', title: 'Open Port Exposure',        desc: 'A lightweight port scan checks for dangerously exposed services — RDP, Telnet, MongoDB, Redis, Elasticsearch — that attackers actively target.' },
  { Icon: Bug,    n: '06', title: 'Known CVE Vulnerabilities', desc: 'Detected software versions on your public stack are matched against the CVE database to identify unpatched vulnerabilities with known exploits.' },
];

const STEPS = [
  { n: '01', title: 'Enter your domain', desc: 'Type your business domain name (e.g. yourcompany.co.za) into the scanner.' },
  { n: '02', title: 'Scan runs instantly', desc: 'Our engine checks all 6 categories simultaneously — results appear in under 60 seconds.' },
  { n: '03', title: 'Review your findings', desc: 'Each finding is rated Critical / High / Medium / Low with a plain-English explanation.' },
  { n: '04', title: 'Unlock the full report', desc: 'Create a free account to get an AI narrative, insurance score, and ongoing monitoring.' },
];

export default function FreeScannerPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`.mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }`}</style>

      {/* Hero */}
      <section style={{ background: bgCard, borderBottom: `1px solid ${border}`, padding: '64px 24px 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,.06)', border: '1px solid rgba(14,165,233,.18)', borderRadius: 4, padding: '4px 14px', marginBottom: 20 }}>
            <span style={{ color: cyan, fontSize: 10, letterSpacing: 1.5 }}>[ FREE &bull; NO SIGN-UP REQUIRED ]</span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: text, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Free Security Scanner
          </h1>
          <p style={{ fontSize: 17, color: textMuted, marginBottom: 32, maxWidth: 540, margin: '0 auto 32px' }}>
            An instant 6-category cyber security scan of your business domain. See exactly where you are exposed — for free, in under 60 seconds.
          </p>
          <Link href="/scan" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: cyan, color: '#fff', fontWeight: 700, fontSize: 13, padding: '14px 32px', borderRadius: 8, letterSpacing: '.5px', textDecoration: 'none' }}>
            SCAN MY DOMAIN <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* What we check */}
      <section style={{ background: bg, padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 1.5, marginBottom: 8 }}>[ WHAT WE CHECK ]</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: text }}>6 critical security categories</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {CHECKS.map(({ Icon, n, title, desc }) => (
              <div key={n} style={{ background: bgCard, borderRadius: 12, padding: '24px 24px', border: `1px solid ${border}`, boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 9, background: 'rgba(14,165,233,.07)', border: `1px solid rgba(14,165,233,.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={17} color={cyan} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span className="mono" style={{ fontSize: 9, color: textFaint, letterSpacing: 1 }}>{n}</span>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: text }}>{title}</h3>
                    </div>
                    <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.65 }}>{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: bgCard, padding: '72px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 1.5, marginBottom: 8 }}>[ HOW IT WORKS ]</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: text }}>Results in four steps</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} style={{ textAlign: 'center' }}>
                <div className="mono" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(14,165,233,.08)', border: `1.5px solid rgba(14,165,233,.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 13, fontWeight: 700, color: cyan }}>{n}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: text, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: textMuted }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: bg, padding: '64px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: text, marginBottom: 12 }}>Ready to check your security posture?</h2>
          <p style={{ fontSize: 15, color: textMuted, marginBottom: 28 }}>It takes under 60 seconds and costs nothing. No account, no card required.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/scan" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: cyan, color: '#fff', fontWeight: 700, fontSize: 12, padding: '13px 28px', borderRadius: 7, letterSpacing: '.5px', textDecoration: 'none' }}>
              RUN FREE SCAN <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
            <Link href="/register" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: bgCard, color: cyan, fontWeight: 700, fontSize: 12, padding: '13px 28px', borderRadius: 7, border: `1.5px solid rgba(14,165,233,.3)`, letterSpacing: '.5px', textDecoration: 'none' }}>
              CREATE FREE ACCOUNT /&gt;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
