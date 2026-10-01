// src/app/api/integrations/linkedin/disconnect/route.ts
// LINKER - Disconnect LinkedIn account

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.linkerLinkedinConnection.updateMany({
    where: { userId: session.user.id },
    data: {
      isActive: false,
      accessToken: null,
      refreshToken: null,
      disconnectedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, message: 'LinkedIn account disconnected.' });
}
