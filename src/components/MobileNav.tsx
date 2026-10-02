'use client';

// src/components/MobileNav.tsx
// LINKER - Mobile Bottom Navigation Bar

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PenLine,
  Lightbulb,
  CalendarDays,
  Menu,
} from 'lucide-react';

const ICON_SIZE = 20;
const ICON_PROPS = { size: ICON_SIZE, strokeWidth: 1.75 };

export function MobileNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  const items = [
    { label: 'Home',     href: '/app',          icon: <LayoutDashboard {...ICON_PROPS} /> },
    { label: 'Studio',   href: '/app/studio',   icon: <PenLine {...ICON_PROPS} /> },
    { label: 'Ideas',    href: '/app/ideas',    icon: <Lightbulb {...ICON_PROPS} /> },
    { label: 'Calendar', href: '/app/calendar', icon: <CalendarDays {...ICON_PROPS} /> },
  ];

  return (
    <nav className="mobile-nav show-mobile" aria-label="Mobile Navigation">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/app' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'mobile-nav-item-active' : ''}`}
          >
            {item.icon}
            <span style={{ fontSize: '10px', fontWeight: 'var(--font-weight-medium)' }}>
              {item.label}
            </span>
          </Link>
        );
      })}
      <button
        onClick={onMenuClick}
        className="mobile-nav-item"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        aria-label="Open full menu"
      >
        <Menu {...ICON_PROPS} />
        <span style={{ fontSize: '10px', fontWeight: 'var(--font-weight-medium)' }}>More</span>
      </button>
    </nav>
  );
}
