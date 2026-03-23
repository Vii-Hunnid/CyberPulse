import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { scanId } = await params;

  const originalScan = await prisma.scan.findUnique({ where: { id: scanId } });
  if (!originalScan) return NextResponse.json({ error: 'Scan not found' }, { status: 404 });

  const newScan = await prisma.scan.create({
    data: {
      organisationId: originalScan.organisationId,
      triggeredBy: 'MANUAL',
      status: 'PENDING',
    },
  });

  // Trigger recheck via start endpoint internally
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  await fetch(`${baseUrl}/api/scan/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: req.headers.get('cookie') ?? '' },
    body: JSON.stringify({ orgId: originalScan.organisationId, domain: '' }),
  }).catch(() => {});

  return NextResponse.json({ scanId: newScan.id }, { status: 202 });
}
