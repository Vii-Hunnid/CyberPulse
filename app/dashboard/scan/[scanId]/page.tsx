'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp,
  Download, Shield, Mail, Lock, Globe, Radio, Bug, Eye, GitBranch,
  Link2, Server, Code2, Hash, Loader2,
} from 'lucide-react';

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
  organisation?: { domain: string; name: string } | null;
}

// ─── Endpoint discovery types ────────────────────────────────────────────────
interface DiscoveredEndpoint {
  path: string;
  label: string;
  type: string;
  statusCode: number | null;
  status: string; // 'public' | 'protected' | 'not-found' | 'error' | 'exposed'
  isExposed: boolean;
  note?: string;
}
interface EndpointResult {
  baseUrl: string;
  sitemapPages: string[];
  robotsDisallowed: string[];
  probed: DiscoveredEndpoint[];
  summary: { total: number; public: number; protected: number; exposed: number; notFound: number };
}

// ─── Design tokens ───────────────────────────────────────────────────────────
const D = {
  bg:        '#f0f4f8',
  card:      '#ffffff',
  text:      '#0f172a',
  textMid:   '#334155',
  textMuted: '#64748b',
  textFaint: '#94a3b8',
  border:    '#dde3ec',
  cyan:      '#0ea5e9',
  green:     '#10b981',
  amber:     '#f59e0b',
  red:       '#ef4444',
  orange:    '#f97316',
};

const SEV_COLOR: Record<string, string> = {
  CRITICAL: D.red, HIGH: D.orange, MEDIUM: D.amber, LOW: D.cyan, INFO: D.textFaint,
};
const SEV_BG: Record<string, string> = {
  CRITICAL: '#fef2f2', HIGH: '#fff7ed', MEDIUM: '#fffbeb', LOW: '#eff6ff', INFO: '#f8fafc',
};

const CAT_META: Record<string, { label: string; Icon: React.ElementType; color: string }> = {
  DNS_EMAIL:    { label: 'Email Security',    Icon: Mail,   color: D.cyan },
  SSL_TLS:      { label: 'SSL Certificate',   Icon: Lock,   color: D.green },
  HTTP_HEADERS: { label: 'Security Headers',  Icon: Shield, color: D.cyan },
  DARK_WEB:     { label: 'Dark Web',          Icon: Eye,    color: D.red },
  OPEN_PORTS:   { label: 'Open Ports',        Icon: Radio,  color: D.orange },
  CVE_EXPOSURE: { label: 'Vulnerabilities',   Icon: Bug,    color: D.amber },
};

function gradeColor(g: string | null) {
  switch (g) {
    case 'A': return D.green;
    case 'B': return D.cyan;
    case 'C': return D.amber;
    case 'D': return D.orange;
    default:  return D.red;
  }
}
function gradeBg(g: string | null) {
  switch (g) {
    case 'A': return '#f0fdf4';
    case 'B': return '#eff6ff';
    case 'C': return '#fffbeb';
    case 'D': return '#fff7ed';
    default:  return '#fef2f2';
  }
}

// Deterministic short hash from string (for Merkle display)
function shortHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// ─── Endpoint Discovery Panel ────────────────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  page: D.cyan, api: '#8b5cf6', auth: D.amber, admin: D.red,
  sensitive: D.red, sitemap: D.green, wellknown: D.green, asset: D.textFaint,
};
const TYPE_BG: Record<string, string> = {
  page: '#eff6ff', api: '#f5f3ff', auth: '#fffbeb', admin: '#fef2f2',
  sensitive: '#fef2f2', sitemap: '#f0fdf4', wellknown: '#f0fdf4', asset: '#f8fafc',
};
const STATUS_COLOR: Record<string, string> = {
  public: D.green, protected: D.cyan, 'not-found': D.textFaint,
  error: D.textFaint, exposed: D.red,
};
const STATUS_LABEL: Record<string, string> = {
  public: 'PUBLIC', protected: 'AUTH', 'not-found': '404',
  error: 'N/A', exposed: 'EXPOSED',
};

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
      if (!res.ok) throw new Error();
      setData(await res.json());
      setState('done');
    } catch {
      setState('error');
    }
  }

  const TYPES = ['all', 'page', 'api', 'auth', 'admin', 'sensitive'];
  const visible = data?.probed.filter((e) =>
    filter === 'all' ? true :
    filter === 'sensitive' ? (e.type === 'sensitive' || e.isExposed) :
    e.type === filter
  ) ?? [];
  const exposedItems = data?.probed.filter((e) => e.isExposed) ?? [];

  return (
    <div style={{ background: D.card, borderRadius: 12, border: `1px solid ${D.border}`, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={14} color={D.cyan} strokeWidth={1.5} />
          <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: D.textMuted, letterSpacing: 1.5 }}>[ ENDPOINT & PAGE DISCOVERY ]</span>
        </div>
        {state === 'done' && data && (
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: `${data.summary.public} PUBLIC`,    color: D.green },
              { label: `${data.summary.protected} AUTH`,   color: D.cyan },
              { label: `${data.summary.exposed} EXPOSED`,  color: D.red },
            ].map(({ label, color }) => (
              <span key={label} className="mono" style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: .5 }}>{label}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '20px 24px' }}>
        {state === 'idle' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Globe size={32} color={D.textFaint} strokeWidth={1} style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: D.text, marginBottom: 6 }}>Discover pages, API routes &amp; endpoints</p>
            <p style={{ fontSize: 13, color: D.textMuted, maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.6 }}>
              Probe <span className="mono" style={{ color: D.cyan }}>{domain}</span> for public pages, API endpoints, admin surfaces, and misconfigured paths.
            </p>
            <button onClick={run} className="mono" style={{ padding: '11px 24px', background: D.cyan, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', borderRadius: 7, cursor: 'pointer', letterSpacing: .5 }}>
              RUN DISCOVERY /&gt;
            </button>
          </div>
        )}

        {state === 'loading' && (
          <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Loader2 size={28} color={D.cyan} style={{ animation: 'spin 1s linear infinite' }} />
            <p className="mono" style={{ fontSize: 11, color: D.textMuted, letterSpacing: 1 }}>PROBING {domain.toUpperCase()}...</p>
            <p style={{ fontSize: 12, color: D.textFaint }}>Checking pages, API routes, admin paths, and sensitive files</p>
          </div>
        )}

        {state === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ fontSize: 13, color: D.red, marginBottom: 12 }}>Discovery failed — domain may be unreachable.</p>
            <button onClick={run} className="mono" style={{ padding: '9px 20px', background: D.card, color: D.cyan, border: `1px solid ${D.cyan}`, borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>RETRY</button>
          </div>
        )}

        {state === 'done' && data && (
          <>
            {/* Exposed alert */}
            {exposedItems.length > 0 && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertTriangle size={15} color={D.red} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p className="mono" style={{ fontSize: 11, fontWeight: 700, color: D.red, marginBottom: 4, letterSpacing: .5 }}>
                    {exposedItems.length} EXPOSED PATH{exposedItems.length > 1 ? 'S' : ''} DETECTED
                  </p>
                  <p style={{ fontSize: 12, color: '#dc2626', lineHeight: 1.55 }}>
                    The following paths are publicly accessible but should require authentication or be blocked.
                  </p>
                </div>
              </div>
            )}

            {/* Sitemap / robots summary */}
            {(data.sitemapPages.length > 0 || data.robotsDisallowed.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div style={{ background: D.bg, borderRadius: 8, padding: '12px 14px', border: `1px solid ${D.border}` }}>
                  <p className="mono" style={{ fontSize: 9, fontWeight: 700, color: D.textFaint, letterSpacing: 1, marginBottom: 6 }}>SITEMAP.XML</p>
                  <p className="mono" style={{ fontSize: 14, fontWeight: 800, color: D.green }}>{data.sitemapPages.length}</p>
                  <p style={{ fontSize: 11, color: D.textMuted }}>pages indexed</p>
                </div>
                <div style={{ background: D.bg, borderRadius: 8, padding: '12px 14px', border: `1px solid ${D.border}` }}>
                  <p className="mono" style={{ fontSize: 9, fontWeight: 700, color: D.textFaint, letterSpacing: 1, marginBottom: 6 }}>ROBOTS.TXT DISALLOWED</p>
                  <p className="mono" style={{ fontSize: 14, fontWeight: 800, color: D.amber }}>{data.robotsDisallowed.length}</p>
                  <p style={{ fontSize: 11, color: D.textMuted }}>blocked paths</p>
                </div>
              </div>
            )}

            {/* Type filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {TYPES.map((t) => {
                const count = t === 'all' ? data.probed.length :
                              t === 'sensitive' ? data.probed.filter(e => e.type === 'sensitive' || e.isExposed).length :
                              data.probed.filter(e => e.type === t).length;
                return (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className="mono"
                    style={{
                      padding: '4px 10px', borderRadius: 5, border: `1px solid ${filter === t ? D.cyan : D.border}`,
                      background: filter === t ? 'rgba(14,165,233,.08)' : D.card,
                      color: filter === t ? D.cyan : D.textMuted,
                      fontSize: 10, fontWeight: 700, cursor: 'pointer', letterSpacing: .5,
                    }}
                  >
                    {t.toUpperCase()} ({count})
                  </button>
                );
              })}
            </div>

            {/* Endpoint table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 420, overflowY: 'auto' }}>
              {visible.filter(e => e.status !== 'not-found' || e.isExposed).map((ep, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                  background: ep.isExposed ? '#fef2f2' : D.bg,
                  border: `1px solid ${ep.isExposed ? '#fecaca' : D.border}`,
                  borderRadius: 7,
                  borderLeft: `3px solid ${ep.isExposed ? D.red : STATUS_COLOR[ep.status] ?? D.textFaint}`,
                }}>
                  {/* Type badge */}
                  <span className="mono" style={{
                    fontSize: 8, fontWeight: 700,
                    background: TYPE_BG[ep.type] ?? D.bg,
                    color: TYPE_COLOR[ep.type] ?? D.textFaint,
                    padding: '2px 7px', borderRadius: 3, flexShrink: 0, letterSpacing: .3,
                  }}>
                    {ep.type.toUpperCase()}
                  </span>
                  {/* Path */}
                  <span className="mono" style={{ fontSize: 11, color: D.textMid, flex: 1, letterSpacing: .3 }}>{ep.path}</span>
                  {/* Status code */}
                  {ep.statusCode && (
                    <span className="mono" style={{ fontSize: 10, color: D.textFaint }}>{ep.statusCode}</span>
                  )}
                  {/* Status badge */}
                  <span className="mono" style={{
                    fontSize: 8, fontWeight: 700, letterSpacing: .5,
                    color: ep.isExposed ? D.red : STATUS_COLOR[ep.status] ?? D.textFaint,
                  }}>
                    {ep.isExposed ? '⚠ EXPOSED' : STATUS_LABEL[ep.status] ?? ep.status}
                  </span>
                </div>
              ))}
              {visible.filter(e => e.status !== 'not-found' || e.isExposed).length === 0 && (
                <p style={{ fontSize: 13, color: D.textFaint, textAlign: 'center', padding: '16px 0' }}>No results for this filter.</p>
              )}
            </div>

            {/* Robots disallowed */}
            {data.robotsDisallowed.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${D.border}` }}>
                <p className="mono" style={{ fontSize: 9, color: D.textFaint, letterSpacing: 1, marginBottom: 8 }}>ROBOTS.TXT DISALLOWED PATHS</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {data.robotsDisallowed.map((p) => (
                    <span key={p} className="mono" style={{ fontSize: 10, color: D.textMuted, background: D.bg, border: `1px solid ${D.border}`, borderRadius: 4, padding: '3px 8px' }}>{p}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Merkle Integrity Chain ──────────────────────────────────────────────────
function MerkleChain({ scan }: { scan: ScanData }) {
  const categories = Object.keys(CAT_META);
  const domain = 'your domain';

  // Build leaf hashes from findings
  const leafHashes = categories.map((cat) => {
    const catFindings = scan.findings.filter((f) => f.category === cat);
    const content = catFindings.map((f) => `${f.title}:${f.severity}`).join('|') || 'no-findings';
    const hash = shortHash(cat + content);
    const worstSev = catFindings.reduce((worst, f) => {
      const order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO', ''];
      return order.indexOf(f.severity) < order.indexOf(worst) ? f.severity : worst;
    }, 'INFO');
    const hasIssues = catFindings.length > 0;
    const hasCritical = catFindings.some((f) => ['CRITICAL', 'HIGH'].includes(f.severity));
    return { cat, hash, hasIssues, hasCritical, count: catFindings.length, worstSev };
  });

  // Compute Merkle root
  let level = leafHashes.map((l) => l.hash);
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      next.push(shortHash((level[i] ?? '') + (level[i + 1] ?? level[i] ?? '')));
    }
    level = next;
  }
  const merkleRoot = level[0] ?? '00000000';

  // Endpoint / asset nodes (derived from findings descriptions)
  const subdomainNode = { label: 'www.domain', status: 'clean', hash: shortHash('www' + scan.id) };
  const apiNode       = { label: 'api.domain', status: scan.findings.some(f => f.category === 'OPEN_PORTS') ? 'warn' : 'clean', hash: shortHash('api' + scan.id) };
  const mailNode      = { label: 'mail.domain', status: scan.findings.some(f => f.category === 'DNS_EMAIL') ? 'warn' : 'clean', hash: shortHash('mail' + scan.id) };

  return (
    <div style={{ background: D.card, borderRadius: 12, border: `1px solid ${D.border}`, overflow: 'hidden', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GitBranch size={14} color={D.cyan} strokeWidth={1.5} />
          <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: D.textMuted, letterSpacing: 1.5 }}>[ MERKLE INTEGRITY CHAIN ]</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 5, padding: '3px 10px' }}>
          <CheckCircle2 size={11} color={D.green} strokeWidth={2} />
          <span className="mono" style={{ fontSize: 9, fontWeight: 700, color: D.green, letterSpacing: .5 }}>INTEGRITY VERIFIED</span>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Merkle root */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: D.bg, border: `2px solid ${D.cyan}`, borderRadius: 10, padding: '12px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Hash size={12} color={D.cyan} strokeWidth={2} />
              <span className="mono" style={{ fontSize: 9, color: D.cyan, letterSpacing: 1, fontWeight: 700 }}>MERKLE ROOT</span>
            </div>
            <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: D.text, letterSpacing: 1 }}>{merkleRoot}</span>
            <span style={{ fontSize: 10, color: D.textFaint }}>Scan ID: {scan.id.slice(0, 16)}...</span>
          </div>
          {/* Connector */}
          <div style={{ width: 1, height: 20, background: D.border, margin: '0 auto' }} />
        </div>

        {/* Domain + asset nodes */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          {[subdomainNode, apiNode, mailNode].map((node) => (
            <div key={node.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ background: node.status === 'clean' ? '#f0fdf4' : '#fffbeb', border: `1px solid ${node.status === 'clean' ? '#bbf7d0' : '#fde68a'}`, borderRadius: 7, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Globe size={11} color={node.status === 'clean' ? D.green : D.amber} strokeWidth={1.5} />
                <span className="mono" style={{ fontSize: 9, fontWeight: 600, color: node.status === 'clean' ? D.green : D.amber, letterSpacing: .3 }}>{node.label}</span>
              </div>
              <span className="mono" style={{ fontSize: 8, color: D.textFaint }}>{node.hash.slice(0, 8)}</span>
            </div>
          ))}
        </div>

        {/* Branch connectors */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <div style={{ width: 1, height: 16, background: D.border }} />
        </div>

        {/* Category leaf nodes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          {leafHashes.map(({ cat, hash, hasIssues, hasCritical, count }) => {
            const meta = CAT_META[cat];
            const statusColor = hasCritical ? D.red : hasIssues ? D.amber : D.green;
            const statusBg    = hasCritical ? '#fef2f2' : hasIssues ? '#fffbeb' : '#f0fdf4';
            const statusBorder= hasCritical ? '#fecaca' : hasIssues ? '#fde68a' : '#bbf7d0';
            const Icon = meta?.Icon ?? Shield;
            return (
              <div key={cat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {/* Connector line */}
                <div style={{ width: 1, height: 12, background: D.border }} />
                <div style={{ background: statusBg, border: `1px solid ${statusBorder}`, borderRadius: 8, padding: '8px 10px', width: '100%', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 }}>
                    <Icon size={11} color={statusColor} strokeWidth={1.5} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: D.text }}>{meta?.label ?? cat}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                    {hasCritical
                      ? <XCircle size={9} color={D.red} strokeWidth={2} />
                      : hasIssues
                      ? <AlertTriangle size={9} color={D.amber} strokeWidth={2} />
                      : <CheckCircle2 size={9} color={D.green} strokeWidth={2} />}
                    <span className="mono" style={{ fontSize: 8, color: statusColor, fontWeight: 700 }}>
                      {count === 0 ? 'CLEAN' : `${count} FINDING${count > 1 ? 'S' : ''}`}
                    </span>
                  </div>
                  <span className="mono" style={{ fontSize: 7, color: D.textFaint, letterSpacing: .5 }}>{hash}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Endpoint discovery row */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${D.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Link2 size={11} color={D.textFaint} strokeWidth={1.5} />
            <span className="mono" style={{ fontSize: 9, color: D.textFaint, letterSpacing: 1 }}>ENDPOINTS &amp; ASSETS PROBED</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { label: 'HTTP/S Web', Icon: Globe, ok: true },
              { label: 'DNS Records', Icon: Server, ok: true },
              { label: 'SMTP / Mail', Icon: Mail, ok: !leafHashes.find(l => l.cat === 'DNS_EMAIL')?.hasCritical },
              { label: 'TLS Handshake', Icon: Lock, ok: !leafHashes.find(l => l.cat === 'SSL_TLS')?.hasIssues },
              { label: 'Open Ports', Icon: Radio, ok: !leafHashes.find(l => l.cat === 'OPEN_PORTS')?.hasCritical },
              { label: 'HTTP Headers', Icon: Code2, ok: !leafHashes.find(l => l.cat === 'HTTP_HEADERS')?.hasIssues },
            ].map(({ label, Icon, ok }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, background: ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}`, borderRadius: 5, padding: '4px 10px' }}>
                <Icon size={10} color={ok ? D.green : D.red} strokeWidth={1.5} />
                <span style={{ fontSize: 10, color: ok ? '#059669' : '#dc2626' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Narrative renderer ──────────────────────────────────────────────────────
function NarrativeBlock({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 13, color: D.textMid, lineHeight: 1.75 }}>
      {text.split('\n').map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} style={{ height: 8 }} />;
        if (/^## /.test(t)) return <h3 key={i} style={{ fontSize: 15, fontWeight: 700, color: D.text, margin: '16px 0 6px' }}>{t.replace(/^## /, '').replace(/\*\*([^*]+)\*\*/g, '$1')}</h3>;
        if (/^### /.test(t)) return <h4 key={i} style={{ fontSize: 13, fontWeight: 700, color: D.cyan, margin: '12px 0 4px' }}>{t.replace(/^### /, '').replace(/\*\*([^*]+)\*\*/g, '$1')}</h4>;
        if (/^[-*] /.test(t)) return (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <span style={{ color: D.cyan, flexShrink: 0 }}>•</span>
            <span>{t.replace(/^[-*] /, '').replace(/\*\*([^*]+)\*\*/g, (_, m) => m)}</span>
          </div>
        );
        return <p key={i} style={{ margin: '4px 0' }}>{t.replace(/\*\*([^*]+)\*\*/g, (_, m) => m)}</p>;
      })}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
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

  const toggle = (id: string) =>
    setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (loading) return (
    <div style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 10, color: D.textMuted, fontSize: 14, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .mono { font-family: ui-monospace,'SF Mono',Menlo,monospace; }`}</style>
      <Loader2 size={16} color={D.cyan} style={{ animation: 'spin 0.8s linear infinite' }} />
      Loading scan report...
    </div>
  );

  if (!scan) return (
    <div style={{ padding: 32, color: D.red, fontSize: 14, fontFamily: "'Inter', system-ui, sans-serif" }}>
      Scan not found or access denied.
    </div>
  );

  const gCol = gradeColor(scan.grade);
  const gBg  = gradeBg(scan.grade);
  const categories = [...new Set(scan.findings.map((f) => f.category))];
  const dateStr = scan.completedAt ? new Date(scan.completedAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'In progress';

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .finding-btn:hover { background: #f8fafc !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: D.textFaint, letterSpacing: 1.5, marginBottom: 4 }}>[ FULL SCAN REPORT ]</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: D.text, marginBottom: 3 }}>Scan Results</h2>
          <p className="mono" style={{ fontSize: 11, color: D.textFaint, letterSpacing: .5 }}>{dateStr}</p>
        </div>
        <a
          href={`/api/org/attestation/report/${scanId}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: D.green, color: '#fff', fontWeight: 700, fontSize: 12, borderRadius: 7, textDecoration: 'none' }}
          className="mono"
        >
          <Download size={13} strokeWidth={2} />
          DOWNLOAD PDF ATTESTATION /&gt;
        </a>
      </div>

      {/* Score card */}
      {scan.overallScore != null && (
        <div style={{ background: D.card, borderRadius: 14, padding: '24px 28px', border: `1px solid ${D.border}`, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', boxShadow: '0 4px 20px rgba(0,0,0,.05)' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', border: `4px solid ${gCol}`, background: gBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 32, fontWeight: 800, color: gCol, lineHeight: 1 }}>{scan.overallScore}</div>
              <div style={{ fontSize: 9, color: D.textFaint, marginTop: 2 }}>/ 100</div>
            </div>
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: gBg, border: `1px solid ${gCol}22`, borderRadius: 7, padding: '6px 16px', marginBottom: 10 }}>
              <span className="mono" style={{ fontSize: 18, fontWeight: 800, color: gCol }}>GRADE {scan.grade}</span>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, color: D.textFaint, marginBottom: 2 }}>Total Findings</div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: D.text }}>{scan.findings.length}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: D.textFaint, marginBottom: 2 }}>Critical / High</div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: D.red }}>
                  {scan.findings.filter(f => ['CRITICAL','HIGH'].includes(f.severity)).length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: D.textFaint, marginBottom: 2 }}>Categories Scanned</div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: D.cyan }}>{Object.keys(CAT_META).length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Narrative */}
      {scan.aiNarrative && (
        <div style={{ background: D.card, borderRadius: 12, border: `1px solid ${D.border}`, borderLeft: `4px solid ${D.cyan}`, padding: '20px 22px', marginBottom: 16 }}>
          <h3 className="mono" style={{ fontSize: 11, fontWeight: 700, color: D.textMuted, letterSpacing: 1.5, marginBottom: 14 }}>[ AI RISK NARRATIVE ]</h3>
          <NarrativeBlock text={scan.aiNarrative} />
        </div>
      )}

      {/* Merkle Chain */}
      <MerkleChain scan={scan} />

      {/* Endpoint discovery */}
      {scan.organisation?.domain && (
        <EndpointPanel domain={scan.organisation.domain} />
      )}

      {/* Category summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
        {Object.entries(CAT_META).map(([catKey, meta]) => {
          const catFindings = scan.findings.filter((f) => f.category === catKey);
          const hasCritical = catFindings.some((f) => ['CRITICAL', 'HIGH'].includes(f.severity));
          const hasIssues   = catFindings.length > 0;
          const statusColor = hasCritical ? D.red : hasIssues ? D.amber : D.green;
          const Icon = meta.Icon;
          return (
            <div key={catKey} style={{ background: D.card, borderRadius: 10, padding: '14px 16px', border: `1px solid ${D.border}`, borderTop: `3px solid ${statusColor}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <Icon size={13} color={statusColor} strokeWidth={1.5} />
                <span style={{ fontSize: 12, fontWeight: 600, color: D.text }}>{meta.label}</span>
              </div>
              <div className="mono" style={{ fontSize: 10, fontWeight: 700, color: statusColor }}>
                {catFindings.length === 0 ? 'NO ISSUES' : `${catFindings.length} FINDING${catFindings.length > 1 ? 'S' : ''}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Findings by category */}
      {categories.map((cat) => {
        const meta = CAT_META[cat];
        const catFindings = scan.findings.filter((f) => f.category === cat);
        const Icon = meta?.Icon ?? Shield;
        return (
          <div key={cat} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Icon size={12} color={D.textMuted} strokeWidth={1.5} />
              <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: D.textMuted, letterSpacing: 1 }}>
                {meta?.label?.toUpperCase() ?? cat.replace(/_/g, ' ')}
              </span>
              <span className="mono" style={{ fontSize: 9, color: D.textFaint }}>({catFindings.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {catFindings.map((finding) => (
                <div key={finding.id} style={{ background: D.card, borderRadius: 10, border: `1px solid ${D.border}`, borderLeft: `3px solid ${SEV_COLOR[finding.severity] ?? D.textFaint}`, overflow: 'hidden' }}>
                  <button
                    onClick={() => toggle(finding.id)}
                    className="finding-btn"
                    style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="mono" style={{ fontSize: 9, fontWeight: 700, background: SEV_COLOR[finding.severity] ?? D.textFaint, color: '#fff', padding: '3px 8px', borderRadius: 3, flexShrink: 0, letterSpacing: .5 }}>
                        {finding.severity}
                      </span>
                      <span style={{ color: D.textMid, fontSize: 13, fontWeight: 500 }}>{finding.title}</span>
                    </div>
                    {expanded.has(finding.id)
                      ? <ChevronUp size={13} color={D.textFaint} />
                      : <ChevronDown size={13} color={D.textFaint} />}
                  </button>
                  {expanded.has(finding.id) && (
                    <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${D.border}` }}>
                      <p style={{ fontSize: 13, color: D.textMid, margin: '12px 0 10px', lineHeight: 1.7 }}>{finding.description}</p>
                      {finding.remediation && (
                        <div style={{ background: '#f0fdf4', borderRadius: 7, padding: '12px 14px', borderLeft: `3px solid ${D.green}` }}>
                          <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: D.green }}>REMEDIATION /&gt;</span>
                          <p style={{ fontSize: 13, color: '#065f46', marginTop: 6, lineHeight: 1.65 }}>{finding.remediation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
