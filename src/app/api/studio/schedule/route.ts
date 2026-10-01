// src/app/api/studio/schedule/route.ts
// LINKER - Schedule a draft for publishing
// Creates a scheduled post record and transitions draft to SCHEDULED state.

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { transitionDraftStatus } from '@/lib/publishing';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await request.json();
  const { draftId, scheduledFor, timezone } = body as {
    draftId?: string;
    scheduledFor?: string;
    timezone?: string;
  };

  if (!draftId || !scheduledFor) {
    return NextResponse.json({ error: 'draftId and scheduledFor are required' }, { status: 400 });
  }

  const scheduledDate = new Date(scheduledFor);
  if (isNaN(scheduledDate.getTime())) {
    return NextResponse.json({ error: 'scheduledFor must be a valid ISO date string' }, { status: 400 });
  }

  if (scheduledDate <= new Date()) {
    return NextResponse.json({ error: 'scheduledFor must be in the future' }, { status: 400 });
  }

  // Transition draft to SCHEDULED
  const transition = await transitionDraftStatus(draftId, user.id, 'SCHEDULED', {
    scheduledFor: scheduledDate,
    timezone: timezone ?? 'UTC',
  });

  if (!transition.success) {
    return NextResponse.json({ error: transition.errorMessage }, { status: 422 });
  }

  // Create scheduled post record
  const scheduledPost = await prisma.linkerScheduledPost.create({
    data: {
      draftId,
      scheduledFor: scheduledDate,
      timezone: timezone ?? 'UTC',
      status: 'SCHEDULED',
    },
  });

  return NextResponse.json({
    success: true,
    scheduledPost: {
      id: scheduledPost.id,
      scheduledFor: scheduledPost.scheduledFor,
      timezone: scheduledPost.timezone,
      status: scheduledPost.status,
    },
    message: `Draft scheduled for ${scheduledDate.toISOString()}.`,
  });
}

// Cancel a scheduled post
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const scheduledPostId = searchParams.get('id');
  if (!scheduledPostId) {
    return NextResponse.json({ error: 'id (scheduledPostId) is required' }, { status: 400 });
  }

  const scheduledPost = await prisma.linkerScheduledPost.findFirst({
    where: { id: scheduledPostId, draft: { userId: user.id } },
  });

  if (!scheduledPost) {
    return NextResponse.json({ error: 'Scheduled post not found' }, { status: 404 });
  }

  if (scheduledPost.status !== 'SCHEDULED') {
    return NextResponse.json(
      { error: `Cannot cancel a post with status "${scheduledPost.status}"` },
      { status: 422 },
    );
  }

  await prisma.linkerScheduledPost.update({
    where: { id: scheduledPostId },
    data: { cancelledAt: new Date(), status: 'ARCHIVED' },
  });

  // Revert draft to APPROVED
  await prisma.linkerDraft.update({
    where: { id: scheduledPost.draftId },
    data: { status: 'APPROVED', scheduledFor: null },
  });

  return NextResponse.json({ success: true, message: 'Scheduled post cancelled.' });
}
