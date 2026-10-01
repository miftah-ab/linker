'use client';

// src/components/Header.tsx
// LINKER - Top App Shell Header

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onMenuClick?: () => void;
  isLinkedInConnected?: boolean;
}

const TITLE_MAP: Record<string, string> = {
  '/app': 'Workspace Overview',
  '/app/studio': 'Content Studio',
  '/app/calendar': 'Editorial Calendar',
  '/app/ideas': 'Idea Pipeline',
  '/app/identity': 'Professional Identity & Voice',
  '/app/knowledge': 'Knowledge Base',
  '/app/projects': 'Project Registry',
  '/app/journal': 'Engineering & Work Journal',
  '/app/strategy': 'Content Strategy & Cadence',
  '/app/research': 'Research & Evidence',
  '/app/analytics': 'Presence Analytics',
  '/app/integrations': 'Integrations & API Keys',
  '/app/settings': 'Settings',
};

export function Header({ onMenuClick, isLinkedInConnected = false }: HeaderProps) {
  const pathname = usePathname();

  // Determine current page title
  let currentTitle = TITLE_MAP[pathname];
  if (!currentTitle) {
    if (pathname.startsWith('/app/studio/')) currentTitle = 'Draft Editor';
    else if (pathname.startsWith('/app/projects/')) currentTitle = 'Project Details';
    else currentTitle = 'Workspace';
  }

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-icon show-mobile"
          aria-label="Open Navigation Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div>
          <h1 className="header-title" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>
            {currentTitle}
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* LinkedIn Connection status indicator */}
        <Link
          href="/app/integrations"
          className="badge"
          style={{
            textDecoration: 'none',
            backgroundColor: isLinkedInConnected ? 'color-mix(in srgb, var(--color-success) 15%, transparent)' : 'color-mix(in srgb, var(--color-text-muted) 15%, transparent)',
            color: isLinkedInConnected ? 'var(--color-success)' : 'var(--color-text-secondary)',
            border: `1px solid ${isLinkedInConnected ? 'var(--color-success)' : 'var(--color-border)'}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1_5)',
          }}
          title={isLinkedInConnected ? 'LinkedIn connected via official API' : 'LinkedIn not connected. Click to configure.'}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: isLinkedInConnected ? 'var(--color-success)' : 'var(--color-text-muted)',
            }}
          />
          <span className="hide-mobile">{isLinkedInConnected ? 'LinkedIn Linked' : 'LinkedIn Disconnected'}</span>
        </Link>

        {/* Create Draft action */}
        <Link href="/app/studio" className="btn btn-primary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="hide-mobile">New Draft</span>
        </Link>

        {/* Theme toggle button */}
        <ThemeToggle />
      </div>
    </header>
  );
}
