// src/app/api/identity/route.ts
// LINKER - Identity & Voice preferences API

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
    fullName,
    headline,
    bio,
    currentRole,
    industry,
    location,
    targetAudience,
    professionalGoals,
    positioning,
    values,
    writingStyle,
    tone,
    preferredTopics,
    topicsToAvoid,
    technicalDepth,
    useEmoji,
    useHashtags,
    hashtagCount,
    postLength,
    formality,
  } = body;

  const profile = await prisma.linkerProfile.upsert({
    where: { userId },
    create: {
      userId,
      fullName: fullName || null,
      headline: headline || null,
      bio: bio || null,
      currentRole: currentRole || null,
      industry: industry || null,
      location: location || null,
      targetAudience: targetAudience || null,
      professionalGoals: professionalGoals || null,
      positioning: positioning || null,
      values: values || null,
      writingStyle: writingStyle || null,
      tone: tone || 'professional',
      preferredTopics: Array.isArray(preferredTopics) ? preferredTopics : [],
      topicsToAvoid: Array.isArray(topicsToAvoid) ? topicsToAvoid : [],
      technicalDepth: technicalDepth || 'intermediate',
      useEmoji: typeof useEmoji === 'boolean' ? useEmoji : false,
      useHashtags: typeof useHashtags === 'boolean' ? useHashtags : true,
      hashtagCount: typeof hashtagCount === 'number' ? hashtagCount : 3,
      postLength: postLength || 'medium',
      formality: formality || 'professional',
    },
    update: {
      fullName,
      headline,
      bio,
      currentRole,
      industry,
      location,
      targetAudience,
      professionalGoals,
      positioning,
      values,
      writingStyle,
      tone,
      preferredTopics: Array.isArray(preferredTopics) ? preferredTopics : undefined,
      topicsToAvoid: Array.isArray(topicsToAvoid) ? topicsToAvoid : undefined,
      technicalDepth,
      useEmoji,
      useHashtags,
      hashtagCount,
      postLength,
      formality,
    },
  });

  return NextResponse.json({ success: true, profile });
}
