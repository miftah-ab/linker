// src/app/api/journal/route.ts
// LINKER - Journal API (CRUD)

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const privacy = searchParams.get('privacy');
  const search = searchParams.get('search');
  const projectId = searchParams.get('projectId');

  const entries = await prisma.linkerJournalEntry.findMany({
    where: {
      userId: user.id,
      ...(privacy && privacy !== 'ALL' ? { privacy: privacy as 'PRIVATE' | 'INTERNAL' | 'CONTENT_ELIGIBLE' } : {}),
      ...(projectId ? { projectId } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    },
    include: {
      project: { select: { id: true, name: true } },
    },
    orderBy: { entryDate: 'desc' },
  });

  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await request.json();
  const { title, content, projectId, tags, privacy, hasContentOpportunity, contentNotes, evidence, entryDate } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }

  const entry = await prisma.linkerJournalEntry.create({
    data: {
      userId: user.id,
      title: title.trim(),
      content: content.trim(),
      projectId: projectId || null,
      tags: Array.isArray(tags) ? tags : [],
      privacy: privacy || 'PRIVATE',
      hasContentOpportunity: hasContentOpportunity || false,
      contentNotes: contentNotes?.trim() || null,
      evidence: evidence?.trim() || null,
      entryDate: entryDate ? new Date(entryDate) : new Date(),
    },
    include: { project: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
