// src/app/api/strategy/pillars/route.ts
// LINKER - Content Pillars API

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await request.json();
  const { name, description, color, strategyId } = body;

  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const pillar = await prisma.linkerContentPillar.create({
    data: {
      userId: user.id,
      strategyId: strategyId || null,
      name: name.trim(),
      description: description?.trim() || null,
      color: color || '#2563EB',
    },
  });

  return NextResponse.json({ pillar }, { status: 201 });
}
