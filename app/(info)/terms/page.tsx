import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — CyberPulse',
  description: 'Terms and conditions governing the use of the CyberPulse platform.',
};

const bgCard = '#ffffff';
const text   = '#0f172a';
const textMid  = '#334155';
const textMuted = '#64748b';
const textFaint = '#94a3b8';
const border   = '#dde3ec';

const SECTIONS = [
  {
    heading: '1. Acceptance of Terms',
    body: `By accessing or using the CyberPulse platform ("Service"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree, do not use the Service. These Terms apply to all visitors, registered users, and paying customers.`,
  },
  {
    heading: '2. Description of Service',
    body: `CyberPulse provides cyber security scanning, dark web monitoring, and insurance readiness assessment services to businesses. The Service includes free scans, authenticated full reports, dark web monitoring alerts, and downloadable PDF attestations. We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.`,
  },
  {
    heading: '3. Authorised Use',
    body: `You may only use the Service to scan domains and email addresses that you own, control, or have explicit written permission to test. Using the Service against systems you do not own or have permission to test is strictly prohibited and may violate the Electronic Communications and Transactions Act (ECT Act) and the Cybercrimes Act 19 of 2020.\n\nYou agree not to:\n• Use the Service for any unlawful purpose\n• Attempt to circumvent our rate limits or access controls\n• Reverse-engineer or resell any portion of the Service\n• Upload malicious content or attempt to compromise our infrastructure`,
  },
  {
    heading: '4. Account Registration',
    body: `To access the full report and monitoring features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorised use of your account at support@cyberpulse.co.za.`,
  },
  {
    heading: '5. Free Scan',
    body: `The free scan is provided as-is, without warranty. Free scans are rate-limited to 3 requests per IP address per 24-hour period. Results from the free scan are indicative only and are not a substitute for a comprehensive security assessment. CyberPulse does not guarantee the completeness or accuracy of free scan results.`,
  },
  {
    heading: '6. Paid Plans and Billing',
    body: `Paid plan pricing is displayed on our website. Subscriptions are billed in advance on a monthly or annual basis. You may cancel at any time; cancellation takes effect at the end of the current billing period. No refunds are provided for partial periods except where required by the Consumer Protection Act 68 of 2008. All prices are in South African Rand (ZAR) and include VAT where applicable.`,
  },
  {
    heading: '7. Disclaimer of Warranties',
    body: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. CYBERPULSE DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY ACCURATE. SCAN RESULTS ARE PROVIDED FOR INFORMATIONAL PURPOSES AND DO NOT CONSTITUTE LEGAL, FINANCIAL, OR SECURITY ADVICE.\n\nThe insurance readiness score is an indicative assessment and does not guarantee that any insurer will offer you coverage or any specific premium rate.`,
  },
  {
    heading: '8. Limitation of Liability',
    body: `TO THE MAXIMUM EXTENT PERMITTED BY SOUTH AFRICAN LAW, CYBERPULSE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED THE AMOUNTS YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.`,
  },
  {
    heading: '9. Intellectual Property',
    body: `All content, software, reports, and designs forming part of the Service are the intellectual property of CyberPulse (Pty) Ltd and are protected by South African and international copyright law. You may download and use reports generated for your own domain for your own business purposes. You may not reproduce, distribute, or create derivative works from our platform without our written consent.`,
  },
  {
    heading: '10. Governing Law and Disputes',
    body: `These Terms are governed by the laws of the Republic of South Africa. Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the Western Cape Division of the High Court of South Africa, unless resolved through our internal dispute resolution process first. To initiate a dispute, contact legal@cyberpulse.co.za.`,
  },
  {
    heading: '11. Changes to Terms',
    body: `We may update these Terms from time to time. We will notify registered users by email of material changes at least 14 days before the new Terms take effect. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.`,
  },
  {
    heading: '12. Contact',
    body: `CyberPulse (Pty) Ltd\nEmail: legal@cyberpulse.co.za\nCape Town, Western Cape, South Africa`,
  },
];

export default function TermsPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`.mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }`}</style>

      {/* Header */}
      <section style={{ background: bgCard, borderBottom: `1px solid ${border}`, padding: '56px 24px 44px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 1.5, marginBottom: 12 }}>[ LEGAL ]</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: text, marginBottom: 12 }}>Terms of Service</h1>
          <p style={{ fontSize: 14, color: textMuted }}>Effective date: 1 January 2025 &nbsp;&bull;&nbsp; Last updated: 1 March 2025</p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '56px 24px 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {SECTIONS.map(({ heading, body }) => (
            <div key={heading} style={{ background: bgCard, borderRadius: 12, padding: '28px 32px', border: `1px solid ${border}` }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${border}` }}>{heading}</h2>
              {body.split('\n\n').map((paragraph, i) => {
                if (paragraph.includes('\n•') || paragraph.startsWith('•')) {
                  const items = paragraph.split('\n').filter(Boolean);
                  const intro = items[0].startsWith('•') ? null : items[0];
                  const bullets = intro ? items.slice(1) : items;
                  return (
                    <div key={i}>
                      {intro && <p style={{ fontSize: 14, color: textMid, lineHeight: 1.75, marginBottom: 8 }}>{intro}</p>}
                      <ul style={{ listStyle: 'disc', paddingLeft: 20, marginBottom: 12 }}>
                        {bullets.map((item, j) => (
                          <li key={j} style={{ color: textMid, fontSize: 14, lineHeight: 1.75, marginBottom: 4 }}>
                            {item.replace(/^•\s*/, '')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return (
                  <p key={i} style={{ fontSize: 14, color: textMid, lineHeight: 1.75, marginBottom: 12, whiteSpace: 'pre-line' }}>
                    {paragraph}
                  </p>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
