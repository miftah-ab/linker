'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AppError]', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary, #0f0f13)',
      padding: '2rem',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '480px',
        background: 'var(--bg-card, #1a1a24)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '1rem',
        padding: '3rem 2rem',
        boxShadow: '0 0 40px rgba(239,68,68,0.08)',
      }}>
        <div style={{
          width: '64px', height: '64px',
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <AlertTriangle size={28} color="#ef4444" />
        </div>

        <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Something went wrong
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              background: 'var(--accent, #6366f1)',
              color: '#fff', border: 'none', borderRadius: '0.5rem',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
            }}
          >
            <RefreshCw size={15} /> Try Again
          </button>
          <a
            href="/app"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              background: 'rgba(255,255,255,0.06)',
              color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <Home size={15} /> Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
