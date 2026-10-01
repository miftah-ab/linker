'use client';

// src/app/app/layout.tsx
// LINKER - Authenticated Application Shell

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/supabase/auth-client';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);

  useEffect(() => {
    // If not authenticated in production, redirect to signin
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    // Check if user has an active LinkedIn connection
    async function checkLinkedIn() {
      try {
        const res = await fetch('/api/integrations/linkedin/status');
        if (res.ok) {
          const data = await res.json();
          setIsLinkedInConnected(Boolean(data.connected));
        }
      } catch {
        // graceful fallback
      }
    }
    if (session?.user) {
      checkLinkedIn();
    }
  }, [session]);

  return (
    <div className="app-shell">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar
        userEmail={session?.user?.email || undefined}
        userName={session?.user?.name || undefined}
      />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 100,
            display: 'flex',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: 280,
              height: '100%',
              backgroundColor: 'var(--color-surface)',
              borderRight: '1px solid var(--color-border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              userEmail={session?.user?.email || undefined}
              userName={session?.user?.name || undefined}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="main-content">
        <Header
          onMenuClick={() => setMobileMenuOpen(true)}
          isLinkedInConnected={isLinkedInConnected}
        />
        <main className="page-content">{children}</main>
        <MobileNav onMenuClick={() => setMobileMenuOpen(true)} />
      </div>
    </div>
  );
}
