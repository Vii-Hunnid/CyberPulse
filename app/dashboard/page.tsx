import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Activity, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? '#00ff88' : score >= 50 ? '#f5c518' : '#ff3366';
  return (
    <div style={{ width: 120, height: 120, borderRadius: '50%', border: `4px solid ${color}`, background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 38, fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 11, color: '#8892a4', marginTop: 2 }}>/ 100</div>
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
  const highCount = latestScan?.findings.filter((f) => f.severity === 'HIGH').length ?? 0;
  const resolvedCount = latestScan?.findings.filter((f) => f.status === 'RESOLVED').length ?? 0;
  const totalFindings = latestScan?.findings.length ?? 0;

  const gradeColor = (g?: string | null) => {
    switch (g) {
      case 'A': return '#00ff88';
      case 'B': return '#00d4ff';
      case 'C': return '#f5c518';
      case 'D': return '#ff6b35';
      default:  return '#ff3366';
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', marginBottom: 3 }}>
            {org?.name ?? 'Your Organisation'}
          </h2>
          <p style={{ color: '#3d4f6b', fontSize: 13 }}>{org?.domain ?? 'No domain configured'}</p>
        </div>
        {org && (
          <Link
            href="/api/scan/start"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: '#00d4ff', color: '#0a0f1e', fontWeight: 700, fontSize: 13, borderRadius: 8, textDecoration: 'none', flexShrink: 0 }}
          >
            <RefreshCw size={13} strokeWidth={2.5} />
            New Scan
          </Link>
        )}
      </div>

      {/* ─── Score card ─────────────────────────────────────────────────── */}
      <div style={{ background: '#0f1729', borderRadius: 14, padding: '28px 28px', border: '1px solid #1a2540', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 28 }}>
        <ScoreRing score={latestScan?.overallScore ?? 0} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 40, fontWeight: 800, color: '#ffffff', lineHeight: 1, letterSpacing: '-1px' }}>
              Grade
            </span>
            <span style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: gradeColor(latestScan?.grade), letterSpacing: '-1px' }}>
              {latestScan?.grade ?? '—'}
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#3d4f6b', marginBottom: 20 }}>
            {latestScan?.completedAt
              ? `Last scanned ${new Date(latestScan.completedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : 'No scan completed yet'}
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { label: 'Total Findings', value: totalFindings, color: '#fff' },
              { label: 'Critical',       value: criticalCount,  color: '#ff3366' },
              { label: 'High',           value: highCount,      color: '#ff6b35' },
              { label: 'Resolved',       value: resolvedCount,  color: '#00ff88' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, color: '#3d4f6b', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {latestScan && (
          <Link
            href={`/dashboard/scan/${latestScan.id}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', color: '#00d4ff', fontSize: 13, fontWeight: 600, borderRadius: 8, textDecoration: 'none', flexShrink: 0 }}
          >
            View Report <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        )}
      </div>

      {/* ─── Quick metrics ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Open Findings',      value: totalFindings - resolvedCount, Icon: ShieldAlert, color: '#ff6b35' },
          { label: 'Resolved',           value: resolvedCount,                 Icon: CheckCircle2, color: '#00ff88' },
          { label: 'Active Alerts',      value: org?.alerts.length ?? 0,       Icon: Activity,    color: '#f5c518' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} style={{ background: '#0f1729', borderRadius: 10, padding: '18px 20px', border: '1px solid #1a2540', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: `${color}10`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={17} color={color} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, color: '#3d4f6b', marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Recent alerts ──────────────────────────────────────────────── */}
      {org?.alerts && org.alerts.length > 0 && (
        <div style={{ background: '#0f1729', borderRadius: 12, border: '1px solid #1a2540', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1a2540', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} color="#f5c518" strokeWidth={1.5} />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>Recent Alerts</h3>
          </div>
          <div>
            {org.alerts.map((alert, i) => (
              <div key={alert.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 20px', borderBottom: i < org.alerts.length - 1 ? '1px solid #1a2540' : 'none' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff6b35', marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: '#e2e8f0', marginBottom: 3 }}>{alert.message}</p>
                  <p style={{ fontSize: 11, color: '#3d4f6b' }}>{new Date(alert.sentAt).toLocaleString('en-ZA')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Empty state ────────────────────────────────────────────────── */}
      {!org && (
        <div style={{ background: '#0f1729', borderRadius: 14, padding: 48, textAlign: 'center', border: '1px solid #1a2540' }}>
          <div style={{ width: 52, height: 52, borderRadius: 13, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <Activity size={24} color="#00d4ff" strokeWidth={1.5} />
          </div>
          <p style={{ color: '#ffffff', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No organisation set up yet</p>
          <p style={{ color: '#3d4f6b', fontSize: 14 }}>Complete your profile to start scanning.</p>
        </div>
      )}
    </div>
  );
}
