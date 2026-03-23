import https from 'https';
import tls from 'tls';
import type { FindingResult } from '../../types';

function checkCertificate(domain: string): Promise<{
  valid: boolean;
  daysUntilExpiry: number;
  tlsVersion: string;
  issuer: string;
  subject: string;
}> {
  return new Promise((resolve, reject) => {
    const options = {
      host: domain,
      port: 443,
      rejectUnauthorized: false,
      timeout: 10000,
    };

    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate();
      const protocol = socket.getProtocol() ?? 'unknown';

      if (!cert || !cert.valid_to) {
        socket.destroy();
        reject(new Error('No certificate found'));
        return;
      }

      const expiryDate = new Date(cert.valid_to);
      const now = new Date();
      const daysUntilExpiry = Math.floor(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      socket.destroy();
      resolve({
        valid: socket.authorized || true,
        daysUntilExpiry,
        tlsVersion: protocol,
        issuer: (Array.isArray(cert.issuer?.O) ? cert.issuer.O[0] : cert.issuer?.O) ?? 'Unknown',
        subject: (Array.isArray(cert.subject?.CN) ? cert.subject.CN[0] : cert.subject?.CN) ?? domain,
      });
    });

    socket.on('error', reject);
    socket.setTimeout(10000, () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
  });
}

async function checkHSTS(domain: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = https.request(
      { host: domain, path: '/', method: 'HEAD', timeout: 10000, rejectUnauthorized: false },
      (res) => {
        resolve(!!res.headers['strict-transport-security']);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

export async function checkSslTls(domain: string): Promise<{
  score: number;
  findings: FindingResult[];
}> {
  const findings: FindingResult[] = [];
  let score = 100;

  try {
    const cert = await checkCertificate(domain);

    if (cert.daysUntilExpiry < 0) {
      findings.push({
        category: 'SSL_TLS',
        title: 'SSL certificate has expired',
        description: `The SSL certificate for ${domain} expired ${Math.abs(cert.daysUntilExpiry)} days ago. Visitors will see security warnings.`,
        severity: 'CRITICAL',
        remediation: 'Renew your SSL certificate immediately. If using Let\'s Encrypt, run: certbot renew',
      });
      score -= 40;
    } else if (cert.daysUntilExpiry <= 7) {
      findings.push({
        category: 'SSL_TLS',
        title: 'SSL certificate expiring within 7 days',
        description: `Your SSL certificate expires in ${cert.daysUntilExpiry} days. Urgent renewal required.`,
        severity: 'CRITICAL',
        remediation: 'Renew your SSL certificate immediately to avoid service disruption.',
      });
      score -= 30;
    } else if (cert.daysUntilExpiry <= 30) {
      findings.push({
        category: 'SSL_TLS',
        title: 'SSL certificate expiring within 30 days',
        description: `Your SSL certificate expires in ${cert.daysUntilExpiry} days.`,
        severity: 'MEDIUM',
        remediation: 'Schedule SSL certificate renewal within the next 2 weeks.',
      });
      score -= 10;
    }

    const tlsLower = cert.tlsVersion.toLowerCase();
    if (tlsLower.includes('tlsv1 ') || tlsLower === 'tlsv1') {
      findings.push({
        category: 'SSL_TLS',
        title: 'TLS 1.0 is enabled',
        description: 'TLS 1.0 is a deprecated protocol with known vulnerabilities (POODLE, BEAST). It should be disabled immediately.',
        severity: 'CRITICAL',
        remediation: 'Disable TLS 1.0 and 1.1 in your web server configuration. Only allow TLS 1.2 and TLS 1.3.',
      });
      score -= 30;
    } else if (tlsLower.includes('tlsv1.1')) {
      findings.push({
        category: 'SSL_TLS',
        title: 'TLS 1.1 is enabled',
        description: 'TLS 1.1 is deprecated and should be disabled.',
        severity: 'HIGH',
        remediation: 'Disable TLS 1.1 in your web server. Configure minimum TLS version to 1.2.',
      });
      score -= 20;
    }
  } catch {
    findings.push({
      category: 'SSL_TLS',
      title: 'Could not establish HTTPS connection',
      description: `Failed to connect to ${domain} over HTTPS. The site may not have SSL configured.`,
      severity: 'CRITICAL',
      remediation: 'Install a valid SSL certificate. Free certificates are available via Let\'s Encrypt (certbot).',
    });
    score -= 40;
  }

  const hasHSTS = await checkHSTS(domain);
  if (!hasHSTS) {
    findings.push({
      category: 'SSL_TLS',
      title: 'HSTS header missing',
      description: 'HTTP Strict Transport Security (HSTS) is not configured. Browsers may allow HTTP connections.',
      severity: 'MEDIUM',
      remediation: 'Add the following header to your web server: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
    });
    score -= 15;
  }

  return { score: Math.max(0, score), findings };
}
