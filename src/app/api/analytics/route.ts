// src/app/api/analytics/route.ts
// LINKER - Analytics: manual entry + LinkedIn-sourced records

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch analytics records grouped by draft
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const draftId = searchParams.get('draftId');

  const records = await prisma.linkerAnalyticsRecord.findMany({
    where: {
      userId: user.id,
      ...(draftId ? { draftId } : {}),
    },
    orderBy: { recordedAt: 'desc' },
    take: 100,
  });

  // Compute aggregate summary
  const metricSummary = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.metric] = (acc[r.metric] ?? 0) + r.value;
    return acc;
  }, {});

  return NextResponse.json({ records, summary: metricSummary });
}

// POST - Manually log analytics for a published post
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await request.json();
  const { draftId, metric, value, source, notes } = body as {
    draftId?: string;
    metric?: string;
    value?: number;
    source?: string;
    notes?: string;
  };

  const VALID_METRICS = ['impressions', 'reactions', 'comments', 'clicks', 'shares', 'reposts'];

  if (!metric || !VALID_METRICS.includes(metric)) {
    return NextResponse.json(
      { error: `metric must be one of: ${VALID_METRICS.join(', ')}` },
      { status: 400 },
    );
  }

  if (typeof value !== 'number' || value < 0) {
    return NextResponse.json({ error: 'value must be a non-negative number' }, { status: 400 });
  }

  // If draftId provided, verify ownership and that it's published
  if (draftId) {
    const draft = await prisma.linkerDraft.findFirst({
      where: { id: draftId, userId: user.id },
    });
    if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  const record = await prisma.linkerAnalyticsRecord.create({
    data: {
      userId: user.id,
      draftId: draftId ?? null,
      metric,
      value,
      source: source ?? 'user_entered',
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ record }, { status: 201 });
}
