import type { Metadata } from 'next';
import { CheckCircle2, Shield, AlertTriangle, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'POPIA Compliance — CyberPulse',
  description: 'How CyberPulse complies with the Protection of Personal Information Act (POPIA) and what this means for your business.',
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

const CONDITIONS = [
  {
    n: '1',
    title: 'Accountability',
    desc: 'CyberPulse has designated an Information Officer responsible for ensuring POPIA compliance across the organisation. Our Information Officer\'s details are registered with the Information Regulator.',
  },
  {
    n: '2',
    title: 'Processing Limitation',
    desc: 'We collect only the minimum personal information necessary to deliver our services. Data collected for scanning purposes is not used for unrelated processing activities.',
  },
  {
    n: '3',
    title: 'Purpose Specification',
    desc: 'All personal information is collected for a specific, explicitly defined, and lawful purpose. We communicate this purpose clearly at the point of collection.',
  },
  {
    n: '4',
    title: 'Further Processing Limitation',
    desc: 'We do not process your personal information for purposes incompatible with those for which it was originally collected.',
  },
  {
    n: '5',
    title: 'Information Quality',
    desc: 'We take reasonable steps to ensure that personal information is complete, accurate, not misleading, and updated where necessary.',
  },
  {
    n: '6',
    title: 'Openness',
    desc: 'We maintain this POPIA notice and our Privacy Policy to inform you of our processing activities. We do not process personal information in a secretive or undisclosed manner.',
  },
  {
    n: '7',
    title: 'Security Safeguards',
    desc: 'All scan results are encrypted using AES-256-GCM. We apply technical and organisational measures appropriate to the sensitivity of the information processed.',
  },
  {
    n: '8',
    title: 'Data Subject Participation',
    desc: 'You may access, correct, or request the deletion of your personal information at any time by contacting privacy@cyberpulse.co.za. We respond within 30 days.',
  },
];

const RIGHTS = [
  'Request access to the personal information we hold about you',
  'Request correction of inaccurate or incomplete information',
  'Request deletion of your personal information',
  'Object to the processing of your personal information',
  'Request restriction of processing in certain circumstances',
  'Lodge a complaint with the Information Regulator of South Africa',
  'Be notified within 72 hours if your personal information is compromised in a security breach',
];

export default function PopiaPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`.mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }`}</style>

      {/* Header */}
      <section style={{ background: bgCard, borderBottom: `1px solid ${border}`, padding: '56px 24px 44px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(16,185,129,.08)', border: '1.5px solid rgba(16,185,129,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={22} color={green} strokeWidth={1.5} />
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 1.5, marginBottom: 10 }}>[ LEGAL &bull; PRIVACY ]</div>
              <h1 style={{ fontSize: 36, fontWeight: 800, color: text, marginBottom: 10 }}>POPIA Compliance</h1>
              <p style={{ fontSize: 15, color: textMuted, maxWidth: 560 }}>
                How CyberPulse complies with the Protection of Personal Information Act 4 of 2013 (POPIA) and what your rights are as a data subject.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is POPIA */}
      <section style={{ background: bg, padding: '56px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: bgCard, borderRadius: 12, padding: '28px 28px', border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <FileText size={16} color={cyan} strokeWidth={1.5} />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: text }}>What is POPIA?</h2>
              </div>
              <p style={{ fontSize: 14, color: textMid, lineHeight: 1.75 }}>
                The Protection of Personal Information Act 4 of 2013 is South Africa&apos;s primary data protection legislation. It sets conditions for the lawful processing of personal information and grants rights to data subjects — including the right to access, correct, and delete their data.
              </p>
              <p style={{ fontSize: 14, color: textMid, lineHeight: 1.75, marginTop: 12 }}>
                POPIA applies to any organisation that processes personal information of South African residents, whether the organisation is based in South Africa or abroad.
              </p>
            </div>
            <div style={{ background: bgCard, borderRadius: 12, padding: '28px 28px', border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <AlertTriangle size={16} color='#f59e0b' strokeWidth={1.5} />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: text }}>Why it matters for your business</h2>
              </div>
              <p style={{ fontSize: 14, color: textMid, lineHeight: 1.75 }}>
                Businesses that process personal information of South African residents are required to comply with POPIA. Non-compliance can result in administrative fines of up to R10 million and criminal sanctions.
              </p>
              <p style={{ fontSize: 14, color: textMid, lineHeight: 1.75, marginTop: 12 }}>
                CyberPulse helps you understand your current security posture — a key element of demonstrating that you have implemented appropriate security safeguards as required by Section 19 of POPIA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8 Conditions */}
      <section style={{ background: bgCard, padding: '64px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 1.5, marginBottom: 8 }}>[ HOW WE COMPLY ]</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: text }}>The 8 conditions for lawful processing</h2>
            <p style={{ fontSize: 14, color: textMuted, marginTop: 10 }}>POPIA sets eight conditions that responsible parties must satisfy when processing personal information.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 14 }}>
            {CONDITIONS.map(({ n, title, desc }) => (
              <div key={n} style={{ background: bg, borderRadius: 10, padding: '20px 22px', border: `1px solid ${border}`, display: 'flex', gap: 14 }}>
                <div className="mono" style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(16,185,129,.08)', border: '1.5px solid rgba(16,185,129,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, color: green }}>{n}</div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: text, marginBottom: 6 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your rights */}
      <section style={{ background: bg, padding: '64px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 1.5, marginBottom: 8 }}>[ YOUR RIGHTS ]</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: text }}>Your rights as a data subject</h2>
          </div>
          <div style={{ background: bgCard, borderRadius: 12, padding: '28px 32px', border: `1px solid ${border}` }}>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {RIGHTS.map((right) => (
                <li key={right} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckCircle2 size={15} color={green} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 14, color: textMid }}>{right}</span>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${border}` }}>
              <p className="mono" style={{ fontSize: 11, color: textFaint, letterSpacing: '.5px' }}>
                To exercise any of these rights, contact us at{' '}
                <span style={{ color: cyan }}>privacy@cyberpulse.co.za</span>
                {' '}— we respond within 30 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Information Regulator */}
      <section style={{ background: bgCard, padding: '48px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: textMuted }}>
            You may also lodge a complaint with the <strong style={{ color: text }}>Information Regulator of South Africa</strong> at{' '}
            <span className="mono" style={{ fontSize: 13, color: cyan }}>inforeg.org.za</span>
            {' '}or call{' '}
            <span className="mono" style={{ fontSize: 13, color: text }}>010 023 5207</span>.
          </p>
        </div>
      </section>
    </div>
  );
}
