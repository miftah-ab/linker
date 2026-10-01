'use client';

// src/app/app/analytics/page.tsx
// LINKER - Analytics Overview

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  totalDrafts: number;
  publishedDrafts: number;
  approvedDrafts: number;
  totalIdeas: number;
  convertedIdeas: number;
  totalProjects: number;
  journalEntries: number;
  contentEligibleEntries: number;
  knowledgeEntries: number;
  aiRunsThisMonth: number;
  pillarBreakdown: { name: string; color: string; ideas: number; drafts: number }[];
}

function BarChart({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height: 6, background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 'var(--radius-full)', transition: 'width 0.6s ease' }} />
    </div>
  );
}

function StatCard({ label, value, sub, color, href }: { label: string; value: number | string; sub?: string; color: string; href?: string }) {
  const content = (
    <div className="card" style={{ borderTop: `3px solid ${color}`, transition: 'transform 0.15s, box-shadow 0.15s', cursor: href ? 'pointer' : 'default' }}
      onMouseEnter={e => { if (href) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; } }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
      <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color, marginBottom: 'var(--space-1)' }}>{value}</div>
      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>{label}</div>
      {sub && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>{sub}</div>}
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link> : content;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/journal').then(r => r.json()),
      fetch('/api/ideas').then(r => r.json()),
      fetch('/api/studio').then(r => r.json()),
      fetch('/api/knowledge').then(r => r.json()),
      fetch('/api/strategy').then(r => r.json()),
    ]).then(([proj, jour, ideasData, draftsData, know, strat]) => {
      const projects = proj.projects || [];
      const journal = jour.entries || [];
      const ideas = ideasData.ideas || [];
      const drafts = draftsData.drafts || [];
      const knowledge = know.entries || [];
      const pillars: { id: string; name: string; color: string }[] = strat.strategy?.pillars || [];

      const pillarBreakdown = pillars.map(p => ({
        name: p.name,
        color: p.color,
        ideas: ideas.filter((i: { pillar: { id: string } | null }) => i.pillar?.id === p.id).length,
        drafts: drafts.filter((d: { pillar: { id: string } | null }) => d.pillar?.id === p.id).length,
      }));

      setData({
        totalDrafts: drafts.length,
        publishedDrafts: drafts.filter((d: { status: string }) => d.status === 'PUBLISHED').length,
        approvedDrafts: drafts.filter((d: { status: string }) => d.status === 'APPROVED').length,
        totalIdeas: ideas.length,
        convertedIdeas: ideas.filter((i: { status: string }) => i.status === 'CONVERTED').length,
        totalProjects: projects.length,
        journalEntries: journal.length,
        contentEligibleEntries: journal.filter((j: { hasContentOpportunity: boolean }) => j.hasContentOpportunity).length,
        knowledgeEntries: knowledge.length,
        aiRunsThisMonth: 0, // would require a separate API
        pillarBreakdown,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading analytics…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>Analytics</h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Your content pipeline overview. No vanity metrics - only what matters to your workflow.
        </p>
      </div>

      {/* ── Content Pipeline ── */}
      <div>
        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>Content Pipeline</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
          <StatCard label="Total Drafts" value={data?.totalDrafts ?? 0} sub="all time" color="#2563EB" href="/app/studio" />
          <StatCard label="Approved" value={data?.approvedDrafts ?? 0} sub="ready to publish" color="#16A34A" href="/app/studio" />
          <StatCard label="Published" value={data?.publishedDrafts ?? 0} sub="on LinkedIn" color="#7C3AED" href="/app/studio" />
          <StatCard label="Ideas" value={data?.totalIdeas ?? 0} sub="captured" color="#D97706" href="/app/ideas" />
          <StatCard label="Converted" value={data?.convertedIdeas ?? 0} sub="ideas → drafts" color="#06B6D4" href="/app/ideas" />
        </div>
      </div>

      {/* ── Knowledge Base ── */}
      <div>
        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>Knowledge & Context</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
          <StatCard label="Projects" value={data?.totalProjects ?? 0} sub="documented" color="#16A34A" href="/app/projects" />
          <StatCard label="Journal Entries" value={data?.journalEntries ?? 0} sub="total" color="#7C3AED" href="/app/journal" />
          <StatCard label="Content Eligible" value={data?.contentEligibleEntries ?? 0} sub="journal entries" color="#D97706" href="/app/journal" />
          <StatCard label="Knowledge" value={data?.knowledgeEntries ?? 0} sub="base entries" color="#06B6D4" href="/app/knowledge" />
        </div>
      </div>

      {/* ── Conversion Funnel ── */}
      {data && (
        <div className="card">
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Content Funnel</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { label: 'Ideas captured', value: data.totalIdeas, color: '#D97706' },
              { label: 'Ideas converted to drafts', value: data.convertedIdeas, color: '#2563EB' },
              { label: 'Drafts approved', value: data.approvedDrafts, color: '#16A34A' },
              { label: 'Drafts published', value: data.publishedDrafts, color: '#7C3AED' },
            ].map(step => (
              <div key={step.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{step.label}</span>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: step.color }}>{step.value}</span>
                </div>
                <BarChart value={step.value} max={Math.max(data.totalIdeas, 1)} color={step.color} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Content Pillars ── */}
      {data?.pillarBreakdown && data.pillarBreakdown.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>By Content Pillar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {data.pillarBreakdown.map(pillar => (
              <div key={pillar.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: pillar.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{pillar.name}</span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{pillar.ideas} ideas · {pillar.drafts} drafts</span>
                  </div>
                  <BarChart value={pillar.ideas} max={Math.max(...data.pillarBreakdown.map(p => p.ideas), 1)} color={pillar.color} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Note ── */}
      <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-lg)', borderLeft: '3px solid var(--color-info)' }}>
        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-info)', marginBottom: 'var(--space-1)' }}>LinkedIn Engagement Metrics</div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          LinkedIn impression and engagement data will appear here once you connect your LinkedIn account and publish posts through Linker. Connect in <Link href="/app/integrations" style={{ color: 'var(--color-primary)' }}>Integrations</Link>.
        </div>
      </div>
    </div>
  );
}
