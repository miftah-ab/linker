'use client';

// src/app/app/projects/page.tsx
// LINKER - Projects Module

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, FolderKanban, Pencil, Trash2, ChevronDown, Check, X } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  problemAddressed: string | null;
  targetUsers: string | null;
  techStack: string[];
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'ABANDONED';
  startDate: string | null;
  endDate: string | null;
  links: string[];
  outcomes: string | null;
  outcomeStatus: 'PLANNED' | 'CLAIMED' | 'VERIFIED' | 'UNVERIFIED';
  milestones: Milestone[];
  _count: { journalEntries: number; knowledgeEntries: number; ideas: number; drafts: number };
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PLANNED: '#94A3B8',
  IN_PROGRESS: '#2563EB',
  COMPLETED: '#16A34A',
  PAUSED: '#D97706',
  ABANDONED: '#DC2626',
};

const STATUS_LABELS: Record<string, string> = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  PAUSED: 'Paused',
  ABANDONED: 'Abandoned',
};

const OUTCOME_LABELS: Record<string, string> = {
  PLANNED: 'Planned',
  CLAIMED: 'Claimed',
  VERIFIED: 'Verified',
  UNVERIFIED: 'Unverified',
};

const OUTCOME_COLORS: Record<string, string> = {
  PLANNED: '#94A3B8',
  CLAIMED: '#D97706',
  VERIFIED: '#16A34A',
  UNVERIFIED: '#94A3B8',
};

const TECH_COLORS = [
  '#2563EB', '#7C3AED', '#06B6D4', '#16A34A', '#D97706', '#DC2626',
  '#0891B2', '#7C3AED', '#059669', '#D97706',
];

const EMPTY_FORM = {
  name: '', description: '', problemAddressed: '', targetUsers: '',
  techStack: '', status: 'PLANNED', startDate: '', endDate: '', links: '',
  outcomes: '', outcomeStatus: 'UNVERIFIED',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/projects?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch { /* handled */ }
    finally { setLoading(false); }
  }, [statusFilter, search]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  function openCreate() {
    setEditProject(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(p: Project) {
    setEditProject(p);
    setForm({
      name: p.name,
      description: p.description || '',
      problemAddressed: p.problemAddressed || '',
      targetUsers: p.targetUsers || '',
      techStack: p.techStack.join(', '),
      status: p.status,
      startDate: p.startDate ? p.startDate.slice(0, 10) : '',
      endDate: p.endDate ? p.endDate.slice(0, 10) : '',
      links: p.links.join('\n'),
      outcomes: p.outcomes || '',
      outcomeStatus: p.outcomeStatus,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        techStack: form.techStack.split(',').map(s => s.trim()).filter(Boolean),
        links: form.links.split('\n').map(s => s.trim()).filter(Boolean),
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };

      if (editProject) {
        await fetch(`/api/projects/${editProject.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/projects', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      loadProjects();
    } catch { /* handled */ }
    finally { setSaving(false); }
  }

  async function handleArchive(id: string) {
    if (!confirm('Archive this project?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    loadProjects();
  }

  const filteredProjects = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
            Projects
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Document your real engineering and professional projects. Distinguish what is planned, claimed, and verified.
          </p>
        </div>
        <button id="create-project-btn" className="btn btn-primary" onClick={openCreate} style={{ flexShrink: 0 }}>
          <Plus size={16} strokeWidth={2.5} />
          New Project
        </button>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search style={{ position: "absolute", left: "var(--space-3)", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} size={15} strokeWidth={2} />
          <input
            id="project-search"
            className="form-input"
            style={{ paddingLeft: 'var(--space-8)' }}
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {['ALL', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'ABANDONED'].map(s => (
            <button key={s} id={`filter-${s.toLowerCase()}`} onClick={() => setStatusFilter(s)}
              style={{
                padding: 'var(--space-1_5) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${statusFilter === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: statusFilter === s ? 'var(--color-primary)' : 'var(--color-surface)',
                color: statusFilter === s ? 'white' : 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}>
              {s === 'ALL' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Project Grid ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: 'var(--space-4)' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ height: 200, background: 'var(--color-surface-muted)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-4)' }}>
          <FolderKanban size={48} strokeWidth={1.5} color="var(--color-text-muted)" style={{ margin: "0 auto var(--space-4)" }} />
          <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>No projects yet</p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>Document your first real project to start building grounded content.</p>
          <button className="btn btn-primary" onClick={openCreate}>Add Your First Project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: 'var(--space-4)' }}>
          {filteredProjects.map(project => (
            <div key={project.id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>

              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)',
                      background: STATUS_COLORS[project.status] + '22',
                      color: STATUS_COLORS[project.status],
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[project.status] }} />
                      {STATUS_LABELS[project.status]}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                    {project.name}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
                  <button className="btn btn-ghost" style={{ padding: 'var(--space-1)' }} onClick={() => openEdit(project)} title="Edit">
                    <Pencil size={14} strokeWidth={2} />
                  </button>
                  <button className="btn btn-ghost" style={{ padding: 'var(--space-1)', color: 'var(--color-error)' }} onClick={() => handleArchive(project.id)} title="Archive">
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)', lineHeight: 'var(--line-height-relaxed)' }}>
                  {project.description.length > 120 ? project.description.slice(0, 120) + '…' : project.description}
                </p>
              )}

              {/* Tech Stack */}
              {project.techStack.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1_5)', marginBottom: 'var(--space-3)' }}>
                  {project.techStack.slice(0, 6).map((tech, i) => (
                    <span key={tech} style={{
                      padding: '2px var(--space-2)', borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)',
                      background: TECH_COLORS[i % TECH_COLORS.length] + '18',
                      color: TECH_COLORS[i % TECH_COLORS.length],
                      border: `1px solid ${TECH_COLORS[i % TECH_COLORS.length]}33`,
                    }}>{tech}</span>
                  ))}
                  {project.techStack.length > 6 && (
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>+{project.techStack.length - 6} more</span>
                  )}
                </div>
              )}

              {/* Outcomes */}
              {project.outcomes && (
                <div style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-muted)',
                  marginBottom: 'var(--space-3)',
                  borderLeft: `3px solid ${OUTCOME_COLORS[project.outcomeStatus]}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: OUTCOME_COLORS[project.outcomeStatus] }}>
                      Outcome · {OUTCOME_LABELS[project.outcomeStatus]}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    {project.outcomes.length > 100 ? project.outcomes.slice(0, 100) + '…' : project.outcomes}
                  </p>
                </div>
              )}

              {/* Stats footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  {[
                    { label: 'Journal', count: project._count.journalEntries, href: `/app/journal?projectId=${project.id}` },
                    { label: 'Ideas', count: project._count.ideas, href: `/app/ideas` },
                    { label: 'Drafts', count: project._count.drafts, href: `/app/studio` },
                  ].map(stat => (
                    <div key={stat.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>{stat.count}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Expand milestones */}
                {project.milestones.length > 0 && (
                  <button className="btn btn-ghost" style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-2)' }}
                    onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}>
                    {project.milestones.filter(m => m.isCompleted).length}/{project.milestones.length} milestones
                    <ChevronDown size={14} strokeWidth={2} style={{ transform: expandedId === project.id ? "rotate(180deg)" : "", transition: "transform 0.2s" }} />
                  </button>
                )}
              </div>

              {/* Milestones expansion */}
              {expandedId === project.id && project.milestones.length > 0 && (
                <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1_5)' }}>
                  {project.milestones.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: '3px', flexShrink: 0,
                        border: `2px solid ${m.isCompleted ? '#16A34A' : 'var(--color-border)'}`,
                        background: m.isCompleted ? '#16A34A' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {m.isCompleted && <Check size={10} strokeWidth={3} color="white" />}
                      </div>
                      <span style={{ color: m.isCompleted ? 'var(--color-text-muted)' : 'var(--color-text-secondary)', textDecoration: m.isCompleted ? 'line-through' : 'none' }}>
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)',
        }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{
            background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)', maxWidth: 640, width: '100%',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
                {editProject ? 'Edit Project' : 'New Project'}
              </h3>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ padding: 'var(--space-1)' }}>
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input id="project-name-input" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Real-time Analytics Pipeline" />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this project do and why does it matter?" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Outcome Status</label>
                  <select className="form-input" value={form.outcomeStatus} onChange={e => setForm(f => ({ ...f, outcomeStatus: e.target.value }))}>
                    {Object.entries(OUTCOME_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Problem Addressed</label>
                <textarea className="form-textarea" rows={2} value={form.problemAddressed} onChange={e => setForm(f => ({ ...f, problemAddressed: e.target.value }))} placeholder="What specific problem does this solve?" />
              </div>

              <div className="form-group">
                <label className="form-label">Target Users</label>
                <input className="form-input" value={form.targetUsers} onChange={e => setForm(f => ({ ...f, targetUsers: e.target.value }))} placeholder="e.g. Backend engineers at mid-size SaaS companies" />
              </div>

              <div className="form-group">
                <label className="form-label">Tech Stack <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(comma-separated)</span></label>
                <input className="form-input" value={form.techStack} onChange={e => setForm(f => ({ ...f, techStack: e.target.value }))} placeholder="e.g. TypeScript, Next.js, PostgreSQL, Prisma" />
              </div>

              <div className="form-group">
                <label className="form-label">Verified Outcomes</label>
                <textarea className="form-textarea" rows={2} value={form.outcomes} onChange={e => setForm(f => ({ ...f, outcomes: e.target.value }))} placeholder="Only document what actually happened - do not exaggerate or invent results." />
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                  ⚠ Be honest. The AI will use this as grounding. Unverified outcomes will be flagged.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input className="form-input" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Links <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(one per line)</span></label>
                <textarea className="form-textarea" rows={2} value={form.links} onChange={e => setForm(f => ({ ...f, links: e.target.value }))} placeholder="https://github.com/..." />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-project-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
