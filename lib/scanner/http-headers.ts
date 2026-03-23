import axios from 'axios';
import type { FindingResult } from '../../types';

interface HeaderCheck {
  header: string;
  title: string;
  description: string;
  remediation: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  scoreImpact: number;
}

const REQUIRED_HEADERS: HeaderCheck[] = [
  {
    header: 'content-security-policy',
    title: 'Missing Content-Security-Policy header',
    description: 'CSP prevents cross-site scripting (XSS) attacks by controlling which resources the browser can load.',
    remediation: 'Add a Content-Security-Policy header. Start with: Content-Security-Policy: default-src \'self\'',
    severity: 'HIGH',
    scoreImpact: 20,
  },
  {
    header: 'x-frame-options',
    title: 'Missing X-Frame-Options header',
    description: 'Without X-Frame-Options, your site can be embedded in iframes and used for clickjacking attacks.',
    remediation: 'Add: X-Frame-Options: DENY or X-Frame-Options: SAMEORIGIN',
    severity: 'MEDIUM',
    scoreImpact: 15,
  },
  {
    header: 'x-content-type-options',
    title: 'Missing X-Content-Type-Options header',
    description: 'Without this header, browsers may try to sniff MIME types which can lead to XSS attacks.',
    remediation: 'Add: X-Content-Type-Options: nosniff',
    severity: 'MEDIUM',
    scoreImpact: 10,
  },
  {
    header: 'referrer-policy',
    title: 'Missing Referrer-Policy header',
    description: 'Without a Referrer-Policy, sensitive URL data may leak to third-party sites.',
    remediation: 'Add: Referrer-Policy: strict-origin-when-cross-origin',
    severity: 'LOW',
    scoreImpact: 10,
  },
  {
    header: 'permissions-policy',
    title: 'Missing Permissions-Policy header',
    description: 'Permissions-Policy controls access to browser features like camera, microphone, and geolocation.',
    remediation: 'Add: Permissions-Policy: camera=(), microphone=(), geolocation=()',
    severity: 'LOW',
    scoreImpact: 5,
  },
];

export async function checkHttpHeaders(domain: string): Promise<{
  score: number;
  findings: FindingResult[];
}> {
  const findings: FindingResult[] = [];
  let score = 100;

  try {
    const response = await axios.head(`https://${domain}`, {
      timeout: 10000,
      validateStatus: () => true,
      maxRedirects: 5,
    });

    const headers = response.headers;

    for (const check of REQUIRED_HEADERS) {
      if (!headers[check.header]) {
        findings.push({
          category: 'HTTP_HEADERS',
          title: check.title,
          description: check.description,
          severity: check.severity,
          remediation: check.remediation,
        });
        score -= check.scoreImpact;
      }
    }

    // Check for server header information leakage
    if (headers['server'] && headers['server'].length > 5) {
      findings.push({
        category: 'HTTP_HEADERS',
        title: 'Server header exposes version information',
        description: `Server header reveals: "${headers['server']}". This helps attackers identify vulnerable software versions.`,
        severity: 'LOW',
        remediation: 'Configure your web server to suppress or obscure the Server header.',
      });
      score -= 5;
    }
  } catch {
    findings.push({
      category: 'HTTP_HEADERS',
      title: 'Could not retrieve HTTP headers',
      description: `Failed to connect to https://${domain} to check security headers.`,
      severity: 'MEDIUM',
      remediation: 'Ensure your website is accessible over HTTPS and returning valid responses.',
    });
    score -= 20;
  }

  return { score: Math.max(0, score), findings };
}
