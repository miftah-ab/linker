'use client';

// src/app/app/layout.tsx
// LINKER - Authenticated Application Shell

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/supabase/auth-client';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
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
      {/* Sidebar — hidden on mobile by default, opens via sidebar-open class */}
      <div className={mobileMenuOpen ? 'sidebar-open' : ''}>
        <Sidebar
          userEmail={session?.user?.email || undefined}
          userName={session?.user?.name || undefined}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
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

