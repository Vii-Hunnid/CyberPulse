# CyberPulse — Cyber Posture Intelligence Platform

> Securing African Business, One Domain at a Time

CyberPulse is a full-stack SaaS platform that gives South African SMEs an instant, comprehensive cyber security posture score — complete with AI-generated risk narratives, dark web monitoring, insurance readiness scoring, and tamper-proof PDF attestations.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CYBERPULSE                               │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Next.js 16  │    │  Prisma ORM  │    │   PostgreSQL DB  │  │
│  │  App Router  │◄──►│  (schema)    │◄──►│   (data store)   │  │
│  │  TypeScript  │    └──────────────┘    └──────────────────┘  │
│  └──────┬───────┘                                               │
│         │                                                       │
│  ┌──────▼───────────────────────────────────────────────────┐  │
│  │                    SCANNER ENGINE                         │  │
│  │  dns-email │ ssl-tls │ http-headers │ open-ports │ cve   │  │
│  │  backup-hygiene │ dark-web (HIBP)                         │  │
│  └──────┬───────────────────────────────────────────────────┘  │
│         │                                                       │
│  ┌──────▼──────────┐    ┌────────────────┐    ┌─────────────┐  │
│  │  AI MODULE      │    │  SCCA MODULE   │    │  REPORTS    │  │
│  │  Claude Sonnet  │    │  AES-256-GCM   │    │  PDF (react-│  │
│  │  Narratives     │    │  Merkle HMAC   │    │  pdf)       │  │
│  │  Underwriting   │    │  SSE Streams   │    └─────────────┘  │
│  └─────────────────┘    └────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## SCCA Integration

CyberPulse integrates the **SCCA Protocol** (Secure Cryptographic Compliance Architecture) for three core functions:

1. **Encryption** — All sensitive scan results are encrypted using AES-256-GCM with HKDF-derived keys before storage. The master key is stored in `SCCA_MASTER_KEY`.

2. **Integrity Chain** — Each scan report is hashed using a Merkle-HMAC chain (HMAC-SHA256). The root hash is stored alongside the report. Before any report is served via the API, the integrity root is re-verified — a 409 error is returned if tampering is detected.

3. **SSE Streaming** — Real-time scan progress is streamed to the client using Server-Sent Events, allowing the UI to update as each scan category completes.

---

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.local .env.local
# Edit .env.local with your actual values
```

### 4. Database Setup

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public URL of your app | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | Yes |
| `NEXTAUTH_URL` | App URL for NextAuth | Yes |
| `ANTHROPIC_API_KEY` | Claude API key | Yes (AI features) |
| `HIBP_API_KEY` | HaveIBeenPwned API key | Yes (dark web) |
| `SCCA_MASTER_KEY` | Encryption master key (32+ chars) | Yes |
| `SHODAN_API_KEY` | Shodan API key | Optional |
| `SMTP_HOST` | SMTP server host | Yes (emails) |
| `SMTP_PORT` | SMTP port | Yes (emails) |
| `SMTP_USER` | SMTP username | Yes (emails) |
| `SMTP_PASS` | SMTP password/app password | Yes (emails) |

---

## API Route Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/[...nextauth]` | Public | NextAuth sign-in/out |
| POST | `/api/scan/start` | Required | Start full authenticated scan |
| GET | `/api/scan/[scanId]/stream` | Required | SSE stream of scan progress |
| GET | `/api/scan/[scanId]/report` | Required | Get scan results (integrity-verified) |
| POST | `/api/scan/[scanId]/recheck` | Required | Re-run scan |
| GET | `/api/org/[orgId]/attestation` | Required | Get/generate insurance attestation |
| POST | `/api/scan/free` | Public | Run free teaser scan (rate limited 3/24h) |
| POST | `/api/scan/free/email` | Public | Email free scan results |
| POST | `/api/darkweb/check` | Required | Check email against HIBP |

---

## Scan Checks

| Category | Weight | What's Checked |
|---|---|---|
| **DNS / Email** | 20% | SPF, DKIM, DMARC, MX, CAA records |
| **SSL / TLS** | 20% | Certificate validity, expiry, TLS version, HSTS |
| **HTTP Headers** | 15% | CSP, X-Frame-Options, X-Content-Type, Referrer-Policy, Permissions-Policy |
| **Open Ports** | 25% | Telnet (23), RDP (3389), VNC (5900), MSSQL (1433), MySQL (3306), Redis (6379), MongoDB (27017) |
| **CVE Exposure** | 15% | Tech stack detection + NVD CVE database lookup for CVSS 7.0+ |
| **Backup Hygiene** | 5% | Last backup date, offsite storage, restoration testing |

**Free tier** includes: DNS/Email, SSL/TLS, HTTP Headers, Dark Web only.

---

## AI Features

| Feature | Model | Output |
|---|---|---|
| Risk Narrative | Claude Sonnet | 3–4 paragraph plain English summary for SME owners |
| Remediation Steps | Claude Sonnet | Numbered step-by-step fix instructions (max 8 steps) |
| Underwriting Score | Claude Sonnet | JSON: score, grade, risk/positive factors, coverage recommendation |
| Dark Web Analysis | Claude Sonnet | Plain English breach summary (max 150 words) |

---

## Roadmap

### Phase 1 — MVP (Current)
- [x] 6-category automated security scan
- [x] AI risk narratives and underwriting scoring
- [x] Dark web monitoring via HIBP
- [x] Tamper-proof PDF attestations
- [x] Free public scanner with lead capture
- [x] SCCA encryption and integrity chain

### Phase 2 — Insurer API
- [ ] Cyan Insurance API integration
- [ ] Real-time policy quoting
- [ ] Automated premium calculation from underwriting score
- [ ] Broker dashboard and white-label options

### Phase 3 — White-label & Scale
- [ ] Multi-tenant white-label deployment
- [ ] MSP (Managed Service Provider) portal
- [ ] Continuous monitoring with daily rescans
- [ ] SIEM integration (Splunk, Microsoft Sentinel)
- [ ] Compliance mapping (ISO 27001, POPIA, SOC 2)
