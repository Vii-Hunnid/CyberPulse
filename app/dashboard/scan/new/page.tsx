'use client';

import { useState } from 'react';
import {
  Search, Loader2, CheckCircle2, XCircle, AlertTriangle,
  Shield, ChevronDown, ChevronUp, Download, RefreshCw,
  Globe, Lock, Eye, EyeOff, GitBranch,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────── */
interface Finding {
  category: string; title: string; description: string;
  severity: string; remediation?: string;
}
interface CategoryScore {
  category: string; score: number; status: 'pass' | 'warn' | 'fail';
}
interface Underwriting {
  underwritingScore?: number; insurabilityGrade?: string;
  recommendedCoverageLevel?: string; premiumIndicator?: string;
  keyRiskFactors?: string[]; positiveFactors?: string[]; summary?: string;
}
interface LiveResult {
  domain: string; overallScore: number; grade: string;
  categoryScores: CategoryScore[]; findings: Finding[];
  darkWebResults?: { source: string; breachDate: string; dataClasses: string[] }[];
  narrative?: string; underwriting?: Underwriting | null;
}

/* ─── Endpoint types ────────────────────────────────────────── */
interface ProbedEndpoint {
  path: string; label: string; type: string;
  statusCode: number | null; status: string; isExposed: boolean;
}
interface EndpointResult {
  probed: ProbedEndpoint[];
  summary: { total: number; public: number; protected: number; exposed: number };
  sitemapPages: string[];
  robotsDisallowed: string[];
}

/* ─── FNV-1a 32-bit hash (deterministic, no crypto) ─────────── */
function shortHash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (Math.imul(h, 0x01000193) >>> 0);
  }
  return h.toString(16).padStart(8, '0').toUpperCase().slice(0, 7);
}

/* ─── Merkle chain component ────────────────────────────────── */
function MerkleChain({ result }: { result: { domain: string; overallScore: number; grade: string; categoryScores: { category: string; score: number; status: string }[]; findings: { severity: string }[] } }) {
  const CAT_LABEL: Record<string, string> = {
    DNS_EMAIL: 'Email Security', SSL_TLS: 'SSL / TLS', HTTP_HEADERS: 'HTTP Headers',
    OPEN_PORTS: 'Open Ports', CVE_EXPOSURE: 'CVEs', BACKUP_HYGIENE: 'Backups', DARK_WEB: 'Dark Web',
  };
  const rootInput = `${result.domain}:${result.overallScore}:${result.grade}`;
  const rootHash = shortHash(rootInput);
  const catHashes = result.categoryScores.map((c) => ({
    ...c,
    hash: shortHash(`${rootHash}:${c.category}:${c.score}`),
  }));
  const statusCol = (s: string) => s === 'pass' ? '#10b981' : s === 'warn' ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ background: '#ffffff', borderRadius: 12, padding: '20px 24px', border: '1px solid #dde3ec' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <GitBranch size={14} color="#0ea5e9" strokeWidth={1.5} />
        <h3 className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1 }}>[ MERKLE INTEGRITY CHAIN ]</h3>
      </div>
      <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>
        Deterministic hash tree proving the scan result has not been tampered with. Each node hashes its parent + category data.
      </p>

      {/* Root node */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ background: '#0c1220', borderRadius: 10, padding: '12px 20px', textAlign: 'center', minWidth: 240 }}>
          <div className="mono" style={{ fontSize: 9, color: '#0ea5e9', letterSpacing: 1.5, marginBottom: 4 }}>ROOT · INTEGRITY ANCHOR</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>{result.domain}</div>
          <div className="mono" style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>{rootHash}</div>
        </div>
        <div style={{ width: 2, height: 20, background: '#dde3ec' }} />
      </div>

      {/* Category leaf nodes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
        {catHashes.map((c) => {
          const col = statusCol(c.status);
          return (
            <div key={c.category} style={{ borderRadius: 8, border: `1px solid ${col}22`, background: `${col}08`, padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: col, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>{CAT_LABEL[c.category] ?? c.category}</span>
              </div>
              <div className="mono" style={{ fontSize: 9, color: col, marginBottom: 3 }}>{c.status.toUpperCase()} · {c.score}/100</div>
              <div className="mono" style={{ fontSize: 8, color: '#94a3b8', wordBreak: 'break-all' }}>{c.hash}</div>
            </div>
          );
        })}
      </div>

      {/* Leaf count */}
      <div style={{ display: 'flex', gap: 20, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, marginTop: 8 }}>
        <div>
          <span className="mono" style={{ fontSize: 10, color: '#64748b' }}>FINDINGS HASHED: </span>
          <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: '#0f172a' }}>{result.findings.length}</span>
        </div>
        <div>
          <span className="mono" style={{ fontSize: 10, color: '#64748b' }}>CATEGORIES: </span>
          <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: '#0f172a' }}>{result.categoryScores.length}</span>
        </div>
        <div>
          <span className="mono" style={{ fontSize: 10, color: '#64748b' }}>ROOT HASH: </span>
          <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: '#0ea5e9' }}>{rootHash}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Endpoint panel component ──────────────────────────────── */
function EndpointPanel({ domain }: { domain: string }) {
  const [state, setState] = useState<'idle'|'loading'|'done'|'error'>('idle');
  const [data, setData] = useState<EndpointResult | null>(null);
  const [filter, setFilter] = useState<string>('all');

  async function run() {
    setState('loading');
    try {
      const res = await fetch('/api/scan/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      if (!res.ok) { setState('error'); return; }
      setData(await res.json());
      setState('done');
    } catch { setState('error'); }
  }

  const TYPE_FILTERS = ['all', 'page', 'api', 'auth', 'admin', 'sensitive', 'wellknown'];
  const filtered = data?.probed.filter((e) => filter === 'all' || e.type === filter) ?? [];

  const statusBadge = (ep: ProbedEndpoint) => {
    if (ep.isExposed)             return { label: 'EXPOSED', col: '#ef4444', bg: '#fef2f2' };
    if (ep.status === 'public')   return { label: 'PUBLIC',  col: '#f59e0b', bg: '#fffbeb' };
    if (ep.status === 'protected')return { label: 'PROTECTED',col: '#10b981', bg: '#f0fdf4' };
    if (ep.status === 'not-found')return { label: '404',     col: '#94a3b8', bg: '#f8fafc' };
    return                               { label: 'ERROR',   col: '#ef4444', bg: '#fef2f2' };
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: 12, padding: '20px 24px', border: '1px solid #dde3ec' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={14} color="#0ea5e9" strokeWidth={1.5} />
          <h3 className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1 }}>[ ENDPOINT & PAGE DISCOVERY ]</h3>
        </div>
        {state === 'idle' && (
          <button onClick={run} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 11, borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'ui-monospace, monospace', letterSpacing: .5 }}>
            <Search size={12} /> DISCOVER ENDPOINTS /&gt;
          </button>
        )}
        {state === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#94a3b8' }}>
            <Loader2 size={13} className="spin" /> Probing {domain}…
          </div>
        )}
        {state === 'error' && (
          <button onClick={run} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
        )}
      </div>

      {state === 'idle' && (
        <p style={{ fontSize: 13, color: '#94a3b8' }}>
          Probe pages, API routes, admin panels, authentication endpoints, and sensitive paths on <strong style={{ color: '#0f172a' }}>{domain}</strong>.
          Classifies each as public, protected, exposed, or not found.
        </p>
      )}

      {state === 'done' && data && (
        <>
          {/* Summary bar */}
          <div style={{ display: 'flex', gap: 20, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { label: 'PROBED', val: data.summary.total, col: '#0f172a' },
              { label: 'PUBLIC', val: data.summary.public, col: '#f59e0b' },
              { label: 'PROTECTED', val: data.summary.protected, col: '#10b981' },
              { label: 'EXPOSED', val: data.summary.exposed, col: '#ef4444' },
              { label: 'SITEMAP PAGES', val: data.sitemapPages.length, col: '#0ea5e9' },
            ].map(({ label, val, col }) => (
              <div key={label}>
                <span className="mono" style={{ fontSize: 10, color: '#64748b' }}>{label}: </span>
                <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: col }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Exposed alert */}
          {data.summary.exposed > 0 && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, padding: '10px 14px', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertTriangle size={13} color="#ef4444" strokeWidth={2} />
              <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>
                {data.summary.exposed} EXPOSED ENDPOINT{data.summary.exposed > 1 ? 'S' : ''} — should be access-controlled
              </span>
            </div>
          )}

          {/* Sitemap pages */}
          {data.sitemapPages.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div className="mono" style={{ fontSize: 10, fontWeight: 600, color: '#64748b', letterSpacing: 1, marginBottom: 8 }}>SITEMAP.XML PAGES ({data.sitemapPages.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {data.sitemapPages.slice(0, 20).map((p, i) => (
                  <span key={i} style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', background: '#f0f4f8', color: '#334155', padding: '3px 8px', borderRadius: 4 }}>{p}</span>
                ))}
                {data.sitemapPages.length > 20 && <span style={{ fontSize: 11, color: '#94a3b8' }}>+{data.sitemapPages.length - 20} more</span>}
              </div>
            </div>
          )}

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {TYPE_FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #dde3ec', background: filter === f ? '#0ea5e9' : '#f0f4f8', color: filter === f ? '#fff' : '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'ui-monospace, monospace' }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Endpoint list */}
          <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filtered.map((ep, i) => {
              const b = statusBadge(ep);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 7, background: ep.isExposed ? '#fef2f2' : '#f8fafc', border: `1px solid ${ep.isExposed ? '#fecaca' : '#dde3ec'}` }}>
                  {ep.isExposed ? <EyeOff size={13} color="#ef4444" strokeWidth={1.5} /> : ep.status === 'protected' ? <Lock size={13} color="#10b981" strokeWidth={1.5} /> : <Eye size={13} color="#94a3b8" strokeWidth={1.5} />}
                  <span className="mono" style={{ flex: 1, fontSize: 11, color: '#334155' }}>{ep.path}</span>
                  <span style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'ui-monospace, monospace' }}>{ep.type}</span>
                  <span style={{ background: b.bg, color: b.col, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, fontFamily: 'ui-monospace, monospace' }}>{b.label}</span>
                  {ep.statusCode && <span className="mono" style={{ fontSize: 10, color: '#94a3b8', minWidth: 28, textAlign: 'right' }}>{ep.statusCode}</span>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────────── */
const GRADE_COLOR: Record<string, string> = { A: '#10b981', B: '#0ea5e9', C: '#f59e0b', D: '#f97316', F: '#ef4444' };
const SEV_COLOR: Record<string, string> = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#0ea5e9', INFO: '#94a3b8' };
const SEV_BG: Record<string, string>    = { CRITICAL: '#fef2f2', HIGH: '#fff7ed', MEDIUM: '#fffbeb', LOW: '#eff6ff', INFO: '#f8fafc' };
const SEV_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
const CAT_LABEL: Record<string, string> = {
  DNS_EMAIL: 'Email Security', SSL_TLS: 'SSL / TLS', HTTP_HEADERS: 'Security Headers',
  OPEN_PORTS: 'Open Ports', CVE_EXPOSURE: 'Vulnerabilities', BACKUP_HYGIENE: 'Backup Hygiene', DARK_WEB: 'Dark Web',
};
const STAGES = [
  'Resolving DNS & SSL certificates …',
  'Checking HTTP security headers …',
  'Probing open ports & services …',
  'Scanning for known vulnerabilities …',
  'Querying dark web breach databases …',
  'Generating AI risk narrative …',
  'Computing insurance readiness score …',
  'Finalising report …',
];

function gc(g?: string) { return GRADE_COLOR[g ?? 'F'] ?? '#ef4444'; }

function ScoreRing({ score, grade, size = 96 }: { score: number; grade: string; size?: number }) {
  const col = gc(grade);
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: `4px solid ${col}`, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: size * 0.3, fontWeight: 800, color: col, lineHeight: 1, fontFamily: 'ui-monospace, monospace' }}>{score}</div>
        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>/ 100</div>
      </div>
    </div>
  );
}

function FindingRow({ f }: { f: Finding }) {
  const [open, setOpen] = useState(false);
  const col = SEV_COLOR[f.severity] ?? '#94a3b8';
  const bg  = SEV_BG[f.severity]  ?? '#f8fafc';
  return (
    <div style={{ border: '1px solid #dde3ec', borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', background: bg, border: 'none', cursor: 'pointer', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}
      >
        <span style={{ background: col, color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 4, padding: '2px 6px', fontFamily: 'ui-monospace, monospace', letterSpacing: .5, flexShrink: 0 }}>
          {f.severity}
        </span>
        <span style={{ flex: 1, fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{f.title}</span>
        <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'ui-monospace, monospace', marginRight: 4 }}>{CAT_LABEL[f.category] ?? f.category}</span>
        {open ? <ChevronUp size={13} color="#94a3b8" /> : <ChevronDown size={13} color="#94a3b8" />}
      </button>
      {open && (
        <div style={{ padding: '12px 14px', background: '#ffffff', borderTop: '1px solid #dde3ec' }}>
          <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, marginBottom: f.remediation ? 10 : 0 }}>{f.description}</p>
          {f.remediation && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '10px 12px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#065f46', fontFamily: 'ui-monospace, monospace', letterSpacing: .5, marginBottom: 4 }}>REMEDIATION</p>
              <p style={{ fontSize: 13, color: '#047857', lineHeight: 1.6 }}>{f.remediation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function NewScanPage() {
  const [domain, setDomain]   = useState('');
  const [busy, setBusy]       = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState<LiveResult | null>(null);
  const [sevFilter, setSevFilter] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  async function downloadPdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const payload = {
        domain: result.domain,
        overallScore: result.overallScore,
        grade: result.grade,
        categoryResults: result.categoryScores.map((c) => ({
          category: c.category,
          status: c.status,
          summary: c.score >= 80 ? 'No issues detected' : c.score >= 50 ? 'Some issues found' : 'Critical issues found',
        })),
        top3Findings: result.findings
          .sort((a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity))
          .slice(0, 3)
          .map((f) => ({ title: f.title, severity: f.severity })),
        darkWebBreachCount: result.darkWebResults?.length ?? 0,
        underwritingGrade: result.underwriting?.insurabilityGrade ?? result.grade,
        narrative: result.narrative,
      };
      const res = await fetch('/api/scan/free/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { setPdfLoading(false); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cyberpulse-report-${result.domain}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
    setPdfLoading(false);
  }

  async function startScan() {
    const trimmed = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!trimmed) return;
    setBusy(true); setError(''); setResult(null); setStageIdx(0);

    // Advance progress stages while waiting
    let si = 0;
    const timer = setInterval(() => {
      si = Math.min(si + 1, STAGES.length - 1);
      setStageIdx(si);
    }, 5000);

    try {
      const res = await fetch('/api/scan/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: trimmed }),
      });
      clearInterval(timer);
      if (!res.ok) {
        const d = await res.json();
        setError(d.error?.formErrors?.[0] ?? d.error ?? 'Scan failed.');
        setBusy(false); return;
      }
      const data: LiveResult = await res.json();
      setResult(data);
    } catch {
      clearInterval(timer);
      setError('Network error — could not reach the scanner.');
    }
    setBusy(false);
  }

  const sevCounts = result
    ? SEV_ORDER.reduce<Record<string, number>>((acc, s) => {
        acc[s] = result.findings.filter((f) => f.severity === s).length;
        return acc;
      }, {})
    : {};

  const visibleFindings = result
    ? (sevFilter ? result.findings.filter((f) => f.severity === sevFilter) : result.findings)
        .sort((a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity))
    : [];

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 1.5, marginBottom: 4 }}>[ SECURITY SCAN ]</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
            {result ? result.domain : 'Scan a Domain'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>
            {result ? `Full security posture assessment` : 'Enter any domain to run a full security assessment.'}
          </p>
        </div>
        {result && (
          <button onClick={() => { setResult(null); setDomain(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#ffffff', color: '#0ea5e9', fontWeight: 700, fontSize: 11, borderRadius: 7, border: '1px solid #bfdbfe', cursor: 'pointer', fontFamily: 'ui-monospace, monospace', letterSpacing: .5 }}>
            <RefreshCw size={12} /> NEW SCAN
          </button>
        )}
      </div>

      {/* ── Input ── */}
      {!result && (
        <div style={{ background: '#ffffff', borderRadius: 12, padding: 24, border: '1px solid #dde3ec', boxShadow: '0 2px 12px rgba(0,0,0,.04)', marginBottom: 20 }}>
          <label className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1, display: 'block', marginBottom: 10 }}>TARGET DOMAIN</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text" placeholder="example.com" value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !busy && startScan()}
              disabled={busy}
              style={{ flex: 1, padding: '11px 14px', border: '1px solid #dde3ec', borderRadius: 7, fontSize: 14, fontFamily: 'ui-monospace, monospace', color: '#0f172a', background: busy ? '#f8fafc' : '#ffffff', outline: 'none' }}
            />
            <button onClick={startScan} disabled={busy || !domain.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 22px', background: busy ? '#94a3b8' : '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 12, borderRadius: 7, border: 'none', cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'ui-monospace, monospace', letterSpacing: .5, flexShrink: 0 }}>
              {busy ? <Loader2 size={13} className="spin" /> : <Search size={13} />}
              {busy ? 'SCANNING...' : 'SCAN />'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>Strips https:// automatically. Do not include paths.</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <XCircle size={15} color="#ef4444" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: '#dc2626' }}>{error}</p>
        </div>
      )}

      {/* ── Progress ── */}
      {busy && (
        <div style={{ background: '#ffffff', borderRadius: 12, padding: 24, border: '1px solid #dde3ec', boxShadow: '0 2px 12px rgba(0,0,0,.04)', marginBottom: 20 }}>
          <div className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1, marginBottom: 16 }}>[ SCAN IN PROGRESS ]</div>
          {STAGES.map((stage, i) => {
            const done = i < stageIdx; const active = i === stageIdx;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 20, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                  {done   ? <CheckCircle2 size={14} color="#10b981" strokeWidth={1.5} />
                  : active ? <Loader2 size={14} color="#0ea5e9" strokeWidth={2} className="spin" />
                  : <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#dde3ec' }} />}
                </div>
                <span style={{ fontSize: 13, color: done ? '#10b981' : active ? '#0f172a' : '#94a3b8', fontWeight: active ? 600 : 400 }}>{stage}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════ RESULTS ══════════════════════════ */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Score card */}
          <div style={{ background: '#ffffff', borderRadius: 12, padding: '24px 28px', border: '1px solid #dde3ec', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 2px 12px rgba(0,0,0,.04)', flexWrap: 'wrap' }}>
            <ScoreRing score={result.overallScore} grade={result.grade} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: gc(result.grade), fontFamily: 'ui-monospace, monospace' }}>GRADE {result.grade}</span>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {SEV_ORDER.slice(0, 4).map((s) => sevCounts[s] > 0 && (
                  <div key={s}>
                    <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: SEV_COLOR[s], lineHeight: 1 }}>{sevCounts[s]}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.charAt(0) + s.slice(1).toLowerCase()}</div>
                  </div>
                ))}
                {result.findings.length === 0 && <p style={{ fontSize: 13, color: '#10b981' }}>No issues found</p>}
              </div>
            </div>
            <button
              onClick={downloadPdf}
              disabled={pdfLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: pdfLoading ? '#94a3b8' : '#10b981', color: '#fff', fontWeight: 700, fontSize: 11, borderRadius: 7, border: 'none', cursor: pdfLoading ? 'not-allowed' : 'pointer', fontFamily: 'ui-monospace, monospace', letterSpacing: .5, flexShrink: 0 }}
            >
              {pdfLoading ? <Loader2 size={13} className="spin" /> : <Download size={13} />}
              {pdfLoading ? 'GENERATING...' : 'DOWNLOAD PDF'}
            </button>
          </div>

          {/* Category grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {result.categoryScores.map((cat) => {
              const col = cat.status === 'pass' ? '#10b981' : cat.status === 'warn' ? '#f59e0b' : '#ef4444';
              const bg  = cat.status === 'pass' ? '#f0fdf4' : cat.status === 'warn' ? '#fffbeb' : '#fef2f2';
              const StatusIc = cat.status === 'pass' ? CheckCircle2 : cat.status === 'warn' ? AlertTriangle : XCircle;
              return (
                <div key={cat.category} style={{ background: '#ffffff', borderRadius: 10, padding: '16px 18px', border: '1px solid #dde3ec', borderTop: `3px solid ${col}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <StatusIc size={14} color={col} strokeWidth={1.5} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{CAT_LABEL[cat.category] ?? cat.category}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: col }}>{cat.score}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>/ 100</div>
                </div>
              );
            })}
          </div>

          {/* AI Narrative */}
          {result.narrative && (
            <div style={{ background: '#ffffff', borderRadius: 10, padding: '20px 24px', border: '1px solid #dde3ec', borderLeft: `3px solid ${gc(result.grade)}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Shield size={14} color="#0ea5e9" strokeWidth={1.5} />
                <h3 className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1 }}>[ AI RISK NARRATIVE ]</h3>
              </div>
              <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{result.narrative}</p>
            </div>
          )}

          {/* Findings */}
          {result.findings.length > 0 && (
            <div style={{ background: '#ffffff', borderRadius: 12, padding: '20px 24px', border: '1px solid #dde3ec' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <h3 className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1 }}>[ FINDINGS — {result.findings.length} TOTAL ]</h3>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => setSevFilter(null)}
                    style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #dde3ec', background: !sevFilter ? '#0ea5e9' : '#f0f4f8', color: !sevFilter ? '#fff' : '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'ui-monospace, monospace' }}>
                    ALL
                  </button>
                  {SEV_ORDER.filter((s) => sevCounts[s] > 0).map((s) => (
                    <button key={s} onClick={() => setSevFilter(sevFilter === s ? null : s)}
                      style={{ padding: '4px 10px', borderRadius: 5, border: `1px solid ${SEV_COLOR[s]}`, background: sevFilter === s ? SEV_COLOR[s] : SEV_BG[s], color: sevFilter === s ? '#fff' : SEV_COLOR[s], fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'ui-monospace, monospace' }}>
                      {s} ({sevCounts[s]})
                    </button>
                  ))}
                </div>
              </div>
              <div>{visibleFindings.map((f, i) => <FindingRow key={i} f={f} />)}</div>
            </div>
          )}

          {/* Insurance / Underwriting */}
          {result.underwriting && (
            <div style={{ background: '#ffffff', borderRadius: 12, padding: '20px 24px', border: '1px solid #dde3ec' }}>
              <h3 className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1, marginBottom: 16 }}>[ INSURANCE READINESS ]</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', border: `4px solid ${gc(result.underwriting.insurabilityGrade)}`, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="mono" style={{ fontSize: 22, fontWeight: 800, color: gc(result.underwriting.insurabilityGrade) }}>
                    {result.underwriting.underwritingScore ?? 0}
                  </span>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: gc(result.underwriting.insurabilityGrade), marginBottom: 4 }}>
                    GRADE {result.underwriting.insurabilityGrade ?? '—'}
                  </div>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{result.underwriting.recommendedCoverageLevel ?? '—'}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Recommended Coverage</div>
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: gc(result.underwriting.insurabilityGrade) }}>{result.underwriting.premiumIndicator ?? '—'}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Premium Indicator</div>
                    </div>
                  </div>
                </div>
              </div>
              {result.underwriting.summary && (
                <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, marginBottom: 14, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, borderLeft: `3px solid ${gc(result.underwriting.insurabilityGrade)}` }}>
                  {result.underwriting.summary}
                </p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {result.underwriting.keyRiskFactors && result.underwriting.keyRiskFactors.length > 0 && (
                  <div>
                    <p className="mono" style={{ fontSize: 10, fontWeight: 600, color: '#ef4444', letterSpacing: 1, marginBottom: 8 }}>KEY RISK FACTORS</p>
                    {result.underwriting.keyRiskFactors.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: 7, fontSize: 12, color: '#334155', marginBottom: 6 }}>
                        <XCircle size={12} color="#ef4444" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                      </div>
                    ))}
                  </div>
                )}
                {result.underwriting.positiveFactors && result.underwriting.positiveFactors.length > 0 && (
                  <div>
                    <p className="mono" style={{ fontSize: 10, fontWeight: 600, color: '#10b981', letterSpacing: 1, marginBottom: 8 }}>POSITIVE FACTORS</p>
                    {result.underwriting.positiveFactors.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: 7, fontSize: 12, color: '#334155', marginBottom: 6 }}>
                        <CheckCircle2 size={12} color="#10b981" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dark Web */}
          {result.darkWebResults && result.darkWebResults.length > 0 && (
            <div style={{ background: '#ffffff', borderRadius: 12, padding: '20px 24px', border: '1px solid #dde3ec', borderTop: '3px solid #ef4444' }}>
              <h3 className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', letterSpacing: 1, marginBottom: 14 }}>[ DARK WEB EXPOSURES — {result.darkWebResults.length} BREACHES ]</h3>
              {result.darkWebResults.map((b, i) => (
                <div key={i} style={{ padding: '12px 14px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>{b.source}</span>
                    <span className="mono" style={{ fontSize: 11, color: '#94a3b8' }}>{b.breachDate}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#7f1d1d' }}>Exposed: {b.dataClasses.join(', ')}</p>
                </div>
              ))}
            </div>
          )}

          {/* No dark web message */}
          {(!result.darkWebResults || result.darkWebResults.length === 0) && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <CheckCircle2 size={16} color="#10b981" strokeWidth={1.5} />
              <p style={{ fontSize: 13, color: '#065f46' }}>No dark web breach exposures detected for <strong>{result.domain}</strong>.</p>
            </div>
          )}

          {/* Endpoint & Page Discovery */}
          <EndpointPanel domain={result.domain} />

          {/* Merkle Integrity Chain */}
          <MerkleChain result={result} />

        </div>
      )}

      {/* What gets scanned (idle) */}
      {!result && !busy && (
        <div style={{ background: '#ffffff', borderRadius: 12, padding: 24, border: '1px solid #dde3ec' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Shield size={15} color="#0ea5e9" strokeWidth={1.5} />
            <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1 }}>WHAT GETS SCANNED</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['SSL / TLS certificate chain', 'DNS records & SPF / DMARC', 'HTTP security headers', 'Open ports & exposed services', 'Known CVEs & vulnerabilities', 'Dark web credential leaks', 'Endpoint & file structure probe', 'AI insurance readiness score'].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#334155' }}>
                <CheckCircle2 size={12} color="#10b981" strokeWidth={1.5} />{item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
