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

  if (loading) return <div className="p-8 text-white">Loading scan...</div>;
  if (!scan) return <div className="p-8" style={{ color: '#ff3366' }}>Scan not found.</div>;

  const categories = [...new Set(scan.findings.map((f) => f.category))];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Scan Results</h2>
          <p className="text-sm mt-1" style={{ color: '#8892a4' }}>
            {scan.completedAt ? new Date(scan.completedAt).toLocaleString('en-ZA') : 'In progress...'}
          </p>
        </div>
        <a
          href={`/api/org/attestation/report/${scanId}`}
          className="px-6 py-3 rounded font-semibold text-sm"
          style={{ background: '#00ff88', color: '#0a0f1e' }}
        >
          Download PDF Report
        </a>
      </div>

      {scan.overallScore != null && (
        <div className="rounded-xl p-6 mb-8 flex items-center gap-6" style={{ background: '#0f1729', border: '1px solid #1a2540' }}>
          <div className="text-5xl font-bold" style={{ color: '#00d4ff' }}>{scan.overallScore}</div>
          <div>
            <div className="text-3xl font-bold text-white">Grade {scan.grade}</div>
            <p className="text-sm mt-2" style={{ color: '#8892a4' }}>{scan.aiNarrative?.slice(0, 200)}...</p>
          </div>
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat} className="mb-6">
          <h3 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: '#00d4ff' }}>
            {cat.replace(/_/g, ' ')}
          </h3>
          <div className="space-y-2">
            {scan.findings.filter((f) => f.category === cat).map((finding) => (
              <div key={finding.id} className="rounded-lg overflow-hidden" style={{ background: '#0f1729', border: '1px solid #1a2540' }}>
                <button
                  onClick={() => toggle(finding.id)}
                  className="w-full text-left flex items-center justify-between p-4 hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={finding.severity} />
                    <span className="text-white text-sm font-medium">{finding.title}</span>
                  </div>
                  <span style={{ color: '#8892a4' }}>{expanded.has(finding.id) ? '▲' : '▼'}</span>
                </button>
                {expanded.has(finding.id) && (
                  <div className="px-4 pb-4" style={{ borderTop: '1px solid #1a2540' }}>
                    <p className="text-sm mt-3 mb-3" style={{ color: '#c8d0dd' }}>{finding.description}</p>
                    {finding.remediation && (
                      <div className="rounded p-3 text-sm" style={{ background: '#141d30', color: '#00ff88' }}>
                        <strong>Fix:</strong> {finding.remediation}
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
