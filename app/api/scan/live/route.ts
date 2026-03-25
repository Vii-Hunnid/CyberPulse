import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrDev } from '@/lib/dev-session';
import { runFullScan } from '@/lib/scanner';
import { generateRiskNarrative, generateUnderwritingScore } from '@/lib/ai';
import { z } from 'zod';

export const maxDuration = 300; // 5 minutes — long scan

const schema = z.object({
  domain: z.string().regex(
    /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    'Invalid domain format'
  ),
});

export async function POST(req: NextRequest) {
  const session = await getSessionOrDev();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { domain } = parsed.data;

  const result = await runFullScan(domain, 'live');
  const [narrative, underwriting] = await Promise.all([
    generateRiskNarrative(result).catch(() => ''),
    generateUnderwritingScore(result).catch(() => null),
  ]);

  return NextResponse.json({ ...result, narrative, underwriting });
}
