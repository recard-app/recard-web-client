import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AnnualCreditReportSkeleton: React.FC = () => (
  <div className="annual-credit-report">
    {/* Hero Card */}
    <div className="report-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Skeleton className="rounded-full" style={{ width: 108, height: 108, flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <Skeleton className="h-3 rounded" style={{ width: 80 }} />
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
      {[1, 2].map((i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <Skeleton className="h-3 rounded" style={{ width: 70 }} />
            <Skeleton className="h-3 rounded" style={{ width: 100 }} />
          </div>
          <Skeleton className="rounded-full" style={{ width: '100%', height: 6 }} />
        </div>
      ))}
    </div>

    {/* Period Detail Section */}
    <div className="report-card">
      <Skeleton className="h-4 rounded" style={{ width: 120, marginBottom: 16 }} />
      <Skeleton className="rounded-xl" style={{ width: '100%', height: 28, marginBottom: 12 }} />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: i > 1 ? '1px solid var(--color-neutral-light-gray)' : undefined }}>
          <Skeleton className="h-3 rounded" style={{ width: 56 }} />
          <Skeleton className="rounded-full" style={{ flex: 1, height: 4 }} />
          <Skeleton className="h-3 rounded" style={{ width: 90 }} />
        </div>
      ))}
    </div>
  </div>
);

export default AnnualCreditReportSkeleton;
