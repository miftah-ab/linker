'use client';

// src/app/providers.tsx
// LINKER — Client providers (theme + session)

import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply saved theme on load
    const saved = localStorage.getItem('linker-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved ?? (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  // Prevent flash on load
  if (!mounted) {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var t = localStorage.getItem('linker-theme');
              var d = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              document.documentElement.setAttribute('data-theme', t || d);
            })();
          `,
        }}
      />
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
}

// ── Theme toggle hook (used by components) ───────────────────
export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('linker-theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setThemeState(saved ?? (prefersDark ? 'dark' : 'light'));
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setThemeState(next);
    localStorage.setItem('linker-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  return { theme, toggleTheme };
}
