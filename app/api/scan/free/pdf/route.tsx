export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Svg,
  Path,
  Circle,
  Rect,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import React from 'react';
import path from 'path';

// ─── Colours ────────────────────────────────────────────────────────────────
const C = {
  navy:      '#0a1628',
  navyMid:   '#1a2b4a',
  white:     '#ffffff',
  offWhite:  '#f7f9fc',
  border:    '#e2e8f0',
  textDark:  '#0f172a',
  textMid:   '#334155',
  textMuted: '#64748b',
  cyan:      '#0ea5e9',
  green:     '#16a34a',
  amber:     '#d97706',
  red:       '#dc2626',
  orange:    '#ea580c',
  yellow:    '#ca8a04',
  blue:      '#2563eb',
  grey:      '#94a3b8',
};

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: C.red,
  HIGH:     C.orange,
  MEDIUM:   C.yellow,
  LOW:      C.blue,
  INFO:     C.grey,
};

const CATEGORY_LABELS: Record<string, string> = {
  DNS_EMAIL:    'Email Security',
  SSL_TLS:      'SSL Certificate',
  HTTP_HEADERS: 'Security Headers',
  DARK_WEB:     'Dark Web',
  OPEN_PORTS:   'Open Ports',
  CVE_EXPOSURE: 'Vulnerabilities',
};

function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return C.green;
    case 'B': return C.cyan;
    case 'C': return C.amber;
    case 'D': return C.orange;
    default:  return C.red;
  }
}

function statusColor(status: string): string {
  if (status === 'pass') return C.green;
  if (status === 'warn') return C.amber;
  return C.red;
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.textDark,
  },

  // Dark header band
  headerBand: {
    backgroundColor: C.navy,
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 36, height: 36 },
  brandName: { fontSize: 18, fontWeight: 'bold', color: C.white },
  brandTagline: { fontSize: 8, color: '#94a3b8', marginTop: 1 },
  headerRight: { alignItems: 'flex-end' },
  reportLabel: { fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  reportDomain: { fontSize: 13, fontWeight: 'bold', color: C.white, marginTop: 2 },
  reportDate: { fontSize: 9, color: '#94a3b8', marginTop: 1 },

  // Accent stripe under header
  accentStripe: { height: 3, backgroundColor: C.cyan },

  // Body
  body: { paddingHorizontal: 32, paddingTop: 20, paddingBottom: 60 },

  // Score section
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.offWhite,
    borderRadius: 10,
    border: `1.5px solid ${C.border}`,
    padding: 20,
    marginBottom: 20,
    gap: 20,
  },
  scoreCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    border: '5px solid #e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  scoreNum: { fontSize: 30, fontWeight: 'bold', textAlign: 'center' },
  scoreOf:  { fontSize: 9, color: C.textMuted, textAlign: 'center' },
  scoreInfo: { flex: 1, gap: 6 },
  gradePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 6,
  },
  gradeText: { fontSize: 18, fontWeight: 'bold', color: C.white },
  metaLabel: { fontSize: 9, color: C.textMuted, marginBottom: 2 },
  metaValue: { fontSize: 11, fontWeight: 'bold' },

  // Section titles
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottom: `1px solid ${C.border}`,
  },

  // Narrative card
  narrativeCard: {
    backgroundColor: C.white,
    border: `1px solid ${C.border}`,
    borderLeft: `4px solid ${C.cyan}`,
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
  },
  narrativePara: {
    fontSize: 10,
    color: C.textMid,
    lineHeight: 1.7,
    marginBottom: 6,
  },
  narrativeHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    color: C.textDark,
    marginTop: 8,
    marginBottom: 4,
  },
  narrativeBullet: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
    paddingLeft: 4,
  },
  bulletDot: { width: 10 },
  bulletText: { fontSize: 10, color: C.textMid, flex: 1, lineHeight: 1.6 },

  // Category grid
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catCard: {
    width: '31.5%',
    backgroundColor: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    padding: 10,
  },
  catStatus: { fontSize: 8, fontWeight: 'bold', marginBottom: 3 },
  catName:   { fontSize: 10, fontWeight: 'bold', color: C.textDark, marginBottom: 2 },
  catSummary:{ fontSize: 8.5, color: C.textMuted },

  // Findings
  findingsCard: {
    backgroundColor: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    marginBottom: 20,
    overflow: 'hidden',
  },
  findingsHeader: {
    backgroundColor: C.offWhite,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottom: `1px solid ${C.border}`,
  },
  findingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottom: `1px solid ${C.border}`,
  },
  severityBadge: {
    fontSize: 8,
    fontWeight: 'bold',
    color: C.white,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
    minWidth: 52,
    textAlign: 'center',
  },
  findingTitle: { fontSize: 10, color: C.textMid, flex: 1 },
  findingsFooter: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  lockNote: { fontSize: 9, color: C.textMuted, fontStyle: 'italic' },

  // Dark web — LOCKED
  lockedCard: {
    backgroundColor: C.offWhite,
    border: `1.5px dashed ${C.border}`,
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  lockedTitle:{ fontSize: 11, fontWeight: 'bold', color: C.textMuted, marginBottom: 4 },
  lockedDesc:  { fontSize: 9, color: C.grey, textAlign: 'center', maxWidth: 280 },

  // Insurance readiness
  insuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.offWhite,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    padding: 14,
    marginBottom: 20,
  },
  insLabel:  { fontSize: 10, color: C.textMuted, marginBottom: 2 },
  insGrade:  { fontSize: 16, fontWeight: 'bold' },
  insDesc:   { fontSize: 9, color: C.textMid, flex: 1 },

  // CTA
  ctaBox: {
    backgroundColor: C.navy,
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaTitle: { fontSize: 12, fontWeight: 'bold', color: C.white, marginBottom: 6 },
  ctaItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 10 },
  ctaItem:  { fontSize: 9, color: '#94a3b8' },
  ctaUrl:   { fontSize: 10, color: C.cyan, fontWeight: 'bold' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.navy,
    paddingHorizontal: 32,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: { fontSize: 8, color: '#64748b' },
  footerBrand:{ fontSize: 8, color: '#94a3b8', fontWeight: 'bold' },
});

// ─── Inline SVG icons for PDF ─────────────────────────────────────────────────
function SvgCheck({ color = '#16a34a', size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function SvgWarn({ color = '#d97706', size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" />
      <Path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function SvgX({ color = '#dc2626', size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M15 9l-6 6M9 9l6 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function SvgLock({ color = '#64748b', size = 28 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="1.8" fill="none" />
      <Path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function SvgBullet({ color = '#0ea5e9', size = 6 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 6 6">
      <Circle cx="3" cy="3" r="2.5" fill={color} />
    </Svg>
  );
}

// ─── Narrative parser ────────────────────────────────────────────────────────
type NarrativeNode =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'para'; text: string };

function parseNarrative(raw: string): NarrativeNode[] {
  const nodes: NarrativeNode[] = [];
  const lines = raw.split('\n');

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;

    const stripBold = (s: string) => s.replace(/\*\*([^*]+)\*\*/g, '$1');

    if (/^## /.test(t))      nodes.push({ type: 'h2', text: stripBold(t.replace(/^## /, '')) });
    else if (/^### /.test(t)) nodes.push({ type: 'h3', text: stripBold(t.replace(/^### /, '')) });
    else if (/^# /.test(t))   nodes.push({ type: 'h2', text: stripBold(t.replace(/^# /, '')) });
    else if (/^[-*] /.test(t))nodes.push({ type: 'bullet', text: stripBold(t.replace(/^[-*] /, '')) });
    else                       nodes.push({ type: 'para', text: stripBold(t) });
  }

  return nodes;
}

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface FindingItem   { title: string; severity: string; }
interface CategoryItem  { category: string; status: string; summary: string; }
interface ReportPayload {
  domain: string;
  overallScore: number;
  grade: string;
  categoryResults: CategoryItem[];
  top3Findings: FindingItem[];
  darkWebBreachCount: number;
  underwritingGrade: string;
  narrative?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────
function MiniReport({ data, logoPath }: { data: ReportPayload; logoPath: string }) {
  const gCol  = gradeColor(data.grade);
  const uwCol = gradeColor(data.underwritingGrade);
  const nodes = data.narrative ? parseNarrative(data.narrative) : [];
  const dateStr = new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

  const uwDesc =
    data.underwritingGrade === 'A' || data.underwritingGrade === 'B'
      ? 'Strong position to qualify for cyber insurance at competitive rates.'
      : data.underwritingGrade === 'C'
      ? 'May qualify for cover but likely at a higher premium.'
      : 'Current posture may make it difficult to qualify for cyber insurance.';

  return (
    <Document>
      <Page size="A4" style={s.page} wrap={false}>

        {/* ── Header band ── */}
        <View style={s.headerBand}>
          <View style={s.headerLeft}>
            <Image src={logoPath} style={s.logo} />
            <View>
              <Text style={s.brandName}>CyberPulse</Text>
              <Text style={s.brandTagline}>Cyber Posture Intelligence</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <Text style={s.reportLabel}>Security Mini Report</Text>
            <Text style={s.reportDomain}>{data.domain}</Text>
            <Text style={s.reportDate}>{dateStr}</Text>
          </View>
        </View>
        <View style={s.accentStripe} />

        {/* ── Body ── */}
        <View style={s.body}>

          {/* Score section */}
          <View style={s.scoreSection}>
            <View style={[s.scoreCircle, { borderColor: gCol }]}>
              <Text style={[s.scoreNum, { color: gCol }]}>{data.overallScore}</Text>
              <Text style={s.scoreOf}>/ 100</Text>
            </View>
            <View style={s.scoreInfo}>
              <View style={[s.gradePill, { backgroundColor: gCol }]}>
                <Text style={s.gradeText}>Grade {data.grade}</Text>
              </View>
              <Text style={s.metaLabel}>Overall Security Score</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Text style={s.metaLabel}>Insurance Readiness: </Text>
                <Text style={[s.metaValue, { color: uwCol }]}>Grade {data.underwritingGrade}</Text>
              </View>
            </View>
          </View>

          {/* AI Narrative */}
          {nodes.length > 0 && (
            <>
              <Text style={s.sectionTitle}>AI Risk Summary</Text>
              <View style={s.narrativeCard}>
                {nodes.map((node, i) => {
                  if (node.type === 'h2') {
                    return <Text key={i} style={[s.narrativeHeading, { fontSize: 12, color: gCol }]}>{node.text}</Text>;
                  }
                  if (node.type === 'h3') {
                    return <Text key={i} style={s.narrativeHeading}>{node.text}</Text>;
                  }
                  if (node.type === 'bullet') {
                    return (
                      <View key={i} style={[s.narrativeBullet, { alignItems: 'flex-start', paddingTop: 3 }]}>
                        <View style={{ marginTop: 4 }}><SvgBullet color={C.cyan} size={5} /></View>
                        <Text style={s.bulletText}>{node.text}</Text>
                      </View>
                    );
                  }
                  return <Text key={i} style={s.narrativePara}>{node.text}</Text>;
                })}
              </View>
            </>
          )}

          {/* Category results */}
          <Text style={s.sectionTitle}>Category Results</Text>
          <View style={s.catGrid}>
            {data.categoryResults.map((c) => (
              <View key={c.category} style={[s.catCard, { borderTop: `3px solid ${statusColor(c.status)}` }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                  {c.status === 'pass'
                    ? <SvgCheck color={statusColor('pass')} size={10} />
                    : c.status === 'warn'
                    ? <SvgWarn color={statusColor('warn')} size={10} />
                    : <SvgX color={statusColor('fail')} size={10} />}
                  <Text style={[s.catStatus, { color: statusColor(c.status) }]}>
                    {c.status === 'pass' ? 'PASS' : c.status === 'warn' ? 'WARN' : 'FAIL'}
                  </Text>
                </View>
                <Text style={s.catName}>{CATEGORY_LABELS[c.category] ?? c.category}</Text>
                <Text style={s.catSummary}>{c.summary}</Text>
              </View>
            ))}
          </View>

          {/* Top findings */}
          <Text style={s.sectionTitle}>Top Security Findings</Text>
          <View style={s.findingsCard}>
            <View style={s.findingsHeader}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: C.textDark }}>
                Highest-priority issues requiring action
              </Text>
            </View>
            {data.top3Findings.map((f, i) => (
              <View
                key={i}
                style={[
                  s.findingRow,
                  i === data.top3Findings.length - 1 ? { borderBottom: 'none' } : {},
                ]}
              >
                <Text style={[s.severityBadge, { backgroundColor: SEVERITY_COLOR[f.severity] ?? C.grey }]}>
                  {f.severity}
                </Text>
                <Text style={s.findingTitle}>{f.title}</Text>
              </View>
            ))}
            <View style={[s.findingsFooter, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
              <SvgLock color={C.grey} size={10} />
              <Text style={s.lockNote}>
                Full remediation steps, CVE details and fix guides are available in your free account dashboard.
              </Text>
            </View>
          </View>

          {/* Dark Web — LOCKED */}
          <Text style={s.sectionTitle}>Dark Web Exposure</Text>
          <View style={s.lockedCard}>
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <SvgLock color={C.grey} size={28} />
            </View>
            <Text style={s.lockedTitle}>Dark Web Data Available in Full Report</Text>
            <Text style={s.lockedDesc}>
              Your full report includes a complete dark web breach scan — showing any exposed email addresses,
              passwords, or credentials linked to your domain found on hacker forums and paste sites.
              Create your free account to unlock this section.
            </Text>
          </View>

          {/* Insurance readiness */}
          <Text style={s.sectionTitle}>Insurance Readiness</Text>
          <View style={s.insuranceRow}>
            <View style={[s.gradePill, { backgroundColor: uwCol, margin: 0, alignSelf: 'center' }]}>
              <Text style={[s.gradeText, { fontSize: 18 }]}>{data.underwritingGrade}</Text>
            </View>
            <Text style={s.insDesc}>{uwDesc}</Text>
          </View>

          {/* CTA */}
          <View style={s.ctaBox}>
            <Text style={s.ctaTitle}>Unlock Your Full Security Report — Free</Text>
            <View style={s.ctaItems}>
              {[
                'Step-by-step remediation guides',
                'Dark web breach analysis',
                'Downloadable PDF attestation for insurers',
                'Continuous monitoring & instant alerts',
              ].map((item) => (
                <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <SvgCheck color="#0ea5e9" size={9} />
                  <Text style={s.ctaItem}>{item}</Text>
                </View>
              ))}
            </View>
            <Text style={s.ctaUrl}>cyberpulse.co.za</Text>
          </View>

        </View>

        {/* ── Footer band ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerBrand}>CyberPulse</Text>
          <Text style={s.footerText}>Free Security Scan Report  •  {data.domain}  •  {dateStr}</Text>
          <Text style={s.footerText}>cyberpulse.co.za</Text>
        </View>

      </Page>
    </Document>
  );
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const data: ReportPayload = await req.json();
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');

    const buffer = await renderToBuffer(<MiniReport data={data} logoPath={logoPath} />);

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cyberpulse-report-${data.domain}.pdf"`,
      },
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}
