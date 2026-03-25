import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { discoverEndpoints } from '@/lib/scanner/endpoint-discovery';

const schema = z.object({
  domain: z.string().regex(
    /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    'Invalid domain'
  ),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
  }
  try {
    const result = await discoverEndpoints(parsed.data.domain);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Endpoint discovery error:', err);
    return NextResponse.json({ error: 'Discovery failed' }, { status: 500 });
  }
}
