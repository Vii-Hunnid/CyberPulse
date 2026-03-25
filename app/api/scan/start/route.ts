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

  // Look up or auto-create the org for this user
  let org = await prisma.organisation.findFirst({
    where: { userId: session.user.id },
  });
  if (!org) {
    org = await prisma.organisation.create({
      data: {
        userId: session.user.id,
        name: domain,
        domain,
      },
    });
  }
  const orgId = org.id;

  const scan = await prisma.scan.create({
    data: {
      organisationId: orgId,
      triggeredBy: 'MANUAL',
      status: 'PENDING',
    },
  });

  // Run scan asynchronously
  (async () => {
    try {
      await prisma.scan.update({ where: { id: scan.id }, data: { status: 'RUNNING' } });

      const result = await runFullScan(domain, orgId);
      const narrative = await generateRiskNarrative(result).catch(() => '');
      const underwriting = await generateUnderwritingScore(result).catch(() => null);

      const encryptedRaw = await encryptScanData(result);
      const integrityRoot = await buildIntegrityRoot(
        result.findings.map((f) => `${f.category}:${f.title}:${f.severity}`)
      );

      const updatedScan = await prisma.scan.update({
        where: { id: scan.id },
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

      // Create findings
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
      await prisma.scan.update({
        where: { id: scan.id },
        data: { status: 'FAILED' },
      });
    }
  })();

  return NextResponse.json({ scanId: scan.id }, { status: 202 });
}
