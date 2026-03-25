import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequestWithAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(_req: NextRequestWithAuth) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow unauthenticated access from localhost (dev convenience)
        const host = req.headers.get('host') ?? '';
        if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
          return true;
        }
        return !!token;
      },
    },
    pages: { signIn: '/login' },
  }
);

export const config = {
  matcher: ['/dashboard/:path*'],
};
