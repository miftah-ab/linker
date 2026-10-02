'use client';

// src/app/app/page.tsx — LINKER Dashboard Overview

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/supabase/auth-client';
import {
  NotebookPen,
  Lightbulb,
  PenLine,
  FolderKanban,
} from 'lucide-react';

interface DashboardStats {
  projects: number;
  journalEntries: number;
  ideas: number;
  drafts: number;
  approvedDrafts: number;
  knowledgeEntries: number;
  contentEligibleEntries: number;
}

interface RecentIdea {
  id: string;
  title: string;
  status: string;
  priority: number;
  pillar: { name: string; color: string } | null;
  createdAt: string;
}

interface RecentDraft {
  id: string;
  content: string;
  status: string;
  idea: { title: string } | null;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  SAVED:       { label: 'Saved',       color: '#64748B', bg: 'var(--color-surface-muted)' },
  IN_REVIEW:   { label: 'In Review',   color: '#D97706', bg: '#FFFBEB' },
  APPROVED:    { label: 'Approved',    color: '#16A34A', bg: '#F0FDF4' },
  CONVERTED:   { label: 'Converted',   color: '#2563EB', bg: '#EFF6FF' },
  DRAFT:       { label: 'Draft',       color: '#64748B', bg: 'var(--color-surface-muted)' },
  PUBLISHED:   { label: 'Published',   color: '#7C3AED', bg: '#F5F3FF' },
  SCHEDULED:   { label: 'Scheduled',   color: '#2563EB', bg: '#EFF6FF' },
};

const QUICK_ACTIONS = [
  { href: '/app/journal',  label: 'New Journal Entry', description: 'Document work as it happens', icon: <NotebookPen size={16} strokeWidth={1.75} />, accent: 'var(--color-accent-violet)' },
  { href: '/app/ideas',    label: 'Capture Idea',      description: 'Log a content idea',         icon: <Lightbulb size={16} strokeWidth={1.75} />,    accent: 'var(--color-warning)' },
  { href: '/app/studio',   label: 'Write a Draft',     description: 'Open Content Studio',        icon: <PenLine size={16} strokeWidth={1.75} />,      accent: 'var(--color-primary)' },
  { href: '/app/projects', label: 'Add Project',       description: 'Document a real project',    icon: <FolderKanban size={16} strokeWidth={1.75} />, accent: 'var(--color-success)' },
];


function SkeletonBlock({ height = 80 }: { height?: number }) {
  return (
    <div
      className="skeleton"
      style={{ height, borderRadius: 'var(--radius-md)' }}
    />
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentIdeas, setRecentIdeas] = useState<RecentIdea[]>([]);
  const [recentDrafts, setRecentDrafts] = useState<RecentDraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/journal').then(r => r.json()),
      fetch('/api/ideas').then(r => r.json()),
      fetch('/api/studio').then(r => r.json()),
      fetch('/api/knowledge').then(r => r.json()),
    ]).then(([proj, jour, ideasData, draftsData, know]) => {
      const projects  = proj.projects  || [];
      const journal   = jour.entries   || [];
      const ideas     = ideasData.ideas || [];
      const drafts    = draftsData.drafts || [];
      const knowledge = know.entries   || [];

      setStats({
        projects: projects.length,
        journalEntries: journal.length,
        ideas: ideas.length,
        drafts: drafts.length,
        approvedDrafts: drafts.filter((d: RecentDraft) => d.status === 'APPROVED').length,
        knowledgeEntries: knowledge.length,
        contentEligibleEntries: journal.filter((j: { hasContentOpportunity: boolean }) => j.hasContentOpportunity).length,
      });
      setRecentIdeas(ideas.slice(0, 6));
      setRecentDrafts(drafts.slice(0, 4));
    }).catch(() => setStats(null)).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = session?.user?.name?.split(' ')[0] || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

      {/* ── Page header ── */}
      <div>
        <h1 className="page-title">
          {firstName ? `Good ${timeOfDay}, ${firstName}` : 'Workspace Overview'}
        </h1>
        <p className="page-description" style={{ marginTop: 'var(--space-1)' }}>
          Your professional content workspace. Document work, capture ideas, and publish intentionally.
        </p>
      </div>

      {/* ── Stats row ── */}
      {loading ? (
        <div className="stats-overview">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonBlock key={i} height={72} />)}
        </div>
      ) : stats ? (
        <div className="stats-overview">
          {[
            { label: 'Projects',      value: stats.projects,        href: '/app/projects' },
            { label: 'Journal',       value: stats.journalEntries,  href: '/app/journal' },
            { label: 'Ideas',         value: stats.ideas,           href: '/app/ideas' },
            { label: 'Drafts',        value: stats.drafts,          href: '/app/studio' },
            { label: 'Approved',      value: stats.approvedDrafts,  href: '/app/studio' },
            { label: 'Knowledge',     value: stats.knowledgeEntries,href: '/app/knowledge' },
          ].map(stat => (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-strong)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                }}
              >
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  marginBottom: 'var(--space-1)',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 'var(--font-weight-medium)',
                  letterSpacing: '0.02em',
                }}>
                  {stat.label}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {/* ── Quick actions ── */}
      <div>
        <div className="section-header">
          <span className="section-title">Quick Actions</span>
        </div>
        <div className="quick-actions-grid">
          {QUICK_ACTIONS.map(action => (
            <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  cursor: 'pointer',
                  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-strong)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-md)',
                  background: `color-mix(in srgb, ${action.accent} 12%, transparent)`,
                  color: action.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {action.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.01em',
                    marginBottom: 'var(--space-0_5)',
                  }}>
                    {action.label}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {action.description}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent activity: ideas + drafts ── */}
      <div className="activity-grid">
        {/* Recent Ideas */}
        <div>
          <div className="section-header">
            <span className="section-title">Recent Ideas</span>
            <Link href="/app/ideas" style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-medium)',
            }}>
              View all
            </Link>
          </div>

          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            {loading ? (
              <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[1, 2, 3].map(i => <SkeletonBlock key={i} height={40} />)}
              </div>
            ) : recentIdeas.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-10) var(--space-5)' }}>
                <Lightbulb size={36} strokeWidth={1.5} color="var(--color-text-muted)" style={{ margin: "0 auto var(--space-3)" }} />
                <p className="empty-state-title">No ideas yet</p>
                <p className="empty-state-description">Ideas give Linker context for writing relevant content.</p>
                <Link href="/app/ideas" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-2)' }}>Capture first idea</Link>
              </div>
            ) : (
              recentIdeas.map(idea => {
                const cfg = STATUS_CONFIG[idea.status];
                return (
                  <div key={idea.id} className="list-item">
                    <div className="list-item-content">
                      <div className="list-item-title">{idea.title}</div>
                      <div className="list-item-meta">
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                          fontSize: 'var(--font-size-xs)', color: cfg?.color || 'var(--color-text-muted)',
                        }}>
                          {cfg?.label || idea.status}
                        </span>
                        {idea.pillar && (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            · {idea.pillar.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-muted)',
                      flexShrink: 0,
                    }}>
                      P{idea.priority}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Drafts */}
        <div>
          <div className="section-header">
            <span className="section-title">Recent Drafts</span>
            <Link href="/app/studio" style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-medium)',
            }}>
              View all
            </Link>
          </div>

          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            {loading ? (
              <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[1, 2, 3].map(i => <SkeletonBlock key={i} height={60} />)}
              </div>
            ) : recentDrafts.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-10) var(--space-5)' }}>
                <PenLine size={36} strokeWidth={1.5} color="var(--color-text-muted)" style={{ margin: "0 auto var(--space-3)" }} />
                <p className="empty-state-title">No drafts yet</p>
                <p className="empty-state-description">Open Content Studio to generate your first AI-assisted draft.</p>
                <Link href="/app/studio" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-2)' }}>Open Studio</Link>
              </div>
            ) : (
              recentDrafts.map(draft => {
                const cfg = STATUS_CONFIG[draft.status];
                return (
                  <div key={draft.id} className="list-item" style={{ flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: cfg?.color || 'var(--color-text-muted)',
                          padding: '1px var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                          background: cfg?.bg || 'var(--color-surface-muted)',
                        }}>
                          {cfg?.label || draft.status}
                        </span>
                        {draft.idea && (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            {draft.idea.title}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                        {new Date(draft.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.5,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {draft.content.slice(0, 120)}…
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Integrity callout ── */}
      <div className="callout">
        <div className="callout-title">Linker&apos;s Core Principle</div>
        All content generated here is grounded in your documented work. The AI will never invent achievements, statistics, or results.
        You review and approve everything before it becomes public.
      </div>

    </div>
  );
}
