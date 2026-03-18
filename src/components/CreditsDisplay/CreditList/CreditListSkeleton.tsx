import React from 'react';
import { Skeleton } from '../../ui/skeleton';

interface CreditListSkeletonProps {
    count?: number;
    variant?: 'sidebar' | 'default';
}

const SIDEBAR_NAME_WIDTHS = [120, 140, 100];
const DEFAULT_NAME_WIDTHS = [140, 120, 160, 130, 110];
const DEFAULT_PERIOD_WIDTHS = [90, 80, 100, 85, 95];

const CreditListSkeleton: React.FC<CreditListSkeletonProps> = ({
    count = 3,
    variant = 'default',
}) => {
    if (variant === 'sidebar') {
        return (
            <div className="credit-list credit-list--sidebar">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className="credit-entry-sidebar"
                        style={{ pointerEvents: 'none' }}
                    >
                        <div className="credit-title-row">
                            <Skeleton className="h-[18px] w-[18px] rounded-full" style={{ flexShrink: 0 }} />
                            <div className="credit-name-group">
                                <Skeleton className="h-[14px] rounded" style={{ width: SIDEBAR_NAME_WIDTHS[i % SIDEBAR_NAME_WIDTHS.length] }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="credit-list">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="credit-entry-row"
                    style={{ pointerEvents: 'none' }}
                >
                    <div className="credit-donut">
                        <Skeleton className="rounded-full" style={{ width: 56, height: 56 }} />
                    </div>
                    <div className="credit-info" style={{ gap: 8 }}>
                        <div className="credit-name">
                            <Skeleton className="rounded" style={{ width: 16, height: 12, flexShrink: 0 }} />
                            <Skeleton className="h-4 rounded" style={{ width: DEFAULT_NAME_WIDTHS[i % DEFAULT_NAME_WIDTHS.length] }} />
                        </div>
                        <Skeleton className="h-3 rounded" style={{ width: DEFAULT_PERIOD_WIDTHS[i % DEFAULT_PERIOD_WIDTHS.length] }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CreditListSkeleton;
