// src/app/api/projects/route.ts
// LINKER - Projects API (CRUD)

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const projects = await prisma.linkerProject.findMany({
    where: {
      userId: user.id,
      isArchived: false,
      ...(status && status !== 'ALL' ? { status: status as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'ABANDONED' } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    },
    include: {
      milestones: { orderBy: { createdAt: 'asc' } },
      _count: { select: { journalEntries: true, knowledgeEntries: true, ideas: true, drafts: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await request.json();
  const { name, description, problemAddressed, targetUsers, techStack, status, startDate, endDate, links, outcomes, outcomeStatus } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
  }

  const project = await prisma.linkerProject.create({
    data: {
      userId: user.id,
      name: name.trim(),
      description: description?.trim() || null,
      problemAddressed: problemAddressed?.trim() || null,
      targetUsers: targetUsers?.trim() || null,
      techStack: Array.isArray(techStack) ? techStack : [],
      status: status || 'PLANNED',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      links: Array.isArray(links) ? links : [],
      outcomes: outcomes?.trim() || null,
      outcomeStatus: outcomeStatus || 'UNVERIFIED',
    },
    include: { milestones: true },
  });

  return NextResponse.json({ project }, { status: 201 });
}
