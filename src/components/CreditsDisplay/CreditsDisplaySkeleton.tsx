import React from 'react';
import CreditListSkeleton from './CreditList/CreditListSkeleton';

const CreditsDisplaySkeleton: React.FC = () => {
    return (
        <CreditListSkeleton count={6} variant="default" />
    );
};

export default CreditsDisplaySkeleton;
