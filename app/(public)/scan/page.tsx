'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2, AlertTriangle, XCircle, Loader2,
  Download, Lock, Shield, Mail,
} from 'lucide-react';

interface CategoryResult { category: string; status: 'pass' | 'warn' | 'fail'; summary: string; }
interface TeaserFinding  { title: string; severity: string; }
interface ScanPayload {
  domain: string; overallScore: number; grade: string;
  categoryResults: CategoryResult[]; top3Findings: TeaserFinding[];
  darkWebBreachCount: number; underwritingGrade: string; narrative?: string; scanId: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  DNS_EMAIL: 'Email Security', SSL_TLS: 'SSL Certificate',
  HTTP_HEADERS: 'Security Headers', DARK_WEB: 'Dark Web',
  OPEN_PORTS: 'Open Ports', CVE_EXPOSURE: 'Vulnerabilities',
};

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#0ea5e9', INFO: '#94a3b8',
};
const SEVERITY_BG: Record<string, string> = {
  CRITICAL: '#fef2f2', HIGH: '#fff7ed', MEDIUM: '#fffbeb', LOW: '#eff6ff', INFO: '#f8fafc',
};
const SEVERITY_BORDER: Record<string, string> = {
  CRITICAL: '#fecaca', HIGH: '#fed7aa', MEDIUM: '#fde68a', LOW: '#bfdbfe', INFO: '#dde3ec',
};

function StatusIcon({ status }: { status: 'pass' | 'warn' | 'fail' | 'scanning' }) {
  if (status === 'scanning') return <Loader2 size={15} color="#94a3b8" style={{ animation: 'spin 1s linear infinite' }} />;
  if (status === 'pass') return <CheckCircle2 size={15} color="#10b981" />;
  if (status === 'warn') return <AlertTriangle size={15} color="#f59e0b" />;
  return <XCircle size={15} color="#ef4444" />;
}

function GradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#10b981';
    case 'B': return '#0ea5e9';
    case 'C': return '#f59e0b';
    case 'D': return '#f97316';
    default:  return '#ef4444';
  }
}
function GradeBg(grade: string): string {
  switch (grade) {
    case 'A': return '#f0fdf4';
    case 'B': return '#eff6ff';
    case 'C': return '#fffbeb';
    case 'D': return '#fff7ed';
    default:  return '#fef2f2';
  }
}

function MarkdownBlock({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) { elements.push(<div key={idx} style={{ height: 6 }} />); return; }
    const parseBold = (s: string): React.ReactNode[] =>
      s.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? <strong key={i} style={{ color: '#0f172a' }}>{p.slice(2, -2)}</strong> : p
      );
    if (/^### /.test(line)) elements.push(<h4 key={idx} style={{ color: '#0ea5e9', fontWeight: 700, fontSize: 13, margin: '12px 0 3px' }}>{parseBold(line.replace(/^### /, ''))}</h4>);
    else if (/^## /.test(line)) elements.push(<h3 key={idx} style={{ color: '#0f172a', fontWeight: 700, fontSize: 15, margin: '16px 0 5px' }}>{parseBold(line.replace(/^## /, ''))}</h3>);
    else if (/^# /.test(line)) elements.push(<h2 key={idx} style={{ color: '#0ea5e9', fontWeight: 800, fontSize: 17, margin: '0 0 8px' }}>{parseBold(line.replace(/^# /, ''))}</h2>);
    else if (/^[-*] /.test(line)) elements.push(
      <div key={idx} style={{ display: 'flex', gap: 8, margin: '3px 0', paddingLeft: 4 }}>
        <span style={{ color: '#0ea5e9', flexShrink: 0 }}>•</span>
        <span style={{ color: '#334155', fontSize: 13, lineHeight: 1.6 }}>{parseBold(line.replace(/^[-*] /, ''))}</span>
      </div>
    );
    else elements.push(<p key={idx} style={{ color: '#334155', fontSize: 13, margin: '3px 0', lineHeight: 1.6 }}>{parseBold(line)}</p>);
  });
  return <div>{elements}</div>;
}

function ScanContent() {
  const searchParams = useSearchParams();
  const [domain, setDomain] = useState(searchParams.get('domain') ?? '');
  const [step, setStep] = useState<'input' | 'scanning' | 'result'>('input');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ScanPayload | null>(null);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [epState, setEpState] = useState<'idle'|'loading'|'done'|'error'>('idle');
  const [epData, setEpData] = useState<{
    probed: { path: string; label: string; type: string; statusCode: number|null; status: string; isExposed: boolean }[];
    summary: { total: number; public: number; protected: number; exposed: number };
    sitemapPages: string[];
  } | null>(null);

  const runScan = useCallback(async (d: string) => {
    setStep('scanning'); setError(''); setTimeLeft(60);
    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    try {
      const res = await fetch('/api/scan/free', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain: d }) });
      clearInterval(timer);
      if (!res.ok) {
        const err = await res.json();
        setError(res.status === 429 ? 'Rate limit reached. You can run 3 free scans per 24 hours.' : (err.error ?? 'Scan failed. Please try again.'));
        setStep('input'); return;
      }
      setResult(await res.json()); setStep('result');
    } catch {
      clearInterval(timer);
      setError('Network error. Please try again.'); setStep('input');
    }
  }, []);

  useEffect(() => {
    const d = searchParams.get('domain');
    if (d) { setDomain(d); runScan(d); }
  }, [searchParams, runScan]);

  async function runEndpointDiscovery() {
    if (!result) return;
    setEpState('loading');
    try {
      const res = await fetch('/api/scan/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: result.domain }),
      });
      if (!res.ok) throw new Error();
      setEpData(await res.json());
      setEpState('done');
    } catch {
      setEpState('error');
    }
  }

  async function sendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!result) return;
    await fetch('/api/scan/free/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, scanId: result.scanId }) });
    setEmailSent(true);
  }

  async function downloadPdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const res = await fetch('/api/scan/free/pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result) });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `cyberpulse-report-${result.domain}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { /* silently ignore */ } finally { setPdfLoading(false); }
  }

  const resetScan = () => { setStep('input'); setDomain(''); setResult(null); setError(''); };

  // ─── Shared styles ──────────────────────────────────────────────────────────
  const globalStyles = `
    *, *::before, *::after { box-sizing: border-box; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }
    .scan-input:focus { border-color: rgba(14,165,233,.4) !important; outline: none; box-shadow: 0 0 0 3px rgba(14,165,233,.08); }
    .scan-input { transition: border-color .2s; }
  `;

  // ─── Input state ────────────────────────────────────────────────────────────
  if (step === 'input') {
    return (
      <div style={{ minHeight: '100vh', background: '#0c1220', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <style>{globalStyles + `
          @keyframes gridPan { 0% { background-position: 0 0; } 100% { background-position: 60px 60px; } }
          .hero-grid {
            background-image: linear-gradient(rgba(14,165,233,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,.05) 1px,transparent 1px);
            background-size: 60px 60px; animation: gridPan 14s linear infinite;
          }
        `}</style>

        {/* Nav */}
        <header style={{ padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', borderBottom: '1px solid #1e2d45' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Shield size={14} color="#00d4ff" strokeWidth={1.5} />
            <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>CyberPulse</span>
          </Link>
        </header>

        <div className="hero-grid" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
          <div style={{ maxWidth: 560, width: '100%', textAlign: 'center', position: 'relative' }}>
            <div className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(14,165,233,.08)', border: '1px solid rgba(14,165,233,.2)', borderRadius: 4, padding: '4px 12px', marginBottom: 24 }}>
              <span style={{ color: '#0ea5e9', fontSize: 10, letterSpacing: 1.5 }}>[ FREE SECURITY SCAN ]</span>
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 800, color: '#f8fafc', marginBottom: 12, lineHeight: 1.1, letterSpacing: '-1px' }}>
              SCAN YOUR DOMAIN
            </h1>
            <p style={{ color: '#64748b', marginBottom: 36, fontSize: 15, lineHeight: 1.65 }}>
              Six security checks. Instant results. No account required.
            </p>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '11px 16px', borderRadius: 8, marginBottom: 18, fontSize: 13, textAlign: 'left' }}>
                {error}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); if (domain) runScan(domain); }} style={{ display: 'flex', gap: 0, border: '1px solid #1e2d45', borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,.03)' }}>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="// yourbusiness.co.za"
                className="scan-input mono"
                style={{ flex: 1, padding: '15px 18px', background: 'transparent', border: 'none', color: '#f8fafc', fontSize: 14 }}
              />
              <button type="submit" className="mono" style={{ padding: '15px 26px', background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', letterSpacing: .5, flexShrink: 0 }}>
                SCAN /&gt;
              </button>
            </form>

            <Link href="/" style={{ color: '#334155', fontSize: 12, marginTop: 18, display: 'block', textDecoration: 'none' }}>← Back to home</Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Scanning state ─────────────────────────────────────────────────────────
  if (step === 'scanning') {
    const FREE_CATS = ['DNS_EMAIL', 'SSL_TLS', 'HTTP_HEADERS', 'DARK_WEB'];
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <style>{globalStyles}</style>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div className="mono" style={{ fontSize: 10, color: '#0ea5e9', letterSpacing: 2, marginBottom: 8 }}>[ SCANNING IN PROGRESS ]</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{domain}</h2>
            <p style={{ color: '#94a3b8', marginTop: 6, fontSize: 13 }}>Estimated time remaining: {timeLeft}s</p>
          </div>

          <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #dde3ec', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.06)', marginBottom: 16 }}>
            {FREE_CATS.map((cat, i) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: i < FREE_CATS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <StatusIcon status="scanning" />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#334155' }}>{CATEGORY_LABELS[cat]}</span>
                <span className="mono" style={{ color: '#94a3b8', fontSize: 10, letterSpacing: .5 }}>RUNNING...</span>
              </div>
            ))}
          </div>

          <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#0ea5e9', borderRadius: 2, width: `${((60 - timeLeft) / 60) * 100}%`, transition: 'width 1s linear' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  // ─── Result state ───────────────────────────────────────────────────────────
  const gCol = GradeColor(result.grade);
  const gBg  = GradeBg(result.grade);
  const defaultNarrative =
    result.overallScore < 45
      ? 'Your business has critical security gaps that put you at significant risk of a cyber attack or data breach.'
      : result.overallScore < 75
      ? 'Your business has significant security weaknesses that need attention before they can be exploited.'
      : 'Your business has a reasonable security posture with some areas for improvement.';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{globalStyles}</style>

      {/* Top nav */}
      <header style={{ background: '#0c1220', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d45', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <Shield size={14} color="#00d4ff" strokeWidth={1.5} />
          <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>CyberPulse</span>
        </Link>
        <div className="mono" style={{ fontSize: 11, color: '#334155', letterSpacing: .5 }}>{result.domain}</div>
      </header>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '28px 20px 48px' }}>

        {/* Score card */}
        <div style={{ background: '#ffffff', borderRadius: 14, padding: '28px 28px', border: '1px solid #dde3ec', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', boxShadow: '0 4px 20px rgba(0,0,0,.05)' }}>
          <div style={{ width: 110, height: 110, borderRadius: '50%', border: `4px solid ${gCol}`, background: gBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 36, fontWeight: 800, color: gCol, lineHeight: 1 }}>{result.overallScore}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>/ 100</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: gBg, border: `1px solid ${gCol}22`, borderRadius: 7, padding: '6px 16px', marginBottom: 14 }}>
              <span className="mono" style={{ fontSize: 20, fontWeight: 800, color: gCol }}>GRADE {result.grade}</span>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '16px 18px', border: '1px solid #e2e8f0' }}>
              {result.narrative
                ? <MarkdownBlock text={result.narrative} />
                : <p style={{ color: '#334155', fontSize: 13, margin: 0 }}>{defaultNarrative}</p>
              }
            </div>
          </div>
        </div>

        {/* Category grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 14 }}>
          {result.categoryResults.map((cat) => {
            const statusBorder = cat.status === 'pass' ? '#10b981' : cat.status === 'warn' ? '#f59e0b' : '#ef4444';
            return (
              <div key={cat.category} style={{ background: '#ffffff', borderRadius: 10, padding: '14px 16px', border: '1px solid #dde3ec', borderTop: `3px solid ${statusBorder}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                  <StatusIcon status={cat.status} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{CATEGORY_LABELS[cat.category] ?? cat.category}</span>
                </div>
                <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{cat.summary}</p>
              </div>
            );
          })}
        </div>

        {/* Top findings */}
        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #dde3ec', overflow: 'hidden', marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,.03)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1.5 }}>[ TOP SECURITY FINDINGS ]</h3>
          </div>
          {result.top3Findings.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none', borderLeft: `3px solid ${SEVERITY_COLOR[f.severity] ?? '#94a3b8'}`, background: SEVERITY_BG[f.severity] ?? '#f8fafc' }}>
              <span className="mono" style={{ fontSize: 9, fontWeight: 700, background: SEVERITY_COLOR[f.severity], color: '#fff', padding: '2px 7px', borderRadius: 3, flexShrink: 0, letterSpacing: .5 }}>{f.severity}</span>
              <span style={{ flex: 1, fontSize: 13, color: '#334155' }}>{f.title}</span>
              <Lock size={12} color="#cbd5e1" strokeWidth={1.5} />
            </div>
          ))}
          <div style={{ padding: '10px 20px', background: '#f8fafc' }}>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>Create a free account to unlock remediation steps for all findings</p>
          </div>
        </div>

        {/* Endpoint discovery */}
        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #dde3ec', marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: 1.5 }}>[ ENDPOINT &amp; PAGE DISCOVERY ]</h3>
            {epState === 'done' && epData && (
              <div style={{ display: 'flex', gap: 10 }}>
                <span className="mono" style={{ fontSize: 9, fontWeight: 700, color: '#10b981' }}>{epData.summary.public} PUBLIC</span>
                <span className="mono" style={{ fontSize: 9, fontWeight: 700, color: '#ef4444' }}>{epData.summary.exposed} EXPOSED</span>
              </div>
            )}
          </div>
          <div style={{ padding: '18px 20px' }}>
            {epState === 'idle' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <p style={{ fontSize: 13, color: '#64748b' }}>
                  Discover pages, API routes, admin panels, and misconfigured paths on <span className="mono" style={{ color: '#0ea5e9' }}>{result.domain}</span>.
                </p>
                <button onClick={runEndpointDiscovery} className="mono" style={{ padding: '9px 18px', background: '#f0f4f8', color: '#0ea5e9', fontWeight: 700, fontSize: 11, border: '1px solid #bfdbfe', borderRadius: 6, cursor: 'pointer', letterSpacing: .5, flexShrink: 0 }}>
                  DISCOVER ENDPOINTS /&gt;
                </button>
              </div>
            )}
            {epState === 'loading' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <Loader2 size={15} color="#0ea5e9" style={{ animation: 'spin 1s linear infinite' }} />
                <span className="mono" style={{ fontSize: 11, color: '#64748b', letterSpacing: .5 }}>PROBING ENDPOINTS...</span>
              </div>
            )}
            {epState === 'error' && (
              <p style={{ fontSize: 13, color: '#ef4444' }}>Discovery failed. <button onClick={runEndpointDiscovery} style={{ color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 0 }}>Retry</button></p>
            )}
            {epState === 'done' && epData && (
              <>
                {epData.summary.exposed > 0 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, padding: '10px 14px', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <AlertTriangle size={13} color="#ef4444" strokeWidth={2} />
                    <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', letterSpacing: .5 }}>
                      {epData.summary.exposed} SENSITIVE PATH{epData.summary.exposed > 1 ? 'S' : ''} PUBLICLY ACCESSIBLE
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 280, overflowY: 'auto' }}>
                  {epData.probed
                    .filter((e) => e.status !== 'not-found')
                    .map((ep, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                        background: ep.isExposed ? '#fef2f2' : '#f8fafc',
                        border: `1px solid ${ep.isExposed ? '#fecaca' : '#e2e8f0'}`,
                        borderLeft: `3px solid ${ep.isExposed ? '#ef4444' : ep.status === 'public' ? '#10b981' : ep.status === 'protected' ? '#0ea5e9' : '#94a3b8'}`,
                        borderRadius: 6,
                      }}>
                        <span className="mono" style={{ fontSize: 8, fontWeight: 700, color: ep.type === 'api' ? '#8b5cf6' : ep.type === 'admin' || ep.type === 'sensitive' ? '#ef4444' : ep.type === 'auth' ? '#f59e0b' : '#0ea5e9', background: '#f0f4f8', padding: '1px 5px', borderRadius: 3, flexShrink: 0 }}>
                          {ep.type.toUpperCase()}
                        </span>
                        <span className="mono" style={{ fontSize: 11, color: '#334155', flex: 1 }}>{ep.path}</span>
                        {ep.statusCode && <span className="mono" style={{ fontSize: 10, color: '#94a3b8' }}>{ep.statusCode}</span>}
                        <span className="mono" style={{ fontSize: 8, fontWeight: 700, color: ep.isExposed ? '#ef4444' : ep.status === 'public' ? '#10b981' : ep.status === 'protected' ? '#0ea5e9' : '#94a3b8', letterSpacing: .3 }}>
                          {ep.isExposed ? '⚠ EXPOSED' : ep.status === 'public' ? 'PUBLIC' : ep.status === 'protected' ? 'AUTH' : ep.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>
                  Full remediation guidance for exposed endpoints is available in your dashboard.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Dark web locked */}
        <div style={{ background: '#ffffff', border: '1px dashed #c5cdd8', borderRadius: 12, padding: '24px 20px', marginBottom: 14, textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Lock size={20} color="#0ea5e9" strokeWidth={1.5} />
          </div>
          <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 6, letterSpacing: .5 }}>DARK WEB MONITORING</div>
          <p style={{ color: '#64748b', fontSize: 13, maxWidth: 400, margin: '0 auto' }}>
            See if your domain, emails, or credentials appear on hacker forums or breach dumps. Available in your full report.
          </p>
        </div>

        {/* Insurance teaser */}
        <div style={{ background: '#ffffff', borderRadius: 10, padding: '16px 20px', border: '1px solid #dde3ec', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Insurance Readiness</span>
          <span className="mono" style={{ fontSize: 14, fontWeight: 800, color: GradeColor(result.underwritingGrade) }}>GRADE {result.underwritingGrade}</span>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {result.underwritingGrade === 'A' || result.underwritingGrade === 'B'
              ? '— Strong position to qualify for cyber insurance.'
              : result.underwritingGrade === 'C'
              ? '— May qualify, but likely at a higher premium.'
              : '— Current posture may make it difficult to qualify.'}
          </span>
        </div>

        {/* PDF + CTA row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <button onClick={downloadPdf} disabled={pdfLoading} className="mono" style={{ padding: '12px 20px', background: '#ffffff', color: '#0ea5e9', border: '1px solid #bfdbfe', borderRadius: 7, cursor: pdfLoading ? 'wait' : 'pointer', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 7, letterSpacing: .5 }}>
            {pdfLoading
              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> GENERATING...</>
              : <><Download size={14} /> DOWNLOAD PDF REPORT</>}
          </button>
        </div>

        {/* Unlock CTA */}
        <div style={{ background: '#0c1220', borderRadius: 14, padding: '28px 28px', border: '1px solid #1e2d45', marginBottom: 14 }}>
          <div className="mono" style={{ fontSize: 10, color: '#0ea5e9', letterSpacing: 2, marginBottom: 12 }}>[ FREE ACCOUNT ]</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc', marginBottom: 16, lineHeight: 1.2 }}>Your Full Report Includes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
            {[
              'Detailed findings with step-by-step fixes',
              'Dark web breach analysis with exposed data',
              'AI insurance readiness score',
              'PDF attestation for insurance applications',
              'Continuous monitoring with instant alerts',
              'Scan history and trend tracking',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <CheckCircle2 size={13} color="#10b981" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.55 }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href={`/register?domain=${result.domain}&scan=${result.scanId}`} className="mono" style={{ padding: '12px 24px', background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 12, borderRadius: 7, textDecoration: 'none', letterSpacing: .5 }}>
              UNLOCK FULL REPORT — FREE /&gt;
            </Link>
            <button onClick={resetScan} className="mono" style={{ padding: '12px 20px', background: 'transparent', color: '#64748b', border: '1px solid #1e2d45', fontSize: 12, fontWeight: 600, borderRadius: 7, cursor: 'pointer', letterSpacing: .5 }}>
              SCAN ANOTHER DOMAIN
            </button>
          </div>
        </div>

        {/* Email capture — send to domain owner */}
        {!emailSent ? (
          <div style={{ background: '#ffffff', borderRadius: 12, padding: '22px 24px', border: '1px solid #dde3ec', boxShadow: '0 2px 8px rgba(0,0,0,.03)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(14,165,233,.07)', border: '1px solid rgba(14,165,233,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Download size={16} color="#0ea5e9" strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Email this report</p>
                <p style={{ fontSize: 12, color: '#64748b' }}>
                  Send the PDF report to the domain owner, your IT team, or yourself. No account required.
                </p>
              </div>
            </div>
            <form onSubmit={sendEmail} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={`owner@${result.domain}`}
                className="scan-input mono"
                style={{ flex: 1, minWidth: 200, padding: '11px 14px', background: '#f8fafc', border: '1px solid #dde3ec', borderRadius: 7, color: '#0f172a', fontSize: 13 }}
              />
              <button type="submit" className="mono" style={{ padding: '11px 20px', background: '#10b981', color: '#fff', fontWeight: 700, fontSize: 11, border: 'none', borderRadius: 7, cursor: 'pointer', letterSpacing: .5, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={12} strokeWidth={2} />
                SEND REPORT /&gt;
              </button>
            </form>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
              The report will be sent as a PDF attachment with the CyberPulse scan results for <span className="mono" style={{ color: '#64748b' }}>{result.domain}</span>.
            </p>
          </div>
        ) : (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={16} color="#10b981" strokeWidth={2} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Report sent successfully</p>
              <p style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>Check {email} — the PDF report should arrive within a few minutes.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FreeScanPage() {
  return (
    <Suspense fallback={<div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontFamily: 'ui-monospace, monospace', fontSize: 13 }}>Loading scanner...</div>}>
      <ScanContent />
    </Suspense>
  );
}
