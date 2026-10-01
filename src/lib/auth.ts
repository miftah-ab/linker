// src/lib/auth.ts
// LINKER - Supabase-backed Auth helper
// Replaces NextAuth with pure Supabase session checking

import { createClient } from './supabase/server';
import { prisma } from './prisma';

export interface AuthSession {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

export async function auth(): Promise<AuthSession | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Upsert user in our database to ensure foreign keys in Prisma work seamlessly
    let dbUser = await prisma.linkerUser.findUnique({
      where: { id: user.id },
    });

    if (!dbUser && user.email) {
      dbUser = await prisma.linkerUser.findUnique({
        where: { email: user.email },
      });
    }

    if (!dbUser && user.email) {
      try {
        dbUser = await prisma.linkerUser.create({
          data: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
            image: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          },
        });

        await prisma.linkerProfile.upsert({
          where: { userId: dbUser.id },
          create: { userId: dbUser.id },
          update: {},
        });
      } catch {
        // Fallback if user already existed under different condition
        dbUser = await prisma.linkerUser.findUnique({ where: { email: user.email } });
      }
    }

    return {
      user: {
        id: dbUser?.id || user.id,
        email: user.email,
        name: dbUser?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
        image: dbUser?.image || user.user_metadata?.avatar_url,
      },
    };
  } catch (err) {
    console.error('[auth] Error retrieving session:', err);
    return null;
  }
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user;
}
