'use client';

// src/app/auth/signup/page.tsx
// LINKER — Sign Up Page

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { LogoWordmark } from '@/components/Logo';

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Auto sign-in after registration
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        router.push('/auth/signin?registered=true');
      } else {
        router.push('/app');
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-bg)',
      padding: 'var(--space-6)',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <Link href="/" style={{ display: 'inline-flex', marginBottom: 'var(--space-4)' }}>
            <LogoWordmark size={36} />
          </Link>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            Start building your presence
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Turn real knowledge and projects into serious thought leadership
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-8)' }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
              <div className="alert-content">
                <div className="alert-description">{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="field">
              <label className="label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                required
                className="input"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="email">Work Email</label>
              <input
                id="email"
                type="email"
                required
                className="input"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                className="input"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <span className="field-hint">Must contain at least 8 characters</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 'var(--space-2)' }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div style={{
            marginTop: 'var(--space-6)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
          }}>
            Already have an account?{' '}
            <Link href="/auth/signin" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>
              Sign in
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
          <Link href="/" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            &larr; Back to Linker home
          </Link>
        </div>
      </div>
    </div>
  );
}
