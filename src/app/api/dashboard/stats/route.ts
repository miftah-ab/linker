// src/app/api/dashboard/stats/route.ts
// LINKER — Dashboard overview statistics API

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({
      draftsCount: 0,
      inReviewCount: 0,
      scheduledCount: 0,
      publishedCount: 0,
      knowledgeCount: 0,
      ideasCount: 0,
      recentDrafts: [],
      upcomingScheduled: [],
    });
  }

  const userId = session.user.id;

  try {
    const [
      draftsCount,
      inReviewCount,
      scheduledCount,
      publishedCount,
      knowledgeCount,
      ideasCount,
      recentDrafts,
      upcomingScheduled,
    ] = await Promise.all([
      prisma.linkerDraft.count({ where: { userId, status: 'DRAFT' } }),
      prisma.linkerDraft.count({ where: { userId, status: 'IN_REVIEW' } }),
      prisma.linkerDraft.count({ where: { userId, status: 'SCHEDULED' } }),
      prisma.linkerDraft.count({ where: { userId, status: 'PUBLISHED' } }),
      prisma.linkerKnowledgeEntry.count({ where: { userId } }),
      prisma.linkerIdea.count({ where: { userId, status: 'SAVED' } }),
      prisma.linkerDraft.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          pillar: { select: { name: true } },
          updatedAt: true,
        },
      }),
      prisma.linkerDraft.findMany({
        where: {
          userId,
          status: 'SCHEDULED',
          scheduledFor: { gte: new Date() },
        },
        orderBy: { scheduledFor: 'asc' },
        take: 5,
        select: {
          id: true,
          title: true,
          scheduledFor: true,
          status: true,
        },
      }),
    ]);

    return NextResponse.json({
      draftsCount,
      inReviewCount,
      scheduledCount,
      publishedCount,
      knowledgeCount,
      ideasCount,
      recentDrafts,
      upcomingScheduled,
    });
  } catch (err: unknown) {
    console.error('Error fetching dashboard stats:', err);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
