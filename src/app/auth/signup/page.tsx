'use client';

// src/app/auth/signup/page.tsx
// LINKER - Supabase OAuth Sign Up (LinkedIn & Google)

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LogoWordmark } from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';

function SignUpContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/app';
  const errorParam = searchParams.get('error');

  const [loadingProvider, setLoadingProvider] = useState<'linkedin_oidc' | 'google' | null>(null);
  const [authError, setAuthError] = useState<string | null>(errorParam);

  async function handleOAuthSignUp(provider: 'linkedin_oidc' | 'google') {
    setLoadingProvider(provider);
    setAuthError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl)}`,
        },
      });

      if (error) {
        setAuthError(error.message);
        setLoadingProvider(null);
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Sign up failed');
      setLoadingProvider(null);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
        padding: 'var(--space-6)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <Link href="/" style={{ display: 'inline-flex', marginBottom: 'var(--space-4)' }}>
            <LogoWordmark size={36} />
          </Link>
          <h1
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Start building your presence
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Turn real knowledge and projects into serious thought leadership
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          {authError && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="alert-content">
                <div className="alert-description">{authError}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3_5)' }}>
            {/* LinkedIn Sign Up */}
            <button
              type="button"
              disabled={loadingProvider !== null}
              onClick={() => handleOAuthSignUp('linkedin_oidc')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: '#0A66C2',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #0A66C2',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                cursor: loadingProvider !== null ? 'not-allowed' : 'pointer',
                opacity: loadingProvider !== null && loadingProvider !== 'linkedin_oidc' ? 0.6 : 1,
                transition: 'background-color var(--transition-fast), transform var(--transition-fast)',
              }}
            >
              {loadingProvider === 'linkedin_oidc' ? (
                <span className="spinner spinner-sm" style={{ borderColor: '#fff', borderRightColor: 'transparent' }} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
                </svg>
              )}
              {loadingProvider === 'linkedin_oidc' ? 'Connecting to LinkedIn...' : 'Sign up with LinkedIn'}
            </button>

            {/* Google Sign Up */}
            <button
              type="button"
              disabled={loadingProvider !== null}
              onClick={() => handleOAuthSignUp('google')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-strong)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: loadingProvider !== null ? 'not-allowed' : 'pointer',
                opacity: loadingProvider !== null && loadingProvider !== 'google' ? 0.6 : 1,
                transition: 'background-color var(--transition-fast), transform var(--transition-fast)',
              }}
            >
              {loadingProvider === 'google' ? (
                <span className="spinner spinner-sm" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              {loadingProvider === 'google' ? 'Connecting to Google...' : 'Sign up with Google'}
            </button>
          </div>

          <div
            style={{
              marginTop: 'var(--space-6)',
              paddingTop: 'var(--space-6)',
              borderTop: '1px solid var(--color-border)',
              textAlign: 'center',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--line-height-relaxed)',
            }}
          >
            No passwords. Grounded in your real work.
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
          <Link href="/auth/signin" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
            Already have an account? Sign in &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          <span className="spinner spinner-md" />
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
