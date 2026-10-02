'use client';

// src/components/Header.tsx
// LINKER — Top Application Header

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { Menu, Plus, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  isLinkedInConnected?: boolean;
}

const BREADCRUMB_MAP: Record<string, { label: string }> = {
  '/app':              { label: 'Overview' },
  '/app/studio':       { label: 'Content Studio' },
  '/app/calendar':     { label: 'Calendar' },
  '/app/ideas':        { label: 'Ideas' },
  '/app/identity':     { label: 'Identity' },
  '/app/knowledge':    { label: 'Knowledge Base' },
  '/app/projects':     { label: 'Projects' },
  '/app/journal':      { label: 'Journal' },
  '/app/strategy':     { label: 'Strategy' },
  '/app/research':     { label: 'Research' },
  '/app/analytics':    { label: 'Analytics' },
  '/app/integrations': { label: 'Integrations' },
  '/app/settings':     { label: 'Settings' },
};

export function Header({ onMenuClick, isLinkedInConnected = false }: HeaderProps) {
  const pathname = usePathname();

  const pageInfo = BREADCRUMB_MAP[pathname];
  let pageLabel = pageInfo?.label;

  if (!pageLabel) {
    if (pathname.startsWith('/app/studio/')) pageLabel = 'Draft Editor';
    else if (pathname.startsWith('/app/projects/')) pageLabel = 'Project';
    else pageLabel = 'Workspace';
  }

  return (
    <header className="header">
      {/* Left: hamburger + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-icon show-mobile"
          aria-label="Open navigation"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Menu size={18} strokeWidth={2} />
        </button>

        <span style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em',
        }}>
          {pageLabel}
        </span>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {/* LinkedIn status */}
        <Link
          href="/app/integrations"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1_5)' }}
          title={isLinkedInConnected ? 'LinkedIn connected' : 'LinkedIn not connected — click to configure'}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1_5)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-medium)',
              color: isLinkedInConnected ? 'var(--color-success)' : 'var(--color-text-muted)',
              padding: 'var(--space-1) var(--space-2)',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${isLinkedInConnected
                ? 'color-mix(in srgb, var(--color-success) 30%, transparent)'
                : 'var(--color-border)'}`,
              backgroundColor: isLinkedInConnected
                ? 'color-mix(in srgb, var(--color-success) 8%, transparent)'
                : 'transparent',
              transition: 'all var(--transition-fast)',
            }}
            className="hide-mobile"
          >
            {isLinkedInConnected
              ? <Wifi size={12} strokeWidth={2} />
              : <WifiOff size={12} strokeWidth={2} />
            }
            {isLinkedInConnected ? 'LinkedIn' : 'Not connected'}
          </span>
          {/* Mobile: just the icon */}
          <span className="show-mobile" style={{ color: isLinkedInConnected ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
            {isLinkedInConnected
              ? <Wifi size={14} strokeWidth={2} />
              : <WifiOff size={14} strokeWidth={2} />
            }
          </span>
        </Link>

        {/* New Draft */}
        <Link href="/app/studio" className="btn btn-primary btn-sm">
          <Plus size={13} strokeWidth={2.5} />
          <span className="hide-mobile">New Draft</span>
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}
