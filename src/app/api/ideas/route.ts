// src/app/api/ideas/route.ts
// LINKER - Ideas API (CRUD)

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
  const search = searchParams.get('search');

  const ideas = await prisma.linkerIdea.findMany({
    where: {
      userId: user.id,
      isArchived: false,
      ...(status && status !== 'ALL' ? { status: status as 'SAVED' | 'IN_REVIEW' | 'APPROVED' | 'CONVERTED' | 'ARCHIVED' | 'REJECTED' } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    },
    include: {
      pillar: { select: { id: true, name: true, color: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
  });

  return NextResponse.json({ ideas });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await request.json();
  const { title, description, pillarId, projectId, journalEntryId, source, targetAudience, purpose, evidence, priority, notes } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const idea = await prisma.linkerIdea.create({
    data: {
      userId: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      pillarId: pillarId || null,
      projectId: projectId || null,
      journalEntryId: journalEntryId || null,
      source: source || 'MANUAL',
      targetAudience: targetAudience?.trim() || null,
      purpose: purpose?.trim() || null,
      evidence: evidence?.trim() || null,
      priority: priority || 3,
      notes: notes?.trim() || null,
      status: 'SAVED',
    },
    include: {
      pillar: { select: { id: true, name: true, color: true } },
      project: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ idea }, { status: 201 });
}
