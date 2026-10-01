// src/app/api/studio/review/route.ts
// LINKER - AI Quality Review for a draft
// Runs rule-based + AI checks and saves results to the database.

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { retrieveContentContext } from '@/lib/ai/context';
import { runQualityReview } from '@/lib/ai/review';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await request.json();
  const { draftId } = body as { draftId?: string };

  if (!draftId) {
    return NextResponse.json({ error: 'draftId is required' }, { status: 400 });
  }

  const draft = await prisma.linkerDraft.findFirst({
    where: { id: draftId, userId: user.id },
  });

  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  // Retrieve context for accurate rule-based checks
  const context = await retrieveContentContext({
    userId: user.id,
    ideaId: draft.ideaId ?? undefined,
    pillarId: draft.pillarId ?? undefined,
    projectId: draft.projectId ?? undefined,
    researchId: draft.researchId ?? undefined,
  });

  // Get previous draft previews for duplicate-opening detection
  const previousDrafts = await prisma.linkerDraft.findMany({
    where: {
      userId: user.id,
      status: { in: ['PUBLISHED', 'APPROVED', 'SCHEDULED'] },
      id: { not: draftId },
    },
    select: { content: true },
    take: 10,
    orderBy: { updatedAt: 'desc' },
  });

  const previousPreviews = previousDrafts.map((d) => d.content.slice(0, 100));

  const reviewResult = await runQualityReview(draft.content, context, previousPreviews);

  // Persist findings to the database
  const savedReview = await prisma.linkerDraftReview.create({
    data: {
      draftId,
      findings: reviewResult.findings as unknown as Prisma.InputJsonValue,
      aiModel: reviewResult.model,
      aiProvider: reviewResult.provider,
    },
  });

  // Transition draft to IN_REVIEW status
  if (draft.status === 'DRAFT') {
    await prisma.linkerDraft.update({
      where: { id: draftId },
      data: { status: 'IN_REVIEW' },
    });
  }

  return NextResponse.json({
    reviewId: savedReview.id,
    findings: reviewResult.findings,
    provider: reviewResult.provider,
    model: reviewResult.model,
    reviewedAt: reviewResult.reviewedAt,
    totalFindings: reviewResult.findings.length,
    errorCount: reviewResult.findings.filter((f) => f.severity === 'error').length,
    warningCount: reviewResult.findings.filter((f) => f.severity === 'warning').length,
  });
}
