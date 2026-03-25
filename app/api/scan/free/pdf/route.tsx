export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import {
  Document, Page, Text, View, Image, Svg, Path, Circle, Rect, Line,
  StyleSheet, renderToBuffer,
} from '@react-pdf/renderer';
import React from 'react';
import path from 'path';

// ─── Colour palette ──────────────────────────────────────────────────────────
const C = {
  // Light theme (matches site)
  bg:        '#f0f4f8',
  card:      '#ffffff',
  border:    '#dde3ec',
  borderMid: '#c5cdd8',
  text:      '#0f172a',
  textMid:   '#334155',
  textMuted: '#64748b',
  textFaint: '#94a3b8',
  // Brand
  navy:      '#0c1220',
  navyMid:   '#1e2d45',
  cyan:      '#0ea5e9',
  green:     '#10b981',
  greenDark: '#059669',
  amber:     '#f59e0b',
  orange:    '#f97316',
  red:       '#ef4444',
  // Grade backgrounds
  greenBg:   '#f0fdf4',
  greenBorder:'#bbf7d0',
  blueBg:    '#eff6ff',
  blueBorder:'#bfdbfe',
  amberBg:   '#fffbeb',
  amberBorder:'#fde68a',
  orangeBg:  '#fff7ed',
  orangeBorder:'#fed7aa',
  redBg:     '#fef2f2',
  redBorder: '#fecaca',
};

// ─── Grade helpers ───────────────────────────────────────────────────────────
function gradeColor(g: string)  { return g === 'A' ? C.green : g === 'B' ? C.cyan : g === 'C' ? C.amber : g === 'D' ? C.orange : C.red; }
function gradeBg(g: string)     { return g === 'A' ? C.greenBg  : g === 'B' ? C.blueBg  : g === 'C' ? C.amberBg  : g === 'D' ? C.orangeBg  : C.redBg; }
function gradeBorder(g: string) { return g === 'A' ? C.greenBorder : g === 'B' ? C.blueBorder : g === 'C' ? C.amberBorder : g === 'D' ? C.orangeBorder : C.redBorder; }

function statusColor(s: string) { return s === 'pass' ? C.green : s === 'warn' ? C.amber : C.red; }
function statusLabel(s: string) { return s === 'pass' ? 'PASS' : s === 'warn' ? 'WARN' : 'FAIL'; }

const SEV_COLOR: Record<string, string> = {
  CRITICAL: C.red, HIGH: C.orange, MEDIUM: C.amber, LOW: C.cyan, INFO: C.textFaint,
};
const SEV_BG: Record<string, string> = {
  CRITICAL: C.redBg, HIGH: C.orangeBg, MEDIUM: C.amberBg, LOW: C.blueBg, INFO: '#f8fafc',
};

const CAT_LABEL: Record<string, string> = {
  DNS_EMAIL: 'Email Security', SSL_TLS: 'SSL Certificate',
  HTTP_HEADERS: 'Security Headers', DARK_WEB: 'Dark Web',
  OPEN_PORTS: 'Open Ports', CVE_EXPOSURE: 'Vulnerabilities',
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { backgroundColor: C.card, fontFamily: 'Helvetica', fontSize: 10, color: C.text },

  // Header
  header: {
    backgroundColor: C.navy,
    paddingHorizontal: 32, paddingTop: 18, paddingBottom: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#0c2a3d', borderWidth: 1, borderColor: '#1e6fa0', borderStyle: 'solid', alignItems: 'center', justifyContent: 'center' },
  brandCol: { gap: 2 },
  brandName: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: C.card, letterSpacing: 0.3 },
  brandTag:  { fontSize: 7.5, color: C.textFaint, letterSpacing: 0.5 },
  headerRight: { alignItems: 'flex-end', gap: 2 },
  reportBadge: { fontSize: 7.5, color: C.cyan, textTransform: 'uppercase', letterSpacing: 1.2 },
  reportDomain: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.card },
  reportDate:   { fontSize: 7.5, color: C.textFaint },

  // Cyan accent stripe
  stripe: { height: 3, backgroundColor: C.cyan },

  // Body
  body: { paddingHorizontal: 32, paddingTop: 22, paddingBottom: 68 },

  // Section header
  sectionHead: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 10, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: C.border, borderBottomStyle: 'solid',
  },
  sectionLabel: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.2 },
  sectionLine:  { flex: 1, height: 1, backgroundColor: C.border },

  // Score card
  scoreCard: {
    backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.border, borderStyle: 'solid',
    padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 22,
  },
  scoreRing: { width: 82, height: 82, borderRadius: 41, borderWidth: 4, borderStyle: 'solid', borderColor: C.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  scoreNum:  { fontSize: 28, fontFamily: 'Helvetica-Bold', textAlign: 'center', lineHeight: 1 },
  scoreOf:   { fontSize: 8, color: C.textFaint, textAlign: 'center', marginTop: 1 },
  scoreRight: { flex: 1, gap: 8 },
  gradePill: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 6 },
  gradeText: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.card },
  metaRow:   { flexDirection: 'row', gap: 20 },
  metaBlock: { gap: 2 },
  metaLabel: { fontSize: 8, color: C.textFaint },
  metaValue: { fontSize: 10, fontFamily: 'Helvetica-Bold' },

  // Narrative
  narrativeCard: {
    backgroundColor: C.card, border: `1px solid ${C.border}`,
    borderLeftWidth: 4, borderLeftColor: C.cyan, borderLeftStyle: 'solid', borderRadius: 7,
    padding: 16, marginBottom: 20,
  },
  narrativePara: { fontSize: 9.5, color: C.textMid, lineHeight: 1.7, marginBottom: 5 },
  narrativeH2:   { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.text, marginTop: 10, marginBottom: 4 },
  narrativeH3:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.cyan, marginTop: 7, marginBottom: 3 },
  narrativeBullet: { flexDirection: 'row', gap: 6, marginBottom: 4, paddingLeft: 4 },
  bulletText:    { fontSize: 9.5, color: C.textMid, flex: 1, lineHeight: 1.65 },

  // Category grid — 2×3
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catCard: {
    width: '31.8%', backgroundColor: C.card, borderRadius: 7,
    border: `1px solid ${C.border}`, padding: 11, overflow: 'hidden',
  },
  catTopBar:    { height: 3, borderRadius: 1, marginBottom: 8, marginHorizontal: -11, marginTop: -11 },
  catStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  catStatusBadge: { fontSize: 7, fontFamily: 'Helvetica-Bold', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 2 },
  catName:      { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.text, marginBottom: 2 },
  catSummary:   { fontSize: 8, color: C.textMuted, lineHeight: 1.5 },

  // Findings
  findCard: {
    backgroundColor: C.card, border: `1px solid ${C.border}`,
    borderRadius: 7, marginBottom: 20, overflow: 'hidden',
  },
  findHeader: {
    backgroundColor: C.bg, paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.border, borderBottomStyle: 'solid', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  findHeaderTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.text },
  findHeaderSub:   { fontSize: 8, color: C.textMuted },
  findRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: C.border, borderBottomStyle: 'solid',
  },
  findRowInner: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  sevBadge: {
    fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.card,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 3,
    minWidth: 54, textAlign: 'center',
  },
  findTitle: { fontSize: 9.5, color: C.textMid, flex: 1, lineHeight: 1.4 },
  findFooter: { paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  lockNote: { fontSize: 8.5, color: C.textMuted, fontFamily: 'Helvetica-Oblique' },

  // Dark web locked
  darkWebCard: {
    backgroundColor: C.bg, borderWidth: 1, borderStyle: 'dashed', borderColor: C.border,
    borderRadius: 7, padding: 18, marginBottom: 20, alignItems: 'center', gap: 6,
  },
  dwTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.textMuted },
  dwDesc:  { fontSize: 8.5, color: C.textFaint, textAlign: 'center', maxWidth: 300, lineHeight: 1.55 },

  // Insurance readiness
  insCard: {
    backgroundColor: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 7, padding: 14, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  insGradePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  insGradeText: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  insRight: { flex: 1, gap: 3 },
  insLabel: { fontSize: 8, color: C.textFaint, textTransform: 'uppercase', letterSpacing: 0.8 },
  insDesc:  { fontSize: 9.5, color: C.textMid, lineHeight: 1.55 },

  // CTA
  ctaBox: {
    backgroundColor: C.navy, borderRadius: 9, padding: 20,
    alignItems: 'center', marginBottom: 20,
  },
  ctaTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.card, marginBottom: 12, textAlign: 'center' },
  ctaGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 12 },
  ctaItem:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ctaItemText: { fontSize: 8.5, color: C.textFaint },
  ctaUrl:   { fontSize: 10, color: C.cyan, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.navy, paddingHorizontal: 32, paddingVertical: 11,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerLeft:  { fontSize: 7.5, color: C.textFaint },
  footerMid:   { fontSize: 7.5, color: '#475569' },
  footerRight: { fontSize: 7.5, color: C.cyan, fontFamily: 'Helvetica-Bold' },
});

// ─── SVG icon components ─────────────────────────────────────────────────────
function PdfCheck({ color = C.green, size = 11 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
function PdfWarn({ color = C.amber, size = 11 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" />
      <Path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
  );
}
function PdfX({ color = C.red, size = 11 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M15 9l-6 6M9 9l6 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
  );
}
function PdfShield({ color = C.cyan, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}
function PdfLock({ color = C.textMuted, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="1.8" fill="none" />
      <Path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </Svg>
  );
}
function PdfBullet({ color = C.cyan, size = 5 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 6 6">
      <Circle cx="3" cy="3" r="2.5" fill={color} />
    </Svg>
  );
}
function PdfDot({ color = C.green, size = 6 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 8 8">
      <Circle cx="4" cy="4" r="3.5" fill={color} />
    </Svg>
  );
}

// ─── Narrative parser ────────────────────────────────────────────────────────
type NNode = { type: 'h2'|'h3'|'bullet'|'para'; text: string };

function parseNarrative(raw: string): NNode[] {
  const out: NNode[] = [];
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    const strip = (s: string) => s.replace(/\*\*([^*]+)\*\*/g, '$1');
    if (/^## /.test(t))       out.push({ type: 'h2',     text: strip(t.slice(3)) });
    else if (/^### /.test(t)) out.push({ type: 'h3',     text: strip(t.slice(4)) });
    else if (/^# /.test(t))   out.push({ type: 'h2',     text: strip(t.slice(2)) });
    else if (/^[-*] /.test(t))out.push({ type: 'bullet', text: strip(t.slice(2)) });
    else                       out.push({ type: 'para',   text: strip(t) });
  }
  return out;
}

// ─── Data types ──────────────────────────────────────────────────────────────
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

// ─── PDF component ────────────────────────────────────────────────────────────
function MiniReport({ data, logoPath }: { data: ReportPayload; logoPath: string }) {
  const gCol    = gradeColor(data.grade);
  const gBg     = gradeBg(data.grade);
  const uwCol   = gradeColor(data.underwritingGrade);
  const uwBg    = gradeBg(data.underwritingGrade);
  const nodes   = data.narrative ? parseNarrative(data.narrative) : [];
  const dateStr = new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

  const uwDesc =
    ['A','B'].includes(data.underwritingGrade) ? 'Strong position to qualify for cyber insurance at competitive rates.' :
    data.underwritingGrade === 'C' ? 'May qualify for cover but likely at an elevated premium.' :
    'Significant remediation required before most policies will be issued.';

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.logoBox}>
              <PdfShield color={C.cyan} size={16} />
            </View>
            <View style={s.brandCol}>
              <Text style={s.brandName}>CyberPulse</Text>
              <Text style={s.brandTag}>Cyber Posture Intelligence</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <Text style={s.reportBadge}>Security Mini Report</Text>
            <Text style={s.reportDomain}>{data.domain}</Text>
            <Text style={s.reportDate}>{dateStr}</Text>
          </View>
        </View>
        <View style={s.stripe} />

        {/* ── Body ── */}
        <View style={s.body}>

          {/* ── Score card ── */}
          <View style={s.scoreCard}>
            <View style={[s.scoreRing, { borderColor: gCol, backgroundColor: gBg }]}>
              <Text style={[s.scoreNum, { color: gCol }]}>{data.overallScore}</Text>
              <Text style={s.scoreOf}>/ 100</Text>
            </View>
            <View style={s.scoreRight}>
              <View style={[s.gradePill, { backgroundColor: gCol }]}>
                <Text style={s.gradeText}>Grade {data.grade}</Text>
              </View>
              <Text style={{ fontSize: 8, color: C.textMuted }}>Overall Security Score</Text>
              <View style={s.metaRow}>
                <View style={s.metaBlock}>
                  <Text style={s.metaLabel}>Insurance Readiness</Text>
                  <Text style={[s.metaValue, { color: uwCol }]}>Grade {data.underwritingGrade}</Text>
                </View>
                <View style={s.metaBlock}>
                  <Text style={s.metaLabel}>Scan Date</Text>
                  <Text style={[s.metaValue, { color: C.textMid }]}>{dateStr}</Text>
                </View>
                <View style={s.metaBlock}>
                  <Text style={s.metaLabel}>Categories</Text>
                  <Text style={[s.metaValue, { color: C.textMid }]}>{data.categoryResults.length} / 6</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── AI Risk Summary ── */}
          {nodes.length > 0 && (
            <>
              <View style={s.sectionHead}>
                <Text style={s.sectionLabel}>AI Risk Summary</Text>
              </View>
              <View style={s.narrativeCard}>
                {nodes.map((node, i) => {
                  if (node.type === 'h2') return <Text key={i} style={[s.narrativeH2, { color: gCol }]}>{node.text}</Text>;
                  if (node.type === 'h3') return <Text key={i} style={s.narrativeH3}>{node.text}</Text>;
                  if (node.type === 'bullet') return (
                    <View key={i} style={s.narrativeBullet}>
                      <View style={{ marginTop: 4 }}><PdfBullet color={C.cyan} size={5} /></View>
                      <Text style={s.bulletText}>{node.text}</Text>
                    </View>
                  );
                  return <Text key={i} style={s.narrativePara}>{node.text}</Text>;
                })}
              </View>
            </>
          )}

          {/* ── Category results ── */}
          <View style={s.sectionHead}>
            <Text style={s.sectionLabel}>Category Results</Text>
          </View>
          <View style={s.catGrid}>
            {data.categoryResults.map((c) => {
              const sc = statusColor(c.status);
              return (
                <View key={c.category} style={s.catCard}>
                  <View style={[s.catTopBar, { backgroundColor: sc }]} />
                  <View style={s.catStatusRow}>
                    {c.status === 'pass'
                      ? <PdfCheck color={sc} size={9} />
                      : c.status === 'warn'
                      ? <PdfWarn color={sc} size={9} />
                      : <PdfX color={sc} size={9} />}
                    <View style={[s.catStatusBadge, { backgroundColor: sc }]}>
                      <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.card }}>{statusLabel(c.status)}</Text>
                    </View>
                  </View>
                  <Text style={s.catName}>{CAT_LABEL[c.category] ?? c.category}</Text>
                  <Text style={s.catSummary}>{c.summary}</Text>
                </View>
              );
            })}
          </View>

          {/* ── Top findings ── */}
          <View style={s.sectionHead}>
            <Text style={s.sectionLabel}>Top Security Findings</Text>
          </View>
          <View style={s.findCard}>
            <View style={s.findHeader}>
              <Text style={s.findHeaderTitle}>Highest-priority issues requiring attention</Text>
              <Text style={s.findHeaderSub}>{data.top3Findings.length} of your critical findings</Text>
            </View>
            {data.top3Findings.map((f, i) => (
              <View
                key={i}
                style={[
                  s.findRow,
                  { backgroundColor: SEV_BG[f.severity] ?? '#f8fafc' },
                  i === data.top3Findings.length - 1 ? { borderBottomWidth: 0 } : {},
                ]}
              >
                <View style={s.findRowInner}>
                  <Text style={[s.sevBadge, { backgroundColor: SEV_COLOR[f.severity] ?? C.textFaint }]}>
                    {f.severity}
                  </Text>
                  <Text style={s.findTitle}>{f.title}</Text>
                </View>
              </View>
            ))}
            <View style={s.findFooter}>
              <PdfLock color={C.textFaint} size={9} />
              <Text style={s.lockNote}>Full remediation steps, CVE details and fix guides are available in your free account dashboard.</Text>
            </View>
          </View>

          {/* ── Dark web — locked ── */}
          <View style={s.sectionHead}>
            <Text style={s.sectionLabel}>Dark Web Exposure</Text>
          </View>
          <View style={s.darkWebCard}>
            <PdfLock color={C.textMuted} size={24} />
            <Text style={s.dwTitle}>Dark Web Data Available in Full Report</Text>
            <Text style={s.dwDesc}>
              Your full report includes a complete dark web breach scan — showing any exposed email addresses,
              passwords, or credentials linked to your domain found on hacker forums and paste sites.
              Create your free account to unlock this section.
            </Text>
          </View>

          {/* ── Insurance readiness ── */}
          <View style={s.sectionHead}>
            <Text style={s.sectionLabel}>Insurance Readiness</Text>
          </View>
          <View style={[s.insCard, { border: `1px solid ${gradeBorder(data.underwritingGrade)}` }]}>
            <View style={[s.insGradePill, { backgroundColor: uwCol }]}>
              <Text style={[s.insGradeText, { color: C.card }]}>{data.underwritingGrade}</Text>
            </View>
            <View style={s.insRight}>
              <Text style={s.insLabel}>Insurability Grade</Text>
              <Text style={s.insDesc}>{uwDesc}</Text>
            </View>
          </View>

          {/* ── CTA ── */}
          <View style={s.ctaBox}>
            <Text style={s.ctaTitle}>Unlock Your Full Security Report — Free</Text>
            <View style={s.ctaGrid}>
              {[
                'Step-by-step remediation guides',
                'Dark web breach analysis',
                'Downloadable PDF attestation for insurers',
                'Continuous monitoring & instant alerts',
              ].map((item) => (
                <View key={item} style={s.ctaItem}>
                  <PdfCheck color={C.cyan} size={8} />
                  <Text style={s.ctaItemText}>{item}</Text>
                </View>
              ))}
            </View>
            <Text style={s.ctaUrl}>cyberpulse.co.za</Text>
          </View>

        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>CyberPulse Free Security Scan Report</Text>
          <Text style={s.footerMid}>{data.domain}  •  {dateStr}</Text>
          <Text style={s.footerRight}>cyberpulse.co.za</Text>
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
