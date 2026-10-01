// src/app/api/journal/[id]/route.ts
// LINKER - Single Journal Entry PATCH/DELETE

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

  const entry = await prisma.linkerJournalEntry.findFirst({ where: { id, userId: user.id } });
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.linkerJournalEntry.update({
    where: { id },
    data: { ...body, updatedAt: new Date() },
    include: { project: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ entry: updated });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { id } = await params;
  const entry = await prisma.linkerJournalEntry.findFirst({ where: { id, userId: user.id } });
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.linkerJournalEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
