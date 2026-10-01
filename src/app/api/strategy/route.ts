// src/app/api/strategy/route.ts
// LINKER - Strategy & Content Pillars API

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const strategy = await prisma.linkerStrategy.findUnique({
    where: { userId: user.id },
    include: {
      pillars: { where: { isActive: true }, orderBy: { createdAt: 'asc' } },
    },
  });

  return NextResponse.json({ strategy });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await request.json();
  const {
    positioning, goals, targetAudience, postingFrequency,
    preferredDays, preferredTimes, timezone, preferredFormats,
    preferredLength, tone, callToAction, researchRequired, topicsToAvoid, notes,
  } = body;

  const strategy = await prisma.linkerStrategy.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      positioning, goals, targetAudience,
      postingFrequency: postingFrequency ? parseInt(postingFrequency) : null,
      preferredDays: Array.isArray(preferredDays) ? preferredDays : [],
      preferredTimes: Array.isArray(preferredTimes) ? preferredTimes : [],
      timezone: timezone || 'UTC',
      preferredFormats: Array.isArray(preferredFormats) ? preferredFormats : [],
      preferredLength: preferredLength || 'medium',
      tone, callToAction,
      researchRequired: researchRequired || false,
      topicsToAvoid: Array.isArray(topicsToAvoid) ? topicsToAvoid : [],
      notes,
    },
    update: {
      positioning, goals, targetAudience,
      postingFrequency: postingFrequency ? parseInt(postingFrequency) : null,
      preferredDays: Array.isArray(preferredDays) ? preferredDays : [],
      preferredTimes: Array.isArray(preferredTimes) ? preferredTimes : [],
      timezone: timezone || 'UTC',
      preferredFormats: Array.isArray(preferredFormats) ? preferredFormats : [],
      preferredLength: preferredLength || 'medium',
      tone, callToAction,
      researchRequired: researchRequired || false,
      topicsToAvoid: Array.isArray(topicsToAvoid) ? topicsToAvoid : [],
      notes,
      updatedAt: new Date(),
    },
    include: {
      pillars: { where: { isActive: true }, orderBy: { createdAt: 'asc' } },
    },
  });

  return NextResponse.json({ strategy });
}
