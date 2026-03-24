import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CheckCircle2, XCircle } from 'lucide-react';

export default async function UnderwritingPage() {
  const session = await getServerSession(authOptions);

  const org = await prisma.organisation.findFirst({
    where: { userId: session!.user.id },
  });

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

  const gradeColor = (g?: string) => {
    switch (g) {
      case 'A': return '#00ff88';
      case 'B': return '#00d4ff';
      case 'C': return '#f5c518';
      case 'D': return '#ff6b35';
      default: return '#ff3366';
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Insurance Readiness</h2>
      <p className="mb-8" style={{ color: '#8892a4' }}>Based on your latest security posture assessment</p>

      {!uw ? (
        <div className="rounded-xl p-12 text-center" style={{ background: '#0f1729', border: '1px solid #1a2540' }}>
          <p className="text-white">No underwriting data available. Run a scan first.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Score */}
          <div className="rounded-xl p-8 flex items-center gap-8" style={{ background: '#0f1729', border: '1px solid #1a2540' }}>
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ border: `4px solid ${gradeColor(uw.insurabilityGrade)}`, background: '#0a0f1e' }}
            >
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: gradeColor(uw.insurabilityGrade) }}>{uw.underwritingScore ?? 0}</div>
                <div className="text-xs" style={{ color: '#8892a4' }}>/ 100</div>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">Grade {uw.insurabilityGrade ?? 'N/A'}</div>
              <div className="flex gap-6 mt-4">
                <div>
                  <div className="text-sm font-semibold text-white">{uw.recommendedCoverageLevel ?? '—'}</div>
                  <div className="text-xs" style={{ color: '#8892a4' }}>Recommended Coverage</div>
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: gradeColor(uw.insurabilityGrade) }}>{uw.premiumIndicator ?? '—'}</div>
                  <div className="text-xs" style={{ color: '#8892a4' }}>Premium Indicator</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          {uw.summary && (
            <div className="rounded-xl p-6" style={{ background: '#0f1729', border: '1px solid #1a2540' }}>
              <h3 className="font-semibold text-white mb-3">Underwriter Summary</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#c8d0dd' }}>{uw.summary}</p>
            </div>
          )}

          {/* Risk & Positive Factors */}
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl p-6" style={{ background: '#0f1729', border: '1px solid #1a2540' }}>
              <h3 className="font-semibold mb-3" style={{ color: '#ff6b35' }}>Key Risk Factors</h3>
              <ul className="space-y-2">
                {uw.keyRiskFactors?.map((f, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#c8d0dd' }}>
                    <XCircle size={14} color="#ff6b35" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-6" style={{ background: '#0f1729', border: '1px solid #1a2540' }}>
              <h3 className="font-semibold mb-3" style={{ color: '#00ff88' }}>Positive Factors</h3>
              <ul className="space-y-2">
                {uw.positiveFactors?.map((f, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#c8d0dd' }}>
                    <CheckCircle2 size={14} color="#00ff88" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {org && (
            <div className="flex gap-4">
              <a
                href={`/api/org/${org.id}/attestation`}
                className="px-6 py-3 rounded font-semibold text-sm"
                style={{ background: '#00ff88', color: '#0a0f1e' }}
              >
                Download Attestation PDF
              </a>
              <button
                className="px-6 py-3 rounded font-semibold text-sm"
                style={{ background: '#0f1729', color: '#00d4ff', border: '1px solid #00d4ff' }}
              >
                Connect with Insurer →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
