import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrDev } from '@/lib/dev-session';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { runFullScan } from '@/lib/scanner';
import { encryptScanData, buildIntegrityRoot } from '@/lib/scca';
import { generateRiskNarrative, generateUnderwritingScore } from '@/lib/ai';

const schema = z.object({
  domain: z.string().regex(/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, 'Invalid domain format'),
});

export async function POST(req: NextRequest) {
  const session = await getSessionOrDev();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { domain } = parsed.data;

  // Try DB — if unavailable, tell client to fall back to free scan
  let org = null;
  let scan = null;
  try {
    org = await prisma.organisation.findFirst({ where: { userId: session.user.id } });
    if (!org) {
      org = await prisma.organisation.create({
        data: { userId: session.user.id, name: domain, domain },
      });
    }
    scan = await prisma.scan.create({
      data: { organisationId: org.id, triggeredBy: 'MANUAL', status: 'PENDING' },
    });
  } catch {
    // DB not available — send client to the free public scan instead
    return NextResponse.json(
      { error: 'db_unavailable', freeScanUrl: `/scan?domain=${encodeURIComponent(domain)}` },
      { status: 503 }
    );
  }

  const orgId = org.id;
  const scanId = scan.id;

  // Run scan asynchronously
  (async () => {
    try {
      await prisma.scan.update({ where: { id: scanId }, data: { status: 'RUNNING' } });

      const result = await runFullScan(domain, orgId);
      const narrative = await generateRiskNarrative(result).catch(() => '');
      const underwriting = await generateUnderwritingScore(result).catch(() => null);

      const encryptedRaw = await encryptScanData(result);
      const integrityRoot = await buildIntegrityRoot(
        result.findings.map((f) => `${f.category}:${f.title}:${f.severity}`)
      );

      const updatedScan = await prisma.scan.update({
        where: { id: scanId },
        data: {
          status: 'COMPLETE',
          overallScore: result.overallScore,
          grade: result.grade,
          rawResults: JSON.parse(JSON.stringify({ encrypted: encryptedRaw, underwriting })),
          integrityRoot,
          aiNarrative: narrative,
          aiUnderwritingScore: underwriting?.underwritingScore,
          darkWebExposures: result.darkWebResults?.length ?? 0,
          completedAt: new Date(),
        },
      });

      if (result.findings.length > 0) {
        await prisma.scanFinding.createMany({
          data: result.findings.map((f) => ({
            scanId: updatedScan.id,
            category: f.category as never,
            title: f.title,
            description: f.description,
            severity: f.severity as never,
            remediation: f.remediation,
          })),
        });
      }
    } catch (err) {
      console.error('Scan failed:', err);
      await prisma.scan.update({ where: { id: scanId }, data: { status: 'FAILED' } }).catch(() => {});
    }
  })();

  return NextResponse.json({ scanId }, { status: 202 });
}
