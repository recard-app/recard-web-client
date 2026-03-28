import React from 'react';
import { Skeleton } from '../ui/skeleton';

const CreditSummarySkeleton: React.FC = () => {
    return (
        <div className="credit-summary-hero credit-summary-header">
            {/* Hero value row */}
            <div className="hero-value-row">
                <div className="hero-value-group">
                    <Skeleton className="rounded" style={{ width: 120, height: 32 }} />
                    <Skeleton className="rounded" style={{ width: 170, height: 21 }} />
                </div>
                <Skeleton className="rounded" style={{ width: 90, height: 24 }} />
            </div>

            {/* Usage bar */}
            <Skeleton className="rounded-full" style={{ width: '100%', height: 8 }} />

            {/* Count labels */}
            <div className="credit-summary-count-labels">
                <Skeleton className="rounded" style={{ width: 80, height: 14 }} />
                <Skeleton className="rounded" style={{ width: 60, height: 14 }} />
                <Skeleton className="rounded" style={{ width: 65, height: 14 }} />
            </div>
        </div>
    );
};

export default CreditSummarySkeleton;
