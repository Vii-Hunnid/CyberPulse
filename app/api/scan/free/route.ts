import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runFreeScan } from '@/lib/scanner';
import { generateUnderwritingScore, generateRiskNarrative } from '@/lib/ai';
import { randomUUID } from 'crypto';

const schema = z.object({
  domain: z.string().regex(
    /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    'Invalid domain format'
  ),
});

// In-memory rate limiter — no DB required
const memRateLimit = new Map<string, number[]>();
const FREE_SCAN_LIMIT = 3;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}

function checkAndRecordRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (memRateLimit.get(ip) ?? []).filter((t) => t > windowStart);
  if (timestamps.length >= FREE_SCAN_LIMIT) return false;
  memRateLimit.set(ip, [...timestamps, now]);
  return true;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid domain format. Example: yourbusiness.co.za' },
      { status: 400 }
    );
  }

  const { domain } = parsed.data;
  const ip = getClientIp(req);

  if (!checkAndRecordRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Maximum 3 free scans per 24 hours.' },
      { status: 429 }
    );
  }

  // Run the scan (DNS, SSL, headers, dark web — no DB needed)
  const result = await runFreeScan(domain);

  // AI underwriting — falls back to grade if API key not set
  let underwritingGrade = result.grade;
  let narrative = '';

  try {
    const [uw, narr] = await Promise.allSettled([
      generateUnderwritingScore({
        domain,
        organisationId: '',
        overallScore: result.overallScore,
        grade: result.grade,
        categoryScores: result.categoryScores,
        findings: result.findings,
        completedAt: new Date(),
      }),
      generateRiskNarrative({
        domain,
        organisationId: '',
        overallScore: result.overallScore,
        grade: result.grade,
        categoryScores: result.categoryScores,
        findings: result.findings,
        completedAt: new Date(),
      }),
    ]);

    if (uw.status === 'fulfilled') underwritingGrade = uw.value.insurabilityGrade;
    if (narr.status === 'fulfilled') narrative = narr.value;
  } catch {
    // AI is optional — scan results still returned
  }

  const top3Findings = [...result.findings]
    .sort((a, b) => {
      const order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
      return order.indexOf(a.severity) - order.indexOf(b.severity);
    })
    .slice(0, 3)
    .map((f) => ({ title: f.title, severity: f.severity }));

  const categoryResults = result.categoryScores.map((cs) => ({
    category: cs.category,
    status: cs.status,
    summary:
      cs.status === 'pass'
        ? 'No issues detected'
        : cs.status === 'warn'
        ? 'Minor issues detected'
        : 'Critical issues found',
  }));

  return NextResponse.json({
    domain,
    overallScore: result.overallScore,
    grade: result.grade,
    categoryResults,
    top3Findings,
    darkWebBreachCount: result.darkWebBreachCount,
    underwritingGrade,
    narrative,
    scanId: randomUUID(),
  });
}
