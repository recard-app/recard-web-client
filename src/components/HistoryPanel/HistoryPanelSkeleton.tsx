import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Icon } from '../../icons';
import { ICON_GRAY } from '../../types';

interface HistoryPanelSkeletonProps {
    variant?: 'full-page' | 'sidebar';
    count?: number;
}

const TITLE_WIDTHS_FULL = [240, 200, 180, 220, 190, 210, 230, 170];
const TITLE_WIDTHS_SIDEBAR = [180, 150, 200];

const HistoryPanelSkeleton: React.FC<HistoryPanelSkeletonProps> = ({
    variant = 'full-page',
    count,
}) => {
    if (variant === 'sidebar') {
        const itemCount = count ?? 3;
        return (
            <>
                {Array.from({ length: itemCount }).map((_, i) => (
                    <div
                        key={i}
                        className="history-entry sidebar-variant hide-timestamp-on-mobile"
                        style={{ pointerEvents: 'none' }}
                    >
                        <div className="entry-content">
                            <div className="entry-info" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <Skeleton className="h-[14px] rounded" style={{ width: TITLE_WIDTHS_SIDEBAR[i % TITLE_WIDTHS_SIDEBAR.length] }} />
                                <Skeleton className="h-3 w-[50px] rounded timestamp" />
                            </div>
                        </div>
                    </div>
                ))}
            </>
        );
    }

    const itemCount = count ?? 10;
    return (
        <>
            {Array.from({ length: itemCount }).map((_, i) => (
                <div
                    key={i}
                    className="history-entry full-page-variant"
                    style={{ pointerEvents: 'none' }}
                >
                    <div className="entry-content">
                        <div className="entry-info" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <Skeleton className="h-[14px] rounded" style={{ width: TITLE_WIDTHS_FULL[i % TITLE_WIDTHS_FULL.length] }} />
                            <Skeleton className="h-3 w-[60px] rounded" style={{ flexShrink: 0 }} />
                        </div>
                    </div>
                    <div className="actions-dropdown">
                        <button className="action-icon-button" disabled style={{ cursor: 'default', opacity: 0.3 }}>
                            <Icon
                                name="ellipsis-horizontal"
                                variant="mini"
                                size={20}
                                color={ICON_GRAY}
                                className="action-icon"
                            />
                        </button>
                    </div>
                </div>
            ))}
        </>
    );
};

export default HistoryPanelSkeleton;
