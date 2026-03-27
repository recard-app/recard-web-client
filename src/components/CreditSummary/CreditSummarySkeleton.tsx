import React from 'react';
import { Skeleton } from '../ui/skeleton';
import UsageBar from '../UsageBar';

const CreditSummarySkeleton: React.FC = () => {
    return (
        <div className="credit-summary-hero credit-summary-header">
            {/* Section header row */}
            <div className="section-header-row" style={{ marginBottom: 4 }}>
                <Skeleton className="h-3 rounded" style={{ width: 120 }} />
                <Skeleton className="h-3 rounded" style={{ width: 80 }} />
            </div>

            {/* Hero value row */}
            <div className="hero-value-row">
                <Skeleton className="h-5 rounded" style={{ width: 200 }} />
            </div>

            {/* Usage bar - empty, no shimmer */}
            <UsageBar
                segments={[]}
                maxValue={100}
                height={8}
                borderRadius={4}
                showLabels={false}
                animate={false}
                className="credit-summary-usage-bar"
            />

            {/* Bar legend */}
            <div className="bar-legend">
                <div className="bar-legend-item">
                    <Skeleton className="rounded-full" style={{ width: 8, height: 8 }} />
                    <Skeleton className="h-2.5 rounded" style={{ width: 50 }} />
                </div>
                <div className="bar-legend-item">
                    <Skeleton className="rounded-full" style={{ width: 8, height: 8 }} />
                    <Skeleton className="h-2.5 rounded" style={{ width: 65 }} />
                </div>
                <div className="bar-legend-item">
                    <Skeleton className="rounded-full" style={{ width: 8, height: 8 }} />
                    <Skeleton className="h-2.5 rounded" style={{ width: 55 }} />
                </div>
            </div>
        </div>
    );
};

export default CreditSummarySkeleton;
