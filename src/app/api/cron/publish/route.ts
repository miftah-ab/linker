// src/app/api/cron/publish/route.ts
// LINKER - Cron-triggered publishing of scheduled posts
// Triggered by Vercel Cron Jobs or an external cron tool (e.g. QStash).
// Protected by CRON_SECRET - never callable by end users.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeDraftPublish } from '@/lib/publishing';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Protect the cron endpoint
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authorization = request.headers.get('authorization');
    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const now = new Date();

  // Find all scheduled posts that are due and not yet triggered
  const duePosts = await prisma.linkerScheduledPost.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledFor: { lte: now },
      cancelledAt: null,
      draft: {
        status: { in: ['APPROVED', 'SCHEDULED'] },
        humanApproved: true,
      },
    },
    include: {
      draft: {
        select: { id: true, userId: true, humanApproved: true },
      },
    },
    take: 20, // Process max 20 at a time to avoid timeout
  });

  if (duePosts.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No scheduled posts due.' });
  }

  const results = await Promise.allSettled(
    duePosts.map(async (post) => {
      return executeDraftPublish({
        draftId: post.draft.id,
        userId: post.draft.userId,
        scheduledPostId: post.id,
      });
    }),
  );

  const summary = {
    processed: results.length,
    succeeded: results.filter(
      (r) => r.status === 'fulfilled' && r.value.success,
    ).length,
    failed: results.filter(
      (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success),
    ).length,
  };

  console.log('[CRON] Publish run complete:', summary);

  return NextResponse.json(summary);
}
