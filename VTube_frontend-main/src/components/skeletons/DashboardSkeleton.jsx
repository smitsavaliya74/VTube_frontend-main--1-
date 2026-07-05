import React from 'react';

function StatCardSkeleton() {
  return (
    <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
      <div className="skeleton-base" style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton-base" style={{ height: 13, width: '60%', borderRadius: 4, marginBottom: 10 }} />
        <div className="skeleton-base" style={{ height: 28, width: '40%', borderRadius: 6 }} />
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }} aria-busy="true" aria-label="Loading dashboard">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="skeleton-base" style={{ height: 36, width: 320, borderRadius: 8, marginBottom: 12 }} />
        <div className="skeleton-base" style={{ height: 18, width: 260, borderRadius: 4 }} />
      </div>
      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 24, marginBottom: 40 }}>
        {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      {/* Section title */}
      <div className="skeleton-base" style={{ height: 26, width: 180, borderRadius: 6, marginBottom: 24 }} />
      {/* Video grid */}
      <div className="video-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="video-card" style={{ pointerEvents: 'none' }}>
            <div className="thumbnail-container skeleton-base" style={{ borderRadius: 0 }} />
            <div className="video-info">
              <div className="skeleton-base" style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton-base" style={{ height: 14, borderRadius: 4, marginBottom: 6 }} />
                <div className="skeleton-base" style={{ height: 12, width: '60%', borderRadius: 4 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
