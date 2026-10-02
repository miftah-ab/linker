'use client';

// src/components/Header.tsx
// LINKER — Top Application Header

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onMenuClick?: () => void;
  isLinkedInConnected?: boolean;
}

const BREADCRUMB_MAP: Record<string, { label: string; parent?: { label: string; href: string } }> = {
  '/app':             { label: 'Overview' },
  '/app/studio':      { label: 'Content Studio' },
  '/app/calendar':    { label: 'Calendar' },
  '/app/ideas':       { label: 'Ideas' },
  '/app/identity':    { label: 'Identity' },
  '/app/knowledge':   { label: 'Knowledge Base' },
  '/app/projects':    { label: 'Projects' },
  '/app/journal':     { label: 'Journal' },
  '/app/strategy':    { label: 'Strategy' },
  '/app/research':    { label: 'Research' },
  '/app/analytics':   { label: 'Analytics' },
  '/app/integrations':{ label: 'Integrations' },
  '/app/settings':    { label: 'Settings' },
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
        {/* Mobile menu toggle — only shows on mobile */}
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-icon show-mobile"
          aria-label="Open navigation"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="7" x2="21" y2="7" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="17" x2="17" y2="17" />
          </svg>
        </button>

        {/* Page title */}
        <span
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {pageLabel}
        </span>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {/* LinkedIn status — compact indicator */}
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
              border: `1px solid ${isLinkedInConnected ? 'color-mix(in srgb, var(--color-success) 30%, transparent)' : 'var(--color-border)'}`,
              backgroundColor: isLinkedInConnected
                ? 'color-mix(in srgb, var(--color-success) 8%, transparent)'
                : 'transparent',
              transition: 'all var(--transition-fast)',
            }}
            className="hide-mobile"
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: isLinkedInConnected ? 'var(--color-success)' : 'var(--color-text-muted)',
                flexShrink: 0,
              }}
            />
            {isLinkedInConnected ? 'LinkedIn' : 'Not connected'}
          </span>
          {/* Mobile: just the dot */}
          <span
            className="show-mobile"
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: isLinkedInConnected ? 'var(--color-success)' : 'var(--color-text-muted)',
              flexShrink: 0,
            }}
          />
        </Link>

        {/* New Draft */}
        <Link href="/app/studio" className="btn btn-primary btn-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="hide-mobile">New Draft</span>
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}
