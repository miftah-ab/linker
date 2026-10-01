'use client';

// src/app/app/studio/page.tsx
// LINKER - Content Studio

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Idea {
  id: string;
  title: string;
  description: string | null;
  purpose: string | null;
  targetAudience: string | null;
  evidence: string | null;
  pillar: { id: string; name: string; color: string } | null;
  project: { id: string; name: string } | null;
}

interface Draft {
  id: string;
  title: string | null;
  content: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'NEEDS_CHANGES' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  purpose: string | null;
  targetAudience: string | null;
  idea: { id: string; title: string } | null;
  pillar: { id: string; name: string; color: string } | null;
  project: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  DRAFT: { label: 'Draft', bg: '#94A3B818', color: '#64748B' },
  IN_REVIEW: { label: 'In Review', bg: '#D9780618', color: '#D97806' },
  NEEDS_CHANGES: { label: 'Needs Changes', bg: '#DC262618', color: '#DC2626' },
  APPROVED: { label: 'Approved', bg: '#16A34A18', color: '#16A34A' },
  SCHEDULED: { label: 'Scheduled', bg: '#2563EB18', color: '#2563EB' },
  PUBLISHED: { label: 'Published', bg: '#7C3AED18', color: '#7C3AED' },
  FAILED: { label: 'Failed', bg: '#DC262618', color: '#DC2626' },
};

function StudioContent() {
  const searchParams = useSearchParams();
  const preselectedIdeaId = searchParams.get('ideaId');

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'list' | 'editor'>('list');
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genWarnings, setGenWarnings] = useState<string[]>([]);
  const [contextSummary, setContextSummary] = useState<string | null>(null);

  const [genForm, setGenForm] = useState({
    ideaId: preselectedIdeaId || '',
    purpose: '',
    targetAudience: '',
    tone: '',
    additionalInstructions: '',
  });

  const loadDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/studio');
      if (res.ok) { const data = await res.json(); setDrafts(data.drafts || []); }
    } catch { /* handled */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDrafts(); }, [loadDrafts]);

  useEffect(() => {
    fetch('/api/ideas?status=APPROVED').then(r => r.json()).then(data => setIdeas(data.ideas || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (preselectedIdeaId) {
      setActiveView('editor');
      setSelectedDraft(null);
      setGenForm(f => ({ ...f, ideaId: preselectedIdeaId }));
    }
  }, [preselectedIdeaId]);

  async function handleGenerate() {
    setGenerating(true);
    setGenError(null);
    setGenWarnings([]);
    setContextSummary(null);
    try {
      const res = await fetch('/api/studio/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genForm),
      });
      const data = await res.json();
      if (!res.ok) { setGenError(data.error || 'Generation failed'); return; }
      setEditorContent(data.content);
      setContextSummary(data.contextSummary);
      setGenWarnings(data.warnings || []);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Unknown error');
    } finally { setGenerating(false); }
  }

  async function handleSaveDraft() {
    if (!editorContent.trim()) return;
    setSaving(true);
    try {
      if (selectedDraft) {
        const res = await fetch(`/api/studio/${selectedDraft.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: editorContent }),
        });
        if (res.ok) { const data = await res.json(); setSelectedDraft(data.draft); }
      } else {
        const res = await fetch('/api/studio', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: editorContent,
            ideaId: genForm.ideaId || null,
            purpose: genForm.purpose || null,
            targetAudience: genForm.targetAudience || null,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedDraft(data.draft);
          loadDrafts();
        }
      }
    } catch { /* handled */ }
    finally { setSaving(false); }
  }

  async function updateDraftStatus(id: string, status: string) {
    await fetch(`/api/studio/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    loadDrafts();
    if (selectedDraft?.id === id) setSelectedDraft(d => d ? { ...d, status: status as Draft['status'] } : d);
  }

  const charCount = editorContent.length;
  const charColor = charCount > 3000 ? '#DC2626' : charCount > 2000 ? '#D97706' : 'var(--color-text-muted)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', height: '100%' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>Content Studio</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Draft LinkedIn posts grounded in your real work. Review, edit, and approve - you remain in full control.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className={`btn ${activeView === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveView('list')}>
            All Drafts
          </button>
          <button id="new-draft-btn" className={`btn ${activeView === 'editor' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setActiveView('editor'); setSelectedDraft(null); setEditorContent(''); setContextSummary(null); setGenWarnings([]); setGenError(null); }}>
            + New Draft
          </button>
        </div>
      </div>

      {activeView === 'list' ? (
        /* ── Drafts List ── */
        loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[1,2,3].map(i => <div key={i} className="card" style={{ height: 100, background: 'var(--color-surface-muted)' }} />)}
          </div>
        ) : drafts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" style={{ margin: '0 auto var(--space-4)' }}>
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>No drafts yet</p>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>Create your first draft from an idea or start writing directly.</p>
            <button className="btn btn-primary" onClick={() => setActiveView('editor')}>Open Studio</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {drafts.map(draft => {
              const sc = STATUS_CONFIG[draft.status];
              return (
                <div key={draft.id} className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                  onClick={() => { setSelectedDraft(draft); setEditorContent(draft.content); setActiveView('editor'); }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ''}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <span style={{ padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', background: sc.bg, color: sc.color }}>{sc.label}</span>
                        {draft.pillar && <span style={{ padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', background: draft.pillar.color + '22', color: draft.pillar.color }}>{draft.pillar.name}</span>}
                        {draft.idea && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>From: {draft.idea.title}</span>}
                      </div>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', lineHeight: 'var(--line-height-relaxed)' }}>
                        {draft.content.length > 200 ? draft.content.slice(0, 200) + '…' : draft.content}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)', flexShrink: 0 }}>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {new Date(draft.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {draft.status === 'DRAFT' && (
                        <button className="btn btn-ghost" style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-2)' }} onClick={ev => { ev.stopPropagation(); updateDraftStatus(draft.id, 'IN_REVIEW'); }}>
                          Submit for Review
                        </button>
                      )}
                      {draft.status === 'IN_REVIEW' && (
                        <button className="btn btn-ghost" style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-2)', color: '#16A34A' }} onClick={ev => { ev.stopPropagation(); updateDraftStatus(draft.id, 'APPROVED'); }}>
                          ✓ Approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ── Editor View ── */
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>
          {/* Left Panel: Context */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="card">
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>Generate from Idea</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>Approved Idea</label>
                  <select className="form-input" style={{ fontSize: 'var(--font-size-sm)' }} value={genForm.ideaId} onChange={e => setGenForm(f => ({ ...f, ideaId: e.target.value }))}>
                    <option value=""> - Select idea or write manually - </option>
                    {ideas.map(idea => <option key={idea.id} value={idea.id}>{idea.title}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>Purpose / Angle</label>
                  <input className="form-input" style={{ fontSize: 'var(--font-size-sm)' }} value={genForm.purpose} onChange={e => setGenForm(f => ({ ...f, purpose: e.target.value }))} placeholder="e.g. Share a lesson from this decision" />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>Target Audience</label>
                  <input className="form-input" style={{ fontSize: 'var(--font-size-sm)' }} value={genForm.targetAudience} onChange={e => setGenForm(f => ({ ...f, targetAudience: e.target.value }))} placeholder="e.g. Engineers, CTOs, Founders" />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>Tone Override</label>
                  <select className="form-input" style={{ fontSize: 'var(--font-size-sm)' }} value={genForm.tone} onChange={e => setGenForm(f => ({ ...f, tone: e.target.value }))}>
                    <option value="">Use strategy defaults</option>
                    <option value="direct">Direct & concise</option>
                    <option value="conversational">Conversational</option>
                    <option value="technical">Technical & precise</option>
                    <option value="reflective">Reflective</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>Instructions for AI</label>
                  <textarea className="form-textarea" rows={2} style={{ fontSize: 'var(--font-size-sm)' }} value={genForm.additionalInstructions} onChange={e => setGenForm(f => ({ ...f, additionalInstructions: e.target.value }))} placeholder="Any specific structure, angle, or constraints?" />
                </div>

                <button id="generate-draft-btn" className="btn btn-primary" style={{ width: '100%' }} onClick={handleGenerate} disabled={generating}>
                  {generating ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Generating…
                    </span>
                  ) : '✨ Generate Draft'}
                </button>
              </div>
            </div>

            {/* Warnings & Context */}
            {genError && (
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-error-bg)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-error)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-error)', marginBottom: 'var(--space-1)' }}>⚠ Generation Failed</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{genError}</div>
              </div>
            )}

            {contextSummary && (
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-info-bg)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-info)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-info)', marginBottom: 'var(--space-1)' }}>Context Used</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{contextSummary}</div>
              </div>
            )}

            {genWarnings.length > 0 && (
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-warning-bg)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-warning)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-warning)', marginBottom: 'var(--space-2)' }}>⚠ Warnings</div>
                {genWarnings.map((w, i) => <div key={i} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>• {w}</div>)}
              </div>
            )}

            {selectedDraft && (
              <div className="card" style={{ borderLeft: '3px solid var(--color-primary)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>Draft Status</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1_5)' }}>
                  {(['DRAFT', 'IN_REVIEW', 'NEEDS_CHANGES', 'APPROVED'] as const).map(s => {
                    const sc = STATUS_CONFIG[s];
                    const isActive = selectedDraft.status === s;
                    return (
                      <button key={s} onClick={() => updateDraftStatus(selectedDraft.id, s)} style={{
                        padding: 'var(--space-1_5) var(--space-3)', borderRadius: 'var(--radius-md)', border: `1px solid ${isActive ? sc.color : 'var(--color-border)'}`,
                        background: isActive ? sc.bg : 'transparent', color: isActive ? sc.color : 'var(--color-text-muted)',
                        fontSize: 'var(--font-size-xs)', fontWeight: isActive ? 'var(--font-weight-semibold)' : 'normal',
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                      }}>
                        {isActive ? '● ' : '○ '}{sc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                  {selectedDraft ? `Editing: ${selectedDraft.idea?.title || 'Draft'}` : 'New Draft'}
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: charColor }}>
                  {charCount.toLocaleString()} chars {charCount > 3000 && '⚠ too long for LinkedIn'}
                </span>
              </div>
              <textarea
                id="draft-editor"
                value={editorContent}
                onChange={e => setEditorContent(e.target.value)}
                placeholder="Your draft will appear here. Generate it from an idea, or write directly - then review and edit before publishing."
                style={{
                  width: '100%', minHeight: 420, padding: 'var(--space-4)', border: 'none', outline: 'none',
                  fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height-relaxed)',
                  color: 'var(--color-text-primary)', background: 'var(--color-surface)', resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setActiveView('list')}>← Back to Drafts</button>
              <button id="save-draft-btn" className="btn btn-primary" onClick={handleSaveDraft} disabled={saving || !editorContent.trim()}>
                {saving ? 'Saving…' : selectedDraft ? '💾 Update Draft' : '💾 Save Draft'}
              </button>
            </div>

            {/* LinkedIn Preview */}
            {editorContent && (
              <div className="card" style={{ borderLeft: '3px solid #0A66C2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: '#0A66C2' }}>LinkedIn Preview</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', lineHeight: 'var(--line-height-relaxed)', whiteSpace: 'pre-wrap' }}>
                  {editorContent.length > 300 ? editorContent.slice(0, 300) : editorContent}
                  {editorContent.length > 300 && <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }}> …see more</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading studio…</div>}>
      <StudioContent />
    </Suspense>
  );
}
