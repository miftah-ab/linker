'use client';

// src/lib/supabase/auth-client.ts
// Supabase Client Authentication Hook & Helpers

import { useEffect, useState } from 'react';
import { createClient } from './client';
import type { User } from '@supabase/supabase-js';

export interface UserSession {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    const supabase = createClient();

    // Check if dev session cookie exists (localhost dev bypass)
    const isDevSession =
      typeof document !== 'undefined' &&
      document.cookie.includes('dev_session=true');

    if (isDevSession) {
      setUser({
        id: 'dev-user-local',
        email: 'dev@linker.local',
        user_metadata: { name: 'Local Developer', full_name: 'Local Developer' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User);
      setStatus('authenticated');
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setStatus(user ? 'authenticated' : 'unauthenticated');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setStatus(session?.user ? 'authenticated' : 'unauthenticated');
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    data: user
      ? ({
          user: {
            id: user.id,
            email: user.email,
            name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] ||
              'User',
            image: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          },
        } as UserSession)
      : null,
    status,
  };
}

export async function signOut({ callbackUrl = '/auth/signin' } = {}) {
  // Clear dev session cookie if present
  if (typeof document !== 'undefined') {
    document.cookie = 'dev_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = callbackUrl;
}
