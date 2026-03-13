import React from 'react';
import { Skeleton } from '../../ui/skeleton';
import './DailyDigest.scss';

const DailyDigestSkeleton: React.FC = () => {
    return (
        <div className="daily-digest">
            <Skeleton className="rounded" style={{ width: '100%', height: 120 }} />
        </div>
    );
};

export default DailyDigestSkeleton;
