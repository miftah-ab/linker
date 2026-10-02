export default function CalendarLoading() {
  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg-primary, #0f0f13)' }}>
      <div className="skeleton" style={{ width: '180px', height: '28px', borderRadius: '6px', marginBottom: '1.5rem' }} />

      {/* Calendar grid skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '24px', borderRadius: '4px' }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
        {[...Array(35)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '8px' }} />
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
