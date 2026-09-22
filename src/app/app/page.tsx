'use client';

// src/app/app/page.tsx
// LINKER — Main Workspace Overview Dashboard

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  draftsCount: number;
  inReviewCount: number;
  scheduledCount: number;
  publishedCount: number;
  knowledgeCount: number;
  ideasCount: number;
  recentDrafts: Array<{
    id: string;
    title: string;
    status: string;
    pillar?: { name: string };
    updatedAt: string;
  }>;
  upcomingScheduled: Array<{
    id: string;
    title: string;
    scheduledFor: string;
    status: string;
  }>;
}

export default function AppDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Handled with fallback
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="badge badge-success">Published</span>;
      case 'SCHEDULED':
        return <span className="badge badge-primary">Scheduled</span>;
      case 'IN_REVIEW':
        return <span className="badge badge-warning">In Review</span>;
      case 'APPROVED':
        return <span className="badge badge-success">Approved</span>;
      case 'NEEDS_CHANGES':
        return <span className="badge badge-error">Needs Changes</span>;
      default:
        return <span className="badge badge-neutral">Draft</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ── Top Welcome & Quick Actions ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
            Welcome to Linker
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Your real work turned into authentic LinkedIn authority.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2_5)' }}>
          <Link href="/app/journal" className="btn btn-secondary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <span>Log Work Note</span>
          </Link>
          <Link href="/app/ideas" className="btn btn-secondary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4.5 12.36V17a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-2.64A7 7 0 0 0 12 2z"/></svg>
            <span>Capture Idea</span>
          </Link>
          <Link href="/app/studio" className="btn btn-primary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>New Draft</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        <div className="card">
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Drafts
          </div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginTop: 'var(--space-2)' }}>
            {loading ? '-' : (stats?.draftsCount ?? 0)}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            In studio creation
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Scheduled
          </div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', marginTop: 'var(--space-2)' }}>
            {loading ? '-' : (stats?.scheduledCount ?? 0)}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            Ready to publish
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Published
          </div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)', marginTop: 'var(--space-2)' }}>
            {loading ? '-' : (stats?.publishedCount ?? 0)}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            Live on LinkedIn
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Knowledge Assets
          </div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginTop: 'var(--space-2)' }}>
            {loading ? '-' : (stats?.knowledgeCount ?? 0)}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            Verified facts & entries
          </div>
        </div>
      </div>

      {/* ── Main Two Column Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Recent Drafts */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Drafts</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                Posts currently in drafting or quality review
              </p>
            </div>
            <Link href="/app/studio" className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--font-size-xs)' }}>
              View all &rarr;
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Loading drafts...
            </div>
          ) : !stats?.recentDrafts?.length ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', backgroundColor: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
                No drafts yet
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                Ground your first post in your verified knowledge or project journal.
              </p>
              <Link href="/app/studio" className="btn btn-primary btn-sm">
                Create First Post
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {stats.recentDrafts.map((draft) => (
                <Link
                  key={draft.id}
                  href={`/app/studio/${draft.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    textDecoration: 'none',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  className="card-hoverable"
                >
                  <div style={{ minWidth: 0, paddingRight: 'var(--space-3)' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {draft.title || 'Untitled Draft'}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {draft.pillar?.name ? `${draft.pillar.name} • ` : ''}
                      Updated {new Date(draft.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>{getStatusBadge(draft.status)}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Queue & Strategic Balance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Publishing Queue</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Approved posts ready for official LinkedIn delivery
                </p>
              </div>
              <Link href="/app/calendar" className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--font-size-xs)' }}>
                Calendar &rarr;
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Loading queue...
              </div>
            ) : !stats?.upcomingScheduled?.length ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', backgroundColor: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                  No posts scheduled. Approve a draft in Studio to schedule.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {stats.upcomingScheduled.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-muted)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginTop: '2px' }}>
                        {new Date(item.scheduledFor).toLocaleString()}
                      </div>
                    </div>
                    <span className="badge badge-primary">Queued</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connected Workflow Guide */}
          <div className="card" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 5%, transparent), color-mix(in srgb, var(--color-surface) 95%, transparent))' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
              How to maintain authentic presence:
            </h4>
            <ol style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', paddingLeft: 'var(--space-4)', margin: 0, lineHeight: '1.8' }}>
              <li><strong>Record real breakthroughs</strong> in your Project Journal as they occur.</li>
              <li><strong>Verify facts</strong> in your Knowledge Base before prompting AI.</li>
              <li><strong>Draft in Studio</strong> with Groq Llama 3.3 for zero-fabrication writing.</li>
              <li><strong>Review quality warnings</strong> and approve before scheduling.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
