import React from 'react';
import { Skeleton } from '../ui/skeleton';

interface CreditCardPreviewListSkeletonProps {
    count?: number;
    variant?: 'sidebar' | 'my-cards' | 'mobile-sidebar';
}

const CARD_NAME_WIDTHS = [140, 120, 100];
const NETWORK_WIDTHS = [80, 60, 70];

const VARIANT_CLASS_MAP: Record<string, string> = {
    'sidebar': 'sidebar-variant',
    'my-cards': 'my-cards-variant',
    'mobile-sidebar': 'mobile-sidebar-variant',
};

const CreditCardPreviewListSkeleton: React.FC<CreditCardPreviewListSkeletonProps> = ({
    count = 3,
    variant = 'sidebar',
}) => {
    const isMobile = variant === 'mobile-sidebar';

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`credit-card-preview ${VARIANT_CLASS_MAP[variant]}`}
                    style={{ pointerEvents: 'none' }}
                >
                    <div className="card-content" style={{ alignItems: 'center' }}>
                        {/* Card icon - rounded rectangle */}
                        <Skeleton className="rounded-lg" style={{ width: 36, height: 24, flexShrink: 0 }} />
                        <div className="card-info" style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                            {/* Card name */}
                            <Skeleton className="h-[14px] rounded" style={{ width: CARD_NAME_WIDTHS[i % CARD_NAME_WIDTHS.length] }} />
                            {/* Card issuer/network - hidden on mobile */}
                            {!isMobile && (
                                <Skeleton className="h-3 rounded" style={{ width: NETWORK_WIDTHS[i % NETWORK_WIDTHS.length] }} />
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default CreditCardPreviewListSkeleton;
