export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer';
import React from 'react';

const SEVERITY_BG: Record<string, string> = {
  CRITICAL: '#ff3366',
  HIGH: '#ff6b35',
  MEDIUM: '#f5c518',
  LOW: '#00d4ff',
  INFO: '#8892a4',
};

function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#00ff88';
    case 'B': return '#00d4ff';
    case 'C': return '#f5c518';
    case 'D': return '#ff6b35';
    default: return '#ff3366';
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  DNS_EMAIL: 'Email Security',
  SSL_TLS: 'SSL Certificate',
  HTTP_HEADERS: 'Security Headers',
  DARK_WEB: 'Dark Web',
  OPEN_PORTS: 'Open Ports',
  CVE_EXPOSURE: 'Vulnerabilities',
};

const s = StyleSheet.create({
  page: {
    backgroundColor: '#0a0f1e',
    color: '#ffffff',
    fontFamily: 'Helvetica',
    padding: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    borderBottom: '1px solid #1a2540',
    paddingBottom: 16,
  },
  brand: { fontSize: 18, fontWeight: 'bold', color: '#00d4ff' },
  domain: { fontSize: 10, color: '#8892a4', marginTop: 2 },
  date: { fontSize: 9, color: '#8892a4', textAlign: 'right' },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
    backgroundColor: '#0f1729',
    borderRadius: 10,
    padding: 20,
    border: '1px solid #1a2540',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    border: '3px solid #ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNum: { fontSize: 26, fontWeight: 'bold' },
  scoreOf: { fontSize: 9, color: '#8892a4' },
  gradeBadge: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 5,
    color: '#0a0f1e',
  },
  gradeLabel: { fontSize: 10, color: '#8892a4', marginTop: 4 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#8892a4', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  card: {
    backgroundColor: '#0f1729',
    borderRadius: 8,
    padding: 14,
    border: '1px solid #1a2540',
    marginBottom: 12,
  },
  narrativeText: { fontSize: 10, color: '#c8d0dd', lineHeight: 1.6 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  catItem: {
    backgroundColor: '#0f1729',
    border: '1px solid #1a2540',
    borderRadius: 6,
    padding: '8 10',
    width: '48%',
  },
  catName: { fontSize: 10, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  catSummary: { fontSize: 9, color: '#8892a4' },
  findingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottom: '1px solid #1a2540',
  },
  severityBadge: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  findingTitle: { fontSize: 10, color: '#c8d0dd', flex: 1 },
  darkWebBox: {
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  darkWebText: { fontSize: 10, flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #1a2540',
    paddingTop: 8,
  },
  footerText: { fontSize: 8, color: '#8892a4' },
  lockNote: { fontSize: 9, color: '#8892a4', marginTop: 6, fontStyle: 'italic' },
});

/** Strip markdown symbols for PDF plain-text rendering */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,3} /gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^[-*] /gm, '• ')
    .trim();
}

interface FindingItem { title: string; severity: string; }
interface CategoryItem { category: string; status: string; summary: string; }

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

function MiniReport({ data }: { data: ReportPayload }) {
  const gCol = gradeColor(data.grade);
  const uwCol = gradeColor(data.underwritingGrade);
  const narrativePlain = data.narrative ? stripMarkdown(data.narrative) : '';
  const dateStr = new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brand}>CyberPulse</Text>
            <Text style={s.domain}>{data.domain}</Text>
          </View>
          <View>
            <Text style={s.date}>Security Mini Report</Text>
            <Text style={s.date}>{dateStr}</Text>
          </View>
        </View>

        {/* Score row */}
        <View style={s.scoreRow}>
          <View style={[s.scoreCircle, { borderColor: gCol }]}>
            <Text style={[s.scoreNum, { color: gCol }]}>{data.overallScore}</Text>
            <Text style={s.scoreOf}>/ 100</Text>
          </View>
          <View>
            <Text style={[s.gradeBadge, { backgroundColor: gCol }]}>Grade {data.grade}</Text>
            <Text style={s.gradeLabel}>Security Score</Text>
            <Text style={[s.gradeLabel, { marginTop: 6 }]}>
              Insurance Readiness:{' '}
              <Text style={{ color: uwCol, fontWeight: 'bold' }}>Grade {data.underwritingGrade}</Text>
            </Text>
          </View>
        </View>

        {/* Narrative */}
        {narrativePlain ? (
          <View style={[s.card, { marginBottom: 16 }]}>
            <Text style={s.sectionTitle}>AI Risk Summary</Text>
            <Text style={s.narrativeText}>{narrativePlain}</Text>
          </View>
        ) : null}

        {/* Category grid */}
        <Text style={s.sectionTitle}>Category Results</Text>
        <View style={s.catGrid}>
          {data.categoryResults.map((c) => (
            <View key={c.category} style={s.catItem}>
              <Text style={[s.catName, { color: c.status === 'pass' ? '#00ff88' : c.status === 'warn' ? '#f5c518' : '#ff3366' }]}>
                {c.status === 'pass' ? '✓ ' : c.status === 'warn' ? '⚠ ' : '✗ '}
                {CATEGORY_LABELS[c.category] ?? c.category}
              </Text>
              <Text style={s.catSummary}>{c.summary}</Text>
            </View>
          ))}
        </View>

        {/* Top findings */}
        <View style={[s.card, { marginTop: 4 }]}>
          <Text style={s.sectionTitle}>Top Security Findings</Text>
          {data.top3Findings.map((f, i) => (
            <View key={i} style={[s.findingRow, i === data.top3Findings.length - 1 ? { borderBottom: 'none' } : {}]}>
              <Text style={[s.severityBadge, { backgroundColor: SEVERITY_BG[f.severity] ?? '#8892a4' }]}>
                {f.severity}
              </Text>
              <Text style={s.findingTitle}>{f.title}</Text>
            </View>
          ))}
          <Text style={s.lockNote}>Full remediation steps available in your dashboard account.</Text>
        </View>

        {/* Dark web */}
        <View style={[
          s.darkWebBox,
          { backgroundColor: data.darkWebBreachCount > 0 ? '#2d0f1a' : '#0d2e1a',
            border: `1px solid ${data.darkWebBreachCount > 0 ? '#ff336633' : '#00ff8833'}` }
        ]}>
          <Text style={[s.darkWebText, { color: data.darkWebBreachCount > 0 ? '#ff3366' : '#00ff88' }]}>
            {data.darkWebBreachCount > 0
              ? `⚠  Dark Web: ${data.darkWebBreachCount} breach${data.darkWebBreachCount > 1 ? 'es' : ''} detected linked to your domain`
              : '✓  Dark Web: No breaches found — your domain looks clean'}
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>CyberPulse — Cyber Posture Intelligence</Text>
          <Text style={s.footerText}>Free Scan Report • cyberpulse.co.za</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function POST(req: NextRequest) {
  try {
    const data: ReportPayload = await req.json();

    const buffer = await renderToBuffer(<MiniReport data={data} />);

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
