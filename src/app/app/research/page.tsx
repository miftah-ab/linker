'use client';

// src/app/app/research/page.tsx
// LINKER - Research Records

import React, { useEffect, useState, useCallback } from 'react';

interface ResearchRecord {
  id: string;
  topic: string;
  sourceTitle: string | null;
  sourceUrl: string | null;
  publicationDate: string | null;
  author: string | null;
  keyPoints: string[];
  facts: string[];
  opinions: string[];
  verificationState: 'VERIFIED' | 'UNVERIFIED' | 'NEEDS_REVIEW' | 'AI_GENERATED' | 'USER_PROVIDED';
  notes: string | null;
  createdAt: string;
}

const VERIFICATION_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  VERIFIED: { label: '✓ Verified', bg: '#16A34A18', color: '#16A34A' },
  UNVERIFIED: { label: '? Unverified', bg: '#D9780618', color: '#D97806' },
  NEEDS_REVIEW: { label: '⚠ Needs Review', bg: '#DC262618', color: '#DC2626' },
  AI_GENERATED: { label: '🤖 AI Generated', bg: '#7C3AED18', color: '#7C3AED' },
  USER_PROVIDED: { label: '👤 User Provided', bg: '#2563EB18', color: '#2563EB' },
};

const EMPTY_FORM = {
  topic: '', sourceTitle: '', sourceUrl: '', publicationDate: '', author: '',
  keyPoints: '', facts: '', opinions: '', verificationState: 'UNVERIFIED', notes: '',
};

export default function ResearchPage() {
  const [records, setRecords] = useState<ResearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verFilter, setVerFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<ResearchRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (verFilter !== 'ALL') params.set('verificationState', verFilter);
      const res = await fetch(`/api/research?${params}`);
      if (res.ok) { const data = await res.json(); setRecords(data.records || []); }
    } catch { /* handled */ }
    finally { setLoading(false); }
  }, [search, verFilter]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  function openCreate() { setEditRecord(null); setForm(EMPTY_FORM); setShowModal(true); }
  function openEdit(r: ResearchRecord) {
    setEditRecord(r);
    setForm({
      topic: r.topic, sourceTitle: r.sourceTitle || '', sourceUrl: r.sourceUrl || '',
      publicationDate: r.publicationDate ? r.publicationDate.slice(0, 10) : '', author: r.author || '',
      keyPoints: r.keyPoints.join('\n'), facts: r.facts.join('\n'), opinions: r.opinions.join('\n'),
      verificationState: r.verificationState, notes: r.notes || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        keyPoints: form.keyPoints.split('\n').map(s => s.trim()).filter(Boolean),
        facts: form.facts.split('\n').map(s => s.trim()).filter(Boolean),
        opinions: form.opinions.split('\n').map(s => s.trim()).filter(Boolean),
        publicationDate: form.publicationDate || null,
        sourceTitle: form.sourceTitle || null,
        sourceUrl: form.sourceUrl || null,
        author: form.author || null,
      };
      if (editRecord) {
        await fetch(`/api/research/${editRecord.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        await fetch('/api/research', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      setShowModal(false); loadRecords();
    } catch { /* handled */ }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this research record?')) return;
    await fetch(`/api/research/${id}`, { method: 'DELETE' });
    loadRecords();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>Research</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Document sources, facts, and observations that ground your content. Every claim must be traceable.
          </p>
        </div>
        <button id="add-research-btn" className="btn btn-primary" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Research
        </button>
      </div>

      {/* ── Warning ── */}
      <div style={{ padding: 'var(--space-3)', background: 'var(--color-warning-bg)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-warning)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
        <strong style={{ color: 'var(--color-warning)' }}>Integrity notice:</strong> Never log fabricated sources, unverified statistics, or made-up quotes. Linker will flag unverified claims when they are used in drafts.
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <svg style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="form-input" style={{ paddingLeft: 'var(--space-8)' }} placeholder="Search topics, sources…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['ALL', ...Object.keys(VERIFICATION_CONFIG)].map(s => (
          <button key={s} onClick={() => setVerFilter(s)} style={{
            padding: 'var(--space-1_5) var(--space-3)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)',
            border: `1px solid ${verFilter === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: verFilter === s ? 'var(--color-primary)' : 'var(--color-surface)',
            color: verFilter === s ? 'white' : 'var(--color-text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
          }}>{s === 'ALL' ? 'All' : VERIFICATION_CONFIG[s]?.label}</button>
        ))}
      </div>

      {/* ── Records List ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1,2,3].map(i => <div key={i} className="card" style={{ height: 100, background: 'var(--color-surface-muted)' }} />)}
        </div>
      ) : records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" style={{ margin: '0 auto var(--space-4)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>No research records</p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>Add sources, facts, and observations to ground your content.</p>
          <button className="btn btn-primary" onClick={openCreate}>Add Research Record</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {records.map(record => {
            const vc = VERIFICATION_CONFIG[record.verificationState];
            return (
              <div key={record.id} className="card" style={{ transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ''}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
                      <span style={{ padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', background: vc.bg, color: vc.color }}>{vc.label}</span>
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>{record.topic}</h3>
                    {record.sourceTitle && (
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                        Source: {record.sourceUrl ? <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>{record.sourceTitle}</a> : record.sourceTitle}
                        {record.author && ` · ${record.author}`}
                        {record.publicationDate && ` · ${new Date(record.publicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`}
                      </div>
                    )}
                    {record.keyPoints.length > 0 && (
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        <strong>Key points:</strong> {record.keyPoints.slice(0, 2).join(' · ')}
                        {record.keyPoints.length > 2 && ` +${record.keyPoints.length - 2} more`}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
                    <button className="btn btn-ghost" style={{ padding: 'var(--space-1)' }} onClick={() => openEdit(record)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="btn btn-ghost" style={{ padding: 'var(--space-1)', color: 'var(--color-error)' }} onClick={() => handleDelete(record.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                    </button>
                  </div>
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
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', maxWidth: 640, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>{editRecord ? 'Edit Research' : 'Add Research Record'}</h3>
              <button className="btn btn-ghost" style={{ padding: 'var(--space-1)' }} onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Topic *</label>
                <input id="research-topic-input" className="form-input" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} required placeholder="e.g. Impact of context window size on RAG performance" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Source Title</label>
                  <input className="form-input" value={form.sourceTitle} onChange={e => setForm(f => ({ ...f, sourceTitle: e.target.value }))} placeholder="Article or paper title" />
                </div>
                <div className="form-group">
                  <label className="form-label">Verification Status</label>
                  <select className="form-input" value={form.verificationState} onChange={e => setForm(f => ({ ...f, verificationState: e.target.value }))}>
                    {Object.entries(VERIFICATION_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Source URL</label>
                  <input className="form-input" type="url" value={form.sourceUrl} onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))} placeholder="https://…" />
                </div>
                <div className="form-group">
                  <label className="form-label">Author</label>
                  <input className="form-input" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Author name (if verified)" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Key Points <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(one per line)</span></label>
                <textarea className="form-textarea" rows={3} value={form.keyPoints} onChange={e => setForm(f => ({ ...f, keyPoints: e.target.value }))} placeholder="Main takeaways from this source" />
              </div>
              <div className="form-group">
                <label className="form-label">Facts <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(one per line - verified only)</span></label>
                <textarea className="form-textarea" rows={2} value={form.facts} onChange={e => setForm(f => ({ ...f, facts: e.target.value }))} placeholder="Specific, verifiable facts. Do not log unverified statistics." />
              </div>
              <div className="form-group">
                <label className="form-label">Opinions / Interpretations <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(one per line)</span></label>
                <textarea className="form-textarea" rows={2} value={form.opinions} onChange={e => setForm(f => ({ ...f, opinions: e.target.value }))} placeholder="Perspectives or interpretations - will be labeled as opinion, not fact" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional context, gaps, or what needs further verification" />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-research-btn" type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editRecord ? 'Update' : 'Save Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
