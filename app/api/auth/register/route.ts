import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  company: z.string().optional(),
  domain: z.string().optional(),
  scanId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password, company, domain, scanId } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, company },
  });

  // Create organisation if domain provided
  if (domain) {
    await prisma.organisation.create({
      data: {
        name: company ?? name,
        domain,
        userId: user.id,
      },
    });
  }

  // Claim free scan if scanId provided
  if (scanId) {
    await prisma.freeScan.update({
      where: { id: scanId },
      data: { claimedByUserId: user.id },
    }).catch(() => {});
  }

  return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
}
