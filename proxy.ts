import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  // Allow unauthenticated access from localhost (dev convenience)
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    return NextResponse.next();
  }
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
