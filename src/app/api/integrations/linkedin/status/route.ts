// src/app/api/integrations/linkedin/status/route.ts
// LINKER — Check LinkedIn connection status

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ connected: false, reason: 'unauthorized' }, { status: 401 });
  }

  const connection = await prisma.linkerLinkedinConnection.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      linkedinMemberId: true,
      memberUrn: true,
      tokenExpiresAt: true,
      scope: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!connection) {
    return NextResponse.json({
      connected: false,
      configured: Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
    });
  }

  const isExpired = connection.tokenExpiresAt ? new Date(connection.tokenExpiresAt) < new Date() : false;

  return NextResponse.json({
    connected: !isExpired,
    isExpired,
    memberUrn: connection.memberUrn,
    scope: connection.scope,
    configured: Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
  });
}
