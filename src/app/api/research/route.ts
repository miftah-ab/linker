// src/app/api/research/route.ts
// LINKER - Research Records API

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ResearchVerificationState } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const verificationState = searchParams.get('verificationState');

  const records = await prisma.linkerResearchRecord.findMany({
    where: {
      userId: user.id,
      ...(verificationState && verificationState !== 'ALL' ? { verificationState: verificationState as ResearchVerificationState } : {}),
      ...(search ? {
        OR: [
          { topic: { contains: search, mode: 'insensitive' } },
          { sourceTitle: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ records });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await request.json();
  const { topic, sourceTitle, sourceUrl, publicationDate, author, keyPoints, facts, opinions, verificationState, notes } = body;

  if (!topic?.trim()) return NextResponse.json({ error: 'Topic is required' }, { status: 400 });

  const record = await prisma.linkerResearchRecord.create({
    data: {
      userId: user.id,
      topic: topic.trim(),
      sourceTitle: sourceTitle?.trim() || null,
      sourceUrl: sourceUrl?.trim() || null,
      publicationDate: publicationDate ? new Date(publicationDate) : null,
      author: author?.trim() || null,
      keyPoints: Array.isArray(keyPoints) ? keyPoints : [],
      facts: Array.isArray(facts) ? facts : [],
      opinions: Array.isArray(opinions) ? opinions : [],
      verificationState: (verificationState as ResearchVerificationState) || 'UNVERIFIED_CLAIM',
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json({ record }, { status: 201 });
}
