// src/app/api/account/delete/route.ts
// LINKER - Account Deletion

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Cascade-delete the user and all related data (FK cascades handle children)
  await prisma.linkerUser.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true });
}
