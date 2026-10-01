// src/app/api/ideas/[id]/route.ts
// LINKER - Single Idea PATCH/DELETE

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { id } = await params;
  const body = await request.json();

  const idea = await prisma.linkerIdea.findFirst({ where: { id, userId: user.id } });
  if (!idea) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.linkerIdea.update({
    where: { id },
    data: { ...body, updatedAt: new Date() },
    include: {
      pillar: { select: { id: true, name: true, color: true } },
      project: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ idea: updated });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { id } = await params;
  const idea = await prisma.linkerIdea.findFirst({ where: { id, userId: user.id } });
  if (!idea) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.linkerIdea.update({ where: { id }, data: { isArchived: true } });
  return NextResponse.json({ ok: true });
}
