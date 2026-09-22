// src/app/api/identity/route.ts
// LINKER — Identity & Voice preferences API

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const profile = await prisma.linkerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        include: {
          identityFields: true,
        },
      },
    },
  });

  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();

  const {
    headline,
    bio,
    currentRole,
    company,
    industry,
    targetAudience,
    tonePreference,
    voiceRules,
    bannedPhrases,
    emojiStyle,
  } = body;

  const profile = await prisma.linkerProfile.upsert({
    where: { userId },
    create: {
      userId,
      headline,
      bio,
      currentRole,
      company,
      industry,
      targetAudience,
      tonePreference: tonePreference || 'PROFESSIONAL',
      voiceRules: voiceRules || [],
      bannedPhrases: bannedPhrases || [],
      emojiStyle: emojiStyle || 'MINIMAL',
    },
    update: {
      headline,
      bio,
      currentRole,
      company,
      industry,
      targetAudience,
      tonePreference,
      voiceRules,
      bannedPhrases,
      emojiStyle,
    },
  });

  return NextResponse.json({ success: true, profile });
}
