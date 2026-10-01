// src/app/api/studio/publish/route.ts
// LINKER - Publish a draft to LinkedIn
// Only APPROVED or SCHEDULED drafts can be published.
// Duplicate prevention is enforced by the publishing service.

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { executeDraftPublish } from '@/lib/publishing';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = await request.json();
  const { draftId } = body as { draftId?: string };

  if (!draftId) {
    return NextResponse.json({ error: 'draftId is required' }, { status: 400 });
  }

  const result = await executeDraftPublish({
    draftId,
    userId: user.id,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.errorMessage ?? 'Publishing failed' },
      { status: 422 },
    );
  }

  return NextResponse.json({
    success: true,
    linkedinPostId: result.linkedinPostId,
    message: 'Post published to LinkedIn successfully.',
  });
}
