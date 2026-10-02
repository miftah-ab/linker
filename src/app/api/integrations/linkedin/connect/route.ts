// src/app/api/integrations/linkedin/connect/route.ts
// LINKER - LinkedIn OAuth 2.0 Authorization Redirect
// Redirects the user to LinkedIn to authorize the app.

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const defaultOrigin = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'https://linker-studio.vercel.app');
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${defaultOrigin}/api/integrations/linkedin/callback`;

  if (!clientId) {
    return NextResponse.json(
      {
        error: 'LinkedIn OAuth is not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in your environment.',
      },
      { status: 503 },
    );
  }

  // State encodes the user ID to verify on callback
  const state = Buffer.from(JSON.stringify({ userId: session.user.id, ts: Date.now() })).toString(
    'base64url',
  );

  // Scopes required: openid, profile, email for identity; w_member_social for posting
  const scope = 'openid profile email w_member_social';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope,
  });

  const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  return NextResponse.redirect(linkedInAuthUrl);
}
