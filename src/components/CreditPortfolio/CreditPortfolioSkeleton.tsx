import React from 'react';
import { Skeleton } from '../ui/skeleton';
import UsageBar from '../UsageBar';

interface CreditPortfolioSkeletonProps {
    count?: number;
}

const CARD_NAME_WIDTHS = [130, 150, 120, 140];
const META_WIDTHS = [90, 80, 100, 85];

const CreditPortfolioSkeleton: React.FC<CreditPortfolioSkeletonProps> = ({
    count = 4,
}) => {
    return (
        <div className="card-accordions">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="credit-card-accordion" style={{ pointerEvents: 'none' }}>
                    <div className="accordion-header" style={{ gap: 10 }}>
                        <div className="header-top">
                            <div className="card-identity">
                                {/* Card icon - rounded rectangle */}
                                <Skeleton className="rounded-lg" style={{ width: 32, height: 22, flexShrink: 0 }} />
                                <div className="card-info">
                                    {/* Card name */}
                                    <Skeleton className="h-[14px] rounded" style={{ width: CARD_NAME_WIDTHS[i % CARD_NAME_WIDTHS.length] }} />
                                    {/* # of credits */}
                                    <Skeleton className="h-3 rounded" style={{ width: META_WIDTHS[i % META_WIDTHS.length] }} />
                                </div>
                            </div>
                        </div>
                        <div className="usage-stat">
                            <div className="usage-stat-bar">
                                {/* Empty usage bar - no shimmer */}
                                <UsageBar
                                    segments={[]}
                                    maxValue={100}
                                    showLabels={false}
                                    animate={false}
                                />
                            </div>
                            <div className="usage-stat-values">
                                {/* Left stat value */}
                                <Skeleton className="h-3 rounded" style={{ width: 80 }} />
                                {/* Right stat value (percentage) */}
                                <Skeleton className="h-3 rounded" style={{ width: 30 }} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CreditPortfolioSkeleton;
