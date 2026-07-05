import React from 'react';

/** VideoPlayerSkeleton — mimics full VideoPlayer layout */
export default function VideoPlayerSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 24, padding: 24, maxWidth: 1800, margin: '0 auto' }} aria-busy="true" aria-label="Loading video player">
      {/* Primary column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Video area */}
        <div className="skeleton-base" style={{ width: '100%', aspectRatio: '16/9', borderRadius: 'var(--radius-lg)', marginBottom: 20 }} />
        {/* Title */}
        <div className="skeleton-base" style={{ height: 28, borderRadius: 6, width: '80%', marginBottom: 8 }} />
        <div className="skeleton-base" style={{ height: 20, borderRadius: 6, width: '55%', marginBottom: 20 }} />
        {/* Channel info row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="skeleton-base" style={{ width: 48, height: 48, borderRadius: '50%' }} />
            <div>
              <div className="skeleton-base" style={{ height: 16, width: 160, borderRadius: 4, marginBottom: 6 }} />
              <div className="skeleton-base" style={{ height: 12, width: 100, borderRadius: 4 }} />
            </div>
            <div className="skeleton-base" style={{ height: 38, width: 110, borderRadius: 'var(--radius-full)', marginLeft: 12 }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="skeleton-base" style={{ height: 38, width: 100, borderRadius: 'var(--radius-full)' }} />
            <div className="skeleton-base" style={{ height: 38, width: 80,  borderRadius: 'var(--radius-full)' }} />
          </div>
        </div>
        {/* Description box */}
        <div className="skeleton-base" style={{ height: 100, borderRadius: 'var(--radius-md)', marginBottom: 24 }} />
        {/* Comments */}
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div className="skeleton-base" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-base" style={{ height: 13, width: '40%', borderRadius: 4, marginBottom: 8 }} />
              <div className="skeleton-base" style={{ height: 12, width: '90%', borderRadius: 4, marginBottom: 6 }} />
              <div className="skeleton-base" style={{ height: 12, width: '70%', borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
      {/* Suggested column */}
      <div style={{ width: 380, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 10 }}>
            <div className="skeleton-base" style={{ width: 168, height: 94, borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-base" style={{ height: 13, borderRadius: 4, marginBottom: 6 }} />
              <div className="skeleton-base" style={{ height: 12, width: '80%', borderRadius: 4, marginBottom: 6 }} />
              <div className="skeleton-base" style={{ height: 11, width: '55%', borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
