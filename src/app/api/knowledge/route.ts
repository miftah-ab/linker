// src/app/api/knowledge/route.ts
// LINKER - Knowledge Base CRUD API

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  const whereClause: Record<string, unknown> = { userId };
  if (category && category !== 'ALL') {
    whereClause.category = category;
  }
  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  const entries = await prisma.linkerKnowledgeEntry.findMany({
    where: whereClause,
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();

  const { title, content, category, evidenceState, tags, source } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }

  const entry = await prisma.linkerKnowledgeEntry.create({
    data: {
      userId,
      title,
      content,
      category: category || 'GENERAL',
      evidenceState: evidenceState || 'CONFIRMED',
      tags: tags || [],
      source: source || null,
    },
  });

  return NextResponse.json({ success: true, entry });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing entry id' }, { status: 400 });
  }

  await prisma.linkerKnowledgeEntry.deleteMany({
    where: { id, userId },
  });

  return NextResponse.json({ success: true });
}
