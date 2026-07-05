import React from 'react';

/**
 * VideoCardSkeleton — Matches VideoCard layout exactly.
 * Usage: <VideoCardSkeleton /> in grids while videos load.
 */
export default function VideoCardSkeleton() {
  return (
    <div
      className="video-card"
      aria-busy="true"
      aria-label="Loading video"
      style={{ pointerEvents: 'none' }}
    >
      {/* Thumbnail */}
      <div className="thumbnail-container skeleton-base" style={{ borderRadius: 0 }} />

      {/* Info row */}
      <div className="video-info">
        {/* Avatar */}
        <div
          className="skeleton-base"
          style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0 }}
        />
        {/* Text lines */}
        <div className="video-details" style={{ flex: 1 }}>
          <div className="skeleton-base" style={{ height: 14, borderRadius: 4, width: '90%' }} />
          <div className="skeleton-base" style={{ height: 12, borderRadius: 4, width: '65%', marginTop: 6 }} />
          <div className="skeleton-base" style={{ height: 11, borderRadius: 4, width: '45%', marginTop: 6 }} />
        </div>
      </div>
    </div>
  );
}
