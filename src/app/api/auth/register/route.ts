// src/app/api/auth/register/route.ts
// LINKER — User registration endpoint

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existing = await prisma.linkerUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.linkerUser.create({
      data: { name, email, passwordHash },
      select: { id: true, email: true, name: true },
    });

    // Create empty profile for new user
    await prisma.linkerProfile.create({
      data: { userId: user.id },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 },
    );
  }
}
