import React from 'react';

export default function CommentSkeleton({ count = 5 }) {
  return (
    <div aria-busy="true" aria-label="Loading comments">
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div className="skeleton-base" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-base" style={{ height: 13, width: '30%', borderRadius: 4, marginBottom: 8 }} />
            <div className="skeleton-base" style={{ height: 12, width: '95%', borderRadius: 4, marginBottom: 6 }} />
            <div className="skeleton-base" style={{ height: 12, width: Math.random() > 0.5 ? '75%' : '60%', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
