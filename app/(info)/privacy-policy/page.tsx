import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — CyberPulse',
  description: 'How CyberPulse collects, uses, and protects your personal information. POPIA compliant.',
};

const bg     = '#f0f4f8';
const bgCard = '#ffffff';
const text   = '#0f172a';
const textMid  = '#334155';
const textMuted = '#64748b';
const textFaint = '#94a3b8';
const border   = '#dde3ec';
const cyan   = '#0ea5e9';

const SECTIONS = [
  {
    heading: '1. Who We Are',
    body: `CyberPulse (Pty) Ltd ("CyberPulse", "we", "us", "our") is a South African company registered under the Companies Act 71 of 2008. We operate the CyberPulse platform, which provides cyber security scanning, dark web monitoring, and insurance readiness assessment services to businesses. Our registered address is Cape Town, Western Cape, South Africa.`,
  },
  {
    heading: '2. What Information We Collect',
    body: `We collect the following categories of personal information:\n\n**Account information:** Name, business email address, company name, and password (stored as a salted hash — we never store your plaintext password).\n\n**Scan data:** Domain names you submit for scanning. Scan results are stored encrypted using our SCCA vault.\n\n**Usage data:** IP address, browser type, pages visited, and timestamps — collected via server logs and used for rate limiting, fraud prevention, and service improvement.\n\n**Dark web check data:** Email addresses you submit for breach checks. These are hashed before transmission to the HIBP API — we do not transmit raw email addresses.\n\n**Billing information:** If you purchase a paid plan, payment is processed by our payment provider. We do not store card numbers on our servers.`,
  },
  {
    heading: '3. How We Use Your Information',
    body: `We use your information to:\n\n• Provide and operate the CyberPulse platform\n• Deliver scan results, reports, and monitoring alerts\n• Prevent abuse and enforce our rate limits\n• Send transactional emails (scan complete, breach alert, account verification)\n• Comply with our legal obligations under POPIA and other applicable laws\n• Improve our services through aggregate, anonymised analytics\n\nWe do not sell your personal information to third parties. We do not use your data for advertising purposes.`,
  },
  {
    heading: '4. Legal Basis for Processing',
    body: `Under POPIA, we process your personal information on the following grounds:\n\n• **Contract performance:** Processing necessary to provide the services you have requested.\n• **Legitimate interests:** Security monitoring, fraud prevention, and service improvement — balanced against your rights.\n• **Legal compliance:** Where processing is required to comply with South African law.\n• **Consent:** Where you have explicitly consented, such as receiving marketing communications.`,
  },
  {
    heading: '5. Data Storage and Security',
    body: `All scan results are stored encrypted using our SCCA (Secure Cyber-posture Cryptographic Attestation) vault with AES-256-GCM encryption. We store data on servers located within the European Economic Area (EEA) and/or South Africa. We apply appropriate technical and organisational measures to protect your data against unauthorised access, loss, or destruction.`,
  },
  {
    heading: '6. Data Retention',
    body: `We retain your personal information for as long as your account is active, plus a further 3 years after account closure, unless a longer retention period is required by law. Scan results are retained for 12 months and then automatically purged. You may request deletion of your data at any time (see Section 9).`,
  },
  {
    heading: '7. Sharing with Third Parties',
    body: `We share data with the following categories of third-party service providers, solely to operate our platform:\n\n• **Anthropic:** AI narrative generation. Scan findings (not personal identifying information) are sent to the Anthropic Claude API.\n• **HIBP (Have I Been Pwned):** Hashed email addresses for breach checking.\n• **Hosting providers:** Cloud infrastructure. All processors are bound by data processing agreements.\n• **Payment processor:** Card payments. PCI-DSS compliant.\n\nWe do not share your personal information with any other third parties without your explicit consent, unless required by law.`,
  },
  {
    heading: '8. Cookies',
    body: `CyberPulse uses strictly necessary session cookies to authenticate your account. We do not use tracking cookies, advertising cookies, or third-party analytics cookies. You may disable cookies in your browser settings, but this will prevent you from logging in.`,
  },
  {
    heading: '9. Your Rights',
    body: `Under POPIA, you have the right to:\n\n• **Access** the personal information we hold about you\n• **Correct** inaccurate or incomplete information\n• **Delete** your personal information (right to erasure)\n• **Object** to the processing of your information\n• **Portability** — receive your data in a structured, machine-readable format\n• **Lodge a complaint** with the Information Regulator of South Africa\n\nTo exercise any of these rights, contact us at privacy@cyberpulse.co.za. We will respond within 30 days.`,
  },
  {
    heading: '10. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by email or by displaying a notice in your dashboard. Continued use of the platform after the effective date of changes constitutes acceptance.`,
  },
  {
    heading: '11. Contact Us',
    body: `For any privacy-related queries or to exercise your rights:\n\nPrivacy Officer, CyberPulse (Pty) Ltd\nEmail: privacy@cyberpulse.co.za\nPost: Cape Town, Western Cape, South Africa\n\nInformation Regulator of South Africa: inforeg.org.za`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }
        .prose p { margin-bottom: 12px; color: #334155; font-size: 14px; line-height: 1.75; }
        .prose ul, .prose ol { padding-left: 20px; margin-bottom: 12px; }
        .prose li { color: #334155; font-size: 14px; line-height: 1.75; margin-bottom: 4px; }
        .prose strong { color: #0f172a; font-weight: 600; }
      `}</style>

      {/* Header */}
      <section style={{ background: bgCard, borderBottom: `1px solid ${border}`, padding: '56px 24px 44px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="mono" style={{ fontSize: 10, color: textFaint, letterSpacing: 1.5, marginBottom: 12 }}>[ LEGAL ]</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: text, marginBottom: 12 }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: textMuted }}>Effective date: 1 January 2025 &nbsp;&bull;&nbsp; Last updated: 1 March 2025</p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '56px 24px 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {SECTIONS.map(({ heading, body }) => (
            <div key={heading} style={{ background: bgCard, borderRadius: 12, padding: '28px 32px', border: `1px solid ${border}` }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${border}` }}>{heading}</h2>
              <div className="prose">
                {body.split('\n\n').map((paragraph, i) => {
                  if (paragraph.startsWith('• ') || paragraph.startsWith('•')) {
                    const items = paragraph.split('\n').filter(Boolean);
                    return (
                      <ul key={i} style={{ listStyle: 'disc', paddingLeft: 20, marginBottom: 12 }}>
                        {items.map((item, j) => (
                          <li key={j} style={{ color: textMid, fontSize: 14, lineHeight: 1.75, marginBottom: 4 }}>
                            {item.replace(/^•\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={i} style={{ color: textMid, fontSize: 14, lineHeight: 1.75, marginBottom: 12 }}>
                      {paragraph.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
