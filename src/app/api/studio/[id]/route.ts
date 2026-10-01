// src/app/api/studio/[id]/route.ts
// LINKER - Single Draft PATCH/DELETE

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { id } = await params;
  const draft = await prisma.linkerDraft.findFirst({
    where: { id, userId: user.id },
    include: {
      idea: { select: { id: true, title: true } },
      pillar: { select: { id: true, name: true, color: true } },
      project: { select: { id: true, name: true } },
      versions: { orderBy: { version: 'desc' } },
      reviews: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!draft) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ draft });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.linkerDraft.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // If content is being updated, save a new version
  if (body.content && body.content !== existing.content) {
    const latestVersion = await prisma.linkerDraftVersion.findFirst({ where: { draftId: id }, orderBy: { version: 'desc' } });
    await prisma.linkerDraftVersion.create({
      data: { draftId: id, content: body.content, version: (latestVersion?.version ?? 0) + 1 },
    });
  }

  const updated = await prisma.linkerDraft.update({
    where: { id },
    data: { ...body, updatedAt: new Date() },
    include: {
      idea: { select: { id: true, title: true } },
      pillar: { select: { id: true, name: true, color: true } },
      project: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ draft: updated });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { id } = await params;
  const draft = await prisma.linkerDraft.findFirst({ where: { id, userId: user.id } });
  if (!draft) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.linkerDraft.update({ where: { id }, data: { isArchived: true } });
  return NextResponse.json({ ok: true });
}
