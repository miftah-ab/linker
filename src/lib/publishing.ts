// src/lib/publishing.ts
// LINKER - Reliable Publishing Service
// Handles state transitions, idempotency, duplicate prevention, and audit trail.
// Only marks a post as Published after confirmed provider success.

import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
import { publishToLinkedIn } from './linkedin';

export type PublishingState =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'NEEDS_CHANGES'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'ARCHIVED';

// ── Execute a publishing attempt for a draft ─────────────────
export async function executeDraftPublish(params: {
  draftId: string;
  userId: string;
  scheduledPostId?: string;
}): Promise<{ success: boolean; errorMessage?: string; linkedinPostId?: string }> {
  const { draftId, userId, scheduledPostId } = params;

  // 1. Load draft with ownership check
  const draft = await prisma.linkerDraft.findFirst({
    where: { id: draftId, userId },
  });

  if (!draft) {
    return { success: false, errorMessage: 'Draft not found or access denied' };
  }

  // 2. Only approved drafts can be published
  if (draft.status !== 'APPROVED' && draft.status !== 'SCHEDULED') {
    return {
      success: false,
      errorMessage: `Cannot publish a draft with status "${draft.status}". Draft must be APPROVED or SCHEDULED.`,
    };
  }

  // 3. Duplicate prevention - check for existing successful attempt
  const existingSuccess = await prisma.linkerPublishingAttempt.findFirst({
    where: { draftId, status: 'SUCCESS' },
  });

  if (existingSuccess) {
    return {
      success: false,
      errorMessage: `Draft was already published successfully (LinkedIn post: ${existingSuccess.linkedinPostId ?? 'unknown'}). Publishing again would create a duplicate.`,
    };
  }

  // 4. Load LinkedIn connection for this user
  const linkedinConn = await prisma.linkerLinkedinConnection.findUnique({
    where: { userId },
  });

  if (!linkedinConn?.isActive || !linkedinConn.accessToken || !linkedinConn.linkedinId) {
    // Record failed attempt
    await prisma.linkerPublishingAttempt.create({
      data: {
        draftId,
        scheduledPostId,
        provider: 'linkedin',
        status: 'FAILED',
        errorMessage: 'LinkedIn account is not connected or token is missing.',
      },
    });
    await prisma.linkerDraft.update({
      where: { id: draftId },
      data: { status: 'FAILED', failureReason: 'LinkedIn account not connected.' },
    });
    return { success: false, errorMessage: 'LinkedIn account is not connected.' };
  }

  // 5. Check token expiry
  if (linkedinConn.expiresAt && linkedinConn.expiresAt < new Date()) {
    await prisma.linkerPublishingAttempt.create({
      data: {
        draftId,
        scheduledPostId,
        provider: 'linkedin',
        status: 'FAILED',
        errorMessage: 'LinkedIn access token has expired. Please reconnect your account.',
      },
    });
    await prisma.linkerDraft.update({
      where: { id: draftId },
      data: { status: 'FAILED', failureReason: 'LinkedIn token expired.' },
    });
    return { success: false, errorMessage: 'LinkedIn access token has expired. Please reconnect.' };
  }

  // 6. Create publishing attempt record (PENDING)
  const attempt = await prisma.linkerPublishingAttempt.create({
    data: {
      draftId,
      scheduledPostId,
      provider: 'linkedin',
      status: 'PENDING',
    },
  });

  // 7. Transition draft to PUBLISHING state
  await prisma.linkerDraft.update({
    where: { id: draftId },
    data: { status: 'PUBLISHING' },
  });

  // 8. Attempt to publish
  const result = await publishToLinkedIn({
    accessToken: linkedinConn.accessToken,
    linkedinUserId: linkedinConn.linkedinId,
    content: draft.content,
  });

  // 9. Update attempt and draft based on result
  if (result.success) {
    const now = new Date();

    await prisma.linkerPublishingAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'SUCCESS',
        linkedinPostId: result.linkedinPostId,
        providerResponse: result.providerResponse as object,
        completedAt: now,
      },
    });

    await prisma.linkerDraft.update({
      where: { id: draftId },
      data: {
        status: 'PUBLISHED',
        publishedAt: now,
        linkedinPostId: result.linkedinPostId,
        failureReason: null,
      },
    });

    // Update scheduled post if applicable
    if (scheduledPostId) {
      await prisma.linkerScheduledPost.update({
        where: { id: scheduledPostId },
        data: { status: 'PUBLISHED' },
      });
    }

    return { success: true, linkedinPostId: result.linkedinPostId };
  } else {
    await prisma.linkerPublishingAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'FAILED',
        errorMessage: result.errorMessage,
        providerResponse: (result.providerResponse as unknown as Prisma.InputJsonValue) ?? undefined,
        completedAt: new Date(),
      },
    });

    await prisma.linkerDraft.update({
      where: { id: draftId },
      data: {
        status: 'FAILED',
        failureReason: result.errorMessage,
      },
    });

    if (scheduledPostId) {
      await prisma.linkerScheduledPost.update({
        where: { id: scheduledPostId },
        data: { status: 'FAILED' },
      });
    }

    return { success: false, errorMessage: result.errorMessage };
  }
}

// ── Transition draft status safely ───────────────────────────
const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['IN_REVIEW', 'ARCHIVED'],
  IN_REVIEW: ['DRAFT', 'NEEDS_CHANGES', 'APPROVED', 'ARCHIVED'],
  NEEDS_CHANGES: ['DRAFT', 'IN_REVIEW', 'ARCHIVED'],
  APPROVED: ['SCHEDULED', 'PUBLISHING', 'ARCHIVED', 'DRAFT'],
  SCHEDULED: ['APPROVED', 'PUBLISHING', 'ARCHIVED'],
  PUBLISHING: ['PUBLISHED', 'FAILED'],
  PUBLISHED: ['ARCHIVED'],
  FAILED: ['DRAFT', 'APPROVED', 'ARCHIVED'],
  ARCHIVED: [],
};

export function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function transitionDraftStatus(
  draftId: string,
  userId: string,
  newStatus: PublishingState,
  options?: { humanApproved?: boolean; scheduledFor?: Date; timezone?: string },
): Promise<{ success: boolean; errorMessage?: string }> {
  const draft = await prisma.linkerDraft.findFirst({
    where: { id: draftId, userId },
  });

  if (!draft) return { success: false, errorMessage: 'Draft not found' };

  if (!isValidTransition(draft.status, newStatus)) {
    return {
      success: false,
      errorMessage: `Cannot transition from ${draft.status} to ${newStatus}.`,
    };
  }

  const updateData: Record<string, unknown> = { status: newStatus };

  if (newStatus === 'APPROVED') {
    updateData.humanApproved = true;
    updateData.approvedAt = new Date();
  }

  if (newStatus === 'SCHEDULED' && options?.scheduledFor) {
    updateData.scheduledFor = options.scheduledFor;
    updateData.timezone = options.timezone ?? 'UTC';
  }

  await prisma.linkerDraft.update({
    where: { id: draftId },
    data: updateData,
  });

  return { success: true };
}
