// src/app/api/projects/[id]/route.ts
// LINKER - Single Project PATCH/DELETE

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

  const project = await prisma.linkerProject.findFirst({ where: { id, userId: user.id } });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.linkerProject.update({
    where: { id },
    data: {
      ...body,
      updatedAt: new Date(),
    },
    include: { milestones: true },
  });

  return NextResponse.json({ project: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { id } = await params;
  const project = await prisma.linkerProject.findFirst({ where: { id, userId: user.id } });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.linkerProject.update({ where: { id }, data: { isArchived: true } });
  return NextResponse.json({ ok: true });
}
