import React from 'react';
import { Skeleton } from '../ui/skeleton';
import Icon from '@/icons';
import UsageBar from '../UsageBar';

const CreditSummarySkeleton: React.FC = () => {
    return (
        <div className="credit-summary-hero credit-summary-header">
            <div className="header-content">
                <div className="header-stats">
                    {/* Hero value row - single shimmer for the whole row */}
                    <div className="hero-value-row">
                        <Skeleton className="h-5 rounded" style={{ width: 220 }} />
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

                    {/* Supporting row shimmer */}
                    <div className="supporting-row">
                        <Skeleton className="h-3 rounded" style={{ width: 260 }} />
                    </div>
                </div>
                <div className="credit-summary-buttons">
                    <button className="button ghost icon no-padding" disabled style={{ cursor: 'default', opacity: 0.3 }} aria-label="Expand to view full report">
                        <Icon name="arrow-trending-up" variant="mini" size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreditSummarySkeleton;
