// src/app/api/auth/dev-login/route.ts
// Quick local developer login bypass for localhost/development

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const isLocal =
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    process.env.NODE_ENV === 'development';

  if (!isLocal) {
    return NextResponse.json(
      { error: 'Dev login is only allowed in local development.' },
      { status: 403 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set('dev_session', 'true', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
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
  const cookieStore = await cookies();
  cookieStore.delete('dev_session');
  return NextResponse.json({ success: true });
}
