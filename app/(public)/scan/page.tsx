'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2, AlertTriangle, XCircle, Loader2,
  Download, Lock,
} from 'lucide-react';

interface CategoryResult {
  category: string;
  status: 'pass' | 'warn' | 'fail';
  summary: string;
}

interface TeaserFinding {
  title: string;
  severity: string;
}

interface ScanPayload {
  domain: string;
  overallScore: number;
  grade: string;
  categoryResults: CategoryResult[];
  top3Findings: TeaserFinding[];
  darkWebBreachCount: number;
  underwritingGrade: string;
  narrative?: string;
  scanId: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  DNS_EMAIL: 'Email Security',
  SSL_TLS: 'SSL Certificate',
  HTTP_HEADERS: 'Security Headers',
  DARK_WEB: 'Dark Web',
  OPEN_PORTS: 'Open Ports',
  CVE_EXPOSURE: 'Vulnerabilities',
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ff3366', HIGH: '#ff6b35', MEDIUM: '#f5c518', LOW: '#00d4ff', INFO: '#8892a4',
};

function StatusIcon({ status }: { status: 'pass' | 'warn' | 'fail' | 'scanning' }) {
  if (status === 'scanning') return <Loader2 size={16} color="#8892a4" style={{ animation: 'spin 1s linear infinite' }} />;
  if (status === 'pass') return <CheckCircle2 size={16} color="#00ff88" />;
  if (status === 'warn') return <AlertTriangle size={16} color="#f5c518" />;
  return <XCircle size={16} color="#ff3366" />;
}

function GradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#00ff88';
    case 'B': return '#00d4ff';
    case 'C': return '#f5c518';
    case 'D': return '#ff6b35';
    default: return '#ff3366';
  }
}

/** Renders a markdown string as React elements — supports h1-h3, bold, bullet lists */
function MarkdownBlock({ text }: { text: string }) {
  const lines = text.split('\n');

  const elements: React.ReactNode[] = [];

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) {
      elements.push(<div key={idx} style={{ height: 8 }} />);
      return;
    }

    // Inline bold: **text** → <strong>
    const parseBold = (s: string): React.ReactNode[] => {
      const parts = s.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i}>{p.slice(2, -2)}</strong>
          : p
      );
    };

    if (/^### /.test(line)) {
      elements.push(
        <h4 key={idx} style={{ color: '#00d4ff', fontWeight: 700, fontSize: 14, margin: '14px 0 4px' }}>
          {parseBold(line.replace(/^### /, ''))}
        </h4>
      );
    } else if (/^## /.test(line)) {
      elements.push(
        <h3 key={idx} style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: '18px 0 6px' }}>
          {parseBold(line.replace(/^## /, ''))}
        </h3>
      );
    } else if (/^# /.test(line)) {
      elements.push(
        <h2 key={idx} style={{ color: '#00ff88', fontWeight: 800, fontSize: 18, margin: '0 0 10px' }}>
          {parseBold(line.replace(/^# /, ''))}
        </h2>
      );
    } else if (/^[-*] /.test(line)) {
      elements.push(
        <div key={idx} style={{ display: 'flex', gap: 8, margin: '3px 0', paddingLeft: 8 }}>
          <span style={{ color: '#00d4ff', flexShrink: 0 }}>•</span>
          <span style={{ color: '#c8d0dd', fontSize: 14 }}>{parseBold(line.replace(/^[-*] /, ''))}</span>
        </div>
      );
    } else {
      elements.push(
        <p key={idx} style={{ color: '#c8d0dd', fontSize: 14, margin: '4px 0', lineHeight: 1.6 }}>
          {parseBold(line)}
        </p>
      );
    }
  });

  return <div>{elements}</div>;
}

export default function FreeScanPage() {
  const searchParams = useSearchParams();
  const [domain, setDomain] = useState(searchParams.get('domain') ?? '');
  const [step, setStep] = useState<'input' | 'scanning' | 'result'>('input');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ScanPayload | null>(null);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [pdfLoading, setPdfLoading] = useState(false);

  const runScan = useCallback(async (d: string) => {
    setStep('scanning');
    setError('');
    setTimeLeft(60);

    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    try {
      const res = await fetch('/api/scan/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: d }),
      });

      clearInterval(timer);

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 429) {
          setError('Rate limit reached. You can run 3 free scans per 24 hours.');
        } else {
          setError(err.error ?? 'Scan failed. Please try again.');
        }
        setStep('input');
        return;
      }

      const data = await res.json();
      setResult(data);
      setStep('result');
    } catch {
      clearInterval(timer);
      setError('Network error. Please try again.');
      setStep('input');
    }
  }, []);

  useEffect(() => {
    const d = searchParams.get('domain');
    if (d) {
      setDomain(d);
      runScan(d);
    }
  }, [searchParams, runScan]);

  async function sendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!result) return;

    await fetch('/api/scan/free/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, scanId: result.scanId }),
    });
    setEmailSent(true);
  }

  async function downloadPdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const res = await fetch('/api/scan/free/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cyberpulse-report-${result.domain}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail — user can try again
    } finally {
      setPdfLoading(false);
    }
  }

  const resetScan = () => {
    setStep('input');
    setDomain('');
    setResult(null);
    setError('');
  };

  if (step === 'input') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: '#fff' }}>Free Security Scan</h1>
          <p style={{ color: '#8892a4', marginBottom: 32 }}>Enter your business domain to start</p>

          {error && (
            <div style={{ background: '#2d0f1a', border: '1px solid #ff336633', color: '#ff3366', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (domain) runScan(domain);
            }}
            style={{ display: 'flex', gap: 12 }}
          >
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="yourbusiness.co.za"
              style={{ flex: 1, padding: '16px 20px', background: '#0f1729', border: '1px solid #1a2540', borderRadius: 8, color: '#fff', fontSize: 15 }}
            />
            <button
              type="submit"
              style={{ padding: '16px 24px', background: '#00d4ff', color: '#0a0f1e', fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer' }}
            >
              Scan
            </button>
          </form>

          <Link href="/" style={{ color: '#8892a4', fontSize: 13, marginTop: 16, display: 'block' }}>← Back to home</Link>
        </div>
      </div>
    );
  }

  if (step === 'scanning') {
    const FREE_CATEGORIES = ['DNS_EMAIL', 'SSL_TLS', 'HTTP_HEADERS', 'DARK_WEB'];
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 520, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ color: '#00d4ff', fontSize: 13, marginBottom: 8 }}>SCANNING</div>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>{domain}</h2>
            <p style={{ color: '#8892a4', marginTop: 4 }}>Estimated time: {timeLeft}s</p>
          </div>

          <div style={{ background: '#0f1729', borderRadius: 12, padding: 24, border: '1px solid #1a2540' }}>
            {FREE_CATEGORIES.map((cat) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #1a2540' }}>
                <StatusIcon status="scanning" />
                <span style={{ flex: 1 }}>{CATEGORY_LABELS[cat]}</span>
                <span style={{ color: '#8892a4', fontSize: 12 }}>scanning...</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, height: 4, background: '#0f1729', borderRadius: 2, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: '#00d4ff',
                borderRadius: 2,
                width: `${((60 - timeLeft) / 60) * 100}%`,
                transition: 'width 1s linear',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const gradeCol = GradeColor(result.grade);
  const defaultNarrative =
    result.overallScore < 45
      ? 'Your business has critical security gaps that put you at high risk of a cyber attack.'
      : result.overallScore < 75
      ? 'Your business has significant security weaknesses that need attention.'
      : 'Your business has a reasonable security posture with some areas to improve.';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', padding: '40px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Score Card */}
        <div style={{ background: '#0f1729', borderRadius: 16, padding: 32, border: '1px solid #1a2540', marginBottom: 24, textAlign: 'center' }}>
          <div style={{ color: '#8892a4', fontSize: 14, marginBottom: 8 }}>{result.domain}</div>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            border: `4px solid ${gradeCol}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <div>
              <div style={{ fontSize: 40, fontWeight: 800, color: gradeCol }}>{result.overallScore}</div>
              <div style={{ fontSize: 11, color: '#8892a4' }}>/ 100</div>
            </div>
          </div>
          <div style={{ display: 'inline-block', background: gradeCol, color: '#0a0f1e', fontWeight: 800, fontSize: 24, padding: '6px 24px', borderRadius: 6, marginBottom: 24 }}>
            Grade {result.grade}
          </div>

          {/* AI Narrative — rendered as markdown */}
          <div style={{ textAlign: 'left', background: '#0a0f1e', borderRadius: 10, padding: '20px 24px', border: '1px solid #1a2540' }}>
            {result.narrative
              ? <MarkdownBlock text={result.narrative} />
              : <p style={{ color: '#c8d0dd', fontSize: 14, margin: 0 }}>{defaultNarrative}</p>
            }
          </div>
        </div>

        {/* Category Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
          {result.categoryResults.map((cat) => (
            <div key={cat.category} style={{ background: '#0f1729', borderRadius: 10, padding: '16px 18px', border: '1px solid #1a2540' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <StatusIcon status={cat.status} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{CATEGORY_LABELS[cat.category] ?? cat.category}</span>
              </div>
              <p style={{ fontSize: 12, color: '#8892a4' }}>{cat.summary}</p>
            </div>
          ))}
        </div>

        {/* Top 3 Findings (teaser) */}
        <div style={{ background: '#0f1729', borderRadius: 12, padding: 24, border: '1px solid #1a2540', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Top Security Findings</h3>
          {result.top3Findings.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < 2 ? '1px solid #1a2540' : 'none' }}>
              <span style={{ fontSize: 11, fontWeight: 700, background: SEVERITY_COLORS[f.severity], color: '#fff', padding: '2px 8px', borderRadius: 3 }}>{f.severity}</span>
              <span style={{ flex: 1, fontSize: 14 }}>{f.title}</span>
              <Lock size={13} color="#3d4f6b" strokeWidth={1.5} />
            </div>
          ))}
          <p style={{ fontSize: 12, color: '#8892a4', marginTop: 12 }}>Create a free account to unlock full remediation steps</p>
        </div>

        {/* Dark Web — Locked */}
        <div style={{ background: '#0f1729', border: '1.5px dashed #1a2540', borderRadius: 12, padding: 24, marginBottom: 24, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <Lock size={26} color="#00d4ff" strokeWidth={1.5} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Dark Web Monitoring</div>
          <p style={{ color: '#8892a4', fontSize: 13, maxWidth: 420, margin: '0 auto' }}>
            See if your domain, emails, or credentials have appeared on hacker forums or data breach dumps.
            Available in your full report.
          </p>
        </div>

        {/* Underwriting Teaser */}
        <div style={{ background: '#0f1729', borderRadius: 12, padding: 20, border: '1px solid #1a2540', marginBottom: 24 }}>
          <strong>Insurance Readiness:</strong>{' '}
          <span style={{ color: GradeColor(result.underwritingGrade), fontWeight: 700 }}>Grade {result.underwritingGrade}</span>
          {' — '}
          <span style={{ color: '#8892a4', fontSize: 14 }}>
            {result.underwritingGrade === 'A' || result.underwritingGrade === 'B'
              ? 'You are in a strong position to qualify for cyber insurance.'
              : result.underwritingGrade === 'C'
              ? 'You may qualify for cover but at a higher premium.'
              : 'You may struggle to qualify for cyber cover at current posture.'}
          </span>
        </div>

        {/* Download + CTA row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <button
            onClick={downloadPdf}
            disabled={pdfLoading}
            style={{
              padding: '14px 24px', background: '#0f1729', color: '#00d4ff',
              border: '1px solid #00d4ff55', borderRadius: 8, cursor: pdfLoading ? 'wait' : 'pointer',
              fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {pdfLoading
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
              : <><Download size={15} /> Download Mini Report (PDF)</>}
          </button>
        </div>

        {/* Locked Full Report */}
        <div style={{ background: '#0f1729', borderRadius: 16, padding: 32, border: '1px solid #00d4ff33', marginBottom: 24, textAlign: 'center' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Your Full Report Includes</h3>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24, textAlign: 'left', maxWidth: 400, margin: '0 auto 24px' }}>
            {[
              'Detailed findings with step-by-step fixes',
              'Dark web breach analysis with data types exposed',
              'AI-generated insurance readiness score',
              'Downloadable PDF attestation for insurers',
              'Continuous monitoring with instant alerts',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', gap: 10, marginBottom: 10, color: '#c8d0dd', fontSize: 14, alignItems: 'flex-start' }}>
                <CheckCircle2 size={15} color="#00ff88" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} /> {item}
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={`/register?domain=${result.domain}&scan=${result.scanId}`}
              style={{ padding: '14px 28px', background: '#00d4ff', color: '#0a0f1e', fontWeight: 700, borderRadius: 8, textDecoration: 'none' }}
            >
              Unlock Full Report — Free
            </Link>
            <button
              onClick={resetScan}
              style={{ padding: '14px 28px', background: 'transparent', color: '#8892a4', border: '1px solid #1a2540', borderRadius: 8, cursor: 'pointer' }}
            >
              Scan Another Domain
            </button>
          </div>
        </div>

        {/* Email Capture */}
        {!emailSent ? (
          <div style={{ background: '#0f1729', borderRadius: 12, padding: 24, border: '1px solid #1a2540', textAlign: 'center' }}>
            <h4 style={{ marginBottom: 8 }}>Get your full report emailed to you — no account needed</h4>
            <form onSubmit={sendEmail} style={{ display: 'flex', gap: 12, maxWidth: 440, margin: '0 auto' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.co.za"
                style={{ flex: 1, padding: '12px 16px', background: '#141d30', border: '1px solid #1a2540', borderRadius: 6, color: '#fff' }}
              />
              <button type="submit" style={{ padding: '12px 20px', background: '#00ff88', color: '#0a0f1e', fontWeight: 700, borderRadius: 6, border: 'none', cursor: 'pointer' }}>
                Send My Report
              </button>
            </form>
          </div>
        ) : (
          <div style={{ background: '#0d2e1a', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12, padding: 20, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <CheckCircle2 size={16} color="#00ff88" strokeWidth={2} />
            <span style={{ color: '#00ff88', fontSize: 14 }}>Report sent! Check your inbox.</span>
          </div>
        )}
      </div>
    </div>
  );
}
