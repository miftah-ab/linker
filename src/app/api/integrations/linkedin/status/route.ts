// src/app/api/integrations/linkedin/status/route.ts
// LINKER - Check LinkedIn connection status

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getLinkedInMissingConfig } from '@/lib/linkedin';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ connected: false, reason: 'unauthorized' }, { status: 401 });
  }

  const connection = await prisma.linkerLinkedinConnection.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      linkedinId: true,
      displayName: true,
      expiresAt: true,
      scope: true,
      isActive: true,
      lastVerifiedAt: true,
      createdAt: true,
    },
  });

  const configured = getLinkedInMissingConfig().length === 0;

  if (!connection || !connection.isActive) {
    return NextResponse.json({
      connected: false,
      configured,
      missingConfig: getLinkedInMissingConfig(),
    });
  }

  const isExpired = connection.expiresAt ? new Date(connection.expiresAt) < new Date() : false;

  return NextResponse.json({
    connected: !isExpired,
    isExpired,
    configured,
    displayName: connection.displayName,
    linkedinId: connection.linkedinId,
    scope: connection.scope,
    lastVerifiedAt: connection.lastVerifiedAt,
    connectedSince: connection.createdAt,
    missingConfig: getLinkedInMissingConfig(),
  });
}
