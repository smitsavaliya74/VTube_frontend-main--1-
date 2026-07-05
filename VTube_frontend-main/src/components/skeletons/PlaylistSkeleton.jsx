import React from 'react';

export default function PlaylistSkeleton() {
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }} aria-busy="true" aria-label="Loading playlist">
      {/* Playlist header */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 40 }}>
        <div className="skeleton-base" style={{ width: 300, height: 180, borderRadius: 'var(--radius-lg)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton-base" style={{ height: 32, width: '70%', borderRadius: 8, marginBottom: 14 }} />
          <div className="skeleton-base" style={{ height: 16, width: '50%', borderRadius: 4, marginBottom: 10 }} />
          <div className="skeleton-base" style={{ height: 14, width: '35%', borderRadius: 4, marginBottom: 24 }} />
          <div className="skeleton-base" style={{ height: 40, width: 130, borderRadius: 'var(--radius-full)' }} />
        </div>
      </div>
      {/* Video list rows */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
          <div className="skeleton-base" style={{ width: 24, height: 16, borderRadius: 4, flexShrink: 0 }} />
          <div className="skeleton-base" style={{ width: 160, height: 90, borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-base" style={{ height: 15, width: '80%', borderRadius: 4, marginBottom: 8 }} />
            <div className="skeleton-base" style={{ height: 12, width: '50%', borderRadius: 4 }} />
          </div>
          <div className="skeleton-base" style={{ width: 50, height: 14, borderRadius: 4, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}
