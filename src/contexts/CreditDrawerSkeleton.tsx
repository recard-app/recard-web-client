import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CardIcon } from '@/icons';
import { PLACEHOLDER_CARD_PRIMARY_COLOR, PLACEHOLDER_CARD_SECONDARY_COLOR } from '@/types';
import { CREDIT_USAGE_DISPLAY_COLORS } from '@/types/CardCreditsTypes';
import { SHOW_PERIOD_NAME_IN_CREDIT_MODAL } from '@/types/FeatureFlags';

const PLACEHOLDER_SHOWCASE_GRADIENT = `linear-gradient(to bottom, color-mix(in srgb, ${PLACEHOLDER_CARD_PRIMARY_COLOR} 12%, white), white)`;

// Inactive button colors (matches CreditModalControls inactive state)
const INACTIVE_COLOR = CREDIT_USAGE_DISPLAY_COLORS.INACTIVE;
const INACTIVE_BG = `color-mix(in srgb, ${INACTIVE_COLOR} 10%, white)`;

/** CreditShowcase + CreditEntryDetails skeleton */
export const CreditDrawerShowcaseSkeleton: React.FC = () => (
    <>
        {/* CreditShowcase */}
        <div className="credit-showcase-wrapper">
            <div
                className="credit-showcase"
                style={{
                    '--showcase-gradient': PLACEHOLDER_SHOWCASE_GRADIENT,
                } as React.CSSProperties}
            >
                <div className="showcase-identity">
                    <CardIcon
                        title="Loading credit"
                        size={36}
                        primary={PLACEHOLDER_CARD_PRIMARY_COLOR}
                        secondary={PLACEHOLDER_CARD_SECONDARY_COLOR}
                        style={{ opacity: 0.6 }}
                    />
                    <div className="showcase-info">
                        {/* Credit title */}
                        <Skeleton className="h-4 w-[140px] rounded" style={{ marginBottom: 4 }} />
                        {/* Card name */}
                        <Skeleton className="h-[14px] w-[100px] rounded" style={{ marginBottom: 6 }} />
                        {/* Category badge */}
                        <div className="showcase-badges">
                            <Skeleton className="h-[20px] w-[80px] rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="credit-showcase-footer">
                <div className="meta-item">
                    <span className="meta-label">Value</span>
                    <Skeleton className="h-[14px] w-[90px] rounded" style={{ marginTop: 2 }} />
                </div>
                <div className="meta-item">
                    <span className="meta-label">Usage</span>
                    <Skeleton className="h-[14px] w-[70px] rounded" style={{ marginTop: 2 }} />
                </div>
            </div>
        </div>

        {/* CreditEntryDetails - 2 items: label + content each */}
        <div className="credit-detail-content">
            <div className="credit-detail-item">
                <Skeleton className="h-3 w-[80px] rounded" style={{ marginBottom: 6 }} />
                <Skeleton className="w-full rounded" style={{ height: 48 }} />
            </div>
            <div className="credit-detail-item">
                <Skeleton className="h-3 w-[60px] rounded" style={{ marginBottom: 6 }} />
                <Skeleton className="w-full rounded" style={{ height: 48 }} />
            </div>
        </div>
    </>
);

/** CreditUsageTracker skeleton */
export const CreditDrawerTrackerSkeleton: React.FC = () => (
    <div className="credit-usage-tracker">
        <div className="tracker-periods">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="tracker-period">
                    <Skeleton className="rounded-lg" style={{ width: '100%', height: 48 }} />
                    <Skeleton className="h-[10px] w-[30px] rounded" />
                </div>
            ))}
        </div>
    </div>
);

/** CreditModalControls skeleton */
export const CreditDrawerControlsSkeleton: React.FC = () => (
    <div className="credit-modal-controls">
        <div className="credit-period-row">
            {SHOW_PERIOD_NAME_IN_CREDIT_MODAL && <Skeleton className="h-[14px] w-[100px] rounded" />}
            <div className="amount-display">
                <Skeleton className="h-[14px] w-[80px] rounded" />
            </div>
        </div>
        <div className="credit-modal-slider">
            <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="credit-modal-bottom-row">
            <button
                className="button outline small loading"
                disabled
                style={{
                    color: INACTIVE_COLOR,
                    borderColor: INACTIVE_COLOR,
                    backgroundColor: INACTIVE_BG,
                    opacity: 0.7,
                }}
            />
        </div>
    </div>
);
