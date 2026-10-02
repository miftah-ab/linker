'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function StudioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[StudioError]', error);
  }, [error]);

  return (
    <div style={{
      padding: '4rem 2rem', textAlign: 'center',
      background: 'var(--bg-primary, #0f0f13)', minHeight: '60vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <AlertTriangle size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
      <h2 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Studio error
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        {error.message || 'Failed to load Studio. Check your connection and try again.'}
      </p>
      <button
        onClick={reset}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.6rem 1.25rem',
          background: 'var(--accent, #6366f1)', color: '#fff',
          border: 'none', borderRadius: '0.5rem',
          cursor: 'pointer', fontSize: '0.875rem',
        }}
      >
        <RefreshCw size={15} /> Retry
      </button>
    </div>
  );
}
