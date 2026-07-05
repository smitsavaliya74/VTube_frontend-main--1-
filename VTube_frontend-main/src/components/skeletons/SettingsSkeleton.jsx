import React from 'react';

function SettingsCardSkeleton({ rows = 3 }) {
  return (
    <div className="glass" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16, marginBottom: 24 }}>
        <div className="skeleton-base" style={{ width: 20, height: 20, borderRadius: 4 }} />
        <div className="skeleton-base" style={{ height: 18, width: 160, borderRadius: 4 }} />
      </div>
      {/* Form fields */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div className="skeleton-base" style={{ height: 12, width: 100, borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton-base" style={{ height: 42, borderRadius: 'var(--radius-md)' }} />
        </div>
      ))}
      <div className="skeleton-base" style={{ height: 42, borderRadius: 'var(--radius-md)', marginTop: 8 }} />
    </div>
  );
}

export default function SettingsSkeleton() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }} aria-busy="true" aria-label="Loading settings">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="skeleton-base" style={{ height: 32, width: 240, borderRadius: 8, marginBottom: 10 }} />
        <div className="skeleton-base" style={{ height: 16, width: 300, borderRadius: 4 }} />
      </div>
      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 24 }}>
        <SettingsCardSkeleton rows={2} />
        <SettingsCardSkeleton rows={3} />
        <SettingsCardSkeleton rows={2} />
      </div>
    </div>
  );
}
