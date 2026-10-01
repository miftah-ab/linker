// src/app/api/studio/route.ts
// LINKER - Content Studio API (drafts + AI generation)

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const drafts = await prisma.linkerDraft.findMany({
    where: {
      userId: user.id,
      isArchived: false,
      ...(status && status !== 'ALL' ? { status: status as 'DRAFT' | 'IN_REVIEW' | 'NEEDS_CHANGES' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED' } : {}),
    },
    include: {
      idea: { select: { id: true, title: true } },
      pillar: { select: { id: true, name: true, color: true } },
      project: { select: { id: true, name: true } },
      versions: { orderBy: { version: 'desc' }, take: 1 },
      reviews: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ drafts });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await request.json();
  const { content, ideaId, pillarId, projectId, title, purpose, targetAudience } = body;

  if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

  const draft = await prisma.linkerDraft.create({
    data: {
      userId: user.id,
      content: content.trim(),
      title: title?.trim() || null,
      ideaId: ideaId || null,
      pillarId: pillarId || null,
      projectId: projectId || null,
      purpose: purpose || null,
      targetAudience: targetAudience || null,
      status: 'DRAFT',
    },
    include: {
      idea: { select: { id: true, title: true } },
      pillar: { select: { id: true, name: true, color: true } },
      project: { select: { id: true, name: true } },
    },
  });

  // Save version 1
  await prisma.linkerDraftVersion.create({
    data: { draftId: draft.id, content: content.trim(), version: 1 },
  });

  return NextResponse.json({ draft }, { status: 201 });
}
