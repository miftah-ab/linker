'use client';

// src/app/app/knowledge/page.tsx
// LINKER — Knowledge Base: Grounding Assets for AI Content

import React, { useEffect, useState } from 'react';

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  evidenceState: string;
  tags: string[];
  source?: string | null;
  createdAt: string;
}

export default function KnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  // Form state for new entry
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('ARCHITECTURE');
  const [evidenceState, setEvidenceState] = useState('CONFIRMED');
  const [tagsInput, setTagsInput] = useState('');
  const [source, setSource] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadEntries() {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/knowledge?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.error('Failed to load knowledge:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, [categoryFilter, search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category,
          evidenceState,
          tags,
          source,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setTitle('');
        setContent('');
        setTagsInput('');
        setSource('');
        loadEntries();
      }
    } catch (err) {
      console.error('Failed to create entry:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this knowledge asset?')) return;
    try {
      await fetch(`/api/knowledge?id=${id}`, { method: 'DELETE' });
      loadEntries();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  }

  const getBadgeForEvidence = (state: string) => {
    switch (state) {
      case 'CONFIRMED':
        return <span className="badge badge-success">Confirmed Fact</span>;
      case 'AI_SUGGESTION':
        return <span className="badge badge-warning">AI Suggestion</span>;
      default:
        return <span className="badge badge-neutral">User Stated</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ── Header & Action ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
            Knowledge Base
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            Your repository of real architectural decisions, case studies, and learnings used to ground all AI drafts.
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Knowledge Asset</span>
        </button>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="card" style={{ padding: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <input
              type="search"
              className="input"
              placeholder="Search concepts, frameworks, metrics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '200px' }}>
            <select
              className="select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="ARCHITECTURE">Architecture & Infra</option>
              <option value="LEADERSHIP">Engineering Leadership</option>
              <option value="INCIDENT">Postmortems & Incidents</option>
              <option value="TECHNIQUE">Techniques & Patterns</option>
              <option value="OPINION">Strong Opinions</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Knowledge Grid ── */}
      {loading ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading knowledge base...
        </div>
      ) : entries.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            No knowledge entries found
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', maxWidth: '440px', margin: '0 auto var(--space-4)' }}>
            Start building your knowledge foundation. When you draft in Studio, Linker cites these real assets so you never write hallucinated claims.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
            Add First Entry
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {entries.map((item) => (
            <div key={item.id} className="card card-hoverable" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                <div style={{ minWidth: 0, paddingRight: 'var(--space-2)' }}>
                  <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {item.category} • Added {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {getBadgeForEvidence(item.evidenceState)}
              </div>

              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)', flex: 1, whiteSpace: 'pre-wrap' }}>
                {item.content.length > 280 ? `${item.content.slice(0, 280)}...` : item.content}
              </div>

              {item.tags && item.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 'var(--space-1_5)', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
                  {item.tags.map((tag) => (
                    <span key={tag} className="badge badge-neutral" style={{ fontSize: '11px' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal for New Knowledge Asset ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <h3 className="card-title">Add Knowledge Asset</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon-sm">✕</button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="field">
                <label className="label">Title / Topic Name</label>
                <input
                  required
                  type="text"
                  className="input"
                  placeholder="e.g. Migration from monolithic Postgres to sharded CockroachDB"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="field">
                  <label className="label">Category</label>
                  <select
                    className="select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="ARCHITECTURE">Architecture & Infra</option>
                    <option value="LEADERSHIP">Engineering Leadership</option>
                    <option value="INCIDENT">Postmortems & Incidents</option>
                    <option value="TECHNIQUE">Techniques & Patterns</option>
                    <option value="OPINION">Strong Opinions</option>
                  </select>
                </div>

                <div className="field">
                  <label className="label">Evidence Level</label>
                  <select
                    className="select"
                    value={evidenceState}
                    onChange={(e) => setEvidenceState(e.target.value)}
                  >
                    <option value="CONFIRMED">Confirmed Fact / Proven Metric</option>
                    <option value="USER_ENTERED">Personal Anecdote</option>
                    <option value="AI_SUGGESTION">Hypothesis / Work in Progress</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="label">Detailed Content & Specifics</label>
                <textarea
                  required
                  rows={5}
                  className="textarea"
                  placeholder="Explain what happened, key metrics (e.g. p99 dropped from 400ms to 42ms), trade-offs considered, and what failed along the way."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="databases, distributed-systems, latency"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label">Source / Reference (Optional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Internal benchmark report, commit hash, or design doc link"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : 'Save Knowledge Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
