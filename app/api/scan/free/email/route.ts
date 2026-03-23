import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import nodemailer from 'nodemailer';

const schema = z.object({
  email: z.string().email(),
  scanId: z.string().min(1),
});

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#00ff88';
    case 'B': return '#00d4ff';
    case 'C': return '#f5c518';
    case 'D': return '#ff6b35';
    default: return '#ff3366';
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, scanId } = parsed.data;

  const freeScan = await prisma.freeScan.findUnique({ where: { id: scanId } });
  if (!freeScan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  }

  await prisma.freeScan.update({
    where: { id: scanId },
    data: { email },
  });

  const payload = freeScan.teaserPayload as {
    domain: string;
    overallScore: number;
    grade: string;
    top3Findings: { title: string; severity: string }[];
  } | null;

  if (!payload) {
    return NextResponse.json({ error: 'Scan results not available' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT ?? '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const findingsHtml = payload.top3Findings
    .map(
      (f) => `<li style="margin-bottom:8px;"><strong style="color:${getGradeColor(f.severity === 'CRITICAL' ? 'F' : f.severity === 'HIGH' ? 'D' : 'C')}">[${f.severity}]</strong> ${f.title}</li>`
    )
    .join('');

  await transporter.sendMail({
    from: `CyberPulse <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your CyberPulse Security Report — ${payload.domain}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#0a0f1e;color:#ffffff;padding:32px;max-width:600px;margin:0 auto;">
        <h1 style="color:#00d4ff;margin-bottom:4px;">CyberPulse</h1>
        <p style="color:#8892a4;margin-bottom:32px;">Cyber Security Report for ${payload.domain}</p>

        <div style="background:#0f1729;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
          <div style="font-size:64px;font-weight:bold;color:#00d4ff;">${payload.overallScore}</div>
          <div style="color:#8892a4;">/ 100</div>
          <div style="display:inline-block;background:${getGradeColor(payload.grade)};padding:8px 24px;border-radius:4px;margin-top:12px;">
            <span style="font-size:24px;font-weight:bold;color:#0a0f1e;">Grade ${payload.grade}</span>
          </div>
        </div>

        <h2 style="color:#ffffff;margin-bottom:12px;">Top Security Findings</h2>
        <ul style="color:#c8d0dd;padding-left:20px;">${findingsHtml}</ul>

        <div style="text-align:center;margin-top:32px;">
          <a href="${appUrl}/register?scan=${scanId}"
             style="background:#00d4ff;color:#0a0f1e;padding:16px 32px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:16px;">
            Unlock Full Report — Free
          </a>
        </div>

        <p style="color:#3d4f6b;font-size:12px;margin-top:32px;text-align:center;">
          Powered by CyberPulse — Secured by SCCA Protocol
        </p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
