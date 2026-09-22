// src/components/Logo.tsx
// LINKER — Logo components (SVG-based, works at all sizes)

import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

// ── Symbol-only mark (L with node connections) ───────────────
export function LinkerMark({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Linker logo mark"
      role="img"
    >
      {/* Background */}
      <rect width="32" height="32" rx="8" fill="#2563EB" />

      {/* Nodes */}
      <circle cx="8" cy="8" r="2.5" fill="white" fillOpacity="0.9" />
      <circle cx="8" cy="24" r="2.5" fill="white" />
      <circle cx="24" cy="24" r="2.5" fill="white" fillOpacity="0.9" />
      <circle cx="20" cy="14" r="2" fill="white" fillOpacity="0.6" />

      {/* L shape connections */}
      <line x1="8" y1="8" x2="8" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="24" x2="24" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" />

      {/* Connection to mid node */}
      <line x1="8" y1="8" x2="20" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="20" y1="14" x2="24" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  );
}

// ── Small favicon mark ───────────────────────────────────────
export function LinkerFavicon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="8" fill="#2563EB" />
      <circle cx="8" cy="8" r="2.5" fill="white" />
      <circle cx="8" cy="24" r="2.5" fill="white" />
      <circle cx="24" cy="24" r="2.5" fill="white" />
      <line x1="8" y1="8" x2="8" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="24" x2="24" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ── Full wordmark ─────────────────────────────────────────────
interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LinkerWordmark({ size = 'md', className }: WordmarkProps) {
  const markSize = size === 'sm' ? 24 : size === 'lg' ? 40 : 32;
  const textSize = size === 'sm' ? '16px' : size === 'lg' ? '26px' : '20px';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
      }}
    >
      <LinkerMark size={markSize} />
      <span
        style={{
          fontSize: textSize,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.025em',
          fontFamily: 'var(--font-family)',
        }}
      >
        Linker
      </span>
    </span>
  );
}

// ── App Icon (larger, for loading screens) ───────────────────
export function LinkerAppIcon({ size = 64 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Linker"
      role="img"
    >
      <rect width="64" height="64" rx="16" fill="#2563EB" />
      <rect width="64" height="64" rx="16" fill="url(#icon-grad)" />

      {/* Nodes */}
      <circle cx="16" cy="16" r="5" fill="white" fillOpacity="0.95" />
      <circle cx="16" cy="48" r="5" fill="white" />
      <circle cx="48" cy="48" r="5" fill="white" fillOpacity="0.95" />
      <circle cx="40" cy="28" r="4" fill="white" fillOpacity="0.55" />
      <circle cx="30" cy="36" r="3" fill="white" fillOpacity="0.35" />

      {/* L structure */}
      <line x1="16" y1="16" x2="16" y2="48" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="16" y1="48" x2="48" y2="48" stroke="white" strokeWidth="3.5" strokeLinecap="round" />

      {/* Network lines */}
      <line x1="16" y1="16" x2="40" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.45" />
      <line x1="40" y1="28" x2="48" y2="48" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.45" />
      <line x1="16" y1="48" x2="30" y2="36" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3" />
      <line x1="30" y1="36" x2="40" y2="28" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3" />

      <defs>
        <linearGradient id="icon-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
