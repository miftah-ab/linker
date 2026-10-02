// src/app/api/studio/generate/route.ts
// LINKER - AI Draft Generation endpoint

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { retrieveContentContext } from '@/lib/ai/context';
import { generateDraft } from '@/lib/ai/generate';
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit';


export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.linkerUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Rate limit: 5 AI generations per user per minute
  const rl = rateLimit(`generate:${user.id}`, 5, 60_000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const body = await request.json();
  const { ideaId, pillarId, projectId, purpose, targetAudience, tone, additionalInstructions } = body;

  if (!ideaId && !purpose) {
    return NextResponse.json({ error: 'Idea or purpose is required' }, { status: 400 });
  }

  // Build grounded context
  const context = await retrieveContentContext({
    userId: user.id,
    ideaId,
    pillarId,
    projectId,
  });

  // Generate draft with primary or fallback provider
  const startTime = Date.now();
  let result;
  const provider = 'groq';
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  let status = 'success';
  let errorMessage: string | undefined;

  try {
    result = await generateDraft({
      context,
      purpose,
      targetAudience,
      tone,
      additionalInstructions,
    });
  } catch (err) {
    status = 'failed';
    errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'AI generation failed', details: errorMessage }, { status: 500 });
  }

  const durationMs = Date.now() - startTime;

  // Log AI run for audit trail
  await prisma.linkerAiRun.create({
    data: {
      userId: user.id,
      runType: 'draft_generation',
      provider,
      model,
      durationMs,
      status,
      errorMessage: errorMessage || null,
      metadata: { ideaId, pillarId, projectId, purpose },
    },
  });

  return NextResponse.json({
    content: result.content,
    contextSummary: result.contextSummary,
    warnings: result.warnings,
    provider,
    model,
  });
}
