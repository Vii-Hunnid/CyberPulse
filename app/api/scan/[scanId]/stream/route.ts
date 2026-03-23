import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      send('scan:connected', { scanId });

      // Poll for scan updates
      let attempts = 0;
      const maxAttempts = 120; // 2 minutes max

      const interval = setInterval(async () => {
        attempts++;
        try {
          const scan = await prisma.scan.findUnique({
            where: { id: scanId },
            include: { findings: true },
          });

          if (!scan) {
            send('scan:error', { message: 'Scan not found' });
            clearInterval(interval);
            controller.close();
            return;
          }

          send('scan:status', {
            status: scan.status,
            overallScore: scan.overallScore,
            grade: scan.grade,
            findingsCount: scan.findings.length,
          });

          if (scan.status === 'COMPLETE' || scan.status === 'FAILED') {
            send(scan.status === 'COMPLETE' ? 'scan:complete' : 'scan:error', {
              scanId,
              overallScore: scan.overallScore,
              grade: scan.grade,
            });
            clearInterval(interval);
            controller.close();
          }

          if (attempts >= maxAttempts) {
            send('scan:timeout', { message: 'Stream timeout' });
            clearInterval(interval);
            controller.close();
          }
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
