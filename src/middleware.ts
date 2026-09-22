// src/middleware.ts
// LINKER — Route protection middleware

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/auth/signin', '/auth/signup', '/auth/error'];
const AUTH_API_ROUTES = ['/api/auth'];

export default auth(function middleware(req: NextRequest & { auth?: { user?: { id?: string } } }) {
  const { pathname } = req.nextUrl;

  // Always allow public routes and auth API routes
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    AUTH_API_ROUTES.some((r) => pathname.startsWith(r))
  ) {
    return NextResponse.next();
  }

  // Protect /app/* routes
  if (pathname.startsWith('/app')) {
    const session = (req as unknown as { auth?: { user?: { id?: string } } }).auth;
    if (!session?.user?.id) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
