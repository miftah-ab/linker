-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EvidenceState" AS ENUM ('CONFIRMED', 'USER_PROVIDED', 'AI_SUGGESTION', 'UNVERIFIED', 'OUTDATED', 'NEEDS_REVIEW', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "OutcomeStatus" AS ENUM ('PLANNED', 'CLAIMED', 'VERIFIED', 'UNVERIFIED');

-- CreateEnum
CREATE TYPE "JournalPrivacy" AS ENUM ('PRIVATE', 'INTERNAL', 'CONTENT_ELIGIBLE');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('SAVED', 'IN_REVIEW', 'APPROVED', 'CONVERTED', 'ARCHIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IdeaSource" AS ENUM ('MANUAL', 'JOURNAL', 'KNOWLEDGE', 'PROJECT', 'RESEARCH', 'CONTENT_GAP', 'OBSERVATION');

-- CreateEnum
CREATE TYPE "ResearchVerificationState" AS ENUM ('VERIFIED', 'USER_PROVIDED', 'AI_INTERPRETATION', 'OPINION', 'UNVERIFIED_CLAIM', 'NEEDS_VERIFICATION');

-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'NEEDS_CHANGES', 'APPROVED', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "linker_users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "linker_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "linker_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "headline" TEXT,
    "currentRole" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "targetAudience" TEXT,
    "professionalGoals" TEXT,
    "positioning" TEXT,
    "values" TEXT,
    "writingStyle" TEXT,
    "tone" TEXT,
    "preferredTopics" TEXT[],
    "topicsToAvoid" TEXT[],
    "technicalDepth" TEXT DEFAULT 'intermediate',
    "useEmoji" BOOLEAN NOT NULL DEFAULT false,
    "useHashtags" BOOLEAN NOT NULL DEFAULT true,
    "hashtagCount" INTEGER NOT NULL DEFAULT 3,
    "postLength" TEXT DEFAULT 'medium',
    "formality" TEXT DEFAULT 'professional',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_identity_fields" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldValue" TEXT NOT NULL,
    "evidenceState" "EvidenceState" NOT NULL DEFAULT 'USER_PROVIDED',
    "source" TEXT,
    "notes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_identity_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_knowledge_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT[],
    "source" TEXT,
    "sourceUrl" TEXT,
    "evidenceState" "EvidenceState" NOT NULL DEFAULT 'USER_PROVIDED',
    "relevanceScore" INTEGER,
    "reviewDate" TIMESTAMP(3),
    "relatedPillar" TEXT,
    "projectId" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_knowledge_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "problemAddressed" TEXT,
    "targetUsers" TEXT,
    "techStack" TEXT[],
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNED',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "links" TEXT[],
    "outcomes" TEXT,
    "outcomeStatus" "OutcomeStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_project_milestones" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_project_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_journal_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "privacy" "JournalPrivacy" NOT NULL DEFAULT 'PRIVATE',
    "hasContentOpportunity" BOOLEAN NOT NULL DEFAULT false,
    "contentNotes" TEXT,
    "evidence" TEXT,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_strategies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "positioning" TEXT,
    "goals" TEXT,
    "targetAudience" TEXT,
    "postingFrequency" INTEGER,
    "preferredDays" TEXT[],
    "preferredTimes" TEXT[],
    "timezone" TEXT DEFAULT 'UTC',
    "preferredFormats" TEXT[],
    "preferredLength" TEXT DEFAULT 'medium',
    "tone" TEXT,
    "callToAction" TEXT,
    "researchRequired" BOOLEAN NOT NULL DEFAULT false,
    "topicsToAvoid" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_content_pillars" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "strategyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_content_pillars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_ideas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pillarId" TEXT,
    "projectId" TEXT,
    "journalEntryId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source" "IdeaSource" NOT NULL DEFAULT 'MANUAL',
    "targetAudience" TEXT,
    "purpose" TEXT,
    "evidence" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "status" "IdeaStatus" NOT NULL DEFAULT 'SAVED',
    "notes" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_research_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "sourceTitle" TEXT,
    "sourceUrl" TEXT,
    "publicationDate" TIMESTAMP(3),
    "author" TEXT,
    "keyPoints" TEXT[],
    "facts" TEXT[],
    "opinions" TEXT[],
    "relevantClaims" TEXT[],
    "verificationState" "ResearchVerificationState" NOT NULL DEFAULT 'UNVERIFIED_CLAIM',
    "notes" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_research_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ideaId" TEXT,
    "pillarId" TEXT,
    "projectId" TEXT,
    "researchId" TEXT,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "status" "DraftStatus" NOT NULL DEFAULT 'DRAFT',
    "purpose" TEXT,
    "targetAudience" TEXT,
    "contextUsed" JSONB,
    "aiModel" TEXT,
    "aiProvider" TEXT,
    "humanApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "timezone" TEXT,
    "publishedAt" TIMESTAMP(3),
    "linkedinPostId" TEXT,
    "failureReason" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_draft_versions" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "linker_draft_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_draft_reviews" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "findings" JSONB NOT NULL,
    "aiModel" TEXT,
    "aiProvider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "linker_draft_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_scheduled_posts" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "status" "DraftStatus" NOT NULL DEFAULT 'SCHEDULED',
    "idempotencyKey" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_scheduled_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_publishing_attempts" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "scheduledPostId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'linkedin',
    "status" TEXT NOT NULL,
    "providerResponse" JSONB,
    "linkedinPostId" TEXT,
    "errorMessage" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "linker_publishing_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_linkedin_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "linkedinId" TEXT,
    "displayName" TEXT,
    "profilePicture" TEXT,
    "scope" TEXT[],
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastVerifiedAt" TIMESTAMP(3),
    "disconnectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linker_linkedin_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_ai_runs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "runType" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER,
    "responseTokens" INTEGER,
    "durationMs" INTEGER,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "linker_ai_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linker_analytics_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "draftId" TEXT,
    "source" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "linker_analytics_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "linker_users_email_key" ON "linker_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "linker_accounts_provider_providerAccountId_key" ON "linker_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "linker_sessions_sessionToken_key" ON "linker_sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "linker_verification_tokens_token_key" ON "linker_verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "linker_verification_tokens_identifier_token_key" ON "linker_verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "linker_profiles_userId_key" ON "linker_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "linker_strategies_userId_key" ON "linker_strategies"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "linker_scheduled_posts_idempotencyKey_key" ON "linker_scheduled_posts"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "linker_publishing_attempts_idempotencyKey_key" ON "linker_publishing_attempts"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "linker_linkedin_connections_userId_key" ON "linker_linkedin_connections"("userId");

-- AddForeignKey
ALTER TABLE "linker_accounts" ADD CONSTRAINT "linker_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_sessions" ADD CONSTRAINT "linker_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_profiles" ADD CONSTRAINT "linker_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_identity_fields" ADD CONSTRAINT "linker_identity_fields_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_knowledge_entries" ADD CONSTRAINT "linker_knowledge_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_knowledge_entries" ADD CONSTRAINT "linker_knowledge_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "linker_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_projects" ADD CONSTRAINT "linker_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_project_milestones" ADD CONSTRAINT "linker_project_milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "linker_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_journal_entries" ADD CONSTRAINT "linker_journal_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_journal_entries" ADD CONSTRAINT "linker_journal_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "linker_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_strategies" ADD CONSTRAINT "linker_strategies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_content_pillars" ADD CONSTRAINT "linker_content_pillars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_content_pillars" ADD CONSTRAINT "linker_content_pillars_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "linker_strategies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_ideas" ADD CONSTRAINT "linker_ideas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_ideas" ADD CONSTRAINT "linker_ideas_pillarId_fkey" FOREIGN KEY ("pillarId") REFERENCES "linker_content_pillars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_ideas" ADD CONSTRAINT "linker_ideas_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "linker_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_ideas" ADD CONSTRAINT "linker_ideas_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "linker_journal_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_research_records" ADD CONSTRAINT "linker_research_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_drafts" ADD CONSTRAINT "linker_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_drafts" ADD CONSTRAINT "linker_drafts_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "linker_ideas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_drafts" ADD CONSTRAINT "linker_drafts_pillarId_fkey" FOREIGN KEY ("pillarId") REFERENCES "linker_content_pillars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_drafts" ADD CONSTRAINT "linker_drafts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "linker_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_drafts" ADD CONSTRAINT "linker_drafts_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "linker_research_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_draft_versions" ADD CONSTRAINT "linker_draft_versions_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "linker_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_draft_reviews" ADD CONSTRAINT "linker_draft_reviews_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "linker_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_scheduled_posts" ADD CONSTRAINT "linker_scheduled_posts_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "linker_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_publishing_attempts" ADD CONSTRAINT "linker_publishing_attempts_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "linker_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_publishing_attempts" ADD CONSTRAINT "linker_publishing_attempts_scheduledPostId_fkey" FOREIGN KEY ("scheduledPostId") REFERENCES "linker_scheduled_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_linkedin_connections" ADD CONSTRAINT "linker_linkedin_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_ai_runs" ADD CONSTRAINT "linker_ai_runs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linker_analytics_records" ADD CONSTRAINT "linker_analytics_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "linker_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

