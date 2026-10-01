'use client';

// src/components/MobileNav.tsx
// LINKER - Mobile Bottom Navigation Bar

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  const items = [
    {
      label: 'Home',
      href: '/app',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: 'Studio',
      href: '/app/studio',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
    },
    {
      label: 'Ideas',
      href: '/app/ideas',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4.5 12.36V17a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-2.64A7 7 0 0 0 12 2z" />
        </svg>
      ),
    },
    {
      label: 'Calendar',
      href: '/app/calendar',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="mobile-nav show-mobile" aria-label="Mobile Navigation">
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'mobile-nav-item-active' : ''}`}
          >
            {item.icon}
            <span style={{ fontSize: '10px', fontWeight: 'var(--font-weight-medium)' }}>{item.label}</span>
          </Link>
        );
      })}
      <button
        onClick={onMenuClick}
        className="mobile-nav-item"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <span style={{ fontSize: '10px', fontWeight: 'var(--font-weight-medium)' }}>More</span>
      </button>
    </nav>
  );
}
