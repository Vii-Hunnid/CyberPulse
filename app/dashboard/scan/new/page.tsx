'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, CheckCircle2, XCircle, Shield } from 'lucide-react';

type Phase =
  | 'idle'
  | 'starting'
  | 'running'
  | 'complete'
  | 'failed';

const STAGES = [
  'Resolving DNS & SSL certificates',
  'Checking HTTP headers & security policies',
  'Probing open ports & services',
  'Scanning for vulnerabilities',
  'Querying dark web breach databases',
  'Generating AI risk narrative',
  'Computing insurance readiness score',
  'Finalising report',
];

export default function NewScanPage() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [stageIdx, setStageIdx] = useState(0);
  const [error, setError] = useState('');
  const [grade, setGrade] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const gradeColor = (g?: string | null) => {
    switch (g) {
      case 'A': return '#10b981';
      case 'B': return '#0ea5e9';
      case 'C': return '#f59e0b';
      case 'D': return '#f97316';
      default:  return '#ef4444';
    }
  };

  async function startScan() {
    const trimmed = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!trimmed) return;

    setPhase('starting');
    setError('');
    setStageIdx(0);
    setGrade(null);
    setScore(null);

    let scanId: string;
    try {
      const res = await fetch('/api/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.formErrors?.[0] ?? data.error ?? 'Failed to start scan');
        setPhase('idle');
        return;
      }
      scanId = data.scanId;
    } catch {
      setError('Could not reach the server. Is the database connected?');
      setPhase('idle');
      return;
    }

    setPhase('running');

    // Advance through fake stages while the real scan runs in background
    let si = 0;
    const stageTimer = setInterval(() => {
      si = Math.min(si + 1, STAGES.length - 1);
      setStageIdx(si);
    }, 4000);

    // Listen for real status via SSE
    const es = new EventSource(`/api/scan/${scanId}/stream`);
    eventSourceRef.current = es;

    es.addEventListener('scan:complete', (e) => {
      clearInterval(stageTimer);
      es.close();
      const d = JSON.parse(e.data);
      setGrade(d.grade ?? null);
      setScore(d.overallScore ?? null);
      setStageIdx(STAGES.length - 1);
      setPhase('complete');
      setTimeout(() => router.push(`/dashboard/scan/${scanId}`), 2000);
    });

    es.addEventListener('scan:error', () => {
      clearInterval(stageTimer);
      es.close();
      setPhase('failed');
      setError('Scan failed. Check server logs for details.');
    });

    es.onerror = () => {
      clearInterval(stageTimer);
      es.close();
      setPhase('failed');
      setError('Lost connection to scan stream.');
    };
  }

  const busy = phase === 'starting' || phase === 'running';

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', system-ui, sans-serif", maxWidth: 640 }}>
      <style>{`.mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="mono" style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 1.5, marginBottom: 4 }}>[ NEW SCAN ]</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Scan a Domain</h2>
        <p style={{ color: '#94a3b8', fontSize: 13 }}>Enter any domain to run a full security posture assessment.</p>
      </div>

      {/* Input card */}
      <div style={{ background: '#ffffff', borderRadius: 12, padding: 24, border: '1px solid #dde3ec', boxShadow: '0 2px 12px rgba(0,0,0,.04)', marginBottom: 20 }}>
        <label className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1, display: 'block', marginBottom: 10 }}>
          TARGET DOMAIN
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !busy && startScan()}
            disabled={busy || phase === 'complete'}
            style={{
              flex: 1,
              padding: '11px 14px',
              border: '1px solid #dde3ec',
              borderRadius: 7,
              fontSize: 14,
              fontFamily: 'ui-monospace, monospace',
              color: '#0f172a',
              background: busy ? '#f8fafc' : '#ffffff',
              outline: 'none',
            }}
          />
          <button
            onClick={startScan}
            disabled={busy || phase === 'complete' || !domain.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '11px 20px',
              background: busy ? '#94a3b8' : '#0ea5e9',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 12,
              borderRadius: 7,
              border: 'none',
              cursor: busy ? 'not-allowed' : 'pointer',
              fontFamily: 'ui-monospace, monospace',
              letterSpacing: .5,
              flexShrink: 0,
            }}
          >
            {busy ? <Loader2 size={13} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={13} />}
            {busy ? 'SCANNING...' : 'SCAN />'}
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
          Strips <span className="mono">https://</span> automatically. Do not include paths.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <XCircle size={15} color="#ef4444" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: '#dc2626' }}>{error}</p>
        </div>
      )}

      {/* Progress */}
      {(phase === 'running' || phase === 'starting') && (
        <div style={{ background: '#ffffff', borderRadius: 12, padding: 24, border: '1px solid #dde3ec', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
          <div className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1, marginBottom: 16 }}>[ SCAN IN PROGRESS ]</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STAGES.map((stage, i) => {
              const done = i < stageIdx;
              const active = i === stageIdx;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                    {done ? (
                      <CheckCircle2 size={14} color="#10b981" strokeWidth={1.5} />
                    ) : active ? (
                      <Loader2 size={14} color="#0ea5e9" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#dde3ec' }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: 13,
                    color: done ? '#10b981' : active ? '#0f172a' : '#94a3b8',
                    fontWeight: active ? 600 : 400,
                  }}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Complete */}
      {phase === 'complete' && (
        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 24, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid ${gradeColor(grade)}`, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="mono" style={{ fontSize: 20, fontWeight: 800, color: gradeColor(grade) }}>{score ?? '—'}</span>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#065f46', marginBottom: 2 }}>Scan complete — Grade {grade ?? '—'}</p>
            <p style={{ fontSize: 13, color: '#047857' }}>Redirecting to your full report...</p>
          </div>
        </div>
      )}

      {/* Failed */}
      {phase === 'failed' && !error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <XCircle size={15} color="#ef4444" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', marginBottom: 2 }}>Scan failed</p>
            <p style={{ fontSize: 13, color: '#7f1d1d' }}>Check that your database is connected and API keys are configured.</p>
          </div>
        </div>
      )}

      {/* What gets scanned */}
      {phase === 'idle' && (
        <div style={{ background: '#ffffff', borderRadius: 12, padding: 24, border: '1px solid #dde3ec' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Shield size={15} color="#0ea5e9" strokeWidth={1.5} />
            <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1 }}>WHAT GETS SCANNED</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              'SSL / TLS certificate chain',
              'DNS records & SPF / DMARC',
              'HTTP security headers',
              'Open ports & exposed services',
              'Known CVEs & vulnerabilities',
              'Dark web credential leaks',
              'Endpoint & file structure probe',
              'AI insurance readiness score',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#334155' }}>
                <CheckCircle2 size={12} color="#10b981" strokeWidth={1.5} />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
