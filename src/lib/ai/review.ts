// src/lib/ai/review.ts
// LINKER - Quality Review Engine
// Produces actionable findings - NOT fake scores or percentages.

import { complete } from './provider';
import type { ContentContext } from './context';

export type FindingSeverity = 'error' | 'warning' | 'info';

export interface ReviewFinding {
  id: string;
  type: string;
  message: string;
  severity: FindingSeverity;
  actionable: boolean;
}

export interface QualityReviewResult {
  findings: ReviewFinding[];
  provider: string;
  model: string;
  fallbackUsed: boolean;
  reviewedAt: Date;
}

// ── Rule-based checks (no AI needed) ────────────────────────
function runRuleBasedChecks(
  content: string,
  ctx: ContentContext,
  previousDraftPreviews: string[],
): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  let id = 0;
  const nextId = () => `rule-${++id}`;

  // 1. Unverified project outcomes
  if (ctx.project?.outcomeStatus === 'UNVERIFIED' && ctx.project.outcomes) {
    findings.push({
      id: nextId(),
      type: 'unverified_outcome',
      message: `Project outcome is marked as UNVERIFIED. Do not present it as a confirmed result.`,
      severity: 'error',
      actionable: true,
    });
  }

  // 2. Missing evidence on idea
  if (ctx.idea && !ctx.idea.evidence) {
    findings.push({
      id: nextId(),
      type: 'missing_evidence',
      message: 'This idea has no attached evidence. Consider adding supporting context before publishing.',
      severity: 'warning',
      actionable: true,
    });
  }

  // 3. Topics to avoid
  if (ctx.profile?.topicsToAvoid && ctx.profile.topicsToAvoid.length > 0) {
    const lower = content.toLowerCase();
    const match = ctx.profile.topicsToAvoid.find((t) => lower.includes(t.toLowerCase()));
    if (match) {
      findings.push({
        id: nextId(),
        type: 'topics_to_avoid',
        message: `Draft may contain content related to "${match}", which is listed as a topic to avoid.`,
        severity: 'warning',
        actionable: true,
      });
    }
  }

  // 4. Repeated opening
  if (previousDraftPreviews.length > 0) {
    const opening = content.split('\n')[0]?.slice(0, 60).toLowerCase() ?? '';
    const isRepeated = previousDraftPreviews.some((prev) =>
      prev.toLowerCase().startsWith(opening.slice(0, 30)),
    );
    if (isRepeated) {
      findings.push({
        id: nextId(),
        type: 'repeated_opening',
        message: 'This opening closely resembles a previous draft. Consider a different hook.',
        severity: 'info',
        actionable: true,
      });
    }
  }

  // 5. Length check
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount < 30) {
    findings.push({
      id: nextId(),
      type: 'too_short',
      message: `Draft is very short (${wordCount} words). LinkedIn posts typically perform better with more substance.`,
      severity: 'info',
      actionable: false,
    });
  }
  if (wordCount > 700) {
    findings.push({
      id: nextId(),
      type: 'too_long',
      message: `Draft is very long (${wordCount} words). LinkedIn has a character limit; consider trimming.`,
      severity: 'warning',
      actionable: true,
    });
  }

  // 6. No research when strategy requires it
  if (ctx.strategy?.goals && ctx.researchRecords.length === 0) {
    findings.push({
      id: nextId(),
      type: 'no_research',
      message: 'No research records are attached to this draft. Factual claims may be unsupported.',
      severity: 'info',
      actionable: true,
    });
  }

  return findings;
}

// ── AI-based review ──────────────────────────────────────────
async function runAIReview(
  content: string,
  ctx: ContentContext,
): Promise<ReviewFinding[]> {
  const systemPrompt = `You are a professional content quality reviewer for LinkedIn.
Your job is to identify specific, actionable issues in a LinkedIn draft.

Do NOT provide:
- Fake percentage scores (e.g. "97% quality")
- Generic praise
- Viral potential estimates
- Guaranteed engagement predictions

DO provide:
- Specific, honest findings about the draft
- Actionable issues the user should address before publishing
- Each finding must have: type, message, severity (error/warning/info)

Return ONLY a JSON array of findings. No other text.
Example:
[
  {"type": "unsupported_claim", "message": "The claim about 10x productivity has no supporting evidence.", "severity": "error"},
  {"type": "generic_phrasing", "message": "The phrase 'game-changer' is overused. Consider a more specific description.", "severity": "warning"}
]`;

  const userPrompt = `Review this LinkedIn draft:

---
${content}
---

Context about the author:
- Positioning: ${ctx.profile?.positioning ?? 'not specified'}
- Target audience: ${ctx.idea?.targetAudience ?? ctx.profile?.targetAudience ?? 'not specified'}
- Content pillar: ${ctx.pillar?.name ?? 'not specified'}
- Has attached research: ${ctx.researchRecords.length > 0 ? 'yes' : 'no'}
- Has supporting knowledge: ${ctx.knowledgeEntries.length > 0 ? 'yes' : 'no'}

Check for:
1. Unsupported or fabricated claims
2. Generic or vague phrasing (e.g. "game-changer", "revolutionary", "unlock your potential")
3. Misleading statements
4. Poor structure or readability
5. Missing or weak call to action
6. Audience mismatch
7. Overused or irrelevant hashtags
8. Excessive generalization
9. Content that overstates results

Return findings as a JSON array.`;

  try {
    const result = await complete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      maxTokens: 1000,
    });

    // Parse JSON from response
    const jsonMatch = result.content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const raw = JSON.parse(jsonMatch[0]) as Array<{
      type: string;
      message: string;
      severity?: string;
    }>;

    return raw.map((item, i) => ({
      id: `ai-${i}`,
      type: item.type ?? 'general',
      message: item.message ?? '',
      severity: (['error', 'warning', 'info'].includes(item.severity ?? '')
        ? item.severity
        : 'info') as FindingSeverity,
      actionable: true,
    }));
  } catch {
    return [];
  }
}

// ── Public: runQualityReview() ───────────────────────────────
export async function runQualityReview(
  content: string,
  ctx: ContentContext,
  previousDraftPreviews: string[] = [],
): Promise<QualityReviewResult> {
  const ruleFindings = runRuleBasedChecks(content, ctx, previousDraftPreviews);

  let aiFindings: ReviewFinding[] = [];
  let provider = 'rule-based';
  let model = 'n/a';
  let fallbackUsed = false;

  // Only run AI review if a provider is configured
  try {
    const aiResult = await complete({
      messages: [{ role: 'user', content: 'test' }],
      maxTokens: 1,
    });
    provider = aiResult.provider;
    model = aiResult.model;
    fallbackUsed = aiResult.fallbackUsed;

    aiFindings = await runAIReview(content, ctx);
  } catch {
    // AI not configured - rule-based only, that's fine
  }

  return {
    findings: [...ruleFindings, ...aiFindings],
    provider,
    model,
    fallbackUsed,
    reviewedAt: new Date(),
  };
}
