'use client';

// src/app/app/ideas/page.tsx
// LINKER - Content Ideas Board

import React, { useEffect, useState, useCallback } from 'react';
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

const PRIORITIES = ['', '🔴', '🟠', '🟡', '🟢', '🔵'];

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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Capture Idea
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <svg style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="form-input" style={{ paddingLeft: 'var(--space-8)' }} placeholder="Search ideas…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['ALL', 'SAVED', 'IN_REVIEW', 'APPROVED', 'CONVERTED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: 'var(--space-1_5) var(--space-3)', borderRadius: 'var(--radius-full)',
            border: `1px solid ${statusFilter === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: statusFilter === s ? 'var(--color-primary)' : 'var(--color-surface)',
            color: statusFilter === s ? 'white' : 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)',
            cursor: 'pointer', transition: 'all 0.15s ease',
          }}>
            {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label}
          </button>
        ))}
      </div>

      {/* ── Ideas Board ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {[1,2,3,4].map(i => <div key={i} className="card" style={{ height: 160, background: 'var(--color-surface-muted)' }} />)}
        </div>
      ) : ideas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-4)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" style={{ margin: '0 auto var(--space-4)' }}>
            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4.5 12.36V17a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-2.64A7 7 0 0 0 12 2z"/>
          </svg>
          <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>No ideas yet</p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>Capture ideas from your real work, journal, and knowledge base.</p>
          <button className="btn btn-primary" onClick={openCreate}>Capture Your First Idea</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
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
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{PRIORITIES[idea.priority]} P{idea.priority}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
                    <button className="btn btn-ghost" style={{ padding: 'var(--space-1)' }} onClick={() => openEdit(idea)} title="Edit">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="btn btn-ghost" style={{ padding: 'var(--space-1)', color: 'var(--color-error)' }} onClick={() => handleArchive(idea.id)} title="Archive">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
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
                      ✓ Approve
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Idea Title *</label>
                <input id="idea-title-input" className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="What's the core insight or angle?" />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Expand on the idea - what story would you tell? What's the hook?" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Content Purpose</label>
                  <select className="form-input" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}>
                    <option value=""> - Select purpose - </option>
                    {Object.entries(PURPOSE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Source</label>
                  <select className="form-input" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                    {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Content Pillar</label>
                  <select className="form-input" value={form.pillarId} onChange={e => setForm(f => ({ ...f, pillarId: e.target.value }))}>
                    <option value=""> - None - </option>
                    {pillars.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Related Project</label>
                  <select className="form-input" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                    <option value=""> - None - </option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <input className="form-input" value={form.targetAudience} onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))} placeholder="e.g. Senior engineers navigating tech lead transitions" />
              </div>

              <div className="form-group">
                <label className="form-label">Evidence / Supporting Facts</label>
                <textarea className="form-textarea" rows={2} value={form.evidence} onChange={e => setForm(f => ({ ...f, evidence: e.target.value }))} placeholder="What real experience, data, or observation backs this idea?" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Priority (1=low, 5=high)</label>
                  <select className="form-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{PRIORITIES[n]} {n}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
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
