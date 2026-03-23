import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { verifyIntegrityRoot } from '@/lib/scca';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { scanId } = await params;

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { findings: true, organisation: true },
  });

  if (!scan) return NextResponse.json({ error: 'Scan not found' }, { status: 404 });

  // Verify integrity
  if (scan.integrityRoot && scan.findings.length > 0) {
    const items = scan.findings.map((f) => `${f.category}:${f.title}:${f.severity}`);
    const isValid = await verifyIntegrityRoot(items, scan.integrityRoot);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Integrity check failed — report may have been tampered with' },
        { status: 409 }
      );
    }
  }

  return NextResponse.json({ scan });
}
