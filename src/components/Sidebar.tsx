'use client';

// src/components/Sidebar.tsx
// LINKER — Main Navigation Sidebar

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LinkerMark } from './Logo';
import { signOut } from '@/lib/supabase/auth-client';
import {
  LayoutDashboard,
  PenLine,
  CalendarDays,
  Lightbulb,
  UserCircle2,
  BookOpen,
  FolderKanban,
  NotebookPen,
  BarChart3,
  Search,
  TrendingUp,
  Plug2,
  Settings2,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const ICON_SIZE = 16;
const ICON_PROPS = { size: ICON_SIZE, strokeWidth: 1.75 };

export function Sidebar({ userEmail, userName }: { userEmail?: string; userName?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const sections: NavSection[] = [
    {
      title: 'Workspace',
      items: [
        { label: 'Overview',   href: '/app',          icon: <LayoutDashboard {...ICON_PROPS} /> },
        { label: 'Studio',     href: '/app/studio',   icon: <PenLine {...ICON_PROPS} /> },
        { label: 'Calendar',   href: '/app/calendar', icon: <CalendarDays {...ICON_PROPS} /> },
        { label: 'Ideas',      href: '/app/ideas',    icon: <Lightbulb {...ICON_PROPS} /> },
      ],
    },
    {
      title: 'Knowledge',
      items: [
        { label: 'Identity',       href: '/app/identity',   icon: <UserCircle2 {...ICON_PROPS} /> },
        { label: 'Knowledge Base', href: '/app/knowledge',  icon: <BookOpen {...ICON_PROPS} /> },
        { label: 'Projects',       href: '/app/projects',   icon: <FolderKanban {...ICON_PROPS} /> },
        { label: 'Journal',        href: '/app/journal',    icon: <NotebookPen {...ICON_PROPS} /> },
        { label: 'Research',       href: '/app/research',   icon: <Search {...ICON_PROPS} /> },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Strategy',     href: '/app/strategy',     icon: <TrendingUp {...ICON_PROPS} /> },
        { label: 'Analytics',    href: '/app/analytics',    icon: <BarChart3 {...ICON_PROPS} /> },
        { label: 'Integrations', href: '/app/integrations', icon: <Plug2 {...ICON_PROPS} /> },
        { label: 'Settings',     href: '/app/settings',     icon: <Settings2 {...ICON_PROPS} /> },
      ],
    },
  ];

  const initials = (userName || userEmail || 'U')
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className="sidebar-brand">
        <Link href="/app" className="sidebar-brand-link" aria-label="Linker home">
          <LinkerMark size={26} />
          <span className="sidebar-wordmark">Linker</span>
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight size={14} strokeWidth={2} />
            : <ChevronLeft size={14} strokeWidth={2} />
          }
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" aria-label="Application navigation">
        {sections.map((section) => (
          <div key={section.title} className="sidebar-nav-section">
            <span className="sidebar-nav-section-label">{section.title}</span>
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/app' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span className="sidebar-nav-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2_5)', overflow: 'hidden' }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-violet))',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'var(--font-weight-bold)',
              flexShrink: 0,
              letterSpacing: '0.03em',
            }}
            aria-hidden="true"
          >
            {initials}
          </div>

          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '-0.01em',
              }}>
                {userName || 'User'}
              </div>
              {userEmail && (
                <div style={{
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {userEmail}
                </div>
              )}
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="btn btn-ghost btn-icon-sm"
              title="Sign out"
              aria-label="Sign out"
              style={{ flexShrink: 0, color: 'var(--color-text-muted)' }}
            >
              <LogOut size={14} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
