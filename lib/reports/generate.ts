import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs/promises';
import type { Scan, Organisation, ScanFinding } from '@prisma/client';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0a0f1e',
    color: '#ffffff',
    fontFamily: 'Helvetica',
    padding: 40,
  },
  coverPage: {
    backgroundColor: '#0a0f1e',
    padding: 40,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 32,
    color: '#00d4ff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#8892a4',
    marginBottom: 48,
  },
  orgName: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  domain: {
    fontSize: 16,
    color: '#8892a4',
    marginBottom: 32,
  },
  scoreContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#0f1729',
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#8892a4',
  },
  gradeBadge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 24,
  },
  gradeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00d4ff',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2540',
    paddingBottom: 8,
  },
  paragraph: {
    fontSize: 11,
    color: '#c8d0dd',
    lineHeight: 1.6,
    marginBottom: 12,
  },
  findingCard: {
    backgroundColor: '#0f1729',
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  findingTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  findingDescription: {
    fontSize: 10,
    color: '#8892a4',
    marginBottom: 8,
  },
  findingRemediation: {
    fontSize: 10,
    color: '#c8d0dd',
    backgroundColor: '#141d30',
    padding: 8,
    borderRadius: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  severityText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  stat: {
    fontSize: 11,
    color: '#8892a4',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  attestationBlock: {
    backgroundColor: '#0f1729',
    borderRadius: 4,
    padding: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#1a2540',
  },
  attestationText: {
    fontSize: 10,
    color: '#8892a4',
    marginBottom: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 9,
    color: '#3d4f6b',
  },
});

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL': return '#ff3366';
    case 'HIGH': return '#ff6b35';
    case 'MEDIUM': return '#f5c518';
    case 'LOW': return '#00d4ff';
    default: return '#8892a4';
  }
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#00ff88';
    case 'B': return '#00d4ff';
    case 'C': return '#f5c518';
    case 'D': return '#ff6b35';
    case 'F': return '#ff3366';
    default: return '#8892a4';
  }
}

type ScanWithFindings = Scan & { findings: ScanFinding[] };

function ReportDocument({
  scan,
  org,
}: {
  scan: ScanWithFindings;
  org: Organisation;
}) {
  const criticalFindings = scan.findings.filter((f) => f.severity === 'CRITICAL').slice(0, 3);
  const rawResults = scan.rawResults as Record<string, unknown> | null;
  const underwritingData = rawResults?.underwriting as {
    underwritingScore?: number;
    insurabilityGrade?: string;
    recommendedCoverageLevel?: string;
    premiumIndicator?: string;
    keyRiskFactors?: string[];
    positiveFactors?: string[];
    summary?: string;
  } | undefined;

  return React.createElement(
    Document,
    { title: `CyberPulse Report — ${org.name}` },
    // Cover Page
    React.createElement(
      Page,
      { size: 'A4', style: styles.coverPage },
      React.createElement(Text, { style: styles.brandTitle }, 'CyberPulse'),
      React.createElement(Text, { style: styles.brandSubtitle }, 'Cyber Posture Intelligence Platform'),
      React.createElement(Text, { style: styles.orgName }, org.name),
      React.createElement(Text, { style: styles.domain }, org.domain),
      React.createElement(
        View,
        { style: styles.scoreContainer },
        React.createElement(Text, { style: styles.scoreNumber }, String(scan.overallScore ?? 0)),
        React.createElement(Text, { style: styles.scoreLabel }, '/ 100')
      ),
      React.createElement(
        View,
        { style: { ...styles.gradeBadge, backgroundColor: getGradeColor(scan.grade ?? 'F') } },
        React.createElement(Text, { style: styles.gradeText }, `Grade ${scan.grade ?? 'F'}`)
      ),
      React.createElement(
        Text,
        { style: { fontSize: 11, color: '#8892a4' } },
        `Scan completed: ${scan.completedAt ? new Date(scan.completedAt).toLocaleDateString('en-ZA') : 'N/A'}`
      )
    ),
    // Executive Summary
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.sectionTitle }, 'Executive Summary'),
      React.createElement(Text, { style: styles.paragraph }, scan.aiNarrative ?? 'No AI narrative available.'),
      React.createElement(Text, { style: { ...styles.sectionTitle, fontSize: 14, marginTop: 24 } }, 'Top Critical Findings'),
      ...criticalFindings.map((f) =>
        React.createElement(
          View,
          { key: f.id, style: { ...styles.findingCard, borderLeftColor: '#ff3366' } },
          React.createElement(
            View,
            { style: { ...styles.severityBadge, backgroundColor: '#ff3366' } },
            React.createElement(Text, { style: styles.severityText }, 'CRITICAL')
          ),
          React.createElement(Text, { style: styles.findingTitle }, f.title),
          React.createElement(Text, { style: styles.findingDescription }, f.description)
        )
      )
    ),
    // Underwriting Analysis
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.sectionTitle }, 'Insurance Readiness Analysis'),
      React.createElement(Text, { style: styles.stat }, 'Underwriting Score'),
      React.createElement(Text, { style: styles.statValue }, `${underwritingData?.underwritingScore ?? scan.aiUnderwritingScore ?? 0} / 100`),
      React.createElement(Text, { style: styles.stat }, 'Insurability Grade'),
      React.createElement(Text, { style: styles.statValue }, underwritingData?.insurabilityGrade ?? scan.grade ?? 'N/A'),
      React.createElement(Text, { style: styles.stat }, 'Recommended Coverage'),
      React.createElement(Text, { style: styles.statValue }, underwritingData?.recommendedCoverageLevel ?? 'Standard'),
      React.createElement(Text, { style: styles.stat }, 'Premium Indicator'),
      React.createElement(Text, { style: styles.statValue }, underwritingData?.premiumIndicator ?? 'Medium'),
      React.createElement(Text, { style: styles.paragraph }, underwritingData?.summary ?? 'No underwriting summary available.')
    ),
    // Detailed Findings
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.sectionTitle }, 'Detailed Findings'),
      ...scan.findings.map((f) =>
        React.createElement(
          View,
          { key: f.id, style: { ...styles.findingCard, borderLeftColor: getSeverityColor(f.severity) } },
          React.createElement(
            View,
            { style: { ...styles.severityBadge, backgroundColor: getSeverityColor(f.severity) } },
            React.createElement(Text, { style: styles.severityText }, f.severity)
          ),
          React.createElement(Text, { style: styles.findingTitle }, f.title),
          React.createElement(Text, { style: styles.findingDescription }, f.description),
          f.remediation
            ? React.createElement(Text, { style: styles.findingRemediation }, `Fix: ${f.remediation}`)
            : null
        )
      )
    ),
    // Attestation
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.sectionTitle }, 'Security Attestation'),
      React.createElement(
        View,
        { style: styles.attestationBlock },
        React.createElement(Text, { style: { ...styles.attestationText, color: '#ffffff', fontSize: 14, marginBottom: 12 } }, 'Integrity Attestation'),
        React.createElement(Text, { style: styles.attestationText }, `Organisation: ${org.name}`),
        React.createElement(Text, { style: styles.attestationText }, `Domain: ${org.domain}`),
        React.createElement(Text, { style: styles.attestationText }, `Scan ID: ${scan.id}`),
        React.createElement(Text, { style: styles.attestationText }, `Scan Date: ${scan.completedAt ? new Date(scan.completedAt).toISOString() : 'N/A'}`),
        React.createElement(Text, { style: styles.attestationText }, `Valid Until: ${scan.completedAt ? new Date(new Date(scan.completedAt).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA') : 'N/A'}`),
        React.createElement(Text, { style: { ...styles.attestationText, marginTop: 12 } }, `Merkle Integrity Root:`),
        React.createElement(Text, { style: { ...styles.attestationText, fontFamily: 'Helvetica', fontSize: 8, color: '#00d4ff' } }, scan.integrityRoot ?? 'N/A'),
        React.createElement(Text, { style: { ...styles.attestationText, marginTop: 16, fontSize: 9 } }, 'This report is valid for 90 days from scan completion date. The integrity root hash proves this report has not been altered.'),
        React.createElement(Text, { style: { ...styles.attestationText, marginTop: 12, color: '#00d4ff' } }, 'Powered by CyberPulse — Secured by SCCA Protocol')
      )
    )
  );
}

export async function generateReport(
  scan: ScanWithFindings,
  org: Organisation
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(
    React.createElement(ReportDocument, { scan, org }) as any
  );

  const reportDir = path.join(process.cwd(), 'public', 'reports', org.id);
  await fs.mkdir(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `${scan.id}.pdf`);
  await fs.writeFile(reportPath, pdfBuffer);

  return Buffer.from(pdfBuffer);
}
