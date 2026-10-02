export default function AppLoading() {
  return (
    <div style={{
      padding: '2rem',
      minHeight: '100vh',
      background: 'var(--bg-primary, #0f0f13)',
    }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="skeleton" style={{ width: '200px', height: '28px', borderRadius: '6px', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ width: '320px', height: '16px', borderRadius: '4px' }} />
      </div>

      {/* Stats row skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
        ))}
      </div>

      {/* Content skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '12px' }} />
        ))}
      </div>

      <style>{`
        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
