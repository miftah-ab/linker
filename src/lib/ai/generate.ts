// src/lib/ai/generate.ts
// LINKER - Draft Generation Engine
// Uses grounded context from the AI Context Engine to produce honest, on-brand LinkedIn drafts.
// Never invents facts, outcomes, or personal history.

import { complete } from './provider';
import { buildDraftSystemPrompt, type ContentContext } from './context';

export interface GenerateDraftOptions {
  context: ContentContext;
  purpose?: string;
  targetAudience?: string;
  tone?: string;
  additionalInstructions?: string;
}

export interface GenerateDraftResult {
  content: string;
  contextSummary: string;
  warnings: string[];
  claimsToReview: string[];
  provider: string;
  model: string;
  fallbackUsed: boolean;
}

// ── Build user prompt from generation options ─────────────────
function buildUserPrompt(options: GenerateDraftOptions): string {
  const lines: string[] = [];

  if (options.purpose) {
    lines.push(`Purpose of this post: ${options.purpose}`);
  }

  if (options.targetAudience) {
    lines.push(`Target audience for this specific post: ${options.targetAudience}`);
  }

  if (options.tone) {
    lines.push(`Tone for this post: ${options.tone}`);
  }

  if (options.additionalInstructions) {
    lines.push('');
    lines.push(`Additional instructions from the author:`);
    lines.push(options.additionalInstructions);
  }

  lines.push('');
  lines.push(
    'Write the LinkedIn post now. Use ONLY the information from the context provided in the system prompt. Do not fabricate any details not present there.',
  );
  lines.push(
    'After the post, include a JSON block with any claims the author should verify before publishing.',
  );

  return lines.join('\n');
}

// ── Build a human-readable context summary ───────────────────
function buildContextSummary(ctx: ContentContext): string {
  const parts: string[] = [];

  if (ctx.profile) parts.push('profile');
  if (ctx.strategy) parts.push('strategy');
  if (ctx.idea) parts.push(`idea: "${ctx.idea.title}"`);
  if (ctx.pillar) parts.push(`pillar: "${ctx.pillar.name}"`);
  if (ctx.project) parts.push(`project: "${ctx.project.name}"`);
  if (ctx.knowledgeEntries.length > 0)
    parts.push(`${ctx.knowledgeEntries.length} knowledge entries`);
  if (ctx.journalEntries.length > 0)
    parts.push(`${ctx.journalEntries.length} journal entries`);
  if (ctx.researchRecords.length > 0)
    parts.push(`${ctx.researchRecords.length} research records`);

  return parts.length > 0
    ? `Context used: ${parts.join(', ')}.`
    : 'No specific context was available.';
}

// ── Parse claims-to-review JSON from AI output ───────────────
function extractClaimsToReview(rawContent: string): {
  cleanContent: string;
  claims: string[];
} {
  const jsonBlockRegex = /```json\s*([\s\S]*?)```/i;
  const match = rawContent.match(jsonBlockRegex);

  if (!match) {
    return { cleanContent: rawContent.trim(), claims: [] };
  }

  try {
    const parsed = JSON.parse(match[1]) as { claimsToReview?: string[] };
    const claims = Array.isArray(parsed.claimsToReview) ? parsed.claimsToReview : [];
    const cleanContent = rawContent.replace(jsonBlockRegex, '').trim();
    return { cleanContent, claims };
  } catch {
    const cleanContent = rawContent.replace(jsonBlockRegex, '').trim();
    return { cleanContent, claims: [] };
  }
}

// ── Public: generateDraft() ───────────────────────────────────
export async function generateDraft(
  options: GenerateDraftOptions,
): Promise<GenerateDraftResult> {
  const { context } = options;

  const systemPrompt = buildDraftSystemPrompt(context);
  const userPrompt = buildUserPrompt(options);

  const result = await complete({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.65,
    maxTokens: 1500,
  });

  const { cleanContent, claims } = extractClaimsToReview(result.content);

  // Collect all warnings: context warnings + any claims-to-review
  const warnings: string[] = [
    ...context.warnings.map((w) => w.message),
  ];

  if (claims.length > 0) {
    warnings.push(`AI flagged ${claims.length} claim(s) for you to verify before publishing.`);
  }

  const contextSummary = buildContextSummary(context);

  return {
    content: cleanContent,
    contextSummary,
    warnings,
    claimsToReview: claims,
    provider: result.provider,
    model: result.model,
    fallbackUsed: result.fallbackUsed,
  };
}