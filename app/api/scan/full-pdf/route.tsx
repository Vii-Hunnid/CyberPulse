export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import {
  Document, Page, Text, View, Svg, Path, Circle,
  StyleSheet, renderToBuffer,
} from '@react-pdf/renderer';
import React from 'react';

/* ─── Colour palette ─────────────────────────────────────────── */
const C = {
  bg:        '#f0f4f8',
  card:      '#ffffff',
  border:    '#dde3ec',
  text:      '#0f172a',
  textMid:   '#334155',
  textMuted: '#64748b',
  cyan:      '#0ea5e9',
  navy:      '#0c1220',
  green:     '#10b981',
  yellow:    '#f59e0b',
  red:       '#ef4444',
  orange:    '#f97316',
  blue:      '#3b82f6',
  greenBg:   '#f0fdf4',
  greenBdr:  '#bbf7d0',
  redBg:     '#fef2f2',
  redBdr:    '#fecaca',
  yellowBg:  '#fffbeb',
  blueBg:    '#eff6ff',
};

/* ─── Grade helpers ──────────────────────────────────────────── */
function gradeColor(g?: string) {
  if (!g) return C.red;
  if (g === 'A') return C.green;
  if (g === 'B') return C.cyan;
  if (g === 'C') return C.yellow;
  if (g === 'D') return C.orange;
  return C.red;
}
function gradeBg(g?: string) {
  if (!g) return C.redBg;
  if (g === 'A') return C.greenBg;
  if (g === 'B') return '#eff6ff';
  if (g === 'C') return C.yellowBg;
  if (g === 'D') return '#fff7ed';
  return C.redBg;
}
function sevColor(s: string) {
  if (s === 'CRITICAL') return C.red;
  if (s === 'HIGH')     return C.orange;
  if (s === 'MEDIUM')   return C.yellow;
  if (s === 'LOW')      return C.cyan;
  return C.textMuted;
}
function sevBg(s: string) {
  if (s === 'CRITICAL') return C.redBg;
  if (s === 'HIGH')     return '#fff7ed';
  if (s === 'MEDIUM')   return C.yellowBg;
  if (s === 'LOW')      return C.blueBg;
  return '#f8fafc';
}
function statusColor(s: string) {
  if (s === 'pass') return C.green;
  if (s === 'warn') return C.yellow;
  return C.red;
}
const CAT_LABEL: Record<string, string> = {
  DNS_EMAIL:     'Email Security',
  SSL_TLS:       'SSL / TLS',
  HTTP_HEADERS:  'Security Headers',
  OPEN_PORTS:    'Open Ports',
  CVE_EXPOSURE:  'Vulnerabilities',
  DARK_WEB:      'Dark Web',
};

/* ─── SVG icons ──────────────────────────────────────────────── */
function PdfShield({ color = C.cyan, size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z" fill={color} />
    </Svg>
  );
}
function PdfCheck({ color = C.green, size = 10 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
}
function PdfX({ color = C.red, size = 10 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M15 9l-6 6M9 9l6 6" stroke={color} strokeWidth="2" />
    </Svg>
  );
}
function PdfWarn({ color = C.yellow, size = 10 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
}
function PdfLock({ color = C.textMuted, size = 10 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
}
function PdfGlobe({ color = C.cyan, size = 10 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const s = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    paddingBottom: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.text,
  },
  // Header
  header: {
    backgroundColor: C.navy,
    padding: '16 28',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft:   { flexDirection: 'row', alignItems: 'center' },
  logoBox:      { width: 28, height: 28, borderRadius: 6, backgroundColor: '#1e3a5f', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  brandName:    { fontSize: 14, fontWeight: 700, color: '#f8fafc', fontFamily: 'Helvetica-Bold' },
  brandTag:     { fontSize: 8, color: '#94a3b8', marginTop: 1 },
  headerRight:  { alignItems: 'flex-end' },
  reportBadge:  { fontSize: 8, color: C.cyan, fontFamily: 'Helvetica-Bold', letterSpacing: 1, textTransform: 'uppercase' },
  reportDomain: { fontSize: 13, fontWeight: 700, color: '#f8fafc', fontFamily: 'Helvetica-Bold', marginTop: 2 },
  reportDate:   { fontSize: 8, color: '#94a3b8', marginTop: 2 },
  stripe:       { height: 3, backgroundColor: C.cyan },
  // Body
  body:         { padding: '16 28 0 28' },
  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 16 },
  sectionTitle:  { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginLeft: 5 },
  // Cards
  card: {
    backgroundColor: C.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'solid',
    padding: '14 16',
    marginBottom: 10,
  },
  // Score card
  scoreCard: {
    backgroundColor: C.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'solid',
    padding: '16 20',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  scoreNum:  { fontSize: 22, fontFamily: 'Helvetica-Bold', lineHeight: 1 },
  scoreOf:   { fontSize: 7, color: C.textMuted, marginTop: 1 },
  gradeBox:  { padding: '6 14', borderRadius: 6, alignItems: 'center', marginBottom: 6 },
  gradeText: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  metaRow:   { flexDirection: 'row', marginTop: 4 },
  metaItem:  { marginRight: 20 },
  metaLabel: { fontSize: 7, color: C.textMuted, marginBottom: 2 },
  metaVal:   { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  // Severity counts row
  sevRow:    { flexDirection: 'row', marginTop: 6 },
  sevItem:   { marginRight: 16 },
  sevNum:    { fontSize: 16, fontFamily: 'Helvetica-Bold', lineHeight: 1 },
  sevLabel:  { fontSize: 7, color: C.textMuted, marginTop: 1 },
  // Category grid
  catGrid:   { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2 },
  catCard: {
    width: '31%',
    backgroundColor: C.card,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'solid',
    padding: '10 12',
    marginRight: '2%',
    marginBottom: 8,
  },
  catTopBar: { height: 3, borderRadius: 2, marginBottom: 8 },
  catLabel:  { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.text, marginBottom: 4 },
  catScore:  { fontSize: 18, fontFamily: 'Helvetica-Bold', lineHeight: 1 },
  catOf:     { fontSize: 7, color: C.textMuted, marginTop: 1 },
  catStatus: { fontSize: 7, fontFamily: 'Helvetica-Bold', marginTop: 4, textTransform: 'uppercase', letterSpacing: .5 },
  // Narrative
  narrativeCard: {
    backgroundColor: C.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'solid',
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
    padding: '14 16',
    marginBottom: 10,
  },
  narrativeText: { fontSize: 9, color: C.textMid, lineHeight: 1.7 },
  // Finding card
  findCard: {
    backgroundColor: C.card,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'solid',
    marginBottom: 6,
    overflow: 'hidden',
  },
  findHeader: { flexDirection: 'row', alignItems: 'center', padding: '9 12' },
  findBadge:  { borderRadius: 3, padding: '2 6', marginRight: 8 },
  findBadgeTx:{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#fff', textTransform: 'uppercase', letterSpacing: .5 },
  findTitle:  { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.text, flex: 1 },
  findCat:    { fontSize: 7, color: C.textMuted, fontFamily: 'Helvetica-Oblique' },
  findBody:   { padding: '0 12 10 12', borderTopWidth: 1, borderTopColor: C.border, borderTopStyle: 'solid', paddingTop: 8 },
  findDesc:   { fontSize: 8, color: C.textMid, lineHeight: 1.6, marginBottom: 6 },
  remBox: {
    backgroundColor: C.greenBg,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: C.greenBdr,
    borderStyle: 'solid',
    padding: '7 9',
  },
  remLabel:  { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#065f46', letterSpacing: .5, marginBottom: 3 },
  remText:   { fontSize: 8, color: '#047857', lineHeight: 1.5 },
  // Insurance
  uwRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  uwRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  uwScore:   { fontSize: 16, fontFamily: 'Helvetica-Bold' },
  uwGrade:   { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  uwMeta:    { flexDirection: 'row' },
  uwMetaItm: { marginRight: 18 },
  uwSummary: { fontSize: 8, color: C.textMid, lineHeight: 1.6, padding: '8 10', borderRadius: 6, marginBottom: 10 },
  uwFactsRow:{ flexDirection: 'row' },
  uwFactsCol:{ flex: 1 },
  uwFactHead:{ fontSize: 7, fontFamily: 'Helvetica-Bold', letterSpacing: .5, marginBottom: 5 },
  uwFactRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  uwFactTxt: { fontSize: 8, color: C.textMid, lineHeight: 1.5, flex: 1 },
  // Dark web
  dwCard: {
    borderRadius: 7,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: '9 12',
    marginBottom: 6,
  },
  dwSource: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#dc2626', marginBottom: 2 },
  dwDate:   { fontSize: 7, color: C.textMuted },
  dwData:   { fontSize: 8, color: '#7f1d1d', marginTop: 3 },
  // Endpoints
  epSummary: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 6, padding: '7 10', marginBottom: 8 },
  epSumItem: { marginRight: 16 },
  epSumLbl:  { fontSize: 7, color: C.textMuted },
  epSumVal:  { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  epRow:     { flexDirection: 'row', alignItems: 'center', padding: '6 10', borderRadius: 5, marginBottom: 3 },
  epPath:    { fontSize: 8, fontFamily: 'Helvetica', color: C.textMid, flex: 1 },
  epType:    { fontSize: 7, color: C.textMuted, marginRight: 8, width: 50 },
  epBadge:   { fontSize: 7, fontFamily: 'Helvetica-Bold', borderRadius: 3, padding: '2 6' },
  epCode:    { fontSize: 7, color: C.textMuted, marginLeft: 6, width: 24 },
  // Sitemap pills
  sitemapRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  sitemapPill:{ fontSize: 7, fontFamily: 'Helvetica', color: C.textMid, backgroundColor: '#f0f4f8', padding: '2 6', borderRadius: 3, marginRight: 4, marginBottom: 3 },
  // Merkle
  merkleRoot: {
    backgroundColor: C.navy,
    borderRadius: 8,
    padding: '10 16',
    alignItems: 'center',
    marginBottom: 8,
  },
  merkleRootLabel: { fontSize: 7, color: C.cyan, letterSpacing: 1.5, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  merkleRootDomain:{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#f8fafc', marginBottom: 2 },
  merkleRootHash:  { fontSize: 8, color: '#475569', fontFamily: 'Helvetica' },
  merkleCatGrid:   { flexDirection: 'row', flexWrap: 'wrap' },
  merkleCatCard: {
    width: '31%',
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: '7 9',
    marginRight: '2%',
    marginBottom: 6,
  },
  merkleCatRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  merkleDot:       { width: 5, height: 5, borderRadius: 3, marginRight: 5 },
  merkleCatName:   { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.text, flex: 1 },
  merkleCatStatus: { fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 2 },
  merkleCatHash:   { fontSize: 7, color: C.textMuted, fontFamily: 'Helvetica', wordBreak: 'break-all' },
  merkleFooter:    { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 6, padding: '7 10', marginTop: 4 },
  merkleFootItm:   { marginRight: 16 },
  merkleFootLbl:   { fontSize: 7, color: C.textMuted },
  merkleFootVal:   { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  // Alert banner
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '7 10',
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    marginBottom: 8,
  },
  alertText: { fontSize: 8, fontFamily: 'Helvetica-Bold', marginLeft: 6 },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8 28',
    borderTopWidth: 1,
    borderTopColor: C.border,
    borderTopStyle: 'solid',
    backgroundColor: C.card,
  },
  footerText: { fontSize: 7, color: C.textMuted },
  footerBrand:{ fontSize: 7, color: C.cyan, fontFamily: 'Helvetica-Bold' },
});

/* ─── Narrative parser ───────────────────────────────────────── */
type NNode = { type: 'h1'|'h2'|'h3'|'bullet'|'para'; text: string };
function parseNarrative(raw: string): NNode[] {
  const out: NNode[] = [];
  const strip = (s: string) => s.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    if      (/^## /.test(t))   out.push({ type: 'h2',     text: strip(t.slice(3)) });
    else if (/^### /.test(t))  out.push({ type: 'h3',     text: strip(t.slice(4)) });
    else if (/^# /.test(t))    out.push({ type: 'h1',     text: strip(t.slice(2)) });
    else if (/^[-*] /.test(t)) out.push({ type: 'bullet', text: strip(t.slice(2)) });
    else                        out.push({ type: 'para',   text: strip(t) });
  }
  return out;
}

/* ─── Payload types ──────────────────────────────────────────── */
interface FindingItem {
  category: string; title: string; description?: string;
  severity: string; remediation?: string;
}
interface CategoryScore { category: string; score: number; status: string; }
interface Underwriting {
  underwritingScore?: number; insurabilityGrade?: string;
  recommendedCoverageLevel?: string; premiumIndicator?: string;
  keyRiskFactors?: string[]; positiveFactors?: string[]; summary?: string;
}
interface ProbedEp {
  path: string; type: string; statusCode: number | null;
  status: string; isExposed: boolean;
}
interface EndpointData {
  probed: ProbedEp[];
  summary: { total: number; public: number; protected: number; exposed: number };
  sitemapPages: string[];
}
interface MerkleData {
  rootHash: string;
  categories: { category: string; score: number; status: string; hash: string }[];
  endpoints?: { path: string; type: string; status: string; isExposed: boolean; hash: string }[];
  sitemapPages?: string[];
}
interface FullReportPayload {
  domain: string; overallScore: number; grade: string;
  categoryScores: CategoryScore[];
  findings: FindingItem[];
  narrative?: string;
  underwriting?: Underwriting | null;
  darkWebResults?: { source: string; breachDate: string; dataClasses: string[] }[];
  endpoints?: EndpointData | null;
  merkle?: MerkleData | null;
}

/* ─── PDF component ──────────────────────────────────────────── */
function FullReport({ data }: { data: FullReportPayload }) {
  const gCol = gradeColor(data.grade);
  const gBg  = gradeBg(data.grade);
  const dateStr = new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

  const SEV_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
  const sevCounts = SEV_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = data.findings.filter((f) => f.severity === s).length;
    return acc;
  }, {});

  const uwCol = gradeColor(data.underwriting?.insurabilityGrade);
  const uwBg  = gradeBg(data.underwriting?.insurabilityGrade);

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header} fixed>
          <View style={s.headerLeft}>
            <View style={s.logoBox}><PdfShield color={C.cyan} size={16} /></View>
            <View>
              <Text style={s.brandName}>CyberPulse</Text>
              <Text style={s.brandTag}>Cyber Posture Intelligence</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <Text style={s.reportBadge}>FULL SECURITY REPORT</Text>
            <Text style={s.reportDomain}>{data.domain}</Text>
            <Text style={s.reportDate}>{dateStr}</Text>
          </View>
        </View>
        <View style={s.stripe} fixed />

        <View style={s.body}>

          {/* ── Score card ── */}
          <View style={s.scoreCard}>
            {/* Score ring */}
            <View style={[s.scoreRing, { borderColor: gCol, backgroundColor: gBg }]}>
              <Text style={[s.scoreNum, { color: gCol }]}>{data.overallScore}</Text>
              <Text style={s.scoreOf}>/ 100</Text>
            </View>
            {/* Grade + meta */}
            <View style={{ flex: 1 }}>
              <View style={[s.gradeBox, { backgroundColor: gBg, borderWidth: 1, borderColor: gCol + '44', borderStyle: 'solid', alignSelf: 'flex-start' }]}>
                <Text style={[s.gradeText, { color: gCol }]}>Grade {data.grade}</Text>
              </View>
              <Text style={{ fontSize: 7, color: C.textMuted, marginTop: 3 }}>Overall Security Score</Text>
              <View style={s.metaRow}>
                {data.underwriting?.insurabilityGrade && (
                  <View style={s.metaItem}>
                    <Text style={s.metaLabel}>Insurance Readiness</Text>
                    <Text style={[s.metaVal, { color: gradeColor(data.underwriting.insurabilityGrade) }]}>
                      Grade {data.underwriting.insurabilityGrade}
                    </Text>
                  </View>
                )}
                <View style={s.metaItem}>
                  <Text style={s.metaLabel}>Scan Date</Text>
                  <Text style={s.metaVal}>{dateStr}</Text>
                </View>
                <View style={s.metaItem}>
                  <Text style={s.metaLabel}>Total Findings</Text>
                  <Text style={s.metaVal}>{data.findings.length}</Text>
                </View>
                <View style={s.metaItem}>
                  <Text style={s.metaLabel}>Categories</Text>
                  <Text style={s.metaVal}>{data.categoryScores.length} / {data.categoryScores.length}</Text>
                </View>
              </View>
              {/* Severity counts */}
              {data.findings.length > 0 && (
                <View style={s.sevRow}>
                  {SEV_ORDER.slice(0, 4).map((sv) => sevCounts[sv] > 0 && (
                    <View key={sv} style={s.sevItem}>
                      <Text style={[s.sevNum, { color: sevColor(sv) }]}>{sevCounts[sv]}</Text>
                      <Text style={s.sevLabel}>{sv.charAt(0) + sv.slice(1).toLowerCase()}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* ── Category results ── */}
          <View style={s.sectionHeader}>
            <PdfShield color={C.textMuted} size={9} />
            <Text style={s.sectionTitle}>Category Results</Text>
          </View>
          <View style={s.catGrid}>
            {data.categoryScores.map((cat) => {
              const col = statusColor(cat.status);
              const Icon = cat.status === 'pass' ? PdfCheck : cat.status === 'warn' ? PdfWarn : PdfX;
              return (
                <View key={cat.category} style={s.catCard}>
                  <View style={[s.catTopBar, { backgroundColor: col }]} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                    <Icon color={col} size={10} />
                    <Text style={[s.catStatus, { color: col, marginTop: 0, marginLeft: 4 }]}>{cat.status.toUpperCase()}</Text>
                  </View>
                  <Text style={s.catLabel}>{CAT_LABEL[cat.category] ?? cat.category}</Text>
                  <Text style={[s.catScore, { color: col }]}>{cat.score}</Text>
                  <Text style={s.catOf}>/ 100</Text>
                </View>
              );
            })}
          </View>

          {/* ── AI Narrative ── */}
          {data.narrative && (() => {
            const nodes = parseNarrative(data.narrative);
            return (
              <>
                <View style={s.sectionHeader}>
                  <PdfShield color={C.cyan} size={9} />
                  <Text style={s.sectionTitle}>AI Risk Summary</Text>
                </View>
                <View style={[s.narrativeCard, { borderLeftColor: gCol }]}>
                  {nodes.map((node, i) => {
                    if (node.type === 'h1') return (
                      <Text key={i} style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: gCol, marginTop: 8, marginBottom: 4 }}>{node.text}</Text>
                    );
                    if (node.type === 'h2') return (
                      <Text key={i} style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: gCol, marginTop: 8, marginBottom: 3 }}>{node.text}</Text>
                    );
                    if (node.type === 'h3') return (
                      <Text key={i} style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.text, marginTop: 6, marginBottom: 2 }}>{node.text}</Text>
                    );
                    if (node.type === 'bullet') return (
                      <View key={i} style={{ flexDirection: 'row', marginBottom: 3, paddingLeft: 6 }}>
                        <Text style={{ fontSize: 9, color: gCol, marginRight: 5, marginTop: 1 }}>•</Text>
                        <Text style={{ fontSize: 9, color: C.textMid, lineHeight: 1.6, flex: 1 }}>{node.text}</Text>
                      </View>
                    );
                    return <Text key={i} style={{ fontSize: 9, color: C.textMid, lineHeight: 1.6, marginBottom: 4 }}>{node.text}</Text>;
                  })}
                </View>
              </>
            );
          })()}

          {/* ── All Findings ── */}
          {data.findings.length > 0 && (
            <>
              <View style={s.sectionHeader}>
                <PdfWarn color={C.textMuted} size={9} />
                <Text style={s.sectionTitle}>Security Findings — {data.findings.length} Total</Text>
              </View>
              {data.findings.map((f, i) => {
                const sc = sevColor(f.severity);
                const sb = sevBg(f.severity);
                return (
                  <View key={i} style={s.findCard} wrap={false}>
                    <View style={[s.findHeader, { backgroundColor: sb }]}>
                      <View style={[s.findBadge, { backgroundColor: sc }]}>
                        <Text style={s.findBadgeTx}>{f.severity}</Text>
                      </View>
                      <Text style={s.findTitle}>{f.title}</Text>
                      <Text style={s.findCat}>{CAT_LABEL[f.category] ?? f.category}</Text>
                    </View>
                    {(f.description || f.remediation) && (
                      <View style={s.findBody}>
                        {f.description && <Text style={s.findDesc}>{f.description}</Text>}
                        {f.remediation && (
                          <View style={s.remBox}>
                            <Text style={s.remLabel}>REMEDIATION</Text>
                            <Text style={s.remText}>{f.remediation}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </>
          )}

          {/* ── Insurance Readiness ── */}
          {data.underwriting && (
            <>
              <View style={s.sectionHeader}>
                <PdfShield color={C.textMuted} size={9} />
                <Text style={s.sectionTitle}>Insurance Readiness</Text>
              </View>
              <View style={s.card}>
                <View style={s.uwRow}>
                  <View style={[s.uwRing, { borderColor: uwCol, backgroundColor: uwBg }]}>
                    <Text style={[s.uwScore, { color: uwCol }]}>{data.underwriting.underwritingScore ?? '—'}</Text>
                  </View>
                  <View>
                    <Text style={[s.uwGrade, { color: uwCol }]}>
                      Grade {data.underwriting.insurabilityGrade ?? '—'} — INSURABILITY
                    </Text>
                    <View style={s.uwMeta}>
                      {data.underwriting.recommendedCoverageLevel && (
                        <View style={s.uwMetaItm}>
                          <Text style={s.metaLabel}>Recommended Coverage</Text>
                          <Text style={s.metaVal}>{data.underwriting.recommendedCoverageLevel}</Text>
                        </View>
                      )}
                      {data.underwriting.premiumIndicator && (
                        <View style={s.uwMetaItm}>
                          <Text style={s.metaLabel}>Premium Indicator</Text>
                          <Text style={[s.metaVal, { color: uwCol }]}>{data.underwriting.premiumIndicator}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {data.underwriting.summary && (
                  <View style={[s.uwSummary, { backgroundColor: uwBg, borderLeftWidth: 3, borderLeftColor: uwCol, borderLeftStyle: 'solid' }]}>
                    <Text style={s.narrativeText}>{data.underwriting.summary}</Text>
                  </View>
                )}
                <View style={s.uwFactsRow}>
                  {data.underwriting.keyRiskFactors && data.underwriting.keyRiskFactors.length > 0 && (
                    <View style={[s.uwFactsCol, { marginRight: 14 }]}>
                      <Text style={[s.uwFactHead, { color: C.red }]}>KEY RISK FACTORS</Text>
                      {data.underwriting.keyRiskFactors.map((f, i) => (
                        <View key={i} style={s.uwFactRow}>
                          <PdfX color={C.red} size={9} />
                          <Text style={[s.uwFactTxt, { marginLeft: 5 }]}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {data.underwriting.positiveFactors && data.underwriting.positiveFactors.length > 0 && (
                    <View style={s.uwFactsCol}>
                      <Text style={[s.uwFactHead, { color: C.green }]}>POSITIVE FACTORS</Text>
                      {data.underwriting.positiveFactors.map((f, i) => (
                        <View key={i} style={s.uwFactRow}>
                          <PdfCheck color={C.green} size={9} />
                          <Text style={[s.uwFactTxt, { marginLeft: 5 }]}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </>
          )}

          {/* ── Dark Web ── */}
          <View style={s.sectionHeader}>
            <PdfLock color={C.textMuted} size={9} />
            <Text style={s.sectionTitle}>Dark Web Exposure</Text>
          </View>
          {data.darkWebResults && data.darkWebResults.length > 0 ? (
            <>
              <View style={[s.alertBanner, { backgroundColor: C.redBg, borderColor: C.redBdr }]}>
                <PdfX color={C.red} size={10} />
                <Text style={[s.alertText, { color: '#dc2626' }]}>
                  {data.darkWebResults.length} BREACH{data.darkWebResults.length > 1 ? 'ES' : ''} DETECTED — Credentials may be exposed on dark web forums
                </Text>
              </View>
              {data.darkWebResults.map((b, i) => (
                <View key={i} style={[s.dwCard, { backgroundColor: C.redBg, borderColor: C.redBdr }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={s.dwSource}>{b.source}</Text>
                    <Text style={s.dwDate}>{b.breachDate}</Text>
                  </View>
                  <Text style={s.dwData}>Exposed data: {b.dataClasses.join(', ')}</Text>
                </View>
              ))}
            </>
          ) : (
            <View style={[s.alertBanner, { backgroundColor: C.greenBg, borderColor: C.greenBdr }]}>
              <PdfCheck color={C.green} size={10} />
              <Text style={[s.alertText, { color: '#065f46' }]}>
                No dark web breach exposures detected for {data.domain}
              </Text>
            </View>
          )}

          {/* ── Endpoint Discovery ── */}
          {data.endpoints && (
            <>
              <View style={s.sectionHeader}>
                <PdfGlobe color={C.textMuted} size={9} />
                <Text style={s.sectionTitle}>Endpoint & Page Discovery</Text>
              </View>
              <View style={s.card}>
                {/* Summary bar */}
                <View style={s.epSummary}>
                  {[
                    { label: 'PROBED',    val: data.endpoints.summary.total,     col: C.text },
                    { label: 'PUBLIC',    val: data.endpoints.summary.public,    col: C.yellow },
                    { label: 'PROTECTED', val: data.endpoints.summary.protected, col: C.green },
                    { label: 'EXPOSED',   val: data.endpoints.summary.exposed,   col: C.red },
                    { label: 'SITEMAP',   val: data.endpoints.sitemapPages.length, col: C.cyan },
                  ].map(({ label, val, col }) => (
                    <View key={label} style={s.epSumItem}>
                      <Text style={s.epSumLbl}>{label}</Text>
                      <Text style={[s.epSumVal, { color: col }]}>{val}</Text>
                    </View>
                  ))}
                </View>

                {/* Exposed alert */}
                {data.endpoints.summary.exposed > 0 && (
                  <View style={[s.alertBanner, { backgroundColor: C.redBg, borderColor: C.redBdr, marginBottom: 8 }]}>
                    <PdfX color={C.red} size={9} />
                    <Text style={[s.alertText, { color: '#dc2626' }]}>
                      {data.endpoints.summary.exposed} EXPOSED ENDPOINT{data.endpoints.summary.exposed > 1 ? 'S' : ''} — should be access-controlled
                    </Text>
                  </View>
                )}

                {/* Sitemap pages */}
                {data.endpoints.sitemapPages.length > 0 && (
                  <>
                    <Text style={[s.epSumLbl, { marginBottom: 5, letterSpacing: .5, fontFamily: 'Helvetica-Bold' }]}>
                      SITEMAP.XML PAGES ({data.endpoints.sitemapPages.length})
                    </Text>
                    <View style={s.sitemapRow}>
                      {data.endpoints.sitemapPages.slice(0, 24).map((p, i) => (
                        <Text key={i} style={s.sitemapPill}>{p}</Text>
                      ))}
                      {data.endpoints.sitemapPages.length > 24 && (
                        <Text style={[s.sitemapPill, { color: C.textMuted }]}>+{data.endpoints.sitemapPages.length - 24} more</Text>
                      )}
                    </View>
                  </>
                )}

                {/* Endpoint table - show exposed + notable first */}
                <Text style={[s.epSumLbl, { marginBottom: 5, letterSpacing: .5, fontFamily: 'Helvetica-Bold' }]}>
                  PROBED ENDPOINTS
                </Text>
                {data.endpoints.probed
                  .sort((a, b) => (b.isExposed ? 1 : 0) - (a.isExposed ? 1 : 0))
                  .slice(0, 35)
                  .map((ep, i) => {
                    const isExp = ep.isExposed;
                    const isPub = ep.status === 'public';
                    const isProt = ep.status === 'protected';
                    const bg = isExp ? C.redBg : isPub ? '#fffbeb' : isProt ? C.greenBg : '#f8fafc';
                    const badgeCol = isExp ? C.red : isPub ? C.yellow : isProt ? C.green : C.textMuted;
                    const badgeTx = isExp ? 'EXPOSED' : isPub ? 'PUBLIC' : isProt ? 'PROTECTED' : ep.status === 'not-found' ? '404' : 'ERROR';
                    return (
                      <View key={i} style={[s.epRow, { backgroundColor: bg }]}>
                        {isExp ? <PdfX color={C.red} size={8} /> : isProt ? <PdfLock color={C.green} size={8} /> : <PdfGlobe color={C.textMuted} size={8} />}
                        <Text style={s.epPath}>{ep.path}</Text>
                        <Text style={s.epType}>{ep.type}</Text>
                        <Text style={[s.epBadge, { color: badgeCol, backgroundColor: bg }]}>{badgeTx}</Text>
                        {ep.statusCode && <Text style={s.epCode}>{ep.statusCode}</Text>}
                      </View>
                    );
                  })}
                {data.endpoints.probed.length > 35 && (
                  <Text style={{ fontSize: 7, color: C.textMuted, marginTop: 4 }}>
                    … and {data.endpoints.probed.length - 35} more endpoints probed
                  </Text>
                )}
              </View>
            </>
          )}

          {/* ── Merkle Integrity Chain ── */}
          {data.merkle && (
            <>
              <View style={s.sectionHeader}>
                <PdfShield color={C.textMuted} size={9} />
                <Text style={s.sectionTitle}>Merkle Integrity Chain</Text>
              </View>
              <Text style={{ fontSize: 8, color: C.textMuted, marginBottom: 8 }}>
                Deterministic hash tree proving this report has not been tampered with. Each node hashes its parent + category data.
              </Text>
              <View style={s.card}>
                <View style={s.merkleRoot}>
                  <Text style={s.merkleRootLabel}>ROOT · INTEGRITY ANCHOR</Text>
                  <Text style={s.merkleRootDomain}>{data.domain}</Text>
                  <Text style={s.merkleRootHash}>{data.merkle.rootHash}</Text>
                </View>
                {/* Two-branch layout */}
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                  {/* Security branch */}
                  <View style={{ flex: 1, marginRight: data.merkle.endpoints && data.merkle.endpoints.length > 0 ? 8 : 0 }}>
                    <View style={{ backgroundColor: '#1e293b', borderRadius: 6, padding: '6 10', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={{ fontSize: 7, color: '#94a3b8', letterSpacing: 1, fontFamily: 'Helvetica-Bold' }}>SECURITY ANALYSIS</Text>
                      <Text style={{ fontSize: 9, color: '#f8fafc', fontFamily: 'Helvetica-Bold', marginTop: 2 }}>{data.merkle.categories.length} categories</Text>
                    </View>
                    {data.merkle.categories.map((c) => {
                      const col = statusColor(c.status);
                      return (
                        <View key={c.category} style={[s.merkleCatCard, { borderColor: col + '44', backgroundColor: col + '08', width: '100%', marginRight: 0 }]}>
                          <View style={s.merkleCatRow}>
                            <View style={[s.merkleDot, { backgroundColor: col }]} />
                            <Text style={s.merkleCatName}>{CAT_LABEL[c.category] ?? c.category}</Text>
                          </View>
                          <Text style={[s.merkleCatStatus, { color: col }]}>{c.status.toUpperCase()} · {c.score}/100</Text>
                          <Text style={s.merkleCatHash}>{c.hash}</Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Endpoint branch */}
                  {data.merkle.endpoints && data.merkle.endpoints.length > 0 && (
                    <View style={{ flex: 1 }}>
                      <View style={{ backgroundColor: '#1e293b', borderRadius: 6, padding: '6 10', alignItems: 'center', marginBottom: 6 }}>
                        <Text style={{ fontSize: 7, color: '#94a3b8', letterSpacing: 1, fontFamily: 'Helvetica-Bold' }}>ENDPOINT DISCOVERY</Text>
                        <Text style={{ fontSize: 9, color: '#f8fafc', fontFamily: 'Helvetica-Bold', marginTop: 2 }}>{data.merkle.endpoints.length} paths probed</Text>
                      </View>
                      {/* Group by type */}
                      {['page','api','auth','admin','sensitive'].map((type) => {
                        const nodes = (data.merkle!.endpoints ?? []).filter((e) => e.type === type && e.status !== 'not-found');
                        if (nodes.length === 0) return null;
                        const hasExp = nodes.some((n) => n.isExposed);
                        const typeCol = hasExp ? C.red : C.cyan;
                        return (
                          <View key={type} style={[s.merkleCatCard, { borderColor: typeCol + '44', backgroundColor: typeCol + '08', width: '100%', marginRight: 0 }]}>
                            <View style={[s.merkleCatRow, { marginBottom: 4 }]}>
                              <View style={[s.merkleDot, { backgroundColor: typeCol }]} />
                              <Text style={[s.merkleCatStatus, { color: typeCol, marginBottom: 0 }]}>{type.toUpperCase()}{hasExp ? ' ⚠ EXPOSED' : ''}</Text>
                            </View>
                            {nodes.slice(0, 4).map((ep, i) => {
                              const ec = ep.isExposed ? C.red : ep.status === 'public' ? C.yellow : ep.status === 'protected' ? C.green : C.textMuted;
                              return (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                                  <Text style={{ fontSize: 7, color: C.textMid, flex: 1 }}>{ep.path}</Text>
                                  <Text style={{ fontSize: 6, color: ec, fontFamily: 'Helvetica-Bold', marginLeft: 4 }}>{ep.isExposed ? 'EXPOSED' : ep.status === 'public' ? 'PUBLIC' : ep.status === 'protected' ? 'PROTECTED' : '404'}</Text>
                                  <Text style={{ fontSize: 6, color: C.textMuted, marginLeft: 4 }}>{ep.hash.slice(0, 5)}</Text>
                                </View>
                              );
                            })}
                            {nodes.length > 4 && <Text style={{ fontSize: 6, color: C.textMuted, marginTop: 2 }}>+{nodes.length - 4} more</Text>}
                          </View>
                        );
                      })}
                      {data.merkle.sitemapPages && data.merkle.sitemapPages.length > 0 && (
                        <View style={[s.merkleCatCard, { borderColor: C.cyan + '44', backgroundColor: C.cyan + '08', width: '100%', marginRight: 0 }]}>
                          <View style={s.merkleCatRow}>
                            <View style={[s.merkleDot, { backgroundColor: C.cyan }]} />
                            <Text style={[s.merkleCatStatus, { color: C.cyan, marginBottom: 0 }]}>SITEMAP</Text>
                          </View>
                          <Text style={{ fontSize: 7, color: C.textMid, marginTop: 3 }}>{data.merkle.sitemapPages.length} pages indexed</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                <View style={s.merkleFooter}>
                  <View style={s.merkleFootItm}>
                    <Text style={s.merkleFootLbl}>FINDINGS HASHED</Text>
                    <Text style={s.merkleFootVal}>{data.findings.length}</Text>
                  </View>
                  <View style={s.merkleFootItm}>
                    <Text style={s.merkleFootLbl}>CATEGORIES</Text>
                    <Text style={s.merkleFootVal}>{data.merkle.categories.length}</Text>
                  </View>
                  <View style={s.merkleFootItm}>
                    <Text style={s.merkleFootLbl}>ENDPOINTS</Text>
                    <Text style={s.merkleFootVal}>{data.merkle.endpoints?.length ?? 0}</Text>
                  </View>
                  <View style={s.merkleFootItm}>
                    <Text style={s.merkleFootLbl}>ROOT HASH</Text>
                    <Text style={[s.merkleFootVal, { color: C.cyan }]}>{data.merkle.rootHash}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Bottom spacer */}
          <View style={{ height: 48 }} />
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>CyberPulse Full Security Report · {data.domain} · {dateStr}</Text>
          <Text style={s.footerBrand}>cyberpulse.co.za</Text>
        </View>

      </Page>
    </Document>
  );
}

/* ─── Route handler ──────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const data: FullReportPayload = await req.json();
    if (!data.domain || !data.overallScore || !data.grade) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const buffer = await renderToBuffer(<FullReport data={data} />);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cyberpulse-full-report-${data.domain}.pdf"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('Full PDF error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
