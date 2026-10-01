'use client';

// src/app/app/journal/page.tsx
// LINKER - Project Journal

import React, { useEffect, useState, useCallback } from 'react';

interface Project {
  id: string;
  name: string;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  privacy: 'PRIVATE' | 'INTERNAL' | 'CONTENT_ELIGIBLE';
  hasContentOpportunity: boolean;
  contentNotes: string | null;
  evidence: string | null;
  entryDate: string;
  project: { id: string; name: string } | null;
  createdAt: string;
}

const PRIVACY_STYLES: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  PRIVATE: {
    bg: '#DC262618', color: '#DC2626', label: 'Private',
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  },
  INTERNAL: {
    bg: '#D9780618', color: '#D97806', label: 'Internal',
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  CONTENT_ELIGIBLE: {
    bg: '#2563EB18', color: '#2563EB', label: 'Content Eligible',
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
};

const EMPTY_FORM = {
  title: '', content: '', projectId: '', tags: '',
  privacy: 'PRIVATE', hasContentOpportunity: false, contentNotes: '', evidence: '',
  entryDate: new Date().toISOString().slice(0, 10),
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [privacyFilter, setPrivacyFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null);
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (privacyFilter !== 'ALL') params.set('privacy', privacyFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/journal?${params}`);
      if (res.ok) { const data = await res.json(); setEntries(data.entries || []); }
    } catch { /* handled */ }
    finally { setLoading(false); }
  }, [privacyFilter, search]);

  useEffect(() => { loadEntries(); }, [loadEntries]);
  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(d => setProjects(d.projects || [])).catch(() => {});
  }, []);

  function openCreate() {
    setEditEntry(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(e: JournalEntry) {
    setEditEntry(e);
    setForm({
      title: e.title, content: e.content, projectId: e.project?.id || '',
      tags: e.tags.join(', '), privacy: e.privacy,
      hasContentOpportunity: e.hasContentOpportunity,
      contentNotes: e.contentNotes || '', evidence: e.evidence || '',
      entryDate: e.entryDate.slice(0, 10),
    });
    setShowModal(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        projectId: form.projectId || null,
      };
      if (editEntry) {
        await fetch(`/api/journal/${editEntry.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        await fetch('/api/journal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      setShowModal(false);
      loadEntries();
    } catch { /* handled */ }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this journal entry? This cannot be undone.')) return;
    await fetch(`/api/journal/${id}`, { method: 'DELETE' });
    loadEntries();
    if (viewEntry?.id === id) setViewEntry(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
            Project Journal
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Document your real work process, decisions, and lessons. Private entries stay private until you choose to use them.
          </p>
        </div>
        <button id="create-journal-btn" className="btn btn-primary" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Entry
        </button>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <svg style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input className="form-input" style={{ paddingLeft: 'var(--space-8)' }} placeholder="Search entries…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['ALL', 'PRIVATE', 'INTERNAL', 'CONTENT_ELIGIBLE'].map(f => (
          <button key={f} onClick={() => setPrivacyFilter(f)} style={{
            padding: 'var(--space-1_5) var(--space-3)', borderRadius: 'var(--radius-full)',
            border: `1px solid ${privacyFilter === f ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: privacyFilter === f ? 'var(--color-primary)' : 'var(--color-surface)',
            color: privacyFilter === f ? 'white' : 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)',
            cursor: 'pointer', transition: 'all 0.15s ease',
          }}>
            {f === 'ALL' ? 'All' : f === 'CONTENT_ELIGIBLE' ? 'Content Eligible' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* ── Entry List ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3].map(i => <div key={i} className="card" style={{ height: 120, background: 'var(--color-surface-muted)' }} />)}
        </div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-4)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" style={{ margin: '0 auto var(--space-4)' }}>
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>No journal entries</p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>Start documenting what you build, learn, and observe. These become the source for authentic content.</p>
          <button className="btn btn-primary" onClick={openCreate}>Write Your First Entry</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {entries.map(entry => {
            const ps = PRIVACY_STYLES[entry.privacy];
            return (
              <div key={entry.id} className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onClick={() => setViewEntry(entry)}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ''}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)',
                        background: ps.bg, color: ps.color,
                      }}>
                        {ps.icon} {ps.label}
                      </span>
                      {entry.hasContentOpportunity && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)',
                          background: '#16A34A18', color: '#16A34A',
                        }}>
                          💡 Content Opportunity
                        </span>
                      )}
                      {entry.project && (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          · {entry.project.name}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
                      {entry.title}
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                      {entry.content.length > 160 ? entry.content.slice(0, 160) + '…' : entry.content}
                    </p>
                    {entry.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 'var(--space-1_5)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {entry.tags.map(t => (
                          <span key={t} style={{
                            padding: '1px var(--space-2)', borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--font-size-xs)', background: 'var(--color-surface-muted)',
                            color: 'var(--color-text-muted)', border: '1px solid var(--color-border)',
                          }}>#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)', flexShrink: 0 }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      {new Date(entry.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-ghost" style={{ padding: 'var(--space-1)' }} onClick={() => openEdit(entry)} title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="btn btn-ghost" style={{ padding: 'var(--space-1)', color: 'var(--color-error)' }} onClick={() => handleDelete(entry.id)} title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── View Entry Modal ── */}
      {viewEntry && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}
          onClick={e => { if (e.target === e.currentTarget) setViewEntry(null); }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', maxWidth: 680, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  {(() => { const ps = PRIVACY_STYLES[viewEntry.privacy]; return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', background: ps.bg, color: ps.color }}>
                      {ps.icon} {ps.label}
                    </span>
                  ); })()}
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {new Date(viewEntry.entryDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>{viewEntry.title}</h3>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-secondary" style={{ padding: 'var(--space-1_5) var(--space-3)', fontSize: 'var(--font-size-xs)' }} onClick={() => { setViewEntry(null); openEdit(viewEntry); }}>Edit</button>
                <button className="btn btn-ghost" style={{ padding: 'var(--space-1)' }} onClick={() => setViewEntry(null)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            {viewEntry.project && (
              <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Project: <strong>{viewEntry.project.name}</strong>
              </div>
            )}

            <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)', lineHeight: 'var(--line-height-relaxed)', whiteSpace: 'pre-wrap', marginBottom: 'var(--space-4)' }}>
              {viewEntry.content}
            </div>

            {viewEntry.evidence && (
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-info-bg)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)', borderLeft: '3px solid var(--color-info)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-info)', marginBottom: 'var(--space-1)' }}>Evidence</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{viewEntry.evidence}</div>
              </div>
            )}

            {viewEntry.hasContentOpportunity && viewEntry.contentNotes && (
              <div style={{ padding: 'var(--space-3)', background: '#16A34A10', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)', borderLeft: '3px solid #16A34A' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: '#16A34A', marginBottom: 'var(--space-1)' }}>💡 Content Opportunity</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{viewEntry.contentNotes}</div>
              </div>
            )}

            {viewEntry.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1_5)' }}>
                {viewEntry.tags.map(t => <span key={t} style={{ padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', background: 'var(--color-surface-muted)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>#{t}</span>)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Write/Edit Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', maxWidth: 680, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
                {editEntry ? 'Edit Entry' : 'New Journal Entry'}
              </h3>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ padding: 'var(--space-1)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-4)', alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Title *</label>
                  <input id="journal-title-input" className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="What happened today?" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={form.entryDate} onChange={e => setForm(f => ({ ...f, entryDate: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Privacy Level</label>
                  <select className="form-input" value={form.privacy} onChange={e => setForm(f => ({ ...f, privacy: e.target.value }))}>
                    <option value="PRIVATE">🔒 Private - never used without permission</option>
                    <option value="INTERNAL">👥 Internal - reference only</option>
                    <option value="CONTENT_ELIGIBLE">📡 Content Eligible - can inspire posts</option>
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
                <label className="form-label">Content</label>
                <textarea id="journal-content-input" className="form-textarea" rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required
                  placeholder="Describe what you built, decided, learned, or observed. Be specific. This is a private record of your real work." />
              </div>

              <div className="form-group">
                <label className="form-label">Evidence</label>
                <input className="form-input" value={form.evidence} onChange={e => setForm(f => ({ ...f, evidence: e.target.value }))} placeholder="Link, metric, or observation that supports this entry" />
              </div>

              <div className="form-group">
                <label className="form-label">Tags <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(comma-separated)</span></label>
                <input className="form-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g. architecture, lesson, mistake, breakthrough" />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
                <input id="content-opportunity-check" type="checkbox" checked={form.hasContentOpportunity} onChange={e => setForm(f => ({ ...f, hasContentOpportunity: e.target.checked }))} style={{ marginTop: 2 }} />
                <div>
                  <label htmlFor="content-opportunity-check" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                    💡 This entry has content opportunity potential
                  </label>
                  {form.hasContentOpportunity && (
                    <textarea className="form-textarea" rows={2} value={form.contentNotes} onChange={e => setForm(f => ({ ...f, contentNotes: e.target.value }))} placeholder="What kind of post could this inspire?" style={{ marginTop: 'var(--space-2)' }} />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-journal-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editEntry ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
