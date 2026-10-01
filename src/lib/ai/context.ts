// src/lib/ai/context.ts
// LINKER - AI Context Engine
// Retrieves relevant context for content generation based on the selected idea,
// pillar, project, knowledge base, journal, and strategy.
// Does NOT blindly dump the entire database into every prompt.

import { prisma } from '@/lib/prisma';

export interface ContentContext {
  profile: ProfileContext | null;
  strategy: StrategyContext | null;
  idea: IdeaContext | null;
  project: ProjectContext | null;
  pillar: PillarContext | null;
  knowledgeEntries: KnowledgeContext[];
  journalEntries: JournalContext[];
  researchRecords: ResearchContext[];
  previousDraftSummaries: PreviousDraftContext[];
  warnings: ContextWarning[];
}

export interface ProfileContext {
  name: string | null;
  headline: string | null;
  currentRole: string | null;
  targetAudience: string | null;
  positioning: string | null;
  writingStyle: string | null;
  tone: string | null;
  technicalDepth: string | null;
  useEmoji: boolean;
  useHashtags: boolean;
  hashtagCount: number;
  postLength: string | null;
  formality: string | null;
  preferredTopics: string[];
  topicsToAvoid: string[];
}

export interface StrategyContext {
  goals: string | null;
  targetAudience: string | null;
  preferredFormats: string[];
  tone: string | null;
  callToAction: string | null;
}

export interface IdeaContext {
  title: string;
  description: string | null;
  purpose: string | null;
  targetAudience: string | null;
  evidence: string | null;
  source: string;
}

export interface ProjectContext {
  name: string;
  description: string | null;
  techStack: string[];
  status: string;
  outcomes: string | null;
  outcomeStatus: string;
}

export interface PillarContext {
  name: string;
  description: string | null;
}

export interface KnowledgeContext {
  title: string;
  content: string;
  category: string | null;
  evidenceState: string;
  source: string | null;
}

export interface JournalContext {
  title: string;
  content: string;
  privacy: string;
  contentNotes: string | null;
  evidence: string | null;
  entryDate: Date;
}

export interface ResearchContext {
  topic: string;
  sourceTitle: string | null;
  keyPoints: string[];
  facts: string[];
  verificationState: string;
}

export interface PreviousDraftContext {
  contentPreview: string;
  purpose: string | null;
  publishedAt: Date | null;
  status: string;
}

export interface ContextWarning {
  type: 'missing_evidence' | 'unverified_outcome' | 'no_research' | 'ai_suggestion_used' | 'private_journal_used' | 'topics_to_avoid';
  message: string;
}

export interface ContextOptions {
  userId: string;
  ideaId?: string;
  projectId?: string;
  pillarId?: string;
  researchId?: string;
  maxKnowledgeEntries?: number;
  maxJournalEntries?: number;
  maxPreviousDrafts?: number;
}

export async function retrieveContentContext(
  options: ContextOptions,
): Promise<ContentContext> {
  const {
    userId,
    ideaId,
    projectId,
    pillarId,
    researchId,
    maxKnowledgeEntries = 5,
    maxJournalEntries = 3,
    maxPreviousDrafts = 5,
  } = options;

  const warnings: ContextWarning[] = [];

  // ── Profile ──────────────────────────────────────────────
  const profile = await prisma.linkerProfile.findUnique({
    where: { userId },
  });

  const profileCtx: ProfileContext | null = profile
    ? {
        name: profile.fullName,
        headline: profile.headline,
        currentRole: profile.currentRole,
        targetAudience: profile.targetAudience,
        positioning: profile.positioning,
        writingStyle: profile.writingStyle,
        tone: profile.tone,
        technicalDepth: profile.technicalDepth,
        useEmoji: profile.useEmoji,
        useHashtags: profile.useHashtags,
        hashtagCount: profile.hashtagCount,
        postLength: profile.postLength,
        formality: profile.formality,
        preferredTopics: profile.preferredTopics,
        topicsToAvoid: profile.topicsToAvoid,
      }
    : null;

  // ── Strategy ─────────────────────────────────────────────
  const strategy = await prisma.linkerStrategy.findUnique({
    where: { userId },
  });

  const strategyCtx: StrategyContext | null = strategy
    ? {
        goals: strategy.goals,
        targetAudience: strategy.targetAudience,
        preferredFormats: strategy.preferredFormats,
        tone: strategy.tone,
        callToAction: strategy.callToAction,
      }
    : null;

  // ── Idea ─────────────────────────────────────────────────
  let ideaCtx: IdeaContext | null = null;
  let resolvedProjectId = projectId;
  let resolvedPillarId = pillarId;

  if (ideaId) {
    const idea = await prisma.linkerIdea.findFirst({
      where: { id: ideaId, userId }, // enforce ownership
    });
    if (idea) {
      ideaCtx = {
        title: idea.title,
        description: idea.description,
        purpose: idea.purpose,
        targetAudience: idea.targetAudience,
        evidence: idea.evidence,
        source: idea.source,
      };
      if (!idea.evidence) {
        warnings.push({
          type: 'missing_evidence',
          message: 'This idea has no attached evidence. Consider adding supporting information.',
        });
      }
      if (!resolvedProjectId && idea.projectId) resolvedProjectId = idea.projectId;
      if (!resolvedPillarId && idea.pillarId) resolvedPillarId = idea.pillarId;
    }
  }

  // ── Project ──────────────────────────────────────────────
  let projectCtx: ProjectContext | null = null;
  if (resolvedProjectId) {
    const project = await prisma.linkerProject.findFirst({
      where: { id: resolvedProjectId, userId },
    });
    if (project) {
      projectCtx = {
        name: project.name,
        description: project.description,
        techStack: project.techStack,
        status: project.status,
        outcomes: project.outcomes,
        outcomeStatus: project.outcomeStatus,
      };
      if (project.outcomeStatus === 'UNVERIFIED' && project.outcomes) {
        warnings.push({
          type: 'unverified_outcome',
          message: `The project "${project.name}" has unverified outcomes. Do not present them as confirmed results.`,
        });
      }
    }
  }

  // ── Pillar ───────────────────────────────────────────────
  let pillarCtx: PillarContext | null = null;
  if (resolvedPillarId) {
    const pillar = await prisma.linkerContentPillar.findFirst({
      where: { id: resolvedPillarId, userId },
    });
    if (pillar) {
      pillarCtx = { name: pillar.name, description: pillar.description };
    }
  }

  // ── Knowledge Entries (relevant ones) ────────────────────
  const knowledgeWhere: Record<string, unknown> = { userId, isArchived: false };
  if (resolvedProjectId) knowledgeWhere.projectId = resolvedProjectId;
  if (resolvedPillarId) knowledgeWhere.relatedPillar = resolvedPillarId;

  const knowledge = await prisma.linkerKnowledgeEntry.findMany({
    where: knowledgeWhere,
    orderBy: [{ relevanceScore: 'desc' }, { updatedAt: 'desc' }],
    take: maxKnowledgeEntries,
  });

  const knowledgeCtx: KnowledgeContext[] = knowledge.map((k) => ({
    title: k.title,
    content: k.content,
    category: k.category,
    evidenceState: k.evidenceState,
    source: k.source,
  }));

  // ── Journal Entries (only CONTENT_ELIGIBLE) ──────────────
  const journalWhere: Record<string, unknown> = {
    userId,
    privacy: 'CONTENT_ELIGIBLE',
  };
  if (resolvedProjectId) journalWhere.projectId = resolvedProjectId;

  const journalEntries = await prisma.linkerJournalEntry.findMany({
    where: journalWhere,
    orderBy: { entryDate: 'desc' },
    take: maxJournalEntries,
  });

  const journalCtx: JournalContext[] = journalEntries.map((j) => ({
    title: j.title,
    content: j.content,
    privacy: j.privacy,
    contentNotes: j.contentNotes,
    evidence: j.evidence,
    entryDate: j.entryDate,
  }));

  // ── Research ─────────────────────────────────────────────
  let researchCtx: ResearchContext[] = [];
  if (researchId) {
    const record = await prisma.linkerResearchRecord.findFirst({
      where: { id: researchId, userId },
    });
    if (record) {
      researchCtx = [
        {
          topic: record.topic,
          sourceTitle: record.sourceTitle,
          keyPoints: record.keyPoints,
          facts: record.facts,
          verificationState: record.verificationState,
        },
      ];
    }
  }

  if (researchCtx.length === 0 && strategyCtx?.goals) {
    warnings.push({
      type: 'no_research',
      message: 'No research record is attached to this draft. Claims may lack external support.',
    });
  }

  // ── Previous drafts (for deduplication) ──────────────────
  const previousDrafts = await prisma.linkerDraft.findMany({
    where: {
      userId,
      status: { in: ['PUBLISHED', 'APPROVED', 'SCHEDULED'] },
    },
    orderBy: { updatedAt: 'desc' },
    take: maxPreviousDrafts,
    select: {
      content: true,
      purpose: true,
      publishedAt: true,
      status: true,
    },
  });

  const previousDraftCtx: PreviousDraftContext[] = previousDrafts.map((d) => ({
    contentPreview: d.content.slice(0, 200),
    purpose: d.purpose,
    publishedAt: d.publishedAt,
    status: d.status,
  }));

  // ── Topics to avoid check ────────────────────────────────
  if (profileCtx?.topicsToAvoid && profileCtx.topicsToAvoid.length > 0 && ideaCtx) {
    const ideaText = `${ideaCtx.title} ${ideaCtx.description ?? ''}`.toLowerCase();
    const match = profileCtx.topicsToAvoid.find((t) =>
      ideaText.includes(t.toLowerCase()),
    );
    if (match) {
      warnings.push({
        type: 'topics_to_avoid',
        message: `This idea may touch on "${match}", which you have listed as a topic to avoid.`,
      });
    }
  }

  return {
    profile: profileCtx,
    strategy: strategyCtx,
    idea: ideaCtx,
    project: projectCtx,
    pillar: pillarCtx,
    knowledgeEntries: knowledgeCtx,
    journalEntries: journalCtx,
    researchRecords: researchCtx,
    previousDraftSummaries: previousDraftCtx,
    warnings,
  };
}

// ── Build system prompt from context ─────────────────────────
export function buildDraftSystemPrompt(ctx: ContentContext): string {
  const lines: string[] = [];

  lines.push(`You are a professional content writing assistant for LinkedIn.`);
  lines.push(`Your role is to help a professional create authentic, credible, and strategically aligned LinkedIn content.`);
  lines.push('');
  lines.push(`IMPORTANT RULES:`);
  lines.push(`- NEVER invent personal stories, employment history, achievements, metrics, or results.`);
  lines.push(`- NEVER fabricate sources, statistics, quotes, or research.`);
  lines.push(`- ONLY use information provided in the context below.`);
  lines.push(`- If something is unverified, do not present it as a confirmed fact.`);
  lines.push(`- Flag any claims that the user should verify before publishing.`);
  lines.push('');

  if (ctx.profile) {
    lines.push(`## AUTHOR PROFILE`);
    if (ctx.profile.name) lines.push(`Name: ${ctx.profile.name}`);
    if (ctx.profile.headline) lines.push(`Headline: ${ctx.profile.headline}`);
    if (ctx.profile.currentRole) lines.push(`Role: ${ctx.profile.currentRole}`);
    if (ctx.profile.targetAudience) lines.push(`Target audience: ${ctx.profile.targetAudience}`);
    if (ctx.profile.positioning) lines.push(`Positioning: ${ctx.profile.positioning}`);
    lines.push('');
  }

  if (ctx.profile) {
    lines.push(`## VOICE & STYLE`);
    if (ctx.profile.tone) lines.push(`Tone: ${ctx.profile.tone}`);
    if (ctx.profile.formality) lines.push(`Formality: ${ctx.profile.formality}`);
    if (ctx.profile.writingStyle) lines.push(`Writing style: ${ctx.profile.writingStyle}`);
    if (ctx.profile.technicalDepth) lines.push(`Technical depth: ${ctx.profile.technicalDepth}`);
    if (ctx.profile.postLength) lines.push(`Post length: ${ctx.profile.postLength}`);
    lines.push(`Use emoji: ${ctx.profile.useEmoji ? 'yes' : 'no'}`);
    lines.push(`Use hashtags: ${ctx.profile.useHashtags ? `yes (${ctx.profile.hashtagCount} max)` : 'no'}`);
    if (ctx.profile.topicsToAvoid.length > 0) {
      lines.push(`Topics to avoid: ${ctx.profile.topicsToAvoid.join(', ')}`);
    }
    lines.push('');
  }

  if (ctx.strategy) {
    lines.push(`## CONTENT STRATEGY`);
    if (ctx.strategy.goals) lines.push(`Goals: ${ctx.strategy.goals}`);
    if (ctx.strategy.callToAction) lines.push(`Call to action preference: ${ctx.strategy.callToAction}`);
    lines.push('');
  }

  if (ctx.pillar) {
    lines.push(`## CONTENT PILLAR`);
    lines.push(`Pillar: ${ctx.pillar.name}`);
    if (ctx.pillar.description) lines.push(`Description: ${ctx.pillar.description}`);
    lines.push('');
  }

  if (ctx.idea) {
    lines.push(`## CONTENT IDEA`);
    lines.push(`Title: ${ctx.idea.title}`);
    if (ctx.idea.description) lines.push(`Description: ${ctx.idea.description}`);
    if (ctx.idea.purpose) lines.push(`Purpose: ${ctx.idea.purpose}`);
    if (ctx.idea.targetAudience) lines.push(`Target audience: ${ctx.idea.targetAudience}`);
    if (ctx.idea.evidence) lines.push(`Evidence: ${ctx.idea.evidence}`);
    lines.push('');
  }

  if (ctx.project) {
    lines.push(`## RELATED PROJECT`);
    lines.push(`Project: ${ctx.project.name} (${ctx.project.status})`);
    if (ctx.project.description) lines.push(`Description: ${ctx.project.description}`);
    if (ctx.project.techStack.length > 0) lines.push(`Tech stack: ${ctx.project.techStack.join(', ')}`);
    if (ctx.project.outcomes) {
      lines.push(`Outcomes (${ctx.project.outcomeStatus}): ${ctx.project.outcomes}`);
      if (ctx.project.outcomeStatus === 'UNVERIFIED') {
        lines.push(`NOTE: These outcomes are UNVERIFIED. Do NOT present them as confirmed results.`);
      }
    }
    lines.push('');
  }

  if (ctx.knowledgeEntries.length > 0) {
    lines.push(`## RELEVANT KNOWLEDGE`);
    ctx.knowledgeEntries.forEach((k) => {
      lines.push(`- [${k.evidenceState}] ${k.title}: ${k.content.slice(0, 300)}`);
      if (k.source) lines.push(`  Source: ${k.source}`);
    });
    lines.push('');
  }

  if (ctx.journalEntries.length > 0) {
    lines.push(`## JOURNAL ENTRIES (real experiences)`);
    ctx.journalEntries.forEach((j) => {
      lines.push(`- ${j.title}: ${j.content.slice(0, 400)}`);
      if (j.contentNotes) lines.push(`  Content note: ${j.contentNotes}`);
    });
    lines.push('');
  }

  if (ctx.researchRecords.length > 0) {
    lines.push(`## RESEARCH`);
    ctx.researchRecords.forEach((r) => {
      lines.push(`Topic: ${r.topic} [${r.verificationState}]`);
      if (r.sourceTitle) lines.push(`Source: ${r.sourceTitle}`);
      if (r.facts.length > 0) lines.push(`Facts: ${r.facts.join('; ')}`);
      if (r.keyPoints.length > 0) lines.push(`Key points: ${r.keyPoints.join('; ')}`);
    });
    lines.push('');
  }

  if (ctx.previousDraftSummaries.length > 0) {
    lines.push(`## PREVIOUS CONTENT (avoid repetition)`);
    ctx.previousDraftSummaries.forEach((d) => {
      lines.push(`- [${d.status}] ${d.contentPreview}...`);
    });
    lines.push('');
    lines.push(`Avoid opening with the same phrases or structures as the above.`);
    lines.push('');
  }

  if (ctx.warnings.length > 0) {
    lines.push(`## IMPORTANT WARNINGS FOR THIS DRAFT`);
    ctx.warnings.forEach((w) => lines.push(`⚠ ${w.message}`));
    lines.push('');
  }

  lines.push(`Now write a LinkedIn post based on the above context. Do not invent anything not provided above.`);
  lines.push(`At the end of your response, include a JSON block like this:`);
  lines.push('```json');
  lines.push('{"claimsToReview": ["list any claims the user should verify before publishing"]}');
  lines.push('```');

  return lines.join('\n');
}
