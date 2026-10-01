'use client';

// src/app/app/integrations/page.tsx
// LINKER - Integrations

import React, { useEffect, useState } from 'react';

interface Integration {
  name: string;
  id: string;
  description: string;
  logo: string;
  status: 'connected' | 'not_connected' | 'coming_soon';
  statusLabel: string;
  connectHref?: string;
  details?: string;
}

export default function IntegrationsPage() {
  const [linkedInStatus, setLinkedInStatus] = useState<'loading' | 'connected' | 'not_connected'>('loading');

  useEffect(() => {
    fetch('/api/integrations/linkedin/status')
      .then(r => r.json())
      .then(data => setLinkedInStatus(data.connected ? 'connected' : 'not_connected'))
      .catch(() => setLinkedInStatus('not_connected'));
  }, []);

  const integrations: Integration[] = [
    {
      name: 'LinkedIn',
      id: 'linkedin',
      description: 'Connect your LinkedIn account to publish approved posts directly from Linker. View engagement data and track post performance.',
      logo: '🔗',
      status: linkedInStatus === 'loading' ? 'not_connected' : linkedInStatus,
      statusLabel: linkedInStatus === 'loading' ? 'Checking…' : linkedInStatus === 'connected' ? 'Connected' : 'Not connected',
      connectHref: '/api/integrations/linkedin/connect',
      details: 'Requires LinkedIn OAuth authorization. Linker will only publish posts you explicitly approve.',
    },
    {
      name: 'Buffer',
      id: 'buffer',
      description: 'Schedule posts to LinkedIn through Buffer. Useful if you prefer Buffer as your scheduling layer.',
      logo: '📋',
      status: 'coming_soon',
      statusLabel: 'Coming soon',
    },
    {
      name: 'Notion',
      id: 'notion',
      description: 'Import content from Notion to your knowledge base or journal. Sync ideas and notes.',
      logo: '📓',
      status: 'coming_soon',
      statusLabel: 'Coming soon',
    },
    {
      name: 'GitHub',
      id: 'github',
      description: 'Pull project information from GitHub repositories - commit activity, README, and open issues.',
      logo: '🐙',
      status: 'coming_soon',
      statusLabel: 'Coming soon',
    },
  ];

  async function handleDisconnectLinkedIn() {
    if (!confirm('Disconnect LinkedIn? You will need to reconnect to publish.')) return;
    try {
      await fetch('/api/integrations/linkedin/disconnect', { method: 'POST' });
      setLinkedInStatus('not_connected');
    } catch { /* handled */ }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>Integrations</h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Connect external services to extend Linker&apos;s workflow. All integrations are optional.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {integrations.map(integration => (
          <div key={integration.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 1 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0,
                }}>
                  {integration.logo}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>{integration.name}</h3>
                    <span style={{
                      padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)',
                      background: integration.status === 'connected' ? '#16A34A18' : integration.status === 'coming_soon' ? '#94A3B818' : '#D9780618',
                      color: integration.status === 'connected' ? '#16A34A' : integration.status === 'coming_soon' ? '#64748B' : '#D97806',
                    }}>
                      {integration.status === 'connected' && '✓ '}{integration.statusLabel}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)', marginBottom: integration.details ? 'var(--space-2)' : 0 }}>
                    {integration.description}
                  </p>
                  {integration.details && (
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{integration.details}</p>
                  )}
                </div>
              </div>

              <div style={{ flexShrink: 0 }}>
                {integration.status === 'connected' && integration.id === 'linkedin' && (
                  <button className="btn btn-secondary" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-error)', borderColor: 'var(--color-error)' }} onClick={handleDisconnectLinkedIn}>
                    Disconnect
                  </button>
                )}
                {integration.status === 'not_connected' && integration.connectHref && (
                  <a href={integration.connectHref} className="btn btn-primary" style={{ fontSize: 'var(--font-size-sm)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                    Connect
                  </a>
                )}
                {integration.status === 'coming_soon' && (
                  <button className="btn btn-secondary" disabled style={{ fontSize: 'var(--font-size-sm)', opacity: 0.5 }}>
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Security Note ── */}
      <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-lg)', borderLeft: '3px solid var(--color-primary)' }}>
        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--space-1)' }}>Security & Privacy</div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Linker stores OAuth tokens securely and encrypted. We never post to LinkedIn without your explicit approval of each individual draft. You can revoke access at any time from this page.
        </div>
      </div>
    </div>
  );
}
