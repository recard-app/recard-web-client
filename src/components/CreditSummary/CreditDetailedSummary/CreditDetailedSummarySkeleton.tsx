import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const CreditDetailedSummarySkeleton: React.FC = () => (
  <div className="credit-detailed-summary">
    {/* Hero Card */}
    <div className="report-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Skeleton className="rounded-full" style={{ width: 108, height: 108, flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <Skeleton className="h-3 rounded" style={{ width: 90 }} />
          <Skeleton className="h-6 rounded" style={{ width: 110 }} />
          <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Skeleton className="h-2 rounded" style={{ width: 30 }} />
              <Skeleton className="h-4 rounded" style={{ width: 70 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Skeleton className="h-2 rounded" style={{ width: 55 }} />
              <Skeleton className="h-4 rounded" style={{ width: 70 }} />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* By Cadence */}
    <div className="report-card">
      <Skeleton className="h-4 rounded" style={{ width: 90, marginBottom: 16 }} />
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <Skeleton className="h-3 rounded" style={{ width: 70 }} />
            <Skeleton className="h-3 rounded" style={{ width: 100 }} />
          </div>
          <Skeleton className="rounded-full" style={{ width: '100%', height: 6 }} />
        </div>
      ))}
    </div>

    {/* Credit Count */}
    <div className="report-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Skeleton className="h-4 rounded" style={{ width: 100 }} />
        <Skeleton className="h-4 rounded" style={{ width: 40 }} />
      </div>
      <Skeleton className="rounded-full" style={{ width: '100%', height: 8, marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 12 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Skeleton className="rounded-full" style={{ width: 7, height: 7 }} />
            <Skeleton className="h-3 rounded" style={{ width: 60 }} />
          </div>
        ))}
      </div>
    </div>

    {/* Expiring Credits */}
    <div className="report-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Skeleton className="h-4 rounded" style={{ width: 120 }} />
        <Skeleton className="h-4 rounded" style={{ width: 80 }} />
      </div>
      {[1, 2].map((i) => (
        <div key={i} style={{ marginBottom: i === 1 ? 20 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <Skeleton className="h-3 rounded" style={{ width: 50 }} />
            <Skeleton className="h-3 rounded" style={{ width: 60 }} />
          </div>
          <Skeleton className="rounded-full" style={{ width: '100%', height: 8, marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <Skeleton className="h-3 rounded" style={{ width: 80 }} />
            <Skeleton className="h-3 rounded" style={{ width: 80 }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CreditDetailedSummarySkeleton;
