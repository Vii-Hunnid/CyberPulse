'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Finding {
  id: string;
  title: string;
  category: string;
  severity: string;
  description: string;
  remediation: string | null;
  status: string;
}

interface ScanData {
  id: string;
  status: string;
  overallScore: number | null;
  grade: string | null;
  aiNarrative: string | null;
  findings: Finding[];
  completedAt: string | null;
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    CRITICAL: '#ff3366', HIGH: '#ff6b35', MEDIUM: '#f5c518', LOW: '#00d4ff', INFO: '#8892a4',
  };
  return (
    <span className="text-xs font-bold px-2 py-1 rounded text-white" style={{ background: colors[severity] ?? '#8892a4' }}>
      {severity}
    </span>
  );
}

export default function ScanDetailPage() {
  const params = useParams();
  const scanId = params.scanId as string;
  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/scan/${scanId}/report`)
      .then((r) => r.json())
      .then((d) => { setScan(d.scan); setLoading(false); })
      .catch(() => setLoading(false));
  }, [scanId]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) return (
    <div style={{ padding: 32, color: '#8892a4', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
      <div style={{ width: 16, height: 16, border: '2px solid #1a2540', borderTopColor: '#00d4ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Loading scan...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!scan) return (
    <div style={{ padding: 32, color: '#ff3366', fontSize: 14 }}>Scan not found or access denied.</div>
  );

  const categories = [...new Set(scan.findings.map((f) => f.category))];

  return (
    <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>Scan Results</h2>
          <p style={{ fontSize: 12, color: '#3d4f6b' }}>
            {scan.completedAt ? new Date(scan.completedAt).toLocaleString('en-ZA') : 'In progress...'}
          </p>
        </div>
        <a
          href={`/api/org/attestation/report/${scanId}`}
          style={{ padding: '10px 20px', background: '#00ff88', color: '#0a0f1e', fontWeight: 700, fontSize: 13, borderRadius: 8, textDecoration: 'none', flexShrink: 0 }}
        >
          Download PDF Report
        </a>
      </div>

      {scan.overallScore != null && (
        <div style={{ background: '#0f1729', border: '1px solid #1a2540', borderRadius: 12, padding: '22px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontSize: 52, fontWeight: 800, color: '#00d4ff', lineHeight: 1, letterSpacing: '-2px', flexShrink: 0 }}>{scan.overallScore}</div>
          <div style={{ width: 1, height: 48, background: '#1a2540' }} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>Grade {scan.grade}</div>
            <p style={{ fontSize: 13, color: '#8892a4', lineHeight: 1.5, maxWidth: 500 }}>{scan.aiNarrative?.slice(0, 220)}...</p>
          </div>
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            {cat.replace(/_/g, ' ')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {scan.findings.filter((f) => f.category === cat).map((finding) => (
              <div key={finding.id} style={{ background: '#0f1729', border: '1px solid #1a2540', borderRadius: 8, overflow: 'hidden' }}>
                <button
                  onClick={() => toggle(finding.id)}
                  style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <SeverityBadge severity={finding.severity} />
                    <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>{finding.title}</span>
                  </div>
                  <span style={{ color: '#3d4f6b', fontSize: 10 }}>{expanded.has(finding.id) ? '▲' : '▼'}</span>
                </button>
                {expanded.has(finding.id) && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #1a2540' }}>
                    <p style={{ fontSize: 13, color: '#c8d0dd', margin: '12px 0', lineHeight: 1.6 }}>{finding.description}</p>
                    {finding.remediation && (
                      <div style={{ background: '#141d30', borderRadius: 6, padding: '10px 14px', borderLeft: '3px solid #00ff88' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#00ff88' }}>FIX: </span>
                        <span style={{ fontSize: 13, color: '#c8d0dd' }}>{finding.remediation}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
