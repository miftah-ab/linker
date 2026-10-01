'use client';

// src/app/app/strategy/page.tsx
// LINKER - Content Strategy & Pillars

import React, { useEffect, useState } from 'react';

interface Pillar {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isActive: boolean;
}

interface Strategy {
  id: string;
  positioning: string | null;
  goals: string | null;
  targetAudience: string | null;
  postingFrequency: number | null;
  preferredDays: string[];
  preferredTimes: string[];
  timezone: string | null;
  preferredFormats: string[];
  preferredLength: string | null;
  tone: string | null;
  callToAction: string | null;
  researchRequired: boolean;
  topicsToAvoid: string[];
  notes: string | null;
  pillars: Pillar[];
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS: Record<string, string> = { MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun' };
const FORMATS = ['text', 'image', 'video', 'document', 'poll'];
const FORMAT_ICONS: Record<string, string> = { text: '📝', image: '🖼️', video: '🎬', document: '📄', poll: '📊' };

const PILLAR_PRESETS = [
  { name: 'Technical Depth', color: '#2563EB', description: 'Deep technical insights, architecture decisions, and engineering tradeoffs' },
  { name: 'Lessons Learned', color: '#7C3AED', description: 'Real experiences, failures, and what they taught me' },
  { name: 'Industry Observations', color: '#06B6D4', description: 'Patterns, trends, and critical observations about the field' },
  { name: 'Behind the Build', color: '#D97706', description: 'Real-time documentation of active projects and decisions' },
  { name: 'Career & Growth', color: '#16A34A', description: 'Professional development, team dynamics, and leadership reflections' },
];

export default function StrategyPage() {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'positioning' | 'schedule' | 'pillars'>('positioning');
  const [showPillarModal, setShowPillarModal] = useState(false);
  const [savingPillar, setSavingPillar] = useState(false);
  const [pillarForm, setPillarForm] = useState({ name: '', description: '', color: '#2563EB' });

  const [form, setForm] = useState({
    positioning: '', goals: '', targetAudience: '', postingFrequency: '3',
    preferredDays: [] as string[], preferredTimes: ['09:00', '17:00'],
    timezone: 'UTC', preferredFormats: ['text'] as string[],
    preferredLength: 'medium', tone: '', callToAction: '',
    researchRequired: false, topicsToAvoid: '', notes: '',
  });

  useEffect(() => {
    fetch('/api/strategy').then(r => r.json()).then(data => {
      const s = data.strategy;
      if (s) {
        setStrategy(s);
        setForm({
          positioning: s.positioning || '', goals: s.goals || '', targetAudience: s.targetAudience || '',
          postingFrequency: String(s.postingFrequency || 3),
          preferredDays: s.preferredDays || [], preferredTimes: s.preferredTimes?.length ? s.preferredTimes : ['09:00'],
          timezone: s.timezone || 'UTC', preferredFormats: s.preferredFormats?.length ? s.preferredFormats : ['text'],
          preferredLength: s.preferredLength || 'medium', tone: s.tone || '', callToAction: s.callToAction || '',
          researchRequired: s.researchRequired || false, topicsToAvoid: (s.topicsToAvoid || []).join(', '),
          notes: s.notes || '',
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function toggleDay(day: string) {
    setForm(f => ({
      ...f,
      preferredDays: f.preferredDays.includes(day) ? f.preferredDays.filter(d => d !== day) : [...f.preferredDays, day],
    }));
  }

  function toggleFormat(fmt: string) {
    setForm(f => ({
      ...f,
      preferredFormats: f.preferredFormats.includes(fmt) ? f.preferredFormats.filter(x => x !== fmt) : [...f.preferredFormats, fmt],
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/strategy', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          postingFrequency: parseInt(form.postingFrequency) || null,
          topicsToAvoid: form.topicsToAvoid.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setStrategy(data.strategy);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch { /* handled */ }
    finally { setSaving(false); }
  }

  async function handleAddPillar(e: React.FormEvent) {
    e.preventDefault();
    setSavingPillar(true);
    try {
      const res = await fetch('/api/strategy/pillars', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pillarForm, strategyId: strategy?.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setStrategy(s => s ? { ...s, pillars: [...s.pillars, data.pillar] } : s);
        setShowPillarModal(false);
        setPillarForm({ name: '', description: '', color: '#2563EB' });
      }
    } catch { /* handled */ }
    finally { setSavingPillar(false); }
  }

  function applyPreset(preset: typeof PILLAR_PRESETS[0]) {
    setPillarForm({ name: preset.name, description: preset.description, color: preset.color });
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>Loading strategy…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>Content Strategy</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Define your positioning, audience, and content pillars. This guides every draft the AI produces.</p>
        </div>
        <button id="save-strategy-btn" className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flexShrink: 0 }}>
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Strategy'}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)' }}>
        {([['positioning', 'Positioning & Voice'], ['schedule', 'Schedule & Formats'], ['pillars', 'Content Pillars']] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: 'var(--space-3) var(--space-4)', background: 'none',
            border: 'none', borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === tab ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
            fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'all 0.15s',
            marginBottom: '-1px',
          }}>{label}</button>
        ))}
      </div>

      {/* ── Tab: Positioning ── */}
      {activeTab === 'positioning' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 720 }}>
          <div className="form-group">
            <label className="form-label">Professional Positioning</label>
            <textarea className="form-textarea" rows={3} value={form.positioning}
              onChange={e => setForm(f => ({ ...f, positioning: e.target.value }))}
              placeholder="How do you want to be known? What is the unique angle you bring to your field?" />
          </div>
          <div className="form-group">
            <label className="form-label">Content Goals</label>
            <textarea className="form-textarea" rows={3} value={form.goals}
              onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
              placeholder="What do you want your LinkedIn presence to accomplish? (networking, opportunities, building credibility, community, etc.)" />
          </div>
          <div className="form-group">
            <label className="form-label">Target Audience</label>
            <textarea className="form-textarea" rows={2} value={form.targetAudience}
              onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
              placeholder="Who are you writing for? Be specific - role, seniority, industry, challenge." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Tone</label>
              <select className="form-input" value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}>
                <option value=""> - Choose tone - </option>
                <option value="direct">Direct & concise</option>
                <option value="conversational">Conversational</option>
                <option value="technical">Technical & precise</option>
                <option value="reflective">Reflective & honest</option>
                <option value="professional">Formal & professional</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Length</label>
              <select className="form-input" value={form.preferredLength} onChange={e => setForm(f => ({ ...f, preferredLength: e.target.value }))}>
                <option value="short">Short (under 300 chars)</option>
                <option value="medium">Medium (300-800 chars)</option>
                <option value="long">Long (800-1500 chars)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Call to Action</label>
            <input className="form-input" value={form.callToAction} onChange={e => setForm(f => ({ ...f, callToAction: e.target.value }))} placeholder="e.g. What has been your experience? / Drop a comment / DM me." />
          </div>
          <div className="form-group">
            <label className="form-label">Topics to Avoid <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(comma-separated)</span></label>
            <input className="form-input" value={form.topicsToAvoid} onChange={e => setForm(f => ({ ...f, topicsToAvoid: e.target.value }))} placeholder="e.g. politics, controversial takes, competitor names" />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional context for the AI to consider" />
          </div>
        </div>
      )}

      {/* ── Tab: Schedule & Formats ── */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 720 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Posts per Week</label>
              <select className="form-input" value={form.postingFrequency} onChange={e => setForm(f => ({ ...f, postingFrequency: e.target.value }))}>
                {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} {n === 1 ? 'post' : 'posts'}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select className="form-input" value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern (ET)</option>
                <option value="America/Chicago">Central (CT)</option>
                <option value="America/Los_Angeles">Pacific (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Africa/Addis_Ababa">East Africa (EAT)</option>
                <option value="Asia/Dubai">Dubai (GST)</option>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="Asia/Singapore">Singapore (SGT)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Days</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
              {DAYS.map(day => (
                <button key={day} type="button" onClick={() => toggleDay(day)} style={{
                  padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
                  border: `1px solid ${form.preferredDays.includes(day) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: form.preferredDays.includes(day) ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: form.preferredDays.includes(day) ? 'white' : 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Post Formats</label>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
              {FORMATS.map(fmt => (
                <button key={fmt} type="button" onClick={() => toggleFormat(fmt)} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${form.preferredFormats.includes(fmt) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: form.preferredFormats.includes(fmt) ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: form.preferredFormats.includes(fmt) ? 'white' : 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {FORMAT_ICONS[fmt]} {fmt.charAt(0).toUpperCase() + fmt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
            <input id="research-required-toggle" type="checkbox" checked={form.researchRequired} onChange={e => setForm(f => ({ ...f, researchRequired: e.target.checked }))} />
            <label htmlFor="research-required-toggle" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
              <strong>Research required</strong> - AI will flag posts that need external research before publishing
            </label>
          </div>
        </div>
      )}

      {/* ── Tab: Content Pillars ── */}
      {activeTab === 'pillars' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Content pillars help organize your posts into strategic themes. Each idea and draft can be assigned to a pillar.
            </p>
            <button id="add-pillar-btn" className="btn btn-primary" style={{ flexShrink: 0 }} onClick={() => setShowPillarModal(true)}>
              + Add Pillar
            </button>
          </div>

          {!strategy?.pillars?.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
              <p style={{ gridColumn: '1/-1', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No pillars yet. Start from a preset or create your own.</p>
              {PILLAR_PRESETS.map(preset => (
                <div key={preset.name} className="card" style={{ cursor: 'pointer', borderLeft: `4px solid ${preset.color}`, transition: 'box-shadow 0.15s' }}
                  onClick={() => { applyPreset(preset); setShowPillarModal(true); }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ''}>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', color: preset.color, marginBottom: 'var(--space-1)', fontSize: 'var(--font-size-sm)' }}>{preset.name}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{preset.description}</div>
                  <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: preset.color, fontWeight: 'var(--font-weight-medium)' }}>Click to add →</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
              {strategy.pillars.map(pillar => (
                <div key={pillar.id} className="card" style={{ borderLeft: `4px solid ${pillar.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)', color: pillar.color, marginBottom: 'var(--space-1)' }}>{pillar.name}</div>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: pillar.color, flexShrink: 0, marginTop: 4 }} />
                  </div>
                  {pillar.description && <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{pillar.description}</div>}
                </div>
              ))}
              <div className="card" style={{ border: '2px dashed var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}
                onClick={() => setShowPillarModal(true)}>
                + Add Another Pillar
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Add Pillar Modal ── */}
      {showPillarModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowPillarModal(false); }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', maxWidth: 480, width: '100%', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>New Content Pillar</h3>
              <button className="btn btn-ghost" style={{ padding: 'var(--space-1)' }} onClick={() => setShowPillarModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Presets */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Quick presets:</p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {PILLAR_PRESETS.map(p => (
                  <button key={p.name} type="button" onClick={() => applyPreset(p)} style={{
                    padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)',
                    border: `1px solid ${p.color}33`, background: p.color + '18', color: p.color, cursor: 'pointer',
                  }}>{p.name}</button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddPillar} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Pillar Name *</label>
                <input id="pillar-name-input" className="form-input" value={pillarForm.name} onChange={e => setPillarForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Technical Deep Dives" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={2} value={pillarForm.description} onChange={e => setPillarForm(f => ({ ...f, description: e.target.value }))} placeholder="What type of content belongs here?" />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  {['#2563EB', '#7C3AED', '#06B6D4', '#16A34A', '#D97706', '#DC2626', '#0F172A', '#EC4899'].map(c => (
                    <button key={c} type="button" onClick={() => setPillarForm(f => ({ ...f, color: c }))} style={{
                      width: 28, height: 28, borderRadius: '50%', background: c, border: `3px solid ${pillarForm.color === c ? 'white' : 'transparent'}`,
                      outline: pillarForm.color === c ? `2px solid ${c}` : 'none', cursor: 'pointer', transition: 'all 0.15s',
                    }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPillarModal(false)}>Cancel</button>
                <button id="save-pillar-btn" type="submit" className="btn btn-primary" disabled={savingPillar}>
                  {savingPillar ? 'Adding…' : 'Add Pillar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
