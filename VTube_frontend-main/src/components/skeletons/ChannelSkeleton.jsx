import React from 'react';

export default function ChannelSkeleton() {
  return (
    <div style={{ padding: 24, maxWidth: 1800, margin: '0 auto' }} aria-busy="true" aria-label="Loading channel">
      {/* Cover image */}
      <div className="skeleton-base" style={{ width: '100%', height: 220, borderRadius: 'var(--radius-lg)', marginBottom: 0 }} />
      {/* Channel header */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 32, marginTop: -48, position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div className="skeleton-base" style={{ width: 100, height: 100, borderRadius: '50%', flexShrink: 0 }} />
          <div>
            <div className="skeleton-base" style={{ height: 28, width: 200, borderRadius: 6, marginBottom: 10 }} />
            <div className="skeleton-base" style={{ height: 16, width: 140, borderRadius: 4, marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="skeleton-base" style={{ height: 28, width: 140, borderRadius: 'var(--radius-full)' }} />
              <div className="skeleton-base" style={{ height: 28, width: 100, borderRadius: 'var(--radius-full)' }} />
            </div>
          </div>
        </div>
        <div className="skeleton-base" style={{ height: 42, width: 120, borderRadius: 'var(--radius-full)' }} />
      </div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)' }}>
        {['VIDEOS','PLAYLISTS','COMMUNITY'].map(t => (
          <div key={t} className="skeleton-base" style={{ height: 44, width: 100, borderRadius: 0, marginRight: 4 }} />
        ))}
      </div>
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
