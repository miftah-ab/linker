// src/app/api/studio/approve/route.ts
// LINKER - Human Approval Workflow
// Transitions a draft through IN_REVIEW → APPROVED.
// Only the draft owner can approve. Records the human approval timestamp.

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
  const { draftId, action } = body as { draftId?: string; action?: 'approve' | 'request_changes' };

  if (!draftId || !action) {
    return NextResponse.json({ error: 'draftId and action are required' }, { status: 400 });
  }

  if (!['approve', 'request_changes'].includes(action)) {
    return NextResponse.json({ error: 'action must be "approve" or "request_changes"' }, { status: 400 });
  }

  const newStatus = action === 'approve' ? 'APPROVED' : 'NEEDS_CHANGES';

  const result = await transitionDraftStatus(draftId, user.id, newStatus, {
    humanApproved: action === 'approve',
  });

  if (!result.success) {
    return NextResponse.json({ error: result.errorMessage }, { status: 422 });
  }

  const updatedDraft = await prisma.linkerDraft.findFirst({
    where: { id: draftId, userId: user.id },
    select: { id: true, status: true, humanApproved: true, approvedAt: true },
  });

  return NextResponse.json({
    success: true,
    draft: updatedDraft,
    message: action === 'approve' ? 'Draft approved.' : 'Draft returned for changes.',
  });
}
