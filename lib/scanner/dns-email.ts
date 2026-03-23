import dns from 'dns/promises';
import type { FindingResult } from '../../types';

export async function checkDnsEmail(domain: string): Promise<{
  score: number;
  findings: FindingResult[];
}> {
  const findings: FindingResult[] = [];
  let score = 100;

  // SPF check
  try {
    const txtRecords = await dns.resolveTxt(domain);
    const spfRecord = txtRecords.flat().find((r) => r.startsWith('v=spf1'));
    if (!spfRecord) {
      findings.push({
        category: 'DNS_EMAIL',
        title: 'No SPF record detected',
        description: `The domain ${domain} has no SPF (Sender Policy Framework) record. This allows attackers to send emails impersonating your domain.`,
        severity: 'HIGH',
        remediation: 'Add a TXT record to your DNS: "v=spf1 include:_spf.google.com ~all" (adjust for your email provider).',
      });
      score -= 20;
    } else if (spfRecord.includes('+all')) {
      findings.push({
        category: 'DNS_EMAIL',
        title: 'SPF record too permissive (+all)',
        description: 'Your SPF record uses "+all" which allows any server to send email as your domain.',
        severity: 'CRITICAL',
        remediation: 'Change "+all" to "~all" (soft fail) or "-all" (hard fail) in your SPF record.',
      });
      score -= 25;
    }
  } catch {
    findings.push({
      category: 'DNS_EMAIL',
      title: 'SPF record lookup failed',
      description: `Could not retrieve TXT records for ${domain}.`,
      severity: 'MEDIUM',
      remediation: 'Ensure your domain has valid DNS TXT records configured.',
    });
    score -= 10;
  }

  // DMARC check
  try {
    const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`);
    const dmarcRecord = dmarcRecords.flat().find((r) => r.startsWith('v=DMARC1'));
    if (!dmarcRecord) {
      findings.push({
        category: 'DNS_EMAIL',
        title: 'No DMARC policy detected',
        description: 'DMARC is not configured. Attackers can impersonate your domain in phishing emails.',
        severity: 'HIGH',
        remediation: 'Add: "_dmarc TXT v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"',
      });
      score -= 20;
    } else if (dmarcRecord.includes('p=none')) {
      findings.push({
        category: 'DNS_EMAIL',
        title: 'DMARC policy set to none (monitor only)',
        description: 'Your DMARC policy is "p=none" which only monitors but does not block spoofed emails.',
        severity: 'MEDIUM',
        remediation: 'Upgrade DMARC policy to "p=quarantine" or ideally "p=reject" once you have verified your email flows.',
      });
      score -= 10;
    }
  } catch {
    findings.push({
      category: 'DNS_EMAIL',
      title: 'DMARC record not found',
      description: `No DMARC record exists at _dmarc.${domain}.`,
      severity: 'HIGH',
      remediation: 'Add a DMARC TXT record to your DNS at _dmarc.' + domain,
    });
    score -= 15;
  }

  // DKIM check (common selectors)
  const dkimSelectors = ['default', 'google', 'mail', 'selector1', 'selector2', 'k1'];
  let dkimFound = false;
  for (const selector of dkimSelectors) {
    try {
      await dns.resolveTxt(`${selector}._domainkey.${domain}`);
      dkimFound = true;
      break;
    } catch {
      // try next
    }
  }
  if (!dkimFound) {
    findings.push({
      category: 'DNS_EMAIL',
      title: 'DKIM record not detected',
      description: 'No DKIM (DomainKeys Identified Mail) record was found on common selectors. DKIM allows email recipients to verify messages were sent from your server.',
      severity: 'MEDIUM',
      remediation: 'Enable DKIM signing in your email provider and publish the public key as a TXT record.',
    });
    score -= 10;
  }

  // MX check
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      findings.push({
        category: 'DNS_EMAIL',
        title: 'No MX records found',
        description: 'Your domain has no MX records. This may indicate email is not configured.',
        severity: 'LOW',
        remediation: 'Configure MX records if you intend to receive email on this domain.',
      });
      score -= 5;
    }
  } catch {
    // MX may not exist for non-email domains
  }

  // CAA check
  try {
    await dns.resolveCaa(domain);
  } catch {
    findings.push({
      category: 'DNS_EMAIL',
      title: 'No CAA records configured',
      description: 'CAA (Certification Authority Authorisation) records are not set. Any CA can issue SSL certificates for your domain.',
      severity: 'LOW',
      remediation: 'Add CAA records to restrict which certificate authorities can issue certificates for your domain. Example: "0 issue letsencrypt.org"',
    });
    score -= 5;
  }

  return { score: Math.max(0, score), findings };
}
