import { getSessionOrDev } from '@/lib/dev-session';
import { prisma } from '@/lib/db';
import { CheckCircle2, XCircle, Shield } from 'lucide-react';

function gradeColor(g?: string) {
  switch (g) {
    case 'A': return '#10b981';
    case 'B': return '#0ea5e9';
    case 'C': return '#f59e0b';
    case 'D': return '#f97316';
    default:  return '#ef4444';
  }
}

function gradeBg(g?: string) {
  switch (g) {
    case 'A': return '#f0fdf4';
    case 'B': return '#eff6ff';
    case 'C': return '#fffbeb';
    case 'D': return '#fff7ed';
    default:  return '#fef2f2';
  }
}

function gradeBorder(g?: string) {
  switch (g) {
    case 'A': return '#bbf7d0';
    case 'B': return '#bfdbfe';
    case 'C': return '#fde68a';
    case 'D': return '#fed7aa';
    default:  return '#fecaca';
  }
}

export default async function UnderwritingPage() {
  const session = await getSessionOrDev();
  let org = null;
  try {
    org = await prisma.organisation.findFirst({
      where: { userId: session?.user.id ?? '' },
    });
  } catch { /* DB not connected */ }

  const latestScan = org
    ? await prisma.scan.findFirst({
        where: { organisationId: org.id, status: 'COMPLETE' },
        orderBy: { completedAt: 'desc' },
      })
    : null;

  const rawResults = latestScan?.rawResults as Record<string, unknown> | null;
  const uw = rawResults?.underwriting as {
    underwritingScore?: number;
    insurabilityGrade?: string;
    recommendedCoverageLevel?: string;
    premiumIndicator?: string;
    keyRiskFactors?: string[];
    positiveFactors?: string[];
    summary?: string;
  } | null;

  const gCol    = gradeColor(uw?.insurabilityGrade);
  const gBg     = gradeBg(uw?.insurabilityGrade);
  const gBorder = gradeBorder(uw?.insurabilityGrade);

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`.mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="mono" style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 1.5, marginBottom: 4 }}>[ INSURANCE READINESS ]</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Insurance Readiness</h2>
        <p style={{ color: '#94a3b8', fontSize: 13 }}>Based on your latest security posture assessment</p>
      </div>

      {!uw ? (
        <div style={{ background: '#ffffff', borderRadius: 12, padding: 48, textAlign: 'center', border: '1px solid #dde3ec' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Shield size={22} color="#0ea5e9" strokeWidth={1.5} />
          </div>
          <p style={{ color: '#0f172a', fontWeight: 600, marginBottom: 6 }}>No underwriting data available</p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Run a completed scan first to see your insurance readiness score.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Score card */}
          <div style={{ background: '#ffffff', borderRadius: 12, padding: '24px 24px', border: '1px solid #dde3ec', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', border: `4px solid ${gCol}`, background: gBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 30, fontWeight: 800, color: gCol, lineHeight: 1 }}>{uw.underwritingScore ?? 0}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>/ 100</div>
              </div>
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: gBg, border: `1px solid ${gBorder}`, borderRadius: 7, padding: '6px 16px', marginBottom: 10 }}>
                <span className="mono" style={{ fontSize: 18, fontWeight: 800, color: gCol }}>GRADE {uw.insurabilityGrade ?? '—'}</span>
              </div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{uw.recommendedCoverageLevel ?? '—'}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Recommended Coverage</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: gCol }}>{uw.premiumIndicator ?? '—'}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Premium Indicator</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          {uw.summary && (
            <div style={{ background: '#ffffff', borderRadius: 10, padding: '20px 22px', border: '1px solid #dde3ec', borderLeft: `3px solid ${gCol}` }}>
              <h3 className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1.5, marginBottom: 10 }}>[ UNDERWRITER SUMMARY ]</h3>
              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }}>{uw.summary}</p>
            </div>
          )}

          {/* Risk & Positive */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ background: '#ffffff', borderRadius: 10, padding: '20px 22px', border: '1px solid #dde3ec', borderTop: '3px solid #ef4444' }}>
              <h3 className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', letterSpacing: 1.5, marginBottom: 14 }}>[ KEY RISK FACTORS ]</h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {uw.keyRiskFactors?.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                    <XCircle size={14} color="#ef4444" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: '#ffffff', borderRadius: 10, padding: '20px 22px', border: '1px solid #dde3ec', borderTop: '3px solid #10b981' }}>
              <h3 className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#10b981', letterSpacing: 1.5, marginBottom: 14 }}>[ POSITIVE FACTORS ]</h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {uw.positiveFactors?.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                    <CheckCircle2 size={14} color="#10b981" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          {org && (
            <div style={{ display: 'flex', gap: 10 }}>
              <a href={`/api/org/${org.id}/attestation`} className="mono" style={{ padding: '11px 22px', background: '#10b981', color: '#fff', fontWeight: 700, fontSize: 12, borderRadius: 7, textDecoration: 'none', letterSpacing: .5 }}>
                DOWNLOAD ATTESTATION PDF /&gt;
              </a>
              <button className="mono" style={{ padding: '11px 22px', background: '#ffffff', color: '#0ea5e9', fontSize: 12, fontWeight: 700, border: '1px solid #bfdbfe', borderRadius: 7, cursor: 'pointer', letterSpacing: .5 }}>
                CONNECT WITH INSURER /&gt;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
