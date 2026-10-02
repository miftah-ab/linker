'use client';

// src/app/app/ideas/page.tsx
// LINKER - Content Ideas Board

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Lightbulb, Pencil, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Idea {
  id: string;
  title: string;
  description: string | null;
  source: string;
  targetAudience: string | null;
  purpose: string | null;
  evidence: string | null;
  priority: number;
  status: 'SAVED' | 'IN_REVIEW' | 'APPROVED' | 'CONVERTED' | 'ARCHIVED' | 'REJECTED';
  notes: string | null;
  pillar: { id: string; name: string; color: string } | null;
  project: { id: string; name: string } | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  SAVED: { label: 'Saved', bg: '#94A3B818', color: '#64748B' },
  IN_REVIEW: { label: 'In Review', bg: '#D9780618', color: '#D97806' },
  APPROVED: { label: 'Approved', bg: '#16A34A18', color: '#16A34A' },
  CONVERTED: { label: 'Converted', bg: '#2563EB18', color: '#2563EB' },
  ARCHIVED: { label: 'Archived', bg: '#94A3B818', color: '#94A3B8' },
  REJECTED: { label: 'Rejected', bg: '#DC262618', color: '#DC2626' },
};

const SOURCE_LABELS: Record<string, string> = {
  MANUAL: 'Manual', JOURNAL: 'Journal', KNOWLEDGE: 'Knowledge',
  PROJECT: 'Project', RESEARCH: 'Research', CONTENT_GAP: 'Content Gap',
  OBSERVATION: 'Observation',
};

const PURPOSE_LABELS: Record<string, string> = {
  teaching: 'Teaching', documenting: 'Documenting', 'problem-solution': 'Problem → Solution',
  'technical-decision': 'Technical Decision', observation: 'Observation', framework: 'Framework',
  research: 'Research', progress: 'Progress Update', question: 'Question', lesson: 'Lesson', tradeoff: 'Tradeoff',
};

const PRIORITY_LABELS: Record<number, string> = { 1: 'P1', 2: 'P2', 3: 'P3', 4: 'P4', 5: 'P5' };

const EMPTY_FORM = {
  title: '', description: '', pillarId: '', projectId: '', source: 'MANUAL',
  targetAudience: '', purpose: '', evidence: '', priority: '3', notes: '', status: 'SAVED',
};

export default function IdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editIdea, setEditIdea] = useState<Idea | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [pillars, setPillars] = useState<{ id: string; name: string; color: string }[]>([]);

  const loadIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/ideas?${params}`);
      if (res.ok) { const data = await res.json(); setIdeas(data.ideas || []); }
    } catch { /* handled */ }
    finally { setLoading(false); }
  }, [statusFilter, search]);

  useEffect(() => { loadIdeas(); }, [loadIdeas]);

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/strategy').then(r => r.json()),
    ]).then(([proj, strat]) => {
      setProjects(proj.projects || []);
      setPillars(strat.strategy?.pillars || []);
    }).catch(() => {});
  }, []);

  function openCreate() {
    setEditIdea(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(idea: Idea) {
    setEditIdea(idea);
    setForm({
      title: idea.title, description: idea.description || '',
      pillarId: idea.pillar?.id || '', projectId: idea.project?.id || '',
      source: idea.source, targetAudience: idea.targetAudience || '',
      purpose: idea.purpose || '', evidence: idea.evidence || '',
      priority: String(idea.priority), notes: idea.notes || '', status: idea.status,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, priority: parseInt(form.priority), pillarId: form.pillarId || null, projectId: form.projectId || null };
      if (editIdea) {
        await fetch(`/api/ideas/${editIdea.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        await fetch('/api/ideas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      setShowModal(false);
      loadIdeas();
    } catch { /* handled */ }
    finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/ideas/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    loadIdeas();
  }

  async function handleArchive(id: string) {
    await fetch(`/api/ideas/${id}`, { method: 'DELETE' });
    loadIdeas();
  }

  async function sendToStudio(idea: Idea) {
    // Mark as CONVERTED and open Studio with the idea pre-selected
    await fetch(`/api/ideas/${idea.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'CONVERTED' }) });
    router.push(`/app/studio?ideaId=${idea.id}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>Content Ideas</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Capture ideas for LinkedIn content grounded in your real work and expertise.
          </p>
        </div>
        <button id="create-idea-btn" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} strokeWidth={2.5} />
          Capture Idea
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <Search size={16} strokeWidth={1.75} aria-hidden="true" />
          <input className="input" placeholder="Search ideas…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search ideas" />
        </div>
        {['ALL', 'SAVED', 'IN_REVIEW', 'APPROVED', 'CONVERTED'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`filter-chip ${statusFilter === s ? 'filter-chip-active' : ''}`}
          >
            {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label}
          </button>
        ))}
      </div>

      {/* ── Ideas Board ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 'var(--space-4)' }}>
          {[1,2,3,4].map(i => <div key={i} className="card" style={{ height: 160, background: 'var(--color-surface-muted)' }} />)}
        </div>
      ) : ideas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-4)' }}>
          <Lightbulb size={48} strokeWidth={1.5} color="var(--color-text-muted)" style={{ margin: "0 auto var(--space-4)" }} />
          <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>No ideas yet</p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>Capture ideas from your real work, journal, and knowledge base.</p>
          <button className="btn btn-primary" onClick={openCreate}>Capture Your First Idea</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 'var(--space-4)' }}>
          {ideas.map(idea => {
            const sc = STATUS_CONFIG[idea.status];
            return (
              <div key={idea.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', flex: 1 }}>
                    <span style={{ padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', background: sc.bg, color: sc.color }}>{sc.label}</span>
                    {idea.pillar && (
                      <span style={{ padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', background: idea.pillar.color + '22', color: idea.pillar.color }}>{idea.pillar.name}</span>
                    )}
                    <span className={`priority-indicator priority-${idea.priority}`}>{PRIORITY_LABELS[idea.priority] || `P${idea.priority}`}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
                    <button className="btn btn-ghost" style={{ padding: 'var(--space-1)' }} onClick={() => openEdit(idea)} title="Edit">
                      <Pencil size={13} strokeWidth={2} />
                    </button>
                    <button className="btn btn-ghost" style={{ padding: 'var(--space-1)', color: 'var(--color-error)' }} onClick={() => handleArchive(idea.id)} title="Archive">
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>{idea.title}</h3>
                  {idea.description && (
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                      {idea.description.length > 120 ? idea.description.slice(0, 120) + '…' : idea.description}
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  {idea.purpose && <span>📋 {PURPOSE_LABELS[idea.purpose] || idea.purpose}</span>}
                  {idea.project && <span>📁 {idea.project.name}</span>}
                  <span>Source: {SOURCE_LABELS[idea.source] || idea.source}</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border)' }}>
                  {idea.status === 'SAVED' && (
                    <button className="btn btn-ghost" style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-2)' }} onClick={() => updateStatus(idea.id, 'IN_REVIEW')}>
                      Mark In Review
                    </button>
                  )}
                  {idea.status === 'IN_REVIEW' && (
                    <button className="btn btn-ghost" style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-2)' }} onClick={() => updateStatus(idea.id, 'APPROVED')}>
                      Approve
                    </button>
                  )}
                  {(idea.status === 'APPROVED' || idea.status === 'SAVED' || idea.status === 'IN_REVIEW') && (
                    <button id={`send-to-studio-${idea.id}`} className="btn btn-primary" style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-3)', marginLeft: 'auto' }} onClick={() => sendToStudio(idea)}>
                      Send to Studio →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>{editIdea ? 'Edit Idea' : 'Capture Idea'}</h3>
              <button className="btn btn-ghost" style={{ padding: 'var(--space-1)' }} onClick={() => setShowModal(false)}>
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="field">
                <label className="label">Idea Title *</label>
                <input id="idea-title-input" className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="What's the core insight or angle?" />
              </div>

              <div className="field">
                <label className="label">Description</label>
                <textarea className="textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Expand on the idea - what story would you tell? What's the hook?" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="field">
                  <label className="label">Content Purpose</label>
                  <select className="select" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}>
                    <option value="">Select purpose</option>
                    {Object.entries(PURPOSE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="label">Source</label>
                  <select className="select" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                    {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="field">
                  <label className="label">Content Pillar</label>
                  <select className="select" value={form.pillarId} onChange={e => setForm(f => ({ ...f, pillarId: e.target.value }))}>
                    <option value="">None</option>
                    {pillars.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="label">Related Project</label>
                  <select className="select" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                    <option value="">None</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="label">Target Audience</label>
                <input className="input" value={form.targetAudience} onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))} placeholder="e.g. Senior engineers navigating tech lead transitions" />
              </div>

              <div className="field">
                <label className="label">Evidence / Supporting Facts</label>
                <textarea className="textarea" rows={2} value={form.evidence} onChange={e => setForm(f => ({ ...f, evidence: e.target.value }))} placeholder="What real experience, data, or observation backs this idea?" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="field">
                  <label className="label">Priority</label>
                  <select className="select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>P{n} — {n === 1 ? 'Low' : n === 2 ? 'Below average' : n === 3 ? 'Medium' : n === 4 ? 'High' : 'Critical'}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="label">Status</label>
                  <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {Object.entries(STATUS_CONFIG).slice(0, 4).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-idea-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editIdea ? 'Update Idea' : 'Save Idea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
