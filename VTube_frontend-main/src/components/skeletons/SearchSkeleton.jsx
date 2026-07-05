import React from 'react';

export default function SearchSkeleton({ count = 8 }) {
  return (
    <div aria-busy="true" aria-label="Loading search results">
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div className="skeleton-base" style={{ width: 246, height: 138, borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-base" style={{ height: 18, width: '75%', borderRadius: 4, marginBottom: 10 }} />
            <div className="skeleton-base" style={{ height: 13, width: '35%', borderRadius: 4, marginBottom: 8 }} />
            <div className="skeleton-base" style={{ height: 13, width: '25%', borderRadius: 4, marginBottom: 12 }} />
            <div className="skeleton-base" style={{ height: 12, width: '60%', borderRadius: 4, marginBottom: 6 }} />
            <div className="skeleton-base" style={{ height: 12, width: '45%', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
