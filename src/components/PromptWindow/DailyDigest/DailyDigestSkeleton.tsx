import React from 'react';
import Icon from '@/icons';
import { PRIMARY_MEDIUM, COLORS } from '../../../types/Colors';
import { MONTH_NAMES, DAILY_ZEN_FEATURE_NAME } from '../../../types';
import './DailyDigest.scss';

const SKELETON_WIDTHS = ['95%', '80%', '90%', '60%', '85%', '70%', '92%', '45%'];

export function DigestSkeletonBars(): React.ReactElement {
    const total = SKELETON_WIDTHS.length;
    return (
        <div className="daily-digest__skeleton-bars">
            {SKELETON_WIDTHS.map((w, i) => {
                const alpha = 1 - (i / (total - 1));
                return (
                    <div
                        key={`${i}-${w}`}
                        className="h-4 rounded-sm animate-pulse"
                        style={{
                            width: w,
                            backgroundColor: `color-mix(in srgb, ${COLORS.PRIMARY_COLOR} ${(18 * alpha).toFixed(1)}%, transparent)`,
                        }}
                    />
                );
            })}
        </div>
    );
}

function buildSkeletonTitle(): string {
    const now = new Date();
    return `${DAILY_ZEN_FEATURE_NAME} (${MONTH_NAMES[now.getMonth()]} ${now.getDate()})`;
}

const DailyDigestSkeleton: React.FC = () => {
    return (
        <div className="daily-digest daily-digest--loading">
            <div className="daily-digest__header">
                <Icon name="lotus" variant="solid" height={11} width={16} viewBox="0 80 512 345" color={PRIMARY_MEDIUM} />
                <h3 className="daily-digest__title">{buildSkeletonTitle()}</h3>
            </div>
            <DigestSkeletonBars />
            <div className="daily-digest__footer">
                <div
                    className="h-3 rounded-sm animate-pulse"
                    style={{
                        width: 100,
                        backgroundColor: `color-mix(in srgb, ${COLORS.PRIMARY_COLOR} 12%, transparent)`,
                    }}
                />
                <div
                    className="rounded-full animate-pulse"
                    style={{
                        width: 20,
                        height: 20,
                        marginLeft: 'auto',
                        backgroundColor: `color-mix(in srgb, ${COLORS.PRIMARY_COLOR} 10%, transparent)`,
                    }}
                />
            </div>
        </div>
    );
};

export default DailyDigestSkeleton;
