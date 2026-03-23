import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateReport } from '@/lib/reports/generate';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { orgId } = await params;

  const org = await prisma.organisation.findUnique({ where: { id: orgId } });
  if (!org) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });

  // Get latest attestation
  const latest = await prisma.insuranceAttestation.findFirst({
    where: { organisationId: orgId },
    orderBy: { generatedAt: 'desc' },
  });

  const now = new Date();
  const isExpired = !latest || latest.validUntil < now;

  if (!isExpired) {
    return NextResponse.json({ attestation: latest });
  }

  // Generate new attestation
  const latestScan = await prisma.scan.findFirst({
    where: { organisationId: orgId, status: 'COMPLETE' },
    orderBy: { completedAt: 'desc' },
    include: { findings: true },
  });

  if (!latestScan) {
    return NextResponse.json({ error: 'No completed scan found' }, { status: 404 });
  }

  await generateReport(latestScan, org);

  const attestation = await prisma.insuranceAttestation.create({
    data: {
      organisationId: orgId,
      scanId: latestScan.id,
      underwritingScore: latestScan.aiUnderwritingScore ?? 0,
      attestationPdf: `/public/reports/${orgId}/${latestScan.id}.pdf`,
      validUntil: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({ attestation });
}
