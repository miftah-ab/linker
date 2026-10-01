'use client';

// src/app/app/settings/page.tsx
// LINKER - Account Settings

import React, { useState } from 'react';
import { useSession, signOut } from '@/lib/supabase/auth-client';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'account' | 'ai' | 'danger'>('account');
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAccount() {
    const confirmed = confirm('Are you absolutely sure? This will permanently delete all your data - projects, journal, ideas, drafts, and knowledge. This cannot be undone.');
    if (!confirmed) return;
    const reconfirm = prompt('Type "DELETE" to confirm account deletion:');
    if (reconfirm !== 'DELETE') return;

    setDeleting(true);
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' });
      if (res.ok) {
        await signOut({ callbackUrl: '/' });
      }
    } catch { /* handled */ }
    finally { setDeleting(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>Settings</h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Manage your account, preferences, and data.</p>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)' }}>
        {([['account', 'Account'], ['ai', 'AI & Privacy'], ['danger', 'Danger Zone']] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: 'var(--space-3) var(--space-4)', background: 'none',
            border: 'none', borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === tab ? 'var(--color-primary)' : tab === 'danger' ? 'var(--color-error)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === tab ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
            fontSize: 'var(--font-size-sm)', cursor: 'pointer', transition: 'all 0.15s',
            marginBottom: '-1px',
          }}>{label}</button>
        ))}
      </div>

      {/* ── Account Tab ── */}
      {activeTab === 'account' && (
        <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="card">
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Account Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>Name</label>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
                  {session?.user?.name || 'Not set'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>Email</label>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
                  {session?.user?.email || 'Not set'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>Authentication Provider</label>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)' }}>
                  Google OAuth
                </div>
              </div>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
              To update your name or email, update your Google account profile.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Session</h3>
            <button className="btn btn-secondary" onClick={() => signOut({ callbackUrl: '/' })}>
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ── AI & Privacy Tab ── */}
      {activeTab === 'ai' && (
        <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="card">
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>AI Transparency</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                { title: 'What Linker AI does', items: ['Generate draft posts from your approved ideas and documented context', 'Identify content gaps in your strategy', 'Surface patterns in your writing (repeated phrases, missing pillars)'] },
                { title: 'What Linker AI does NOT do', items: ['Invent personal stories, achievements, or results', 'Fabricate statistics, client names, or metrics', 'Publish anything without your explicit approval', 'Share your data with third-party AI providers without your knowledge'] },
                { title: 'How your data is used', items: ['Your journal, projects, and knowledge are used only to generate your own content', 'Private journal entries are never used as AI context unless you mark them Content Eligible', 'AI logs are kept for debugging purposes and can be cleared from Danger Zone'] },
              ].map(section => (
                <div key={section.title}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>{section.title}</div>
                  <ul style={{ margin: 0, paddingLeft: 'var(--space-4)' }}>
                    {section.items.map(item => (
                      <li key={item} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)', lineHeight: 'var(--line-height-relaxed)' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ borderLeft: '3px solid var(--color-primary)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>AI Provider</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Linker uses <strong>Groq</strong> (primary) with <strong>OpenRouter</strong> as fallback for content generation. Both providers have privacy policies you should review. Your content is sent to these providers only during active generation sessions and is not used to train their models.
            </div>
          </div>
        </div>
      )}

      {/* ── Danger Zone Tab ── */}
      {activeTab === 'danger' && (
        <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ padding: 'var(--space-4)', background: 'var(--color-error-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-error)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>⚠ Danger Zone</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Actions in this section are permanent and cannot be undone. Proceed with extreme caution.
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>Delete Account</h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 'var(--line-height-relaxed)' }}>
              Permanently delete your Linker account and all associated data. This includes all projects, journal entries, ideas, drafts, knowledge entries, and strategy data. This action cannot be reversed.
            </p>
            <button id="delete-account-btn" className="btn btn-secondary" onClick={handleDeleteAccount} disabled={deleting} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
              {deleting ? 'Deleting…' : '🗑 Delete My Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
