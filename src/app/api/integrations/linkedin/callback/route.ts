// src/app/api/integrations/linkedin/callback/route.ts
// LINKER - LinkedIn OAuth 2.0 Callback Handler
// Exchanges the authorization code for tokens, fetches profile, and stores connection.
// Tokens are ONLY stored server-side - never exposed to the client.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLinkedInProfile } from '@/lib/linkedin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Resolve base app URL dynamically from headers or fallback to production URL
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const appUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'https://linker-studio.vercel.app');

  // LinkedIn denied access or cancelled
  if (error) {
    const msg = encodeURIComponent(errorDescription ?? error);
    return NextResponse.redirect(`${appUrl}/app/integrations?error=${msg}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/app/integrations?error=missing_code_or_state`);
  }

  // Decode and validate state
  let userId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8')) as {
      userId?: string;
      ts?: number;
    };
    if (!decoded.userId) throw new Error('No userId in state');
    // State must be < 10 minutes old
    if (decoded.ts && Date.now() - decoded.ts > 10 * 60 * 1000) {
      throw new Error('State expired');
    }
    userId = decoded.userId;
  } catch {
    return NextResponse.redirect(`${appUrl}/app/integrations?error=invalid_state`);
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(`${appUrl}/app/integrations?error=oauth_not_configured`);
  }

  // Exchange code for tokens
  let tokenData: {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
  };
  try {
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('[LinkedIn OAuth] Token exchange failed:', tokenRes.status, errBody);
      return NextResponse.redirect(`${appUrl}/app/integrations?error=token_exchange_failed`);
    }

    tokenData = await tokenRes.json();
  } catch (err) {
    console.error('[LinkedIn OAuth] Token exchange error:', err);
    return NextResponse.redirect(`${appUrl}/app/integrations?error=token_exchange_error`);
  }

  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return NextResponse.redirect(`${appUrl}/app/integrations?error=no_access_token`);
  }

  // Calculate token expiry
  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000)
    : null;

  // Fetch LinkedIn profile info
  const profile = await getLinkedInProfile(accessToken);
  if (!profile) {
    return NextResponse.redirect(`${appUrl}/app/integrations?error=profile_fetch_failed`);
  }

  // Parse scope
  const scope = tokenData.scope ? tokenData.scope.split(/[\s,]+/).filter(Boolean) : [];

  // Upsert the LinkedIn connection - tokens stored server-side only
  await prisma.linkerLinkedinConnection.upsert({
    where: { userId },
    create: {
      userId,
      linkedinId: profile.id,
      displayName: profile.displayName,
      profilePicture: profile.profilePicture ?? null,
      accessToken,
      refreshToken: tokenData.refresh_token ?? null,
      expiresAt,
      scope,
      isActive: true,
      lastVerifiedAt: new Date(),
    },
    update: {
      linkedinId: profile.id,
      displayName: profile.displayName,
      profilePicture: profile.profilePicture ?? null,
      accessToken,
      refreshToken: tokenData.refresh_token ?? null,
      expiresAt,
      scope,
      isActive: true,
      disconnectedAt: null,
      lastVerifiedAt: new Date(),
    },
  });

  return NextResponse.redirect(`${appUrl}/app/integrations?connected=true`);
}
