import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { CardIcon } from '../../icons';
import Icon from '../../icons';
import { ICON_GRAY, PLACEHOLDER_CARD_PRIMARY_COLOR, PLACEHOLDER_CARD_SECONDARY_COLOR } from '../../types';

const PLACEHOLDER_SHOWCASE_SOLID = `color-mix(in srgb, ${PLACEHOLDER_CARD_PRIMARY_COLOR} 8%, white)`;

const STAT_ITEMS = [
    { icon: 'banknotes', label: 'Annual Fee' },
    { icon: 'globe-alt', label: 'FX Fee' },
    { icon: 'arrow-trending-up', label: 'Rewards' },
    { icon: 'calendar', label: 'Start Date' },
];

const CardDetailSkeleton: React.FC = () => {
    return (
        <div className="card-details">
            {/* Card Showcase */}
            <div className="card-showcase-wrapper">
                <div className="card-showcase-motion-layer">
                <div
                    className="card-showcase"
                    style={{
                        '--showcase-solid': PLACEHOLDER_SHOWCASE_SOLID,
                    } as React.CSSProperties}
                >
                    <div className="showcase-identity">
                        <CardIcon
                            title="Loading card"
                            size={64}
                            primary={PLACEHOLDER_CARD_PRIMARY_COLOR}
                            secondary={PLACEHOLDER_CARD_SECONDARY_COLOR}
                            className="card-image"
                            style={{ opacity: 0.6 }}
                        />
                        <div className="showcase-info">
                            {/* Card title */}
                            <Skeleton className="h-5 w-[160px] rounded" style={{ marginBottom: 8 }} />
                            {/* Single badge */}
                            <div className="showcase-badges">
                                <Skeleton className="h-[22px] w-[70px] rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-footer">
                    <div className="meta-item">
                        <span className="meta-label">Issuer</span>
                        <Skeleton className="h-[14px] w-[70px] rounded" style={{ marginTop: 2 }} />
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Network</span>
                        <Skeleton className="h-[14px] w-[70px] rounded" style={{ marginTop: 2 }} />
                    </div>
                </div>
                </div>
            </div>

            {/* Card Description */}
            <div className="rounded" style={{ width: '100%', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-[92%] rounded" />
                <Skeleton className="h-4 w-[75%] rounded" />
            </div>

            {/* Stats Grid */}
            <div className="card-stats-grid">
                {STAT_ITEMS.map((stat, i) => (
                    <div key={i} className="stat-tile">
                        <div className="stat-icon-wrap">
                            <Icon name={stat.icon} variant="mini" size={16} color={ICON_GRAY} aria-hidden="true" />
                        </div>
                        <Skeleton className="h-4 w-[60px] rounded" />
                        <span className="stat-label">{stat.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CardDetailSkeleton;
