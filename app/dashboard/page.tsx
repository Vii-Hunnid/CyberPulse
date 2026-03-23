import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? '#00ff88' : score >= 50 ? '#f5c518' : '#ff3366';
  return (
    <div className="flex items-center justify-center w-32 h-32 rounded-full" style={{ border: `4px solid ${color}`, background: '#0a0f1e' }}>
      <div className="text-center">
        <div className="text-4xl font-bold" style={{ color }}>{score}</div>
        <div className="text-xs" style={{ color: '#8892a4' }}>/ 100</div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const org = await prisma.organisation.findFirst({
    where: { userId: session!.user.id },
    include: {
      scans: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { findings: true },
      },
      alerts: { where: { read: false }, orderBy: { sentAt: 'desc' }, take: 5 },
    },
  });

  const latestScan = org?.scans[0];
  const criticalCount = latestScan?.findings.filter((f) => f.severity === 'CRITICAL').length ?? 0;
  const resolvedCount = latestScan?.findings.filter((f) => f.status === 'RESOLVED').length ?? 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">{org?.name ?? 'Your Organisation'}</h2>
          <p style={{ color: '#8892a4' }}>{org?.domain}</p>
        </div>
        {org && (
          <Link
            href={`/api/scan/start`}
            className="px-6 py-3 rounded font-semibold text-sm"
            style={{ background: '#00d4ff', color: '#0a0f1e' }}
          >
            Run New Scan
          </Link>
        )}
      </div>

      {/* Score Card */}
      <div className="rounded-xl p-8 mb-8 flex items-center gap-8" style={{ background: '#0f1729', border: '1px solid #1a2540' }}>
        <ScoreRing score={latestScan?.overallScore ?? 0} />
        <div>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-5xl font-bold" style={{ color: '#ffffff' }}>Grade {latestScan?.grade ?? '—'}</span>
          </div>
          <p className="text-sm mb-4" style={{ color: '#8892a4' }}>
            Last scanned: {latestScan?.completedAt ? new Date(latestScan.completedAt).toLocaleDateString('en-ZA') : 'Never'}
          </p>
          <div className="flex gap-6">
            <div>
              <div className="text-2xl font-bold text-white">{latestScan?.findings.length ?? 0}</div>
              <div className="text-xs" style={{ color: '#8892a4' }}>Total Findings</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#ff3366' }}>{criticalCount}</div>
              <div className="text-xs" style={{ color: '#8892a4' }}>Critical</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#00ff88' }}>{resolvedCount}</div>
              <div className="text-xs" style={{ color: '#8892a4' }}>Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      {org?.alerts && org.alerts.length > 0 && (
        <div className="rounded-xl p-6" style={{ background: '#0f1729', border: '1px solid #1a2540' }}>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {org.alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded" style={{ background: '#141d30' }}>
                <span style={{ color: '#ff6b35' }}>⚠</span>
                <div>
                  <p className="text-sm text-white">{alert.message}</p>
                  <p className="text-xs mt-1" style={{ color: '#8892a4' }}>{new Date(alert.sentAt).toLocaleString('en-ZA')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!org && (
        <div className="rounded-xl p-12 text-center" style={{ background: '#0f1729', border: '1px solid #1a2540' }}>
          <p className="text-white text-lg mb-4">No organisation set up yet.</p>
          <p style={{ color: '#8892a4' }}>Complete your profile to start scanning.</p>
        </div>
      )}
    </div>
  );
}
