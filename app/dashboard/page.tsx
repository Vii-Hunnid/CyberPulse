import { getSessionOrDev } from '@/lib/dev-session';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Activity, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

function gradeColor(g?: string | null) {
  switch (g) {
    case 'A': return '#10b981';
    case 'B': return '#0ea5e9';
    case 'C': return '#f59e0b';
    case 'D': return '#f97316';
    default:  return '#ef4444';
  }
}

function ScoreRing({ score, grade }: { score: number; grade?: string | null }) {
  const color = gradeColor(grade);
  return (
    <div style={{ width: 112, height: 112, borderRadius: '50%', border: `4px solid ${color}`, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1, fontFamily: 'ui-monospace, monospace' }}>{score}</div>
        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>/ 100</div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getSessionOrDev();

  let org = null;
  let dbError = false;
  try {
    org = await prisma.organisation.findFirst({
      where: { userId: session?.user.id ?? '' },
      include: {
        scans: { orderBy: { createdAt: 'desc' }, take: 1, include: { findings: true } },
        alerts: { where: { read: false }, orderBy: { sentAt: 'desc' }, take: 5 },
      },
    });
  } catch {
    dbError = true;
  }

  const latestScan  = org?.scans[0];
  const critical    = latestScan?.findings.filter((f) => f.severity === 'CRITICAL').length ?? 0;
  const high        = latestScan?.findings.filter((f) => f.severity === 'HIGH').length ?? 0;
  const resolved    = latestScan?.findings.filter((f) => f.status === 'RESOLVED').length ?? 0;
  const total       = latestScan?.findings.length ?? 0;
  const gCol        = gradeColor(latestScan?.grade);

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`.mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 1.5, marginBottom: 4 }}>[ DASHBOARD ]</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{org?.name ?? 'Your Organisation'}</h2>
          <p style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'ui-monospace, monospace' }}>{org?.domain ?? '—'}</p>
        </div>
        {org && (
          <Link href="/api/scan/start" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 12, borderRadius: 7, textDecoration: 'none', flexShrink: 0, fontFamily: 'ui-monospace, monospace', letterSpacing: .5 }}>
            <RefreshCw size={13} strokeWidth={2.5} />
            NEW SCAN /&gt;
          </Link>
        )}
      </div>

      {/* Score card */}
      <div style={{ background: '#ffffff', borderRadius: 12, padding: '24px 24px', border: '1px solid #dde3ec', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
        <ScoreRing score={latestScan?.overallScore ?? 0} grade={latestScan?.grade} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-1px' }}>Grade</span>
            <span style={{ fontSize: 34, fontWeight: 800, color: gCol, lineHeight: 1, letterSpacing: '-1px' }}>{latestScan?.grade ?? '—'}</span>
          </div>
          <p className="mono" style={{ fontSize: 11, color: '#94a3b8', marginBottom: 18, letterSpacing: '.5px' }}>
            {latestScan?.completedAt
              ? `// SCANNED ${new Date(latestScan.completedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}`
              : '// NO SCAN COMPLETED YET'}
          </p>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {[
              { label: 'Total', value: total,    color: '#334155' },
              { label: 'Critical', value: critical, color: '#ef4444' },
              { label: 'High',     value: high,     color: '#f97316' },
              { label: 'Resolved', value: resolved,  color: '#10b981' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="mono" style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {latestScan && (
          <Link href={`/dashboard/scan/${latestScan.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#f0f4f8', border: '1px solid #dde3ec', color: '#0ea5e9', fontSize: 12, fontWeight: 600, borderRadius: 7, textDecoration: 'none', flexShrink: 0, fontFamily: 'ui-monospace, monospace', letterSpacing: .5 }}>
            VIEW REPORT <ArrowRight size={12} strokeWidth={2.5} />
          </Link>
        )}
      </div>

      {/* Metric tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Open Findings', value: total - resolved, Icon: ShieldAlert, color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
          { label: 'Resolved',      value: resolved,          Icon: CheckCircle2, color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
          { label: 'Active Alerts', value: org?.alerts.length ?? 0, Icon: Activity, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
        ].map(({ label, value, Icon, color, bg, border }) => (
          <div key={label} style={{ background: '#ffffff', borderRadius: 10, padding: '18px 20px', border: '1px solid #dde3ec', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,.03)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={17} color={color} strokeWidth={1.5} />
            </div>
            <div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {org?.alerts && org.alerts.length > 0 && (
        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #dde3ec', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.03)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #dde3ec', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={13} color="#f59e0b" strokeWidth={1.5} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Recent Alerts</h3>
          </div>
          {org.alerts.map((alert, i) => (
            <div key={alert.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 20px', borderBottom: i < org.alerts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f97316', marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: '#334155', marginBottom: 2 }}>{alert.message}</p>
                <p className="mono" style={{ fontSize: 10, color: '#94a3b8', letterSpacing: .5 }}>{new Date(alert.sentAt).toLocaleString('en-ZA')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DB connection error */}
      {dbError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '20px 24px', marginBottom: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <AlertTriangle size={18} color="#ef4444" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>Database not connected</p>
            <p style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.6, marginBottom: 10 }}>
              CyberPulse cannot reach PostgreSQL. The credentials in <code style={{ background: '#fee2e2', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>.env.local</code> are wrong.
            </p>
            <p className="mono" style={{ fontSize: 11, color: '#991b1b', marginBottom: 4 }}>Current: DATABASE_URL=postgresql://postgres:password@localhost:5432/cyberpulse</p>
            <p style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.7 }}>
              <strong>To fix:</strong> Open <strong>pgAdmin 4</strong> (installed with PostgreSQL) → right-click the postgres server → Properties → change the password to <code style={{ background: '#fee2e2', padding: '1px 5px', borderRadius: 3 }}>password</code>.
              Then run <code style={{ background: '#fee2e2', padding: '1px 5px', borderRadius: 3 }}>npx prisma db push</code> to create the tables.
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!org && !dbError && (
        <div style={{ background: '#ffffff', borderRadius: 14, padding: 48, textAlign: 'center', border: '1px solid #dde3ec' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Activity size={22} color="#0ea5e9" strokeWidth={1.5} />
          </div>
          <p style={{ color: '#0f172a', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No organisation set up yet</p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Complete your profile to start scanning.</p>
        </div>
      )}
    </div>
  );
}
