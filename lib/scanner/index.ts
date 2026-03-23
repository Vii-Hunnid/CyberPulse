import { checkDnsEmail } from './dns-email';
import { checkSslTls } from './ssl-tls';
import { checkHttpHeaders } from './http-headers';
import { checkOpenPorts } from './open-ports';
import { checkCveExposure } from './cve-exposure';
import { checkBackupHygiene, type BackupHygieneData } from './backup-hygiene';
import { checkDomainBreaches } from '../ai/darkweb';
import type { ScanResult, FindingResult, CategoryScore } from '../../types';

const WEIGHTS = {
  DNS_EMAIL: 0.20,
  SSL_TLS: 0.20,
  HTTP_HEADERS: 0.15,
  OPEN_PORTS: 0.25,
  CVE_EXPOSURE: 0.15,
  BACKUP_HYGIENE: 0.05,
};

function calculateGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

type ProgressCallback = (event: string, data: unknown) => void;

export async function runFullScan(
  domain: string,
  organisationId: string,
  backupData?: BackupHygieneData,
  onProgress?: ProgressCallback
): Promise<ScanResult> {
  onProgress?.('scan:started', { domain, organisationId });

  const defaultBackupData: BackupHygieneData = backupData ?? {
    lastBackupDate: null,
    isOffsite: false,
    restorationTested: false,
    hasAutomatedBackups: false,
  };

  const [dnsResult, sslResult, headersResult, portsResult, cveResult, backupResult, darkWebResult] =
    await Promise.allSettled([
      checkDnsEmail(domain).then((r) => {
        onProgress?.('scan:progress', { category: 'DNS_EMAIL', status: 'complete' });
        return r;
      }),
      checkSslTls(domain).then((r) => {
        onProgress?.('scan:progress', { category: 'SSL_TLS', status: 'complete' });
        return r;
      }),
      checkHttpHeaders(domain).then((r) => {
        onProgress?.('scan:progress', { category: 'HTTP_HEADERS', status: 'complete' });
        return r;
      }),
      checkOpenPorts(domain).then((r) => {
        onProgress?.('scan:progress', { category: 'OPEN_PORTS', status: 'complete' });
        return r;
      }),
      checkCveExposure(domain).then((r) => {
        onProgress?.('scan:progress', { category: 'CVE_EXPOSURE', status: 'complete' });
        return r;
      }),
      checkBackupHygiene(defaultBackupData).then((r) => {
        onProgress?.('scan:progress', { category: 'BACKUP_HYGIENE', status: 'complete' });
        return r;
      }),
      checkDomainBreaches(domain).then((r) => {
        onProgress?.('scan:progress', { category: 'DARK_WEB', status: 'complete' });
        return r;
      }),
    ]);

  const getResult = <T>(result: PromiseSettledResult<T>, fallback: T): T =>
    result.status === 'fulfilled' ? result.value : fallback;

  const dns = getResult(dnsResult, { score: 0, findings: [] as FindingResult[] });
  const ssl = getResult(sslResult, { score: 0, findings: [] as FindingResult[] });
  const headers = getResult(headersResult, { score: 0, findings: [] as FindingResult[] });
  const ports = getResult(portsResult, { score: 0, findings: [] as FindingResult[] });
  const cve = getResult(cveResult, { score: 0, findings: [] as FindingResult[] });
  const backup = getResult(backupResult, { score: 0, findings: [] as FindingResult[] });
  const darkWeb = getResult(darkWebResult, []);

  const categoryScores: CategoryScore[] = [
    { category: 'DNS_EMAIL', score: dns.score, weight: WEIGHTS.DNS_EMAIL, status: dns.score >= 80 ? 'pass' : dns.score >= 50 ? 'warn' : 'fail' },
    { category: 'SSL_TLS', score: ssl.score, weight: WEIGHTS.SSL_TLS, status: ssl.score >= 80 ? 'pass' : ssl.score >= 50 ? 'warn' : 'fail' },
    { category: 'HTTP_HEADERS', score: headers.score, weight: WEIGHTS.HTTP_HEADERS, status: headers.score >= 80 ? 'pass' : headers.score >= 50 ? 'warn' : 'fail' },
    { category: 'OPEN_PORTS', score: ports.score, weight: WEIGHTS.OPEN_PORTS, status: ports.score >= 80 ? 'pass' : ports.score >= 50 ? 'warn' : 'fail' },
    { category: 'CVE_EXPOSURE', score: cve.score, weight: WEIGHTS.CVE_EXPOSURE, status: cve.score >= 80 ? 'pass' : cve.score >= 50 ? 'warn' : 'fail' },
    { category: 'BACKUP_HYGIENE', score: backup.score, weight: WEIGHTS.BACKUP_HYGIENE, status: backup.score >= 80 ? 'pass' : backup.score >= 50 ? 'warn' : 'fail' },
  ];

  const overallScore = Math.round(
    categoryScores.reduce((sum, cat) => sum + cat.score * cat.weight, 0)
  );

  const allFindings: FindingResult[] = [
    ...dns.findings,
    ...ssl.findings,
    ...headers.findings,
    ...ports.findings,
    ...cve.findings,
    ...backup.findings,
  ];

  // Add dark web findings
  for (const breach of darkWeb) {
    const hasCriticalData = breach.dataClasses.some((dc) =>
      ['Passwords', 'Financial data', 'Credit cards', 'Bank account numbers'].includes(dc)
    );
    allFindings.push({
      category: 'DARK_WEB',
      title: `Data breach detected: ${breach.source}`,
      description: `A breach was detected from ${breach.source} on ${breach.breachDate}. Exposed data: ${breach.dataClasses.join(', ')}.`,
      severity: hasCriticalData ? 'CRITICAL' : 'HIGH',
      remediation: 'Force password resets for all accounts associated with this domain. Enable MFA. Monitor for suspicious login activity.',
    });
  }

  const result: ScanResult = {
    domain,
    organisationId,
    overallScore,
    grade: calculateGrade(overallScore),
    categoryScores,
    findings: allFindings,
    darkWebResults: darkWeb,
    completedAt: new Date(),
  };

  onProgress?.('scan:complete', { overallScore, grade: result.grade });

  return result;
}

export async function runFreeScan(domain: string): Promise<{
  overallScore: number;
  grade: string;
  categoryScores: CategoryScore[];
  findings: FindingResult[];
  darkWebBreachCount: number;
}> {
  const [dnsResult, sslResult, headersResult, darkWebResult] = await Promise.allSettled([
    checkDnsEmail(domain),
    checkSslTls(domain),
    checkHttpHeaders(domain),
    checkDomainBreaches(domain),
  ]);

  const getResult = <T>(result: PromiseSettledResult<T>, fallback: T): T =>
    result.status === 'fulfilled' ? result.value : fallback;

  const dns = getResult(dnsResult, { score: 0, findings: [] as FindingResult[] });
  const ssl = getResult(sslResult, { score: 0, findings: [] as FindingResult[] });
  const headers = getResult(headersResult, { score: 0, findings: [] as FindingResult[] });
  const darkWeb = getResult(darkWebResult, []);

  const categoryScores: CategoryScore[] = [
    { category: 'DNS_EMAIL', score: dns.score, weight: 0.33, status: dns.score >= 80 ? 'pass' : dns.score >= 50 ? 'warn' : 'fail' },
    { category: 'SSL_TLS', score: ssl.score, weight: 0.33, status: ssl.score >= 80 ? 'pass' : ssl.score >= 50 ? 'warn' : 'fail' },
    { category: 'HTTP_HEADERS', score: headers.score, weight: 0.34, status: headers.score >= 80 ? 'pass' : headers.score >= 50 ? 'warn' : 'fail' },
  ];

  const overallScore = Math.round(
    categoryScores.reduce((sum, cat) => sum + cat.score * cat.weight, 0)
  );

  return {
    overallScore,
    grade: calculateGrade(overallScore),
    categoryScores,
    findings: [...dns.findings, ...ssl.findings, ...headers.findings],
    darkWebBreachCount: darkWeb.length,
  };
}
