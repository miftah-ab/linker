// src/app/api/auth/dev-login/route.ts
// DEV-ONLY: This endpoint is completely disabled in production.

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const isDev =
  process.env.NODE_ENV === 'development' &&
  process.env.ENABLE_DEV_LOGIN === 'true';

export async function POST(request: NextRequest) {
  if (!isDev) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const host = request.headers.get('host') || '';
  const isLocal =
    host.includes('localhost') || host.includes('127.0.0.1');

  if (!isLocal) {
    return NextResponse.json(
      { error: 'Dev login is only allowed in local development.' },
      { status: 403 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set('dev_session', 'true', {
    path: '/',
    httpOnly: true,  // fixed: httpOnly to prevent XSS reads
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day only
  });

  return NextResponse.json({
    success: true,
    user: {
      id: 'dev-user-local',
      email: 'dev@linker.local',
      name: 'Local Developer',
    },
  });
}

export async function DELETE() {
  if (!isDev) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }
  const cookieStore = await cookies();
  cookieStore.delete('dev_session');
  return NextResponse.json({ success: true });
}
