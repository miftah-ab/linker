'use client';

// src/app/app/page.tsx - LINKER Dashboard / Overview

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/supabase/auth-client';

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

const QUICK_ACTIONS = [
  { href: '/app/journal', label: 'New Journal Entry', icon: '✏️', description: 'Document what you built today', color: '#7C3AED' },
  { href: '/app/ideas', label: 'Capture Idea', icon: '💡', description: 'Log a content idea while it is fresh', color: '#D97706' },
  { href: '/app/studio', label: 'Write a Draft', icon: '📝', description: 'Open Content Studio and create', color: '#2563EB' },
  { href: '/app/projects', label: 'Add Project', icon: '📁', description: 'Document a real project', color: '#16A34A' },
];

const STATUS_COLORS: Record<string, string> = {
  SAVED: '#64748B', IN_REVIEW: '#D97806', APPROVED: '#16A34A',
  CONVERTED: '#2563EB', DRAFT: '#64748B', PUBLISHED: '#7C3AED',
};

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
      const projects = proj.projects || [];
      const journal = jour.entries || [];
      const ideas = ideasData.ideas || [];
      const drafts = draftsData.drafts || [];
      const knowledge = know.entries || [];

      setStats({
        projects: projects.length,
        journalEntries: journal.length,
        ideas: ideas.length,
        drafts: drafts.length,
        approvedDrafts: drafts.filter((d: RecentDraft) => d.status === 'APPROVED').length,
        knowledgeEntries: knowledge.length,
        contentEligibleEntries: journal.filter((j: { hasContentOpportunity: boolean }) => j.hasContentOpportunity).length,
      });
      setRecentIdeas(ideas.slice(0, 5));
      setRecentDrafts(drafts.slice(0, 3));
    }).catch(() => setStats(null)).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = session?.user?.name?.split(' ')[0] || 'there';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* ── Hero Greeting ── */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent-violet) 100%)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.8, marginBottom: 'var(--space-2)' }}>Linker Workspace</p>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ fontSize: 'var(--font-size-base)', opacity: 0.85, maxWidth: 500 }}>
            Make your professional presence intentional. Document what you build, capture insights, and create grounded content.
          </p>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="card" style={{ height: 80, background: 'var(--color-surface-muted)' }} />)}
        </div>
      ) : stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
          {[
            { label: 'Projects', value: stats.projects, href: '/app/projects', color: '#16A34A', icon: '📁' },
            { label: 'Journal Entries', value: stats.journalEntries, href: '/app/journal', color: '#7C3AED', icon: '✏️' },
            { label: 'Content Ideas', value: stats.ideas, href: '/app/ideas', color: '#D97806', icon: '💡' },
            { label: 'Drafts', value: stats.drafts, href: '/app/studio', color: '#2563EB', icon: '📝' },
            { label: 'Approved', value: stats.approvedDrafts, href: '/app/studio', color: '#16A34A', icon: '✓' },
            { label: 'Knowledge', value: stats.knowledgeEntries, href: '/app/knowledge', color: '#06B6D4', icon: '🧠' },
          ].map(stat => (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ textAlign: 'center', transition: 'transform 0.15s, box-shadow 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                <div style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-1)' }}>{stat.icon}</div>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{stat.label}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
          {QUICK_ACTIONS.map(action => (
            <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', borderLeft: `3px solid ${action.color}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{action.icon}</div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>{action.label}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{action.description}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Recent Ideas */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>Recent Ideas</h3>
            <Link href="/app/ideas" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentIdeas.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No ideas yet. <Link href="/app/ideas" style={{ color: 'var(--color-primary)' }}>Capture your first →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {recentIdeas.map(idea => (
                <div key={idea.id} className="card" style={{ padding: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>{idea.title}</div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: STATUS_COLORS[idea.status] || 'var(--color-text-muted)' }}>{idea.status.replace('_', ' ')}</span>
                        {idea.pillar && <span style={{ fontSize: 'var(--font-size-xs)', color: idea.pillar.color }}>· {idea.pillar.name}</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>P{idea.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Drafts */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>Recent Drafts</h3>
            <Link href="/app/studio" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentDrafts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No drafts yet. <Link href="/app/studio" style={{ color: 'var(--color-primary)' }}>Open Studio →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {recentDrafts.map(draft => (
                <div key={draft.id} className="card" style={{ padding: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: STATUS_COLORS[draft.status] || 'var(--color-text-muted)', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {draft.status.replace('_', ' ')} {draft.idea && `· ${draft.idea.title}`}
                      </div>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                        {draft.content.slice(0, 100)}…
                      </p>
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                      {new Date(draft.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Integrity Note ── */}
      <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-lg)', borderLeft: '3px solid var(--color-primary)' }}>
        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--space-1)' }}>Linker&apos;s Core Principle</div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          All content generated here is grounded in your documented work. The AI will never invent achievements, statistics, or results. You review and approve everything before it becomes public.
        </div>
      </div>
    </div>
  );
}
