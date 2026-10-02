export default function StudioLoading() {
  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg-primary, #0f0f13)' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="skeleton" style={{ width: '160px', height: '28px', borderRadius: '6px', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ width: '280px', height: '16px', borderRadius: '4px' }} />
      </div>

      {/* Generate button skeleton */}
      <div className="skeleton" style={{ width: '160px', height: '44px', borderRadius: '8px', marginBottom: '2rem' }} />

      {/* Cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '220px', borderRadius: '12px' }} />
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
